import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  GlobeAltIcon,
  XMarkIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import placesService from '../../services/placesService';
import { useDebounce } from '../../utils/performanceOptimizer';

const DestinationSearch = ({ onDestinationSelect, placeholder = "Where do you want to go?", className = "" }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentDestinations');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  const fetchSuggestions = async (searchQuery) => {
    setIsLoading(true);
    try {
      const results = await placesService.getDestinationSuggestions(searchQuery);
      setSuggestions(results);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = async (suggestion) => {
    setQuery(suggestion.description);
    setShowSuggestions(false);
    
    try {
      // Get detailed place information
      const placeDetails = await placesService.getPlaceDetails(suggestion.placeId);
      
      // Save to recent searches
      const newRecent = [
        { ...suggestion, ...placeDetails },
        ...recentSearches.filter(item => item.placeId !== suggestion.placeId)
      ].slice(0, 5);
      
      setRecentSearches(newRecent);
      localStorage.setItem('recentDestinations', JSON.stringify(newRecent));
      
      // Notify parent component
      onDestinationSelect({
        ...suggestion,
        ...placeDetails
      });
    } catch (error) {
      console.error('Error getting place details:', error);
      // Still notify parent with basic info
      onDestinationSelect(suggestion);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (query.length >= 2 || recentSearches.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = (e) => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget)) {
        setShowSuggestions(false);
      }
    }, 150);
  };

  const popularDestinations = [
    { name: 'Paris', country: 'France', emoji: '🇫🇷' },
    { name: 'Tokyo', country: 'Japan', emoji: '🇯🇵' },
    { name: 'New York', country: 'USA', emoji: '🇺🇸' },
    { name: 'London', country: 'UK', emoji: '🇬🇧' },
    { name: 'Rome', country: 'Italy', emoji: '🇮🇹' },
    { name: 'Barcelona', country: 'Spain', emoji: '🇪🇸' }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        )}
        
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto z-50"
          >
            {/* Recent Searches */}
            {query.length < 2 && recentSearches.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-3">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Recent Searches</span>
                </div>
                {recentSearches.map((item, index) => (
                  <button
                    key={item.placeId}
                    onClick={() => handleSuggestionSelect(item)}
                    className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">{item.mainText}</div>
                      <div className="text-sm text-gray-500">{item.secondaryText}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion.placeId}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left ${
                      index === selectedIndex 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="p-2 bg-blue-100 rounded-full">
                      <MapPinIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{suggestion.mainText}</div>
                      <div className="text-sm text-gray-500">{suggestion.secondaryText}</div>
                    </div>
                    <GlobeAltIcon className="w-4 h-4 text-gray-300" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Popular Destinations */}
            {query.length < 2 && recentSearches.length === 0 && (
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-600">Popular Destinations</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {popularDestinations.map((dest, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(dest.name)}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <span className="text-lg">{dest.emoji}</span>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{dest.name}</div>
                        <div className="text-xs text-gray-500">{dest.country}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {query.length >= 2 && suggestions.length === 0 && !isLoading && (
              <div className="p-8 text-center">
                <GlobeAltIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No destinations found for "{query}"</p>
                <p className="text-sm text-gray-400 mt-1">Try searching for a city or country</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DestinationSearch;
