import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  RocketLaunchIcon,
  ChartBarIcon,
  UserGroupIcon,
  MapIcon,
  CloudIcon,
  CurrencyRupeeIcon,
  ShareIcon,
  DownloadIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Import next-level components
import AITravelChatbot from './AITravelChatbot';
import SmartRouteOptimizer from './SmartRouteOptimizer';
import WeatherAwarePlanner from './WeatherAwarePlanner';
import ExpenseEstimator from './ExpenseEstimator';
import CollaborativePlanner from './CollaborativePlanner';
import MultimodalTravelGuide from './MultimodalTravelGuide';

const NextLevelTripPlanner = ({ initialTripPlan, onTripUpdate }) => {
  const [tripPlan, setTripPlan] = useState(initialTripPlan);
  const [activeFeatures, setActiveFeatures] = useState({
    aiChat: false,
    routeOptimization: false,
    weatherPlanning: false,
    expenseTracking: false,
    collaboration: false,
    travelGuide: false
  });
  const [enhancements, setEnhancements] = useState({
    optimized: false,
    weatherAdjusted: false,
    budgetOptimized: false,
    collaborative: false
  });

  // Helper function for feature colors
  const getFeatureActiveClasses = (color) => {
    const colorMap = {
      purple: 'border-purple-500 bg-purple-50',
      blue: 'border-blue-500 bg-blue-50',
      green: 'border-green-500 bg-green-50',
      yellow: 'border-yellow-500 bg-yellow-50',
      pink: 'border-pink-500 bg-pink-50',
      indigo: 'border-indigo-500 bg-indigo-50'
    };
    return colorMap[color] || 'border-gray-500 bg-gray-50';
  };

  const getFeatureIconClasses = (color) => {
    const colorMap = {
      purple: 'p-3 bg-purple-100 rounded-xl w-fit mb-4',
      blue: 'p-3 bg-blue-100 rounded-xl w-fit mb-4',
      green: 'p-3 bg-green-100 rounded-xl w-fit mb-4',
      yellow: 'p-3 bg-yellow-100 rounded-xl w-fit mb-4',
      pink: 'p-3 bg-pink-100 rounded-xl w-fit mb-4',
      indigo: 'p-3 bg-indigo-100 rounded-xl w-fit mb-4'
    };
    return colorMap[color] || 'p-3 bg-gray-100 rounded-xl w-fit mb-4';
  };

  const getFeatureTextClasses = (color) => {
    const colorMap = {
      purple: 'text-purple-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      pink: 'text-pink-600',
      indigo: 'text-indigo-600'
    };
    return colorMap[color] || 'text-gray-600';
  };

  // Feature toggle handler
  const toggleFeature = (featureName) => {
    setActiveFeatures(prev => ({
      ...prev,
      [featureName]: !prev[featureName]
    }));
  };

  // Handle trip updates from various components
  const handleTripUpdate = (updatedTrip, enhancement) => {
    setTripPlan(updatedTrip);
    
    if (enhancement) {
      setEnhancements(prev => ({
        ...prev,
        [enhancement]: true
      }));
    }
    
    if (onTripUpdate) {
      onTripUpdate(updatedTrip);
    }
  };

  // Export trip plan
  const exportTripPlan = (format) => {
    try {
      if (format === 'pdf') {
        // Generate PDF (would use jsPDF in real implementation)
        toast.success('PDF export feature coming soon!');
      } else if (format === 'calendar') {
        // Export to Google Calendar
        generateCalendarEvents();
      } else if (format === 'json') {
        // Download as JSON
        downloadJSON();
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    }
  };

  // Generate calendar events
  const generateCalendarEvents = () => {
    if (!tripPlan?.itinerary) return;
    
    const events = tripPlan.itinerary.map(day => {
      const date = new Date();
      date.setDate(date.getDate() + day.day - 1);
      
      return {
        title: `${tripPlan.tripSummary?.destination} - Day ${day.day}`,
        start: date.toISOString().split('T')[0],
        description: day.activities?.map(a => a.placeName).join(', ') || 'Trip activities'
      };
    });
    
    // Create calendar URL
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(events[0].title)}&dates=${events[0].start}/${events[0].start}&details=${encodeURIComponent(events[0].description)}`;
    window.open(calendarUrl, '_blank');
    toast.success('Opening Google Calendar...');
  };

  // Download as JSON
  const downloadJSON = () => {
    const dataStr = JSON.stringify(tripPlan, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tripplan_${tripPlan.tripSummary?.destination?.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Trip plan downloaded!');
  };

  const features = [
    {
      id: 'aiChat',
      name: 'AI Travel Assistant',
      description: 'Chat with AI for instant trip modifications',
      icon: <SparklesIcon className="w-6 h-6" />,
      color: 'purple',
      component: AITravelChatbot
    },
    {
      id: 'routeOptimization',
      name: 'Smart Route Optimizer',
      description: 'Minimize travel time with AI clustering',
      icon: <MapIcon className="w-6 h-6" />,
      color: 'blue',
      component: SmartRouteOptimizer
    },
    {
      id: 'weatherPlanning',
      name: 'Weather-Aware Planning',
      description: 'Adjust itinerary based on weather forecasts',
      icon: <CloudIcon className="w-6 h-6" />,
      color: 'green',
      component: WeatherAwarePlanner
    },
    {
      id: 'expenseTracking',
      name: 'Smart Expense Estimator',
      description: 'Real-time budget tracking and optimization',
      icon: <CurrencyRupeeIcon className="w-6 h-6" />,
      color: 'yellow',
      component: ExpenseEstimator
    },
    {
      id: 'collaboration',
      name: 'Collaborative Planning',
      description: 'Plan together with friends and family',
      icon: <UserGroupIcon className="w-6 h-6" />,
      color: 'pink',
      component: CollaborativePlanner
    },
    {
      id: 'travelGuide',
      name: 'Multimodal Travel Guide',
      description: 'Real-time transport options and routing',
      icon: <RocketLaunchIcon className="w-6 h-6" />,
      color: 'indigo',
      component: MultimodalTravelGuide
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          🚀 Next-Level Trip Planning
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          AI-powered features to create the perfect travel experience
        </p>
        
        {/* Enhancement Status */}
        <div className="flex justify-center space-x-4 mb-8">
          {Object.entries(enhancements).map(([key, enabled]) => (
            <div key={key} className={`px-3 py-1 rounded-full text-sm font-medium ${
              enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {enabled ? '✅' : '⏳'} {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature) => (
          <motion.div
            key={feature.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
              activeFeatures[feature.id]
                ? getFeatureActiveClasses(feature.color)
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            onClick={() => toggleFeature(feature.id)}
          >
            <div className={getFeatureIconClasses(feature.color)}>
              <div className={getFeatureTextClasses(feature.color)}>
                {feature.icon}
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {feature.description}
            </p>
            
            <div className={`text-sm font-medium ${
              activeFeatures[feature.id] ? getFeatureTextClasses(feature.color) : 'text-gray-500'
            }`}>
              {activeFeatures[feature.id] ? 'Active' : 'Click to activate'}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Features */}
      <AnimatePresence>
        {Object.entries(activeFeatures).map(([featureId, isActive]) => {
          if (!isActive) return null;
          
          const feature = features.find(f => f.id === featureId);
          const Component = feature.component;
          
          return (
            <motion.div
              key={featureId}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="mb-8"
            >
              <Component
                tripPlan={tripPlan}
                destination={tripPlan?.tripSummary ? 
                  { name: tripPlan.tripSummary.destination } : 
                  null
                }
                itinerary={tripPlan?.itinerary}
                travelers={tripPlan?.tripSummary?.travelers || 2}
                onTripGenerated={(plan) => handleTripUpdate(plan, 'aiGenerated')}
                onOptimizedRoute={(route) => handleTripUpdate({ ...tripPlan, ...route }, 'optimized')}
                onWeatherAdjustment={(itinerary) => handleTripUpdate({ ...tripPlan, itinerary }, 'weatherAdjusted')}
                onBudgetUpdate={(budget) => handleTripUpdate({ ...tripPlan, budget }, 'budgetOptimized')}
                onTripUpdate={(trip) => handleTripUpdate(trip, 'collaborative')}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          📤 Export Your Perfect Trip Plan
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => exportTripPlan('pdf')}
            className="flex items-center justify-center space-x-3 p-4 bg-red-100 hover:bg-red-200 rounded-xl transition-colors"
          >
            <DownloadIcon className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">Download PDF</span>
          </button>
          
          <button
            onClick={() => exportTripPlan('calendar')}
            className="flex items-center justify-center space-x-3 p-4 bg-green-100 hover:bg-green-200 rounded-xl transition-colors"
          >
            <CalendarIcon className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Add to Calendar</span>
          </button>
          
          <button
            onClick={() => exportTripPlan('json')}
            className="flex items-center justify-center space-x-3 p-4 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
          >
            <ShareIcon className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">Export Data</span>
          </button>
        </div>
      </motion.div>

      {/* AI Chat (Always Available) */}
      <AITravelChatbot
        onTripGenerated={(plan) => handleTripUpdate(plan, 'aiGenerated')}
        className="z-50"
      />
    </div>
  );
};

export default NextLevelTripPlanner;
