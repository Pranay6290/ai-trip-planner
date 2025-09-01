import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  GlobeAltIcon,
  ClockIcon,
  HeartIcon,
  StarIcon,
  CameraIcon,
  CalendarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const ProfileStats = ({ stats, userTrips = [] }) => {
  // Calculate stats from user trips
  const calculateStats = () => {
    const tripStats = {
      totalTrips: userTrips.length,
      totalDays: userTrips.reduce((sum, trip) => sum + (trip.duration || 0), 0),
      countriesVisited: new Set(userTrips.map(trip => trip.destination?.name?.split(',')[1]?.trim()).filter(Boolean)).size,
      citiesVisited: new Set(userTrips.map(trip => trip.destination?.name?.split(',')[0]?.trim()).filter(Boolean)).size,
      totalBudget: userTrips.reduce((sum, trip) => sum + (trip.budget?.max || 0), 0),
      favoriteDestination: getMostVisitedDestination(),
      averageRating: getAverageRating(),
      upcomingTrips: userTrips.filter(trip => new Date(trip.createdAt) > new Date()).length
    };

    return { ...stats, ...tripStats };
  };

  const getMostVisitedDestination = () => {
    const destinations = userTrips.map(trip => trip.destination?.name).filter(Boolean);
    const frequency = {};
    destinations.forEach(dest => {
      frequency[dest] = (frequency[dest] || 0) + 1;
    });
    
    return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b, '') || 'Not available';
  };

  const getAverageRating = () => {
    const ratings = userTrips.map(trip => trip.rating).filter(Boolean);
    return ratings.length > 0 ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : 'N/A';
  };

  const currentStats = calculateStats();

  const statCards = [
    {
      icon: MapPinIcon,
      label: 'Total Trips',
      value: currentStats.totalTrips,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50'
    },
    {
      icon: GlobeAltIcon,
      label: 'Countries Visited',
      value: currentStats.countriesVisited,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50'
    },
    {
      icon: ClockIcon,
      label: 'Total Days',
      value: currentStats.totalDays,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      icon: StarIcon,
      label: 'Average Rating',
      value: currentStats.averageRating,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50'
    },
    {
      icon: HeartIcon,
      label: 'Cities Explored',
      value: currentStats.citiesVisited,
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-50 to-pink-50'
    },
    {
      icon: TrophyIcon,
      label: 'Upcoming Trips',
      value: currentStats.upcomingTrips,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'from-indigo-50 to-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gradient-to-br ${stat.bgColor} p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="text-right"
            >
              <div className="text-3xl font-bold text-gray-800">
                {stat.value}
              </div>
            </motion.div>
          </div>
          <div className="text-sm font-medium text-gray-600">
            {stat.label}
          </div>
        </motion.div>
      ))}

      {/* Favorite Destination Card */}
      {currentStats.favoriteDestination && currentStats.favoriteDestination !== 'Not available' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 shadow-lg"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Favorite Destination</h3>
              <p className="text-amber-700 font-semibold">{currentStats.favoriteDestination}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Your most visited destination based on your trip history
          </div>
        </motion.div>
      )}

      {/* Travel Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200 shadow-lg"
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
            <TrophyIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Travel Achievements</h3>
            <p className="text-indigo-700">Your travel milestones</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Achievement Badges */}
          {currentStats.totalTrips >= 5 && (
            <div className="flex items-center space-x-3 bg-white/50 p-3 rounded-xl">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">🌟</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Explorer</div>
                <div className="text-xs text-gray-600">5+ trips completed</div>
              </div>
            </div>
          )}
          
          {currentStats.countriesVisited >= 3 && (
            <div className="flex items-center space-x-3 bg-white/50 p-3 rounded-xl">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">🌍</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Globetrotter</div>
                <div className="text-xs text-gray-600">3+ countries visited</div>
              </div>
            </div>
          )}
          
          {currentStats.totalDays >= 30 && (
            <div className="flex items-center space-x-3 bg-white/50 p-3 rounded-xl">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">⏰</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Time Traveler</div>
                <div className="text-xs text-gray-600">30+ days traveled</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileStats;
