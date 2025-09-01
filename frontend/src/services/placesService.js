import axios from 'axios';
import BackendApiService from '../service/BackendApi';
import { searchIndianDestinations } from '../data/indianDestinations';

class PlacesService {
  constructor() {
    // Use environment variable for Google Places API key
    this.apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    this.baseURL = 'https://maps.googleapis.com/maps/api/place';
    this.useBackend = true; // Prefer backend over Google API
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes

    console.log('🗺️ Places Service initialized with API key:', this.apiKey ? 'Available' : 'Missing');
  }

  // Get cached result if available and not expired
  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Cache result
  setCachedResult(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Autocomplete for destinations (NO GOOGLE API - BACKEND/FALLBACK ONLY)
  async getDestinationSuggestions(input) {
    if (!input || input.length < 2) return [];

    const cacheKey = `autocomplete_${input}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      console.log('🔍 Getting destination suggestions for:', input);

      // Try backend first
      if (this.useBackend) {
        try {
          const backendResults = await BackendApiService.searchPlaces(input, 10);
          if (backendResults.places && backendResults.places.length > 0) {
            const suggestions = backendResults.places.map(place => ({
              placeId: place.id,
              description: place.name,
              mainText: place.name,
              secondaryText: place.address,
              types: place.types || ['locality'],
              source: 'backend'
            }));

            this.setCachedResult(cacheKey, suggestions);
            console.log('✅ Backend suggestions retrieved:', suggestions.length);
            return suggestions;
          }
        } catch (backendError) {
          console.warn('⚠️ Backend suggestions failed:', backendError.message);
        }
      }

      // Use fallback search (NO GOOGLE API CALLS)
      console.log('🔄 Using fallback suggestions for:', input);
      const fallbackSuggestions = this.generateFallbackSuggestions(input);

      this.setCachedResult(cacheKey, fallbackSuggestions);
      return fallbackSuggestions;

    } catch (error) {
      console.error('Error fetching destination suggestions:', error);

      // Return fallback suggestions
      const fallbackSuggestions = this.generateFallbackSuggestions(input);
      this.setCachedResult(cacheKey, fallbackSuggestions);
      return fallbackSuggestions;
    }
  }

  // Generate fallback suggestions from Indian destinations
  generateFallbackSuggestions(input) {
    const indianResults = searchIndianDestinations(input);

    return indianResults.slice(0, 10).map((destination, index) => ({
      placeId: `fallback_${destination.id || index}`,
      description: `${destination.name}, ${destination.state || 'India'}`,
      mainText: destination.name,
      secondaryText: `${destination.state || 'India'} • ${destination.category || 'Destination'}`,
      types: ['locality', 'tourist_attraction'],
      source: 'fallback',
      rating: destination.rating,
      category: destination.category
    }));
  }

  // Get place details by place ID
  async getPlaceDetails(placeId) {
    const cacheKey = `details_${placeId}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      console.log('🏛️ Getting place details for:', placeId);

      // Try backend first
      if (this.useBackend) {
        try {
          const backendResults = await BackendApiService.searchPlaces(placeId, 1);
          if (backendResults.places && backendResults.places.length > 0) {
            const place = backendResults.places[0];
            const placeDetails = {
              placeId: place.id,
              name: place.name,
              address: place.address,
              location: { lat: 20.5937, lng: 78.9629 },
              photos: place.photos || [],
              rating: place.rating || 4.0,
              reviews: [],
              website: null,
              phone: null,
              openingHours: null,
              priceLevel: place.priceLevel || 2,
              types: place.types || ['locality'],
              source: 'backend'
            };

            this.setCachedResult(cacheKey, placeDetails);
            console.log('✅ Backend place details retrieved');
            return placeDetails;
          }
        } catch (backendError) {
          console.warn('⚠️ Backend place details failed:', backendError.message);
        }
      }

      // Use fallback data (NO GOOGLE API CALLS)
      console.log('🔄 Using fallback place details for:', placeId);
      const fallbackDetails = this.generateFallbackPlaceDetails(placeId);

      this.setCachedResult(cacheKey, fallbackDetails);
      return fallbackDetails;

    } catch (error) {
      console.error('Error fetching place details:', error);

      // Return fallback instead of throwing
      const fallbackDetails = this.generateFallbackPlaceDetails(placeId);
      this.setCachedResult(cacheKey, fallbackDetails);
      return fallbackDetails;
    }
  }

