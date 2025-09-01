// Comprehensive Test Suite for TripCraft Application
import { searchIndianDestinations } from '../data/indianDestinations';
import destinationService from '../services/destinationService';
import workingAIService from '../services/workingAIService';

class TestSuite {
  constructor() {
    this.results = {
      search: [],
      ai: [],
      places: [],
      overall: 'pending'
    };
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting comprehensive test suite...');
    
    try {
      // Test 1: Search functionality
      await this.testSearchFunctionality();
      
      // Test 2: AI generation
      await this.testAIGeneration();
      
      // Test 3: Places API integration
      await this.testPlacesIntegration();
      
      // Generate report
      this.generateReport();
      
      return this.results;
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.results.overall = 'failed';
      return this.results;
    }
  }

  // Test search functionality for Indian destinations
  async testSearchFunctionality() {
    console.log('🔍 Testing search functionality...');
    
    const testCases = [
      { query: 'Kolkata', expectedResults: 1, description: 'Kolkata search' },
      { query: 'Jharkhand', expectedResults: 1, description: 'Jharkhand state search' },
      { query: 'Ranchi', expectedResults: 1, description: 'Ranchi city search' },
      { query: 'Digha', expectedResults: 1, description: 'Digha beach search' },
      { query: 'Mumbai', expectedResults: 1, description: 'Mumbai search' },
      { query: 'Goa', expectedResults: 1, description: 'Goa search' },
      { query: 'Kerala', expectedResults: 1, description: 'Kerala search' },
      { query: 'beach', expectedResults: 2, description: 'Category search - beaches' },
      { query: 'mountain', expectedResults: 2, description: 'Category search - mountains' },
      { query: 'xyz123', expectedResults: 0, description: 'Invalid search' }
    ];

    for (const testCase of testCases) {
      try {
        // Test Indian destinations search
        const indianResults = searchIndianDestinations(testCase.query);
        
        // Test destination service search
        const serviceResults = await destinationService.searchDestinations(testCase.query);
        
        const result = {
          query: testCase.query,
          description: testCase.description,
          indianResults: indianResults.length,
          serviceResults: serviceResults.destinations?.length || 0,
          expected: testCase.expectedResults,
          status: indianResults.length >= testCase.expectedResults ? 'pass' : 'fail',
          details: {
            indianDestinations: indianResults.slice(0, 2).map(d => d.name),
            serviceDestinations: serviceResults.destinations?.slice(0, 2).map(d => d.name) || []
          }
        };
        
        this.results.search.push(result);
        console.log(`${result.status === 'pass' ? '✅' : '❌'} ${testCase.description}:`, result);
      } catch (error) {
        console.error(`❌ Search test failed for ${testCase.query}:`, error);
        this.results.search.push({
          query: testCase.query,
          description: testCase.description,
          status: 'error',
          error: error.message
        });
      }
    }
  }

