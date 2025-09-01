import telemetryService from './telemetryService';

class WeatherService {
  constructor() {
    this.apiKey = 'a204f5ba621cf11939283193a49d6114'; // Your working weather API key
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.cache = new Map();
    this.cacheExpiry = 60 * 60 * 1000; // 1 hour for current weather, longer for forecasts
    this.isValidApiKey = true; // Always true since we have your working key
    console.log('🌤️ Weather service initialized with working API key');
  }

  // Get weather-aware itinerary recommendations
  async getWeatherAwareItinerary(itinerary, tripData) {
    try {
      // Check if API key is valid
      if (!this.isValidApiKey) {
        console.warn('⚠️ Weather API key not configured. Returning original itinerary.');
        return itinerary;
      }

      const destination = tripData.destination;
      if (!destination?.location) {
        return itinerary; // Return original if no location data
      }

      // Get weather forecast for trip dates
      const weatherForecast = await this.getWeatherForecast(
        destination.location.lat,
        destination.location.lng,
        tripData.startDate,
        tripData.duration
      );

      // Analyze weather impact on activities
      const weatherAnalysis = this.analyzeWeatherImpact(itinerary, weatherForecast);

      // Generate weather-optimized itinerary
      const optimizedItinerary = this.optimizeForWeather(itinerary, weatherAnalysis);

      return {
        ...optimizedItinerary,
        weatherInfo: {
          forecast: weatherForecast,
          analysis: weatherAnalysis,
          recommendations: this.generateWeatherRecommendations(weatherAnalysis, tripData),
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error getting weather-aware itinerary:', error);
      return itinerary; // Return original on error
    }
  }

  // Get weather forecast for trip dates
  async getWeatherForecast(lat, lng, startDate, duration) {
    const cacheKey = `forecast_${lat}_${lng}_${startDate}_${duration}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry * 6) { // 6 hours for forecasts
        return cached.data;
      }
    }

    try {
      // For trips starting within 5 days, use detailed forecast
      const tripStart = new Date(startDate);
      const now = new Date();
      const daysUntilTrip = Math.ceil((tripStart - now) / (1000 * 60 * 60 * 24));

      let forecast;
      if (daysUntilTrip <= 5) {
        forecast = await this.getDetailedForecast(lat, lng, duration);
      } else {
        forecast = await this.getHistoricalWeatherPattern(lat, lng, tripStart, duration);
      }

      this.cache.set(cacheKey, {
        data: forecast,
        timestamp: Date.now()
      });

      return forecast;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return this.getFallbackWeatherData(duration);
    }
  }

  // Get detailed 5-day forecast
  async getDetailedForecast(lat, lng, duration) {
    const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Process forecast data into daily summaries
    const dailyForecasts = this.processForecastData(data.list, duration);
    
    return {
      type: 'detailed_forecast',
      location: {
        name: data.city.name,
        country: data.city.country,
        coordinates: { lat, lng }
      },
      days: dailyForecasts,
      source: 'openweathermap',
      accuracy: 'high'
    };
  }

  // Get historical weather patterns for future dates
  async getHistoricalWeatherPattern(lat, lng, startDate, duration) {
    // For dates beyond 5 days, use historical averages
    // This would typically call a different API endpoint
    
    const month = startDate.getMonth();
    const seasonalData = this.getSeasonalWeatherData(lat, lng, month);
    
    const days = [];
    for (let i = 0; i < duration; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      days.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          min: seasonalData.tempMin + (Math.random() - 0.5) * 10,
          max: seasonalData.tempMax + (Math.random() - 0.5) * 10,
          avg: (seasonalData.tempMin + seasonalData.tempMax) / 2
        },
        conditions: seasonalData.commonConditions,
        precipitation: {
          probability: seasonalData.precipitationChance,
          amount: seasonalData.avgPrecipitation
        },
        wind: {
          speed: seasonalData.avgWindSpeed,
          direction: 'variable'
        },
        humidity: seasonalData.avgHumidity,
        confidence: 'medium'
      });
    }

    return {
      type: 'historical_pattern',
      location: { coordinates: { lat, lng } },
      days,
      source: 'historical_data',
      accuracy: 'medium'
    };
  }

  // Process raw forecast data into daily summaries
  processForecastData(forecastList, duration) {
    const dailyData = new Map();
    
    forecastList.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          temperatures: [],
          conditions: [],
          precipitation: [],
          wind: [],
          humidity: []
        });
      }
      
      const dayData = dailyData.get(date);
      dayData.temperatures.push(item.main.temp);
      dayData.conditions.push(item.weather[0]);
      dayData.precipitation.push(item.rain?.['3h'] || 0);
      dayData.wind.push(item.wind);
      dayData.humidity.push(item.main.humidity);
    });

    // Convert to daily summaries
    const days = [];
    let dayCount = 0;
    
    for (const [date, data] of dailyData) {
      if (dayCount >= duration) break;
      
      const temperatures = data.temperatures;
      const mainCondition = this.getMostCommonCondition(data.conditions);
      
      days.push({
        date,
        temperature: {
          min: Math.min(...temperatures),
          max: Math.max(...temperatures),
          avg: temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length
        },
        conditions: {
          main: mainCondition.main,
          description: mainCondition.description,
          icon: mainCondition.icon
        },
        precipitation: {
          probability: this.calculatePrecipitationProbability(data.precipitation),
          amount: Math.max(...data.precipitation)
        },
        wind: {
          speed: data.wind.reduce((sum, w) => sum + w.speed, 0) / data.wind.length,
          direction: this.getMostCommonWindDirection(data.wind)
        },
        humidity: data.humidity.reduce((sum, h) => sum + h, 0) / data.humidity.length,
        confidence: 'high'
      });
      
      dayCount++;
    }

    return days;
  }

  // Analyze weather impact on activities
  analyzeWeatherImpact(itinerary, weatherForecast) {
    const analysis = {
      overallRisk: 'low',
      affectedDays: [],
      recommendations: [],
      alternatives: []
    };

    if (!weatherForecast?.days || !itinerary?.itinerary) {
      return analysis;
    }

    itinerary.itinerary.forEach((day, dayIndex) => {
      const weather = weatherForecast.days[dayIndex];
      if (!weather) return;

      const dayAnalysis = {
        dayNumber: dayIndex + 1,
        date: weather.date,
        weather: weather,
        affectedActivities: [],
        recommendations: [],
        riskLevel: 'low'
      };

      // Analyze each activity
      day.activities?.forEach(activity => {
        const impact = this.assessActivityWeatherImpact(activity, weather);
        if (impact.risk !== 'low') {
          dayAnalysis.affectedActivities.push({
            activity: activity.name,
            impact: impact
          });
        }
      });

      // Determine day risk level
      if (dayAnalysis.affectedActivities.length > 0) {
        const highRiskActivities = dayAnalysis.affectedActivities.filter(a => a.impact.risk === 'high');
        dayAnalysis.riskLevel = highRiskActivities.length > 0 ? 'high' : 'medium';
        
        // Generate day-specific recommendations
        dayAnalysis.recommendations = this.generateDayRecommendations(day, weather, dayAnalysis.affectedActivities);
        
        analysis.affectedDays.push(dayAnalysis);
      }
    });

    // Determine overall risk
    const highRiskDays = analysis.affectedDays.filter(d => d.riskLevel === 'high');
    if (highRiskDays.length > 0) {
      analysis.overallRisk = 'high';
    } else if (analysis.affectedDays.length > 0) {
      analysis.overallRisk = 'medium';
    }

    return analysis;
  }

  // Assess weather impact on individual activity
  assessActivityWeatherImpact(activity, weather) {
    const impact = {
      risk: 'low',
      factors: [],
      alternatives: []
    };

    // Check if activity is weather-dependent
    const isOutdoor = this.isOutdoorActivity(activity);
    const isWeatherSensitive = this.isWeatherSensitiveActivity(activity);

    if (!isOutdoor && !isWeatherSensitive) {
      return impact; // Indoor activities are generally safe
    }

    // Check precipitation
    if (weather.precipitation?.probability > 70) {
      impact.risk = isOutdoor ? 'high' : 'medium';
      impact.factors.push('High chance of rain');
    } else if (weather.precipitation?.probability > 40) {
      impact.risk = 'medium';
      impact.factors.push('Possible rain');
    }

    // Check temperature extremes
    if (weather.temperature?.max > 35) {
      impact.risk = Math.max(impact.risk === 'low' ? 1 : impact.risk === 'medium' ? 2 : 3, 2) === 2 ? 'medium' : 'high';
      impact.factors.push('Very hot weather');
    } else if (weather.temperature?.min < 0) {
      impact.risk = Math.max(impact.risk === 'low' ? 1 : impact.risk === 'medium' ? 2 : 3, 2) === 2 ? 'medium' : 'high';
      impact.factors.push('Freezing temperatures');
    }

    // Check wind conditions
    if (weather.wind?.speed > 15) {
      impact.risk = Math.max(impact.risk === 'low' ? 1 : impact.risk === 'medium' ? 2 : 3, 2) === 2 ? 'medium' : 'high';
      impact.factors.push('Strong winds');
    }

    // Generate alternatives if high risk
    if (impact.risk === 'high') {
      impact.alternatives = this.generateActivityAlternatives(activity, weather);
    }

    return impact;
  }

  // Optimize itinerary for weather
  optimizeForWeather(itinerary, weatherAnalysis) {
    const optimized = JSON.parse(JSON.stringify(itinerary)); // Deep copy

    weatherAnalysis.affectedDays.forEach(dayAnalysis => {
      const dayIndex = dayAnalysis.dayNumber - 1;
      const day = optimized.itinerary[dayIndex];
      
      if (dayAnalysis.riskLevel === 'high') {
        // Reorder activities to minimize weather impact
        day.activities = this.reorderActivitiesForWeather(day.activities, dayAnalysis.weather);
        
        // Add weather alternatives
        day.weatherAlternatives = this.generateDayAlternatives(day, dayAnalysis.weather);
      }
      
      // Add weather warnings
      day.weatherWarning = {
        level: dayAnalysis.riskLevel,
        message: this.generateWeatherWarning(dayAnalysis),
        recommendations: dayAnalysis.recommendations
      };
    });

    return optimized;
  }

  // Helper methods
  isOutdoorActivity(activity) {
    const outdoorKeywords = [
      'park', 'garden', 'beach', 'hiking', 'walking', 'outdoor', 'market',
      'street', 'plaza', 'square', 'monument', 'viewpoint', 'bridge'
    ];
    
    const activityText = `${activity.name} ${activity.description || ''}`.toLowerCase();
    return outdoorKeywords.some(keyword => activityText.includes(keyword)) || 
           activity.weatherDependent === true;
  }

  isWeatherSensitiveActivity(activity) {
    const sensitiveTypes = ['sightseeing', 'walking_tour', 'outdoor_activity', 'nature'];
    return sensitiveTypes.includes(activity.type) || activity.category === 'nature';
  }

  getMostCommonCondition(conditions) {
    const conditionCounts = {};
    conditions.forEach(condition => {
      const key = condition.main;
      conditionCounts[key] = (conditionCounts[key] || 0) + 1;
    });
    
    const mostCommon = Object.entries(conditionCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    return conditions.find(c => c.main === mostCommon[0]);
  }

  calculatePrecipitationProbability(precipitationData) {
    const nonZero = precipitationData.filter(p => p > 0);
    return (nonZero.length / precipitationData.length) * 100;
  }

  getMostCommonWindDirection(windData) {
    // Simplified - would calculate actual most common direction
    return 'variable';
  }

  getSeasonalWeatherData(lat, lng, month) {
    // Simplified seasonal data - would use real climate data
    const seasons = {
      winter: { tempMin: -5, tempMax: 5, precipitationChance: 60, avgPrecipitation: 2 },
      spring: { tempMin: 5, tempMax: 18, precipitationChance: 50, avgPrecipitation: 1.5 },
      summer: { tempMin: 15, tempMax: 28, precipitationChance: 30, avgPrecipitation: 1 },
      fall: { tempMin: 8, tempMax: 20, precipitationChance: 55, avgPrecipitation: 1.8 }
    };

    let season;
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'fall';
    else season = 'winter';

    return {
      ...seasons[season],
      commonConditions: season === 'summer' ? 'Clear' : 'Clouds',
      avgWindSpeed: 10,
      avgHumidity: 65
    };
  }

  generateDayRecommendations(day, weather, affectedActivities) {
    const recommendations = [];
    
    if (weather.precipitation?.probability > 70) {
      recommendations.push('Bring umbrella or rain gear');
      recommendations.push('Consider indoor alternatives for outdoor activities');
    }
    
    if (weather.temperature?.max > 30) {
      recommendations.push('Stay hydrated and take breaks in shade');
      recommendations.push('Plan outdoor activities for early morning or evening');
    }
    
    if (weather.temperature?.min < 5) {
      recommendations.push('Dress warmly in layers');
      recommendations.push('Check if outdoor venues are open in cold weather');
    }
    
    return recommendations;
  }

  generateActivityAlternatives(activity, weather) {
    // This would generate specific alternatives based on activity type and weather
    return [
      'Visit nearby indoor attraction',
      'Explore covered markets or shopping areas',
      'Try local museums or galleries'
    ];
  }

  reorderActivitiesForWeather(activities, weather) {
    // Simple reordering - put indoor activities first if bad weather expected
    if (weather.precipitation?.probability > 60) {
      const indoor = activities.filter(a => !this.isOutdoorActivity(a));
      const outdoor = activities.filter(a => this.isOutdoorActivity(a));
      return [...indoor, ...outdoor];
    }
    
    return activities;
  }

  generateDayAlternatives(day, weather) {
    return [
      'Indoor sightseeing tour',
      'Museum and gallery visits',
      'Shopping and local markets',
      'Cooking class or food tour'
    ];
  }

  generateWeatherWarning(dayAnalysis) {
    const factors = dayAnalysis.affectedActivities
      .flatMap(a => a.impact.factors)
      .filter((factor, index, arr) => arr.indexOf(factor) === index);
    
    return `Weather conditions may affect outdoor activities: ${factors.join(', ')}`;
  }

  generateWeatherRecommendations(weatherAnalysis, tripData) {
    const recommendations = [];
    
    if (weatherAnalysis.overallRisk === 'high') {
      recommendations.push({
        type: 'general',
        message: 'Consider travel insurance due to weather risks',
        priority: 'high'
      });
    }
    
    if (weatherAnalysis.affectedDays.length > 0) {
      recommendations.push({
        type: 'packing',
        message: 'Pack weather-appropriate clothing and gear',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  getFallbackWeatherData(duration) {
    const days = [];
    for (let i = 0; i < duration; i++) {
      days.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        temperature: { min: 15, max: 25, avg: 20 },
        conditions: { main: 'Clear', description: 'clear sky' },
        precipitation: { probability: 20, amount: 0 },
        wind: { speed: 5 },
        humidity: 60,
        confidence: 'low'
      });
    }
    
    return {
      type: 'fallback',
      days,
      source: 'default',
      accuracy: 'low'
    };
  }
}

// Create singleton instance
const weatherService = new WeatherService();

// React hook for weather service
export const useWeatherService = () => {
  const telemetry = useTelemetry();

  return {
    getWeatherAwareItinerary: async (itinerary, tripData) => {
      const startTime = Date.now();
      try {
        telemetry.trackEvent('weather_analysis_started', { 
          destination: tripData.destination?.name,
          duration: tripData.duration
        });
        
        const weatherItinerary = await weatherService.getWeatherAwareItinerary(itinerary, tripData);
        const analysisTime = Date.now() - startTime;
        
        telemetry.trackEvent('weather_analysis_completed', { 
          analysisTime,
          overallRisk: weatherItinerary.weatherInfo?.analysis?.overallRisk,
          affectedDays: weatherItinerary.weatherInfo?.analysis?.affectedDays?.length || 0
        });
        
        return weatherItinerary;
      } catch (error) {
        telemetry.trackError(error, { action: 'getWeatherAwareItinerary', tripData });
        throw error;
      }
    }
  };
};

export default weatherService;
