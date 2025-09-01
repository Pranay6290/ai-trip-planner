import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirestore } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  MapPinIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  ShareIcon,
  HeartIcon,
  ClockIcon,
  StarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  PhotoIcon,
  ArrowLeftIcon,
  EyeIcon,
  BookmarkIcon,
  GlobeAltIcon,
  SunIcon,
  MoonIcon,
  CloudIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

function ViewTripModern() {
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

  useEffect(() => {
    if (tripId) {
      GetTripData();
    }
  }, [tripId]);

  const GetTripData = async () => {
    setLoading(true);
    try {
      const tripData = await firestore.getTripById(tripId);
      setTrip(tripData);
    } catch (error) {
      console.error('Error fetching trip:', error);
      if (error.message.includes('not found')) {
        toast.error('Trip not found');
        navigate('/my-trips');
      } else {
        toast.error('Failed to load trip details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Trip to ${trip?.userSelection?.destination?.name || trip?.userSelection?.location?.label}`,
        text: `Check out my amazing trip plan to ${trip?.userSelection?.destination?.name || trip?.userSelection?.location?.label}!`,
        url: window.location.href
      });
    } catch (error) {
      // fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
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

  const getBudgetIcon = (budget) => {
    if (typeof budget === 'string') {
      switch (budget.toLowerCase()) {
        case 'budget': return '💵';
        case 'moderate': return '💰';
        case 'luxury': return '💎';
        default: return '💰';
      }
    }
    // Handle new object format
    if (typeof budget === 'object' && budget !== null && budget.max) {
      if (budget.max <= 1500) return '💵'; // Budget
      if (budget.max <= 4000) return '💰'; // Moderate
      return '💎'; // Luxury
    }
    return '💰'; // Default icon
  };

  const formatBudget = (budget) => {
    if (typeof budget === 'string') {
      return budget.charAt(0).toUpperCase() + budget.slice(1);
    }
    if (typeof budget === 'object' && budget !== null) {
      return `${budget.min} - ${budget.max}`;
    }
    return 'N/A';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {trip.userSelection?.location?.label || 'Your Trip'}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-lg">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="w-6 h-6" />
                <span>{trip.userSelection?.noOfDays} days</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getBudgetIcon(trip.userSelection?.budget)}</span>
                <span>{formatBudget(trip.userSelection?.budget)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getTravelerIcon(trip.userSelection?.traveler)}</span>
                <span>{trip.userSelection?.traveler}</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setLiked(!liked)}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-300"
          >
            {liked ? (
              <HeartSolidIcon className="w-6 h-6 text-red-500" />
            ) : (
              <HeartIcon className="w-6 h-6 text-white" />
            )}
          </button>
          <button
            onClick={handleShare}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-300"
          >
            <ShareIcon className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hotels Section */}
        {trip.tripData?.hotelOptions && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <div className="flex items-center mb-8">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Recommended Hotels</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trip.tripData.hotelOptions.map((hotel, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 relative">
                    {hotel.hotelImageUrl && (
                      <img
                        src={hotel.hotelImageUrl}
                        alt={hotel.hotelName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{hotel.rating || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.hotelName}</h3>
                    <p className="text-gray-600 mb-3">{hotel.hotelAddress}</p>
                    <p className="text-sm text-gray-500 mb-4">{hotel.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        {typeof hotel.price === 'object' 
                          ? formatBudget(hotel.price) 
                          : hotel.price || 'N/A'}
                      </span>
                      {hotel.bookingUrl && (
                        <a
                          href={hotel.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                        >
                          Book Now
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Itinerary Section */}
        {trip.tripData?.itinerary && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center mb-8">
              <MapPinIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Daily Itinerary</h2>
            </div>
            <div className="space-y-8">
              {trip.tripData.itinerary.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: dayIndex * 0.1 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {day.day}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Day {day.day}</h3>
                      {day.theme && <p className="text-gray-600">{day.theme}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {day.plan?.map((place, placeIndex) => (
                      <motion.div
                        key={placeIndex}
                        whileHover={{ y: -5 }}
                        className="bg-white/60 rounded-xl p-6 border border-white/40 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center mb-3">
                          <ClockIcon className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-gray-600">{place.time}</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{place.placeName}</h4>
                        <p className="text-gray-600 text-sm mb-3">{place.placeDetails}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-600 font-medium">
                            {typeof place.ticketPricing === 'object' 
                              ? formatBudget(place.ticketPricing) 
                              : place.ticketPricing || 'N/A'}
                          </span>
                          {place.rating && (
                            <div className="flex items-center space-x-1">
                              <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-gray-600">{place.rating}</span>
                            </div>
                          )}
                        </div>
                        {place.tips && (
                          <p className="text-xs text-blue-600 mt-2 italic">{place.tips}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg mb-4">
              Made with ❤️ by{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
                Pranay Gupta
              </span>
            </p>
            <p className="text-gray-400">
              © 2024 AI Trip Planner. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ViewTripModern;
