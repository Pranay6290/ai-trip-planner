import React, { useState } from 'react';
import { motion } from 'framer-motion';
import destinationService from '../../services/destinationService';
import enhancedAIService from '../../services/enhancedAIService';
import workingAIService from '../../services/workingAIService';
import enhancedTripService from '../../services/enhancedTripService';
import testSuite from '../../utils/testSuite';
import toast from 'react-hot-toast';

const SearchTest = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiTestQuery, setAiTestQuery] = useState('');
  const [aiResults, setAiResults] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [testSuiteResults, setTestSuiteResults] = useState(null);
  const [testSuiteLoading, setTestSuiteLoading] = useState(false);

  const testSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Testing search for:', searchQuery);
      
      // Test the destination service
      const searchResults = await destinationService.searchDestinations(searchQuery);
      console.log('🔍 Search results:', searchResults);
      
      setResults(searchResults);
      toast.success(`Found ${searchResults.destinations?.length || 0} results`);
      
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testCities = ['Kolkata', 'Jharkhand', 'Ranchi', 'Mumbai', 'Delhi', 'Goa', 'Digha', 'Mandarmani', 'Darjeeling', 'Puri'];

  const testAI = async () => {
    if (!aiTestQuery.trim()) {
      toast.error('Please enter an AI test query');
      return;
    }

    setAiLoading(true);
    try {
      console.log('🤖 Testing AI generation for:', aiTestQuery);

      // Test the working AI service
      const aiResult = await workingAIService.generateTrip(aiTestQuery);
      console.log('🤖 AI result:', aiResult);

      setAiResults(aiResult);
      toast.success('AI generation successful!');

    } catch (error) {
      console.error('AI test error:', error);
      toast.error('AI test failed: ' + error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const testQueries = [
    '3 days in Jharkhand with 3 people budget ₹15000',
    '5 days in Kolkata for 2 people with ₹20000',
    'Weekend trip to Digha for family of 4',
    '1 week in Kerala for couple budget ₹30000'
  ];

  const runComprehensiveTest = async () => {
    setTestSuiteLoading(true);
    try {
      console.log('🧪 Running comprehensive test suite...');
      const results = await testSuite.runAllTests();
      setTestSuiteResults(results);
      toast.success('Comprehensive test completed!');
    } catch (error) {
      console.error('Test suite error:', error);
      toast.error('Test suite failed: ' + error.message);
    } finally {
      setTestSuiteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">🔍 TripCraft Test Suite</h2>
        <button
          onClick={runComprehensiveTest}
          disabled={testSuiteLoading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {testSuiteLoading ? 'Running Tests...' : '🧪 Run All Tests'}
        </button>
      </div>
      
      {/* Manual Search */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter city name (e.g., Kolkata, Jharkhand)"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={testSearch}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Quick Test Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Quick Search Tests:</h3>
        <div className="flex flex-wrap gap-2">
          {testCities.map(city => (
            <button
              key={city}
              onClick={() => {
                setSearchQuery(city);
                setTimeout(() => testSearch(), 100);
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              Test {city}
            </button>
          ))}
        </div>
      </div>

      {/* AI Test Section */}
      <div className="mb-6 border-t pt-6">
        <h3 className="text-lg font-semibold mb-3">🤖 AI Generation Test:</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={aiTestQuery}
            onChange={(e) => setAiTestQuery(e.target.value)}
            placeholder="e.g., 3 days in Jharkhand with 3 people budget ₹15000"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={testAI}
            disabled={aiLoading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {aiLoading ? 'Generating...' : 'Test AI'}
          </button>
        </div>

        {/* Quick AI Test Buttons */}
        <div className="flex flex-wrap gap-2">
          {testQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => {
                setAiTestQuery(query);
                setTimeout(() => testAI(), 100);
              }}
              className="px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-sm"
            >
              Test: {query.substring(0, 20)}...
            </button>
          ))}
        </div>
      </div>

      {/* Results Display */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <h3 className="text-lg font-semibold mb-4">
            Results for "{searchQuery}" ({results.destinations?.length || 0} found):
          </h3>
          
          {results.destinations && results.destinations.length > 0 ? (
            <div className="grid gap-4">
              {results.destinations.map((dest, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-blue-600">{dest.name}</h4>
                  <p className="text-gray-600 text-sm">{dest.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Category: {dest.category}</span>
                    <span>Rating: {dest.rating}</span>
                    <span>Best Time: {dest.bestTime}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">No destinations found for "{searchQuery}"</p>
              <p className="text-yellow-600 text-sm mt-1">
                This indicates the search functionality needs improvement for this location.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* AI Results Display */}
      {aiResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 border-t pt-6"
        >
          <h3 className="text-lg font-semibold mb-4">
            🤖 AI Generation Results for "{aiTestQuery}":
          </h3>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-green-800">Trip Summary:</h4>
            <div className="text-sm text-green-700 mt-2">
              <p><strong>Destination:</strong> {aiResults.tripSummary?.destination}</p>
              <p><strong>Duration:</strong> {aiResults.tripSummary?.duration} days</p>
              <p><strong>Travelers:</strong> {aiResults.tripSummary?.travelers}</p>
              <p><strong>Budget:</strong> {aiResults.tripSummary?.budget}</p>
              <p><strong>Estimated Cost:</strong> {aiResults.tripSummary?.totalEstimatedCost}</p>
            </div>
          </div>

          {aiResults.hotels && aiResults.hotels.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-800">Hotels ({aiResults.hotels.length}):</h4>
              <div className="text-sm text-blue-700 mt-2">
                {aiResults.hotels.slice(0, 2).map((hotel, index) => (
                  <div key={index} className="mb-2">
                    <strong>{hotel.hotelName}</strong> - {hotel.price} (Rating: {hotel.rating})
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiResults.itinerary && aiResults.itinerary.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800">Itinerary ({aiResults.itinerary.length} days):</h4>
              <div className="text-sm text-purple-700 mt-2">
                {aiResults.itinerary.slice(0, 2).map((day, index) => (
                  <div key={index} className="mb-2">
                    <strong>Day {day.day}:</strong> {day.theme || 'Activities planned'}
                    {day.activities && (
                      <div className="ml-4 mt-1">
                        {day.activities.slice(0, 2).map((activity, actIndex) => (
                          <div key={actIndex}>• {activity.placeName} - {activity.ticketPricing}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Comprehensive Test Results */}
      {testSuiteResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 border-t pt-6"
        >
          <h3 className="text-lg font-semibold mb-4">
            🧪 Comprehensive Test Results:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search Results */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800">🔍 Search Tests</h4>
              <div className="text-sm text-blue-700 mt-2">
                <p>Passed: {testSuiteResults.search.filter(r => r.status === 'pass').length}/{testSuiteResults.search.length}</p>
                <div className="mt-2 space-y-1">
                  {testSuiteResults.search.slice(0, 3).map((test, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span>{test.status === 'pass' ? '✅' : '❌'}</span>
                      <span className="text-xs">{test.query}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Results */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800">🤖 AI Tests</h4>
              <div className="text-sm text-purple-700 mt-2">
                <p>Passed: {testSuiteResults.ai.filter(r => r.status === 'pass').length}/{testSuiteResults.ai.length}</p>
                <div className="mt-2 space-y-1">
                  {testSuiteResults.ai.slice(0, 3).map((test, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span>{test.status === 'pass' ? '✅' : test.status === 'partial' ? '⚠️' : '❌'}</span>
                      <span className="text-xs">{test.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Places Results */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800">🏛️ Places API Tests</h4>
              <div className="text-sm text-green-700 mt-2">
                <p>Passed: {testSuiteResults.places.filter(r => r.status === 'pass').length}/{testSuiteResults.places.length}</p>
                <div className="mt-2 space-y-1">
                  {testSuiteResults.places.slice(0, 3).map((test, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span>{test.status === 'pass' ? '✅' : '❌'}</span>
                      <span className="text-xs">{test.destination}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Overall Status */}
          <div className={`p-4 rounded-lg border-2 ${
            testSuiteResults.overall === 'excellent' ? 'bg-green-100 border-green-500' :
            testSuiteResults.overall === 'good' ? 'bg-blue-100 border-blue-500' :
            testSuiteResults.overall === 'fair' ? 'bg-yellow-100 border-yellow-500' :
            'bg-red-100 border-red-500'
          }`}>
            <h4 className="font-bold text-lg">
              Overall Status: {testSuiteResults.overall.toUpperCase()}
            </h4>
            <p className="text-sm mt-1">
              All core functionality has been tested. Check console for detailed results.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SearchTest;
