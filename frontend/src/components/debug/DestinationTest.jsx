import React, { useState } from 'react';
import { useDestinationService } from '../../services/destinationService';

const DestinationTest = () => {
  const [testQuery, setTestQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const destinationService = useDestinationService();

  const testSearch = async () => {
    if (!testQuery.trim()) return;
    
    setLoading(true);
    try {
      const searchResults = await destinationService.searchDestinations(testQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testPopular = async () => {
    setLoading(true);
    try {
      const popular = await destinationService.getPopularDestinations('all', 10);
      setResults({ popular });
    } catch (error) {
      console.error('Popular destinations error:', error);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-sm mb-3">🧪 Destination Test</h3>
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Try: bangalore, mumbai, goa..."
            className="flex-1 px-2 py-1 border rounded text-xs"
          />
          <button
            onClick={testSearch}
            disabled={loading}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>
        
        <button
          onClick={testPopular}
          disabled={loading}
          className="w-full px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Popular Destinations
        </button>
        
        {results && (
          <div className="max-h-40 overflow-y-auto text-xs">
            {results.error ? (
              <div className="text-red-600">Error: {results.error}</div>
            ) : results.popular ? (
              <div>
                <strong>Popular Destinations:</strong>
                <ul className="mt-1 space-y-1">
                  {results.popular.slice(0, 5).map((dest, i) => (
                    <li key={i} className="text-blue-600">
                      {dest.name} ({dest.category})
                    </li>
                  ))}
                </ul>
              </div>
            ) : results.destinations ? (
              <div>
                <strong>Search Results:</strong>
                <ul className="mt-1 space-y-1">
                  {results.destinations.slice(0, 3).map((dest, i) => (
                    <li key={i} className="text-green-600">
                      {dest.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-gray-600">No results</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationTest;
