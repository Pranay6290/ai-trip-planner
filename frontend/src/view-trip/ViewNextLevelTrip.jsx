import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  ShareIcon,
  BookmarkIcon,
  PrinterIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import NextLevelItineraryDisplayModern from './NextLevelItineraryDisplayModern';

const ViewNextLevelTrip = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tripData, setTripData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Get trip data from navigation state or localStorage
    const trip = location.state?.trip || JSON.parse(localStorage.getItem('currentTrip') || 'null');
    
    if (trip) {
      setTripData(trip);
      // Save to localStorage for persistence
      localStorage.setItem('currentTrip', JSON.stringify(trip));
    } else {
      toast.error('No trip data found');
      navigate('/');
    }
    
    setIsLoading(false);
  }, [location.state, navigate]);

  const handleSaveTrip = async () => {
    if (!currentUser) {
      toast.error('Please sign in to save trips');
      return;
    }

    try {
      // Here you would typically save to your backend/database
      // For now, we'll save to localStorage
      const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
      const tripToSave = {
        ...tripData,
        id: Date.now(),
        userId: currentUser.uid,
        savedAt: new Date().toISOString()
      };
      
      savedTrips.push(tripToSave);
      localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
      
      setIsSaved(true);
      toast.success('Trip saved successfully!');
    } catch (error) {
      console.error('Error saving trip:', error);
      toast.error('Failed to save trip');
    }
  };

  const handleShareTrip = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `My ${tripData?.tripSummary?.destination} Trip`,
          text: `Check out my amazing ${tripData?.tripSummary?.duration}-day trip to ${tripData?.tripSummary?.destination}!`,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Trip link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing trip:', error);
      toast.error('Failed to share trip');
    }
  };

  const handlePrintTrip = () => {
    window.print();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your amazing trip...</p>
        </div>
      </div>
    );
  }

  if (!tripData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🧳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Trip Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the trip you're looking for.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            Plan a New Trip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Actions */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <motion.button
              onClick={handleGoBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back
            </motion.button>

            {/* Trip Title */}
            <div className="text-center flex-1 mx-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {tripData.tripSummary?.destination} Trip
              </h1>
              <p className="text-sm text-gray-600">
                {tripData.tripSummary?.duration} days • {tripData.tripSummary?.travelers} travelers
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={handleSaveTrip}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSaved}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isSaved 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isSaved ? 'Trip Saved' : 'Save Trip'}
              >
                {isSaved ? <HeartIcon className="w-5 h-5 fill-current" /> : <BookmarkIcon className="w-5 h-5" />}
              </motion.button>

              <motion.button
                onClick={handleShareTrip}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
                title="Share Trip"
              >
                <ShareIcon className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={handlePrintTrip}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
                title="Print Trip"
              >
                <PrinterIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <NextLevelItineraryDisplayModern tripData={tripData} />
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <motion.button
              onClick={() => navigate('/plan-next-level-trip')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Plan Another Trip
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/my-trips')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 transition-all duration-300"
            >
              View My Trips
            </motion.button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .sticky { position: static !important; }
          .shadow-sm { box-shadow: none !important; }
          .bg-gradient-to-br { background: white !important; }
          .bg-gradient-to-r { background: #3B82F6 !important; }
          .text-white { color: white !important; }
          button { display: none !important; }
          .border-t { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ViewNextLevelTrip;
