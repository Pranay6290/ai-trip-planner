// Firebase Test Utilities
// Made by Pranay Gupta

import { auth, db } from '../service/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  const results = {
    auth: { status: 'pending', message: '', error: null },
    firestore: { status: 'pending', message: '', error: null },
    overall: { status: 'pending', message: '' }
  };

  console.log('🧪 Starting Firebase connection test...');

  // Test Authentication
  try {
    if (auth) {
      results.auth.status = 'success';
      results.auth.message = 'Firebase Auth initialized successfully';
      console.log('✅ Firebase Auth: OK');
    } else {
      throw new Error('Firebase Auth not initialized');
    }
  } catch (error) {
    results.auth.status = 'error';
    results.auth.message = error.message;
    results.auth.error = error;
    console.error('❌ Firebase Auth:', error.message);
  }

  // Test Firestore
  try {
    if (db) {
      // Try to read from a test collection (this won't fail even if collection doesn't exist)
      const testCollection = collection(db, 'test');
      const testQuery = query(testCollection);
      await getDocs(testQuery);
      
      results.firestore.status = 'success';
      results.firestore.message = 'Firestore connection successful';
      console.log('✅ Firestore: OK');
    } else {
      throw new Error('Firestore not initialized');
    }
  } catch (error) {
    results.firestore.status = 'error';
    results.firestore.message = error.message;
    results.firestore.error = error;
    console.error('❌ Firestore:', error.message);
  }

  // Overall status
  if (results.auth.status === 'success' && results.firestore.status === 'success') {
    results.overall.status = 'success';
    results.overall.message = 'All Firebase services are working correctly!';
    console.log('🎉 Firebase test completed successfully!');
  } else {
    results.overall.status = 'error';
    results.overall.message = 'Some Firebase services have issues';
    console.log('⚠️ Firebase test completed with issues');
  }

  return results;
};

export const testUserTripsQuery = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required for testing trips query');
  }

  console.log('🧪 Testing user trips query for user:', userId);

  try {
    // This is the exact query that will be used in the app
    const tripsQuery = query(
      collection(db, 'trips'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(tripsQuery);
    const trips = [];
    
    querySnapshot.forEach((doc) => {
      trips.push({ id: doc.id, ...doc.data() });
    });

    console.log('✅ Query successful! Found', trips.length, 'trips');
    return {
      success: true,
      tripsCount: trips.length,
      trips: trips,
      message: `Query successful! Found ${trips.length} trips`
    };
  } catch (error) {
    console.error('❌ Query failed:', error);
    
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      const indexUrl = error.message.match(/https:\/\/[^\s]+/)?.[0];
      console.log('🔗 Index creation required. Click this link:');
      console.log(indexUrl);
      
      return {
        success: false,
        error: error,
        indexRequired: true,
        indexUrl: indexUrl,
        message: 'Index required for this query. Check console for creation link.'
      };
    }
    
    return {
      success: false,
      error: error,
      message: `Query failed: ${error.message}`
    };
  }
};

export const createTestTrip = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required for creating test trip');
  }

  console.log('🧪 Creating test trip for user:', userId);

  try {
    const testTrip = {
      userId: userId,
      title: 'Test Trip - Firebase Connection',
      destination: {
        name: 'Test Destination',
        location: { lat: 40.7128, lng: -74.0060 }
      },
      duration: 3,
      travelers: 2,
      budget: { max: 1000 },
      userSelection: {
        destination: { name: 'Test Destination' },
        duration: 3,
        travelers: 2,
        budget: { max: 1000 }
      },
      tripData: {
        tripSummary: {
          destination: 'Test Destination',
          duration: 3,
          totalEstimatedCost: 800
        },
        itinerary: [
          {
            day: 1,
            date: new Date().toISOString().split('T')[0],
            activities: [
              {
                name: 'Test Activity',
                description: 'This is a test activity',
                location: { name: 'Test Location' },
                timeSlot: { startTime: '09:00', endTime: '11:00' }
              }
            ]
          }
        ]
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      version: 1
    };

    const docRef = await addDoc(collection(db, 'trips'), testTrip);
    
    console.log('✅ Test trip created with ID:', docRef.id);
    return {
      success: true,
      tripId: docRef.id,
      message: `Test trip created successfully with ID: ${docRef.id}`
    };
  } catch (error) {
    console.error('❌ Failed to create test trip:', error);
    return {
      success: false,
      error: error,
      message: `Failed to create test trip: ${error.message}`
    };
  }
};

export const runFullFirebaseTest = async (userId = null) => {
  console.log('🚀 Running full Firebase test suite...');
  
  const results = {
    connection: null,
    userTrips: null,
    testTrip: null,
    overall: { status: 'pending', message: '' }
  };

  // Test 1: Basic connection
  results.connection = await testFirebaseConnection();

  // Test 2: User trips query (if user ID provided)
  if (userId && results.connection.overall.status === 'success') {
    results.userTrips = await testUserTripsQuery(userId);
    
    // Test 3: Create test trip (if query works or if we want to test creation)
    if (results.userTrips.success || results.userTrips.indexRequired) {
      results.testTrip = await createTestTrip(userId);
    }
  }

  // Overall results
  const hasErrors = Object.values(results).some(result => 
    result && (result.status === 'error' || result.success === false)
  );

  if (!hasErrors) {
    results.overall.status = 'success';
    results.overall.message = 'All Firebase tests passed! 🎉';
  } else {
    results.overall.status = 'partial';
    results.overall.message = 'Some tests passed, some need attention. Check individual results.';
  }

  console.log('📊 Full test results:', results);
  return results;
};

// Utility function to run tests from browser console
window.testFirebase = {
  connection: testFirebaseConnection,
  userTrips: testUserTripsQuery,
  createTrip: createTestTrip,
  full: runFullFirebaseTest
};

console.log('🧪 Firebase test utilities loaded. Use window.testFirebase to run tests.');
