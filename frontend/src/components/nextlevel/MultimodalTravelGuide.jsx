import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapIcon, 
  TruckIcon,
  TrainIcon,
  CarIcon,
  WalkIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MultimodalTravelGuide = ({ fromLocation, toLocation, onRouteSelected }) => {
  const [travelOptions, setTravelOptions] = useState([]);
  const [selectedMode, setSelectedMode] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helper functions for dynamic classes
  const getOptionClasses = (option, isSelected) => {
    const colorMap = {
      blue: isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300',
      green: isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300',
      purple: isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300',
      orange: isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
    };
    return colorMap[option.color] || 'border-gray-200 hover:border-gray-300';
  };

  const getOptionIconClasses = (color) => {
    const colorMap = {
      blue: 'p-2 bg-blue-100 rounded-lg text-blue-600',
      green: 'p-2 bg-green-100 rounded-lg text-green-600',
      purple: 'p-2 bg-purple-100 rounded-lg text-purple-600',
      orange: 'p-2 bg-orange-100 rounded-lg text-orange-600'
    };
    return colorMap[color] || 'p-2 bg-gray-100 rounded-lg text-gray-600';
  };

  // Fetch travel options
  useEffect(() => {
    if (fromLocation && toLocation) {
      fetchTravelOptions();
    }
  }, [fromLocation, toLocation]);

  const fetchTravelOptions = async () => {
    setLoading(true);
    try {
      // Simulate API call for travel options
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const options = generateTravelOptions(fromLocation, toLocation);
      setTravelOptions(options);
      
      // Fetch real-time data
      const realTime = await fetchRealTimeData();
      setRealTimeData(realTime);
      
    } catch (error) {
      console.error('Failed to fetch travel options:', error);
      toast.error('Failed to load travel options');
    } finally {
      setLoading(false);
    }
  };

  // Generate realistic travel options
  const generateTravelOptions = (from, to) => {
    const distance = calculateDistance(from, to);
    
    const options = [
      {
        id: 'car',
        mode: 'Car/Taxi',
        icon: <CarIcon className="w-6 h-6" />,
        duration: Math.max(30, Math.floor(distance * 2)), // 2 min per km
        cost: Math.floor(distance * 12), // ₹12 per km
        comfort: 5,
        convenience: 5,
        description: 'Door-to-door convenience',
        pros: ['Most convenient', 'Flexible timing', 'Private'],
        cons: ['Most expensive', 'Traffic dependent'],
        realTimeStatus: 'Available',
        color: 'blue'
      },
      {
        id: 'bus',
        mode: 'Bus',
        icon: <TruckIcon className="w-6 h-6" />,
        duration: Math.max(45, Math.floor(distance * 3)), // 3 min per km
        cost: Math.floor(distance * 2), // ₹2 per km
        comfort: 3,
        convenience: 3,
        description: 'Budget-friendly public transport',
        pros: ['Very affordable', 'Eco-friendly', 'Frequent service'],
        cons: ['Less comfortable', 'Fixed schedule'],
        realTimeStatus: 'Next bus in 15 min',
        color: 'green'
      },
      {
        id: 'train',
        mode: 'Train',
        icon: <TrainIcon className="w-6 h-6" />,
        duration: Math.max(60, Math.floor(distance * 2.5)), // 2.5 min per km
        cost: Math.floor(distance * 1.5), // ₹1.5 per km
        comfort: 4,
        convenience: 3,
        description: 'Comfortable and reliable',
        pros: ['Comfortable', 'Reliable timing', 'Scenic route'],
        cons: ['Limited routes', 'Station access needed'],
        realTimeStatus: 'On time',
        color: 'purple'
      },
      {
        id: 'walk',
        mode: 'Walking',
        icon: <WalkIcon className="w-6 h-6" />,
        duration: Math.max(10, Math.floor(distance * 12)), // 12 min per km
        cost: 0,
        comfort: 2,
        convenience: 4,
        description: 'Healthy and free',
        pros: ['Free', 'Healthy', 'Explore surroundings'],
        cons: ['Time consuming', 'Weather dependent'],
        realTimeStatus: distance < 2 ? 'Recommended' : 'Too far',
        color: 'orange',
        available: distance < 3 // Only show for short distances
      }
    ];

    return options.filter(option => option.available !== false);
  };

  // Calculate distance between two points (simplified)
  const calculateDistance = (from, to) => {
    // Simplified distance calculation
    return Math.floor(Math.random() * 20) + 5; // 5-25 km
  };

  // Fetch real-time data
  const fetchRealTimeData = async () => {
    // Simulate real-time traffic and transit data
    return {
      traffic: {
        level: Math.random() > 0.5 ? 'moderate' : 'light',
        delay: Math.floor(Math.random() * 20), // 0-20 min delay
      },
      weather: {
        condition: 'clear',
        temperature: 28,
        precipitation: 10
      },
      lastUpdated: new Date()
    };
  };

  // Handle route selection
  const selectRoute = (option) => {
    setSelectedMode(option);
    if (onRouteSelected) {
      onRouteSelected(option);
    }
    toast.success(`${option.mode} route selected!`);
  };

  // Get comfort/convenience stars
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  // Get status color
  const getStatusColor = (status) => {
    if (status.includes('Available') || status.includes('On time') || status.includes('Recommended')) {
      return 'text-green-600 bg-green-50';
    }
    if (status.includes('delay') || status.includes('15 min')) {
      return 'text-yellow-600 bg-yellow-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <MapIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Smart Travel Routes</h3>
            <p className="text-sm text-gray-600">Real-time multimodal travel guidance</p>
          </div>
        </div>
        
        {realTimeData && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <SignalIcon className="w-4 h-4" />
            <span>Live data</span>
          </div>
        )}
      </div>

      {/* Real-time Conditions */}
      {realTimeData && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Current Conditions</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Traffic:</span>
              <span className={`ml-2 capitalize ${
                realTimeData.traffic.level === 'light' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {realTimeData.traffic.level}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Weather:</span>
              <span className="ml-2 text-green-600">{realTimeData.weather.temperature}°C</span>
            </div>
            <div>
              <span className="text-blue-700">Updated:</span>
              <span className="ml-2 text-gray-600">
                {realTimeData.lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Travel Options */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Travel Options</h4>
        {travelOptions.map((option) => (
          <motion.div
            key={option.id}
            whileHover={{ scale: 1.02 }}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              getOptionClasses(option, selectedMode?.id === option.id)
            }`}
            onClick={() => selectRoute(option)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={getOptionIconClasses(option.color)}>
                  {option.icon}
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">{option.mode}</h5>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(option.realTimeStatus)}`}>
                {option.realTimeStatus}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                  <ClockIcon className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium">{option.duration} min</p>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                  <CurrencyRupeeIcon className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium">₹{option.cost}</p>
                <p className="text-xs text-gray-500">Cost</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {renderStars(option.comfort)}
                </div>
                <p className="text-xs text-gray-500">Comfort</p>
              </div>
            </div>
            
            <div className="flex justify-between text-xs">
              <div>
                <span className="text-green-600">Pros: </span>
                <span className="text-gray-600">{option.pros.join(', ')}</span>
              </div>
            </div>
            <div className="mt-1">
              <span className="text-red-600 text-xs">Cons: </span>
              <span className="text-gray-600 text-xs">{option.cons.join(', ')}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Route Summary */}
      {selectedMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200"
        >
          <h4 className="font-medium text-green-900 mb-2">✅ Selected Route</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={getOptionIconClasses(selectedMode.color)}>
                {selectedMode.icon}
              </div>
              <div>
                <p className="font-medium">{selectedMode.mode}</p>
                <p className="text-sm text-gray-600">
                  {selectedMode.duration} min • ₹{selectedMode.cost}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                // Open in maps app
                const mapsUrl = `https://www.google.com/maps/dir/${fromLocation}/${toLocation}`;
                window.open(mapsUrl, '_blank');
                toast.success('Opening in Google Maps...');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Open in Maps
            </button>
          </div>
        </motion.div>
      )}

      {/* Travel Tips */}
      <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
        <h4 className="font-medium text-indigo-900 mb-2">🚀 Smart Travel Tips</h4>
        <ul className="text-sm text-indigo-800 space-y-1">
          <li>• Book train tickets in advance for better prices</li>
          <li>• Use ride-sharing apps during peak hours</li>
          <li>• Walking is great for distances under 2km</li>
          <li>• Check real-time traffic before leaving</li>
        </ul>
      </div>
    </div>
  );
};

export default MultimodalTravelGuide;
