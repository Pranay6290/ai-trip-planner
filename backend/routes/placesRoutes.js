import express from 'express';
import placesService from '../services/placesService.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Search places
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { query, lat, lng } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Missing query parameter',
        message: 'Search query is required'
      });
    }

    let location = null;
    if (lat && lng) {
      location = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };
    }

    try {
      const places = await placesService.searchPlaces(query, location);

      res.json({
        success: true,
        data: places,
        count: places.length,
        query: query,
        source: 'google-places-api'
      });
    } catch (placesError) {
      console.warn('⚠️ Places API failed, using fallback:', placesError.message);

      // Generate fallback places data
      const fallbackPlaces = Array.from({ length: 5 }, (_, i) => ({
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
    console.error('Error searching places:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
});

// Get place details
router.get('/details/:placeId', optionalAuth, async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({
        error: 'Missing place ID',
        message: 'Place ID is required'
      });
    }

    const placeDetails = await placesService.getPlaceDetails(placeId);

    res.json({
      success: true,
      data: placeDetails
    });
  } catch (error) {
    console.error('Error getting place details:', error);
    res.status(500).json({
      error: 'Failed to get place details',
      message: error.message
    });
  }
});

// Get nearby places
router.get('/nearby', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, type = 'tourist_attraction', radius = 10000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing location parameters',
        message: 'Latitude and longitude are required'
      });
    }

    const location = {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };

    const places = await placesService.getNearbyPlaces(
      location,
      type,
      parseInt(radius)
    );

    res.json({
      success: true,
      data: places,
      count: places.length,
      location: location,
      type: type,
      radius: parseInt(radius)
    });
  } catch (error) {
    console.error('Error getting nearby places:', error);
    res.status(500).json({
      error: 'Failed to get nearby places',
      message: error.message
    });
  }
});

// Get place photo
router.get('/photo/:photoReference', async (req, res) => {
  try {
    const { photoReference } = req.params;
    const { maxWidth = 600, maxHeight = 600 } = req.query;

    if (!photoReference) {
      return res.status(400).json({
        error: 'Missing photo reference',
        message: 'Photo reference is required'
      });
    }

    const photoUrl = await placesService.getPlacePhotos(
      photoReference,
      parseInt(maxWidth),
      parseInt(maxHeight)
    );

    if (!photoUrl) {
      return res.status(404).json({
        error: 'Photo not found',
        message: 'Unable to retrieve photo'
      });
    }

    res.json({
      success: true,
      data: {
        photoUrl: photoUrl,
        photoReference: photoReference
      }
    });
  } catch (error) {
    console.error('Error getting place photo:', error);
    res.status(500).json({
      error: 'Failed to get place photo',
      message: error.message
    });
  }
});

// Get popular destinations (predefined list)
router.get('/popular-destinations', async (req, res) => {
  try {
    const popularDestinations = [
      {
        name: 'Paris, France',
        description: 'The City of Light with iconic landmarks and romantic atmosphere',
        imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52',
        category: 'Cultural'
      },
      {
        name: 'Tokyo, Japan',
        description: 'Modern metropolis blending tradition with cutting-edge technology',
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
        category: 'Urban'
      },
      {
        name: 'Bali, Indonesia',
        description: 'Tropical paradise with beautiful beaches and rich culture',
        imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1',
        category: 'Beach'
      },
      {
        name: 'New York City, USA',
        description: 'The city that never sleeps with world-class attractions',
        imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
        category: 'Urban'
      },
      {
        name: 'Rome, Italy',
        description: 'Eternal city with ancient history and incredible cuisine',
        imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
        category: 'Historical'
      },
      {
        name: 'Dubai, UAE',
        description: 'Luxury destination with modern architecture and desert adventures',
        imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
        category: 'Luxury'
      },
      {
        name: 'London, England',
        description: 'Historic capital with royal palaces and cultural landmarks',
        imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
        category: 'Cultural'
      },
      {
        name: 'Santorini, Greece',
        description: 'Stunning island with white-washed buildings and sunset views',
        imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
        category: 'Beach'
      }
    ];

    res.json({
      success: true,
      data: popularDestinations,
      count: popularDestinations.length,
      message: 'Popular destinations curated by Pranay Gupta AI Trip Planner'
    });
  } catch (error) {
    console.error('Error getting popular destinations:', error);
    res.status(500).json({
      error: 'Failed to get popular destinations',
      message: error.message
    });
  }
});

export default router;
