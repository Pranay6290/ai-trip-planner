import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon, 
  MapPinIcon, 
  CurrencyRupeeIcon,
  StarIcon,
  PhotoIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const EnhancedItineraryDisplay = ({ itinerary, budgetBreakdown, travelTips, localExperiences }) => {
  const [activeDay, setActiveDay] = useState(1);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const TimeBlock = ({ timeBlock, title, activities, restaurant }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 mb-6"
    >
      <div className="flex items-center mb-4">
        <ClockIcon className="w-6 h-6 text-blue-600 mr-3" />
        <div>
          <h4 className="text-lg font-bold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{timeBlock}</p>
        </div>
      </div>

      {/* Restaurant Section */}
      {restaurant && (
        <div className="bg-orange-50 rounded-xl p-4 mb-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-bold text-orange-900">{restaurant.name}</h5>
            <span className="text-sm font-medium text-orange-700">{restaurant.averageCost}</span>
          </div>
          <p className="text-sm text-orange-800 mb-2">{restaurant.cuisine}</p>
          {restaurant.mustTry && (
            <p className="text-sm text-orange-700">
              <span className="font-medium">Must Try:</span> {restaurant.mustTry}
            </p>
          )}
          <div className="flex items-center mt-2">
            <MapPinIcon className="w-4 h-4 text-orange-600 mr-1" />
            <span className="text-xs text-orange-600">{restaurant.location}</span>
          </div>
        </div>
      )}

      {/* Activities */}
      {activities && activities.map((activity, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-3 border border-blue-200"
        >
          <div className="flex justify-between items-start mb-2">
            <h5 className="font-bold text-blue-900">{activity.placeName}</h5>
            <div className="text-right">
              {activity.rating && (
                <div className="flex items-center text-yellow-600 mb-1">
                  <StarIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">{activity.rating}</span>
                </div>
              )}
              <span className="text-sm font-medium text-blue-700">{activity.ticketPricing}</span>
            </div>
          </div>
          
          <p className="text-sm text-blue-800 mb-3">{activity.placeDetails}</p>
          
          <div className="flex flex-wrap gap-4 text-xs text-blue-600">
            {activity.duration && (
              <span className="flex items-center">
                <ClockIcon className="w-3 h-3 mr-1" />
                {activity.duration}
              </span>
            )}
            {activity.bestTime && (
              <span className="flex items-center">
                <PhotoIcon className="w-3 h-3 mr-1" />
                {activity.bestTime}
              </span>
            )}
            {activity.timeToTravel && (
              <span className="flex items-center">
                <MapPinIcon className="w-3 h-3 mr-1" />
                {activity.timeToTravel}
              </span>
            )}
          </div>
          
          {activity.insiderTip && (
            <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <InformationCircleIcon className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                <p className="text-xs text-yellow-800">
                  <span className="font-medium">Insider Tip:</span> {activity.insiderTip}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Day Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {itinerary?.map((day) => (
          <motion.button
            key={day.day}
            onClick={() => setActiveDay(day.day)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              activeDay === day.day
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 hover:bg-white border border-gray-200'
            }`}
          >
            Day {day.day}
            {day.theme && (
              <div className="text-xs opacity-80 mt-1">{day.theme}</div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Active Day Content */}
      <AnimatePresence mode="wait">
        {itinerary
          ?.filter(day => day.day === activeDay)
          .map((day) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-3xl p-8 shadow-xl border border-white/30"
            >
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Day {day.day}</h2>
                {day.theme && (
                  <p className="text-xl text-gray-600">{day.theme}</p>
                )}
              </div>

              {/* Time Blocks */}
              {day.morning && (
                <TimeBlock
                  timeBlock={day.morning.time}
                  title="Morning"
                  activities={day.morning.activities}
                />
              )}

              {day.lunch && (
                <TimeBlock
                  timeBlock={day.lunch.time}
                  title="Lunch"
                  restaurant={day.lunch.restaurant}
                />
              )}

              {day.afternoon && (
                <TimeBlock
                  timeBlock={day.afternoon.time}
                  title="Afternoon"
                  activities={day.afternoon.activities}
                />
              )}

              {day.evening && (
                <TimeBlock
                  timeBlock={day.evening.time}
                  title="Evening"
                  activities={day.evening.activities}
                />
              )}

              {/* Legacy format support */}
              {day.activities && !day.morning && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {day.activities.map((activity, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -5 }}
                      className="bg-white/80 rounded-xl p-6 shadow-lg border border-white/30"
                    >
                      <h4 className="font-bold text-lg text-gray-900 mb-2">{activity.placeName}</h4>
                      <p className="text-gray-600 mb-3">{activity.placeDetails}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-600 font-medium">{activity.ticketPricing}</span>
                        {activity.rating && (
                          <div className="flex items-center text-yellow-600">
                            <StarIcon className="w-4 h-4 mr-1" />
                            <span>{activity.rating}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Budget Breakdown */}
      {budgetBreakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <CurrencyRupeeIcon className="w-8 h-8 mr-3" />
            Budget Breakdown
          </h3>
          
          {budgetBreakdown.dailyBreakdown && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {Object.entries(budgetBreakdown.dailyBreakdown).map(([key, value]) => (
                <div key={key} className="bg-white/20 rounded-xl p-4">
                  <div className="text-sm opacity-80 capitalize">{key}</div>
                  <div className="text-lg font-bold">{value}</div>
                </div>
              ))}
            </div>
          )}
          
          {budgetBreakdown.totalEstimated && (
            <div className="text-center">
              <div className="text-lg opacity-80">Total Estimated Cost</div>
              <div className="text-3xl font-bold">{budgetBreakdown.totalEstimated}</div>
            </div>
          )}
        </motion.div>
      )}

      {/* Travel Tips */}
      {travelTips && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Travel Tips & Local Insights</h3>
          
          {Object.entries(travelTips).map(([category, tips]) => (
            <div key={category} className="mb-6">
              <button
                onClick={() => toggleSection(category)}
                className="flex items-center justify-between w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <h4 className="font-semibold text-gray-900 capitalize">{category}</h4>
                {expandedSections[category] ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections[category] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pl-4"
                  >
                    <ul className="space-y-2">
                      {tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedItineraryDisplay;
