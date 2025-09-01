import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TagIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useDebounce } from '../../utils/performanceOptimizer';

// Enhanced filters with budget mapping and travel styles
const budgetRanges = [
  { id: 'budget', label: 'Budget', min: 0, max: 1500, icon: '💵', description: 'Affordable travel' },
  { id: 'moderate', label: 'Moderate', min: 1500, max: 5000, icon: '💰', description: 'Comfortable travel' },
  { id: 'luxury', label: 'Luxury', min: 5000, max: 15000, icon: '💎', description: 'Premium experience' },
  { id: 'ultra', label: 'Ultra Luxury', min: 15000, max: 50000, icon: '🏆', description: 'Ultimate luxury' }
];

const travelStyles = [
  { id: 'adventure', label: 'Adventure', icon: '🏔️', description: 'Thrilling experiences' },
  { id: 'relaxation', label: 'Relaxation', icon: '🏖️', description: 'Peaceful getaway' },
  { id: 'cultural', label: 'Cultural', icon: '🏛️', description: 'Museums & history' },
  { id: 'foodie', label: 'Foodie', icon: '🍽️', description: 'Culinary experiences' },
  { id: 'nightlife', label: 'Nightlife', icon: '🌃', description: 'Bars & entertainment' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', description: 'Kid-friendly activities' },
  { id: 'romantic', label: 'Romantic', icon: '💕', description: 'Couples experiences' },
  { id: 'business', label: 'Business', icon: '💼', description: 'Work & meetings' }
];

const AdvancedSearch = ({ onSearch, onFilter, initialFilters = {} }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    destination: '',
    minDuration: 1,
    maxDuration: 30,
    minBudget: 0,
    maxBudget: 10000,
    travelerType: 'all',
    tags: [],
    dateRange: 'all',
    rating: 0,
    ...initialFilters
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    onSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearch]);

  useEffect(() => {
    onFilter(filters);
  }, [filters, onFilter]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      destination: '',
      minDuration: 1,
      maxDuration: 30,
      minBudget: 0,
      maxBudget: 10000,
      travelerType: 'all',
      tags: [],
      dateRange: 'all',
      rating: 0
    });
  };

  const popularTags = [
    'Adventure', 'Relaxation', 'Culture', 'Food', 'Nature', 'History',
    'Beach', 'Mountains', 'City', 'Romance', 'Family', 'Solo',
    'Luxury', 'Budget', 'Photography', 'Wildlife', 'Art', 'Music'
  ];

  const travelerTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'solo', label: 'Solo Traveler' },
    { value: 'couple', label: 'Couple' },
    { value: 'family', label: 'Family' },
    { value: 'friends', label: 'Friends' }
  ];

  const dateRanges = [
    { value: 'all', label: 'Any Time' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'Next 3 Months' },
    { value: 'year', label: 'This Year' }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search destinations, activities, or experiences..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition-all duration-300 ${
            showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FunnelIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-200 pt-6 space-y-6">
              {/* Duration Range */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                  <label className="font-medium text-gray-900">Duration</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min Days</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={filters.minDuration}
                      onChange={(e) => handleFilterChange('minDuration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max Days</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={filters.maxDuration}
                      onChange={(e) => handleFilterChange('maxDuration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                  <label className="font-medium text-gray-900">Budget Range</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min Budget</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={filters.minBudget}
                      onChange={(e) => handleFilterChange('minBudget', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max Budget</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={filters.maxBudget}
                      onChange={(e) => handleFilterChange('maxBudget', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Traveler Type */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <UserGroupIcon className="w-5 h-5 text-purple-600" />
                  <label className="font-medium text-gray-900">Traveler Type</label>
                </div>
                <select
                  value={filters.travelerType}
                  onChange={(e) => handleFilterChange('travelerType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {travelerTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <TagIcon className="w-5 h-5 text-orange-600" />
                  <label className="font-medium text-gray-900">Interests</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <motion.button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        filters.tags.includes(tag)
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <StarIcon className="w-5 h-5 text-yellow-600" />
                  <label className="font-medium text-gray-900">Minimum Rating</label>
                </div>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange('rating', rating)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        filters.rating >= rating
                          ? 'text-yellow-500'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <StarIcon className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearch;
