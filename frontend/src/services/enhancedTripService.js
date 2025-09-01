import { chatSession } from '../service/AIModal';
import { AI_PROMPT } from '../constants/options';
import { indianDestinations, searchIndianDestinations } from '../data/indianDestinations';
import comprehensivePlacesService from './comprehensivePlacesService';
import BackendApiService from '../service/BackendApi';

class EnhancedTripService {
  constructor() {
    this.placesService = comprehensivePlacesService;
  }

  // Main function to generate enhanced trip (WITH REAL AI)
  async generateEnhancedTrip(formData) {
    try {
      console.log('🚀 Generating enhanced trip with REAL AI:', formData);

      // Try backend AI first
      try {
        console.log('🎯 Trying backend AI service...');
        const backendResult = await BackendApiService.generateTrip({
          destination: formData.destination?.name || formData.destination,
          duration: formData.duration,
          travelers: formData.travelers,
          budget: formData.budget,
          interests: formData.interests || []
        });

        if (backendResult && backendResult.tripSummary) {
          console.log('✅ Backend AI generation successful');
          return backendResult;
        }
      } catch (backendError) {
        console.warn('⚠️ Backend AI failed, trying direct AI:', backendError.message);
      }

      // Try direct AI as backup
      try {
        console.log('🤖 Using direct Gemini AI...');
        const prompt = this.buildAIPrompt(formData);
        const result = await chatSession.sendMessage(prompt);
        const aiResponse = result?.response?.text();

        if (aiResponse) {
          console.log('✅ Direct AI response received');
          const parsedTrip = this.parseAIResponse(aiResponse, formData);
          if (parsedTrip && parsedTrip.tripSummary) {
            return parsedTrip;
          }
        }
      } catch (aiError) {
        console.warn('⚠️ Direct AI also failed, using enhanced fallback:', aiError.message);
      }

      // Enhanced local generation as final fallback
      console.log('🔄 Using enhanced local trip generation as fallback');

      // Generate comprehensive trip using local data and algorithms
      const tripPlan = await this.generateComprehensiveLocalTrip(formData);

      console.log('✅ Enhanced trip generated successfully without AI');
      return tripPlan;
    } catch (error) {
      console.error('❌ Enhanced trip generation failed:', error);

      // Fallback to basic generation
      return await this.generateBasicTrip(formData);
    }
  }

  // Generate comprehensive trip using local data and algorithms (NO AI)
  async generateComprehensiveLocalTrip(formData) {
    const { destination, duration = 3, travelers = 2, budget = 15000, interests = [] } = formData;

    // Get destination data from local database
    const destinationData = searchIndianDestinations(destination)[0] || {
      name: destination,
      state: 'India',
      category: 'destination',
      rating: 4.0,
      description: `Popular destination in India`,
      highlights: ['Local attractions', 'Cultural sites', 'Local cuisine'],
      bestTime: 'Year-round'
    };

    // Calculate budget breakdown
    const dailyBudget = Math.floor(budget / duration);
    const accommodationBudget = Math.floor(dailyBudget * 0.4);
    const foodBudget = Math.floor(dailyBudget * 0.3);
    const activityBudget = Math.floor(dailyBudget * 0.2);
    const transportBudget = Math.floor(dailyBudget * 0.1);

    // Generate comprehensive trip plan
    const tripPlan = {
      id: `enhanced_trip_${Date.now()}`,
      tripSummary: {
        destination: destinationData.name,
        duration: duration,
        travelers: `${travelers} ${travelers === 1 ? 'person' : 'people'}`,
        budget: `₹${budget.toLocaleString()}`,
        currency: 'INR',
        totalEstimatedCost: `₹${Math.floor(budget * 0.95).toLocaleString()}`,
        dailyBudget: `₹${dailyBudget.toLocaleString()}`,
        bestTime: destinationData.bestTime || 'Year-round',
        highlights: destinationData.highlights || ['Sightseeing', 'Local culture', 'Food']
      },

      hotels: this.generateHotelRecommendations(destinationData, accommodationBudget, duration),

      itinerary: this.generateDetailedItinerary(destinationData, duration, interests, activityBudget),

      budgetBreakdown: {
        accommodation: `₹${(accommodationBudget * duration).toLocaleString()}`,
        food: `₹${(foodBudget * duration).toLocaleString()}`,
        activities: `₹${(activityBudget * duration).toLocaleString()}`,
        transport: `₹${(transportBudget * duration).toLocaleString()}`,
        miscellaneous: `₹${Math.floor(budget * 0.05).toLocaleString()}`
      },

      recommendations: {
        packing: this.getPackingRecommendations(destinationData, duration),
        tips: this.getTravelTips(destinationData),
        localInfo: this.getLocalInformation(destinationData)
      },

      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'enhanced-local-generation',
        version: '2.0.0',
        generationType: 'comprehensive-local'
      }
    };

