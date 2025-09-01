import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirestore } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../service/firebaseConfig';
import toast from 'react-hot-toast';
import { 
  MapPinIcon, 
  CalendarDaysIcon, 
  BuildingOfficeIcon,
  ShareIcon,
  HeartIcon,
  ClockIcon,
  UserGroupIcon,
  PhotoIcon,
  ArrowLeftIcon,
  BookmarkIcon,
  GlobeAltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

function ViewTripEnhanced() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const firestore = useFirestore();
  const { currentUser } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [deleteConfirmationStep, setDeleteConfirmationStep] = useState(0); // 0: none, 1: first click, 2: confirmed

  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) return;
      
      try {
        const tripData = await firestore.getTrip(tripId);
        if (tripData) {
          setTrip(tripData);
        }
      } catch (error) {
        console.error('Error fetching trip:', error);
        toast.error('Failed to load trip');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId, firestore]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Trip to ${trip?.userSelection?.destination?.name || trip?.userSelection?.location?.label}`,
        text: `Check out my amazing trip plan to ${trip?.userSelection?.destination?.name || trip?.userSelection?.location?.label}!`,
        url: window.location.href
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleDeleteClick = () => {
    const tripName = trip?.userSelection?.destination?.name || trip?.userSelection?.location?.label || 'this trip';

    if (deleteConfirmationStep === 0) {
      // First click - show confirmation toast
      setDeleteConfirmationStep(1);

      toast((t) => (
        <div className="flex flex-col space-y-4 p-1">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <div className="text-2xl">🗑️</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-lg text-gray-900 mb-1">Delete Trip?</div>
              <div className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to permanently delete your trip to{' '}
                <span className="font-semibold text-gray-900">{tripName}</span>?
              </div>
              <div className="text-xs text-red-600 font-medium mt-2 flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                This action cannot be undone
              </div>
            </div>
          </div>
          <div className="flex space-x-3 pt-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                setDeleteConfirmationStep(0);
              }}
              className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all duration-200 border border-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleDeleteTrip();
              }}
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Delete Trip
            </button>
          </div>
        </div>
      ), {
        duration: 10000,
        position: 'top-center',
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #f3f4f6',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '20px',
          minWidth: '380px',
          maxWidth: '420px'
        }
      });

      // Reset confirmation step after timeout
      setTimeout(() => {
        setDeleteConfirmationStep(0);
      }, 8000);

    } else if (deleteConfirmationStep === 1) {
      // Second click within timeout - proceed with deletion
      handleDeleteTrip();
    }
  };

  const handleDeleteTrip = async () => {
    try {
      console.log('🗑️ Deleting trip from ViewTrip:', tripId);

      setLoading(true);
      setDeleteConfirmationStep(2);

      // Show professional loading toast
      const loadingToast = toast.loading(
        <div className="flex items-center space-x-4 p-1">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900">Deleting Trip...</div>
            <div className="text-sm text-gray-600">Please wait while we remove your trip safely</div>
          </div>
        </div>,
        {
          style: {
            background: 'white',
            color: 'black',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '20px',
            minWidth: '320px'
          }
        }
      );

      // Use direct Firebase delete for reliability
      const docRef = doc(db, 'trips', tripId);
      await deleteDoc(docRef);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);

      toast.success(
        <div className="flex items-center space-x-4 p-1">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <div className="text-xl">✅</div>
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900">Trip Deleted Successfully!</div>
            <div className="text-sm text-gray-600">Your trip has been permanently removed</div>
          </div>
        </div>,
        {
          duration: 3000,
          style: {
            background: 'white',
            color: 'black',
            border: '1px solid #10b981',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '20px',
            minWidth: '320px'
          }
        }
      );

      // Navigate after a short delay
      setTimeout(() => {
        navigate('/my-trips');
      }, 1500);

    } catch (error) {
      console.error('❌ Error deleting trip:', error);

      toast.error(
        <div className="flex items-center space-x-4 p-1">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <div className="text-xl">❌</div>
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900">Delete Failed</div>
            <div className="text-sm text-gray-600">Something went wrong. Please try again or contact support</div>
          </div>
        </div>,
        {
          duration: 6000,
          style: {
            background: 'white',
            color: 'black',
            border: '1px solid #ef4444',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '20px',
            minWidth: '320px'
          }
        }
      );
    } finally {
      setLoading(false);
      setDeleteConfirmationStep(0);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    toast.success(liked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? 'Bookmark removed' : 'Trip bookmarked');
  };

  // Mock images for the gallery
  const tripImages = [
    '/road-trip-vacation.jpg',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
  ];

  // Auto-play functionality for image gallery
  useEffect(() => {
    if (autoPlay && showImageGallery) {
      const interval = setInterval(() => {
        setSelectedImage((prev) => (prev + 1) % tripImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [autoPlay, showImageGallery, tripImages.length]);

  const formatBudget = (budget) => {
    if (typeof budget === 'object' && budget !== null) {
      return `₹${budget.min?.toLocaleString()} - ₹${budget.max?.toLocaleString()}`;
    }
    return budget || 'Budget not specified';
  };

  const getBudgetIcon = (budget) => {
    if (typeof budget === 'object' && budget !== null) {
      const max = budget.max || 0;
      if (max <= 1000) return '💰';
      if (max <= 5000) return '💎';
      return '🏆';
    }
    return '💰';
  };

  const getTravelerIcon = (traveler) => {
    switch (traveler?.toLowerCase()) {
      case 'solo': return '🙋‍♀️';
      case 'couple': return '💑';
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
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl text-gray-700 font-medium"
          >
            Loading your amazing trip...
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-sm text-gray-500"
          >
            Preparing the perfect itinerary ✨
          </motion.div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-8xl mb-6"
          >
            🗺️
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Trip Not Found</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The trip you're looking for doesn't exist or may have been removed. 
            Let's get you back on track!
          </p>
          <div className="space-y-3">
            <motion.button
              onClick={() => navigate('/my-trips')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View My Trips
            </motion.button>
            <motion.button
              onClick={() => navigate('/create-trip')}
              className="w-full bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create New Trip
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Hero Section */}
      <div className="relative h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              y: [0, 30, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-32 right-16 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"
          />
        </div>

        {/* Navigation Bar */}
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex items-center justify-between p-6"
        >
          <motion.button
            onClick={() => navigate('/my-trips')}
            className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeftIcon className="w-6 h-6" />
            <span className="font-medium">Back to Trips</span>
          </motion.button>
          
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={handleLike}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {liked ? (
                <HeartSolidIcon className="w-6 h-6 text-red-400" />
              ) : (
                <HeartIcon className="w-6 h-6 text-white" />
              )}
            </motion.button>
            
            <motion.button
              onClick={handleBookmark}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {bookmarked ? (
                <BookmarkSolidIcon className="w-6 h-6 text-yellow-400" />
              ) : (
                <BookmarkIcon className="w-6 h-6 text-white" />
              )}
            </motion.button>
            
            <motion.button
              onClick={handleShare}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ShareIcon className="w-6 h-6 text-white" />
            </motion.button>

            <motion.div className="relative">
              <motion.button
                onClick={handleDeleteClick}
                className={`p-3 backdrop-blur-md rounded-full transition-all duration-300 ${
                  deleteConfirmationStep === 1
                    ? 'bg-red-600/80 hover:bg-red-700/80'
                    : 'bg-red-500/20 hover:bg-red-500/30'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={deleteConfirmationStep === 1 ? 'Click again to confirm deletion' : 'Delete trip'}
              >
                <TrashIcon className={`w-6 h-6 transition-colors ${
                  deleteConfirmationStep === 1
                    ? 'text-white'
                    : 'text-red-300 hover:text-red-200'
                }`} />
              </motion.button>

              {deleteConfirmationStep === 1 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                >
                  !
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.nav>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center h-full px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center text-white max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-8"
            >
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                {trip.userSelection?.destination?.name || trip.userSelection?.location?.label || 'Your Amazing Trip'}
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 font-light leading-relaxed">
                Discover the perfect blend of adventure and relaxation
              </p>
            </motion.div>

            {/* Trip Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center items-center gap-8 mb-12"
            >
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
                <CalendarDaysIcon className="w-6 h-6 text-blue-200" />
                <span className="text-lg font-semibold">{trip.userSelection?.noOfDays} Days</span>
              </div>

              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
                <span className="text-2xl">₹</span>
                <span className="text-lg font-semibold">{formatBudget(trip.userSelection?.budget)}</span>
              </div>

              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
                <UserGroupIcon className="w-6 h-6 text-purple-200" />
                <span className="text-lg font-semibold">{trip.userSelection?.traveler}</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {/* Gallery button removed - would need real trip images */}

              <motion.button
                onClick={() => {
                  // Scroll to itinerary section
                  const itinerarySection = document.querySelector('[data-section="itinerary"]');
                  if (itinerarySection) {
                    itinerarySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    // Fallback: scroll to a reasonable position
                    window.scrollTo({ top: 800, behavior: 'smooth' });
                  }
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <GlobeAltIcon className="w-5 h-5" />
                <span>Explore Itinerary</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70"
        >
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-white/50 rounded-full mt-2"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showImageGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setShowImageGallery(false)}
          >
            <div className="relative max-w-4xl mx-auto p-4" onClick={(e) => e.stopPropagation()}>
              <motion.button
                onClick={() => setShowImageGallery(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.button>

              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={tripImages[selectedImage]}
                alt={`Trip image ${selectedImage + 1}`}
                className="w-full h-auto max-h-[80vh] object-cover rounded-2xl"
              />

              {/* Gallery Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-white/20 backdrop-blur-md rounded-full px-6 py-3">
                <button
                  onClick={() => setSelectedImage((prev) => (prev - 1 + tripImages.length) % tripImages.length)}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-all duration-300"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>

                <div className="flex space-x-2">
                  {tripImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === selectedImage ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setSelectedImage((prev) => (prev + 1) % tripImages.length)}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-all duration-300"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-all duration-300"
                >
                  {autoPlay ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Trip Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{trip.userSelection?.noOfDays}</h3>
                <p className="text-gray-600">Days of Adventure</p>
              </div>
            </div>
            <p className="text-gray-500">Perfect duration for exploring all the highlights</p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-3xl text-green-600 font-bold">₹</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{formatBudget(trip.userSelection?.budget)}</h3>
                <p className="text-gray-600">Total Budget</p>
              </div>
            </div>
            <p className="text-gray-500">Carefully planned to maximize your experience</p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <UserGroupIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{trip.userSelection?.traveler}</h3>
                <p className="text-gray-600">Travel Style</p>
              </div>
            </div>
            <p className="text-gray-500">Tailored experiences for your group</p>
          </div>
        </motion.div>

        {/* Hotels Section */}
        {trip.tripData?.hotelOptions && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full mb-6"
              >
                <BuildingOfficeIcon className="w-8 h-8" />
                <h2 className="text-3xl font-bold">Recommended Hotels</h2>
              </motion.div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Handpicked accommodations that perfectly match your style and budget
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trip.tripData.hotelOptions.map((hotel, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2"
                >
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500" />
                    {hotel.hotelImageUrl && (
                      <img
                        src={hotel.hotelImageUrl}
                        alt={hotel.hotelName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}

                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                      <div className="flex items-center space-x-1">
                        <StarSolidIcon className="w-5 h-5 text-yellow-500" />
                        <span className="font-bold text-gray-900">{hotel.rating || '4.5'}</span>
                      </div>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full shadow-lg">
                      <span className="font-bold">
                        {typeof hotel.price === 'object'
                          ? formatBudget(hotel.price)
                          : hotel.price || '₹2,500/night'}
                      </span>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {hotel.hotelName}
                    </h3>
                    <div className="flex items-center space-x-2 text-gray-600 mb-4">
                      <MapPinIcon className="w-5 h-5" />
                      <p className="text-sm">{hotel.hotelAddress}</p>
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {hotel.description || 'Experience luxury and comfort in this carefully selected accommodation.'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <StarSolidIcon
                              key={i}
                              className={`w-4 h-4 ${i < (hotel.rating || 4) ? 'text-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({hotel.reviews || '128'} reviews)</span>
                      </div>

                      {hotel.bookingUrl && (
                        <motion.a
                          href={hotel.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Book Now
                        </motion.a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Enhanced Itinerary Section */}
        {trip.tripData?.itinerary && (
          <motion.section
            data-section="itinerary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full mb-6"
              >
                <MapPinIcon className="w-8 h-8" />
                <h2 className="text-3xl font-bold">Daily Itinerary</h2>
              </motion.div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Your day-by-day adventure guide with carefully curated experiences
              </p>
            </div>

            {/* Day Navigation */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {trip.tripData.itinerary.map((day, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveDay(day.day)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeDay === day.day
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Day {day.day}
                </motion.button>
              ))}
            </div>

            {/* Active Day Content */}
            <AnimatePresence mode="wait">
              {trip.tripData.itinerary
                .filter(day => day.day === activeDay)
                .map((day, dayIndex) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 md:p-12"
                  >
                    <div className="text-center mb-12">
                      <div className="inline-flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                          {day.day}
                        </div>
                        <div className="text-left">
                          <h3 className="text-4xl font-bold text-gray-900">Day {day.day}</h3>
                          {day.theme && (
                            <p className="text-xl text-purple-600 font-medium">{day.theme}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Activities Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {(day.activities || day.plan || []).map((activity, activityIndex) => (
                        <motion.div
                          key={activityIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: activityIndex * 0.1 }}
                          className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
                        >
                          {/* Time Badge */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                              <ClockIcon className="w-4 h-4" />
                              <span>{activity.time || '10:00'}</span>
                            </div>
                            {activity.rating && (
                              <div className="flex items-center space-x-1 bg-yellow-100 px-3 py-1 rounded-full">
                                <StarSolidIcon className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-semibold text-yellow-700">{activity.rating}</span>
                              </div>
                            )}
                          </div>

                          <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                            {activity.name || activity.placeName || 'Activity'}
                          </h4>

                          <p className="text-gray-600 mb-4 leading-relaxed">
                            {activity.description || activity.placeDetails || 'Enjoy this amazing experience'}
                          </p>

                          {/* Activity Image */}
                          {(activity.imageUrl || activity.placeImageUrl) && (
                            <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                              <img
                                src={activity.imageUrl || activity.placeImageUrl}
                                alt={activity.name || activity.placeName}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                          )}

                          {/* Additional Info */}
                          <div className="space-y-3">
                            {(activity.cost?.amount || activity.ticketPricing) && (
                              <div className="flex items-center justify-between bg-green-50 px-4 py-2 rounded-lg">
                                <span className="text-sm font-medium text-green-700">Cost</span>
                                <span className="font-bold text-green-600">
                                  {activity.cost?.amount ? `$${activity.cost.amount}` : activity.ticketPricing}
                                </span>
                              </div>
                            )}

                            {(activity.duration || activity.travelTime) && (
                              <div className="flex items-center space-x-2 text-gray-600">
                                <ClockIcon className="w-4 h-4" />
                                <span className="text-sm">Duration: {activity.duration || activity.travelTime}</span>
                              </div>
                            )}

                            {activity.category && (
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  activity.category === 'culture' ? 'bg-purple-100 text-purple-700' :
                                  activity.category === 'food' ? 'bg-orange-100 text-orange-700' :
                                  activity.category === 'nature' ? 'bg-green-100 text-green-700' :
                                  activity.category === 'adventure' ? 'bg-red-100 text-red-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {activity.category}
                                </span>
                              </div>
                            )}

                            {activity.tips && (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-700">
                                  <span className="font-semibold">💡 Tip:</span> {activity.tips}
                                </p>
                              </div>
                            )}

                            <motion.button
                              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                const coords = activity.geoCoordinates || activity.location;
                                const activityName = activity.name || activity.placeName || activity.place || 'Activity';

                                // Get destination from multiple possible sources
                                const destination = trip?.tripData?.tripSummary?.destination ||
                                                  trip?.tripData?.destination?.name ||
                                                  trip?.destination?.name ||
                                                  trip?.userSelection?.location?.label ||
                                                  '';

                                console.log('🗺️ Opening map for:', { activityName, destination, coords });

                                // Prioritize place name search over coordinates for better user experience
                                if (activityName && destination) {
                                  // Search by name and destination (most accurate)
                                  const searchQuery = `${activityName} ${destination}`;
                                  window.open(`https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`, '_blank');
                                } else if (activityName) {
                                  // Search by activity name only
                                  window.open(`https://www.google.com/maps/search/${encodeURIComponent(activityName)}`, '_blank');
                                } else if (coords && coords.lat && coords.lng) {
                                  // Use coordinates as fallback only
                                  window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, '_blank');
                                } else if (destination) {
                                  // Fallback to destination search
                                  window.open(`https://www.google.com/maps/search/${encodeURIComponent(destination)}`, '_blank');
                                } else {
                                  // Last resort - generic search
                                  window.open(`https://www.google.com/maps/search/tourist+attractions`, '_blank');
                                }
                              }}
                            >
                              🗺️ View on Map
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Meals Section */}
                    {day.meals && (
                      <div className="mt-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8">
                        <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                          <span className="text-3xl mr-3">🍽️</span>
                          Recommended Meals
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {Object.entries(day.meals).map(([mealType, meal]) => (
                            <div key={mealType} className="bg-white rounded-xl p-6 shadow-lg">
                              <h5 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                                {mealType}
                              </h5>
                              <p className="text-gray-700 font-medium mb-2">{meal.name}</p>
                              {meal.description && (
                                <p className="text-gray-600 text-sm mb-3">{meal.description}</p>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">{meal.cuisine} cuisine</span>
                                <span className="font-bold text-green-600">${meal.cost}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Transportation & Budget Info */}
                    {(day.transportation || day.estimatedCost) && (
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {day.transportation && (
                          <div className="bg-blue-50 rounded-xl p-6">
                            <h5 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                              <span className="text-2xl mr-2">🚗</span>
                              Transportation
                            </h5>
                            <p className="text-blue-800 font-medium mb-2">{day.transportation.method}</p>
                            <p className="text-blue-700 text-sm mb-2">Cost: ${day.transportation.cost}</p>
                            {day.transportation.tips && (
                              <p className="text-blue-600 text-sm">💡 {day.transportation.tips}</p>
                            )}
                          </div>
                        )}

                        {day.estimatedCost && (
                          <div className="bg-green-50 rounded-xl p-6">
                            <h5 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                              <span className="text-2xl mr-2">💰</span>
                              Daily Budget
                            </h5>
                            <p className="text-2xl font-bold text-green-700">${day.estimatedCost}</p>
                            <p className="text-green-600 text-sm">Estimated cost per person</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
            </AnimatePresence>

            {/* Accommodation Section */}
            {trip.tripData.accommodation && trip.tripData.accommodation.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-16"
              >
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 md:p-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                    <span className="text-4xl mr-4">🏨</span>
                    Recommended Accommodation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {trip.tripData.accommodation.map((hotel, index) => (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-bold text-gray-900">{hotel.name}</h4>
                          <div className="flex items-center space-x-1">
                            {[...Array(Math.floor(hotel.rating || 4))].map((_, i) => (
                              <StarSolidIcon key={i} className="w-4 h-4 text-yellow-500" />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">{hotel.rating || 4.0}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium capitalize">{hotel.type}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-medium">{hotel.location}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Price Range:</span>
                            <span className="font-bold text-green-600">{hotel.priceRange}</span>
                          </div>
                          {hotel.amenities && (
                            <div className="mt-4">
                              <p className="text-gray-600 text-sm mb-2">Amenities:</p>
                              <div className="flex flex-wrap gap-2">
                                {hotel.amenities.map((amenity, i) => (
                                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {hotel.bookingTips && (
                            <div className="mt-4 bg-yellow-50 p-3 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <span className="font-semibold">💡 Tip:</span> {hotel.bookingTips}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Practical Information Section */}
            {trip.tripData.practicalInfo && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-16"
              >
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 md:p-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                    <span className="text-4xl mr-4">📋</span>
                    Practical Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Cultural Tips */}
                    {trip.tripData.practicalInfo.culturalTips && (
                      <div className="bg-purple-50 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                          <span className="text-2xl mr-2">🎭</span>
                          Cultural Tips
                        </h4>
                        <ul className="space-y-2">
                          {trip.tripData.practicalInfo.culturalTips.map((tip, index) => (
                            <li key={index} className="text-purple-800 text-sm flex items-start">
                              <span className="text-purple-500 mr-2">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Packing List */}
                    {trip.tripData.practicalInfo.packingList && (
                      <div className="bg-green-50 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                          <span className="text-2xl mr-2">🎒</span>
                          Packing List
                        </h4>
                        <ul className="space-y-2">
                          {trip.tripData.practicalInfo.packingList.map((item, index) => (
                            <li key={index} className="text-green-800 text-sm flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Budget Breakdown */}
                    {trip.tripData.practicalInfo.budgetBreakdown && (
                      <div className="bg-blue-50 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                          <span className="text-2xl mr-2">💰</span>
                          Budget Breakdown
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(trip.tripData.practicalInfo.budgetBreakdown).map(([category, amount]) => (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-blue-800 text-sm capitalize">{category}:</span>
                              <span className="font-bold text-blue-700">${amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            )}
          </motion.section>
        )}
      </div>
    </div>
  );
}

export default ViewTripEnhanced;
