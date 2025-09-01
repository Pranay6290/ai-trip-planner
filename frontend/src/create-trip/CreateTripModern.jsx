import React, { useState } from "react";
import { motion } from "framer-motion";
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
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

// Import new components and services
import DestinationSearch from '../components/search/DestinationSearch';
import TripFilters from '../components/filters/TripFilters';
import { useItineraryService } from '../services/itineraryService';
import { useTelemetry } from '../services/telemetryService';

// Budget options with modern styling
const SelectBudgetOptions = [
  {
    id: 1,
    title: 'Budget',
    desc: "Stay conscious of costs",
    icon: '💵',
    range: '$500 - $1,500'
  },
  {
    id: 2,
    title: 'Moderate',
    desc: "Keep cost on the average side",
    icon: '💰',
    range: '$1,500 - $3,000'
  },
  {
    id: 3,
    title: 'Luxury',
    desc: "Don't worry about cost",
    icon: '💎',
    range: '$3,000+'
  },
];

const SelectTravelList = [
  {
    id: 1,
    title: 'Just Me',
    desc: "A solo traveler's adventure",
    icon: '🙋‍♀️',
    people: '1 person',
  },
  {
    id: 2,
    title: 'A Couple',
    desc: "Two travelers in love",
    icon: '💑',
    people: '2 people',
  },
  {
    id: 3,
    title: 'Family',
    desc: "A group of fun loving adventurers",
    icon: '👨‍👩‍👧‍👦',
    people: '3 to 5 people',
  },
  {
    id: 4,
    title: 'Friends',
    desc: "A bunch of thrill-seekers",
    icon: '👥',
    people: '5 to 12 people',
  },
];

function CreateTripModern() {
  const [place, setPlace] = useState();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const OnGenerateTrip = async () => {
    if (!currentUser) {
      toast.error('Please sign in to create a trip');
      navigate('/login');
      return;
    }

    if (!formData?.noOfDays || !formData?.location || !formData?.budget || !formData?.traveler) {
      toast.error('Please fill in all details');
      return;
    }

    setLoading(true);
    
    const FINAL_PROMPT = `Generate Travel Plan for Location: ${formData?.location?.label}, for ${formData?.noOfDays} Days for ${formData?.traveler} with a ${formData?.budget} budget, Give me a Hotels options list with HotelName, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest itinerary with placeName, Place Details, Place Image Url, Geo Coordinates, ticket Pricing, rating, Time travel each of the location for ${formData?.noOfDays} days with each day plan with best time to visit in JSON format.`;

    try {
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const tripData = JSON.parse(result?.response?.text());
      
      const docId = Date.now().toString();
      await setDoc(doc(db, "AITrips", docId), {
        userSelection: formData,
        tripData: tripData,
        userEmail: currentUser?.email,
        id: docId
      });

      toast.success('Trip generated successfully!');
      navigate('/view-trip/' + docId);
    } catch (error) {
      console.error('Error generating trip:', error);
      toast.error('Failed to generate trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 1: return formData?.location;
      case 2: return formData?.noOfDays;
      case 3: return formData?.budget;
      case 4: return formData?.traveler;
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
            Create Your Perfect{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Trip
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us your preferences and let our AI create a personalized travel itinerary just for you
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-full h-1 mx-4 transition-all duration-300 ${
                    currentStep > step ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Destination</span>
            <span>Duration</span>
            <span>Budget</span>
            <span>Travelers</span>
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 mb-8"
        >
          {/* Step 1: Destination */}
          {currentStep === 1 && (
            <div>
              <div className="flex items-center mb-6">
                <MapPinIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Where do you want to go?</h2>
                  <p className="text-gray-600">Choose your dream destination</p>
                </div>
              </div>
              <div className="relative">
                <GooglePlacesAutocomplete
                  apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY}
                  selectProps={{
                    place,
                    onChange: (v) => {
                      setPlace(v);
                      handleInputChange('location', v);
                    },
                    placeholder: 'Search for a destination...',
                    className: 'text-lg',
                    styles: {
                      control: (provided) => ({
                        ...provided,
                        padding: '8px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '18px',
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: '#3b82f6',
                        },
                        '&:focus-within': {
                          borderColor: '#3b82f6',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                        },
                      }),
                      menu: (provided) => ({
                        ...provided,
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white',
                        color: state.isSelected ? 'white' : '#374151',
                        padding: '12px 16px',
                        '&:hover': {
                          backgroundColor: state.isSelected ? '#3b82f6' : '#f3f4f6',
                        },
                      }),
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Duration */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center mb-6">
                <CalendarDaysIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">How many days?</h2>
                  <p className="text-gray-600">Plan your perfect trip duration</p>
                </div>
              </div>
              <input
                type="number"
                placeholder="Enter number of days"
                min="1"
                max="30"
                className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300"
                onChange={(e) => handleInputChange('noOfDays', e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-2">Recommended: 3-7 days for most destinations</p>
            </div>
          )}

          {/* Step 3: Budget */}
          {currentStep === 3 && (
            <div>
              <div className="flex items-center mb-6">
                <CurrencyDollarIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">What's your budget?</h2>
                  <p className="text-gray-600">Choose your spending comfort level</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SelectBudgetOptions.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleInputChange('budget', item.title)}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      formData?.budget === item.title
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-2">{item.desc}</p>
                    <p className="text-sm font-medium text-blue-600">{item.range}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Travelers */}
          {currentStep === 4 && (
            <div>
              <div className="flex items-center mb-6">
                <UserGroupIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Who's traveling?</h2>
                  <p className="text-gray-600">Tell us about your travel group</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SelectTravelList.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleInputChange('traveler', item.title)}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      formData?.traveler === item.title
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-2">{item.desc}</p>
                    <p className="text-sm font-medium text-blue-600">{item.people}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Previous</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={!isStepComplete(currentStep)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                isStepComplete(currentStep)
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Next</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={OnGenerateTrip}
              disabled={loading || !isStepComplete(4)}
              className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                loading || !isStepComplete(4)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
              }`}
            >
              <SparklesIcon className="w-5 h-5" />
              <span>{loading ? 'Generating...' : 'Generate My Trip'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateTripModern;
