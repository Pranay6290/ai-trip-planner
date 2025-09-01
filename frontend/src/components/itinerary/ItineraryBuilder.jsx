import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MinusIcon,
  ClockIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import itineraryService from '../../services/itineraryService';
import DestinationSearch from '../destination/DestinationSearch';
import DestinationDetails from '../destination/DestinationDetails';
import toast from 'react-hot-toast';

const ItineraryBuilder = ({ onItineraryGenerated }) => {
  const [destination, setDestination] = useState(null);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [tripLength, setTripLength] = useState(3);
  const [preferences, setPreferences] = useState({
    pace: 'moderate',
    budgetLevel: 'moderate',
    styles: []
  });
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1); // 1: Destination, 2: Places, 3: Preferences, 4: Review

  const paceOptions = [
    { id: 'relaxed', label: 'Relaxed', description: '2-3 places per day', icon: '🐌' },
    { id: 'moderate', label: 'Moderate', description: '3-4 places per day', icon: '🚶' },
    { id: 'packed', label: 'Packed', description: '5-6 places per day', icon: '🏃' }
  ];

  const budgetOptions = [
    { id: 'budget', label: 'Budget', description: 'Under $100/day', icon: '💵' },
    { id: 'moderate', label: 'Moderate', description: '$100-200/day', icon: '💰' },
    { id: 'luxury', label: 'Luxury', description: '$200+/day', icon: '💎' }
  ];

  const styleOptions = [
    { id: 'cultural', label: 'Cultural', icon: '🏛️' },
    { id: 'adventure', label: 'Adventure', icon: '🏔️' },
    { id: 'relaxation', label: 'Relaxation', icon: '🏖️' },
    { id: 'foodie', label: 'Foodie', icon: '🍽️' },
    { id: 'nightlife', label: 'Nightlife', icon: '🌃' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' }
  ];

  const handleDestinationSelect = (selectedDestination) => {
    setDestination(selectedDestination);
    setStep(2);
  };

  const handlePlaceSelect = (place) => {
    if (!selectedPlaces.find(p => p.placeId === place.placeId)) {
      setSelectedPlaces([...selectedPlaces, place]);
      toast.success(`Added ${place.name} to your trip!`);
    } else {
      toast.info(`${place.name} is already in your trip`);
    }
  };

  const handlePlaceRemove = (placeId) => {
    setSelectedPlaces(selectedPlaces.filter(p => p.placeId !== placeId));
  };

  const handleStyleToggle = (styleId) => {
    setPreferences(prev => ({
      ...prev,
      styles: prev.styles.includes(styleId)
        ? prev.styles.filter(s => s !== styleId)
        : [...prev.styles, styleId]
    }));
  };

  const generateItinerary = async () => {
    if (!destination || selectedPlaces.length === 0) {
      toast.error('Please select a destination and at least one place');
      return;
    }

    setIsGenerating(true);
    try {
      const itinerary = await itineraryService.generateBasicItinerary(
        destination,
        selectedPlaces,
        tripLength,
        preferences
      );
      
      setGeneratedItinerary(itinerary);
      onItineraryGenerated?.(itinerary);
      setStep(4);
      toast.success('Itinerary generated successfully!');
    } catch (error) {
      console.error('Error generating itinerary:', error);
      toast.error('Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[
            { step: 1, label: 'Destination', icon: MapPinIcon },
            { step: 2, label: 'Places', icon: PlusIcon },
            { step: 3, label: 'Preferences', icon: SparklesIcon },
            { step: 4, label: 'Review', icon: CheckIcon }
          ].map((item, index) => (
            <div key={item.step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= item.step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={`ml-2 font-medium ${
                step >= item.step ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
              {index < 3 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  step > item.step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Destination Selection */}
        {step === 1 && (
          <motion.div
            key="destination"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Where do you want to go?</h2>
              <p className="text-gray-600">Search for your dream destination</p>
            </div>
            
            <DestinationSearch
              onDestinationSelect={handleDestinationSelect}
              placeholder="Search for cities, countries, or landmarks..."
              className="max-w-2xl mx-auto"
            />
          </motion.div>
        )}

        {/* Step 2: Place Selection */}
        {step === 2 && destination && (
          <motion.div
            key="places"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Select Places to Visit</h2>
                <p className="text-gray-600">Choose attractions, restaurants, and activities</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Selected Places</div>
                <div className="text-2xl font-bold text-blue-600">{selectedPlaces.length}</div>
              </div>
            </div>

            {/* Selected Places Summary */}
            {selectedPlaces.length > 0 && (
              <div className="bg-blue-50 rounded-2xl p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Your Selected Places</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPlaces.map(place => (
                    <div
                      key={place.placeId}
                      className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm"
                    >
                      <span className="text-sm font-medium">{place.name}</span>
                      <button
                        onClick={() => handlePlaceRemove(place.placeId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DestinationDetails
              destination={destination}
              onPlaceSelect={handlePlaceSelect}
            />

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedPlaces.length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue ({selectedPlaces.length} places selected)
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Trip</h2>
              <p className="text-gray-600">Set your preferences for the perfect itinerary</p>
            </div>

            {/* Trip Length */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Trip Duration</h3>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setTripLength(Math.max(1, tripLength - 1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{tripLength}</div>
                  <div className="text-sm text-gray-500">days</div>
                </div>
                <button
                  onClick={() => setTripLength(Math.min(14, tripLength + 1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Travel Pace */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <ClockIcon className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Travel Pace</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {paceOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setPreferences(prev => ({ ...prev, pace: option.id }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferences.pace === option.id
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Level */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <CurrencyDollarIcon className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold">Budget Level</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {budgetOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setPreferences(prev => ({ ...prev, budgetLevel: option.id }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferences.budgetLevel === option.id
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Styles */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Travel Styles (Optional)</h3>
              <div className="grid grid-cols-3 gap-3">
                {styleOptions.map(style => (
                  <button
                    key={style.id}
                    onClick={() => handleStyleToggle(style.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      preferences.styles.includes(style.id)
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{style.icon}</div>
                    <div className="text-sm font-medium">{style.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={generateItinerary}
                disabled={isGenerating}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    <span>Generate Itinerary</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review Generated Itinerary */}
        {step === 4 && generatedItinerary && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Itinerary is Ready!</h2>
              <p className="text-gray-600">Review and customize your trip plan</p>
            </div>

            {/* Itinerary Summary */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">{destination.name} - {tripLength} Days</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-blue-100">Total Places</div>
                  <div className="text-2xl font-bold">{generatedItinerary.metadata.totalPlaces}</div>
                </div>
                <div>
                  <div className="text-blue-100">Avg per Day</div>
                  <div className="text-2xl font-bold">{generatedItinerary.metadata.averagePlacesPerDay}</div>
                </div>
                <div>
                  <div className="text-blue-100">Est. Budget</div>
                  <div className="text-2xl font-bold">${generatedItinerary.metadata.estimatedBudget.total}</div>
                </div>
                <div>
                  <div className="text-blue-100">Travel Style</div>
                  <div className="text-lg font-bold capitalize">{preferences.pace}</div>
                </div>
              </div>
            </div>

            {/* Daily Itinerary */}
            <div className="space-y-4">
              {generatedItinerary.itinerary.map((day, dayIndex) => (
                <div key={day.day} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-bold text-gray-900">
                        Day {day.day} - {day.theme}
                      </h4>
                      <div className="text-sm text-gray-600">
                        {day.places.length} places • {formatDuration(day.estimatedDuration)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {day.places.map((place, placeIndex) => (
                      <div key={place.placeId} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {place.order}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{place.name}</h5>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{place.time} • {place.timeBlock}</span>
                            <span>{formatDuration(place.estimatedDuration)}</span>
                            {place.rating && (
                              <span className="flex items-center">
                                ⭐ {place.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back to Edit
              </button>
              <div className="space-x-3">
                <button
                  onClick={() => generateItinerary()}
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => {
                    toast.success('Itinerary saved successfully!');
                    // Here you would typically save to backend
                  }}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  Save Itinerary
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItineraryBuilder;
