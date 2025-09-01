import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScaleIcon,
  XMarkIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  StarIcon,
  CheckIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const TripComparison = ({ trips, isOpen, onClose, onSelectTrip }) => {
  const [selectedTrips, setSelectedTrips] = useState([]);

  const toggleTripSelection = (tripId) => {
    setSelectedTrips(prev => {
      if (prev.includes(tripId)) {
        return prev.filter(id => id !== tripId);
      } else if (prev.length < 3) {
        return [...prev, tripId];
      }
      return prev;
    });
  };

  const getComparisonData = () => {
    return selectedTrips.map(tripId => 
      trips.find(trip => trip.id === tripId)
    ).filter(Boolean);
  };

  const formatBudget = (budget) => {
    if (typeof budget === 'object' && budget !== null) {
      return `₹${budget.min?.toLocaleString()} - ₹${budget.max?.toLocaleString()}`;
    }
    return budget || 'Not specified';
  };

  const comparisonTrips = getComparisonData();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <ScaleIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Compare Trips</h3>
                <p className="text-sm text-gray-600">
                  Select up to 3 trips to compare ({selectedTrips.length}/3)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex h-full">
            {/* Trip Selection Sidebar */}
            <div className="w-80 border-r border-gray-200 p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <h4 className="font-semibold text-gray-900 mb-4">Select Trips</h4>
              <div className="space-y-3">
                {trips.map(trip => (
                  <motion.div
                    key={trip.id}
                    onClick={() => toggleTripSelection(trip.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedTrips.includes(trip.id)
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 truncate">
                        {trip.userSelection?.location?.label || trip.userSelection?.destination?.name}
                      </h5>
                      {selectedTrips.includes(trip.id) && (
                        <CheckIcon className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {trip.userSelection?.noOfDays} days • {trip.userSelection?.traveler}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {comparisonTrips.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <ScaleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Select trips to compare
                    </h4>
                    <p className="text-gray-600">
                      Choose up to 3 trips from the sidebar to see a detailed comparison
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Trip Headers */}
                  <div className="grid gap-6" style={{ gridTemplateColumns: `200px repeat(${comparisonTrips.length}, 1fr)` }}>
                    <div></div>
                    {comparisonTrips.map(trip => (
                      <div key={trip.id} className="text-center">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-xl mb-2">
                          <h4 className="font-bold text-lg">
                            {trip.userSelection?.location?.label || trip.userSelection?.destination?.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => onSelectTrip(trip.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Comparison Rows */}
                  <div className="space-y-4">
                    {/* Duration */}
                    <div className="grid gap-6 py-4 border-b border-gray-100" style={{ gridTemplateColumns: `200px repeat(${comparisonTrips.length}, 1fr)` }}>
                      <div className="flex items-center space-x-2 font-medium text-gray-900">
                        <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                        <span>Duration</span>
                      </div>
                      {comparisonTrips.map(trip => (
                        <div key={trip.id} className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {trip.userSelection?.noOfDays}
                          </div>
                          <div className="text-sm text-gray-600">days</div>
                        </div>
                      ))}
                    </div>

                    {/* Budget */}
                    <div className="grid gap-6 py-4 border-b border-gray-100" style={{ gridTemplateColumns: `200px repeat(${comparisonTrips.length}, 1fr)` }}>
                      <div className="flex items-center space-x-2 font-medium text-gray-900">
                        <span className="text-xl text-green-600 font-bold">₹</span>
                        <span>Budget</span>
                      </div>
                      {comparisonTrips.map(trip => (
                        <div key={trip.id} className="text-center">
                          <div className="text-lg font-bold text-gray-900">
                            {formatBudget(trip.userSelection?.budget)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Traveler Type */}
                    <div className="grid gap-6 py-4 border-b border-gray-100" style={{ gridTemplateColumns: `200px repeat(${comparisonTrips.length}, 1fr)` }}>
                      <div className="flex items-center space-x-2 font-medium text-gray-900">
                        <UserGroupIcon className="w-5 h-5 text-purple-600" />
                        <span>Traveler Type</span>
                      </div>
                      {comparisonTrips.map(trip => (
                        <div key={trip.id} className="text-center">
                          <div className="text-lg font-medium text-gray-900">
                            {trip.userSelection?.traveler}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Hotels */}
                    <div className="grid gap-6 py-4 border-b border-gray-100" style={{ gridTemplateColumns: `200px repeat(${comparisonTrips.length}, 1fr)` }}>
                      <div className="flex items-center space-x-2 font-medium text-gray-900">
                        <BuildingOfficeIcon className="w-5 h-5 text-indigo-600" />
                        <span>Hotels</span>
                      </div>
                      {comparisonTrips.map(trip => (
                        <div key={trip.id} className="text-center">
                          <div className="text-lg font-bold text-gray-900">
                            {trip.tripData?.hotelOptions?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">options</div>
                        </div>
                      ))}
                    </div>

                    {/* Activities */}
                    <div className="grid gap-6 py-4" style={{ gridTemplateColumns: `200px repeat(${comparisonTrips.length}, 1fr)` }}>
                      <div className="flex items-center space-x-2 font-medium text-gray-900">
                        <MapPinIcon className="w-5 h-5 text-red-600" />
                        <span>Activities</span>
                      </div>
                      {comparisonTrips.map(trip => (
                        <div key={trip.id} className="text-center">
                          <div className="text-lg font-bold text-gray-900">
                            {trip.tripData?.itinerary?.reduce((total, day) => total + (day.plan?.length || 0), 0) || 0}
                          </div>
                          <div className="text-sm text-gray-600">activities</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TripComparison;
