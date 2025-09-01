import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CloudIcon,
  SunIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import weatherService from '../../services/weatherService';
const WeatherAwarePlanner = ({ destination, itinerary, onWeatherAdjustment }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adjustedItinerary, setAdjustedItinerary] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [error, setError] = useState(null);

  // Fetch weather data using real weather service
  const fetchWeatherData = async () => {
    if (!destination?.location) {
      console.warn('⚠️ No destination location provided for weather data');
      return;
    }

    setLoading(true);
    try {
      console.log('🌤️ Fetching real weather data for:', destination.name);

      // Use real weather service with your API key
      const startDate = new Date().toISOString().split('T')[0]; // Today's date
      const duration = 7; // 7 days forecast

      const weatherForecast = await weatherService.getWeatherForecast(
        destination.location.lat,
        destination.location.lng,
        startDate,
        duration
      );

      // Format weather data for the component
      const formattedWeatherData = {
        location: destination.name,
        forecast: weatherForecast,
        current: weatherForecast[0] || null
      };

      setWeatherData(formattedWeatherData);

      // Generate alerts based on real weather data
      const alerts = analyzeRealWeatherForTrip(formattedWeatherData, itinerary);
      setWeatherAlerts(alerts);

      console.log('✅ Real weather data fetched:', formattedWeatherData);
      toast.success('Weather data updated with real conditions!');

    } catch (error) {
      console.error('❌ Weather fetch failed:', error);
      setError(error.message);
      toast.error('Failed to fetch weather data. Using fallback data.');

      // Fallback to mock data if real API fails
      const mockWeatherData = generateMockWeatherData(destination.name);
      setWeatherData(mockWeatherData);
      const alerts = analyzeWeatherForTrip(mockWeatherData, itinerary);
      setWeatherAlerts(alerts);
    } finally {
      setLoading(false);
    }
  };

  // Generate realistic mock weather data
  const generateMockWeatherData = (destinationName) => {
    const baseTemp = getBaseTemperature(destinationName);
    const forecast = [];
    
    for (let i = 0; i < 7; i++) {
      const temp = baseTemp + Math.random() * 6 - 3; // ±3°C variation
      const conditions = getWeatherCondition(destinationName, i);
      
      forecast.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        temperature: {
          min: Math.floor(temp - 5),
          max: Math.floor(temp + 5),
          avg: Math.floor(temp)
        },
        condition: conditions.condition,
        description: conditions.description,
        humidity: Math.floor(60 + Math.random() * 30),
        windSpeed: Math.floor(5 + Math.random() * 15),
        precipitation: conditions.precipitation,
        icon: conditions.icon
      });
    }
    
    return {
      location: destinationName,
      current: forecast[0],
      forecast: forecast,
      lastUpdated: new Date()
    };
  };

  // Get base temperature for different destinations
  const getBaseTemperature = (destination) => {
    const tempMap = {
      'goa': 28,
      'kerala': 26,
      'rajasthan': 32,
      'himachal': 15,
      'kashmir': 10,
      'mumbai': 30,
      'delhi': 25,
      'bangalore': 22,
      'kolkata': 28,
      'chennai': 30
    };
    
    const key = Object.keys(tempMap).find(k => 
      destination.toLowerCase().includes(k)
    );
    
    return tempMap[key] || 25; // Default 25°C
  };

  // Get weather condition based on destination and day
  const getWeatherCondition = (destination, dayIndex) => {
    const isRainy = destination.toLowerCase().includes('kerala') || 
                   destination.toLowerCase().includes('mumbai');
    const isSunny = destination.toLowerCase().includes('rajasthan') || 
                   destination.toLowerCase().includes('goa');
    
    if (isRainy && dayIndex % 3 === 0) {
      return {
        condition: 'rainy',
        description: 'Light rain expected',
        precipitation: 70,
        icon: '🌧️'
      };
    } else if (isSunny) {
      return {
        condition: 'sunny',
        description: 'Clear sunny day',
        precipitation: 10,
        icon: '☀️'
      };
    } else {
      return {
        condition: 'partly-cloudy',
        description: 'Partly cloudy',
        precipitation: 20,
        icon: '⛅'
      };
    }
  };

  // Analyze real weather data for trip and generate alerts
  const analyzeRealWeatherForTrip = (weatherData, itinerary) => {
    const alerts = [];

    if (!weatherData?.forecast || !Array.isArray(weatherData.forecast)) {
      return alerts;
    }

    // Check for extreme temperatures
    const hotDays = weatherData.forecast.filter(day => day.temperature?.max > 35 || day.temp_max > 35);
    const coldDays = weatherData.forecast.filter(day => day.temperature?.min < 10 || day.temp_min < 10);

    if (hotDays.length > 0) {
      alerts.push({
        type: 'warning',
        title: 'High Temperature Alert',
        message: `${hotDays.length} day(s) with temperatures above 35°C. Plan indoor activities during peak hours.`,
        icon: '🌡️',
        severity: 'high'
      });
    }

    if (coldDays.length > 0) {
      alerts.push({
        type: 'info',
        title: 'Cold Weather Expected',
        message: `${coldDays.length} day(s) with temperatures below 10°C. Pack warm clothing.`,
        icon: '🧥',
        severity: 'medium'
      });
    }

    // Check for rainy days
    const rainyDays = weatherData.forecast.filter(day =>
      day.precipitation > 50 ||
      (day.weather && day.weather.toLowerCase().includes('rain')) ||
      (day.condition && day.condition.toLowerCase().includes('rain'))
    );

    if (rainyDays.length > 2) {
      alerts.push({
        type: 'warning',
        title: 'Rainy Period Expected',
        message: `${rainyDays.length} day(s) with rain expected. Consider indoor activities and pack rain gear.`,
        icon: '🌧️',
        severity: 'high'
      });
    }

    // Check for good weather days
    const goodWeatherDays = weatherData.forecast.filter(day => {
      const temp = day.temperature?.max || day.temp_max || 25;
      const precip = day.precipitation || 0;
      return temp >= 20 && temp <= 30 && precip < 20;
    });

    if (goodWeatherDays.length > 3) {
      alerts.push({
        type: 'success',
        title: 'Great Weather Expected',
        message: `${goodWeatherDays.length} day(s) with ideal weather conditions for outdoor activities.`,
        icon: '☀️',
        severity: 'low'
      });
    }

    return alerts;
  };

  // Analyze weather and generate alerts (fallback for mock data)
  const analyzeWeatherForTrip = (weather, itinerary) => {
    if (!weather || !itinerary) return [];
    
    const alerts = [];
    
    weather.forecast.slice(0, itinerary.length).forEach((dayWeather, index) => {
      const day = itinerary[index];
      if (!day?.activities) return;
      
      // Check for rain on outdoor activity days
      if (dayWeather.precipitation > 60) {
        const outdoorActivities = day.activities.filter(activity => 
          isOutdoorActivity(activity.placeName)
        );
        
        if (outdoorActivities.length > 0) {
          alerts.push({
            type: 'rain',
            severity: 'warning',
            day: index + 1,
            message: `Rain expected on Day ${index + 1}. Consider indoor alternatives for outdoor activities.`,
            affectedActivities: outdoorActivities.map(a => a.placeName),
            suggestions: getIndoorAlternatives(outdoorActivities)
          });
        }
      }
      
      // Check for extreme temperatures
      if (dayWeather.temperature.max > 40) {
        alerts.push({
          type: 'heat',
          severity: 'warning',
          day: index + 1,
          message: `Very hot weather (${dayWeather.temperature.max}°C) on Day ${index + 1}. Plan indoor activities during peak hours.`,
          suggestions: ['Visit air-conditioned museums', 'Indoor shopping malls', 'Afternoon rest at hotel']
        });
      }
    });
    
    return alerts;
  };

  // Check if activity is outdoor
  const isOutdoorActivity = (placeName) => {
    const outdoorKeywords = ['beach', 'park', 'garden', 'trek', 'hill', 'lake', 'waterfall', 'outdoor'];
    return outdoorKeywords.some(keyword => 
      placeName.toLowerCase().includes(keyword)
    );
  };

  // Get indoor alternatives
  const getIndoorAlternatives = () => {
    return [
      'Visit local museums',
      'Explore shopping centers',
      'Try indoor cultural experiences',
      'Enjoy spa and wellness centers'
    ];
  };

  // Adjust itinerary based on weather
  const adjustItineraryForWeather = () => {
    if (!weatherData || !itinerary) return;
    
    const adjusted = itinerary.map((day, index) => {
      const dayWeather = weatherData.forecast[index];
      if (!dayWeather || !day.activities) return day;
      
      let adjustedActivities = [...day.activities];
      
      // If rain expected, move outdoor activities to indoor alternatives
      if (dayWeather.precipitation > 60) {
        adjustedActivities = day.activities.map(activity => {
          if (isOutdoorActivity(activity.placeName)) {
            return {
              ...activity,
              weatherAdjusted: true,
              originalActivity: activity.placeName,
              weatherNote: 'Moved indoors due to rain forecast'
            };
          }
          return activity;
        });
      }
      
      // Adjust timing for hot weather
      if (dayWeather.temperature.max > 35) {
        adjustedActivities = adjustedActivities.map(activity => ({
          ...activity,
          bestTimeToVisit: activity.bestTimeToVisit === 'Afternoon' ? 'Morning' : activity.bestTimeToVisit,
          weatherNote: activity.bestTimeToVisit === 'Afternoon' ? 'Moved to morning due to heat' : undefined
        }));
      }
      
      return {
        ...day,
        activities: adjustedActivities,
        weatherAdjusted: true,
        weatherCondition: dayWeather.condition
      };
    });
    
    setAdjustedItinerary(adjusted);
    if (onWeatherAdjustment) {
      onWeatherAdjustment(adjusted);
    }
    
    toast.success('Itinerary adjusted for weather conditions!');
  };

  // Auto-fetch weather when destination changes
  useEffect(() => {
    if (destination) {
      fetchWeatherData();
    }
  }, [destination]);

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return <SunIcon className="w-6 h-6 text-yellow-500" />;
      case 'rainy': return <CloudIcon className="w-6 h-6 text-blue-500" />;
      default: return <CloudIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  // Helper functions for weather data formatting
  const getWeatherForecastArray = (weatherData) => {
    try {
      if (!weatherData) {
        console.log('🌤️ No weather data, generating fallback');
        return generateFallbackWeatherArray();
      }

      // Handle different possible data structures
      if (Array.isArray(weatherData.forecast)) {
        console.log('🌤️ Using weatherData.forecast array');
        return weatherData.forecast.slice(0, 7);
      }

      if (Array.isArray(weatherData)) {
        console.log('🌤️ Using weatherData as array');
        return weatherData.slice(0, 7);
      }

      // If it's a single weather object, create an array
      if (weatherData.current || weatherData.temperature) {
        console.log('🌤️ Converting single weather object to array');
        return [weatherData];
      }

      console.log('🌤️ Unknown weather data format, generating fallback');
      return generateFallbackWeatherArray();

    } catch (error) {
      console.error('❌ Error processing weather data:', error);
      return generateFallbackWeatherArray();
    }
  };

  const generateFallbackWeatherArray = () => {
    console.log('🌤️ Generating fallback weather data');
    return Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      temperature: { max: 25 + Math.random() * 10, min: 18 + Math.random() * 5 },
      condition: 'partly-cloudy',
      icon: '⛅',
      precipitation: Math.random() * 30
    }));
  };

  const formatWeatherDate = (day, index) => {
    if (day.date && day.date.toLocaleDateString) {
      return day.date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    const date = new Date(Date.now() + index * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getWeatherIconEmoji = (day) => {
    if (day.icon && typeof day.icon === 'string') {
      return day.icon;
    }

    // Default icons based on condition
    const condition = day.condition || day.weather || 'clear';
    const iconMap = {
      'sunny': '☀️',
      'clear': '☀️',
      'partly-cloudy': '⛅',
      'cloudy': '☁️',
      'rainy': '🌧️',
      'rain': '🌧️',
      'stormy': '⛈️',
      'snow': '❄️'
    };

    return iconMap[condition.toLowerCase()] || '⛅';
  };

  const getMaxTemp = (day) => {
    return Math.round(day.temperature?.max || day.temp_max || day.maxTemp || 25);
  };

  const getMinTemp = (day) => {
    return Math.round(day.temperature?.min || day.temp_min || day.minTemp || 18);
  };

  const getPrecipitation = (day) => {
    return Math.round(day.precipitation || day.precip || 20);
  };

  // Error boundary for the component
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900">Weather Service Error</h3>
            <p className="text-sm text-red-600">Unable to load weather data</p>
          </div>
        </div>
        <button
          onClick={() => {
            setError(null);
            fetchWeatherData();
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CloudIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weather-Aware Planning</h3>
            <p className="text-sm text-gray-600">Smart itinerary adjustments based on weather</p>
          </div>
        </div>
        
        <button
          onClick={fetchWeatherData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Weather Forecast */}
      {weatherData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h4 className="font-semibold text-gray-900 mb-3">7-Day Forecast</h4>
          <div className="grid grid-cols-7 gap-2">
            {getWeatherForecastArray(weatherData).map((day, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">
                  {formatWeatherDate(day, index)}
                </p>
                <div className="text-2xl mb-1">{getWeatherIconEmoji(day)}</div>
                <p className="text-sm font-medium">{getMaxTemp(day)}°</p>
                <p className="text-xs text-gray-500">{getMinTemp(day)}°</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Weather Alerts */}
      {weatherAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h4 className="font-semibold text-gray-900 mb-3">Weather Alerts</h4>
          <div className="space-y-3">
            {weatherAlerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-400' : 'bg-red-50 border-red-400'
              }`}>
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className={`w-5 h-5 mt-0.5 ${
                    alert.severity === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    {alert.suggestions && (
                      <ul className="mt-2 text-sm text-gray-600">
                        {alert.suggestions.map((suggestion, i) => (
                          <li key={i}>• {suggestion}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={adjustItineraryForWeather}
            className="mt-4 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>Auto-Adjust Itinerary</span>
          </button>
        </motion.div>
      )}

      {/* Adjusted Itinerary Preview */}
      {adjustedItinerary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 rounded-lg"
        >
          <h4 className="font-medium text-green-900 mb-2">✅ Weather-Adjusted Itinerary</h4>
          <p className="text-sm text-green-800 mb-3">
            Your itinerary has been optimized based on weather forecasts
          </p>
          
          <div className="space-y-2">
            {adjustedItinerary.slice(0, 3).map((day, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm font-medium">Day {day.day}</span>
                <div className="flex items-center space-x-2">
                  {getWeatherIcon(day.weatherCondition)}
                  <span className="text-xs text-gray-600">
                    {day.activities?.length || 0} activities
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WeatherAwarePlanner;
