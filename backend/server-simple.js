import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import aiService from './services/aiService.js';
import nextLevelAIService from './services/nextLevelAIService.js';
import placesService from './services/placesService.js';
// import envValidator from './utils/envValidator.js';

dotenv.config();

// Validate environment on startup - temporarily disabled
// const envValidation = envValidator.validate();
// if (!envValidation.isValid) {
//   console.error('❌ Environment validation failed. Please check your .env file.');
//   process.exit(1);
// }

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openweathermap.org", "https://places.googleapis.com"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// API-specific rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 API requests per windowMs
  message: {
    error: 'Too many API requests',
    message: 'Please try again later'
  }
});
app.use('/api/', apiLimiter);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing with size limits
app.use(express.json({
  limit: '1mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Add request logging for debugging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic API endpoints
app.get('/api/status', (_req, res) => {
  res.json({
    message: 'TripCraft Backend API is running',
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'GET /api/status',
      'POST /api/trips/generate',
      'GET /api/places/search'
    ]
  });
});

// Handle OPTIONS preflight for trip generation
app.options('/api/trips/generate', (_req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Input validation middleware
const validateTripInput = (req, res, next) => {
  const { destination, duration, travelers, budget } = req.body;
  const errors = [];

  if (!destination || typeof destination !== 'string' || destination.trim().length < 2) {
    errors.push('Destination must be a valid string with at least 2 characters');
  }

  if (!duration || !Number.isInteger(duration) || duration < 1 || duration > 30) {
    errors.push('Duration must be an integer between 1 and 30 days');
  }

  if (!travelers || !Number.isInteger(travelers) || travelers < 1 || travelers > 20) {
    errors.push('Travelers must be an integer between 1 and 20');
  }

  if (!budget || !Number.isInteger(budget) || budget < 1000 || budget > 10000000) {
    errors.push('Budget must be an integer between 1,000 and 10,000,000');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input',
      details: errors
    });
  }

  next();
};

// Trip generation endpoint (using real AI) - No auth required
app.post('/api/trips/generate', validateTripInput, async (req, res) => {
  // Set CORS headers explicitly
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  try {
    const { destination, duration, travelers, budget, interests } = req.body;

    console.log('🎯 Generating trip with AI:', { destination, duration, travelers, budget });

    // Use real AI service
    const tripPlan = await aiService.generateTrip({
      destination,
      duration,
      travelers,
      budget,
      interests
    });

    // If AI service returns data, use it; otherwise use fallback
    const finalTripPlan = tripPlan || {
      id: `trip_${Date.now()}`,
      tripSummary: {
        destination: destination || 'India',
        duration: duration || 3,
        travelers: `${travelers || 2} people`,
        budget: `₹${budget?.toLocaleString() || '15,000'}`,
        currency: 'INR',
        totalEstimatedCost: `₹${Math.floor((budget || 15000) * 0.9)}`
      },
      hotels: [
        {
          hotelName: `Heritage Hotel ${destination || 'India'}`,
          hotelAddress: `Central ${destination || 'India'}`,
          price: `₹${Math.floor((budget || 15000) / (duration || 3) / 2)} per night`,
          hotelImageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
          geoCoordinates: { lat: 20.5937, lng: 78.9629 },
          rating: 4.2,
          description: 'Comfortable accommodation with modern amenities'
        }
      ],
      itinerary: Array.from({ length: duration || 3 }, (_, i) => ({
        day: i + 1,
        theme: i === 0 ? 'Arrival & Local Exploration' : 
               i === (duration || 3) - 1 ? 'Departure & Shopping' : 
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
          },
          {
            placeName: `Local Restaurant ${i + 1}`,
            placeDetails: 'Authentic local cuisine experience',
            placeImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
            geoCoordinates: { lat: 20.5937, lng: 78.9629 },
            ticketPricing: '₹500 per person',
            rating: 4.3,
            timeToTravel: '15 minutes',
            bestTimeToVisit: 'Afternoon'
          }
        ]
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'backend-api',
        version: '1.0.0'
      }
    };
    
    res.json({
      success: true,
      data: tripPlan
    });
    
  } catch (error) {
    console.error('❌ Trip generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate trip',
      message: error.message
    });
  }
});

// Next-level trip generation endpoint
app.post('/api/trips/generate-next-level', validateTripInput, async (req, res) => {
  // Set CORS headers explicitly
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  try {
    console.log('🚀 Received next-level trip generation request:', req.body);

    const {
      destination,
      duration,
      travelers,
      budget,
      interests = [],
      pace = 'moderate',
      preferences = {}
    } = req.body;

    // Validate pace
    const validPaces = ['relaxed', 'moderate', 'packed'];
    if (!validPaces.includes(pace)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pace',
        validPaces
      });
    }

    // Generate next-level trip
    const trip = await nextLevelAIService.generateNextLevelTrip({
      destination,
      duration,
      travelers,
      budget,
      interests,
      pace,
      preferences
    });

    console.log('🎉 Next-level trip generated successfully');
    res.json({
      success: true,
      data: trip,
      generatedAt: new Date().toISOString(),
      version: '2.0',
      features: [
        'Optimized attraction count per day',
        'Real-time budget breakdown',
        'Travel time optimization',
        'Local food recommendations',
        'Weather considerations',
        'Cultural insights'
      ]
    });

  } catch (error) {
    console.error('❌ Error generating next-level trip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate next-level trip',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Places search endpoint (using real Google Places API)
app.get('/api/places/search', async (req, res) => {
  try {
    const { query, lat, lng, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    console.log('🔍 Searching places with Google API:', query);

    let location = null;
    if (lat && lng) {
      location = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };
    }

    try {
      // Use real Google Places API
      const places = await placesService.searchPlaces(query, location);

      res.json({
        success: true,
        data: places.slice(0, parseInt(limit)),
        count: places.length,
        query: query,
        source: 'google-places-api'
      });
    } catch (placesError) {
      console.warn('⚠️ Google Places API failed, using fallback:', placesError.message);

      // Generate fallback places data
      const fallbackPlaces = Array.from({ length: Math.min(parseInt(limit), 5) }, (_, i) => ({
        id: `fallback_${i + 1}`,
        displayName: { text: `${query} ${['Heritage Site', 'Local Market', 'Restaurant', 'Park', 'Museum'][i] || 'Attraction'}` },
        formattedAddress: `${query}, India`,
        rating: 4.0 + Math.random() * 1.0,
        priceLevel: Math.floor(Math.random() * 4) + 1,
        types: ['tourist_attraction'],
        photos: [{ name: 'fallback_photo' }]
      }));

      res.json({
        success: true,
        data: fallbackPlaces,
        count: fallbackPlaces.length,
        query: query,
        source: 'fallback',
        note: 'Using fallback data due to API limitations'
      });
    }

  } catch (error) {
    console.error('❌ Places search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search places',
      message: error.message
    });
  }
});

// Nearby places search endpoint (to avoid CORS)
app.get('/api/places/nearby', async (req, res) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { lat, lng, radius = 5000, type = 'tourist_attraction' } = req.query;

    console.log('🔍 Nearby places request:', { lat, lng, radius, type });

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates provided'
      });
    }

    console.log('✅ Valid coordinates:', { latitude, longitude });

    // Generate enhanced fallback nearby places
    const placeTypes = {
      'tourist_attraction': ['Temple', 'Museum', 'Park', 'Monument', 'Gallery'],
      'restaurant': ['Restaurant', 'Cafe', 'Food Court', 'Street Food', 'Fine Dining'],
      'food': ['Local Eatery', 'Traditional Restaurant', 'Snack Bar', 'Sweet Shop', 'Food Stall'],
      'lodging': ['Hotel', 'Guest House', 'Resort', 'Homestay', 'Lodge']
    };

    const typeNames = placeTypes[type] || ['Place', 'Location', 'Spot', 'Venue', 'Destination'];

    const fallbackPlaces = Array.from({ length: 5 }, (_, i) => ({
      placeId: `nearby_${type}_${latitude}_${longitude}_${i + 1}`,
      name: `${typeNames[i % typeNames.length]} ${i + 1}`,
      address: `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      location: { lat: latitude, lng: longitude },
      rating: Math.round((4.0 + Math.random() * 1.0) * 10) / 10,
      priceLevel: Math.floor(Math.random() * 4) + 1,
      photos: [],
      types: [type],
      openNow: Math.random() > 0.2 // 80% chance of being open
    }));

    res.json({
      success: true,
      data: fallbackPlaces,
      count: fallbackPlaces.length,
      source: 'backend-generated'
    });

  } catch (error) {
    console.error('❌ Nearby places search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search nearby places',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 TripCraft Backend Server Started Successfully!
📍 Server running on: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health check: http://localhost:${PORT}/health
🔗 API status: http://localhost:${PORT}/api/status
⏰ Started at: ${new Date().toISOString()}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
