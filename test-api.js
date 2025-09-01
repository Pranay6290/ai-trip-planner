// Quick API test script
import fetch from 'node-fetch';

async function testAPI() {
  console.log('🧪 Testing TripCraft APIs with your working keys...\n');

  // Test 1: Health Check
  try {
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.status);
  } catch (error) {
    console.log('❌ Health Check failed:', error.message);
  }

  // Test 2: Places Search (with your working Google Places API key)
  try {
    const placesResponse = await fetch('http://localhost:5000/api/places/search?query=Delhi&limit=2');
    const placesData = await placesResponse.json();
    console.log('✅ Places Search:', {
      success: placesData.success,
      count: placesData.count,
      source: placesData.source,
      firstPlace: placesData.data[0]?.name
    });
  } catch (error) {
    console.log('❌ Places Search failed:', error.message);
  }

  // Test 3: Trip Generation (with your working Gemini AI key)
  try {
    const tripResponse = await fetch('http://localhost:5000/api/trips/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        destination: 'Mumbai',
        duration: 3,
        travelers: 2,
        budget: 25000,
        interests: ['culture', 'food']
      })
    });
    
    const tripData = await tripResponse.json();
    console.log('✅ Trip Generation:', {
      success: tripData.success,
      destination: tripData.data?.tripSummary?.destination,
      source: tripData.data?.metadata?.source,
      hasItinerary: !!tripData.data?.itinerary
    });
  } catch (error) {
    console.log('❌ Trip Generation failed:', error.message);
  }

  console.log('\n🎉 API Testing Complete!');
}

testAPI();
