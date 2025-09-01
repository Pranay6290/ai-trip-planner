import { searchIndianDestinations } from '../data/indianDestinations';
import placesService from './placesService';
import { chatSession } from '../service/AIModal';
import { useTelemetry } from './telemetryService';

class ItineraryService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 60 * 60 * 1000; // 1 hour
  }

  // Generate comprehensive itinerary with AI
  async generateItinerary(tripData, preferences = {}) {
    const cacheKey = `itinerary_${JSON.stringify(tripData)}_${JSON.stringify(preferences)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const startTime = Date.now();

    try {
      const prompt = this.buildEnhancedPrompt(tripData, preferences);
      const result = await chatSession.sendMessage(prompt);
      const responseText = result?.response?.text();
      
      if (!responseText) {
        throw new Error('No response from AI service');
      }

      // Parse and enhance the AI response
      const parsedItinerary = this.parseAIResponse(responseText, tripData);
      const optimizedItinerary = await this.optimizeItinerary(parsedItinerary, tripData, preferences);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: optimizedItinerary,
        timestamp: Date.now()
      });

      return optimizedItinerary;
    } catch (error) {
      console.error('Error generating itinerary:', error);
      throw new Error(`Failed to generate itinerary: ${error.message}`);
    }
  }

  // Build enhanced AI prompt with detailed context
  buildEnhancedPrompt(tripData, preferences) {
    const {
      destination,
      duration,
      budget,
      travelers,
      travelStyle = [],
      interests = [],
      pace = 'moderate'
    } = tripData;

    const budgetLevel = this.getBudgetLevel(budget);
    const paceDescription = this.getPaceDescription(pace);
    const styleDescription = travelStyle.length > 0 ? travelStyle.join(', ') : 'general tourism';
    const interestDescription = interests.length > 0 ? interests.join(', ') : 'popular attractions';

    return `
You are a professional travel planner. Create a detailed ${duration}-day travel itinerary for ${destination.name || destination.label}.

TRIP DETAILS:
- Destination: ${destination.name || destination.label}
- Duration: ${duration} days
- Budget Level: ${budgetLevel} (${budget.min ? `$${budget.min}-$${budget.max}` : 'flexible'})
- Number of Travelers: ${travelers}
- Travel Style: ${styleDescription}
- Interests: ${interestDescription}
- Pace: ${paceDescription}

IMPORTANT: You must provide a complete, detailed response with specific places, restaurants, and activities. Do not use generic placeholders.

REQUIREMENTS:
1. Create a day-by-day itinerary with 3-4 specific activities per day
2. Include real attraction names, restaurant names, and specific locations
3. Provide detailed descriptions for each activity (minimum 20 words)
4. Include realistic costs in USD for all activities and meals
5. Add practical tips and booking information
6. Consider travel time and group activities by proximity
7. Include breakfast, lunch, and dinner recommendations with specific restaurant names
8. Provide accommodation options with real hotel/hostel names
9. Add transportation guidance between activities
10. Include cultural tips and local customs

RESPONSE FORMAT (JSON):
{
  "tripSummary": {
    "destination": "destination name",
    "duration": number,
    "totalEstimatedCost": number,
    "bestTimeToVisit": "season/months",
    "highlights": ["top 3-5 experiences"]
  },
  "accommodation": [
    {
      "name": "hotel name",
      "type": "hotel/hostel/apartment",
      "priceRange": "$-$$$$",
      "location": "area/district",
      "rating": number,
      "amenities": ["wifi", "breakfast", etc],
      "bookingTips": "advance booking recommendations"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "theme": "day theme (e.g., 'Historic City Center')",
      "activities": [
        {
          "time": "09:00",
          "name": "activity name",
          "type": "attraction/restaurant/experience",
          "duration": "2 hours",
          "description": "detailed description",
          "location": {
            "address": "full address",
            "coordinates": {"lat": number, "lng": number}
          },
          "cost": {
            "amount": number,
            "currency": "USD",
            "notes": "per person/group/etc"
          },
          "tips": "practical tips and recommendations",
          "bookingRequired": boolean,
          "weatherDependent": boolean,
          "category": "culture/food/nature/entertainment/shopping"
        }
      ],
      "meals": {
        "breakfast": {"name": "restaurant", "cost": number, "cuisine": "type"},
        "lunch": {"name": "restaurant", "cost": number, "cuisine": "type"},
        "dinner": {"name": "restaurant", "cost": number, "cuisine": "type"}
      },
      "transportation": {
        "method": "walking/metro/taxi/bus",
        "totalCost": number,
        "notes": "transportation tips"
      },
      "dailyBudget": {
        "activities": number,
        "meals": number,
        "transportation": number,
        "total": number
      }
    }
  ],
  "practicalInfo": {
    "currency": "local currency",
    "language": "primary language",
    "timeZone": "timezone",
    "emergencyNumbers": {"police": "number", "medical": "number"},
    "culturalTips": ["important cultural notes"],
    "packingTips": ["what to bring based on season/activities"],
    "budgetTips": ["money-saving recommendations"]
  },
  "alternatives": {
    "badWeatherActivities": ["indoor alternatives"],
    "budgetAlternatives": ["cheaper options"],
    "luxuryUpgrades": ["premium experiences"]
  }
}

Make sure all activities are realistic, properly timed, and geographically logical. Include specific names of places, restaurants, and attractions rather than generic descriptions.
`;
  }

  // Parse AI response and validate structure
  parseAIResponse(responseText, tripData = {}) {
    try {
      // Clean the response text
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanedText);

      // Validate required structure
      if (!parsed.itinerary || !Array.isArray(parsed.itinerary)) {
        throw new Error('Invalid itinerary structure');
      }

      // Ensure all days have detailed activities
      if (parsed.itinerary.some(day => !day.activities || day.activities.length === 0)) {
        console.warn('AI response has empty days, using fallback');
        return this.createFallbackItinerary(tripData);
      }

      return parsed;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw AI response:', responseText);
      // Fallback to comprehensive structure if parsing fails
      return this.createFallbackItinerary(tripData);
    }
  }

  // Optimize itinerary for better user experience
  async optimizeItinerary(itinerary, tripData, preferences) {
    try {
      // Add unique IDs to all activities
      itinerary.itinerary = itinerary.itinerary.map((day, dayIndex) => ({
        ...day,
        id: `day_${dayIndex + 1}`,
        activities: day.activities.map((activity, actIndex) => ({
          ...activity,
          id: `activity_${dayIndex + 1}_${actIndex + 1}`,
          dayNumber: dayIndex + 1,
          priority: this.calculateActivityPriority(activity, preferences),
          estimatedDuration: this.parseDuration(activity.duration),
          accessibility: this.assessAccessibility(activity),
          tags: this.generateActivityTags(activity)
        }))
      }));

      // Add weather considerations
      itinerary.weatherConsiderations = this.addWeatherConsiderations(itinerary);

      // Calculate route optimization
      itinerary.routeOptimization = await this.calculateOptimalRoutes(itinerary);

      // Add real-time information placeholders
      itinerary.realTimeInfo = {
        lastUpdated: new Date().toISOString(),
        dynamicPricing: true,
        trafficAware: true,
        weatherAware: true
      };

      return itinerary;
    } catch (error) {
      console.error('Error optimizing itinerary:', error);
      return itinerary; // Return unoptimized version if optimization fails
    }
  }

  // Calculate activity priority based on preferences
  calculateActivityPriority(activity, preferences) {
    let score = 0;
    
    // Base score from activity type
    const typeScores = {
      'attraction': 3,
      'restaurant': 2,
      'experience': 4,
      'shopping': 1,
      'entertainment': 3
    };
    
    score += typeScores[activity.type] || 2;
    
    // Boost score based on user interests
    if (preferences.interests) {
      preferences.interests.forEach(interest => {
        if (activity.category === interest || activity.tags?.includes(interest)) {
          score += 2;
        }
      });
    }
    
    // Adjust for travel style
    if (preferences.travelStyle) {
      preferences.travelStyle.forEach(style => {
        if (activity.tags?.includes(style)) {
          score += 1;
        }
      });
    }
    
    // Normalize to 1-5 scale
    return Math.min(5, Math.max(1, Math.round(score)));
  }

  // Parse duration string to minutes
  parseDuration(durationStr) {
    if (!durationStr) return 120; // Default 2 hours
    
    const match = durationStr.match(/(\d+)\s*(hour|hr|minute|min)/i);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit.includes('hour') || unit.includes('hr')) {
        return value * 60;
      } else {
        return value;
      }
    }
    
    return 120; // Default fallback
  }

  // Assess accessibility of activities
  assessAccessibility(activity) {
    // This would integrate with accessibility APIs in a real implementation
    return {
      wheelchairAccessible: null,
      publicTransportAccess: true,
      walkingRequired: activity.type === 'walking_tour',
      physicalDemand: activity.category === 'nature' ? 'moderate' : 'low'
    };
  }

  // Generate activity tags for better categorization
  generateActivityTags(activity) {
    const tags = [];
    
    // Add category-based tags
    if (activity.category) tags.push(activity.category);
    if (activity.type) tags.push(activity.type);
    
    // Add context-based tags
    if (activity.weatherDependent) tags.push('weather-dependent');
    if (activity.bookingRequired) tags.push('advance-booking');
    if (activity.cost?.amount === 0) tags.push('free');
    if (activity.cost?.amount > 50) tags.push('premium');
    
    return tags;
  }

  // Add weather considerations
  addWeatherConsiderations(itinerary) {
    return {
      seasonalRecommendations: 'Best visited during spring and fall',
      weatherBackups: itinerary.alternatives?.badWeatherActivities || [],
      clothingRecommendations: ['comfortable walking shoes', 'weather-appropriate clothing']
    };
  }

  // Calculate optimal routes (simplified version)
  async calculateOptimalRoutes(itinerary) {
    // This would integrate with Google Maps Directions API in a real implementation
    return {
      optimized: true,
      totalWalkingTime: '2-3 hours per day',
      transportationMethods: ['walking', 'public transport', 'taxi'],
      routeNotes: 'Routes optimized for minimal travel time'
    };
  }

  // Get budget level description
  getBudgetLevel(budget) {
    if (!budget.min) return 'flexible';
    if (budget.max <= 1500) return 'budget-friendly';
    if (budget.max <= 5000) return 'moderate';
    return 'luxury';
  }

  // Get pace description
  getPaceDescription(pace) {
    const descriptions = {
      'slow': 'relaxed pace with plenty of time at each location',
      'moderate': 'balanced pace with good coverage of attractions',
      'fast': 'packed schedule to see as much as possible'
    };
    return descriptions[pace] || descriptions.moderate;
  }

  // Create comprehensive fallback itinerary if AI fails
  createFallbackItinerary(tripData = {}) {
    const duration = tripData.duration || 3;
    const destination = tripData.destination?.name || tripData.destination?.label || 'Your Destination';

    const sampleItinerary = [];

    // Generate detailed itinerary for each day
    for (let day = 1; day <= duration; day++) {
      sampleItinerary.push({
        day: day,
        theme: this.getDayTheme(day, duration),
        activities: this.generateSampleActivities(day, destination),
        meals: {
          breakfast: {
            name: 'Local Café',
            cost: 15,
            cuisine: 'local',
            description: 'Start your day with fresh pastries and coffee'
          },
          lunch: {
            name: 'Traditional Restaurant',
            cost: 25,
            cuisine: 'local',
            description: 'Authentic local dishes in a cozy setting'
          },
          dinner: {
            name: 'Fine Dining Experience',
            cost: 45,
            cuisine: 'local',
            description: 'Upscale restaurant featuring regional specialties'
          }
        },
        transportation: {
          method: 'Walking/Public Transport',
          cost: 10,
          tips: 'Consider getting a day pass for public transportation'
        },
        estimatedCost: 120
      });
    }

    return {
      tripSummary: {
        destination: destination,
        duration: duration,
        totalEstimatedCost: duration * 120,
        bestTimeToVisit: 'Spring and Fall for pleasant weather',
        highlights: [
          'Historic city center exploration',
          'Local cuisine tasting',
          'Cultural landmarks and museums',
          'Scenic viewpoints and photography',
          'Local markets and shopping'
        ]
      },
      accommodation: [
        {
          name: 'City Center Hotel',
          type: 'hotel',
          priceRange: '$$',
          location: 'Downtown',
          rating: 4.2,
          amenities: ['WiFi', 'Breakfast', 'Concierge', 'Fitness Center'],
          bookingTips: 'Book 2-3 weeks in advance for better rates'
        },
        {
          name: 'Budget Hostel',
          type: 'hostel',
          priceRange: '$',
          location: 'City Center',
          rating: 4.0,
          amenities: ['WiFi', 'Shared Kitchen', 'Laundry'],
          bookingTips: 'Great for solo travelers and backpackers'
        }
      ],
      itinerary: sampleItinerary,
      practicalInfo: {
        currency: 'INR',
        language: 'English',
        culturalTips: [
          'Learn basic local greetings',
          'Respect local customs and dress codes',
          'Try local cuisine and specialties',
          'Keep copies of important documents',
          'Stay aware of your surroundings'
        ],
        packingList: [
          'Comfortable walking shoes',
          'Weather-appropriate clothing',
          'Portable charger',
          'Camera or smartphone',
          'Travel adapter',
          'First aid kit'
        ],
        budgetBreakdown: {
          accommodation: Math.round(duration * 80),
          food: Math.round(duration * 85),
          activities: Math.round(duration * 60),
          transportation: Math.round(duration * 25),
          miscellaneous: Math.round(duration * 30)
        }
      }
    };
  }

  // Helper method to get day theme based on day number
  getDayTheme(day, totalDays) {
    const themes = {
      1: 'Arrival & City Overview',
      2: 'Cultural Exploration',
      3: 'Local Experiences',
      4: 'Adventure & Nature',
      5: 'Relaxation & Shopping',
      6: 'Hidden Gems',
      7: 'Farewell & Departure'
    };

    if (day === totalDays && totalDays > 1) {
      return 'Farewell & Departure';
    }

    return themes[day] || `Day ${day} Exploration`;
  }

  // Helper method to generate sample activities for each day
  generateSampleActivities(day, destination) {
    const baseActivities = {
      1: [
        {
          time: '09:00',
          name: 'City Walking Tour',
          type: 'attraction',
          duration: '3 hours',
          description: `Explore the historic center of ${destination} with a guided walking tour`,
          cost: { amount: 25, currency: 'USD' },
          category: 'culture',
          tips: 'Wear comfortable walking shoes'
        },
        {
          time: '14:00',
          name: 'Main Museum Visit',
          type: 'attraction',
          duration: '2 hours',
          description: 'Visit the city\'s premier museum featuring local history and art',
          cost: { amount: 15, currency: 'USD' },
          category: 'culture',
          tips: 'Check for student discounts'
        },
        {
          time: '17:00',
          name: 'Sunset Viewpoint',
          type: 'attraction',
          duration: '1 hour',
          description: 'Watch the sunset from the best viewpoint in the city',
          cost: { amount: 0, currency: 'USD' },
          category: 'nature',
          tips: 'Arrive 30 minutes before sunset'
        }
      ],
      2: [
        {
          time: '09:30',
          name: 'Local Market Tour',
          type: 'experience',
          duration: '2 hours',
          description: 'Explore the vibrant local market and taste fresh produce',
          cost: { amount: 20, currency: 'USD' },
          category: 'food',
          tips: 'Bring cash for small purchases'
        },
        {
          time: '13:00',
          name: 'Cooking Class',
          type: 'experience',
          duration: '3 hours',
          description: 'Learn to cook traditional local dishes with a professional chef',
          cost: { amount: 65, currency: 'USD' },
          category: 'food',
          tips: 'Book in advance, includes lunch'
        },
        {
          time: '18:00',
          name: 'Cultural Performance',
          type: 'entertainment',
          duration: '2 hours',
          description: 'Enjoy traditional music and dance performances',
          cost: { amount: 30, currency: 'USD' },
          category: 'culture',
          tips: 'Check schedule for show times'
        }
      ],
      3: [
        {
          time: '08:00',
          name: 'Day Trip Adventure',
          type: 'attraction',
          duration: '8 hours',
          description: 'Full-day excursion to nearby natural attractions or historic sites',
          cost: { amount: 85, currency: 'USD' },
          category: 'adventure',
          tips: 'Includes transportation and guide'
        },
        {
          time: '19:00',
          name: 'Local Pub Crawl',
          type: 'entertainment',
          duration: '3 hours',
          description: 'Experience the local nightlife and meet fellow travelers',
          cost: { amount: 40, currency: 'USD' },
          category: 'nightlife',
          tips: 'Must be 18+ or 21+ depending on location'
        }
      ]
    };

    // Return activities for the specific day, or generate generic ones
    if (baseActivities[day]) {
      return baseActivities[day];
    }

    // Generate generic activities for days beyond 3
    return [
      {
        time: '10:00',
        name: `Day ${day} Exploration`,
        type: 'attraction',
        duration: '4 hours',
        description: `Discover more of ${destination} with curated local experiences`,
        cost: { amount: 35, currency: 'USD' },
        category: 'culture',
        tips: 'Ask locals for hidden gem recommendations'
      },
      {
        time: '15:00',
        name: 'Leisure Time',
        type: 'experience',
        duration: '2 hours',
        description: 'Free time to explore at your own pace or relax',
        cost: { amount: 0, currency: 'USD' },
        category: 'relaxation',
        tips: 'Perfect time for shopping or café hopping'
      }
    ];
  }

  // Generate basic itinerary from selected places (Phase 1 MVP)
  async generateBasicItinerary(destination, selectedPlaces, tripLength, preferences = {}) {
    try {
      console.log('🗺️ Generating basic itinerary:', { destination: destination.name, places: selectedPlaces.length, days: tripLength });

      // Simple fallback implementation
      const dailyPlans = [];
      const placesPerDay = Math.ceil(selectedPlaces.length / tripLength);

      for (let day = 1; day <= tripLength; day++) {
        const startIndex = (day - 1) * placesPerDay;
        const endIndex = Math.min(startIndex + placesPerDay, selectedPlaces.length);
        const dayPlaces = selectedPlaces.slice(startIndex, endIndex);

        dailyPlans.push({
          day: day,
          theme: `Day ${day} Exploration`,
          places: dayPlaces.map((place, index) => ({
            ...place,
            time: `${9 + index * 2}:00`,
            duration: '2 hours',
            order: index + 1
          })),
          estimatedDuration: dayPlaces.length * 2 // 2 hours per place
        });
      }

      return {
        destination,
        tripLength,
        itinerary: dailyPlans,
        metadata: {
          totalPlaces: selectedPlaces.length,
          averagePlacesPerDay: Math.round(selectedPlaces.length / tripLength),
          estimatedBudget: {
            total: tripLength * 100, // Simple estimate
            perDay: 100,
            breakdown: {
              activities: tripLength * 40,
              food: tripLength * 35,
              transport: tripLength * 25
            }
          },
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Error generating basic itinerary:', error);
      throw error;
    }
  }
}

// Create singleton instance
const itineraryService = new ItineraryService();

// React hook for itinerary service
export const useItineraryService = () => {
  const telemetry = useTelemetry();

  return {
    generateItinerary: async (tripData, preferences) => {
      const startTime = Date.now();
      try {
        telemetry.trackEvent('itinerary_generation_started', { 
          destination: tripData.destination?.name,
          duration: tripData.duration 
        });
        
        const itinerary = await itineraryService.generateItinerary(tripData, preferences);
        const generationTime = Date.now() - startTime;
        
        telemetry.trackItineraryGenerated(tripData, generationTime);
        
        return itinerary;
      } catch (error) {
        telemetry.trackError(error, {
          action: 'generateItinerary',
          tripData: { destination: tripData.destination?.name, duration: tripData.duration }
        });
        throw error;
      }
    },

    // Generate basic itinerary from selected places (Phase 1 MVP)
    generateBasicItinerary: async (destination, selectedPlaces, tripLength, preferences = {}) => {
      try {
        // Group places by proximity
        const clusteredPlaces = await itineraryService.clusterPlacesByProximity(selectedPlaces, destination.location);

        // Distribute places across days
        const dailyPlans = itineraryService.distributePlacesAcrossDays(clusteredPlaces, tripLength, preferences);

        // Optimize order within each day
        const optimizedPlans = await itineraryService.optimizeDailyOrder(dailyPlans);

        // Add time blocks and durations
        const timedItinerary = itineraryService.addTimeBlocks(optimizedPlans, preferences);

        return {
          destination,
          tripLength,
          itinerary: timedItinerary,
          metadata: {
            totalPlaces: selectedPlaces.length,
            averagePlacesPerDay: Math.round(selectedPlaces.length / tripLength),
            estimatedBudget: itineraryService.estimateBudget(selectedPlaces, tripLength, preferences),
            generatedAt: new Date().toISOString()
          }
        };
      } catch (error) {
        console.error('Error generating basic itinerary:', error);
        throw error;
      }
    },

    // Cluster places by proximity using simple distance calculation
    clusterPlacesByProximity: async (places, centerLocation, maxClusters = null) => {
      if (!places || places.length === 0) return [];

      // Calculate distances from center
      const placesWithDistance = places.map(place => ({
        ...place,
        distanceFromCenter: itineraryService.calculateDistance(
          centerLocation,
          place.location || { lat: 0, lng: 0 }
        )
      }));

      // Sort by distance and group into clusters
      placesWithDistance.sort((a, b) => a.distanceFromCenter - b.distanceFromCenter);

      // Simple clustering: group nearby places together
      const clusters = [];
      const clusterRadius = 2; // 2km radius

      for (const place of placesWithDistance) {
        let addedToCluster = false;

        for (const cluster of clusters) {
          const clusterCenter = itineraryService.getClusterCenter(cluster);
          const distanceToCluster = itineraryService.calculateDistance(place.location, clusterCenter);

          if (distanceToCluster <= clusterRadius) {
            cluster.push(place);
            addedToCluster = true;
            break;
          }
        }

        if (!addedToCluster) {
          clusters.push([place]);
        }
      }

      return clusters;
    },

    // Distribute clustered places across trip days
    distributePlacesAcrossDays: (clusters, tripLength, preferences) => {
      const dailyPlans = Array.from({ length: tripLength }, (_, i) => ({
        day: i + 1,
        places: [],
        theme: null
      }));

      // Distribute clusters across days
      let currentDay = 0;
      const maxPlacesPerDay = preferences.pace === 'relaxed' ? 3 : preferences.pace === 'packed' ? 6 : 4;

      for (const cluster of clusters) {
        for (const place of cluster) {
          if (dailyPlans[currentDay].places.length >= maxPlacesPerDay) {
            currentDay = (currentDay + 1) % tripLength;
          }

          dailyPlans[currentDay].places.push(place);
        }
      }

      // Assign themes to days based on place types
      dailyPlans.forEach(day => {
        day.theme = itineraryService.getDayTheme(day.places);
      });

      return dailyPlans;
    },

    // Optimize order within each day using nearest neighbor
    optimizeDailyOrder: async (dailyPlans) => {
      const optimizedPlans = [];

      for (const day of dailyPlans) {
        if (day.places.length <= 1) {
          optimizedPlans.push(day);
          continue;
        }

        // Start with the place closest to city center or first place
        let orderedPlaces = [day.places[0]];
        let remainingPlaces = day.places.slice(1);

        // Nearest neighbor algorithm
        while (remainingPlaces.length > 0) {
          const currentPlace = orderedPlaces[orderedPlaces.length - 1];
          let nearestPlace = remainingPlaces[0];
          let shortestDistance = itineraryService.calculateDistance(
            currentPlace.location,
            nearestPlace.location
          );

          for (let i = 1; i < remainingPlaces.length; i++) {
            const distance = itineraryService.calculateDistance(
              currentPlace.location,
              remainingPlaces[i].location
            );

            if (distance < shortestDistance) {
              shortestDistance = distance;
              nearestPlace = remainingPlaces[i];
            }
          }

          orderedPlaces.push(nearestPlace);
          remainingPlaces = remainingPlaces.filter(p => p.placeId !== nearestPlace.placeId);
        }

        optimizedPlans.push({
          ...day,
          places: orderedPlaces
        });
      }

      return optimizedPlans;
    },

    // Add time blocks and estimated durations
    addTimeBlocks: (dailyPlans, preferences) => {
      const timeBlocks = {
        morning: { start: '09:00', label: 'Morning' },
        midday: { start: '12:00', label: 'Midday' },
        afternoon: { start: '14:00', label: 'Afternoon' },
        evening: { start: '18:00', label: 'Evening' }
      };

      return dailyPlans.map(day => {
        const timedPlaces = day.places.map((place, index) => {
          const timeBlock = itineraryService.getTimeBlock(index, day.places.length);
          const duration = itineraryService.getEstimatedDuration(place);

          return {
            ...place,
            time: timeBlocks[timeBlock].start,
            timeBlock: timeBlocks[timeBlock].label,
            estimatedDuration: duration,
            order: index + 1
          };
        });

        return {
          ...day,
          places: timedPlaces,
          estimatedDuration: timedPlaces.reduce((total, place) => total + place.estimatedDuration, 0)
        };
      });
    },

    // Helper methods for basic itinerary generation
    calculateDistance: (point1, point2) => {
      if (!point1 || !point2) return 0;

      const R = 6371; // Earth's radius in km
      const dLat = itineraryService.toRad(point2.lat - point1.lat);
      const dLon = itineraryService.toRad(point2.lng - point1.lng);

      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(itineraryService.toRad(point1.lat)) * Math.cos(itineraryService.toRad(point2.lat)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },

    toRad: (degrees) => {
      return degrees * (Math.PI / 180);
    },

    getClusterCenter: (cluster) => {
      if (cluster.length === 0) return { lat: 0, lng: 0 };

      const avgLat = cluster.reduce((sum, place) => sum + (place.location?.lat || 0), 0) / cluster.length;
      const avgLng = cluster.reduce((sum, place) => sum + (place.location?.lng || 0), 0) / cluster.length;

      return { lat: avgLat, lng: avgLng };
    },

    getDayTheme: (places) => {
      const typeCount = {};

      places.forEach(place => {
        if (place.types) {
          place.types.forEach(type => {
            typeCount[type] = (typeCount[type] || 0) + 1;
          });
        }
      });

      // Determine theme based on most common type
      const dominantType = Object.keys(typeCount).reduce((a, b) =>
        typeCount[a] > typeCount[b] ? a : b, 'mixed'
      );

      const themeMap = {
        'tourist_attraction': 'Sightseeing',
        'museum': 'Cultural',
        'restaurant': 'Culinary',
        'shopping_mall': 'Shopping',
        'park': 'Nature',
        'night_club': 'Nightlife',
        'spa': 'Relaxation'
      };

      return themeMap[dominantType] || 'Mixed Activities';
    },

    getTimeBlock: (index, totalPlaces) => {
      const ratio = index / totalPlaces;

      if (ratio < 0.25) return 'morning';
      if (ratio < 0.5) return 'midday';
      if (ratio < 0.75) return 'afternoon';
      return 'evening';
    },

    getEstimatedDuration: (place) => {
      // Duration in minutes based on place type
      const durationMap = {
        'tourist_attraction': 120,
        'museum': 180,
        'restaurant': 90,
        'shopping_mall': 120,
        'park': 90,
        'night_club': 180,
        'spa': 120,
        'amusement_park': 240
      };

      if (place.types) {
        for (const type of place.types) {
          if (durationMap[type]) {
            return durationMap[type];
          }
        }
      }

      return 90; // Default 1.5 hours
    },

    estimateBudget: (places, tripLength, preferences) => {
      let totalBudget = 0;

      // Accommodation (per night)
      const accommodationPerNight = preferences.budgetLevel === 'luxury' ? 200 :
                                   preferences.budgetLevel === 'moderate' ? 100 : 50;
      totalBudget += accommodationPerNight * tripLength;

      // Food (per day)
      const foodPerDay = preferences.budgetLevel === 'luxury' ? 80 :
                        preferences.budgetLevel === 'moderate' ? 50 : 30;
      totalBudget += foodPerDay * tripLength;

      // Activities
      places.forEach(place => {
        const activityCost = place.priceLevel ? place.priceLevel * 20 : 20;
        totalBudget += activityCost;
      });

      // Transportation (per day)
      const transportPerDay = 20;
      totalBudget += transportPerDay * tripLength;

      return {
        total: Math.round(totalBudget),
        breakdown: {
          accommodation: accommodationPerNight * tripLength,
          food: foodPerDay * tripLength,
          activities: places.reduce((sum, place) => sum + (place.priceLevel ? place.priceLevel * 20 : 20), 0),
          transportation: transportPerDay * tripLength
        }
      };
    }
  };
};

export default itineraryService;
