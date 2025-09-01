import { indianDestinations, searchIndianDestinations } from '../data/indianDestinations';
import comprehensivePlacesService from './comprehensivePlacesService';

class EnhancedAIService {
  constructor() {
    this.placesApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    this.placesBaseUrl = 'https://places.googleapis.com/v1';
  }

  // Enhanced trip generation with Google Places API integration
  async generateEnhancedTrip(userInput) {
    try {
      console.log('🤖 Generating enhanced trip for:', userInput);

      // Step 1: Parse user input to extract trip parameters
      const parsedData = this.parseUserInput(userInput);
      console.log('📝 Parsed data:', parsedData);

      // Step 2: Get real places data from comprehensive places service
      const placesData = await comprehensivePlacesService.getComprehensivePlacesData(
        parsedData.destination,
        parsedData.interests
      );
      console.log('🏛️ Real places data:', placesData);

      // Step 3: Generate AI itinerary with real data
      const enhancedPrompt = this.buildEnhancedPrompt(parsedData, placesData);
      console.log('📝 Enhanced prompt created');

      const result = await chatSession.sendMessage(enhancedPrompt);
      const aiResponse = result?.response?.text();
      console.log('🤖 AI response received');

      // Step 4: Parse and enhance the response
      const tripPlan = this.parseAndEnhanceResponse(aiResponse, parsedData, placesData);
      console.log('✅ Trip plan parsed and enhanced');

      return tripPlan;
    } catch (error) {
      console.error('❌ Enhanced AI generation failed:', error);
      throw new Error(`Failed to generate trip: ${error.message}`);
    }
  }

  // Parse user input to extract trip parameters
  parseUserInput(input) {
    const lowerInput = input.toLowerCase();

    // Extract destination using comprehensive database
    const destinations = searchIndianDestinations(input);
    const destination = destinations.length > 0 ? destinations[0] : this.extractDestinationFallback(input);

    // Extract duration
    const durationMatch = input.match(/(\d+)\s*days?/i);
    const duration = durationMatch ? parseInt(durationMatch[1]) : 3;

    // Extract travelers with enhanced patterns
    const travelerMatch = input.match(/(\d+)\s*(people|persons?|travelers?|adults?)/i) ||
                         input.match(/with\s*(\d+)/i) ||
                         input.match(/for\s*(\d+)/i);
    const travelers = travelerMatch ? parseInt(travelerMatch[1]) : 2;

    // Extract budget
    const budgetMatch = input.match(/₹\s*(\d+(?:,\d+)*)/i) ||
                       input.match(/budget.*?(\d+(?:,\d+)*)/i) ||
                       input.match(/(\d+(?:,\d+)*)\s*rupees?/i);
    const budget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : 15000;

    // Extract interests
    const interests = this.extractInterests(input);

    return {
      destination,
      duration,
      travelers,
      budget,
      interests,
      originalInput: input
    };
  }

  // Extract destination fallback for non-database matches
  extractDestinationFallback(input) {
    const cityPatterns = [
      'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad',
      'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur',
      'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri', 'patna',
      'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik', 'faridabad',
      'meerut', 'rajkot', 'kalyan', 'vasai', 'varanasi', 'srinagar',
      'aurangabad', 'dhanbad', 'amritsar', 'navi mumbai', 'allahabad',
      'ranchi', 'howrah', 'coimbatore', 'jabalpur', 'gwalior', 'vijayawada',
      'jodhpur', 'madurai', 'raipur', 'kota', 'guwahati', 'chandigarh',
      'solapur', 'hubli', 'tiruchirappalli', 'bareilly', 'mysore',
      'tiruppur', 'gurgaon', 'aligarh', 'jalandhar', 'bhubaneswar',
      'salem', 'warangal', 'mira', 'bhiwandi', 'saharanpur', 'gorakhpur',
      'bikaner', 'amravati', 'noida', 'jamshedpur', 'bhilai', 'cuttack',
      'firozabad', 'kochi', 'nellore', 'bhavnagar', 'dehradun', 'durgapur',
      'asansol', 'rourkela', 'nanded', 'kolhapur', 'ajmer', 'akola',
      'gulbarga', 'jamnagar', 'ujjain', 'loni', 'siliguri', 'jhansi',
      'ulhasnagar', 'jammu', 'sangli', 'mangalore', 'erode', 'belgaum',
      'ambattur', 'tirunelveli', 'malegaon', 'gaya', 'jalgaon', 'udaipur',
      'maheshtala', 'davanagere', 'kozhikode', 'kurnool', 'rajpur', 'rajahmundry',
      'bokaro', 'south dumdum', 'bellary', 'patiala', 'gopalpur', 'agartala',
      'bhagalpur', 'muzaffarnagar', 'bhatpara', 'panihati', 'latur',
      'dhule', 'rohtak', 'korba', 'bhilwara', 'berhampur', 'muzaffarpur',
      'ahmednagar', 'mathura', 'kollam', 'avadi', 'kadapa', 'kamarhati',
      'sambalpur', 'bilaspur', 'shahjahanpur', 'satara', 'bijapur',
      'rampur', 'shivamogga', 'chandrapur', 'junagadh', 'thrissur',
      'alwar', 'bardhaman', 'kulti', 'kakinada', 'nizamabad', 'parbhani',
      'tumkur', 'khammam', 'ozhukarai', 'bihar sharif', 'panipat',
      'darbhanga', 'bally', 'aizawl', 'dewas', 'ichalkaranji', 'karnal',
      'bathinda', 'jalna', 'eluru', 'kirari', 'baranagar', 'purnia',
      'satna', 'mau', 'sonipat', 'farrukhabad', 'sagar', 'rourkela',
      'durg', 'imphal', 'ratlam', 'hapur', 'arrah', 'anantapur',
      'karimnagar', 'etawah', 'ambernath', 'north dumdum', 'bharatpur',
      'begusarai', 'new delhi', 'gandhidham', 'baranagar', 'tiruvottiyur',
      'puducherry', 'sikar', 'thoothukudi', 'rewa', 'mirzapur',
      'raichur', 'pali', 'ramagundam', 'silchar', 'orai', 'nandyal',
      'morena', 'bhiwani', 'porbandar', 'palakkad', 'anand', 'purnia',
      'pondicherry', 'nuzvid', 'mahbubnagar'
    ];

    for (const city of cityPatterns) {
      if (input.toLowerCase().includes(city)) {
        const cityName = city.charAt(0).toUpperCase() + city.slice(1);
        return {
          name: `${cityName}, India`,
          label: `${cityName}, India`,
          location: { lat: 0, lng: 0 } // Will be geocoded later
        };
      }
    }

    // Default fallback
    return {
      name: 'India',
      label: 'India',
      location: { lat: 20.5937, lng: 78.9629 }
    };
  }