  // Generate fallback place details
  generateFallbackPlaceDetails(placeId) {
    // Try to extract place name from placeId if it contains useful info
    let placeName = 'Popular Destination';
    if (typeof placeId === 'string' && placeId.includes('_')) {
      const parts = placeId.split('_');
      placeName = parts[parts.length - 1] || placeName;
    }

    return {
      placeId: placeId,
      name: placeName,
      address: `${placeName}, India`,
      location: { lat: 20.5937, lng: 78.9629 },
      photos: [
        {
          reference: 'fallback_photo',
          width: 400,
          height: 300,
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
        }
      ],
      rating: 4.0 + Math.random() * 1.0,
      reviews: [
        {
          author_name: 'Travel Enthusiast',
          rating: 5,
          text: 'Amazing place to visit! Highly recommended for travelers.',
          time: Date.now()
        }
      ],
      website: null,
      phone: null,
      openingHours: {
        open_now: true,
        weekday_text: ['Open 24 hours']
      },
      priceLevel: 2,
      types: ['tourist_attraction', 'establishment'],
      source: 'fallback'
    };
  }

  // Search nearby places by category
  async searchNearbyPlaces(location, category, radius = 5000) {
    const cacheKey = `nearby_${location.lat}_${location.lng}_${category}_${radius}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      console.log('🔍 Searching nearby places via backend:', { location, category, radius });

      // Use backend endpoint to avoid CORS issues
      const response = await axios.get('http://localhost:5000/api/places/nearby', {
        params: {
          lat: location.lat,
          lng: location.lng,
          radius,
          type: category
        }
      });

      // Handle both backend response format and direct API format
      const placesData = response.data.data || response.data.results || [];

      if (!Array.isArray(placesData)) {
        console.warn('⚠️ Invalid places data format:', placesData);
        return this.generateFallbackNearbyPlaces(location, category);
      }

      const places = placesData.map(place => ({
        placeId: place.placeId || place.place_id || `place_${Math.random()}`,
        name: place.name || 'Unknown Place',
        address: place.address || place.vicinity || 'Address not available',
        location: place.location || place.geometry?.location || location,
        rating: place.rating || 4.0,
        priceLevel: place.priceLevel || place.price_level || 2,
        photos: place.photos?.map(photo => ({
          reference: photo.reference || photo.photo_reference,
          url: photo.url || this.getPhotoUrl(photo.photo_reference || photo.reference, 300)
        })) || [],
        types: place.types || [category],
        openNow: place.openNow !== undefined ? place.openNow : place.opening_hours?.open_now
      }));

      this.setCachedResult(cacheKey, places);
      console.log(`✅ Found ${places.length} nearby places via backend`);
      return places;
    } catch (error) {
      console.error('Error searching nearby places:', error);

      // Return enhanced fallback places if API fails
      return this.generateEnhancedFallbackNearbyPlaces(location, category);
    }
  }

  // Text search for places
  async textSearch(query, location = null) {
    const cacheKey = `text_search_${query}_${location ? `${location.lat}_${location.lng}` : 'global'}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      const params = {
        query,
        key: this.apiKey
      };

      if (location) {
        params.location = `${location.lat},${location.lng}`;
        params.radius = 50000; // 50km radius
      }

      const response = await axios.get(`${this.baseURL}/textsearch/json`, {
        params
      });

      const places = response.data.results.map(place => ({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        location: place.geometry.location,
        rating: place.rating,
        priceLevel: place.price_level,
        photos: place.photos?.map(photo => ({
          reference: photo.photo_reference,
          url: this.getPhotoUrl(photo.photo_reference, 300)
        })) || [],
        types: place.types,
        openNow: place.opening_hours?.open_now
      }));

      this.setCachedResult(cacheKey, places);
      return places;
    } catch (error) {
      console.error('Error in text search:', error);
      return [];
    }
  }

  // Get categorized places for a destination
  async getCategorizedPlaces(location) {
    const categories = {
      attractions: ['tourist_attraction', 'museum', 'amusement_park', 'zoo'],
      restaurants: ['restaurant', 'food', 'meal_takeaway'],
      hotels: ['lodging'],
      shopping: ['shopping_mall', 'store'],
      nightlife: ['night_club', 'bar'],
      activities: ['gym', 'spa', 'park']
    };

    const results = {};

    for (const [category, types] of Object.entries(categories)) {
      results[category] = [];
      
      for (const type of types) {
        try {
          const places = await this.searchNearbyPlaces(location, type, 10000);
          results[category].push(...places);
        } catch (error) {
          console.error(`Error fetching ${category}:`, error);
        }
      }

      // Remove duplicates and sort by rating
      results[category] = results[category]
        .filter((place, index, self) => 
          index === self.findIndex(p => p.placeId === place.placeId)
        )
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 20); // Limit to top 20
    }

    return results;
  }

  // Get photo URL
  getPhotoUrl(photoReference, maxWidth = 400) {
    return `${this.baseURL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  // Get distance matrix between places
  async getDistanceMatrix(origins, destinations) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins: origins.map(o => `${o.lat},${o.lng}`).join('|'),
          destinations: destinations.map(d => `${d.lat},${d.lng}`).join('|'),
          units: 'metric',
          mode: 'walking',
          key: this.apiKey
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting distance matrix:', error);
      return null;
    }
  }

  // Get directions between two points
  async getDirections(origin, destination, mode = 'walking') {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          mode,
          key: this.apiKey
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting directions:', error);
      return null;
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Generate enhanced fallback nearby places
  generateEnhancedFallbackNearbyPlaces(location, category) {
    const placeTypes = {
      'restaurant': ['Local Restaurant', 'Street Food Corner', 'Traditional Cafe', 'Fine Dining Restaurant', 'Food Court'],
      'tourist_attraction': ['Heritage Site', 'Local Museum', 'City Park', 'Historical Monument', 'Art Gallery'],
      'lodging': ['Comfort Hotel', 'Guest House', 'Heritage Resort', 'Homestay', 'Budget Lodge'],
      'food': ['Local Eatery', 'Traditional Restaurant', 'Snack Bar', 'Sweet Shop', 'Food Stall'],
      'shopping': ['Local Market', 'Shopping Center', 'Handicraft Store', 'Souvenir Shop', 'Mall']
    };

    const typeNames = placeTypes[category] || ['Local Place', 'Popular Location', 'Tourist Spot', 'Local Venue', 'Destination'];

    return Array.from({ length: 8 }, (_, i) => ({
      placeId: `enhanced_${category}_${location.lat.toFixed(2)}_${location.lng.toFixed(2)}_${i + 1}`,
      name: `${typeNames[i % typeNames.length]} ${i + 1}`,
      address: `Near ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}, India`,
      location: {
        lat: location.lat + (Math.random() - 0.5) * 0.01, // Small variation
        lng: location.lng + (Math.random() - 0.5) * 0.01
      },
      rating: Math.round((3.8 + Math.random() * 1.4) * 10) / 10, // 3.8 to 5.2
      priceLevel: Math.floor(Math.random() * 4) + 1,
      photos: [{
        reference: `fallback_photo_${i}`,
        url: `https://images.unsplash.com/photo-${1500000000 + i}?w=300&h=200&fit=crop`
      }],
      types: [category],
      openNow: Math.random() > 0.15, // 85% chance of being open
      description: `Popular ${category.replace('_', ' ')} in the area`,
      priceRange: category === 'restaurant' || category === 'food' ? '₹200-500' : 'Varies'
    }));
  }
}

export default new PlacesService();
