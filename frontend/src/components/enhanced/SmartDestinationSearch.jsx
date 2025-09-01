import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline';
import { searchIndianDestinations } from '../../data/indianDestinations';
import destinationService from '../../services/destinationService';
import toast from 'react-hot-toast';

const SmartDestinationSearch = ({ onDestinationSelect, placeholder, className }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Search for destinations as user types
  useEffect(() => {
    const searchDestinations = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      try {
        // Search in Indian destinations first
        const indianResults = searchIndianDestinations(query);
        
        // Also search using the destination service for comprehensive results
        const serviceResults = await destinationService.searchDestinations(query, { maxResults: 10 });
        
        // Combine and deduplicate results
        const allResults = [...indianResults];
        
        // Add service results that aren't already in Indian results
        if (serviceResults.destinations) {
          serviceResults.destinations.forEach(dest => {
            if (!allResults.find(r => r.name.toLowerCase() === dest.name.toLowerCase())) {
              allResults.push(dest);
            }
          });
        }

        setSuggestions(allResults.slice(0, 8));
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchDestinations, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleDestinationSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, suggestions, selectedIndex]);

  // Handle destination selection
  const handleDestinationSelect = (destination) => {
    setQuery(destination.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onDestinationSelect(destination);
    toast.success(`Selected: ${destination.name}`);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isSearching ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder || "Search destinations (e.g., Kolkata, Jharkhand, Digha...)"}
          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-lg bg-white/80 backdrop-blur-sm"
        />
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
          >
            {suggestions.map((destination, index) => (
              <motion.div
                key={destination.id || index}
                onClick={() => handleDestinationSelect(destination)}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  index === selectedIndex 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-50'
                } ${index === 0 ? 'rounded-t-2xl' : ''} ${
                  index === suggestions.length - 1 ? 'rounded-b-2xl' : 'border-b border-gray-100'
                }`}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <MapPinIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 truncate">
                        {destination.name}
                      </h4>
                      {destination.rating && (
                        <div className="flex items-center space-x-1 ml-2">
                          <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">{destination.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {destination.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-2">
                      {destination.state && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {destination.state}
                        </span>
                      )}
                      {destination.category && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {destination.category}
                        </span>
                      )}
                      {destination.bestTime && (
                        <span className="text-xs text-gray-500">
                          Best: {destination.bestTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* No results message */}
            {suggestions.length === 0 && query.length >= 2 && !isSearching && (
              <div className="p-6 text-center">
                <div className="text-gray-500 mb-2">
                  <MapPinIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No destinations found for "{query}"</p>
                </div>
                <p className="text-sm text-gray-400">
                  Try searching for Indian cities like Mumbai, Delhi, Kolkata, or states like Goa, Kerala
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popular suggestions when no query */}
      {!query && !showSuggestions && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-3">Popular destinations:</p>
          <div className="flex flex-wrap gap-2">
            {['Mumbai', 'Delhi', 'Goa', 'Kerala', 'Rajasthan', 'Kolkata', 'Jharkhand', 'Digha'].map(city => (
              <button
                key={city}
                onClick={() => setQuery(city)}
                className="px-3 py-1 bg-gray-100 hover:bg-blue-100 rounded-full text-sm transition-colors duration-200"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartDestinationSearch;
