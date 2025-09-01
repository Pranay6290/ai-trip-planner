import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useFirestore } from '../services/firestoreService';
import toast from 'react-hot-toast';
import { 
  PlusIcon, 
  MapPinIcon, 
  CalendarDaysIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

function MyTripsModern() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const firestore = useFirestore();
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [indexError, setIndexError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      GetUserTrips();
    } else {
      navigate('/login');
    }
  }, [currentUser]);

  const GetUserTrips = async () => {
    setLoading(true);
    setIndexError(null);

    try {
      const trips = await firestore.getUserTrips(currentUser.uid);
      setUserTrips(trips);

      if (trips.length === 0) {
        toast('No trips found. Create your first trip!', { icon: '✈️' });
      }
    } catch (error) {
      console.error('Error fetching trips:', error);

      // Handle index creation error specifically
      if (error.message.includes('index') || error.message.includes('failed-precondition')) {
        setIndexError({
          message: 'Firestore index required for this query.',
          action: 'The first time you run this query, Firebase will provide a link to create the required index.',
          retry: true
        });
        toast.error('Index required - check console for setup link');
      } else {
        toast.error('Failed to load your trips');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getBudgetIcon = (budget) => {
    // Handle both old string format and new object format for budget
    if (typeof budget === 'string') {
      switch (budget.toLowerCase()) {
        case 'budget': return '💵';
        case 'moderate': return '💰';
        case 'luxury': return '💎';
        default: return '💰';
      }
    }
    
    if (typeof budget === 'object' && budget !== null && budget.max) {
      if (budget.max <= 1500) return '💵'; // Budget
      if (budget.max <= 5000) return '💰'; // Moderate
      return '💎'; // Luxury
    }

    return '💰'; // Default icon
  };

  const getTravelerIcon = (traveler) => {
    switch (traveler?.toLowerCase()) {
      case 'just me': return '🙋‍♀️';
      case 'a couple': return '💑';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'friends': return '👥';
      default: return '👥';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Loading your amazing trips...</p>
        </div>
      </div>
    );
  }

  // Show index error if present
  if (indexError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Database Index Required</h2>
            <p className="text-gray-700 mb-6">{indexError.message}</p>
            <p className="text-gray-600 mb-6">{indexError.action}</p>
            <div className="space-y-4">
              <button
                onClick={GetUserTrips}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <p className="text-sm text-gray-500">
                Check the browser console for the index creation link
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            My{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Travel Adventures
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore your personalized trip collection and plan your next adventure
          </p>
        </motion.div>

        {/* Create New Trip Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <button
            onClick={() => navigate('/create-trip')}
            className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <PlusIcon className="w-6 h-6" />
            <span>Create New Trip</span>
          </button>
        </motion.div>

        {/* Trips Grid */}
        {userTrips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-6">✈️</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No trips yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start your journey by creating your first AI-powered trip plan
            </p>
            <button
              onClick={() => navigate('/create-trip')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Plan Your First Trip
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/view-trip/${trip.id}`)}
              >
                {/* Trip Image */}
                <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold mb-1">
                      {trip.userSelection?.location?.label || 'Unknown Destination'}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm opacity-90">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>{trip.userSelection?.noOfDays || 0} days</span>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getBudgetIcon(trip.userSelection?.budget)}</span>
                      <span className="text-sm font-medium text-gray-600">
                        {trip.userSelection?.budget || 'Budget'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getTravelerIcon(trip.userSelection?.traveler)}</span>
                      <span className="text-sm font-medium text-gray-600">
                        {trip.userSelection?.traveler || 'Travelers'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Created: {formatDate(trip.id)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="w-4 h-4" />
                        <span>0</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <HeartIcon className="w-4 h-4" />
                        <span>0</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.share({
                          title: `Trip to ${trip.userSelection?.location?.label}`,
                          url: `${window.location.origin}/view-trip/${trip.id}`
                        }).catch(() => {
                          navigator.clipboard.writeText(`${window.location.origin}/view-trip/${trip.id}`);
                          toast.success('Link copied to clipboard!');
                        });
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-300"
                    >
                      <ShareIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Section */}
        {userTrips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Travel Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{userTrips.length}</div>
                <div className="text-gray-600">Trips Planned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {userTrips.reduce((total, trip) => total + parseInt(trip.userSelection?.noOfDays || 0), 0)}
                </div>
                <div className="text-gray-600">Total Days</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {new Set(userTrips.map(trip => trip.userSelection?.location?.label)).size}
                </div>
                <div className="text-gray-600">Destinations</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default MyTripsModern;
