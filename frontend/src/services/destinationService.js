import { indianDestinations, searchIndianDestinations } from '../data/indianDestinations';
import BackendApiService from '../service/BackendApi';

class DestinationService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    this.baseUrl = 'https://places.googleapis.com/v1';
    this.useBackend = true; // Prefer backend over direct Google API
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
  }

  // Enhanced place search with categorization and suggestions
  async searchDestinations(query, options = {}) {
    const cacheKey = `search_${query}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      console.log('🔍 Searching destinations:', query);

      // Try backend first if available
      if (this.useBackend) {
        try {
          const backendResults = await BackendApiService.searchPlaces(query, options.limit || 10);
          console.log('🎯 Backend search successful');

          // Cache the results
          const result = {
            destinations: backendResults.places || [],
            suggestions: [],
            categories: [],
            totalResults: backendResults.total || 0,
            source: 'backend'
          };

          this.cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });

          return result;
        } catch (backendError) {
          console.warn('⚠️ Backend search failed, trying Google API:', backendError.message);
        }
      }

      // Try Google Places API (if API key is available and valid)
      if (this.apiKey && this.apiKey !== 'your_google_places_api_key_here') {
        return await this.searchWithGoogleAPI(query, options);
      } else {
        console.warn('⚠️ Google Places API key not configured, using fallback search');
        return await this.searchWithFallback(query, options);
      }
    } catch (error) {
      console.warn('⚠️ All search methods failed, using fallback:', error.message);
      return await this.searchWithFallback(query, options);
    }
  }

  // Google Places API search
  async searchWithGoogleAPI(query, options = {}) {
    const response = await fetch(`${this.baseUrl}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.location',
          'places.rating',
          'places.userRatingCount',
          'places.photos',
          'places.types',
          'places.priceLevel',
          'places.websiteUri',
          'places.googleMapsUri',
          'places.editorialSummary'
        ].join(',')
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: options.maxResults || 20,
        ...(options.location && {
          locationBias: {
            circle: {
              center: options.location,
              radius: options.radius || 50000
            }
          }
        })
      })
    });

    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }

    const data = await response.json();
    const places = data.places || [];

    // Categorize and enhance results
    const categorizedResults = await this.categorizeDestinations(places);

    // Add suggestions if requested
    if (options.includeSuggestions) {
      categorizedResults.suggestions = await this.generateSuggestions(query, categorizedResults);
    }

    // Cache results
    this.cache.set(`search_${query}_${JSON.stringify(options)}`, {
      data: categorizedResults,
      timestamp: Date.now()
    });

    return categorizedResults;
  }

  // Fallback search using predefined destinations
  async searchWithFallback(query, options = {}) {
    const lowerQuery = query.toLowerCase().trim();

    // Get comprehensive destinations (Indian + International)
    const popularDestinations = await this.getPopularDestinations('all', 100);
    const allDestinations = [...indianDestinations, ...popularDestinations];

    // Enhanced search through destinations
    const matches = allDestinations.filter(dest => {
      const name = dest.name.toLowerCase();
      const description = dest.description.toLowerCase();
      const highlights = dest.highlights?.join(' ').toLowerCase() || '';
      const state = dest.state?.toLowerCase() || '';
      const aliases = dest.aliases?.join(' ').toLowerCase() || '';

      return name.includes(lowerQuery) ||
             description.includes(lowerQuery) ||
             highlights.includes(lowerQuery) ||
             state.includes(lowerQuery) ||
             aliases.includes(lowerQuery) ||
             lowerQuery.includes(name.split(',')[0].toLowerCase());
    });

    // Prioritize exact matches
    const exactMatches = matches.filter(dest =>
      dest.name.toLowerCase().includes(lowerQuery) ||
      lowerQuery.includes(dest.name.split(',')[0].toLowerCase())
    );

    const partialMatches = matches.filter(dest =>
      !exactMatches.includes(dest)
    );

    const results = [...exactMatches, ...partialMatches].slice(0, options.maxResults || 10);

    const fallbackResults = {
      destinations: results.map(dest => ({
        id: dest.id,
        name: dest.name,
        description: dest.description,
        location: dest.location || { lat: 0, lng: 0 },
        rating: dest.rating,
        category: dest.category,
        highlights: dest.highlights,
        imageUrl: dest.imageUrl,
        priceLevel: dest.priceLevel,
        bestTime: dest.bestTime,
        averageDays: dest.averageDays
      })),
      suggestions: results.slice(0, 5).map(dest => ({
        type: 'destination',
        name: dest.name,
        category: dest.category,
        description: dest.description
      })),
      categories: [...new Set(results.map(dest => dest.category))],
      totalResults: results.length,
      source: 'fallback'
    };

    // Cache results
    this.cache.set(`search_${query}_${JSON.stringify(options)}`, {
      data: fallbackResults,
      timestamp: Date.now()
    });

    return fallbackResults;
  }

  // Generate search suggestions based on query and results
  async generateSuggestions(query, results) {
    const suggestions = [];
    
    // Add popular destination suggestions
    if (query.length > 2) {
      try {
        const popular = await this.getPopularDestinations('all', 5);
        suggestions.push(...popular.map(dest => ({
          type: 'popular',
          name: dest.name,
          category: dest.category,
          description: dest.description
        })));
      } catch (error) {
        console.error('Error getting popular suggestions:', error);
      }
    }
    
    // Add category-based suggestions
    if (results.categories) {
      Object.entries(results.categories).forEach(([category, items]) => {
        if (items.length > 0) {
          suggestions.push({
            type: 'category',
            name: `${category.charAt(0).toUpperCase() + category.slice(1)} in ${query}`,
            category: category,
            count: items.length
          });
        }
      });
    }
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
  }

  // Categorize destinations by type
  async categorizeDestinations(places) {
    const categories = {
      cities: [],
      attractions: [],
      restaurants: [],
      hotels: [],
      nature: [],
      culture: [],
      entertainment: []
    };

    places.forEach(place => {
      const types = place.types || [];
      const enhanced = this.enhancePlace(place);

      // Categorize based on types
      if (types.includes('locality') || types.includes('administrative_area_level_1')) {
        categories.cities.push(enhanced);
      }
      
      if (types.includes('tourist_attraction') || types.includes('point_of_interest')) {
        categories.attractions.push(enhanced);
      }
      
      if (types.includes('restaurant') || types.includes('food')) {
        categories.restaurants.push(enhanced);
      }
      
      if (types.includes('lodging')) {
        categories.hotels.push(enhanced);
      }
      
      if (types.includes('park') || types.includes('natural_feature')) {
        categories.nature.push(enhanced);
      }
      
      if (types.includes('museum') || types.includes('art_gallery')) {
        categories.culture.push(enhanced);
      }
      
      if (types.includes('amusement_park') || types.includes('night_club')) {
        categories.entertainment.push(enhanced);
      }
    });

    return {
      all: places.map(this.enhancePlace),
      categories,
      totalResults: places.length
    };
  }

  // Enhance place data with additional information
  enhancePlace(place) {
    return {
      id: place.id,
      placeId: place.id,
      name: place.displayName?.text || 'Unknown',
      address: place.formattedAddress || '',
      location: {
        lat: place.location?.latitude || 0,
        lng: place.location?.longitude || 0
      },
      rating: place.rating || 0,
      userRatingCount: place.userRatingCount || 0,
      priceLevel: place.priceLevel || 0,
      types: place.types || [],
      photos: this.processPhotos(place.photos || []),
      websiteUrl: place.websiteUri,
      googleMapsUrl: place.googleMapsUri,
      description: place.editorialSummary?.text || '',
      category: this.getPrimaryCategory(place.types || []),
      priceRange: this.getPriceRange(place.priceLevel),
      popularTimes: null, // Would be fetched separately
      isOpenNow: null // Would be fetched separately
    };
  }

  // Process photos to get URLs
  processPhotos(photos) {
    return photos.slice(0, 5).map(photo => ({
      reference: photo.name,
      url: `${this.baseUrl}/${photo.name}/media?maxHeightPx=600&maxWidthPx=600&key=${this.apiKey}`,
      width: photo.widthPx || 600,
      height: photo.heightPx || 600
    }));
  }

  // Get primary category from types
  getPrimaryCategory(types) {
    const categoryMap = {
      'tourist_attraction': 'Attraction',
      'restaurant': 'Restaurant',
      'lodging': 'Hotel',
      'park': 'Nature',
      'museum': 'Culture',
      'amusement_park': 'Entertainment',
      'locality': 'City',
      'natural_feature': 'Nature'
    };

    for (const type of types) {
      if (categoryMap[type]) {
        return categoryMap[type];
      }
    }
    
    return 'Place';
  }

  // Get price range description
  getPriceRange(priceLevel) {
    const ranges = {
      0: 'Free',
      1: '$',
      2: '$$',
      3: '$$$',
      4: '$$$$'
    };
    
    return ranges[priceLevel] || 'Unknown';
  }

  // Get popular destinations
  async getPopularDestinations(category = 'all', limit = 12) {
    const popularDestinations = [
      // Indian Destinations
      {
        id: 'bangalore_india',
        name: 'Bangalore, India',
        description: 'Silicon Valley of India with pleasant weather and vibrant culture',
        imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2',
        category: 'Urban',
        rating: 4.5,
        priceLevel: 2,
        highlights: ['Lalbagh Botanical Garden', 'Bangalore Palace', 'UB City Mall'],
        bestTime: 'October-February',
        averageDays: '2-4 days'
      },
      {
        id: 'mumbai_india',
        name: 'Mumbai, India',
        description: 'Financial capital of India with Bollywood glamour and street food',
        imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
        category: 'Urban',
        rating: 4.4,
        priceLevel: 2,
        highlights: ['Gateway of India', 'Marine Drive', 'Bollywood Studios'],
        bestTime: 'November-February',
        averageDays: '3-5 days'
      },
      {
        id: 'delhi_india',
        name: 'Delhi, India',
        description: 'Capital city rich in history, culture, and architectural marvels',
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5',
        category: 'Cultural',
        rating: 4.6,
        priceLevel: 2,
        highlights: ['Red Fort', 'India Gate', 'Lotus Temple'],
        bestTime: 'October-March',
        averageDays: '3-5 days'
      },
      {
        id: 'goa_india',
        name: 'Goa, India',
        description: 'Beach paradise with Portuguese heritage and vibrant nightlife',
        imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2',
        category: 'Beach',
        rating: 4.7,
        priceLevel: 2,
        highlights: ['Baga Beach', 'Old Goa Churches', 'Dudhsagar Falls'],
        bestTime: 'November-February',
        averageDays: '4-7 days'
      },
      {
        id: 'kerala_india',
        name: 'Kerala, India',
        description: 'God\'s Own Country with backwaters, hill stations, and spices',
        imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
        category: 'Nature',
        rating: 4.8,
        priceLevel: 2,
        highlights: ['Alleppey Backwaters', 'Munnar Hills', 'Kochi Fort'],
        bestTime: 'September-March',
        averageDays: '5-8 days'
      },
      {
        id: 'rajasthan_india',
        name: 'Rajasthan, India',
        description: 'Land of Kings with majestic palaces, forts, and desert landscapes',
        imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245',
        category: 'Cultural',
        rating: 4.9,
        priceLevel: 2,
        highlights: ['Jaipur City Palace', 'Udaipur Lakes', 'Jaisalmer Desert'],
        bestTime: 'October-March',
        averageDays: '7-10 days'
      },
      {
        id: 'kolkata_india',
        name: 'Kolkata, India',
        description: 'Cultural capital of India with rich heritage, art, and literature',
        imageUrl: 'https://images.unsplash.com/photo-1558431382-27e303142255',
        category: 'Cultural',
        rating: 4.5,
        priceLevel: 2,
        highlights: ['Victoria Memorial', 'Howrah Bridge', 'Park Street'],
        bestTime: 'October-March',
        averageDays: '3-5 days'
      },
      {
        id: 'jharkhand_india',
        name: 'Jharkhand, India',
        description: 'Land of forests with waterfalls, tribal culture, and natural beauty',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        category: 'Nature',
        rating: 4.3,
        priceLevel: 1,
        highlights: ['Hundru Falls', 'Betla National Park', 'Ranchi Hill Station'],
        bestTime: 'October-April',
        averageDays: '4-6 days'
      },
      {
        id: 'ranchi_india',
        name: 'Ranchi, Jharkhand',
        description: 'Hill station capital with waterfalls, lakes, and pleasant climate',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        category: 'Nature',
        rating: 4.2,
        priceLevel: 1,
        highlights: ['Rock Garden', 'Hundru Falls', 'Tagore Hill'],
        bestTime: 'October-April',
        averageDays: '2-4 days'
      },
      {
        id: 'chennai_india',
        name: 'Chennai, India',
        description: 'Gateway to South India with temples, beaches, and classical arts',
        imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220',
        category: 'Cultural',
        rating: 4.3,
        priceLevel: 2,
        highlights: ['Marina Beach', 'Kapaleeshwarar Temple', 'Fort St. George'],
        bestTime: 'November-February',
        averageDays: '2-4 days'
      },
      {
        id: 'hyderabad_india',
        name: 'Hyderabad, India',
        description: 'City of Nizams with historic monuments and famous biryani',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
        category: 'Cultural',
        rating: 4.4,
        priceLevel: 2,
        highlights: ['Charminar', 'Golconda Fort', 'Ramoji Film City'],
        bestTime: 'October-March',
        averageDays: '2-4 days'
      },
      {
        id: 'pune_india',
        name: 'Pune, India',
        description: 'Oxford of the East with pleasant weather and cultural heritage',
        imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220',
        category: 'Urban',
        rating: 4.3,
        priceLevel: 2,
        highlights: ['Shaniwar Wada', 'Aga Khan Palace', 'Sinhagad Fort'],
        bestTime: 'October-February',
        averageDays: '2-3 days'
      },
      {
        id: 'jaipur_india',
        name: 'Jaipur, India',
        description: 'Pink City with magnificent palaces, forts, and royal heritage',
        imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245',
        category: 'Cultural',
        rating: 4.7,
        priceLevel: 2,
        highlights: ['Hawa Mahal', 'Amber Fort', 'City Palace'],
        bestTime: 'October-March',
        averageDays: '3-4 days'
      },
      {
        id: 'agra_india',
        name: 'Agra, India',
        description: 'Home to the iconic Taj Mahal and Mughal architecture',
        imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523',
        category: 'Cultural',
        rating: 4.8,
        priceLevel: 2,
        highlights: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri'],
        bestTime: 'October-March',
        averageDays: '1-2 days'
      },
      {
        id: 'varanasi_india',
        name: 'Varanasi, India',
        description: 'Spiritual capital with ancient ghats and religious significance',
        imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc',
        category: 'Spiritual',
        rating: 4.6,
        priceLevel: 1,
        highlights: ['Dashashwamedh Ghat', 'Kashi Vishwanath Temple', 'Sarnath'],
        bestTime: 'October-March',
        averageDays: '2-3 days'
      },
      // International Destinations
      {
        id: 'paris_france',
        name: 'Paris, France',
        description: 'The City of Light with iconic landmarks and romantic atmosphere',
        imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52',
        category: 'Cultural',
        rating: 4.8,
        priceLevel: 3,
        highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame'],
        bestTime: 'April-June, September-October',
        averageDays: '4-7 days'
      },
      {
        id: 'tokyo_japan',
        name: 'Tokyo, Japan',
        description: 'Modern metropolis blending tradition with cutting-edge technology',
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
        category: 'Urban',
        rating: 4.7,
        priceLevel: 3,
        highlights: ['Shibuya Crossing', 'Senso-ji Temple', 'Tokyo Skytree'],
        bestTime: 'March-May, September-November',
        averageDays: '5-10 days'
      },
      {
        id: 'bali_indonesia',
        name: 'Bali, Indonesia',
        description: 'Tropical paradise with beautiful beaches and rich culture',
        imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1',
        category: 'Beach',
        rating: 4.6,
        priceLevel: 2,
        highlights: ['Ubud Rice Terraces', 'Tanah Lot Temple', 'Seminyak Beach'],
        bestTime: 'April-October',
        averageDays: '7-14 days'
      },
      {
        id: 'new_york_usa',
        name: 'New York City, USA',
        description: 'The city that never sleeps with world-class attractions',
        imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
        category: 'Urban',
        rating: 4.5,
        priceLevel: 4,
        highlights: ['Times Square', 'Central Park', 'Statue of Liberty'],
        bestTime: 'April-June, September-November',
        averageDays: '4-7 days'
      },
      {
        id: 'rome_italy',
        name: 'Rome, Italy',
        description: 'Eternal city with ancient history and incredible cuisine',
        imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
        category: 'Historical',
        rating: 4.7,
        priceLevel: 3,
        highlights: ['Colosseum', 'Vatican City', 'Trevi Fountain'],
        bestTime: 'April-June, September-October',
        averageDays: '3-5 days'
      },
      {
        id: 'dubai_uae',
        name: 'Dubai, UAE',
        description: 'Luxury destination with modern architecture and desert adventures',
        imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
        category: 'Luxury',
        rating: 4.6,
        priceLevel: 4,
        highlights: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah'],
        bestTime: 'November-March',
        averageDays: '4-7 days'
      },
      {
        id: 'london_england',
        name: 'London, England',
        description: 'Historic capital with royal palaces and cultural landmarks',
        imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
        category: 'Cultural',
        rating: 4.5,
        priceLevel: 4,
        highlights: ['Big Ben', 'British Museum', 'Tower Bridge'],
        bestTime: 'May-September',
        averageDays: '4-6 days'
      },
      {
        id: 'santorini_greece',
        name: 'Santorini, Greece',
        description: 'Stunning island with white-washed buildings and sunset views',
        imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
        category: 'Beach',
        rating: 4.8,
        priceLevel: 3,
        highlights: ['Oia Sunset', 'Red Beach', 'Fira Town'],
        bestTime: 'April-October',
        averageDays: '3-5 days'
      }
    ];

    // Filter by category if specified
    let filtered = popularDestinations;
    if (category !== 'all') {
      filtered = popularDestinations.filter(dest => 
        dest.category.toLowerCase() === category.toLowerCase()
      );
    }

    return filtered.slice(0, limit);
  }

  // Get destination details (NO GOOGLE API - BACKEND/FALLBACK ONLY)
  async getDestinationDetails(placeId) {
    const cacheKey = `details_${placeId}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log('📦 Using cached destination details for:', placeId);
        return cached.data;
      }
    }

    try {
      console.log('🏛️ Getting destination details for:', placeId);

      // Try backend first
      if (this.useBackend) {
        try {
          const backendResults = await BackendApiService.searchPlaces(placeId, 1);
          if (backendResults.places && backendResults.places.length > 0) {
            const place = backendResults.places[0];
            const details = {
              id: place.id,
              name: place.name,
              address: place.address,
              location: { latitude: 20.5937, longitude: 78.9629 },
              rating: place.rating || 4.0,
              photos: place.photos || [],
              types: place.types || ['locality'],
              priceLevel: place.priceLevel || 2,
              source: 'backend'
            };

            // Cache the result
            this.cache.set(cacheKey, {
              data: details,
              timestamp: Date.now()
            });

            console.log('✅ Backend destination details retrieved:', details);
            return details;
          }
        } catch (backendError) {
          console.warn('⚠️ Backend destination details failed:', backendError.message);
        }
      }

      // Use fallback data (NO GOOGLE API CALLS)
      console.log('🔄 Using fallback destination details for:', placeId);
      const fallbackDetails = this.generateFallbackDestinationDetails(placeId);

      // Cache the fallback
      this.cache.set(cacheKey, {
        data: fallbackDetails,
        timestamp: Date.now()
      });

      return fallbackDetails;

    } catch (error) {
      console.error('Error getting destination details:', error);

      // Return fallback data instead of throwing
      const fallbackDetails = this.generateFallbackDestinationDetails(placeId);

      // Cache the fallback
      this.cache.set(cacheKey, {
        data: fallbackDetails,
        timestamp: Date.now()
      });

      return fallbackDetails;
    }
  }

  // Generate comprehensive fallback destination details
  generateFallbackDestinationDetails(destinationName) {
    const indianDestination = searchIndianDestinations(destinationName)[0];

    return {
      id: `fallback_${Date.now()}`,
      name: destinationName,
      address: `${destinationName}, India`,
      location: indianDestination?.location || { latitude: 20.5937, longitude: 78.9629 },
      rating: indianDestination?.rating || 4.0,
      photos: [
        {
          reference: 'fallback_photo',
          width: 400,
          height: 300,
          url: indianDestination?.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
        }
      ],
      types: ['locality', 'tourist_attraction'],
      priceLevel: indianDestination?.priceLevel || 2,
      description: indianDestination?.description || `Popular destination in India`,
      highlights: indianDestination?.highlights || ['Local attractions', 'Cultural sites', 'Local cuisine'],
      bestTime: indianDestination?.bestTime || 'Year-round',
      source: 'fallback'
    };
  }

  // Get nearby attractions for a destination
  async getNearbyAttractions(location, radius = 10000, type = 'tourist_attraction') {
    try {
      const response = await fetch(`${this.baseUrl}/places:searchNearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': [
            'places.id',
            'places.displayName',
            'places.formattedAddress',
            'places.location',
            'places.rating',
            'places.photos',
            'places.types'
          ].join(',')
        },
        body: JSON.stringify({
          includedTypes: [type],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: location,
              radius: radius
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Places API error: ${response.status}`);
      }

      const data = await response.json();
      return (data.places || []).map(this.enhancePlace);
    } catch (error) {
      console.error('Error getting nearby attractions:', error);
      throw error;
    }
  }
}

// Create singleton instance
const destinationService = new DestinationService();

// React hook for destination service
export const useDestinationService = () => {
  const telemetry = useTelemetry();

  return {
    searchDestinations: async (query, options) => {
      const startTime = Date.now();
      try {
        telemetry.trackSearchStarted(query, options);
        const results = await destinationService.searchDestinations(query, options);
        const responseTime = Date.now() - startTime;
        telemetry.trackPerformance('destination_search', responseTime, { query, resultCount: results.totalResults });
        return results;
      } catch (error) {
        telemetry.trackError(error, { action: 'searchDestinations', query });
        throw error;
      }
    },
    
    getPopularDestinations: (category, limit) => destinationService.getPopularDestinations(category, limit),
    
    getDestinationDetails: async (placeId) => {
      try {
        const details = await destinationService.getDestinationDetails(placeId);
        telemetry.trackEvent('destination_details_viewed', { placeId, name: details.name });
        return details;
      } catch (error) {
        telemetry.trackError(error, { action: 'getDestinationDetails', placeId });
        throw error;
      }
    },
    
    getNearbyAttractions: (location, radius, type) => destinationService.getNearbyAttractions(location, radius, type)
  };
};

export default destinationService;
