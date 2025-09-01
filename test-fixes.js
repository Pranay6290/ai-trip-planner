// Quick test script to verify all fixes are working
import fetch from 'node-fetch';

async function testAllFixes() {
  console.log('🧪 Testing All Fixes...\n');

  // Test 1: Backend Health Check
  try {
    console.log('1. Testing Backend Health...');
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Backend Health:', healthData.status);
  } catch (error) {
    console.log('❌ Backend Health failed:', error.message);
  }

  // Test 2: Places API
  try {
    console.log('\n2. Testing Places API...');
    const placesResponse = await fetch('http://localhost:5000/api/places/search?query=Mumbai&limit=3');
    const placesData = await placesResponse.json();
    console.log('✅ Places API:', {
      success: placesData.success,
      count: placesData.count,
      source: placesData.source
    });
  } catch (error) {
    console.log('❌ Places API failed:', error.message);
  }

  // Test 3: Trip Generation (POST)
  try {
    console.log('\n3. Testing Trip Generation...');
    const tripResponse = await fetch('http://localhost:5000/api/trips/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        destination: 'Mumbai',
        duration: 3,
        travelers: 2,
        budget: 25000,
        interests: ['culture', 'food']
      })
    });
    
    if (tripResponse.status === 401) {
      console.log('❌ Trip Generation: 401 Unauthorized - CORS issue not fixed');
    } else {
      const tripData = await tripResponse.json();
      console.log('✅ Trip Generation:', {
        success: tripData.success,
        status: tripResponse.status
      });
    }
  } catch (error) {
    console.log('❌ Trip Generation failed:', error.message);
  }

  // Test 4: Nearby Places
  try {
    console.log('\n4. Testing Nearby Places...');
    const nearbyResponse = await fetch('http://localhost:5000/api/places/nearby?lat=19.0760&lng=72.8777&radius=5000&type=restaurant');
    
    if (nearbyResponse.status === 500) {
      console.log('❌ Nearby Places: 500 Internal Server Error - not fixed');
    } else {
      const nearbyData = await nearbyResponse.json();
      console.log('✅ Nearby Places:', {
        success: nearbyData.success,
        count: nearbyData.count,
        status: nearbyResponse.status
      });
    }
  } catch (error) {
    console.log('❌ Nearby Places failed:', error.message);
  }

  console.log('\n🎉 Fix Testing Complete!');
}

testAllFixes().catch(console.error);
