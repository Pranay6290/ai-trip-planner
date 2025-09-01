import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModernItinerary from '../components/modern/ModernItinerary';
import { 
  ClockIcon, 
  MapPinIcon, 
  CurrencyRupeeIcon,
  StarIcon,
  PhotoIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarDaysIcon,
  UsersIcon,
  HeartIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const NextLevelItineraryDisplayModern = ({ tripData }) => {
  const [activeDay, setActiveDay] = useState(1);

  if (!tripData || !tripData.dailyItinerary) {
    return (
      <div className="min-h-screen bg-animated-gradient flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center glass-card p-12 rounded-3xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-white mb-4">Loading Your Trip...</h2>
          <p className="text-white/80 text-lg">Preparing your amazing itinerary</p>
        </motion.div>
      </div>
    );
  }

  // Use the modern itinerary component
  return <ModernItinerary tripData={tripData} />;
};

export default NextLevelItineraryDisplayModern;
