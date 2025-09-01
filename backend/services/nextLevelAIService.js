import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { getDestinationAttractions, getRandomAttractions } from '../data/indianTouristSpots.js';

dotenv.config();

class NextLevelAIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  // Calculate optimal attractions per day based on duration and pace
  calculateAttractionsPerDay(duration, pace = 'moderate') {
    const paceMultipliers = {
      'relaxed': 0.7,    // Fewer attractions, more time per place
      'moderate': 1.0,   // Standard pace
      'packed': 1.4      // More attractions, faster pace
    };

    const baseAttractions = {
      1: 3,   // 1 day → 3 attractions
      2: 5,   // 2 days → 5 attractions total
      3: 8,   // 3 days → 8 attractions total
      4: 11,  // 4 days → 11 attractions total
      5: 14,  // 5 days → 14 attractions total
      6: 17,  // 6 days → 17 attractions total
      7: 20   // 7 days → 20 attractions total
    };

    const totalAttractions = Math.round((baseAttractions[duration] || duration * 3) * paceMultipliers[pace]);
    const attractionsPerDay = Math.ceil(totalAttractions / duration);
    
    return {
      total: totalAttractions,
      perDay: Math.min(attractionsPerDay, 6), // Max 6 per day for feasibility
      distribution: this.distributeAttractions(duration, totalAttractions)
    };
  }

  // Distribute attractions across days for optimal experience
  distributeAttractions(duration, total) {
    const distribution = [];
    const basePerDay = Math.floor(total / duration);
    const remainder = total % duration;

    for (let i = 0; i < duration; i++) {
      // Add extra attraction to first few days if there's remainder
      const dayAttractions = basePerDay + (i < remainder ? 1 : 0);
      distribution.push(Math.min(dayAttractions, 6)); // Max 6 per day
    }

    return distribution;
  }

  // Generate comprehensive trip with all next-level features
  async generateNextLevelTrip(tripData) {
    try {
      const { destination, duration, travelers, budget, interests, pace = 'moderate', preferences = {} } = tripData;
      
      console.log('🚀 Generating next-level trip for:', { destination, duration, travelers, budget, pace });

      // Calculate optimal attractions
      const attractionPlan = this.calculateAttractionsPerDay(duration, pace);
      
      // Get destination data
      const destinationData = getDestinationAttractions(destination);
      
      // Build comprehensive prompt
      const prompt = this.buildNextLevelPrompt(
        destination, 
        duration, 
        travelers, 
        budget, 
        interests, 
        pace, 
        attractionPlan,
        destinationData,
        preferences
      );

      console.log('🤖 Sending request to Gemini AI...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ AI response received, parsing...');
      const parsedTrip = this.parseNextLevelResponse(text, tripData, attractionPlan);

      // Enhance with additional features
      const enhancedTrip = await this.enhanceWithNextLevelFeatures(parsedTrip, tripData);

      console.log('🎉 Next-level trip generated successfully!');
      return enhancedTrip;

    } catch (error) {
      console.error('❌ Error generating next-level trip:', error);
      return this.generateFallbackTrip(tripData);
    }
  }

  // Build comprehensive prompt with all next-level features
  buildNextLevelPrompt(destination, duration, travelers, budget, interests, pace, attractionPlan, destinationData, preferences) {
    const specificAttractions = destinationData ? 
      getRandomAttractions(destinationData.attractions, attractionPlan.total * 2) // Get more options for variety
        .map(attr => `${attr.name} - ${attr.description} [Entry: ${attr.entry}, Timing: ${attr.timing}, Type: ${attr.type}]`)
        .join('\n') : '';

    const specificRestaurants = destinationData ? 
      destinationData.restaurants.map(rest => `${rest.name} (${rest.cuisine}) - ${rest.mustTry} [Cost: ${rest.cost}]`).join('\n') : '';

    return `
You are a world-class travel expert creating a NEXT-LEVEL ${duration}-day trip to ${destination} for ${travelers} people with ₹${budget} budget.

🎯 TRIP SPECIFICATIONS:
- Duration: ${duration} days
- Travelers: ${travelers} people  
- Budget: ₹${budget}
- Pace: ${pace} (${pace === 'relaxed' ? 'Fewer spots, more time' : pace === 'packed' ? 'More spots, efficient timing' : 'Balanced experience'})
- Total Attractions: ${attractionPlan.total}
- Per Day Distribution: ${attractionPlan.distribution.join(', ')} attractions

🏛️ SPECIFIC ATTRACTIONS TO USE:
${specificAttractions || 'Research and use REAL, FAMOUS attractions for this destination'}

🍽️ RESTAURANT RECOMMENDATIONS:
${specificRestaurants || 'Include authentic local restaurants with specific dishes and costs'}

🎯 NEXT-LEVEL REQUIREMENTS:

1. DETAILED TOURIST SPOTS:
   - Use EXACT place names (Gateway of India, not "heritage site")
   - Add historical context and why it's famous
   - Include best visiting times (morning/evening/sunset)
   - Mention photo opportunities and Instagram spots

2. COMPREHENSIVE BUDGET BREAKDOWN:
   - Entry fees for each attraction
   - Transport costs between spots (taxi/metro/auto)
   - Meal costs at recommended restaurants
   - Shopping budget estimates
   - Daily total with breakdown

3. TRAVEL OPTIMIZATION:
   - Calculate travel time between spots
   - Suggest best transport mode for each route
   - Optimize route to minimize travel time
   - Include traffic considerations

4. FOOD & LOCAL EXPERIENCES:
   - Specific restaurant names near each attraction
   - Must-try local dishes with prices
   - Street food recommendations
   - Cultural dining experiences

5. PERSONALIZATION:
   - Interests: ${interests.join(', ') || 'General sightseeing'}
   - Preferences: ${JSON.stringify(preferences)}
   - Tailor activities to user interests

6. TIME SCHEDULING:
   - Specific time slots (9:00 AM - 11:00 AM)
   - Buffer time for travel and meals
   - Realistic timing considering crowds
   - Flexible alternatives for weather

Provide response in this EXACT JSON format:
{
  "tripSummary": {
    "destination": "${destination}",
    "duration": ${duration},
    "travelers": ${travelers},
    "totalBudget": "₹${budget}",
    "pace": "${pace}",
    "totalAttractions": ${attractionPlan.total},
    "highlights": ["top 3 experiences"],
    "bestTime": "best season to visit",
    "tripMood": "adventure/cultural/relaxed/foodie"
  },
  "dailyItinerary": [
    {
      "day": 1,
      "theme": "Heritage & Iconic Landmarks",
      "attractionsCount": ${attractionPlan.distribution[0]},
      "schedule": {
        "morning": {
          "time": "9:00 AM - 12:00 PM",
          "places": [
            {
              "placeName": "Exact Place Name",
              "placeDetails": "Why famous, historical context, what to see",
              "placeImageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
              "geoCoordinates": {"lat": 0.0, "lng": 0.0},
              "ticketPricing": "₹amount per person",
              "rating": 4.5,
              "timeToTravel": "30 minutes from hotel",
              "bestTimeToVisit": "morning for fewer crowds",
              "duration": "2 hours",
              "highlights": ["photo spots", "must-see areas"],
              "insiderTips": "local secrets",
              "type": "heritage/religious/nature/cultural"
            }
          ],
          "transport": {
            "from": "hotel/previous location",
            "mode": "taxi/metro/walk",
            "duration": "30 minutes",
            "cost": "₹amount"
          }
        },
        "lunch": {
          "time": "12:30 PM - 2:00 PM",
          "restaurant": {
            "name": "Specific Restaurant Name",
            "cuisine": "Local/Continental",
            "location": "Near attraction",
            "cost": "₹amount for ${travelers} people",
            "mustTry": ["dish 1", "dish 2"],
            "ambiance": "description"
          }
        },
        "afternoon": {
          "time": "2:00 PM - 6:00 PM",
          "places": [
            {
              "placeName": "Second Attraction Name",
              "placeDetails": "What makes it special, historical significance",
              "placeImageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
              "geoCoordinates": {"lat": 0.0, "lng": 0.0},
              "ticketPricing": "₹amount per person",
              "rating": 4.3,
              "timeToTravel": "20 minutes from lunch",
              "bestTimeToVisit": "afternoon",
              "duration": "1.5 hours",
              "type": "heritage/religious/nature/cultural"
            },
            {
              "placeName": "Third Attraction Name",
              "placeDetails": "Another must-visit place with unique features",
              "placeImageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
              "geoCoordinates": {"lat": 0.0, "lng": 0.0},
              "ticketPricing": "₹amount per person",
              "rating": 4.4,
              "timeToTravel": "15 minutes walk",
              "bestTimeToVisit": "late afternoon",
              "duration": "1 hour",
              "type": "heritage/religious/nature/cultural"
            }
          ]
        },
        "evening": {
          "time": "6:00 PM - 9:00 PM",
          "places": [
            {
              "placeName": "Sunset/Evening Attraction",
              "placeDetails": "Perfect ending to the day with beautiful views",
              "placeImageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
              "geoCoordinates": {"lat": 0.0, "lng": 0.0},
              "ticketPricing": "₹amount per person",
              "rating": 4.6,
              "timeToTravel": "25 minutes",
              "bestTimeToVisit": "sunset time",
              "duration": "2 hours",
              "type": "scenic/cultural/entertainment"
            }
          ]
        }
      },
      "dailyBudget": {
        "attractions": "₹amount",
        "food": "₹amount", 
        "transport": "₹amount",
        "shopping": "₹amount",
        "total": "₹amount"
      },
      "travelOptimization": {
        "totalDistance": "X km",
        "totalTravelTime": "X hours",
        "recommendedTransport": "primary mode",
        "routeEfficiency": "optimized/good/needs improvement"
      }
    }
  ],
  "budgetBreakdown": {
    "totalEstimated": "₹amount",
    "dailyAverage": "₹amount",
    "categories": {
      "attractions": "₹amount (X%)",
      "food": "₹amount (X%)",
      "transport": "₹amount (X%)",
      "shopping": "₹amount (X%)",
      "miscellaneous": "₹amount (X%)"
    },
    "budgetTips": ["money-saving suggestions"]
  },
  "travelTips": {
    "transportation": ["specific local transport tips"],
    "food": ["local dining etiquette and recommendations"],
    "culture": ["cultural dos and don'ts"],
    "weather": ["seasonal considerations"],
    "safety": ["safety tips for travelers"],
    "photography": ["best photo spots and timing"]
  },
  "localExperiences": [
    "unique local activities",
    "cultural immersion opportunities",
    "hidden gems only locals know"
  ]
}

CRITICAL REQUIREMENTS:
1. Use ONLY real place names from the attractions list provided
2. Each day must have COMPLETELY DIFFERENT places - NO REPETITION across days
3. Day 1 should have ${attractionPlan.distribution[0]} places, Day 2 should have ${attractionPlan.distribution[1] || attractionPlan.distribution[0]} places, etc.
4. NEVER repeat the same place on multiple days
5. Ensure variety in place types: heritage, religious, nature, cultural, entertainment
6. Include specific costs, timings, and practical details
7. Each place should have complete details: name, description, coordinates, pricing, timing

PLACE DISTRIBUTION RULE:
- Morning: 1-2 places
- Afternoon: 2-3 places
- Evening: 1-2 places
- Total per day should match the distribution: ${attractionPlan.distribution.join(', ')} for days 1, 2, 3... respectively
`;
  }

  // Parse AI response with enhanced error handling
  parseNextLevelResponse(text, originalData, attractionPlan) {
    try {
      // Clean the response
      let cleanedText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();

      // Find JSON content
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd);
      }

      const parsed = JSON.parse(cleanedText);
      
      // Validate and enhance the response
      return this.validateAndEnhanceResponse(parsed, originalData, attractionPlan);
      
    } catch (error) {
      console.error('❌ Error parsing AI response:', error);
      console.log('Raw response:', text.substring(0, 500));
      return this.generateFallbackTrip(originalData);
    }
  }

  // Validate and enhance the parsed response
  validateAndEnhanceResponse(parsed, originalData, attractionPlan) {
    // Ensure all required fields exist
    if (!parsed.dailyItinerary || !Array.isArray(parsed.dailyItinerary)) {
      throw new Error('Invalid itinerary structure');
    }

    // Add missing fields and enhancements
    parsed.tripSummary = parsed.tripSummary || {};
    parsed.tripSummary.generatedAt = new Date().toISOString();
    parsed.tripSummary.attractionPlan = attractionPlan;

    // Enhance each day with additional features
    parsed.dailyItinerary.forEach((day, index) => {
      day.dayNumber = index + 1;
      day.weatherConsiderations = this.getWeatherTips(originalData.destination);
      day.alternativeActivities = this.getAlternativeActivities(day);
    });

    return parsed;
  }

  // Generate fallback trip if AI fails
  generateFallbackTrip(tripData) {
    const { destination, duration, travelers, budget } = tripData;
    
    return {
      tripSummary: {
        destination,
        duration,
        travelers,
        totalBudget: `₹${budget}`,
        highlights: [`Explore ${destination}`, "Local cuisine", "Cultural experiences"],
        bestTime: "October to March",
        tripMood: "cultural"
      },
      dailyItinerary: Array.from({ length: duration }, (_, i) => ({
        day: i + 1,
        theme: `Day ${i + 1} Exploration`,
        schedule: {
          morning: {
            time: "9:00 AM - 12:00 PM",
            attraction: {
              name: `${destination} Main Attraction`,
              description: "Popular tourist destination",
              entryFee: "₹50",
              duration: "2 hours"
            }
          },
          lunch: {
            time: "12:30 PM - 2:00 PM",
            restaurant: {
              name: "Local Restaurant",
              cuisine: "Local",
              cost: `₹${Math.round(budget * 0.15 / duration)} for ${travelers} people`
            }
          }
        },
        dailyBudget: {
          total: `₹${Math.round(budget / duration)}`
        }
      })),
      budgetBreakdown: {
        totalEstimated: `₹${budget}`,
        dailyAverage: `₹${Math.round(budget / duration)}`
      }
    };
  }

  // Get weather tips for destination
  getWeatherTips(destination) {
    const weatherTips = {
      'mumbai': 'Avoid monsoon season (June-September). Best time: October-February.',
      'delhi': 'Very hot in summer. Best time: October-March.',
      'kolkata': 'Humid climate. Carry light cotton clothes.',
      'bangalore': 'Pleasant weather year-round. Light jacket for evenings.',
      'goa': 'Avoid monsoons. Peak season: November-February.'
    };

    return weatherTips[destination.toLowerCase()] || 'Check weather forecast before travel.';
  }

  // Get alternative activities for rainy days
  getAlternativeActivities(day) {
    return [
      'Visit local museums or art galleries',
      'Explore shopping malls or markets',
      'Try local cooking classes',
      'Visit cultural centers or libraries'
    ];
  }

  // Enhance trip with additional next-level features
  async enhanceWithNextLevelFeatures(trip, originalData) {
    // Add live cost updates
    trip.costUpdates = {
      lastUpdated: new Date().toISOString(),
      currency: 'INR',
      exchangeRates: { USD: 0.012, EUR: 0.011 } // Mock rates
    };

    // Add trip mood analysis
    trip.tripAnalysis = {
      paceRating: this.analyzePace(trip),
      budgetEfficiency: this.analyzeBudget(trip, originalData.budget),
      experienceVariety: this.analyzeVariety(trip)
    };

    // Add sharing features
    trip.sharing = {
      shareableLink: `https://your-app.com/trip/${Date.now()}`,
      exportFormats: ['PDF', 'JSON', 'Calendar']
    };

    return trip;
  }

  // Analyze trip pace
  analyzePace(trip) {
    const avgAttractionsPerDay = trip.dailyItinerary.reduce((sum, day) => 
      sum + (day.attractionsCount || 3), 0) / trip.dailyItinerary.length;
    
    if (avgAttractionsPerDay <= 2) return 'Relaxed';
    if (avgAttractionsPerDay <= 4) return 'Moderate';
    return 'Packed';
  }

  // Analyze budget efficiency
  analyzeBudget(trip, originalBudget) {
    const estimatedCost = parseInt(trip.budgetBreakdown?.totalEstimated?.replace(/[₹,]/g, '') || originalBudget);
    const efficiency = (originalBudget / estimatedCost) * 100;
    
    if (efficiency > 110) return 'Under Budget';
    if (efficiency > 90) return 'On Budget';
    return 'Over Budget';
  }

  // Analyze experience variety
  analyzeVariety(trip) {
    const themes = trip.dailyItinerary.map(day => day.theme);
    const uniqueThemes = new Set(themes).size;
    
    if (uniqueThemes >= trip.dailyItinerary.length * 0.8) return 'Highly Varied';
    if (uniqueThemes >= trip.dailyItinerary.length * 0.6) return 'Good Variety';
    return 'Limited Variety';
  }
}

export default new NextLevelAIService();
