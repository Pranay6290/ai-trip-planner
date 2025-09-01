import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { getDestinationAttractions, getRandomAttractions } from '../data/indianTouristSpots.js';

dotenv.config();

class AIService {
  constructor() {
    this.apiKey = process.env.GOOGLE_GEMINI_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!this.apiKey) {
      console.error('❌ Gemini AI API key not found in environment variables');
      throw new Error('Gemini AI API key is required');
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Add caching for AI responses
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes cache
    this.maxCacheSize = 100; // Maximum cached responses

    console.log('✅ Gemini AI Service initialized with key:', this.apiKey.substring(0, 10) + '...');
  }

  // Cache management methods
  getCacheKey(tripData) {
    const { destination, duration, travelers, budget, interests } = tripData;
    return `trip_${destination}_${duration}_${travelers}_${budget}_${JSON.stringify(interests || [])}`;
  }

  getCachedResponse(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('✅ Using cached AI response');
      return cached.data;
    }
    return null;
  }

  setCachedResponse(key, data) {
    // Implement LRU cache behavior
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Generate trip itinerary using Gemini AI
  async generateTrip(tripData) {
    try {
      const { destination, duration, travelers, budget, interests } = tripData;

      // Check cache first
      const cacheKey = this.getCacheKey(tripData);
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }

      console.log('🤖 Generating trip with Gemini AI:', { destination, duration, travelers, budget });

      const prompt = this.buildTripPrompt(destination, duration, travelers, budget, interests);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Gemini AI response received');

      // Parse the AI response into structured format
      const parsedTrip = this.parseAIResponse(text, tripData);

      // Cache the response
      this.setCachedResponse(cacheKey, parsedTrip);

      return parsedTrip;
    } catch (error) {
      console.error('❌ Error generating trip with AI:', error);
      
      // Return structured fallback if AI fails
      return this.generateFallbackTrip(tripData);
    }
  }

  // Build comprehensive trip generation prompt
  buildTripPrompt(destination, duration, travelers, budget, interests = []) {
    // Get real tourist attractions from database
    const destinationData = getDestinationAttractions(destination);
    const placeExamples = this.getDestinationExamples(destination);
    const cityTemplate = this.getCityTemplate(destination, duration);

    // Get specific attractions for this destination
    let specificAttractions = '';
    let specificRestaurants = '';

    if (destinationData) {
      // Get random attractions to ensure variety
      const selectedAttractions = getRandomAttractions(destinationData.attractions, duration * 4);
      specificAttractions = selectedAttractions.map(attr =>
        `${attr.name} (${attr.type}) - ${attr.description} [Entry: ${attr.entry}, Timing: ${attr.timing}]`
      ).join('\n');

      specificRestaurants = destinationData.restaurants.map(rest =>
        `${rest.name} (${rest.cuisine}) - ${rest.mustTry} [Cost: ${rest.cost}]`
      ).join('\n');
    }

    return `
You are an expert Indian travel planner with 15+ years of experience. Create a DETAILED, POLISHED, and USER-ATTRACTIVE ${duration}-day trip itinerary for ${destination} for ${travelers} people with a budget of ₹${budget}.

CRITICAL REQUIREMENTS FOR PROFESSIONAL ITINERARY:
1. Each day must have COMPLETELY DIFFERENT places - NO REPETITION across days
2. Include SPECIFIC timings (Morning 9:00 AM, Afternoon 2:00 PM, Evening 6:00 PM)
3. Add EXACT place names with brief descriptions in parentheses
4. Include SPECIFIC restaurant/café recommendations for meals
5. Provide PRACTICAL information: entry fees, travel time, best photo spots
6. Each day should have a UNIQUE THEME with 4-6 activities
7. Include BUDGET BREAKDOWN at the end
8. Add INSIDER TIPS and LOCAL EXPERIENCES

FORMAT REQUIREMENTS:
- Use attractive headings: "Day 1: Heritage & Sea Views"
- Structure: Morning → Lunch → Afternoon → Evening
- Include specific restaurant names and famous local dishes
- Add practical details: "UNESCO site, 1-2 hrs exploration"
- Provide cost estimates for activities and meals
- Include transport suggestions between places

DETAILED REQUIREMENTS FOR PROFESSIONAL ITINERARY:

🏛️ PLACE SELECTION - USE THESE SPECIFIC ATTRACTIONS:
${specificAttractions ? `
MUST-VISIT ATTRACTIONS FOR ${destination.toUpperCase()}:
${specificAttractions}

RECOMMENDED RESTAURANTS:
${specificRestaurants}

CRITICAL: Use ONLY these real places, NOT generic descriptions like "heritage site" or "cultural center"
` : `- Use REAL, SPECIFIC places (not generic "cultural center" or "heritage site")
- Include FAMOUS landmarks: ${placeExamples}`}
- Mix ICONIC attractions with HIDDEN GEMS
- Each day visits COMPLETELY DIFFERENT locations from the list above
- Include specific restaurants from the recommended list

⏰ TIMING & STRUCTURE:
- Morning (9:00-12:00): Start with main attraction
- Lunch (12:00-2:00): Specific restaurant with local cuisine
- Afternoon (2:00-6:00): 2-3 activities/places
- Evening (6:00-9:00): Sunset spots, markets, or cultural experiences

💰 BUDGET BREAKDOWN:
- Provide cost estimates for each activity
- Include transport costs between places
- Mention entry fees for attractions
- Food costs for recommended restaurants
- Total daily budget breakdown

🎯 EXPERIENCE QUALITY:
- Add WHY each place is worth visiting
- Include BEST PHOTO SPOTS
- Mention OPTIMAL VISITING TIMES
- Add INSIDER TIPS and local secrets
- Include CULTURAL CONTEXT for heritage sites

🚗 PRACTICAL INFORMATION:
- Travel time between locations
- Best transport mode (Metro/Uber/Walking)
- Booking requirements for attractions
- Crowd levels and best visiting hours

Interests: ${interests.join(', ') || 'General sightseeing'}

Please provide the response in the following JSON format:
{
  "tripSummary": {
    "destination": "${destination}",
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
      "theme": "Heritage & Sea Views",
      "morning": {
        "time": "9:00 AM - 12:00 PM",
        "activities": [
          {
            "placeName": "Gateway of India",
            "placeDetails": "Iconic photo spot and historic monument",
            "placeImageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            "geoCoordinates": {"lat": 18.9220, "lng": 72.8347},
            "ticketPricing": "Free entry",
            "rating": 4.5,
            "timeToTravel": "30 mins from hotel",
            "bestTimeToVisit": "Early morning for fewer crowds",
            "insiderTip": "Best photo spot is from the steps facing the sea"
          },
          {
            "placeName": "Elephanta Caves Ferry",
            "placeDetails": "UNESCO World Heritage site, ancient rock-cut temples",
            "geoCoordinates": {"lat": 18.9633, "lng": 72.9315},
            "ticketPricing": "₹40 ferry + ₹40 entry",
            "duration": "1-2 hours exploration",
            "insiderTip": "Take the 9:30 AM ferry to avoid crowds"
          }
        ]
      },
      "lunch": {
        "time": "12:30 PM - 2:00 PM",
        "restaurant": {
          "name": "Leopold Café",
          "cuisine": "Continental & Indian",
          "location": "Colaba Causeway",
          "averageCost": "₹800 for 2 people",
          "mustTry": "Chicken Tikka, Fish & Chips",
          "geoCoordinates": {"lat": 18.9067, "lng": 72.8311}
        }
      },
      "afternoon": {
        "time": "2:00 PM - 6:00 PM",
        "activities": [
          {
            "placeName": "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya",
            "placeDetails": "Premier art and history museum, former Prince of Wales Museum",
            "ticketPricing": "₹70 per person",
            "duration": "1.5-2 hours",
            "geoCoordinates": {"lat": 18.9269, "lng": 72.8324}
          },
          {
            "placeName": "Colaba Causeway Market",
            "placeDetails": "Famous street shopping destination",
            "ticketPricing": "Free entry",
            "bestFor": "Souvenirs, clothes, accessories",
            "geoCoordinates": {"lat": 18.9067, "lng": 72.8311}
          }
        ]
      },
      "evening": {
        "time": "6:00 PM - 9:00 PM",
        "activities": [
          {
            "placeName": "Marine Drive",
            "placeDetails": "Queen's Necklace - perfect for sunset views",
            "ticketPricing": "Free",
            "bestTime": "Sunset (6:30-7:30 PM)",
            "geoCoordinates": {"lat": 18.9434, "lng": 72.8234}
          },
          {
            "placeName": "Chowpatty Beach",
            "placeDetails": "Street food paradise",
            "mustTry": "Pav Bhaji (₹60), Bhel Puri (₹40), Kulfi (₹30)",
            "averageCost": "₹300 for 2 people",
            "geoCoordinates": {"lat": 18.9547, "lng": 72.8081}
          }
        ]
      }
    }
  ],
  "budgetBreakdown": {
    "totalBudget": "₹${budget}",
    "dailyBreakdown": {
      "food": "₹1,500-2,000 per day (for 2 people, mid-range dining)",
      "transport": "₹600-1,000 per day (Uber/Auto/Metro)",
      "activities": "₹800-1,200 per day (entry fees & experiences)",
      "shopping": "₹1,000-2,000 per day (optional)"
    },
    "totalEstimated": "₹10,000-13,000 (excluding accommodation)",
    "budgetTips": [
      "Use Mumbai Metro for cost-effective transport",
      "Try street food for authentic & budget-friendly meals",
      "Book attraction tickets online for discounts",
      "Carry cash for street vendors and local transport"
    ]
  },
  "travelTips": {
    "transportation": [
      "Download Mumbai Metro app for easy navigation",
      "Use Uber/Ola for comfortable rides between distant locations",
      "Local trains are fastest but crowded during peak hours (8-11 AM, 6-9 PM)"
    ],
    "food": [
      "Try street food at famous spots like Mohammed Ali Road, Khau Galli",
      "Carry hand sanitizer when eating street food",
      "Don't miss Mumbai's famous vada pav and cutting chai"
    ],
    "general": [
      "Carry cash as many local vendors don't accept cards",
      "Monsoon season (June-September) can disrupt outdoor plans",
      "Book popular restaurants in advance, especially on weekends",
      "Dress modestly when visiting religious places"
    ],
    "photography": [
      "Golden hour (6-7 AM, 6-7 PM) is best for outdoor photography",
      "Marine Drive looks stunning during blue hour",
      "Get permission before photographing people, especially at religious sites"
    ]
  },
  "localExperiences": [
    "Take a heritage walk through Fort district",
    "Experience Mumbai's famous dabbawalas (lunch delivery system)",
    "Watch sunset from Worli Sea Face",
    "Try authentic Maharashtrian thali at local restaurants"
  ]
}

FINAL INSTRUCTIONS - CRITICAL FOR QUALITY:
1. NEVER use generic terms like "heritage site", "cultural center", "local market" - use EXACT place names from the list above
2. If specific attractions are provided, use ONLY those places - do not invent new ones
3. Make sure all prices are in Indian Rupees and realistic for the destination and budget provided
4. Include SPECIFIC restaurant names from the recommended list
5. Provide EXACT coordinates for all major attractions (use the coordinates provided in the attraction list)
6. Add PRACTICAL details like opening hours, entry fees, travel time from the attraction data
7. Create a POLISHED, PROFESSIONAL itinerary that looks attractive to users
8. Each day should visit COMPLETELY DIFFERENT places from the attraction list
9. Structure should be: Morning → Lunch → Afternoon → Evening for each day
10. Add INSIDER TIPS and local experiences

QUALITY CHECK: Before generating, ensure you're using REAL place names like "Gateway of India", "Victoria Memorial", "Lalbagh Garden" - NOT generic terms!

EXAMPLE QUALITY: Your itinerary should be as detailed and attractive as professional travel guides, with specific timings, costs, and practical information that makes travelers excited to visit!

${cityTemplate ? `REFERENCE TEMPLATE FOR QUALITY:\n${cityTemplate}` : ''}

Use this template as a reference for the level of detail and structure expected. Adapt it for your specific destination while maintaining the same quality and format.
`;
  }

  // Get destination-specific place examples
  getDestinationExamples(destination) {
    const destinationLower = destination.toLowerCase();

    const examples = {
      'mumbai': 'Gateway of India (iconic monument), Marine Drive (Queen\'s Necklace), Chhatrapati Shivaji Terminus (heritage railway station), Elephanta Caves (UNESCO site), Juhu Beach (Bollywood celebrity homes), Haji Ali Dargah (mosque in sea), Siddhivinayak Temple (famous Ganesh temple), Crawford Market (historic market), Bandra-Worli Sea Link (engineering marvel), Film City (Bollywood studios), Colaba Causeway (shopping street), Hanging Gardens (Malabar Hill), Leopold Café (historic café), Chowpatty Beach (street food), Dhobi Ghat (world\'s largest laundry)',
      'delhi': 'Red Fort, India Gate, Qutub Minar, Lotus Temple, Humayun\'s Tomb, Jama Masjid, Chandni Chowk, Akshardham Temple, Raj Ghat, Connaught Place, Lodi Gardens, National Museum, Purana Qila, Jantar Mantar, Hauz Khas Village',
      'kolkata': 'Victoria Memorial, Howrah Bridge, Dakshineswar Temple, Park Street, Kalighat Temple, Indian Museum, Fort William, College Street, Kumartuli Potter\'s Quarter, Belur Math, Marble Palace, New Market, St. Paul\'s Cathedral, Tagore House, Academy of Fine Arts',
      'bangalore': 'Bangalore Palace, Lalbagh Botanical Garden, Cubbon Park, ISKCON Temple, Bull Temple, Tipu Sultan\'s Summer Palace, UB City Mall, MG Road, Brigade Road, Vidhana Soudha, KR Market, Church Street, Ulsoor Lake, Bannerghatta National Park',
      'ranchi': 'Hundru Falls, Rock Garden, Jagannath Temple, Birsa Zoological Park, Jonha Falls, Dassam Falls, Kanke Dam, Tagore Hill, Pahari Mandir, Nakshatra Van, Ranchi Lake, Tribal Research Institute',
      'jamshedpur': 'Jubilee Park, Tata Steel Zoological Park, Dimna Lake, Bhuvaneshwari Temple, JRD Tata Sports Complex, Dalma Wildlife Sanctuary, Sir Dorabji Tata Park, Keenan Stadium, Russi Modi Centre',
      'bhubaneswar': 'Lingaraj Temple, Khandagiri Caves, Udayagiri Caves, Nandankanan Zoo, Mukteshwar Temple, Rajarani Temple, Dhauli Peace Pagoda, Odisha State Museum, Ekamra Kanan, Tribal Museum',
      'guwahati': 'Kamakhya Temple, Umananda Temple, Brahmaputra River Cruise, Assam State Museum, Navagraha Temple, Basistha Ashram, Pobitora Wildlife Sanctuary, Deepor Beel, Fancy Bazaar',
      'goa': 'Baga Beach, Basilica of Bom Jesus, Fort Aguada, Dudhsagar Falls, Anjuna Beach, Calangute Beach, Se Cathedral, Chapora Fort, Spice Plantations, Old Goa Churches',
      'kerala': 'Alleppey Backwaters, Munnar Tea Gardens, Fort Kochi, Periyar Wildlife Sanctuary, Kumarakom, Thekkady, Chinese Fishing Nets, Mattancherry Palace, Hill Palace Museum',
      'rajasthan': 'Hawa Mahal, City Palace, Amber Fort, Lake Pichola, Mehrangarh Fort, Jaisalmer Fort, Pushkar Lake, Ranthambore National Park, Chittorgarh Fort',
      'agra': 'Taj Mahal, Agra Fort, Mehtab Bagh, Itmad-ud-Daulah, Fatehpur Sikri, Akbar\'s Tomb, Jama Masjid Agra, Chini Ka Rauza, Ram Bagh',
      'jaipur': 'Hawa Mahal, City Palace, Amber Fort, Jantar Mantar, Nahargarh Fort, Jaigarh Fort, Albert Hall Museum, Birla Mandir, Galtaji Temple',
      'varanasi': 'Dashashwamedh Ghat, Kashi Vishwanath Temple, Sarnath, Manikarnika Ghat, Assi Ghat, Ramnagar Fort',
      'udaipur': 'City Palace, Lake Pichola, Jagdish Temple, Saheliyon Ki Bari, Jag Mandir, Fateh Sagar Lake',
      'digha': 'Digha Beach, Marine Aquarium, Amarabati Park, Shankarpur Beach',
      'darjeeling': 'Tiger Hill, Darjeeling Himalayan Railway, Peace Pagoda, Batasia Loop, Happy Valley Tea Estate',
      'manali': 'Rohtang Pass, Solang Valley, Hadimba Temple, Vashisht Hot Springs, Old Manali, Manu Temple',
      'shimla': 'Mall Road, Christ Church, Jakhu Temple, Kufri, Summer Hill, The Ridge',
      'goa': 'Baga Beach, Basilica of Bom Jesus, Fort Aguada, Dudhsagar Falls, Anjuna Beach, Calangute Beach',
      'kerala': 'Alleppey Backwaters, Munnar Tea Gardens, Fort Kochi, Periyar Wildlife Sanctuary, Kumarakom',
      'rajasthan': 'Hawa Mahal, City Palace, Amber Fort, Lake Pichola, Mehrangarh Fort, Jaisalmer Fort',
      'himachal': 'Rohtang Pass, Solang Valley, Hadimba Temple, Mall Road Shimla, Kufri, Manali',
      'uttarakhand': 'Kedarnath Temple, Badrinath Temple, Valley of Flowers, Rishikesh, Haridwar, Nainital',
      'kashmir': 'Dal Lake, Gulmarg, Pahalgam, Sonamarg, Shalimar Bagh, Nishat Bagh',
      'ladakh': 'Leh Palace, Pangong Lake, Nubra Valley, Magnetic Hill, Thiksey Monastery',
      'andaman': 'Radhanagar Beach, Cellular Jail, Ross Island, Neil Island, Baratang Island',
      'tamil_nadu': 'Meenakshi Temple, Marina Beach, Mahabalipuram, Ooty, Kodaikanal, Thanjavur',
      'karnataka': 'Mysore Palace, Hampi, Coorg, Chikmagalur, Badami Caves, Gokarna',
      'andhra_pradesh': 'Tirupati Temple, Charminar, Golconda Fort, Araku Valley, Borra Caves',
      'odisha': 'Jagannath Temple Puri, Konark Sun Temple, Chilika Lake, Lingaraj Temple, Khandagiri Caves',
      'bihar': 'Mahabodhi Temple, Nalanda University, Rajgir, Pawapuri, Vikramshila University',
      'chhattisgarh': 'Chitrakote Falls, Tirathgarh Falls, Kanger Valley National Park, Bastar Palace',
      'madhya_pradesh': 'Khajuraho Temples, Sanchi Stupa, Kanha National Park, Pachmarhi, Ujjain',
      'gujarat': 'Statue of Unity, Rann of Kutch, Gir National Park, Dwarka, Somnath Temple',
      'punjab': 'Golden Temple, Jallianwala Bagh, Wagah Border, Anandpur Sahib, Patiala Palace'
    };

    // Check for partial matches
    for (const [key, value] of Object.entries(examples)) {
      if (destinationLower.includes(key) || key.includes(destinationLower)) {
        return value;
      }
    }

    return 'famous local attractions, temples, markets, and cultural sites';
  }

  // Get city-specific itinerary templates for better quality
  getCityTemplate(destination, duration) {
    const destinationLower = destination.toLowerCase();

    if (destinationLower.includes('mumbai') && duration >= 3) {
      return `
MUMBAI 3-DAY TEMPLATE (Use as reference for structure and quality):

Day 1: Heritage & Sea Views
Morning: Gateway of India → Elephanta Caves ferry
Lunch: Leopold Café (Continental & Indian, ₹800 for 2)
Afternoon: Chhatrapati Shivaji Museum → Colaba Causeway shopping
Evening: Marine Drive sunset → Chowpatty Beach street food

Day 2: Culture & Temples
Morning: Siddhivinayak Temple → Haji Ali Dargah
Lunch: Aaswad (Maharashtrian thali, ₹600 for 2)
Afternoon: CST heritage station → Kala Ghoda Art District
Evening: Bandra-Worli Sea Link → Bandra Bandstand

Day 3: Modern Mumbai & Local Life
Morning: Dhobi Ghat → Juhu Beach
Lunch: Sea Lounge, Taj (₹2000 for 2) or Juhu street food (₹400 for 2)
Afternoon: Film City tour OR Phoenix Mall shopping
Evening: Worli Sea Face → Rooftop dining

Budget: ₹10,000-13,000 for 2 people (excluding hotel)
`;
    }

    return '';
  }

  // Parse AI response into structured format
  parseAIResponse(text, originalData) {
    try {
      // Clean the response text - handle markdown and extra content
      let cleanedText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();

      // Extract JSON from the response if there's extra text
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(cleanedText);
      
      // Validate and enhance the parsed data
      return {
        id: `ai_trip_${Date.now()}`,
        ...parsed,
        metadata: {
          generatedAt: new Date().toISOString(),
          source: 'gemini-ai',
          version: '1.0.0',
          originalRequest: originalData
        }
      };
    } catch (error) {
      console.error('❌ Error parsing AI response:', error);
      console.log('Raw AI response:', text);
      
      // Return fallback if parsing fails
      return this.generateFallbackTrip(originalData);
    }
  }

  // Generate fallback trip when AI fails
  generateFallbackTrip(tripData) {
    const { destination, duration = 3, travelers = 2, budget = 15000 } = tripData;
    const dailyBudget = Math.floor(budget / duration);
    
    return {
      id: `fallback_trip_${Date.now()}`,
      tripSummary: {
        destination: destination,
        duration: duration,
        travelers: `${travelers} people`,
        budget: `₹${budget.toLocaleString()}`,
        currency: 'INR',
        totalEstimatedCost: `₹${Math.floor(budget * 0.9).toLocaleString()}`,
        bestTime: 'Year-round',
        highlights: ['Local attractions', 'Cultural experiences', 'Local cuisine']
      },
      hotels: [
        {
          hotelName: `Heritage Hotel ${destination}`,
          hotelAddress: `Central ${destination}`,
          price: `₹${Math.floor(dailyBudget * 0.4)} per night`,
          hotelImageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
          geoCoordinates: { lat: 20.5937, lng: 78.9629 },
          rating: 4.2,
          description: 'Comfortable accommodation with modern amenities'
        }
      ],
      itinerary: Array.from({ length: duration }, (_, i) => ({
        day: i + 1,
        theme: i === 0 ? 'Arrival & Local Exploration' : 
               i === duration - 1 ? 'Departure & Shopping' : 
               `${destination} Highlights`,
        activities: [
          {
            placeName: `Popular Attraction ${i + 1} in ${destination}`,
            placeDetails: 'Must-visit local attraction with cultural significance',
            placeImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
            geoCoordinates: { lat: 20.5937, lng: 78.9629 },
            ticketPricing: '₹200 per person',
            rating: 4.5,
            timeToTravel: '30 minutes',
            bestTimeToVisit: 'Morning'
          }
        ]
      })),
      budgetBreakdown: {
        accommodation: `₹${Math.floor(budget * 0.4).toLocaleString()}`,
        food: `₹${Math.floor(budget * 0.3).toLocaleString()}`,
        activities: `₹${Math.floor(budget * 0.2).toLocaleString()}`,
        transport: `₹${Math.floor(budget * 0.1).toLocaleString()}`
      },
      travelTips: [
        'Book accommodations in advance',
        'Try local cuisine for authentic experience',
        'Respect local customs and traditions',
        'Keep emergency contacts handy'
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'backend-fallback',
        version: '1.0.0',
        originalRequest: tripData
      }
    };
  }

  // Generate natural language response for chatbot
  async generateChatResponse(message, context = {}) {
    try {
      console.log('💬 Generating chat response with Gemini AI');
      
      const prompt = `
You are a friendly Indian travel assistant. Respond to the user's travel query in a helpful and informative way.

User Message: "${message}"
Context: ${JSON.stringify(context)}

Guidelines:
- Be conversational and friendly
- Focus on Indian destinations and experiences
- Provide practical and actionable advice
- Keep responses concise but informative
- Include specific recommendations when possible

Respond naturally as a travel expert would.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Chat response generated');
      return text;
    } catch (error) {
      console.error('❌ Error generating chat response:', error);
      return "I'm here to help you plan your trip to India! What destination are you interested in?";
    }
  }
}

// Create and export singleton instance
const aiService = new AIService();
export default aiService;
