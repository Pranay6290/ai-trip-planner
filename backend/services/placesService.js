import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class PlacesService {
  constructor() {
    // Use environment variable for Google Places API key
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!this.apiKey) {
      console.error('❌ Google Places API key not found in environment variables');
      throw new Error('Google Places API key is required. Please set GOOGLE_PLACES_API_KEY in .env file');
    }

    this.baseURL = 'https://places.googleapis.com/v1/places';
    this.photoBaseURL = 'https://places.googleapis.com/v1';

    // Add caching for API responses
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes cache
    this.maxCacheSize = 200; // Maximum cached responses

    console.log('🗺️ Backend Places Service initialized with API key:', this.apiKey ? 'Available' : 'Missing');
  }

  // Cache management methods
  getCacheKey(query, location = null, type = null) {
    const locationStr = location ? `${location.lat}_${location.lng}` : 'no_location';
    const typeStr = type || 'no_type';
    return `places_${query}_${locationStr}_${typeStr}`;
  }

  getCachedResponse(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('✅ Using cached places response');
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

  async searchPlaces(query, location = null) {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(query, location);
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }

      console.log(`🔍 Searching places for: "${query}" using Google Places API`);
      console.log(`🔑 Using API key: ${this.apiKey.substring(0, 10)}...`);

      const config = {
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
            'places.priceLevel',
            'places.types',
            'places.websiteUri',
            'places.googleMapsUri'
          ].join(',')
        }
      };

      const requestBody = {
        textQuery: query,
        maxResultCount: 20, // Increased for more diverse results
        languageCode: 'en'
      };

      if (location) {
        requestBody.locationBias = {
          circle: {
            center: {
              latitude: location.lat,
              longitude: location.lng
            },
            radius: 50000 // 50km radius
          }
        };
      }

      console.log('📤 Sending request to Google Places API:', {
        url: `${this.baseURL}:searchText`,
        body: requestBody
      });

      const response = await axios.post(`${this.baseURL}:searchText`, requestBody, config);

      console.log('✅ Google Places API response received:', response.data.places?.length || 0, 'places');

      const formattedPlaces = this.formatPlacesResponse(response.data.places || []);

      // Cache the response
      this.setCachedResponse(cacheKey, formattedPlaces);

      return formattedPlaces;
    } catch (error) {
      console.error('❌ Error searching places:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      // If it's a 403 error, provide more specific information
      if (error.response?.status === 403) {
        console.error('🚫 Google Places API returned 403 Forbidden. Check:');
        console.error('   1. API key is valid and active');
        console.error('   2. Places API is enabled in Google Cloud Console');
        console.error('   3. Billing is set up for the project');
        console.error('   4. API key has proper restrictions/permissions');
        throw new Error('Google Places API access denied. Please check API key configuration.');
      }

      throw new Error(`Failed to search places: ${error.message}`);
    }
  }

  async getPlaceDetails(placeId) {
    try {
      const config = {
        headers: {
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': [
            'id',
            'displayName',
            'formattedAddress',
            'location',
            'rating',
            'userRatingCount',
            'photos',
            'priceLevel',
            'types',
            'websiteUri',
            'googleMapsUri',
            'internationalPhoneNumber',
            'openingHours',
            'reviews'
          ].join(',')
        }
      };

      const response = await axios.get(`${this.baseURL}/${placeId}`, config);
      
      return this.formatPlaceDetails(response.data);
    } catch (error) {
      console.error('Error getting place details:', error);
      throw new Error('Failed to get place details. Please try again.');
    }
  }

  async getPlacePhotos(photoReference, maxWidth = 600, maxHeight = 600) {
    try {
      const photoUrl = `${this.photoBaseURL}/${photoReference}/media?maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}&key=${this.apiKey}`;
      return photoUrl;
    } catch (error) {
      console.error('Error getting place photo:', error);
      return null;
    }
  }

  async getNearbyPlaces(location, type = 'tourist_attraction', radius = 10000) {
    try {
      const config = {
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
        }
      };

      const requestBody = {
        includedTypes: [type],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: location.lat,
              longitude: location.lng
            },
            radius: radius
          }
        }
      };

      const response = await axios.post(`${this.baseURL}:searchNearby`, requestBody, config);
      
      return this.formatPlacesResponse(response.data.places || []);
    } catch (error) {
      console.error('Error getting nearby places:', error);
      throw new Error('Failed to get nearby places. Please try again.');
    }
  }

  formatPlacesResponse(places) {
    return places.map(place => ({
      id: place.id,
      name: place.displayName?.text || 'Unknown',
      address: place.formattedAddress || 'Address not available',
      location: {
        lat: place.location?.latitude || 0,
        lng: place.location?.longitude || 0
      },
      rating: place.rating || 0,
      photos: place.photos ? place.photos.map(photo => ({
        reference: photo.name,
        url: this.getPlacePhotos(photo.name)
      })) : [],
      priceLevel: place.priceLevel || 0,
      types: place.types || [],
      websiteUrl: place.websiteUri || null,
      googleMapsUrl: place.googleMapsUri || null
    }));
  }

  formatPlaceDetails(place) {
    return {
      id: place.id,
      name: place.displayName?.text || 'Unknown',
      address: place.formattedAddress || 'Address not available',
      location: {
        lat: place.location?.latitude || 0,
        lng: place.location?.longitude || 0
      },
      rating: place.rating || 0,
      userRatingCount: place.userRatingCount || 0,
      photos: place.photos ? place.photos.map(photo => ({
        reference: photo.name,
        url: this.getPlacePhotos(photo.name)
      })) : [],
      priceLevel: place.priceLevel || 0,
      types: place.types || [],
      websiteUrl: place.websiteUri || null,
      googleMapsUrl: place.googleMapsUri || null,
      phoneNumber: place.internationalPhoneNumber || null,
      openingHours: place.openingHours || null,
      reviews: place.reviews ? place.reviews.slice(0, 5) : [] // Limit to 5 reviews
    };
  }
}

export default new PlacesService();