    return tripPlan;
  }

  // Build enhanced prompt with real places data
  buildEnhancedPrompt(formData, placesData) {
    const { destination, duration, budget, travelers, interests } = formData;
    
    // Format real places data for AI context
    const realAttractionsContext = placesData.attractions.slice(0, 5).map(place => 
      `- ${place.name}: ${place.description} (Rating: ${place.rating}, Cost: ${place.estimatedCost})`
    ).join('\n');

    const realRestaurantsContext = placesData.restaurants.slice(0, 3).map(place => 
      `- ${place.name}: ${place.description} (Rating: ${place.rating}, Cost: ${place.estimatedCost})`
    ).join('\n');

    const realHotelsContext = placesData.hotels.slice(0, 3).map(place => 
      `- ${place.name}: ${place.description} (Rating: ${place.rating}, Cost: ${place.estimatedCost})`
    ).join('\n');

    const budgetAmount = typeof budget === 'object' ? budget.max : budget;
    const travelerCount = typeof travelers === 'object' ? travelers.count : travelers;

    return `Generate a comprehensive travel plan for ${destination.name} for ${duration} days for ${travelerCount} people with a budget of ₹${budgetAmount?.toLocaleString()} (Indian Rupees).

REAL PLACES DATA FROM GOOGLE PLACES API:

TOP ATTRACTIONS IN ${destination.name}:
${realAttractionsContext || 'No specific attractions found - use local knowledge'}

TOP RESTAURANTS IN ${destination.name}:
${realRestaurantsContext || 'No specific restaurants found - use local knowledge'}

TOP HOTELS IN ${destination.name}:
${realHotelsContext || 'No specific hotels found - use local knowledge'}

USER PREFERENCES:
- Interests: ${interests?.join(', ') || 'General sightseeing'}
- Travel Style: ${formData.travelStyle?.join(', ') || 'Moderate pace'}

IMPORTANT REQUIREMENTS:
- Use INDIAN RUPEES (₹) for ALL prices and costs
- Create realistic Indian pricing based on the destination
- Plan for EXACTLY ${travelerCount} travelers
- Include the real places mentioned above where relevant
- Provide detailed day-wise itinerary
- Include travel time between places
- Add local tips and best visiting times

Generate a detailed JSON response with this exact structure:

{
  "tripSummary": {
    "destination": "${destination.name}",
    "duration": ${duration},
    "travelers": "${travelerCount} people",
    "budget": "₹${budgetAmount?.toLocaleString()}",
    "currency": "INR",
    "totalEstimatedCost": "₹XX,XXX",
    "costBreakdown": {
      "accommodation": "₹X,XXX",
      "food": "₹X,XXX", 
      "activities": "₹X,XXX",
      "transport": "₹X,XXX"
    }
  },
  "hotels": [
    {
      "hotelName": "Real Hotel Name from data above",
      "hotelAddress": "Complete Address",
      "price": "₹X,XXX per night",
      "hotelImageUrl": "https://example.com/image.jpg",
      "geoCoordinates": {"lat": 0.0, "lng": 0.0},
      "rating": 4.5,
      "description": "Detailed hotel description",
      "amenities": ["WiFi", "Restaurant", "Pool"],
      "bookingTips": "Best booking advice"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "theme": "Arrival and Local Exploration",
      "activities": [
        {
          "placeName": "Real Place Name from data above",
          "placeDetails": "Detailed description with local insights",
          "placeImageUrl": "https://example.com/image.jpg",
          "geoCoordinates": {"lat": 0.0, "lng": 0.0},
          "ticketPricing": "₹XXX per person",
          "rating": 4.5,
          "timeToTravel": "30 minutes from hotel",
          "bestTimeToVisit": "Morning (9:00 AM - 12:00 PM)",
          "duration": "2-3 hours",
          "localTips": "Specific local advice",
          "nearbyFood": "Recommended nearby restaurants"
        }
      ],
      "meals": [
        {
          "type": "lunch",
          "restaurant": "Real Restaurant Name from data above",
          "cuisine": "Local cuisine type",
          "cost": "₹XXX per person",
          "specialties": ["Local dish 1", "Local dish 2"]
        }
      ],
      "totalDayCost": "₹X,XXX for ${travelerCount} people"
    }
  ],
  "localInsights": {
    "bestLocalFood": ["Dish 1", "Dish 2", "Dish 3"],
    "culturalTips": ["Tip 1", "Tip 2"],
    "transportationTips": ["How to get around"],
    "budgetTips": ["Money-saving advice"],
    "safetyTips": ["Important safety information"]
  },
  "weatherInfo": {
    "bestMonths": ["Month 1", "Month 2"],
    "whatToPack": ["Item 1", "Item 2"]
  }
}

Make this plan authentic to ${destination.name} with realistic Indian pricing and local experiences.`;
  }

  // Fallback to basic trip generation
  async generateBasicTrip(formData) {
    console.log('🔄 Using basic trip generation as fallback');
    
    const { destination, duration, budget, travelers } = formData;
    const budgetAmount = typeof budget === 'object' ? budget.max : budget;
    const travelerCount = typeof travelers === 'object' ? travelers.count : travelers;

    const FINAL_PROMPT = AI_PROMPT
      .replace('{location}', destination.name || destination.label)
      .replace('{totalDays}', duration)
      .replace('{traveler}', `${travelerCount} people`)
      .replace('{budget}', `₹${budgetAmount?.toLocaleString()}`);

    const result = await chatSession.sendMessage(FINAL_PROMPT);
    const aiResponse = result?.response?.text();

    return this.parseBasicResponse(aiResponse, formData);
  }

  // Parse AI response and enhance with metadata
  parseAndEnhanceResponse(aiResponse, formData, placesData) {
    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const tripPlan = JSON.parse(jsonMatch[0]);

      // Enhance with real data and metadata
      tripPlan.metadata = {
        generatedAt: new Date().toISOString(),
        enhancedWithRealData: true,
        realPlacesUsed: {
          attractions: placesData.attractions.length,
          restaurants: placesData.restaurants.length,
          hotels: placesData.hotels.length
        },
        destination: formData.destination,
        userPreferences: {
          interests: formData.interests,
          travelStyle: formData.travelStyle
        }
      };

      // Add real place IDs for future reference
      if (tripPlan.hotels) {
        tripPlan.hotels = tripPlan.hotels.map((hotel, index) => ({
          ...hotel,
          realPlaceData: placesData.hotels[index] || null
        }));
      }

      return tripPlan;
    } catch (error) {
      console.error('Error parsing enhanced AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  // Parse basic response without real data enhancement
  parseBasicResponse(aiResponse, formData) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const tripPlan = JSON.parse(jsonMatch[0]);

      // Add basic metadata
      tripPlan.metadata = {
        generatedAt: new Date().toISOString(),
        enhancedWithRealData: false,
        destination: formData.destination,
        generationType: 'basic'
      };

      return tripPlan;
    } catch (error) {
      console.error('Error parsing basic AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  // Get destination suggestions based on user input
  async getDestinationSuggestions(query) {
    try {
      // Search in Indian destinations first
      const indianResults = searchIndianDestinations(query);
      
      if (indianResults.length > 0) {
        return {
          suggestions: indianResults.slice(0, 5),
          source: 'indian_database',
          total: indianResults.length
        };
      }

      // If no Indian destinations found, suggest similar places
      const similarPlaces = this.findSimilarDestinations(query);
      
      return {
        suggestions: similarPlaces,
        source: 'similarity_search',
        total: similarPlaces.length,
        message: `No exact match found for "${query}". Here are similar destinations:`
      };
    } catch (error) {
      console.error('Error getting destination suggestions:', error);
      return {
        suggestions: [],
        source: 'error',
        total: 0,
        message: 'Unable to find suggestions'
      };
    }
  }

  // Find similar destinations based on query
  findSimilarDestinations(query) {
    const lowerQuery = query.toLowerCase();
    
    // Look for partial matches in names and aliases
    const partialMatches = indianDestinations.filter(dest => {
      const nameWords = dest.name.toLowerCase().split(' ');
      const aliasMatches = dest.aliases.some(alias => 
        alias.includes(lowerQuery.substring(0, 3))
      );
      const namePartialMatch = nameWords.some(word => 
        word.startsWith(lowerQuery.substring(0, 3))
      );
      
      return aliasMatches || namePartialMatch;
    });

    // If still no matches, suggest popular destinations from the same region
    if (partialMatches.length === 0) {
      return indianDestinations
        .filter(dest => dest.rating >= 4.3)
        .slice(0, 5);
    }

    return partialMatches.slice(0, 5);
  }
  // Generate hotel recommendations
  generateHotelRecommendations(destinationData, budget, duration) {
    const hotelTypes = [
      { type: 'Heritage Hotel', multiplier: 1.2, amenities: ['Heritage architecture', 'Cultural experience'] },
      { type: 'Business Hotel', multiplier: 1.0, amenities: ['Modern amenities', 'Business center'] },
      { type: 'Resort', multiplier: 1.5, amenities: ['Pool', 'Spa', 'Recreation'] },
      { type: 'Boutique Hotel', multiplier: 1.1, amenities: ['Unique design', 'Personalized service'] }
    ];

    return hotelTypes.slice(0, 3).map((hotel, index) => ({
      hotelName: `${hotel.type} ${destinationData.name}`,
      hotelAddress: `${index === 0 ? 'Central' : index === 1 ? 'Downtown' : 'Scenic'} ${destinationData.name}`,
      price: `₹${Math.floor(budget * hotel.multiplier)} per night`,
      hotelImageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
      geoCoordinates: { lat: 20.5937 + (index * 0.01), lng: 78.9629 + (index * 0.01) },
      rating: 4.0 + (Math.random() * 1.0),
      description: `Comfortable ${hotel.type.toLowerCase()} with excellent amenities`,
      amenities: hotel.amenities
    }));
  }

  // Generate detailed itinerary
  generateDetailedItinerary(destinationData, duration, interests, dailyBudget) {
    const activityTypes = {
      culture: ['Museums', 'Temples', 'Heritage sites', 'Art galleries'],
      adventure: ['Trekking', 'Water sports', 'Rock climbing', 'Paragliding'],
      nature: ['National parks', 'Gardens', 'Lakes', 'Viewpoints'],
      food: ['Local restaurants', 'Street food tours', 'Cooking classes', 'Food markets'],
      shopping: ['Local markets', 'Handicrafts', 'Souvenirs', 'Traditional items'],
      relaxation: ['Spas', 'Beaches', 'Resorts', 'Peaceful spots']
    };

    return Array.from({ length: duration }, (_, dayIndex) => {
      const dayNumber = dayIndex + 1;
      const isFirstDay = dayNumber === 1;
      const isLastDay = dayNumber === duration;

      let dayTheme;
      if (isFirstDay) dayTheme = 'Arrival & Local Exploration';
      else if (isLastDay) dayTheme = 'Departure & Shopping';
      else dayTheme = `${destinationData.name} Highlights - Day ${dayNumber}`;

      const dayActivities = this.generateDayActivities(
        destinationData,
        dayNumber,
        interests,
        activityTypes,
        dailyBudget,
        isFirstDay,
        isLastDay
      );

      return {
        day: dayNumber,
        theme: dayTheme,
        activities: dayActivities,
        estimatedCost: `₹${dailyBudget}`,
        tips: this.getDaySpecificTips(dayNumber, duration, destinationData)
      };
    });
  }

  // Generate activities for a specific day
  generateDayActivities(destinationData, dayNumber, interests, activityTypes, budget, isFirst, isLast) {
    const activities = [];
    const timeSlots = ['Morning', 'Afternoon', 'Evening'];

    timeSlots.forEach((timeSlot, index) => {
      let activityType = 'culture'; // default

      if (interests.length > 0) {
        activityType = interests[index % interests.length];
      }

      const availableActivities = activityTypes[activityType] || activityTypes.culture;
      const activity = availableActivities[index % availableActivities.length];

      activities.push({
        placeName: `${activity} in ${destinationData.name}`,
        placeDetails: `Experience ${activity.toLowerCase()} and immerse yourself in local culture`,
        placeImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        geoCoordinates: {
          lat: 20.5937 + (Math.random() * 0.1),
          lng: 78.9629 + (Math.random() * 0.1)
        },
        ticketPricing: `₹${Math.floor(budget * 0.2)} per person`,
        rating: 4.0 + (Math.random() * 1.0),
        timeToTravel: `${15 + Math.floor(Math.random() * 30)} minutes`,
        bestTimeToVisit: timeSlot,
        duration: '2-3 hours',
        category: activityType
      });
    });

    return activities;
  }

  // Get packing recommendations
  getPackingRecommendations(destinationData, duration) {
    const baseItems = [
      'Comfortable walking shoes',
      'Weather-appropriate clothing',
      'Sunscreen and sunglasses',
      'Personal medications',
      'Phone charger and power bank',
      'Camera for memories'
    ];

    const seasonalItems = {
      summer: ['Light cotton clothes', 'Hat', 'Water bottle'],
      winter: ['Warm clothes', 'Jacket', 'Gloves'],
      monsoon: ['Umbrella', 'Raincoat', 'Waterproof bag']
    };

    const durationItems = duration > 5 ? ['Extra luggage space', 'Laundry bag'] : ['Compact packing'];

    return [...baseItems, ...seasonalItems.summer, ...durationItems];
  }

  // Get travel tips
  getTravelTips(destinationData) {
    return [
      'Book accommodations in advance during peak season',
      'Try local cuisine for authentic experience',
      'Respect local customs and traditions',
      'Keep emergency contacts handy',
      'Use official transport services',
      'Stay hydrated and carry water',
      'Learn basic local phrases',
      'Keep copies of important documents'
    ];
  }

  // Get local information
  getLocalInformation(destinationData) {
    return {
      language: 'Hindi and English widely spoken',
      currency: 'Indian Rupee (₹)',
      timeZone: 'IST (UTC+5:30)',
      emergency: '100 (Police), 101 (Fire), 102 (Ambulance)',
      tips: 'Tipping 10-15% is customary in restaurants',
      transport: 'Auto-rickshaws, taxis, and public transport available',
      shopping: 'Local markets open 10 AM - 8 PM',
      culture: 'Dress modestly when visiting religious places'
    };
  }

  // Get day-specific tips
  getDaySpecificTips(dayNumber, totalDays, destinationData) {
    if (dayNumber === 1) {
      return ['Take it easy on the first day', 'Get familiar with the area', 'Try local breakfast'];
    } else if (dayNumber === totalDays) {
      return ['Pack souvenirs carefully', 'Check out times', 'Keep travel documents ready'];
    } else {
      return ['Start early to avoid crowds', 'Stay hydrated', 'Take breaks between activities'];
    }
  }

  // Build AI prompt for trip generation
  buildAIPrompt(formData) {
    const { destination, duration, travelers, budget, interests = [] } = formData;

    return `
You are an expert Indian travel planner. Create a detailed ${duration}-day trip itinerary for ${destination?.name || destination} for ${travelers} people with a budget of ₹${budget}.

Requirements:
- Focus on authentic Indian experiences
- Include specific places, timings, and costs
- Consider local culture and customs
- Provide practical travel tips
- Include accommodation recommendations
- Add food recommendations with local specialties

Interests: ${interests.join(', ') || 'General sightseeing'}

Please provide the response in the following JSON format:
{
  "tripSummary": {
    "destination": "${destination?.name || destination}",
    "duration": ${duration},
    "travelers": "${travelers} people",
    "budget": "₹${budget}",
    "currency": "INR",
    "totalEstimatedCost": "₹[calculated_cost]",
    "bestTime": "[best_time_to_visit]",
    "highlights": ["highlight1", "highlight2", "highlight3"]
  },
  "hotels": [
    {
      "hotelName": "[hotel_name]",
      "hotelAddress": "[address]",
      "price": "₹[price] per night",
      "hotelImageUrl": "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
      "geoCoordinates": {"lat": [latitude], "lng": [longitude]},
      "rating": [rating],
      "description": "[description]"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "theme": "[day_theme]",
      "activities": [
        {
          "placeName": "[place_name]",
          "placeDetails": "[detailed_description]",
          "placeImageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
          "geoCoordinates": {"lat": [latitude], "lng": [longitude]},
          "ticketPricing": "₹[price] per person",
          "rating": [rating],
          "timeToTravel": "[travel_time]",
          "bestTimeToVisit": "[time_of_day]"
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "accommodation": "₹[amount]",
    "food": "₹[amount]",
    "activities": "₹[amount]",
    "transport": "₹[amount]"
  },
  "travelTips": [
    "[tip1]",
    "[tip2]",
    "[tip3]"
  ]
}

Make sure all prices are in Indian Rupees and realistic for the destination and budget provided.
`;
  }

  // Parse AI response into structured format
  parseAIResponse(text, originalData) {
    try {
      // Clean the response text
      const cleanedText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();

      const parsed = JSON.parse(cleanedText);

      // Validate and enhance the parsed data
      return {
        id: `ai_trip_${Date.now()}`,
        ...parsed,
        metadata: {
          generatedAt: new Date().toISOString(),
          source: 'gemini-ai-frontend',
          version: '1.0.0',
          originalRequest: originalData
        }
      };
    } catch (error) {
      console.error('❌ Error parsing AI response:', error);
      console.log('Raw AI response:', text);

      // Return fallback if parsing fails
      return this.generateComprehensiveTrip(originalData);
    }
  }
}

export default new EnhancedTripService();
