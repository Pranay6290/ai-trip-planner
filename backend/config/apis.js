import dotenv from 'dotenv';

dotenv.config();

// API Configuration with quotas and monitoring
export const apiConfig = {
  // Google Services
  google: {
    places: {
      apiKey: process.env.GOOGLE_PLACES_API_KEY,
      baseUrl: 'https://places.googleapis.com/v1',
      quotas: {
        requestsPerDay: 100000,
        requestsPerMinute: 1000,
        requestsPerSecond: 100
      },
      endpoints: {
        searchText: '/places:searchText',
        searchNearby: '/places:searchNearby',
        placeDetails: '/places/{place_id}',
        placePhotos: '/{photo_reference}/media'
      }
    },
    maps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY,
      baseUrl: 'https://maps.googleapis.com/maps/api',
      quotas: {
        requestsPerDay: 25000,
        requestsPerMinute: 500
      },
      endpoints: {
        directions: '/directions/json',
        distanceMatrix: '/distancematrix/json',
        geocoding: '/geocode/json',
        timezone: '/timezone/json'
      }
    },
    gemini: {
      apiKey: process.env.GOOGLE_GEMINI_AI_API_KEY,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-1.5-flash',
      quotas: {
        requestsPerDay: 1500,
        requestsPerMinute: 15,
        tokensPerMinute: 1000000
      }
    }
  },

  // Weather Service
  weather: {
    provider: 'openweathermap', // or 'weatherapi'
    apiKey: process.env.WEATHER_API_KEY,
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    quotas: {
      requestsPerDay: 1000,
      requestsPerMinute: 60
    },
    endpoints: {
      current: '/weather',
      forecast: '/forecast',
      onecall: '/onecall'
    }
  },

  // Currency Exchange
  currency: {
    provider: 'exchangerate-api',
    apiKey: process.env.CURRENCY_API_KEY,
    baseUrl: 'https://v6.exchangerate-api.com/v6',
    quotas: {
      requestsPerMonth: 1500
    }
  },

  // Analytics
  analytics: {
    google: {
      measurementId: process.env.GA_MEASUREMENT_ID,
      apiSecret: process.env.GA_API_SECRET
    },
    mixpanel: {
      token: process.env.MIXPANEL_TOKEN
    }
  }
};

// Rate limiting configuration
export const rateLimits = {
  global: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // requests per window
  },
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100 // requests per window per IP
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // login attempts per window
  },
  ai: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10 // AI requests per minute per user
  }
};

// API monitoring configuration
export const monitoring = {
  enabled: process.env.NODE_ENV === 'production',
  alertThresholds: {
    errorRate: 0.05, // 5% error rate
    responseTime: 2000, // 2 seconds
    quotaUsage: 0.8 // 80% quota usage
  },
  webhooks: {
    slack: process.env.SLACK_WEBHOOK_URL,
    discord: process.env.DISCORD_WEBHOOK_URL
  }
};

export default {
  apiConfig,
  rateLimits,
  monitoring
};
