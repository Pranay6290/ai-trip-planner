import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AdjustmentsHorizontalIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  HeartIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useTelemetry } from '../../services/telemetryService';

const defaultFilters = {
  budget: { min: 0, max: 10000 },
  duration: { min: 1, max: 30 },
  travelers: 1,
  travelStyle: [],
  interests: [],
  pace: 'moderate',
  openNow: false,
  priceLevel: []
};

const TripFilters = ({ filters = defaultFilters, onFiltersChange, onReset, formData, onFormDataChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const telemetry = useTelemetry();

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
    
    telemetry.trackFilterApplied(key, value, 0); // Result count would be updated by parent
  };

  const handleReset = () => {
    const resetFilters = {
      budget: { min: 0, max: 10000 },
      duration: { min: 1, max: 30 },
      travelers: 1,
      travelStyle: [],
      interests: [],
      pace: 'moderate',
      openNow: false,
      priceLevel: []
    };
    
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset?.();
    
    telemetry.trackEvent('filters_reset');
  };

  const budgetRanges = [
    { id: 'budget', label: 'Budget', min: 0, max: 1500, icon: '💵', display: '₹0 - ₹1,500' },
    { id: 'moderate', label: 'Moderate', min: 1500, max: 5000, icon: '💰', display: '₹1,500 - ₹5,000' },
    { id: 'luxury', label: 'Luxury', min: 5000, max: 20000, icon: '💎', display: '₹5,000 - ₹20,000' },
    { id: 'unlimited', label: 'No Limit', min: 20000, max: 100000, icon: '🏆', display: '₹20,000+' }
  ];

  const travelStyles = [
    { id: 'adventure', label: 'Adventure', icon: '🏔️' },
    { id: 'relaxation', label: 'Relaxation', icon: '🏖️' },
    { id: 'cultural', label: 'Cultural', icon: '🏛️' },
    { id: 'foodie', label: 'Foodie', icon: '🍽️' },
    { id: 'nightlife', label: 'Nightlife', icon: '🌃' },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { id: 'romantic', label: 'Romantic', icon: '💕' },
    { id: 'business', label: 'Business', icon: '💼' }
  ];

  const interests = [
    { id: 'museums', label: 'Museums', icon: '🏛️' },
    { id: 'nature', label: 'Nature', icon: '🌲' },
    { id: 'beaches', label: 'Beaches', icon: '🏖️' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'food', label: 'Food & Drink', icon: '🍷' },
    { id: 'nightlife', label: 'Nightlife', icon: '🎭' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'art', label: 'Art & Design', icon: '🎨' },
    { id: 'history', label: 'History', icon: '📚' },
    { id: 'architecture', label: 'Architecture', icon: '🏗️' }
  ];

  const paceOptions = [
    { id: 'slow', label: 'Slow & Relaxed', description: '1-2 activities per day', icon: '🐌' },
    { id: 'moderate', label: 'Moderate', description: '3-4 activities per day', icon: '🚶' },
    { id: 'fast', label: 'Fast & Packed', description: '5+ activities per day', icon: '🏃' }
  ];

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.budget && (localFilters.budget.min > 0 || localFilters.budget.max < 10000)) count++;
    if (localFilters.duration && (localFilters.duration.min > 1 || localFilters.duration.max < 30)) count++;
    if (localFilters.travelers > 1) count++;
    if (localFilters.travelStyle && localFilters.travelStyle.length > 0) count++;
    if (localFilters.interests && localFilters.interests.length > 0) count++;
    if (localFilters.pace && localFilters.pace !== 'moderate') count++;
    if (localFilters.openNow) count++;
    if (localFilters.priceLevel && localFilters.priceLevel.length > 0) count++;
    return count;
  };

  return (
    <div className="relative">
      {/* Enhanced Filter Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-8 py-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 shadow-lg hover:shadow-xl"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <AdjustmentsHorizontalIcon className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <div className="font-bold text-xl text-slate-800">Travel Style & Interests</div>
            <div className="text-sm text-slate-600">
              {getActiveFiltersCount() > 0
                ? `${getActiveFiltersCount()} preferences selected`
                : 'Choose what you love to do'
              }
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getActiveFiltersCount() > 0 && (
            <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl text-orange-500"
          >
            ▼
          </motion.div>
        </div>
      </motion.button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-96 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 p-6 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Trip Filters</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReset}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Budget Range */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xl text-green-600 font-bold">₹</span>
                  <label className="font-medium text-gray-900">Budget Range</label>
                </div>

                {/* Custom Budget Sliders */}
                <div className="space-y-6 mb-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Minimum Budget</span>
                      <span className="text-lg font-bold text-green-600">
                        ${(formData?.budget?.min || localFilters.budget.min).toLocaleString()}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="20000"
                        step="100"
                        value={formData?.budget?.min || localFilters.budget.min}
                        onChange={(e) => {
                          const newMin = parseInt(e.target.value);
                          const newBudget = {
                            min: newMin,
                            max: Math.max(newMin + 500, formData?.budget?.max || localFilters.budget.max)
                          };
                          handleFilterChange('budget', newBudget);
                          onFormDataChange?.('budget', newBudget);
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer budget-slider"
                        style={{
                          background: `linear-gradient(to right, #10b981 0%, #059669 ${((formData?.budget?.min || localFilters.budget.min) / 20000) * 100}%, #e5e7eb ${((formData?.budget?.min || localFilters.budget.min) / 20000) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Maximum Budget</span>
                      <span className="text-lg font-bold text-green-600">
                        ${(formData?.budget?.max || localFilters.budget.max).toLocaleString()}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="500"
                        max="50000"
                        step="100"
                        value={formData?.budget?.max || localFilters.budget.max}
                        onChange={(e) => {
                          const newMax = parseInt(e.target.value);
                          const newBudget = {
                            min: Math.min(formData?.budget?.min || localFilters.budget.min, newMax - 500),
                            max: newMax
                          };
                          handleFilterChange('budget', newBudget);
                          onFormDataChange?.('budget', newBudget);
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer budget-slider"
                        style={{
                          background: `linear-gradient(to right, #10b981 0%, #059669 ${((formData?.budget?.max || localFilters.budget.max) / 50000) * 100}%, #e5e7eb ${((formData?.budget?.max || localFilters.budget.max) / 50000) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Budget Presets */}
                <div className="grid grid-cols-2 gap-2">
                  {budgetRanges.map((range) => (
                    <motion.button
                      key={range.id}
                      onClick={() => {
                        const newBudget = { min: range.min, max: range.max };
                        handleFilterChange('budget', newBudget);
                        onFormDataChange?.('budget', newBudget);
                      }}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        (formData?.budget?.min || localFilters.budget.min) === range.min &&
                        (formData?.budget?.max || localFilters.budget.max) === range.max
                          ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 shadow-lg'
                          : 'border-gray-200 hover:border-green-300 hover:shadow-md bg-white'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-2xl mb-1">{range.icon}</div>
                      <div className="text-sm font-bold">{range.label}</div>
                      <div className="text-xs text-gray-600">
                        {range.display}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                  <label className="font-medium text-gray-900">Trip Duration</label>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">Min Days</label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={localFilters.duration.min}
                      onChange={(e) => handleFilterChange('duration', { 
                        ...localFilters.duration, 
                        min: parseInt(e.target.value) 
                      })}
                      className="w-full mt-1"
                    />
                    <div className="text-center text-sm font-medium text-blue-600">
                      {localFilters.duration.min} day{localFilters.duration.min !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">Max Days</label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={localFilters.duration.max}
                      onChange={(e) => handleFilterChange('duration', { 
                        ...localFilters.duration, 
                        max: parseInt(e.target.value) 
                      })}
                      className="w-full mt-1"
                    />
                    <div className="text-center text-sm font-medium text-blue-600">
                      {localFilters.duration.max} day{localFilters.duration.max !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Number of Travelers */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <UserGroupIcon className="w-5 h-5 text-purple-600" />
                  <label className="font-medium text-gray-900">Number of Travelers</label>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {formData?.travelers || localFilters.travelers}
                    </div>
                    <div className="text-sm text-gray-600">
                      {(formData?.travelers || localFilters.travelers) === 1 ? 'Solo Traveler' : 'Travelers'}
                    </div>
                  </div>

                  <div className="relative px-4">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={formData?.travelers || localFilters.travelers}
                      onChange={(e) => {
                        const newTravelers = parseInt(e.target.value);
                        handleFilterChange('travelers', newTravelers);
                        onFormDataChange?.('travelers', newTravelers);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8b5cf6 0%, #7c3aed ${(((formData?.travelers || localFilters.travelers) - 1) / 19) * 100}%, #e5e7eb ${(((formData?.travelers || localFilters.travelers) - 1) / 19) * 100}%, #e5e7eb 100%)`
                      }}
                    />

                    {/* Custom thumb */}
                    <div
                      className="absolute top-0 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg border-2 border-white pointer-events-none"
                      style={{
                        left: `${(((formData?.travelers || localFilters.travelers) - 1) / 19) * 100}%`,
                        top: '50%'
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 px-4">
                    <span>1 person</span>
                    <span>20 people</span>
                  </div>

                  {/* Quick traveler options */}
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {[
                      { count: 1, label: 'Solo', emoji: '🙋‍♀️' },
                      { count: 2, label: 'Couple', emoji: '💑' },
                      { count: 4, label: 'Family', emoji: '👨‍👩‍👧‍👦' },
                      { count: 6, label: 'Group', emoji: '👥' }
                    ].map((option) => (
                      <motion.button
                        key={option.count}
                        onClick={() => {
                          handleFilterChange('travelers', option.count);
                          onFormDataChange?.('travelers', option.count);
                        }}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                          (formData?.travelers || localFilters.travelers) === option.count
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 shadow-lg'
                            : 'border-gray-200 hover:border-purple-300 hover:shadow-md bg-white'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-xl mb-1">{option.emoji}</div>
                        <div className="text-xs font-bold">{option.label}</div>
                        <div className="text-xs text-gray-600">{option.count}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Travel Style */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <HeartIcon className="w-5 h-5 text-red-600" />
                  <label className="font-medium text-gray-900">Travel Style</label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {travelStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        const newStyles = localFilters.travelStyle.includes(style.id)
                          ? localFilters.travelStyle.filter(s => s !== style.id)
                          : [...localFilters.travelStyle, style.id];
                        handleFilterChange('travelStyle', newStyles);
                      }}
                      className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                        localFilters.travelStyle.includes(style.id)
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{style.icon}</div>
                      <div className="text-xs font-medium">{style.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <HeartIcon className="w-5 h-5 text-pink-600" />
                  <label className="font-medium text-gray-900">Interests</label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {interests.map((interest) => (
                    <button
                      key={interest.id}
                      onClick={() => {
                        const newInterests = localFilters.interests.includes(interest.id)
                          ? localFilters.interests.filter(i => i !== interest.id)
                          : [...localFilters.interests, interest.id];
                        handleFilterChange('interests', newInterests);
                      }}
                      className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                        localFilters.interests.includes(interest.id)
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{interest.icon}</div>
                      <div className="text-xs font-medium">{interest.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Pace */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <ClockIcon className="w-5 h-5 text-orange-600" />
                  <label className="font-medium text-gray-900">Travel Pace</label>
                </div>
                <div className="space-y-2">
                  {paceOptions.map((pace) => (
                    <button
                      key={pace.id}
                      onClick={() => handleFilterChange('pace', pace.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                        localFilters.pace === pace.id
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">{pace.icon}</div>
                        <div>
                          <div className="font-medium">{pace.label}</div>
                          <div className="text-sm text-gray-600">{pace.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <label className="font-medium text-gray-900 mb-3 block">Quick Filters</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={localFilters.openNow}
                      onChange={(e) => handleFilterChange('openNow', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Open now</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripFilters;
