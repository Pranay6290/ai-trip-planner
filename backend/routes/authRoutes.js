import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getFirestore, getAuth } from '../config/firebase.js';

const router = express.Router();

// Verify token endpoint
router.post('/verify-token', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name || req.user.email?.split('@')[0],
        emailVerified: req.user.email_verified
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({
      error: 'Token verification failed',
      message: error.message
    });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const db = getFirestore();
    if (!db) {
      return res.status(500).json({
        error: 'Database unavailable',
        message: 'Unable to connect to database'
      });
    }

    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      // Create user document if it doesn't exist
      const userData = {
        uid: req.user.uid,
        email: req.user.email,
        displayName: req.user.name || req.user.email?.split('@')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        },
        stats: {
          tripsCreated: 0,
          tripsShared: 0,
          profileViews: 0
        }
      };

      await db.collection('users').doc(req.user.uid).set(userData);
      
      return res.json({
        success: true,
        data: userData
      });
    }

    const userData = userDoc.data();
    
    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      error: 'Failed to get user profile',
      message: error.message
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { displayName, preferences, bio, location } = req.body;
    const db = getFirestore();
    
    if (!db) {
      return res.status(500).json({
        error: 'Database unavailable',
        message: 'Unable to connect to database'
      });
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (displayName) updateData.displayName = displayName;
    if (preferences) updateData.preferences = { ...preferences };
    if (bio) updateData.bio = bio;
    if (location) updateData.location = location;

    await db.collection('users').doc(req.user.uid).update(updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updateData
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// Delete user account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const db = getFirestore();
    const auth = getAuth();
    
    if (!db || !auth) {
      return res.status(500).json({
        error: 'Services unavailable',
        message: 'Unable to connect to required services'
      });
    }

    // Delete user's trips
    const tripsSnapshot = await db
      .collection('trips')
      .where('userId', '==', req.user.uid)
      .get();

    const batch = db.batch();
    tripsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete user document
    batch.delete(db.collection('users').doc(req.user.uid));
    
    await batch.commit();

    // Delete user from Firebase Auth
    try {
      await auth.deleteUser(req.user.uid);
    } catch (authError) {
      console.warn('Could not delete user from Auth:', authError.message);
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({
      error: 'Failed to delete account',
      message: error.message
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const db = getFirestore();
    if (!db) {
      return res.status(500).json({
        error: 'Database unavailable',
        message: 'Unable to connect to database'
      });
    }

    // Get user's trips count
    const tripsSnapshot = await db
      .collection('trips')
      .where('userId', '==', req.user.uid)
      .get();

    const trips = [];
    let totalViews = 0;
    let totalLikes = 0;
    let publicTrips = 0;

    tripsSnapshot.forEach(doc => {
      const data = doc.data();
      trips.push(data);
      totalViews += data.views || 0;
      totalLikes += data.likes || 0;
      if (data.isPublic) publicTrips++;
    });

    const stats = {
      tripsCreated: trips.length,
      tripsShared: publicTrips,
      totalViews: totalViews,
      totalLikes: totalLikes,
      joinedDate: req.user.auth_time ? new Date(req.user.auth_time * 1000).toISOString() : null,
      lastActive: new Date().toISOString()
    };

    // Update user stats in database
    await db.collection('users').doc(req.user.uid).update({
      stats: stats,
      lastActive: stats.lastActive
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      error: 'Failed to get user statistics',
      message: error.message
    });
  }
});

export default router;
