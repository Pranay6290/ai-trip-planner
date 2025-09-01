import axios from 'axios';

// Backend API configuration
const BACKEND_BASE_URL = 'http://localhost:5000';

// Create axios instance with default config
const backendApi = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  },
});

// Request interceptor for logging
backendApi.interceptors.request.use(
  (config) => {
    console.log(`🔗 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
backendApi.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.message);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.warn('⚠️ API endpoint not found');
    } else if (error.response?.status >= 500) {
      console.error('🚨 Server error occurred');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Backend server is not running');
    }
    
    return Promise.reject(error);
  }
);

// API Methods
export const BackendApiService = {
  // Health check
  async checkHealth() {
    try {
      const response = await backendApi.get('/health');
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw new Error('Backend server is not available');
    }
  },

  // Get API status
  async getStatus() {
    try {
      const response = await backendApi.get('/api/status');
      return response.data;
    } catch (error) {
      console.error('❌ Status check failed:', error);
      throw new Error('Failed to get API status');
    }
  },

  // Generate trip
  async generateTrip(tripData) {
    try {
      console.log('🎯 Generating trip with backend:', tripData);
      const response = await backendApi.post('/api/trips/generate', tripData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to generate trip');
      }
    } catch (error) {
      console.error('❌ Trip generation failed:', error);
      
      // Return fallback data if backend fails
      if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
        console.log('🔄 Using fallback trip generation');
        return this.generateFallbackTrip(tripData);
      }
      
      throw error;
    }
  },

  // Search places
  async searchPlaces(query, limit = 10) {
    try {
      console.log('🔍 Searching places with backend:', query);
      const response = await backendApi.get('/api/places/search', {
        params: { query, limit }
      });
      
      if (response.data.success) {
        // Return in the format expected by destination service
        return {
          places: response.data.data,
          total: response.data.count || response.data.data.length,
          source: response.data.source || 'backend'
        };
      } else {
        throw new Error(response.data.error || 'Failed to search places');
      }
    } catch (error) {
      console.error('❌ Places search failed:', error);
      
      // Return fallback data if backend fails
      if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
        console.log('🔄 Using fallback places search');
        return this.generateFallbackPlaces(query, limit);
      }
      
      throw error;
    }
  },

  // Fallback trip generation
  generateFallbackTrip(tripData) {
    const { destination, duration = 3, travelers = 2, budget = 15000 } = tripData;
    
    return {
      id: `fallback_trip_${Date.now()}`,
      tripSummary: {
        destination: destination || 'India',
        duration: duration,
        travelers: `${travelers} people`,
        budget: `₹${budget.toLocaleString()}`,
        currency: 'INR',
        totalEstimatedCost: `₹${Math.floor(budget * 0.9)}`
      },
      hotels: [
        {
          hotelName: `Heritage Hotel ${destination || 'India'}`,
          hotelAddress: `Central ${destination || 'India'}`,
          price: `₹${Math.floor(budget / duration / 2)} per night`,
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
               `${destination || 'India'} Highlights`,
        activities: [
          {
            placeName: `Popular Attraction ${i + 1} in ${destination || 'India'}`,
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
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'frontend-fallback',
        version: '1.0.0'
      }
    };
  },

  // Fallback places search
  generateFallbackPlaces(query, limit) {
    const mockPlaces = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      id: `fallback_place_${i + 1}`,
      name: `${query} ${['Heritage Site', 'Local Market', 'Restaurant', 'Park', 'Museum'][i] || 'Attraction'}`,
      address: `${query}, India`,
      rating: 4.0 + Math.random() * 1.0,
      priceLevel: Math.floor(Math.random() * 4) + 1,
      types: ['tourist_attraction'],
      photos: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4']
    }));

    return {
      places: mockPlaces,
      total: mockPlaces.length,
      query,
      source: 'fallback'
    };
  }
};

// Test backend connectivity
export const testBackendConnection = async () => {
  try {
    const health = await BackendApiService.checkHealth();
    console.log('✅ Backend connection successful:', health);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
};

export default BackendApiService;
