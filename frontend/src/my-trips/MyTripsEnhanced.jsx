import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useFirestore } from '../services/firestoreService';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../service/firebaseConfig';
import toast from 'react-hot-toast';
import { 
  PlusIcon, 
  MapPinIcon, 
  CalendarDaysIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TrashIcon,
  PencilIcon,
  BookmarkIcon,
  GlobeAltIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { EnhancedButton, EnhancedCard, EnhancedInput, EnhancedBadge } from '../components/ui/EnhancedComponents';

function MyTripsEnhanced() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const firestore = useFirestore();
  const [userTrips, setUserTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [indexError, setIndexError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState(new Set());
  const [tripToDelete, setTripToDelete] = useState(null);

  useEffect(() => {
    if (currentUser) {
      GetUserTrips();
    } else {
      navigate('/login');
    }
  }, [currentUser]);

  useEffect(() => {
    filterAndSortTrips();
  }, [userTrips, searchQuery, filterBy, sortBy]);

  const GetUserTrips = async () => {
    if (!currentUser?.uid) {
      console.warn('No user ID available for fetching trips');
      setLoading(false);
      return;
    }

    setLoading(true);
    setIndexError(null);

    try {
      console.log('🔄 Fetching trips for user:', currentUser.uid);
      const trips = await firestore.getUserTrips(currentUser.uid);
      console.log('✅ Trips fetched successfully:', trips.length);

      setUserTrips(trips);

      if (trips.length === 0) {
        toast('Ready to plan your first adventure? 🌟', {
          icon: '✈️',
          duration: 5000
        });
      } else {
        toast.success(`Welcome back! You have ${trips.length} amazing trips.`);
      }
    } catch (error) {
      console.error('❌ Error fetching trips:', error);

      // Handle different types of errors
      if (error.message.includes('index') || error.message.includes('failed-precondition')) {
        console.log('🔗 Firestore index issue detected. Trips should still load with client-side sorting.');
        setIndexError({
          message: 'Using client-side sorting for optimal performance.',
          action: 'Your trips are loading normally. For better performance, you can create a Firestore index.',
          retry: false
        });
        // Don't show error toast since trips should still load
      } else if (error.message.includes('permission') || error.message.includes('insufficient')) {
        toast.error('Permission denied. Please check your Firestore security rules.');
        setIndexError({
          message: 'Permission denied accessing your trips.',
          action: 'Please check your Firestore security rules or try signing in again.',
          retry: true
        });
      } else {
        toast.error('Failed to load your trips. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTrips = () => {
    let filtered = [...userTrips];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(trip => 
        trip.userSelection?.location?.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.userSelection?.destination?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(trip => {
        switch (filterBy) {
          case 'budget':
            return getBudgetCategory(trip.userSelection?.budget) === 'budget';
          case 'moderate':
            return getBudgetCategory(trip.userSelection?.budget) === 'moderate';
          case 'luxury':
            return getBudgetCategory(trip.userSelection?.budget) === 'luxury';
          case 'favorites':
            return favorites.has(trip.id);
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'duration':
          return (b.userSelection?.noOfDays || 0) - (a.userSelection?.noOfDays || 0);
        case 'alphabetical':
          const aName = a.userSelection?.location?.label || a.userSelection?.destination?.name || '';
          const bName = b.userSelection?.location?.label || b.userSelection?.destination?.name || '';
          return aName.localeCompare(bName);
        default:
          return 0;
      }
    });

    setFilteredTrips(filtered);
  };

  const getBudgetCategory = (budget) => {
    if (typeof budget === 'object' && budget !== null && budget.max) {
      if (budget.max <= 1500) return 'budget';
      if (budget.max <= 5000) return 'moderate';
      return 'luxury';
    }
    return 'moderate';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently created';

    try {
      let date;

      // Handle different timestamp formats
      if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
        // Firestore Timestamp
        date = timestamp.toDate();
      } else if (timestamp?.seconds) {
        // Firestore Timestamp object
        date = new Date(timestamp.seconds * 1000);
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        // Regular timestamp or date string
        date = new Date(timestamp);
      } else {
        // Fallback to current date
        date = new Date();
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Recently created';
      }

      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently created';
    }
  };

  const getBudgetIcon = (budget) => {
    if (typeof budget === 'string') {
      switch (budget.toLowerCase()) {
        case 'budget': return '💵';
        case 'moderate': return '💰';
        case 'luxury': return '💎';
        default: return '💰';
      }
    }
    
    if (typeof budget === 'object' && budget !== null && budget.max) {
      if (budget.max <= 1500) return '💵';
      if (budget.max <= 5000) return '💰';
      return '💎';
    }

    return '💰';
  };

  const formatBudget = (budget) => {
    if (typeof budget === 'object' && budget !== null) {
      return `₹${budget.min?.toLocaleString()} - ₹${budget.max?.toLocaleString()}`;
    }
    return budget || 'Budget not specified';
  };

  const getTravelerIcon = (traveler) => {
    switch (traveler?.toLowerCase()) {
      case 'just me': 
      case 'solo': return '🙋‍♀️';
      case 'a couple':
      case 'couple': return '💑';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'friends': return '👥';
      default: return '👥';
    }
  };

  const toggleFavorite = (tripId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(tripId)) {
      newFavorites.delete(tripId);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(tripId);
      toast.success('Added to favorites');
    }
    setFavorites(newFavorites);
  };

  const handleShare = async (trip) => {
    try {
      await navigator.share({
        title: `Trip to ${trip.userSelection?.location?.label || trip.userSelection?.destination?.name}`,
        text: `Check out my amazing trip plan!`,
        url: `${window.location.origin}/view-trip/${trip.id}`
      });
    } catch (error) {
      navigator.clipboard.writeText(`${window.location.origin}/view-trip/${trip.id}`);
      toast.success('Trip link copied to clipboard!');
    }
  };

  const handleDeleteTrip = async (trip) => {
    const tripName = trip.userSelection?.destination?.name || trip.userSelection?.location?.label || 'this trip';

    // Set trip to delete and show professional confirmation
    setTripToDelete(trip);

    // Show professional toast confirmation
    toast((t) => (
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-2">
          <TrashIcon className="w-5 h-5 text-red-500" />
          <span className="font-semibold text-gray-900">Delete Trip</span>
        </div>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete your trip to <strong>{tripName}</strong>?
        </p>
        <p className="text-xs text-red-500">This action cannot be undone.</p>
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              confirmDeleteTrip(trip);
            }}
            className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              setTripToDelete(null);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 10000, // 10 seconds to decide
      position: 'top-center',
    });
  };

  const confirmDeleteTrip = async (trip) => {

    try {
      console.log('🗑️ Deleting trip:', trip.id);

      // Validate inputs
      if (!trip.id) {
        toast.error('Trip ID is missing');
        return;
      }

      if (!currentUser) {
        toast.error('Please sign in to delete trips');
        return;
      }

      // Show simple loading message
      toast('Deleting trip...', { icon: '🗑️' });

      // Delete the trip using direct Firebase call
      const docRef = doc(db, 'trips', trip.id);
      await deleteDoc(docRef);

      // Remove from local state immediately
      setUserTrips(prevTrips => prevTrips.filter(t => t.id !== trip.id));

      // Remove from favorites if it was favorited
      setFavorites(prevFavorites => {
        const newFavorites = new Set(prevFavorites);
        newFavorites.delete(trip.id);
        return newFavorites;
      });

      // Show success message
      toast.success(`Trip deleted successfully!`);

    } catch (error) {
      console.error('❌ Error deleting trip:', error);

      // Show simple error message
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Please check your account.');
      } else if (error.code === 'not-found') {
        toast.error('Trip not found.');
      } else {
        toast.error('Failed to delete trip. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl text-gray-700 font-medium"
          >
            Loading your adventures...
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-sm text-gray-500"
          >
            Gathering your travel memories ✨
          </motion.div>
        </div>
      </div>
    );
  }

  if (indexError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="text-6xl mb-6">⚙️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Setup Required</h2>
          <p className="text-gray-600 mb-6">{indexError.message}</p>
          <p className="text-sm text-gray-500 mb-8">{indexError.action}</p>
          <motion.button
            onClick={GetUserTrips}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry Loading
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              My Adventures
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-light mb-8 max-w-2xl mx-auto">
              Your collection of amazing journeys and future adventures
            </p>

            {/* Enhanced Responsive Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 max-w-3xl mx-auto">
              <motion.div
                className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 rounded-2xl"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GlobeAltIcon className="w-5 md:w-6 h-5 md:h-6 text-blue-200" />
                <div className="text-center sm:text-left">
                  <div className="text-xl md:text-2xl font-bold">{userTrips.length}</div>
                  <div className="text-sm text-blue-200">Trips</div>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 rounded-2xl"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <HeartSolidIcon className="w-5 md:w-6 h-5 md:h-6 text-red-300" />
                <div className="text-center sm:text-left">
                  <div className="text-xl md:text-2xl font-bold">{favorites.size}</div>
                  <div className="text-sm text-red-200">Favorites</div>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 rounded-2xl"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <SparklesIcon className="w-5 md:w-6 h-5 md:h-6 text-yellow-300" />
                <div className="text-center sm:text-left">
                  <div className="text-xl md:text-2xl font-bold">Explorer</div>
                  <div className="text-sm text-yellow-200">Level</div>
                </div>
              </motion.div>
            </div>

            {/* Create New Trip Button */}
            <motion.button
              onClick={() => navigate('/create-trip')}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusIcon className="w-6 h-6" />
              <span>Plan New Adventure</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-wrap items-center space-x-4">
              {/* Filter Dropdown */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Trips</option>
                <option value="budget">Budget Trips</option>
                <option value="moderate">Moderate Trips</option>
                <option value="luxury">Luxury Trips</option>
                <option value="favorites">Favorites</option>
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="duration">By Duration</option>
                <option value="alphabetical">A-Z</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-md text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-white shadow-md text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredTrips.length} of {userTrips.length} trips
          </div>
        </motion.div>

        {/* Empty State */}
        {filteredTrips.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-8xl mb-6">🗺️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchQuery || filterBy !== 'all' ? 'No trips match your search' : 'No adventures yet!'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery || filterBy !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Ready to explore the world? Create your first trip and start planning your next adventure!'
              }
            </p>
            {(!searchQuery && filterBy === 'all') && (
              <motion.button
                onClick={() => navigate('/create-trip')}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create Your First Trip</span>
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Trips Grid/List */}
        {filteredTrips.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8'
              : 'space-y-4 md:space-y-6'
            }
          >
            <AnimatePresence>
              {filteredTrips.map((trip, index) => (
                <EnhancedCard
                  key={trip.id}
                  variant="glass"
                  hover={true}
                  className={`group overflow-hidden cursor-pointer ${
                    viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
                  }`}
                  onClick={() => navigate(`/view-trip/${trip.id}`)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Trip Image */}
                  <div className={`relative overflow-hidden ${
                    viewMode === 'list' ? 'md:w-80 h-48 md:h-auto' : 'h-64'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500" />
                    <img
                      src="/road-trip-vacation.jpg"
                      alt={trip.userSelection?.location?.label || 'Trip destination'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />

                    {/* Overlay Actions */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(trip.id);
                        }}
                        className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {favorites.has(trip.id) ? (
                          <HeartSolidIcon className="w-5 h-5 text-red-400" />
                        ) : (
                          <HeartIcon className="w-5 h-5 text-white" />
                        )}
                      </motion.button>

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(trip);
                        }}
                        className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ShareIcon className="w-5 h-5 text-white" />
                      </motion.button>

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('🗑️ Delete button clicked for trip:', trip);
                          handleDeleteTrip(trip);
                        }}
                        className="p-2 bg-red-500/20 backdrop-blur-md rounded-full hover:bg-red-500/30 transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={`Delete trip to ${trip.userSelection?.location?.label || 'destination'}`}
                      >
                        <TrashIcon className="w-5 h-5 text-red-300 hover:text-red-200" />
                      </motion.button>
                    </div>

                    {/* Budget Badge */}
                    <div className="absolute bottom-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full shadow-lg">
                      <span className="font-bold text-sm">
                        {formatBudget(trip.userSelection?.budget)}
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Responsive Trip Content */}
                  <div className={`p-4 md:p-6 lg:p-8 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                          {trip.userSelection?.location?.label || trip.userSelection?.destination?.name || 'Unknown Destination'}
                        </h3>
                        <div className="text-2xl">
                          {getBudgetIcon(trip.userSelection?.budget)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600 mb-4">
                        <ClockIcon className="w-4 h-4" />
                        <span className="text-sm">Created {formatDate(trip.createdAt)}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                          <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">
                            {trip.userSelection?.noOfDays} Days
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-lg">
                          <UserGroupIcon className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700">
                            {trip.userSelection?.traveler}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="text-2xl">
                          {getTravelerIcon(trip.userSelection?.traveler)}
                        </div>
                        <span className="text-sm text-gray-600">
                          {trip.userSelection?.traveler}
                        </span>
                      </div>

                      <motion.button
                        onClick={() => navigate(`/view-trip/${trip.id}`)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>View Trip</span>
                      </motion.button>
                    </div>
                  </div>
                </EnhancedCard>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default MyTripsEnhanced;
