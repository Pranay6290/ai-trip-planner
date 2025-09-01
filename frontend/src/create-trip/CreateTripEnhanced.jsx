import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../service/firebaseConfig";
import { 
  MapPinIcon, 
  CalendarDaysIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  AdjustmentsHorizontalIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

// Import new components and services
import DestinationSearch from '../components/search/DestinationSearch';
import TripFilters from '../components/filters/TripFilters';
import { useItineraryService } from '../services/itineraryService';
import { useTelemetry } from '../services/telemetryService';
import { useNLPService } from '../services/nlpService';
import { usePersonalizationService } from '../services/personalizationService';
import { useFirestore } from '../services/firestoreService';

function CreateTripEnhanced() {
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [formData, setFormData] = useState({
    destination: null,
    duration: 5,
    budget: { min: 1000, max: 3000 },
    travelers: 2,
    travelStyle: [],
    interests: [],
    pace: 'moderate'
  });
  const [filters, setFilters] = useState({
    budget: { min: 500, max: 10000 },
    duration: { min: 1, max: 30 },
    travelers: 1,
    travelStyle: [],
    interests: [],
    pace: 'moderate',
    openNow: false,
    priceLevel: []
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [useNaturalLanguage, setUseNaturalLanguage] = useState(false);
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const itineraryService = useItineraryService();
  const telemetry = useTelemetry();
  const nlpService = useNLPService();
  const personalizationService = usePersonalizationService();
  const firestore = useFirestore();

  const handleDestinationSelect = (destination) => {
    setSelectedDestination(destination);
    setFormData({ ...formData, destination });
    telemetry.trackDestinationSelected(destination);
  };

  const handleInputChange = (name, value) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    telemetry.trackEvent('form_field_changed', { field: name, step: currentStep });
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setFormData({ ...formData, ...newFilters });
  };

  const handleNaturalLanguageInput = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter your trip description');
      return;
    }

    setLoading(true);
    try {
      telemetry.trackEvent('natural_language_input_started', { inputLength: aiPrompt.length });

      // Parse natural language input using NLP service
      const parsedData = await nlpService.parseNaturalLanguageInput(aiPrompt);

      // Validate parsed data
      const validation = nlpService.validateParsedData(parsedData);

      if (!validation.isValid) {
        toast.error('Could not understand your request. Please provide more details.');
        return;
      }

      // Get personalized recommendations if user is logged in
      let recommendations = null;
      if (currentUser) {
        try {
          recommendations = await personalizationService.getPersonalizedRecommendations(
            currentUser.uid,
            parsedData
          );
        } catch (error) {
          console.warn('Could not get personalized recommendations:', error);
        }
      }

      // Update form data with parsed information
      setFormData({ ...formData, ...parsedData });
      setSelectedDestination(parsedData.destination);

      // Show any ambiguities or suggestions
      if (parsedData.ambiguities && parsedData.ambiguities.length > 0) {
        const questions = nlpService.generateClarificationQuestions(parsedData);
        // You could show these questions in a modal or inline
        console.log('Clarification questions:', questions);
      }

      // Skip to review step if confidence is high enough
      if (parsedData.confidence > 0.7) {
        setCurrentStep(4);
        toast.success('Trip preferences extracted successfully!');
      } else {
        setCurrentStep(2); // Go to step-by-step for refinement
        toast.success('Basic preferences extracted. Please review and refine.');
      }

      telemetry.trackEvent('natural_language_input_completed', {
        confidence: parsedData.confidence,
        hasRecommendations: !!recommendations,
        finalStep: parsedData.confidence > 0.7 ? 4 : 2
      });

    } catch (error) {
      console.error('Error parsing natural language input:', error);
      toast.error('Could not understand your request. Please try the step-by-step approach.');
      telemetry.trackError(error, { action: 'handleNaturalLanguageInput', prompt: aiPrompt.substring(0, 100) });
    } finally {
      setLoading(false);
    }
  };

  const OnGenerateTrip = async () => {
    if (!currentUser) {
      toast.error('Please sign in to create a trip');
      navigate('/login');
      return;
    }

    if (!formData.destination || !formData.duration) {
      toast.error('Please select a destination and duration');
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      // Use the new itinerary service
      const itinerary = await itineraryService.generateItinerary(formData, filters);
      
      // Save trip using the new Firestore service
      const savedTrip = await firestore.saveTrip(currentUser.uid, {
        userSelection: formData,
        tripData: itinerary,
        userEmail: currentUser?.email,
        title: `${formData.destination?.name || 'Trip'} - ${formData.duration} Days`,
        destination: formData.destination,
        duration: formData.duration,
        travelers: formData.travelers,
        budget: formData.budget,
        filters: filters
      });

      const generationTime = Date.now() - startTime;
      telemetry.trackItineraryGenerated(formData, generationTime);

      toast.success('Trip generated successfully!');
      navigate('/view-trip/' + savedTrip.id);
    } catch (error) {
      console.error('Error generating trip:', error);
      telemetry.trackError(error, { action: 'generateTrip', formData });
      toast.error('Failed to generate trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      telemetry.trackEvent('step_completed', { step: currentStep });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 1: return formData.destination;
      case 2: return formData.duration > 0;
      case 3: return formData.budget && formData.travelers;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Plan Your Perfect{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Trip
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Tell us your preferences and let our AI create a personalized travel itinerary just for you
          </p>

          {/* Natural Language Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <button
              onClick={() => setUseNaturalLanguage(false)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                !useNaturalLanguage
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5 inline-block mr-2" />
              Step-by-Step
            </button>
            <button
              onClick={() => setUseNaturalLanguage(true)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                useNaturalLanguage
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 inline-block mr-2" />
              Use AI Prompt
            </button>
          </div>
        </motion.div>

        {/* Form Body */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <AnimatePresence mode="wait">
            {useNaturalLanguage ? (
              <motion.div
                key="ai-prompt"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Describe Your Dream Trip</h2>
                  <p className="text-gray-600">
                    Tell us about your ideal vacation in your own words, and we'll create the perfect itinerary
                  </p>
                </div>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., 'A romantic 5-day trip to Paris for two, focusing on art museums and local cuisine, on a moderate budget.'"
                  className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleNaturalLanguageInput}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-6 h-6" />
                        <span>Generate with AI</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-form"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                {/* Step 1: Destination */}
                {currentStep === 1 && (
                  <div>
                    <div className="flex items-center mb-6">
                      <MapPinIcon className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Where do you want to go?</h2>
                        <p className="text-gray-600">Select your dream destination</p>
                      </div>
                    </div>
                    <DestinationSearch onDestinationSelect={handleDestinationSelect} />
                  </div>
                )}

                {/* Step 2: Duration */}
                {currentStep === 2 && (
                  <div>
                    <div className="flex items-center mb-6">
                      <CalendarDaysIcon className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">How long is your trip?</h2>
                        <p className="text-gray-600">Enter the number of days for your adventure</p>
                      </div>
                    </div>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value, 10))}
                      min="1"
                      max="30"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Step 3: Travelers & Budget */}
                {currentStep === 3 && (
                  <div>
                    <div className="flex items-center mb-6">
                      <UserGroupIcon className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Who's traveling?</h2>
                        <p className="text-gray-600">Specify the number of travelers</p>
                      </div>
                    </div>
                    <input
                      type="number"
                      value={formData.travelers}
                      onChange={(e) => handleInputChange('travelers', parseInt(e.target.value, 10))}
                      min="1"
                      className="w-full p-3 border border-gray-300 rounded-lg mb-8 focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex items-center mb-6">
                      <CurrencyDollarIcon className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">What's your budget?</h2>
                        <p className="text-gray-600">Define your spending range per person</p>
                      </div>
                    </div>
                    {/* A proper range slider would be ideal here */}
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        value={formData.budget.min}
                        onChange={(e) => handleInputChange('budget', { ...formData.budget, min: parseInt(e.target.value, 10) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Min"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        value={formData.budget.max}
                        onChange={(e) => handleInputChange('budget', { ...formData.budget, max: parseInt(e.target.value, 10) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Review & Filters */}
                {currentStep === 4 && (
                  <div>
                    <div className="flex items-center mb-6">
                      <AdjustmentsHorizontalIcon className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Customize your perfect trip</h2>
                        <p className="text-gray-600">Fine-tune your preferences for a tailored itinerary</p>
                      </div>
                    </div>
                    <TripFilters filters={filters} onFiltersChange={handleFiltersChange} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-10 flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!isStepComplete(currentStep)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Next
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={OnGenerateTrip}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Generating...' : 'Generate My Trip'}
                <SparklesIcon className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTripEnhanced;
