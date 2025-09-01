import { chatSession } from '../service/AIModal';
import { searchIndianDestinations } from '../data/indianDestinations';
import BackendApiService from '../service/BackendApi';

class WorkingAIService {
  // Simple, reliable trip generation
  async generateTrip(userInput) {
    try {
      console.log('🤖 Generating trip for:', userInput);

      // Parse user input
      const parsedData = this.parseUserInput(userInput);
      console.log('📝 Parsed data:', parsedData);

      // Try backend first (which now uses real AI)
      try {
        console.log('🎯 Using backend with real AI...');
        const backendResult = await BackendApiService.generateTrip({
          destination: parsedData.destination.name,
          duration: parsedData.duration,
          travelers: parsedData.travelers,
          budget: parsedData.budget,
          interests: parsedData.interests
        });

        if (backendResult && backendResult.tripSummary) {
          console.log('✅ Backend AI trip generation successful');
          return backendResult;
        }
      } catch (backendError) {
        console.warn('⚠️ Backend AI failed, using direct AI:', backendError.message);
      }

      // Build prompt for AI fallback
      const prompt = this.buildPrompt(parsedData);
      console.log('📝 Using AI fallback with prompt');

      // Try direct AI as backup
      try {
        console.log('🤖 Using direct Gemini AI...');
        const result = await chatSession.sendMessage(prompt);
        const aiResponse = result?.response?.text();

        if (aiResponse) {
          console.log('✅ Direct AI response received');
          return this.parseAIResponse(aiResponse, parsedData);
        }
      } catch (aiError) {
        console.warn('⚠️ Direct AI also failed, using fallback:', aiError.message);
      }

      // Final fallback
      console.log('🔄 Using enhanced local generation as final fallback');
      const aiResponse = this.generateFallbackResponse(parsedData);

      // Parse response
      const tripPlan = this.parseResponse(aiResponse, parsedData);
      console.log('✅ Trip plan generated successfully');

      return tripPlan;
    } catch (error) {
      console.error('❌ AI generation failed:', error);
      throw new Error(`Failed to generate trip: ${error.message}`);
    }
  }

  // Parse user input to extract trip parameters
  parseUserInput(input) {
    const lowerInput = input.toLowerCase();

    // Extract destination with better parsing
    console.log('🔍 Parsing input for destination:', input);

    // Try to find destination in the input
    let destinations = [];

    // Split input into words and check each combination
    const words = input.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      // Check single words
      const singleWord = words[i].replace(/[^\w]/g, '');
      const singleResults = searchIndianDestinations(singleWord);
      if (singleResults.length > 0) {
        destinations.push(...singleResults);
      }

      // Check two-word combinations
      if (i < words.length - 1) {
        const twoWords = `${words[i]} ${words[i + 1]}`.replace(/[^\w\s]/g, '');
        const twoWordResults = searchIndianDestinations(twoWords);
        if (twoWordResults.length > 0) {
          destinations.push(...twoWordResults);
        }
      }
    }

    // Remove duplicates and get the best match
    const uniqueDestinations = destinations.filter((dest, index, self) =>
      index === self.findIndex(d => d.name === dest.name)
    );

    const destination = uniqueDestinations.length > 0 ? uniqueDestinations[0] : this.extractDestinationFallback(input);

    console.log('✅ Found destination:', destination.name);
    console.log('🔍 All found destinations:', uniqueDestinations.map(d => d.name));

    // Extract duration
    const durationMatch = input.match(/(\d+)\s*days?/i);
    const duration = durationMatch ? parseInt(durationMatch[1]) : 3;

    // Extract travelers
    const travelerMatch = input.match(/(\d+)\s*(people|persons?|travelers?|adults?)/i) ||
                         input.match(/with\s*(\d+)/i) ||
                         input.match(/for\s*(\d+)/i) ||
                         input.match(/family\s*of\s*(\d+)/i);
    const travelers = travelerMatch ? parseInt(travelerMatch[1]) : 
                     lowerInput.includes('family') ? 4 :
                     lowerInput.includes('couple') ? 2 : 2;

