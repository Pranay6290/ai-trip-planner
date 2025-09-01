// Quick status check utility
import { searchIndianDestinations } from '../data/indianDestinations';
import workingAIService from '../services/workingAIService';
import personalizationService from '../services/personalizationService';

export const runQuickStatusCheck = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  console.log('🔍 Running quick status check...');

  // Test 1: Search functionality
  try {
    const searchResults = searchIndianDestinations('Delhi');
    results.tests.search = {
      status: searchResults.length > 0 ? 'PASS' : 'FAIL',
      details: `Found ${searchResults.length} results for Delhi`,
      firstResult: searchResults[0]?.name || 'None'
    };
  } catch (error) {
    results.tests.search = {
      status: 'ERROR',
      error: error.message
    };
  }

  // Test 2: Visakhapatnam search
  try {
    const vizagResults = searchIndianDestinations('Visakhapatnam');
    const vizagAliasResults = searchIndianDestinations('Vizag');
    results.tests.visakhapatnam = {
      status: (vizagResults.length > 0 && vizagAliasResults.length > 0) ? 'PASS' : 'FAIL',
      details: `Visakhapatnam: ${vizagResults.length}, Vizag: ${vizagAliasResults.length}`,
      correctResult: vizagResults[0]?.name?.includes('Visakhapatnam') || false
    };
  } catch (error) {
    results.tests.visakhapatnam = {
      status: 'ERROR',
      error: error.message
    };
  }

  // Test 3: AI Service
  try {
    const startTime = Date.now();
    const aiResult = await workingAIService.generateTrip('2 days in Mumbai for 2 people budget ₹10000');
    const endTime = Date.now();
    
    results.tests.aiService = {
      status: aiResult && aiResult.tripSummary ? 'PASS' : 'FAIL',
      details: `Response time: ${endTime - startTime}ms`,
      hasItinerary: !!aiResult?.itinerary?.length,
      hasHotels: !!aiResult?.hotels?.length
    };
  } catch (error) {
    results.tests.aiService = {
      status: 'ERROR',
      error: error.message
    };
  }

  // Test 4: Personalization Service
  try {
    const profile = await personalizationService.initializeUserPreferences('test-user');
    results.tests.personalization = {
      status: profile ? 'PASS' : 'FAIL',
      details: 'User preferences initialized',
      hasPreferences: !!profile?.preferences
    };
  } catch (error) {
    results.tests.personalization = {
      status: 'ERROR',
      error: error.message
    };
  }

  // Calculate overall status
  const testStatuses = Object.values(results.tests).map(t => t.status);
  const hasError = testStatuses.includes('ERROR');
  const hasFail = testStatuses.includes('FAIL');
  
  results.overallStatus = hasError ? 'ERROR' : hasFail ? 'WARNING' : 'SUCCESS';
  results.summary = {
    total: testStatuses.length,
    passed: testStatuses.filter(s => s === 'PASS').length,
    failed: testStatuses.filter(s => s === 'FAIL').length,
    errors: testStatuses.filter(s => s === 'ERROR').length
  };

  console.log('✅ Status check completed:', results);
  return results;
};

// Export for use in components
export default {
  runQuickStatusCheck
};
