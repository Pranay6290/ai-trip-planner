import express from 'express';
import aiService from '../services/aiService.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { getFirestore } from '../config/firebase.js';

const router = express.Router();

// Generate a new trip plan
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { destination, days, budget, travelers, interests } = req.body;

    // Validate required fields
    if (!destination || !days || !budget || !travelers) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Destination, days, budget, and travelers are required'
      });
    }

    // Generate trip plan using Gemini AI
    console.log('🚀 Generating trip with AI service:', { destination, days, budget, travelers });

    const tripPlan = await aiService.generateTrip({
      destination,
      duration: days,
      budget,
      travelers,
      interests
    });

    // Save trip to Firestore
    const db = getFirestore();
    if (db) {
      const tripData = {
        ...tripPlan,
        userId: req.user.uid,
        userEmail: req.user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: false,
        likes: 0,
        views: 0
      };

      const docRef = await db.collection('trips').add(tripData);
      tripPlan.id = docRef.id;
    }

    res.status(201).json({
      success: true,
      message: 'Trip plan generated successfully',
      data: tripPlan
    });
  } catch (error) {
    console.error('Error generating trip:', error);
    res.status(500).json({
      error: 'Trip generation failed',
      message: error.message
    });
  }
});

// Get user's trips
router.get('/my-trips', authenticateToken, async (req, res) => {
  try {
    const db = getFirestore();
    if (!db) {
      return res.status(500).json({
        error: 'Database unavailable',
        message: 'Unable to connect to database'
      });
    }

    const tripsSnapshot = await db
      .collection('trips')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const trips = [];
    tripsSnapshot.forEach(doc => {
      trips.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: trips,
      count: trips.length
    });
  } catch (error) {
    console.error('Error fetching user trips:', error);
    res.status(500).json({
      error: 'Failed to fetch trips',
      message: error.message
    });
  }
});

// Get a specific trip by ID
router.get('/:tripId', optionalAuth, async (req, res) => {
  try {
    const { tripId } = req.params;
    const db = getFirestore();
    
    if (!db) {
      return res.status(500).json({
        error: 'Database unavailable',
        message: 'Unable to connect to database'
      });
    }

    const tripDoc = await db.collection('trips').doc(tripId).get();
    
    if (!tripDoc.exists) {
      return res.status(404).json({
        error: 'Trip not found',
        message: 'The requested trip does not exist'
      });
    }

    const tripData = tripDoc.data();
    
    // Check if user has access to this trip
    if (!tripData.isPublic && (!req.user || req.user.uid !== tripData.userId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view this trip'
      });
    }

    // Increment view count
    await db.collection('trips').doc(tripId).update({
      views: (tripData.views || 0) + 1
    });

    res.json({
      success: true,
      data: {
        id: tripId,
        ...tripData,
        views: (tripData.views || 0) + 1
      }
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({
      error: 'Failed to fetch trip',
      message: error.message
    });
  }
});

// Update trip
router.put('/:tripId', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const updates = req.body;
    const db = getFirestore();
    
    if (!db) {
      return res.status(500).json({
        error: 'Database unavailable',
        message: 'Unable to connect to database'
      });
    }

    const tripDoc = await db.collection('trips').doc(tripId).get();
    
    if (!tripDoc.exists) {
      return res.status(404).json({
        error: 'Trip not found',
        message: 'The requested trip does not exist'
      });
    }

    const tripData = tripDoc.data();
    
    // Check if user owns this trip
    if (req.user.uid !== tripData.userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own trips'
      });
    }

    // Update trip
    await db.collection('trips').doc(tripId).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Trip updated successfully'
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({
      error: 'Failed to update trip',
      message: error.message
    });
  }
});

// Delete trip
router.delete('/:tripId', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const db = getFirestore();
    
    if (!db) {
      return res.status(500).json({
        error: 'Database unavailable',
        message: 'Unable to connect to database'
      });
    }

    const tripDoc = await db.collection('trips').doc(tripId).get();
    
    if (!tripDoc.exists) {
      return res.status(404).json({
        error: 'Trip not found',
        message: 'The requested trip does not exist'
      });
    }

    const tripData = tripDoc.data();
    
    // Check if user owns this trip
    if (req.user.uid !== tripData.userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own trips'
      });
    }

    // Delete trip
    await db.collection('trips').doc(tripId).delete();

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({
      error: 'Failed to delete trip',
      message: error.message
    });
  }
});

// Get public trips (for discovery)
router.get('/public/discover', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const db = getFirestore();
    
    if (!db) {
      return res.status(500).json({
        error: 'Database unavailable',
        message: 'Unable to connect to database'
      });
    }

    const tripsSnapshot = await db
      .collection('trips')
      .where('isPublic', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const trips = [];
    tripsSnapshot.forEach(doc => {
      const data = doc.data();
      trips.push({
        id: doc.id,
        tripOverview: data.tripOverview,
        metadata: data.metadata,
        likes: data.likes || 0,
        views: data.views || 0,
        createdAt: data.createdAt
      });
    });

    res.json({
      success: true,
      data: trips,
      count: trips.length
    });
  } catch (error) {
    console.error('Error fetching public trips:', error);
    res.status(500).json({
      error: 'Failed to fetch public trips',
      message: error.message
    });
  }
});

export default router;