  // Extract interests and travel style from user input
  extractInterests(input) {
    const interestKeywords = {
      nature: ['nature', 'forest', 'waterfall', 'mountain', 'hill', 'trek', 'wildlife'],
      culture: ['culture', 'heritage', 'temple', 'fort', 'palace', 'museum', 'art'],
      adventure: ['adventure', 'sports', 'rafting', 'climbing', 'hiking', 'paragliding'],
      food: ['food', 'cuisine', 'restaurant', 'street food', 'local food'],
      spiritual: ['spiritual', 'temple', 'ashram', 'meditation', 'yoga', 'pilgrimage'],
      beach: ['beach', 'sea', 'ocean', 'water sports', 'swimming'],
      shopping: ['shopping', 'market', 'mall', 'handicraft', 'souvenir']
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

  // Build enhanced prompt with comprehensive context
  buildEnhancedPrompt(parsedData, placesData = null) {
    const { destination, duration, travelers, budget, interests } = parsedData;

    // Format real places data for context if available
    let placesContext = '';
    if (placesData && placesData.attractions.length > 0) {
      placesContext = `
REAL PLACES DATA AVAILABLE:
- Attractions: ${placesData.attractions.slice(0, 3).map(p => p.name).join(', ')}
- Restaurants: ${placesData.restaurants.slice(0, 3).map(p => p.name).join(', ')}
- Hotels: ${placesData.hotels.slice(0, 3).map(p => p.name).join(', ')}
`;
    }

    return `Generate a comprehensive travel plan for ${destination.name} for ${duration} days for ${travelers} people with a budget of ₹${budget.toLocaleString()} (Indian Rupees).

DESTINATION CONTEXT:
- Location: ${destination.name}
- State: ${destination.state || 'India'}
- Category: ${destination.category || 'General'}
- Best Time: ${destination.bestTime || 'Year-round'}
${placesContext}
USER INTERESTS: ${interests.join(', ')}

REQUIREMENTS:
- Use INDIAN RUPEES (₹) for ALL prices
- Create realistic Indian pricing
- Include ${travelers} travelers in all calculations
- Focus on ${interests.join(' and ')} activities
- Provide day-wise detailed itinerary
- Include authentic local experiences

Generate a detailed JSON response with this exact structure:
{
  "tripSummary": {
    "destination": "${destination.name}",
    "duration": ${duration},
    "travelers": "${travelers} people",
    "budget": "₹${budget.toLocaleString()}",
    "currency": "INR",
    "totalEstimatedCost": "₹${budget}"
  },
  "hotels": [
    {
      "hotelName": "Hotel Name",
      "hotelAddress": "Complete Address",
      "price": "₹X,XXX per night",
      "hotelImageUrl": "https://example.com/image.jpg",
      "geoCoordinates": {"lat": 0.0, "lng": 0.0},
      "rating": 4.5,
      "description": "Hotel description"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "theme": "Day theme",
      "activities": [
        {
          "placeName": "Place Name",
          "placeDetails": "Detailed description",
          "placeImageUrl": "https://example.com/image.jpg",
          "geoCoordinates": {"lat": 0.0, "lng": 0.0},
          "ticketPricing": "₹XXX per person",
          "rating": 4.5,
          "timeToTravel": "30 minutes",
          "bestTimeToVisit": "Morning/Afternoon/Evening"
        }
      ]
    }
  ]
}

Make it authentic to ${destination.name} with local experiences and realistic Indian pricing.`;
  }

  // Parse and enhance AI response
  parseAndEnhanceResponse(aiResponse, parsedData, placesData) {
    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const tripPlan = JSON.parse(jsonMatch[0]);

      // Add metadata
      tripPlan.metadata = {
        generatedAt: new Date().toISOString(),
        enhancedWithRealData: !!placesData,
        userInput: parsedData.originalInput,
        destination: parsedData.destination
      };

      return tripPlan;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }
}

export default new EnhancedAIService();
