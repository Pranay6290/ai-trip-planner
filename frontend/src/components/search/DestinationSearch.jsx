import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useDestinationService } from '../../services/destinationService';
import { useTelemetry } from '../../services/telemetryService';

const DestinationSearch = ({ onDestinationSelect, placeholder = "Where do you want to go?" }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const debounceRef = useRef(null);
  
  const destinationService = useDestinationService();
  const telemetry = useTelemetry();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Load popular destinations on mount
  useEffect(() => {
    loadPopularDestinations();
  }, []);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPopularDestinations = async () => {
    try {
      const popular = await destinationService.getPopularDestinations('all', 8);
      setPopularDestinations(popular);
    } catch (error) {
      console.error('Error loading popular destinations:', error);
    }
  };

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults(null);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    try {
      // Use Google Places API for real-time suggestions
      const searchResults = await destinationService.searchDestinations(searchQuery, {
        maxResults: 15,
        includeSuggestions: true
      });
      
      setResults(searchResults);
      
      // Track successful search
      telemetry.trackEvent('destination_search_success', {
        query: searchQuery,
        resultCount: searchResults.totalResults || 0
      });
      
    } catch (error) {
      console.error('Search error:', error);
      telemetry.trackError(error, { 
        action: 'destination_search', 
        query: searchQuery,
        component: 'DestinationSearch'
      });
      
      // Show error state to user
      setResults({
        all: [],
        categories: {},
        totalResults: 0,
        error: 'Unable to fetch destinations. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleDestinationSelect = (destination) => {
    telemetry.trackDestinationSelected(destination, results?.all || []);
    setQuery(destination.name);
    setShowResults(false);
    onDestinationSelect(destination);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    telemetry.trackFilterApplied('category', category, results?.categories[category]?.length || 0);
  };

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setShowResults(false);
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🌍' },
    { id: 'cities', name: 'Cities', icon: '🏙️' },
    { id: 'attractions', name: 'Attractions', icon: '🎯' },
    { id: 'nature', name: 'Nature', icon: '🌲' },
    { id: 'culture', name: 'Culture', icon: '🏛️' },
    { id: 'restaurants', name: 'Food', icon: '🍽️' },
    { id: 'hotels', name: 'Hotels', icon: '🏨' }
  ];

  const getDisplayResults = () => {
    if (!results) return [];

    try {
      // Handle both Google API results and fallback results
      const allResults = results.all || results.destinations || [];

      // Ensure allResults is an array
      if (!Array.isArray(allResults)) {
        console.warn('allResults is not an array:', allResults);
        return [];
      }

      if (selectedCategory === 'all') {
        return allResults;
      }

      // Filter by category if categories exist
      if (results.categories && results.categories[selectedCategory]) {
        const categoryResults = results.categories[selectedCategory];
        return Array.isArray(categoryResults) ? categoryResults : [];
      }

      // Fallback: filter allResults by category
      return allResults.filter(dest =>
        !selectedCategory ||
        selectedCategory === 'all' ||
        dest.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    } catch (error) {
      console.error('Error in getDisplayResults:', error);
      return [];
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <div className="relative flex items-center">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowResults(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-24 py-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-900 dark:text-gray-100"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {query && (
              <button
                onClick={clearSearch}
                className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'light' ? (
                <MoonIcon className="w-5 h-5" />
              ) : (
                <SunIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden z-50"
          >
            {/* Loading State */}
            {loading && (
              <div className="p-6 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400">Searching destinations...</p>
              </div>
            )}

            {/* Results */}
            {!loading && results && (
              <>
                {/* Category Filters */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(categories) && categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryFilter(category.id)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category.id
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                        {results.categories[category.id] && (
                          <span className="bg-white/80 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">
                            {results.categories[category.id].length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results List */}
                <div className="max-h-64 overflow-y-auto">
                  {getDisplayResults().map((destination, index) => (
                    <motion.button
                      key={destination.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleDestinationSelect(destination)}
                      className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 border-b border-gray-100 dark:border-gray-800 last:border-b-0 text-left"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Destination Image */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          {destination.photos?.[0] ? (
                            <img
                              src={destination.photos[0].url}
                              alt={destination.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                              <MapPinIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Destination Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {destination.name}
                            </h3>
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full ml-2">
                              {destination.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                            {destination.address}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            {destination.rating > 0 && (
                              <div className="flex items-center space-x-1">
                                <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {destination.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                            {destination.priceRange && (
                              <div className="flex items-center space-x-1">
                                <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {destination.priceRange}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}

                  {/* Show suggestions if no results but we have suggestions */}
                  {getDisplayResults().length === 0 && results?.suggestions && Array.isArray(results.suggestions) && results.suggestions.length > 0 && (
                    <div className="p-4">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Suggestions</h4>
                      <div className="space-y-2">
                        {results.suggestions.map((suggestion, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setQuery(suggestion.name)}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-left transition-colors duration-200"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                <MapPinIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                  {suggestion.name}
                                </p>
                                {suggestion.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {suggestion.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {getDisplayResults().length === 0 && (!results.suggestions || results.suggestions.length === 0) && (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      <MapPinIcon className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p>No destinations found in this category</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Popular Destinations (when no search) */}
            {!loading && !results && popularDestinations.length > 0 && (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Popular Destinations</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {Array.isArray(popularDestinations) && popularDestinations.map((destination, index) => (
                    <motion.button
                      key={destination.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleDestinationSelect(destination)}
                      className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 border-b border-gray-100 dark:border-gray-800 last:border-b-0 text-left"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          <img
                            src={destination.imageUrl}
                            alt={destination.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {destination.name}
                            </h3>
                            <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full ml-2">
                              {destination.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                            {destination.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {destination.rating}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {destination.averageDays}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DestinationSearch;
