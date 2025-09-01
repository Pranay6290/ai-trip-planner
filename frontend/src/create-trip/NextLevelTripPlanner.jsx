import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  MapPinIcon, 
  CalendarDaysIcon, 
  UsersIcon, 
  CurrencyRupeeIcon,
  SparklesIcon,
  ClockIcon,
  HeartIcon,
  CameraIcon,
  ShoppingBagIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const NextLevelTripPlanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    destination: '',
    duration: 3,
    travelers: 2,
    budget: 15000,
    interests: [],
    pace: 'moderate',
    preferences: {
      accommodation: 'mid-range',
      transport: 'mixed',
      dining: 'local',
      activities: 'balanced'
    }
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1);
  const [generatedTrip, setGeneratedTrip] = useState(null);

  // Pre-fill form data from navigation state
  useEffect(() => {
    if (location.state?.prefillData) {
      const prefillData = location.state.prefillData;
      setFormData(prev => ({
        ...prev,
        destination: prefillData.destination || prev.destination,
        duration: prefillData.duration || prev.duration,
        travelers: prefillData.travelers || prev.travelers,
        budget: prefillData.budget || prev.budget
      }));
      toast.success('Form pre-filled with your preferences!');
    }
  }, [location.state]);

  // Interest options with icons
  const interestOptions = [
    { id: 'culture', label: 'Culture & Heritage', icon: BuildingLibraryIcon, color: 'bg-purple-100 text-purple-700' },
    { id: 'food', label: 'Food & Cuisine', icon: HeartIcon, color: 'bg-red-100 text-red-700' },
    { id: 'adventure', label: 'Adventure & Sports', icon: SparklesIcon, color: 'bg-green-100 text-green-700' },
    { id: 'photography', label: 'Photography', icon: CameraIcon, color: 'bg-blue-100 text-blue-700' },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBagIcon, color: 'bg-yellow-100 text-yellow-700' },
    { id: 'nature', label: 'Nature & Wildlife', icon: MapPinIcon, color: 'bg-emerald-100 text-emerald-700' }
  ];

  // Pace options
  const paceOptions = [
    { id: 'relaxed', label: 'Relaxed', description: 'Fewer spots, more time to enjoy', icon: '🌸' },
    { id: 'moderate', label: 'Moderate', description: 'Balanced experience', icon: '⚖️' },
    { id: 'packed', label: 'Packed', description: 'More attractions, efficient timing', icon: '⚡' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interestId) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const handlePreferenceChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: value
      }
    }));
  };

  const generateNextLevelTrip = async () => {
    if (!currentUser) {
      toast.error('Please sign in to generate trips');
      navigate('/login');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🚀 Generating next-level trip with data:', formData);
      
      const response = await fetch('http://localhost:5000/api/trips/generate-next-level', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate trip');
      }

      const result = await response.json();
      console.log('✅ Next-level trip generated:', result);
      
      setGeneratedTrip(result.data);
      setStep(3); // Move to results step
      toast.success('🎉 Your next-level trip is ready!');
      
    } catch (error) {
      console.error('❌ Error generating trip:', error);
      toast.error(error.message || 'Failed to generate trip. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Plan Your Perfect Trip</h2>
        <p className="text-gray-600">Tell us about your dream destination</p>
      </div>

      {/* Destination Input */}
      <div className="space-y-4">
        <label className="flex items-center text-lg font-semibold text-gray-900">
          <MapPinIcon className="w-6 h-6 mr-2 text-blue-600" />
          Where do you want to go?
        </label>
        <input
          type="text"
          value={formData.destination}
          onChange={(e) => handleInputChange('destination', e.target.value)}
          placeholder="e.g., Mumbai, Paris, Tokyo, New York..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
      </div>

      {/* Duration */}
      <div className="space-y-4">
        <label className="flex items-center text-lg font-semibold text-gray-900">
          <CalendarDaysIcon className="w-6 h-6 mr-2 text-green-600" />
          How many days?
        </label>
        <div className="flex space-x-4">
          {[1, 2, 3, 4, 5, 7, 10].map(days => (
            <button
              key={days}
              onClick={() => handleInputChange('duration', days)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                formData.duration === days
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days} {days === 1 ? 'Day' : 'Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Travelers */}
      <div className="space-y-4">
        <label className="flex items-center text-lg font-semibold text-gray-900">
          <UsersIcon className="w-6 h-6 mr-2 text-purple-600" />
          How many travelers?
        </label>
        <div className="flex space-x-4">
          {[1, 2, 3, 4, 5, 6].map(count => (
            <button
              key={count}
              onClick={() => handleInputChange('travelers', count)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                formData.travelers === count
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-4">
        <label className="flex items-center text-lg font-semibold text-gray-900">
          <CurrencyRupeeIcon className="w-6 h-6 mr-2 text-yellow-600" />
          What's your budget?
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="5000"
            max="100000"
            step="5000"
            value={formData.budget}
            onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹5,000</span>
            <span className="font-bold text-lg text-yellow-600">₹{formData.budget.toLocaleString()}</span>
            <span>₹1,00,000</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={!formData.destination.trim()}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next: Customize Your Experience
      </button>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Customize Your Experience</h2>
        <p className="text-gray-600">Tell us what you love to make your trip perfect</p>
      </div>

      {/* Interests */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">What interests you?</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {interestOptions.map(interest => {
            const Icon = interest.icon;
            const isSelected = formData.interests.includes(interest.id);
            
            return (
              <button
                key={interest.id}
                onClick={() => handleInterestToggle(interest.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  isSelected
                    ? `${interest.color} border-current shadow-lg transform scale-105`
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <Icon className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm font-medium">{interest.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trip Pace */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <ClockIcon className="w-6 h-6 mr-2 text-blue-600" />
          What's your preferred pace?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paceOptions.map(pace => (
            <button
              key={pace.id}
              onClick={() => handleInputChange('pace', pace.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                formData.pace === pace.id
                  ? 'bg-blue-50 border-blue-500 shadow-lg'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="text-2xl mb-2">{pace.icon}</div>
              <div className="font-semibold text-gray-900">{pace.label}</div>
              <div className="text-sm text-gray-600">{pace.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-300 transition-all duration-300"
        >
          Back
        </button>
        <button
          onClick={generateNextLevelTrip}
          disabled={isGenerating}
          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
              Generating Your Perfect Trip...
            </div>
          ) : (
            '🚀 Generate My Next-Level Trip'
          )}
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">🎉 Your Next-Level Trip is Ready!</h2>
        <p className="text-gray-600">Here's your personalized itinerary with all the details</p>
      </div>

      {generatedTrip && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{generatedTrip.tripSummary?.totalAttractions || 'N/A'}</div>
              <div className="text-sm text-gray-600">Total Attractions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{generatedTrip.tripSummary?.totalBudget || 'N/A'}</div>
              <div className="text-sm text-gray-600">Total Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{generatedTrip.tripSummary?.pace || 'Moderate'}</div>
              <div className="text-sm text-gray-600">Trip Pace</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{generatedTrip.tripSummary?.tripMood || 'Cultural'}</div>
              <div className="text-sm text-gray-600">Trip Mood</div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/view-next-level-trip', { state: { trip: generatedTrip } })}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              View Detailed Itinerary
            </button>
            <button
              onClick={() => {
                setStep(1);
                setGeneratedTrip(null);
                setFormData({
                  destination: '',
                  duration: 3,
                  travelers: 2,
                  budget: 15000,
                  interests: [],
                  pace: 'moderate',
                  preferences: {
                    accommodation: 'mid-range',
                    transport: 'mixed',
                    dining: 'local',
                    activities: 'balanced'
                  }
                });
              }}
              className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-300 transition-all duration-300"
            >
              Plan Another Trip
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map(stepNum => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= stepNum 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <AnimatePresence mode="wait">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextLevelTripPlanner;
