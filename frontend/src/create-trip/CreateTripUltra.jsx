import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { indianDestinations, searchIndianDestinations } from '../data/indianDestinations';
import enhancedAIService from '../services/enhancedAIService';
import workingAIService from '../services/workingAIService';
import comprehensivePlacesService from '../services/comprehensivePlacesService';
import enhancedTripService from '../services/enhancedTripService';
import optimizedTripService from '../services/optimizedTripService';
import SmartDestinationSearch from '../components/enhanced/SmartDestinationSearch';

// Next-level AI components
import AITravelChatbot from '../components/nextlevel/AITravelChatbot';
import SmartRouteOptimizer from '../components/nextlevel/SmartRouteOptimizer';
import WeatherAwarePlanner from '../components/nextlevel/WeatherAwarePlanner';
import CollaborativePlanner from '../components/nextlevel/CollaborativePlanner';
import {
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  StarIcon,
  GlobeAltIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import DestinationSearch from '../components/search/DestinationSearch';
import TripFilters from '../components/filters/TripFilters';
import { useFirestore } from '../services/firestoreService';
import EnhancedLoading from '../components/ui/EnhancedLoading';

// Enhanced animations
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  hover: { scale: 1.02, y: -5 }
};

const gradientVariants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

function CreateTripUltra() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const firestore = useFirestore();
  const [searchParams] = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [useNaturalLanguage, setUseNaturalLanguage] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Next-level features state
  const [generatedTrip, setGeneratedTrip] = useState(null);
  const [showNextLevelFeatures, setShowNextLevelFeatures] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [weatherAdjustedItinerary, setWeatherAdjustedItinerary] = useState(null);
  
  const [formData, setFormData] = useState({
    destination: null,
    duration: 7,
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
    accessibility: false,
    familyFriendly: false
  });

  // Handle URL parameters for pre-filled data
  useEffect(() => {
    const destination = searchParams.get('destination');
    const duration = searchParams.get('duration');
    const travelers = searchParams.get('travelers');
    const budget = searchParams.get('budget');
    const preselected = searchParams.get('preselected');

    if (preselected === 'true' && destination) {
      console.log('🎯 Pre-filling form with quick recommendation:', { destination, duration, travelers, budget });

      // Find the destination in our database
      const foundDestinations = searchIndianDestinations(destination);
      const destinationData = foundDestinations.length > 0 ? foundDestinations[0] : null;

      setFormData(prev => ({
        ...prev,
        destination: destinationData,
        duration: duration ? parseInt(duration) : prev.duration,
        travelers: travelers ? parseInt(travelers) : prev.travelers,
        budget: budget ? { min: parseInt(budget) * 0.8, max: parseInt(budget) * 1.2 } : prev.budget
      }));

      // Skip to review step if all data is provided
      if (destinationData && duration && travelers && budget) {
        setCurrentStep(4); // Go to review step
        toast.success(`Pre-filled trip to ${destination}! Review and generate your itinerary.`);
      }
    }
  }, [searchParams]);

  // Next-level feature handlers
  const handleChatbotTripGenerated = (tripPlan) => {
    console.log('🤖 Chatbot generated trip:', tripPlan);
    setGeneratedTrip(tripPlan);
    setShowNextLevelFeatures(true);
    toast.success('Trip generated via AI Chat!');
  };

  const handleRouteOptimized = (optimizedRoute) => {
    console.log('🗺️ Route optimized:', optimizedRoute);
    setOptimizedRoute(optimizedRoute);
    if (generatedTrip) {
      setGeneratedTrip({
        ...generatedTrip,
        itinerary: optimizedRoute.itinerary,
        optimized: true
      });
    }
  };

  const handleWeatherAdjustment = (adjustedItinerary) => {
    console.log('🌤️ Weather adjusted:', adjustedItinerary);
    setWeatherAdjustedItinerary(adjustedItinerary);
    if (generatedTrip) {
      setGeneratedTrip({
        ...generatedTrip,
        itinerary: adjustedItinerary,
        weatherOptimized: true
      });
    }
  };

  // Enhanced step validation with more flexible requirements
  const isStepComplete = (step) => {
    switch (step) {
      case 1: return formData.destination && formData.destination.name;
      case 2: return formData.duration > 0;
      case 3: return formData.budget && formData.budget.min && formData.travelers > 0;
      case 4: return true;
      default: return false;
    }
  };

  // Allow navigation even if step is not complete (for better UX)
  const canNavigateToStep = (step) => {
    switch (step) {
      case 1: return true;
      case 2: return formData.destination; // Need destination to proceed
      case 3: return formData.destination && formData.duration > 0; // Need destination and duration
      case 4: return formData.destination && formData.duration > 0; // Can review even without complete budget/travelers
      default: return false;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const nextStep = () => {
    const nextStepNumber = Math.min(currentStep + 1, 4);
    if (canNavigateToStep(nextStepNumber)) {
      setCurrentStep(nextStepNumber);
    } else {
      // Show helpful message about what's needed
      if (currentStep === 1 && !formData.destination) {
        toast.error('Please select a destination first');
      } else if (currentStep === 2 && !formData.duration) {
        toast.error('Please select trip duration');
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
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
      console.log('🚀 Generating trip with optimized service...');

      // Use optimized trip service (reliable with multiple fallbacks)
      const generatedItinerary = await optimizedTripService.generateTrip(formData);

      console.log('✅ Itinerary generated successfully:', generatedItinerary);

      // Save trip using Firestore service - ensure it's always saved
      let savedTrip = null;
      try {
        savedTrip = await firestore.saveTrip(currentUser.uid, {
          userSelection: formData,
          tripData: generatedItinerary,
          userEmail: currentUser?.email,
          title: `${formData.destination?.name || 'Trip'} - ${formData.duration} Days`,
          destination: formData.destination,
          duration: formData.duration,
          travelers: formData.travelers,
          budget: formData.budget,
          travelStyle: formData.travelStyle,
          interests: formData.interests,
          filters: filters
        });

        console.log('✅ Trip saved successfully:', savedTrip.id);
        toast.success('Trip saved to My Trips!');
      } catch (saveError) {
        console.error('❌ Error saving trip:', saveError);
        toast.error('Trip generated but failed to save. Please try again.');
      }

      const generationTime = Date.now() - startTime;
      console.log(`Trip generated in ${generationTime}ms`);

      toast.success('🎉 Your amazing trip has been created!');

      // Navigate to trip view if saved successfully, otherwise stay on current page
      if (savedTrip && savedTrip.id) {
        navigate(`/view-trip/${savedTrip.id}`);
      } else {
        // If save failed, create a temporary ID for viewing
        const tempId = `temp_${Date.now()}`;
        navigate(`/view-trip/${tempId}`, {
          state: {
            tripData: generatedItinerary,
            userSelection: formData
          }
        });
      }
    } catch (error) {
      console.error('Error generating trip:', error);

      // Enhanced error handling - NEVER show AI errors to users
      let errorMessage = 'Trip generation completed with local data!';

      if (error.message.includes('quota') || error.message.includes('429')) {
        console.log('🔄 AI quota exceeded, but local generation should work');
        errorMessage = 'Trip generated using our comprehensive local database!';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Trip generated offline with local data!';
      }

      // Try to generate with basic fallback
      try {
        console.log('🔄 Attempting basic trip generation...');
        const fallbackTrip = await enhancedTripService.generateBasicTrip(formData);

        if (fallbackTrip && fallbackTrip.tripSummary) {
          // Save the fallback trip
          try {
            const savedTrip = await firestore.saveTrip(currentUser.uid, {
              userSelection: formData,
              tripData: fallbackTrip,
              userEmail: currentUser?.email,
              title: `${formData.destination?.name || 'Trip'} - ${formData.duration} Days`,
              destination: formData.destination,
              duration: formData.duration,
              travelers: formData.travelers,
              budget: formData.budget,
              travelStyle: formData.travelStyle,
              interests: formData.interests,
              filters: filters
            });

            toast.success('🎉 Your trip has been created successfully!');
            navigate(`/view-trip/${savedTrip.id}`);
            return;
          } catch (saveError) {
            console.warn('Could not save trip, but generation successful');
            toast.success('Trip generated! (Note: Could not save to database)');
            return;
          }
        }
      } catch (fallbackError) {
        console.error('Even fallback failed:', fallbackError);
      }

      toast.error('Unable to generate trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNaturalLanguageInput = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter your trip details');
      return;
    }

    setLoading(true);
    try {
      console.log('🤖 Processing enhanced AI request:', aiPrompt);

      // Use working AI service for reliable generation
      const tripPlan = await workingAIService.generateTrip(aiPrompt);
      console.log('✨ Trip plan generated:', tripPlan);

      // Store generated trip for next-level features
      setGeneratedTrip(tripPlan);
      setShowNextLevelFeatures(true);

      // Extract form data from the generated plan
      const extractedFormData = {
        destination: {
          name: tripPlan.tripSummary?.destination || 'India',
          label: tripPlan.tripSummary?.destination || 'India',
          location: { lat: 20.5937, lng: 78.9629 } // Default India coordinates
        },
        duration: tripPlan.tripSummary?.duration || 3,
        budget: {
          min: Math.floor(tripPlan.tripSummary?.totalEstimatedCost?.replace(/[₹,]/g, '') * 0.8) || 10000,
          max: parseInt(tripPlan.tripSummary?.totalEstimatedCost?.replace(/[₹,]/g, '')) || 15000
        },
        travelers: tripPlan.tripSummary?.travelers || 2,
        travelStyle: ['cultural', 'sightseeing'],
        interests: ['nature', 'culture']
      };

      // Set the form data and generated trip
      setFormData(extractedFormData);
      setGeneratedTrip(tripPlan);
      setUseNaturalLanguage(false);
      setCurrentStep(4); // Go to review step

      toast.success('✨ AI has created your perfect trip! Review the details below.');
    } catch (error) {
      console.error('❌ Enhanced AI processing failed:', error);

      // Fallback to basic parsing
      try {
        console.log('🔄 Falling back to basic parsing...');
        const parsedData = await parseNaturalLanguageInput(aiPrompt);

        if (parsedData) {
          setFormData(parsedData);
          setUseNaturalLanguage(false);
          setCurrentStep(4);
          toast.success('✨ AI has parsed your request! Review and generate your trip.');
        } else {
          throw new Error('Could not parse your request');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback parsing also failed:', fallbackError);
        toast.error('Failed to understand your request. Please try with more specific details like: "3 days in Kolkata with 2 people, budget ₹15,000"');
      }
    } finally {
      setLoading(false);
    }
  };

  // AI parsing function
  const parseNaturalLanguageInput = async (prompt) => {
    const lowerPrompt = prompt.toLowerCase();

    // Extract destination
    const destination = extractDestination(lowerPrompt);

    // Extract duration
    const duration = extractDuration(lowerPrompt);

    // Extract budget
    const budget = extractBudget(lowerPrompt);

    // Extract travelers
    const travelers = extractTravelers(lowerPrompt);

    // Extract travel style and interests
    const { travelStyle, interests } = extractStyleAndInterests(lowerPrompt);

    return {
      destination,
      duration,
      budget,
      travelers,
      travelStyle,
      interests
    };
  };

  // Enhanced destination extraction using comprehensive database
  const extractDestination = (prompt) => {
    console.log('🔍 Extracting destination from prompt:', prompt);

    // Use the comprehensive Indian destinations database
    const foundDestinations = searchIndianDestinations(prompt);

    if (foundDestinations.length > 0) {
      const destination = foundDestinations[0]; // Take the best match
      console.log('🇮🇳 Found Indian destination:', destination.name);

      return {
        name: destination.name,
        label: destination.name,
        location: destination.location,
        state: destination.state,
        category: destination.category,
        highlights: destination.highlights,
        bestTime: destination.bestTime,
        averageDays: destination.averageDays
      };
    }

    // Simple fallback for any unmatched cities
    const lowerPrompt = prompt.toLowerCase();
    const commonPatterns = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'goa', 'kerala', 'rajasthan'];

    for (const pattern of commonPatterns) {
      if (lowerPrompt.includes(pattern)) {
        const cityName = pattern.charAt(0).toUpperCase() + pattern.slice(1);
        return {
          name: `${cityName}, India`,
          label: `${cityName}, India`,
          location: { lat: 20.5937, lng: 78.9629 } // Default India coordinates
        };
      }
    }

    // Default to India if no specific city found
    console.log('⚠️ No specific destination found, defaulting to India');
    return {
      name: 'India',
      label: 'India',
      location: { lat: 20.5937, lng: 78.9629 }
    };
  };

  const extractDuration = (prompt) => {
    // Look for duration patterns
    const durationPatterns = [
      /(\d+)\s*days?/i,
      /(\d+)\s*day\s*trip/i,
      /(\d+)\s*nights?/i,
      /(\d+)\s*week/i,
      /weekend/i,
      /long\s*weekend/i,
      /short\s*trip/i,
      /quick\s*trip/i
    ];

    for (const pattern of durationPatterns) {
      const match = prompt.match(pattern);
      if (match) {
        if (pattern.source.includes('week')) {
          return parseInt(match[1]) * 7;
        } else if (pattern.source.includes('weekend')) {
          return 3;
        } else if (pattern.source.includes('short') || pattern.source.includes('quick')) {
          return 2;
        } else {
          return parseInt(match[1]) || 3;
        }
      }
    }

    return 3; // Default 3 days
  };

  const extractBudget = (prompt) => {
    // Look for budget patterns
    if (prompt.includes('budget') || prompt.includes('cheap') || prompt.includes('affordable')) {
      return { min: 500, max: 1500 };
    } else if (prompt.includes('luxury') || prompt.includes('premium') || prompt.includes('expensive')) {
      return { min: 5000, max: 15000 };
    } else if (prompt.includes('mid-range') || prompt.includes('moderate')) {
      return { min: 2000, max: 5000 };
    }

    // Look for specific amounts
    const budgetMatch = prompt.match(/(\d+)\s*(?:rupees?|rs|₹|dollars?|\$)/i);
    if (budgetMatch) {
      const amount = parseInt(budgetMatch[1]);
      return { min: amount * 0.8, max: amount * 1.2 };
    }

    return { min: 1500, max: 4000 }; // Default mid-range
  };

  const extractTravelers = (prompt) => {
    console.log('🔍 Extracting travelers from prompt:', prompt);

    // Enhanced traveler patterns with more variations
    const travelerPatterns = [
      /(\d+)\s*people/i,
      /(\d+)\s*persons?/i,
      /(\d+)\s*travelers?/i,
      /(\d+)\s*adults?/i,
      /(\d+)\s*individuals?/i,
      /group\s*of\s*(\d+)/i,
      /family\s*of\s*(\d+)/i,
      /party\s*of\s*(\d+)/i,
      /with\s*(\d+)\s*people/i,
      /for\s*(\d+)\s*people/i,
      /(\d+)\s*of\s*us/i,
      /we\s*are\s*(\d+)/i,
      /couple/i,
      /solo/i,
      /alone/i,
      /family/i
    ];

    for (const pattern of travelerPatterns) {
      const match = prompt.match(pattern);
      if (match) {
        console.log('🎯 Found traveler match:', match);

        if (pattern.source.includes('couple')) {
          console.log('👫 Detected couple: 2 travelers');
          return 2;
        } else if (pattern.source.includes('solo') || pattern.source.includes('alone')) {
          console.log('🚶 Detected solo: 1 traveler');
          return 1;
        } else if (pattern.source.includes('family') && !match[1]) {
          console.log('👨‍👩‍👧‍👦 Detected family: 4 travelers');
          return 4;
        } else if (match[1]) {
          const count = parseInt(match[1]);
          console.log(`👥 Detected ${count} travelers from pattern:`, pattern.source);
          return count;
        }
      }
    }

    console.log('⚠️ No traveler pattern found, defaulting to 2');
    return 2; // Default 2 travelers
  };

  const extractStyleAndInterests = (prompt) => {
    const travelStyles = [];
    const interests = [];

    // Travel styles
    if (prompt.includes('adventure') || prompt.includes('trekking') || prompt.includes('hiking')) {
      travelStyles.push('adventure');
      interests.push('outdoor activities', 'trekking');
    }
    if (prompt.includes('romantic') || prompt.includes('honeymoon') || prompt.includes('couple')) {
      travelStyles.push('romantic');
      interests.push('romantic spots', 'fine dining');
    }
    if (prompt.includes('cultural') || prompt.includes('heritage') || prompt.includes('history')) {
      travelStyles.push('cultural');
      interests.push('museums', 'historical sites');
    }
    if (prompt.includes('beach') || prompt.includes('coastal') || prompt.includes('sea')) {
      travelStyles.push('beach');
      interests.push('beaches', 'water sports');
    }
    if (prompt.includes('spiritual') || prompt.includes('religious') || prompt.includes('temple')) {
      travelStyles.push('spiritual');
      interests.push('temples', 'meditation');
    }
    if (prompt.includes('food') || prompt.includes('culinary') || prompt.includes('cuisine')) {
      interests.push('food', 'local cuisine', 'restaurants');
    }
    if (prompt.includes('shopping') || prompt.includes('market')) {
      interests.push('shopping', 'local markets');
    }
    if (prompt.includes('nature') || prompt.includes('wildlife') || prompt.includes('forest')) {
      travelStyles.push('nature');
      interests.push('wildlife', 'nature walks');
    }

    // Default values if nothing found
    if (travelStyles.length === 0) {
      travelStyles.push('cultural', 'relaxed');
    }
    if (interests.length === 0) {
      interests.push('sightseeing', 'local culture', 'food');
    }

    return { travelStyle: travelStyles, interests };
  };

  // Show enhanced loading screen
  if (loading) {
    return <EnhancedLoading message="Creating your perfect trip..." />;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen relative overflow-hidden"
    >
      {/* Professional Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(-45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1), rgba(20, 184, 166, 0.1))',
            backgroundSize: '400% 400%'
          }}
          variants={gradientVariants}
          animate="animate"
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 backdrop-blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-block mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <SparklesIcon className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 hero-title">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Dream
              </span>
              <br />
              <span className="text-gray-900">Plan & Explore</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed hero-subtitle px-4">
              Let our AI craft the perfect journey tailored just for you ✨
            </p>

            {/* Mode Toggle */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 md:mb-12 hero-buttons"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={() => setUseNaturalLanguage(false)}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 w-full sm:w-auto ${
                  !useNaturalLanguage
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5 inline mr-2" />
                Step by Step
              </motion.button>
              
              <motion.button
                onClick={() => setUseNaturalLanguage(true)}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 w-full sm:w-auto ${
                  useNaturalLanguage
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 inline mr-2" />
                Tell AI
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Natural Language Input */}
          <AnimatePresence>
            {useNaturalLanguage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-12"
              >
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
                >
                  <div className="text-center mb-6">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell AI About Your Dream Trip</h2>
                    <p className="text-gray-600">Describe your perfect vacation and let AI do the magic</p>
                  </div>
                  
                  <div className="space-y-6">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Example: I want a 3-day trip to Jharkhand with 3 people and a budget of ₹15,000. We love nature, waterfalls, and local culture. We prefer adventure activities and exploring tribal heritage..."
                      className="w-full h-40 p-6 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none transition-all duration-300 resize-none text-lg bg-white/50 backdrop-blur-sm"
                      rows={6}
                    />
                    
                    <motion.button
                      onClick={handleNaturalLanguageInput}
                      disabled={loading || !aiPrompt.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl"
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          AI is thinking...
                        </div>
                      ) : (
                        <>
                          <SparklesIcon className="w-6 h-6 inline mr-2" />
                          Create My Perfect Trip
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step-by-Step Process */}
          <AnimatePresence>
            {!useNaturalLanguage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Enhanced Responsive Progress Bar */}
                <div className="mb-16">
                  {/* Desktop Progress Bar */}
                  <div className="hidden md:block">
                    <div className="flex items-center justify-between mb-6">
                      {[
                        { step: 1, icon: MapPinIcon, label: 'Destination', color: 'from-blue-500 to-cyan-500' },
                        { step: 2, icon: CalendarDaysIcon, label: 'Duration', color: 'from-purple-500 to-pink-500' },
                        { step: 3, icon: UserGroupIcon, label: 'Details', color: 'from-green-500 to-blue-500' },
                        { step: 4, icon: CheckIcon, label: 'Review', color: 'from-yellow-500 to-orange-500' }
                      ].map(({ step, icon: Icon, label, color }) => (
                        <div key={step} className="flex items-center flex-1">
                          <motion.div
                            className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${
                              currentStep >= step
                                ? `bg-gradient-to-r ${color} text-white shadow-2xl`
                                : 'bg-white/80 backdrop-blur-sm text-gray-400 border-2 border-gray-200'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            animate={currentStep === step ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            <Icon className="w-8 h-8" />
                          </motion.div>
                          {step < 4 && (
                            <motion.div
                              className={`flex-1 h-2 mx-6 rounded-full transition-all duration-500 ${
                                currentStep > step
                                  ? `bg-gradient-to-r ${color}`
                                  : 'bg-gray-200'
                              }`}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: currentStep > step ? 1 : 0 }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between text-sm font-medium text-gray-600">
                      <span>Choose Destination</span>
                      <span>Set Duration</span>
                      <span>Add Details</span>
                      <span>Review & Create</span>
                    </div>
                  </div>

                  {/* Mobile Progress Bar */}
                  <div className="md:hidden">
                    <div className="flex items-center justify-center mb-6">
                      <div className="flex items-center space-x-4">
                        {[1, 2, 3, 4].map((step) => (
                          <motion.div
                            key={step}
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                              currentStep >= step
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                : currentStep === step
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg ring-4 ring-blue-200'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            animate={currentStep === step ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            {step}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-800 mb-1">
                        Step {currentStep} of 4
                      </div>
                      <div className="text-sm text-gray-600">
                        {currentStep === 1 && 'Choose your dream destination'}
                        {currentStep === 2 && 'Set your trip duration'}
                        {currentStep === 3 && 'Personalize your journey'}
                        {currentStep === 4 && 'Review and create your trip'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="mb-12"
                  >
                    <motion.div
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      className="bg-white/90 backdrop-blur-lg rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border border-white/20"
                    >
                      {/* Step 1: Destination */}
                      {currentStep === 1 && (
                        <div>
                          <div className="text-center mb-8">
                            <GlobeAltIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Where do you want to go?</h2>
                            <p className="text-gray-600 text-lg">Choose your dream destination</p>
                          </div>
                          
                          <SmartDestinationSearch
                            onDestinationSelect={(destination) => handleInputChange('destination', destination)}
                            placeholder="Search Indian destinations (e.g., Kolkata, Jharkhand, Digha, Mumbai...)"
                            className="w-full"
                          />
                          
                          {formData.destination && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200"
                            >
                              <div className="flex items-center">
                                <MapPinIcon className="w-8 h-8 text-blue-600 mr-3" />
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-lg">{formData.destination.name}</h3>
                                  <p className="text-gray-600">Perfect choice! ✨</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* Step 2: Duration */}
                      {currentStep === 2 && (
                        <div>
                          <div className="text-center mb-6 md:mb-8">
                            <CalendarDaysIcon className="w-12 h-12 md:w-16 md:h-16 text-purple-600 mx-auto mb-4" />
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 hero-title">How long is your adventure?</h2>
                            <p className="text-gray-600 text-base md:text-lg hero-subtitle px-4">Choose the perfect duration</p>
                          </div>
                          
                          <div className="space-y-8">
                            <div className="relative">
                              <label className="block text-2xl font-bold text-gray-800 mb-6 text-center">
                                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                  {formData.duration} {formData.duration === 1 ? 'Day' : 'Days'}
                                </span>
                              </label>

                              {/* Custom Range Slider */}
                              <div className="relative px-4">
                                <input
                                  type="range"
                                  min="1"
                                  max="30"
                                  value={formData.duration}
                                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider"
                                  style={{
                                    background: `linear-gradient(to right, #8b5cf6 0%, #3b82f6 ${((formData.duration - 1) / 29) * 100}%, #e5e7eb ${((formData.duration - 1) / 29) * 100}%, #e5e7eb 100%)`,
                                    WebkitAppearance: 'none',
                                    outline: 'none'
                                  }}
                                />

                                {/* Slider thumb indicator */}
                                <div
                                  className="absolute top-0 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg border-2 border-white pointer-events-none"
                                  style={{
                                    left: `${((formData.duration - 1) / 29) * 100}%`,
                                    top: '50%'
                                  }}
                                />
                              </div>

                              <div className="flex justify-between text-sm text-gray-500 mt-4 px-4">
                                <span className="font-medium">1 day</span>
                                <span className="font-medium">30 days</span>
                              </div>

                              {/* Duration description */}
                              <div className="text-center mt-4">
                                <p className="text-gray-600">
                                  {formData.duration <= 3 && "Perfect for a quick getaway ⚡"}
                                  {formData.duration > 3 && formData.duration <= 7 && "Great for a week-long adventure 🌟"}
                                  {formData.duration > 7 && formData.duration <= 14 && "Ideal for extended exploration 🗺️"}
                                  {formData.duration > 14 && "Epic journey awaits! 🚀"}
                                </p>
                              </div>
                            </div>

                            {/* Quick duration options */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {[
                                { days: 3, label: 'Weekend', desc: 'Quick escape', emoji: '🏃‍♂️' },
                                { days: 7, label: 'One Week', desc: 'Perfect balance', emoji: '⚖️' },
                                { days: 14, label: 'Two Weeks', desc: 'Extended journey', emoji: '🌍' },
                                { days: 21, label: 'Three Weeks', desc: 'Deep exploration', emoji: '🔍' }
                              ].map((option) => (
                                <motion.button
                                  key={option.days}
                                  onClick={() => handleInputChange('duration', option.days)}
                                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                                    formData.duration === option.days
                                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 shadow-lg'
                                      : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                                  }`}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <div className="text-2xl mb-2">{option.emoji}</div>
                                  <div className="font-bold text-lg">{option.label}</div>
                                  <div className="text-sm text-gray-600">{option.desc}</div>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Enhanced Details & Preferences */}
                      {currentStep === 3 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6 }}
                        >
                          <div className="text-center mb-12">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                              className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                              <UserGroupIcon className="w-10 h-10 text-white" />
                            </motion.div>
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                              Personalize Your Journey
                            </h2>
                            <p className="text-slate-600 text-xl max-w-2xl mx-auto leading-relaxed">
                              Tell us about your preferences to create the perfect itinerary tailored just for you
                            </p>
                          </div>

                          {/* Enhanced Budget & Travelers Section */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                            {/* Budget Selection */}
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                              className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-3xl border border-blue-200 shadow-lg"
                            >
                              <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                                  <span className="text-2xl text-white font-bold">₹</span>
                                </div>
                                <div>
                                  <h3 className="text-2xl font-bold text-slate-800">Budget Range</h3>
                                  <p className="text-slate-600">What's your spending comfort zone?</p>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {[
                                  { label: 'Budget Friendly', range: '₹500 - ₹1,500', min: 500, max: 1500, icon: '💰' },
                                  { label: 'Mid Range', range: '₹1,500 - ₹4,000', min: 1500, max: 4000, icon: '💳' },
                                  { label: 'Luxury', range: '₹4,000 - ₹10,000+', min: 4000, max: 10000, icon: '💎' }
                                ].map((budget, index) => (
                                  <motion.button
                                    key={budget.label}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleInputChange('budget', { min: budget.min, max: budget.max })}
                                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
                                      formData.budget?.min === budget.min
                                        ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <span className="text-2xl mr-3">{budget.icon}</span>
                                        <div className="text-left">
                                          <div className="font-semibold">{budget.label}</div>
                                          <div className="text-sm opacity-75">{budget.range}</div>
                                        </div>
                                      </div>
                                      {formData.budget?.min === budget.min && (
                                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        </div>
                                      )}
                                    </div>
                                  </motion.button>
                                ))}
                              </div>
                            </motion.div>

                            {/* Travelers Selection */}
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 }}
                              className="bg-gradient-to-br from-purple-50 to-pink-100 p-8 rounded-3xl border border-purple-200 shadow-lg"
                            >
                              <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                                  <UserGroupIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-2xl font-bold text-slate-800">Travel Group</h3>
                                  <p className="text-slate-600">How many adventurers?</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                {[
                                  { count: 1, label: 'Solo', icon: '🧳', desc: 'Just me' },
                                  { count: 2, label: 'Couple', icon: '💕', desc: 'Two people' },
                                  { count: 4, label: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Small group' },
                                  { count: 6, label: 'Friends', icon: '👥', desc: 'Large group' }
                                ].map((option) => (
                                  <motion.button
                                    key={option.count}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleInputChange('travelers', option.count)}
                                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                                      formData.travelers === option.count
                                        ? 'border-purple-500 bg-purple-500 text-white shadow-lg'
                                        : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-md'
                                    }`}
                                  >
                                    <div className="text-3xl mb-2">{option.icon}</div>
                                    <div className="font-semibold">{option.label}</div>
                                    <div className="text-sm opacity-75">{option.desc}</div>
                                  </motion.button>
                                ))}
                              </div>

                              {/* Custom traveler count */}
                              <div className="mt-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  Or enter custom number:
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={formData.travelers || ''}
                                  onChange={(e) => handleInputChange('travelers', parseInt(e.target.value) || 1)}
                                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  placeholder="Number of travelers"
                                />
                              </div>
                            </motion.div>
                          </div>

                          {/* Enhanced Filters Component */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <TripFilters
                              filters={filters}
                              onFiltersChange={handleFiltersChange}
                              formData={formData}
                              onFormDataChange={handleInputChange}
                            />
                          </motion.div>
                        </motion.div>
                      )}

                      {/* Step 4: Review */}
                      {currentStep === 4 && (
                        <div>
                          <div className="text-center mb-8">
                            <StarIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Ready to create magic?</h2>
                            <p className="text-gray-600 text-lg">Review your trip details</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
                              <MapPinIcon className="w-8 h-8 text-blue-600 mb-3" />
                              <div className="text-sm text-gray-600">Destination</div>
                              <div className="font-bold text-lg">{formData.destination?.name || 'Not selected'}</div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl">
                              <CalendarDaysIcon className="w-8 h-8 text-purple-600 mb-3" />
                              <div className="text-sm text-gray-600">Duration</div>
                              <div className="font-bold text-lg">{formData.duration} days</div>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl">
                              <CurrencyDollarIcon className="w-8 h-8 text-green-600 mb-3" />
                              <div className="text-sm text-gray-600">Budget</div>
                              <div className="font-bold text-lg">
                                ₹{(formData.budget?.min || 500).toLocaleString()} - ₹{(formData.budget?.max || 5000).toLocaleString()}
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-pink-50 to-yellow-50 p-6 rounded-2xl">
                              <UserGroupIcon className="w-8 h-8 text-pink-600 mb-3" />
                              <div className="text-sm text-gray-600">Travelers</div>
                              <div className="font-bold text-lg">{formData.travelers} people</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {/* Enhanced Navigation */}
                <div className="flex justify-between items-center">
                  <motion.button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                      currentStep === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg'
                    }`}
                    whileHover={currentStep !== 1 ? { scale: 1.05 } : {}}
                    whileTap={currentStep !== 1 ? { scale: 0.95 } : {}}
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Previous</span>
                  </motion.button>

                  {currentStep < 4 ? (
                    <motion.button
                      onClick={nextStep}
                      disabled={!canNavigateToStep(currentStep + 1)}
                      className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                        canNavigateToStep(currentStep + 1)
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-2xl'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      whileHover={canNavigateToStep(currentStep + 1) ? { scale: 1.05 } : {}}
                      whileTap={canNavigateToStep(currentStep + 1) ? { scale: 0.95 } : {}}
                    >
                      <span>{isStepComplete(currentStep) ? 'Next' : 'Continue'}</span>
                      <ArrowRightIcon className="w-5 h-5" />
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={OnGenerateTrip}
                      disabled={loading || !isStepComplete(4)}
                      className={`flex items-center space-x-3 px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                        loading || !isStepComplete(4)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-2xl'
                      }`}
                      whileHover={!loading && isStepComplete(4) ? { scale: 1.05 } : {}}
                      whileTap={!loading && isStepComplete(4) ? { scale: 0.95 } : {}}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>Creating Magic...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-6 h-6" />
                          <span>Create My Trip</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Next-Level AI Features */}
      {showNextLevelFeatures && generatedTrip && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 space-y-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🚀 Next-Level AI Features
            </h2>
            <p className="text-lg text-gray-600">
              Enhance your trip with AI-powered optimization and smart planning
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Smart Route Optimizer */}
            <SmartRouteOptimizer
              itinerary={generatedTrip.itinerary}
              onOptimizedRoute={handleRouteOptimized}
            />

            {/* Weather-Aware Planner */}
            <WeatherAwarePlanner
              destination={generatedTrip.tripSummary ?
                { name: generatedTrip.tripSummary.destination, location: { lat: 20.5937, lng: 78.9629 } } :
                formData.destination
              }
              itinerary={generatedTrip.itinerary}
              onWeatherAdjustment={handleWeatherAdjustment}
            />
          </div>

          {/* Collaborative Planning */}
          <div className="mt-8">
            <CollaborativePlanner
              tripPlan={generatedTrip}
              onTripUpdate={(updatedTrip) => {
                console.log('🤝 Collaborative update:', updatedTrip);
                setGeneratedTrip(updatedTrip);
                toast.success('Trip updated through collaboration!');
              }}
            />
          </div>

          {/* Trip Summary with Enhancements */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ✨ Your Enhanced Trip Plan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  {generatedTrip.tripSummary?.duration || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Days</div>
              </div>

              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {generatedTrip.tripSummary?.budget || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Budget</div>
              </div>

              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {generatedTrip.itinerary?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Days Planned</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {generatedTrip.optimized && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  🗺️ Route Optimized
                </span>
              )}
              {generatedTrip.weatherOptimized && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  🌤️ Weather Optimized
                </span>
              )}
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                🤖 AI Generated
              </span>
            </div>

            <button
              onClick={() => {
                // Navigate to trip view or save trip
                console.log('Saving enhanced trip:', generatedTrip);
                toast.success('Trip plan ready! Redirecting...');
                // Add navigation logic here
              }}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300"
            >
              Save & View Complete Trip Plan
            </button>
          </div>
        </motion.div>
      )}

      {/* AI Travel Chatbot */}
      <AITravelChatbot
        onTripGenerated={handleChatbotTripGenerated}
        className="z-50"
      />
    </motion.div>
  );
}

export default CreateTripUltra;