    // Extract budget
    const budgetMatch = input.match(/₹\s*(\d+(?:,\d+)*)/i) ||
                       input.match(/budget.*?(\d+(?:,\d+)*)/i) ||
                       input.match(/(\d+(?:,\d+)*)\s*rupees?/i);
    const budget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : 15000;

    // Extract interests
    const interests = this.extractInterests(input);

    return {
      destination: {
        name: destination.name,
        label: destination.name,
        location: destination.location,
        state: destination.state,
        category: destination.category
      },
      duration,
      travelers,
      budget,
      interests,
      originalInput: input
    };
  }

  // Extract destination with fallback
  extractDestinationFallback(input) {
    const commonCities = [
      'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad',
      'pune', 'ahmedabad', 'jaipur', 'agra', 'varanasi', 'goa', 'kerala',
      'rajasthan', 'ranchi', 'jharkhand', 'digha', 'vizag', 'visakhapatnam',
      'bhubaneswar', 'puri', 'darjeeling', 'manali', 'shimla', 'rishikesh'
    ];

    for (const city of commonCities) {
      if (input.toLowerCase().includes(city)) {
        const cityName = city.charAt(0).toUpperCase() + city.slice(1);
        return {
          name: `${cityName}, India`,
          location: { lat: 20.5937, lng: 78.9629 },
          state: 'India',
          category: 'General'
        };
      }
    }

    return {
      name: 'India',
      location: { lat: 20.5937, lng: 78.9629 },
      state: 'India',
      category: 'General'
    };
  }

  // Extract interests
  extractInterests(input) {
    const interestKeywords = {
      nature: ['nature', 'forest', 'waterfall', 'mountain', 'hill', 'trek'],
      culture: ['culture', 'heritage', 'temple', 'fort', 'palace', 'museum'],
      adventure: ['adventure', 'sports', 'rafting', 'climbing', 'hiking'],
      food: ['food', 'cuisine', 'restaurant', 'street food'],
      spiritual: ['spiritual', 'temple', 'ashram', 'meditation', 'yoga'],
      beach: ['beach', 'sea', 'ocean', 'water sports'],
      shopping: ['shopping', 'market', 'mall', 'handicraft']
    };

    const foundInterests = [];
    const lowerInput = input.toLowerCase();

    Object.entries(interestKeywords).forEach(([interest, keywords]) => {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        foundInterests.push(interest);
      }
    });

    return foundInterests.length > 0 ? foundInterests : ['sightseeing'];
  }

  // Build simple but effective prompt
  buildPrompt(parsedData) {
    const { destination, duration, travelers, budget, interests } = parsedData;

    return `Generate a comprehensive travel plan for ${destination.name} for ${duration} days for ${travelers} people with a budget of ₹${budget.toLocaleString()} (Indian Rupees).

IMPORTANT: The destination is SPECIFICALLY ${destination.name}. Do NOT suggest any other destination.

DESTINATION: ${destination.name}
DURATION: ${duration} days
TRAVELERS: ${travelers} people
BUDGET: ₹${budget.toLocaleString()} (Indian Rupees)
INTERESTS: ${interests.join(', ')}

REQUIREMENTS:
- MUST plan for ${destination.name} ONLY - do not suggest alternative destinations
- Use INDIAN RUPEES (₹) for ALL prices
- Create realistic Indian pricing
- Plan for exactly ${travelers} travelers
- Focus on ${interests.join(' and ')} activities
- Provide detailed day-wise itinerary
- All hotels and activities must be in or near ${destination.name}

Generate a JSON response with this structure:
{
  "tripSummary": {
    "destination": "${destination.name}",
    "duration": ${duration},
    "travelers": "${travelers} people",
    "budget": "₹${budget.toLocaleString()}",
    "currency": "INR",
    "totalEstimatedCost": "₹${Math.floor(budget * 0.9)}"
  },
  "hotels": [
    {
      "hotelName": "Hotel Name",
      "hotelAddress": "Address in ${destination.name}",
      "price": "₹X,XXX per night",
      "hotelImageUrl": "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
      "geoCoordinates": {"lat": ${destination.location.lat}, "lng": ${destination.location.lng}},
      "rating": 4.2,
      "description": "Hotel description"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "theme": "Day theme",
      "activities": [
        {
          "placeName": "Place in ${destination.name}",
          "placeDetails": "Detailed description",
          "placeImageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
          "geoCoordinates": {"lat": ${destination.location.lat}, "lng": ${destination.location.lng}},
          "ticketPricing": "₹XXX per person",
          "rating": 4.5,
          "timeToTravel": "30 minutes",
          "bestTimeToVisit": "Morning"
        }
      ]
    }
  ]
}`;
  }

  // Parse AI response
  parseResponse(aiResponse, parsedData) {
    try {
      console.log('📝 Parsing AI response...');
      
      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response:', aiResponse);
        throw new Error('No valid JSON found in AI response');
      }

      const tripPlan = JSON.parse(jsonMatch[0]);

      // Add metadata
      tripPlan.metadata = {
        generatedAt: new Date().toISOString(),
        userInput: parsedData.originalInput,
        destination: parsedData.destination,
        serviceUsed: 'workingAIService'
      };

      console.log('✅ Trip plan parsed successfully');
      return tripPlan;
    } catch (error) {
      console.error('❌ Error parsing AI response:', error);
      console.log('Raw response:', aiResponse);
      throw new Error('Failed to parse AI response: ' + error.message);
    }
  }

  // Generate fallback response when AI fails
  generateFallbackResponse(parsedData) {
    const { destination, duration, travelers, budget } = parsedData;

    console.log('🔄 Generating fallback response for:', destination.name);

    // Create a realistic fallback trip plan
    const fallbackPlan = {
      "tripSummary": {
        "destination": destination.name,
        "duration": duration,
        "travelers": `${travelers} people`,
        "budget": `₹${budget.toLocaleString()}`,
        "currency": "INR",
        "totalEstimatedCost": `₹${Math.floor(budget * 0.9)}`
      },
      "hotels": [
        {
          "hotelName": `Heritage Hotel ${destination.name}`,
          "hotelAddress": `Central ${destination.name}`,
          "price": `₹${Math.floor(budget / duration / 2)} per night`,
          "hotelImageUrl": "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
          "geoCoordinates": destination.location,
          "rating": 4.2,
          "description": "Comfortable accommodation with modern amenities"
        }
      ],
      "itinerary": []
    };

    // Generate itinerary for each day
    for (let day = 1; day <= duration; day++) {
      fallbackPlan.itinerary.push({
        "day": day,
        "theme": day === 1 ? "Arrival & Local Exploration" :
                day === duration ? "Departure & Shopping" :
                `${destination.name} Highlights`,
        "activities": [
          {
            "placeName": `Popular Attraction ${day} in ${destination.name}`,
            "placeDetails": "Must-visit local attraction with cultural significance",
            "placeImageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            "geoCoordinates": destination.location,
            "ticketPricing": "₹200 per person",
            "rating": 4.5,
            "timeToTravel": "30 minutes",
            "bestTimeToVisit": "Morning"
          },
          {
            "placeName": `Local Restaurant ${day}`,
            "placeDetails": "Authentic local cuisine experience",
            "placeImageUrl": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
            "geoCoordinates": destination.location,
            "ticketPricing": "₹500 per person",
            "rating": 4.3,
            "timeToTravel": "15 minutes",
            "bestTimeToVisit": "Afternoon"
          }
        ]
      });
    }

    return JSON.stringify(fallbackPlan);
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
          source: 'gemini-ai-direct',
          version: '1.0.0',
          originalRequest: originalData
        }
      };
    } catch (error) {
      console.error('❌ Error parsing AI response:', error);
      console.log('Raw AI response:', text);

      // Return fallback if parsing fails
      return this.generateFallbackResponse(originalData);
    }
  }
}

export default new WorkingAIService();
