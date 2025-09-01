// Comprehensive Places Service with Google Places API Integration
class ComprehensivePlacesService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    this.baseUrl = 'https://places.googleapis.com/v1';
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
  }

  // Main function to get comprehensive places data for a destination
  async getComprehensivePlacesData(destination, interests = []) {
    try {
      console.log('🏛️ Getting comprehensive places data for:', destination.name);

      // Check if API key is available
      if (!this.apiKey || this.apiKey === 'your_google_places_api_key_here') {
        console.warn('⚠️ Google Places API not configured, using fallback data');
        return this.getFallbackPlacesData(destination);
      }

      const location = destination.location;
      const placesData = {
        attractions: [],
        restaurants: [],
        hotels: [],
        hiddenGems: [],
        transportation: [],
        shopping: [],
        nightlife: []
      };

      // Fetch different types of places based on interests
      const searchPromises = [];

      // Always get basic categories
      searchPromises.push(
        this.searchPlacesByType(location, 'tourist_attraction', 'attractions'),
        this.searchPlacesByType(location, 'restaurant', 'restaurants'),
        this.searchPlacesByType(location, 'lodging', 'hotels')
      );

      // Add interest-based searches
      if (interests.includes('nature')) {
        searchPromises.push(
          this.searchPlacesByType(location, 'park', 'nature'),
          this.searchPlacesByType(location, 'natural_feature', 'nature')
        );
      }

      if (interests.includes('shopping')) {
        searchPromises.push(
          this.searchPlacesByType(location, 'shopping_mall', 'shopping'),
          this.searchPlacesByType(location, 'store', 'shopping')
        );
      }

      if (interests.includes('spiritual')) {
        searchPromises.push(
          this.searchPlacesByType(location, 'place_of_worship', 'spiritual'),
          this.searchPlacesByType(location, 'hindu_temple', 'spiritual')
        );
      }

      if (interests.includes('culture')) {
        searchPromises.push(
          this.searchPlacesByType(location, 'museum', 'culture'),
          this.searchPlacesByType(location, 'art_gallery', 'culture')
        );
      }

      // Execute all searches
      const results = await Promise.allSettled(searchPromises);
      
      // Process results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const { category, places } = result.value;
          if (placesData[category]) {
            placesData[category].push(...places);
          }
        }
      });

      // Remove duplicates and sort by rating
      Object.keys(placesData).forEach(category => {
        placesData[category] = this.removeDuplicatesAndSort(placesData[category]);
      });

      console.log('🏛️ Comprehensive places data retrieved:', {
        attractions: placesData.attractions.length,
        restaurants: placesData.restaurants.length,
        hotels: placesData.hotels.length
      });

      return placesData;
    } catch (error) {
      console.error('Error getting comprehensive places data:', error);
      return this.getFallbackPlacesData(destination);
    }
  }

  // Search places by specific type
  async searchPlacesByType(location, type, category) {
    const cacheKey = `${location.lat},${location.lng}_${type}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) return { category, places: cached };

    try {
      if (!this.apiKey || this.apiKey === 'your_google_places_api_key_here') {
        return { category, places: [] };
      }

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
            'places.userRatingCount',
            'places.photos',
            'places.priceLevel',
            'places.types',
            'places.websiteUri',
            'places.editorialSummary'
          ].join(',')
        },
        body: JSON.stringify({
          includedTypes: [type],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: {
                latitude: location.lat,
                longitude: location.lng
              },
              radius: 15000 // 15km radius
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Places API error: ${response.status}`);
      }

      const data = await response.json();
      const places = this.formatPlacesData(data.places || []);
      
      this.setCachedResult(cacheKey, places);
      return { category, places };
    } catch (error) {
      console.error(`Error searching ${type}:`, error);
      return { category, places: [] };
    }
  }

  // Format places data from Google Places API
  formatPlacesData(places) {
    return places.map(place => ({
      id: place.id,
      name: place.displayName?.text || 'Unknown Place',
      address: place.formattedAddress || '',
      location: place.location || { latitude: 0, longitude: 0 },
      rating: place.rating || 4.0,
      userRatingCount: place.userRatingCount || 0,
      priceLevel: this.formatPriceLevel(place.priceLevel),
      photos: place.photos?.slice(0, 3).map(photo => ({
        name: photo.name,
        url: this.getPhotoUrl(photo.name)
      })) || [],
      types: place.types || [],
      website: place.websiteUri || null,
      description: place.editorialSummary?.text || `Popular place in the area`,
      estimatedCost: this.estimateIndianCost(place.priceLevel, place.types)
    }));
  }

  // Convert Google price level to Indian Rupees
  formatPriceLevel(priceLevel) {
    const priceLevels = {
      'PRICE_LEVEL_FREE': '₹0',
      'PRICE_LEVEL_INEXPENSIVE': '₹100-500',
      'PRICE_LEVEL_MODERATE': '₹500-1500',
      'PRICE_LEVEL_EXPENSIVE': '₹1500-3000',
      'PRICE_LEVEL_VERY_EXPENSIVE': '₹3000+'
    };
    return priceLevels[priceLevel] || '₹500-1500';
  }

  // Estimate Indian costs based on place type
  estimateIndianCost(priceLevel, types) {
    const isRestaurant = types.includes('restaurant') || types.includes('food');
    const isHotel = types.includes('lodging');
    const isAttraction = types.includes('tourist_attraction');

    if (isRestaurant) {
      return {
        'PRICE_LEVEL_INEXPENSIVE': '₹200-500 per person',
        'PRICE_LEVEL_MODERATE': '₹500-1200 per person',
        'PRICE_LEVEL_EXPENSIVE': '₹1200-2500 per person'
      }[priceLevel] || '₹500-1200 per person';
    }

    if (isHotel) {
      return {
        'PRICE_LEVEL_INEXPENSIVE': '₹1500-3000 per night',
        'PRICE_LEVEL_MODERATE': '₹3000-6000 per night',
        'PRICE_LEVEL_EXPENSIVE': '₹6000-12000 per night'
      }[priceLevel] || '₹3000-6000 per night';
    }

    if (isAttraction) {
      return {
        'PRICE_LEVEL_FREE': 'Free entry',
        'PRICE_LEVEL_INEXPENSIVE': '₹50-200 per person',
        'PRICE_LEVEL_MODERATE': '₹200-500 per person',
        'PRICE_LEVEL_EXPENSIVE': '₹500-1000 per person'
      }[priceLevel] || '₹200-500 per person';
    }

    return '₹200-500 per person';
  }

  // Get photo URL from Google Places
  getPhotoUrl(photoName, maxWidth = 600) {
    if (!photoName || !this.apiKey) return null;
    return `${this.baseUrl}/${photoName}/media?maxWidthPx=${maxWidth}&key=${this.apiKey}`;
  }

  // Remove duplicates and sort by rating
  removeDuplicatesAndSort(places) {
    const unique = places.filter((place, index, self) =>
      index === self.findIndex(p => p.name === place.name)
    );
    
    return unique.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  // Cache management
  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  setCachedResult(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Enhanced fallback data when API is not available
  getFallbackPlacesData(destination) {
    const destName = destination.name || 'Unknown Location';
    const state = destination.state || 'India';

    // Generate realistic fallback data based on destination
    const attractions = this.generateFallbackAttractions(destName, state);
    const restaurants = this.generateFallbackRestaurants(destName, state);
    const hotels = this.generateFallbackHotels(destName, state);

    return {
      attractions,
      restaurants,
      hotels,
      hiddenGems: [],
      transportation: [],
      shopping: [],
      nightlife: []
    };
  }

  // Generate realistic attraction data
  generateFallbackAttractions(destName, state) {
    const attractionTypes = [
      { name: `Heritage Museum`, description: 'Local history and culture museum', cost: '₹50-200' },
      { name: `City Temple`, description: 'Beautiful local temple with architecture', cost: 'Free' },
      { name: `Central Park`, description: 'Green space for relaxation and walks', cost: 'Free' },
      { name: `Local Market`, description: 'Traditional market with local goods', cost: 'Free entry' },
      { name: `Viewpoint`, description: 'Scenic spot with city/nature views', cost: '₹20-100' }
    ];

    return attractionTypes.map((attr, index) => ({
      id: `fallback_attraction_${index}`,
      name: `${attr.name} in ${destName}`,
      address: `${destName}, ${state}`,
      rating: 4.0 + Math.random() * 0.8,
      priceLevel: attr.cost,
      description: attr.description,
      estimatedCost: attr.cost,
      types: ['tourist_attraction'],
      photos: []
    }));
  }

  // Generate realistic restaurant data
  generateFallbackRestaurants(destName, state) {
    const restaurantTypes = [
      { name: `Local Dhaba`, description: 'Authentic local cuisine', cost: '₹300-600 per person' },
      { name: `Heritage Restaurant`, description: 'Traditional recipes and ambiance', cost: '₹500-1000 per person' },
      { name: `Street Food Corner`, description: 'Popular local street food', cost: '₹100-300 per person' }
    ];

    return restaurantTypes.map((rest, index) => ({
      id: `fallback_restaurant_${index}`,
      name: `${rest.name} - ${destName}`,
      address: `${destName}, ${state}`,
      rating: 4.0 + Math.random() * 0.6,
      priceLevel: rest.cost,
      description: rest.description,
      estimatedCost: rest.cost,
      types: ['restaurant'],
      photos: []
    }));
  }

  // Generate realistic hotel data
  generateFallbackHotels(destName, state) {
    const hotelTypes = [
      { name: `Budget Hotel`, description: 'Clean and comfortable budget accommodation', cost: '₹1500-3000 per night' },
      { name: `Heritage Hotel`, description: 'Traditional hotel with local charm', cost: '₹3000-6000 per night' },
      { name: `Business Hotel`, description: 'Modern amenities for business travelers', cost: '₹4000-8000 per night' }
    ];

    return hotelTypes.map((hotel, index) => ({
      id: `fallback_hotel_${index}`,
      name: `${hotel.name} ${destName}`,
      address: `${destName}, ${state}`,
      rating: 3.8 + Math.random() * 0.8,
      priceLevel: hotel.cost,
      description: hotel.description,
      estimatedCost: hotel.cost,
      types: ['lodging'],
      photos: []
    }));
  }
}

export default new ComprehensivePlacesService();
