import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShareIcon,
  CloudArrowDownIcon,
  ChatBubbleLeftRightIcon,
  SunIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

// Import all the enhanced components and services
import DestinationSearch from '../destination/DestinationSearch';
import DestinationDetails from '../destination/DestinationDetails';
import ItineraryBuilder from '../itinerary/ItineraryBuilder';
import TravelChatbot from '../chat/TravelChatbot';
import TripSharing from '../features/TripSharing';
import TripComparison from '../features/TripComparison';
import AdvancedSearch from '../features/AdvancedSearch';
import EnhancedMapExperience from '../visual/EnhancedMapExperience';

// Import services
import nlpService from '../../services/nlpService';
import personalizationService from '../../services/personalizationService';
import expenseEstimationService from '../../services/expenseEstimationService';
import weatherService from '../../services/weatherService';
import offlineExportService from '../../services/offlineExportService';
import multimodalGuidanceService from '../../services/multimodalGuidanceService';

import toast from 'react-hot-toast';

const EnhancedTripPlanner = () => {
  // Main state
  const [currentStep, setCurrentStep] = useState('welcome');
  const [tripData, setTripData] = useState({});
  const [destination, setDestination] = useState(null);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  
  // Feature states
  const [showChatbot, setShowChatbot] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [expenseEstimate, setExpenseEstimate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');

  // Initialize user preferences on mount
  useEffect(() => {
    const initializePrefs = async () => {
      try {
        const prefs = await personalizationService.initializeUserPreferences('default-user');
        setUserPreferences(prefs);
      } catch (error) {
        console.error('Failed to initialize user preferences:', error);
        setUserPreferences(personalizationService.getDefaultProfile());
      }
    };
    initializePrefs();
  }, []);

  // Handle natural language input
  const handleNaturalLanguageInput = async (input) => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const parsedData = await nlpService.parseNaturalLanguageInput(input);
      
      if (parsedData.destination?.name) {
        // Auto-populate trip data from NLP
        setTripData({
          destination: parsedData.destination,
          duration: parsedData.duration?.days,
          budget: parsedData.budget,
          travelers: parsedData.travelers,
          preferences: {
            ...parsedData.preferences,
            interests: parsedData.interests,
            travelStyle: parsedData.travelStyle
          }
        });

        // Move to destination selection with pre-filled data
        setCurrentStep('destination');
        toast.success('Trip details extracted from your description!');
      } else {
        toast.error('Please provide more specific destination information');
      }
    } catch (error) {
      console.error('Error parsing natural language:', error);
      toast.error('Could not understand your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle destination selection
  const handleDestinationSelect = async (selectedDestination) => {
    setDestination(selectedDestination);
    setCurrentStep('places');

    // Get personalized recommendations
    try {
      const recommendations = await personalizationService.getPersonalizedRecommendations(
        selectedDestination,
        userPreferences
      );
      
      if (recommendations.recommendations.length > 0) {
        toast.success(`Found ${recommendations.recommendations.length} personalized recommendations!`);
      }
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
    }

    // Get weather data
    try {
      const weather = await weatherService.getWeatherForecast(
        selectedDestination,
        tripData.dates
      );
      setWeatherData(weather);
    } catch (error) {
      console.error('Error getting weather data:', error);
    }
  };

  // Handle place selection
  const handlePlaceSelect = (place) => {
    if (!selectedPlaces.find(p => p.placeId === place.placeId)) {
      setSelectedPlaces([...selectedPlaces, place]);
      toast.success(`Added ${place.name} to your trip!`);
    }
  };

  // Handle itinerary generation
  const handleItineraryGenerated = async (itinerary) => {
    setGeneratedItinerary(itinerary);
    setCurrentStep('review');

    // Get expense estimation
    try {
      const estimate = await expenseEstimationService.estimateExpenses(
        itinerary,
        userPreferences
      );
      setExpenseEstimate(estimate);
    } catch (error) {
      console.error('Error estimating expenses:', error);
    }

    // Cache for offline access
    try {
      await offlineExportService.cacheForOffline(itinerary);
    } catch (error) {
      console.error('Error caching for offline:', error);
    }
  };

  // Handle trip updates from chatbot
  const handleTripUpdate = (update) => {
    if (update.itinerary) {
      setGeneratedItinerary(update.itinerary);
    }
    toast.success('Trip updated successfully!');
  };

  // Export functions
  const handleExportPDF = async () => {
    if (!generatedItinerary) return;

    try {
      await offlineExportService.exportTripAsPDF(generatedItinerary, {
        includeMap: true,
        includeImages: true,
        includeWeather: true,
        includeBudget: true
      });
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleExportCalendar = async () => {
    if (!generatedItinerary) return;

    try {
      await offlineExportService.exportTripAsCalendar(generatedItinerary);
      toast.success('Calendar events exported successfully!');
    } catch (error) {
      console.error('Error exporting calendar:', error);
      toast.error('Failed to export calendar');
    }
  };

  // Render different steps
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Trip Planner
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Plan your perfect trip with AI-powered recommendations, real-time collaboration, and smart optimization
              </p>
            </div>

            {/* Natural Language Input */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNaturalLanguageInput(naturalLanguageInput)}
                  placeholder="Describe your dream trip... (e.g., '5-day romantic getaway to Paris for 2 people with $3000 budget')"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleNaturalLanguageInput(naturalLanguageInput)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <SparklesIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Or start with traditional planning below
              </p>
            </div>

            {/* Quick Start Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.button
                onClick={() => setCurrentStep('destination')}
                className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MapPinIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Choose Destination</h3>
                <p className="text-gray-600 text-sm">Start by selecting where you want to go</p>
              </motion.button>

              <motion.button
                onClick={() => setCurrentStep('builder')}
                className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <BoltIcon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Smart Builder</h3>
                <p className="text-gray-600 text-sm">Use our intelligent itinerary builder</p>
              </motion.button>

              <motion.button
                onClick={() => setShowComparison(true)}
                className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CalendarDaysIcon className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Compare Trips</h3>
                <p className="text-gray-600 text-sm">Compare different trip options</p>
              </motion.button>
            </div>

            {/* Features Showcase */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
              <div className="text-center">
                <SparklesIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">AI-Powered</p>
              </div>
              <div className="text-center">
                <SunIcon className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Weather-Aware</p>
              </div>
              <div className="text-center">
                <ShareIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Collaborative</p>
              </div>
              <div className="text-center">
                <CloudArrowDownIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Offline Ready</p>
              </div>
            </div>
          </motion.div>
        );

      case 'destination':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Destination</h2>
              <p className="text-gray-600">Where would you like to explore?</p>
            </div>
            
            <DestinationSearch
              onDestinationSelect={handleDestinationSelect}
              className="max-w-2xl mx-auto"
            />

            {destination && (
              <DestinationDetails
                destination={destination}
                onPlaceSelect={handlePlaceSelect}
              />
            )}
          </div>
        );

      case 'places':
        return (
          <div className="space-y-6">
            <DestinationDetails
              destination={destination}
              onPlaceSelect={handlePlaceSelect}
            />
            
            {selectedPlaces.length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('builder')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Continue with {selectedPlaces.length} places
                </button>
              </div>
            )}
          </div>
        );

      case 'builder':
        return (
          <ItineraryBuilder
            onItineraryGenerated={handleItineraryGenerated}
          />
        );

      case 'review':
        return (
          <div className="space-y-8">
            {/* Trip Summary */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
              <h2 className="text-3xl font-bold mb-4">Your Trip is Ready!</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-blue-100">Destination</div>
                  <div className="text-xl font-bold">{destination?.name}</div>
                </div>
                <div>
                  <div className="text-blue-100">Duration</div>
                  <div className="text-xl font-bold">{generatedItinerary?.tripLength} days</div>
                </div>
                <div>
                  <div className="text-blue-100">Places</div>
                  <div className="text-xl font-bold">{selectedPlaces.length}</div>
                </div>
                <div>
                  <div className="text-blue-100">Est. Budget</div>
                  <div className="text-xl font-bold">
                    ${expenseEstimate?.total?.toLocaleString() || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Map */}
            {generatedItinerary && (
              <EnhancedMapExperience
                places={generatedItinerary.itinerary?.flatMap(day => day.places) || []}
                center={destination?.location}
                onPlaceSelect={handlePlaceSelect}
                showHiddenGems={true}
              />
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setShowSharing(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                <span>Share Trip</span>
              </button>
              
              <button
                onClick={handleExportPDF}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                <CloudArrowDownIcon className="w-5 h-5" />
                <span>Export PDF</span>
              </button>
              
              <button
                onClick={handleExportCalendar}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                <CalendarDaysIcon className="w-5 h-5" />
                <span>Add to Calendar</span>
              </button>
            </div>

            {/* Weather and Budget Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {weatherData && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <SunIcon className="w-5 h-5 text-yellow-500 mr-2" />
                    Weather Forecast
                  </h3>
                  <p className="text-gray-600">{weatherData.summary?.outlook}</p>
                  {weatherData.recommendations && weatherData.recommendations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Recommendations:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {weatherData.recommendations.slice(0, 3).map((rec, index) => (
                          <li key={index}>• {rec.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {expenseEstimate && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-500 mr-2" />
                    Budget Breakdown
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(expenseEstimate.breakdown || {}).map(([category, data]) => (
                      <div key={category} className="flex justify-between">
                        <span className="capitalize">{category}:</span>
                        <span className="font-medium">₹{data.total?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  {expenseEstimate.budgetAlignment && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{expenseEstimate.budgetAlignment.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {renderStep()}

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
          <motion.button
            onClick={() => setShowChatbot(!showChatbot)}
            className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Modals and Overlays */}
        <TravelChatbot
          tripContext={generatedItinerary}
          onTripUpdate={handleTripUpdate}
          isOpen={showChatbot}
          onToggle={() => setShowChatbot(!showChatbot)}
        />

        {showSharing && generatedItinerary && (
          <TripSharing
            trip={generatedItinerary}
            isOpen={showSharing}
            onClose={() => setShowSharing(false)}
          />
        )}

        {showComparison && (
          <TripComparison
            trips={[]} // This would be populated with user's trips
            isOpen={showComparison}
            onClose={() => setShowComparison(false)}
            onSelectTrip={(tripId) => console.log('Selected trip:', tripId)}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedTripPlanner;
