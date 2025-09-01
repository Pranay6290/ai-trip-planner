import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class GeminiService {
  constructor() {
    this.apiKey = process.env.GOOGLE_GEMINI_AI_API_KEY;
    if (!this.apiKey) {
      throw new Error('Google Gemini AI API key is required');
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    
    this.generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    };
  }

  async generateTripPlan(tripData) {
    try {
      const { destination, days, budget, travelers, interests } = tripData;
      
      const prompt = this.createTripPrompt(destination, days, budget, travelers, interests);
      
      const chatSession = this.model.startChat({
        generationConfig: this.generationConfig,
        history: [],
      });

      const result = await chatSession.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      const tripPlan = JSON.parse(text);
      
      // Add metadata
      tripPlan.metadata = {
        generatedAt: new Date().toISOString(),
        destination,
        days: parseInt(days),
        budget,
        travelers,
        interests: interests || [],
        createdBy: 'Pranay Gupta AI Trip Planner'
      };
      
      return tripPlan;
    } catch (error) {
      console.error('Error generating trip plan:', error);
      throw new Error('Failed to generate trip plan. Please try again.');
    }
  }

  createTripPrompt(destination, days, budget, travelers, interests = []) {
    const interestsText = interests.length > 0 ? ` with interests in ${interests.join(', ')}` : '';
    
    return `Generate a comprehensive travel plan for:
    
Location: ${destination}
Duration: ${days} days
Budget: ${budget}
Travelers: ${travelers}${interestsText}

Please provide a detailed JSON response with the following structure:

{
  "tripOverview": {
    "destination": "${destination}",
    "duration": "${days} days",
    "budget": "${budget}",
    "bestTimeToVisit": "recommended season/months",
    "overview": "brief description of the destination and trip highlights"
  },
  "hotelOptions": [
    {
      "hotelName": "Hotel Name",
      "hotelAddress": "Complete address",
      "price": "price range per night",
      "hotelImageUrl": "realistic hotel image URL",
      "geoCoordinates": "latitude, longitude",
      "rating": "star rating",
      "description": "detailed description with amenities",
      "bookingUrl": "booking website URL"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "theme": "day theme (e.g., Arrival & City Exploration)",
      "plan": [
        {
          "time": "time slot (e.g., 9:00 AM - 12:00 PM)",
          "placeName": "Attraction/Place Name",
          "placeDetails": "detailed description of the place and activities",
          "placeImageUrl": "realistic place image URL",
          "geoCoordinates": "latitude, longitude",
          "ticketPricing": "entry fees or cost information",
          "rating": "rating out of 5",
          "duration": "recommended time to spend",
          "tips": "helpful tips for visitors"
        }
      ]
    }
  ],
  "localCuisine": [
    {
      "dishName": "Local dish name",
      "description": "description of the dish",
      "recommendedRestaurants": ["restaurant names"],
      "priceRange": "typical cost"
    }
  ],
  "transportation": {
    "gettingThere": "how to reach the destination",
    "localTransport": "local transportation options",
    "estimatedCosts": "transportation cost breakdown"
  },
  "budgetBreakdown": {
    "accommodation": "estimated cost",
    "food": "estimated cost",
    "transportation": "estimated cost",
    "activities": "estimated cost",
    "miscellaneous": "estimated cost",
    "total": "total estimated cost"
  },
  "packingList": ["essential items to pack"],
  "importantTips": ["important travel tips and local customs"],
  "emergencyContacts": {
    "police": "local emergency number",
    "medical": "medical emergency contacts",
    "embassy": "embassy contact if international travel"
  }
}

Make sure all recommendations are realistic, accurate, and tailored to the specified budget and traveler type. Include diverse options and consider local culture and customs.`;
  }

  async generateCustomRecommendations(query, context = {}) {
    try {
      const prompt = `Based on the following query and context, provide helpful travel recommendations in JSON format:
      
Query: ${query}
Context: ${JSON.stringify(context)}

Provide a structured JSON response with relevant recommendations, tips, and information.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Error generating custom recommendations:', error);
      throw new Error('Failed to generate recommendations. Please try again.');
    }
  }
}

export default new GeminiService();