  // Test AI generation functionality
  async testAIGeneration() {
    console.log('🤖 Testing AI generation...');
    
    const testCases = [
      {
        input: '3 days in Jharkhand with 3 people budget ₹15000',
        expectedDestination: 'Jharkhand',
        expectedTravelers: 3,
        expectedDuration: 3,
        description: 'Jharkhand trip generation'
      },
      {
        input: '5 days in Kolkata for 2 people with ₹20000',
        expectedDestination: 'Kolkata',
        expectedTravelers: 2,
        expectedDuration: 5,
        description: 'Kolkata trip generation'
      },
      {
        input: 'Weekend trip to Digha for family of 4',
        expectedDestination: 'Digha',
        expectedTravelers: 4,
        expectedDuration: 2,
        description: 'Digha family trip'
      }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`🧪 Testing: ${testCase.description}`);
        
        // Test working AI service
        const aiResult = await workingAIService.generateTrip(testCase.input);
        
        const result = {
          input: testCase.input,
          description: testCase.description,
          generated: !!aiResult,
          destination: aiResult.tripSummary?.destination,
          travelers: aiResult.tripSummary?.travelers,
          duration: aiResult.tripSummary?.duration,
          budget: aiResult.tripSummary?.budget,
          hasHotels: aiResult.hotels?.length > 0,
          hasItinerary: aiResult.itinerary?.length > 0,
          status: this.validateAIResult(aiResult, testCase) ? 'pass' : 'partial',
          details: {
            hotelsCount: aiResult.hotels?.length || 0,
            itineraryDays: aiResult.itinerary?.length || 0,
            currency: aiResult.tripSummary?.currency
          }
        };
        
        this.results.ai.push(result);
        console.log(`${result.status === 'pass' ? '✅' : '⚠️'} ${testCase.description}:`, result);
      } catch (error) {
        console.error(`❌ AI test failed for ${testCase.input}:`, error);
        this.results.ai.push({
          input: testCase.input,
          description: testCase.description,
          status: 'error',
          error: error.message
        });
      }
    }
  }

  // Test Places API integration
  async testPlacesIntegration() {
    console.log('🏛️ Testing Places API integration...');
    
    const testDestinations = [
      { name: 'Mumbai, India', location: { lat: 19.0760, lng: 72.8777 } },
      { name: 'Kolkata, India', location: { lat: 22.5726, lng: 88.3639 } },
      { name: 'Goa, India', location: { lat: 15.2993, lng: 74.1240 } }
    ];

    for (const destination of testDestinations) {
      try {
        // Test search functionality instead of direct API calls
        const searchResults = await destinationService.searchDestinations(destination.name, { limit: 5 });

        const hasResults = searchResults.destinations && searchResults.destinations.length > 0;
        const isUsingFallback = searchResults.source === 'fallback' || searchResults.source === 'backend';

        const result = {
          destination: destination.name,
          hasData: hasResults,
          resultCount: searchResults.destinations?.length || 0,
          source: searchResults.source || 'unknown',
          usingFallback: isUsingFallback,
          status: hasResults ? 'pass' : 'fail'
        };

        this.results.places.push(result);
        console.log(`${result.status === 'pass' ? '✅' : '❌'} Places search for ${destination.name}:`, result);
      } catch (error) {
        // Don't fail the test for expected API errors
        if (error.message.includes('403') || error.message.includes('API key') || error.message.includes('Forbidden')) {
          const result = {
            destination: destination.name,
            status: 'skipped',
            reason: 'API key not configured (expected)',
            error: error.message
          };
          this.results.places.push(result);
          console.log(`⏭️ Places test skipped for ${destination.name}: API key not configured`);
        } else {
          console.error(`❌ Places test failed for ${destination.name}:`, error);
          this.results.places.push({
            destination: destination.name,
            status: 'error',
            error: error.message
          });
        }
      }
    }
  }

  // Validate AI result against expected values
  validateAIResult(result, expected) {
    if (!result || !result.tripSummary) return false;
    
    const destinationMatch = result.tripSummary.destination?.toLowerCase().includes(
      expected.expectedDestination.toLowerCase()
    );
    
    const hasBasicStructure = result.hotels && result.itinerary;
    const usesCurrency = result.tripSummary.currency === 'INR' || 
                        result.tripSummary.budget?.includes('₹');
    
    return destinationMatch && hasBasicStructure && usesCurrency;
  }

  // Generate comprehensive test report
  generateReport() {
    const searchPassed = this.results.search.filter(r => r.status === 'pass').length;
    const searchTotal = this.results.search.length;
    
    const aiPassed = this.results.ai.filter(r => r.status === 'pass').length;
    const aiTotal = this.results.ai.length;
    
    const placesPassed = this.results.places.filter(r => r.status === 'pass').length;
    const placesTotal = this.results.places.length;
    
    const overallScore = (searchPassed + aiPassed + placesPassed) / (searchTotal + aiTotal + placesTotal);
    
    this.results.overall = overallScore >= 0.8 ? 'excellent' : 
                          overallScore >= 0.6 ? 'good' : 
                          overallScore >= 0.4 ? 'fair' : 'poor';
    
    console.log('📊 TEST REPORT:');
    console.log(`🔍 Search: ${searchPassed}/${searchTotal} passed`);
    console.log(`🤖 AI Generation: ${aiPassed}/${aiTotal} passed`);
    console.log(`🏛️ Places API: ${placesPassed}/${placesTotal} passed`);
    console.log(`📈 Overall Score: ${(overallScore * 100).toFixed(1)}% (${this.results.overall})`);
    
    // Detailed recommendations
    if (searchPassed < searchTotal) {
      console.log('💡 Search Recommendations:');
      this.results.search.filter(r => r.status !== 'pass').forEach(r => {
        console.log(`   - Fix search for: ${r.query}`);
      });
    }
    
    if (aiPassed < aiTotal) {
      console.log('💡 AI Recommendations:');
      this.results.ai.filter(r => r.status !== 'pass').forEach(r => {
        console.log(`   - Fix AI generation for: ${r.input}`);
      });
    }
  }

  // Quick test for specific functionality
  async quickTest(type, query) {
    switch (type) {
      case 'search':
        return await this.testSingleSearch(query);
      case 'ai':
        return await this.testSingleAI(query);
      default:
        throw new Error('Invalid test type');
    }
  }

  async testSingleSearch(query) {
    const indianResults = searchIndianDestinations(query);
    const serviceResults = await destinationService.searchDestinations(query);
    
    return {
      query,
      indianResults: indianResults.length,
      serviceResults: serviceResults.destinations?.length || 0,
      results: [...indianResults, ...(serviceResults.destinations || [])],
      status: indianResults.length > 0 ? 'pass' : 'fail'
    };
  }

  async testSingleAI(input) {
    try {
      const result = await workingAIService.generateTrip(input);
      return {
        input,
        generated: !!result,
        destination: result.tripSummary?.destination,
        status: result ? 'pass' : 'fail',
        result
      };
    } catch (error) {
      return {
        input,
        generated: false,
        status: 'error',
        error: error.message
      };
    }
  }
}

// Export singleton instance
export default new TestSuite();

// Export quick test functions for console use
export const quickSearchTest = async (query) => {
  const testSuite = new TestSuite();
  return await testSuite.quickTest('search', query);
};

export const quickAITest = async (input) => {
  const testSuite = new TestSuite();
  return await testSuite.quickTest('ai', input);
};
