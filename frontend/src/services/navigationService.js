import { useTelemetry } from './telemetryService';

class NavigationService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    this.realTimeCache = new Map();
    this.realTimeCacheExpiry = 5 * 60 * 1000; // 5 minutes for real-time data
  }

  // Get comprehensive navigation guidance for itinerary
  async getNavigationGuidance(itinerary, preferences = {}) {
    try {
      const guidanceData = {
        overview: await this.generateOverviewGuidance(itinerary, preferences),
        dailyRoutes: [],
        transportOptions: await this.analyzeTransportOptions(itinerary, preferences),
        realTimeInfo: {
          enabled: true,
          lastUpdated: new Date().toISOString()
        }
      };

      // Generate daily navigation guidance
      for (let dayIndex = 0; dayIndex < itinerary.itinerary.length; dayIndex++) {
        const day = itinerary.itinerary[dayIndex];
        const dailyGuidance = await this.generateDailyGuidance(day, dayIndex + 1, preferences);
        guidanceData.dailyRoutes.push(dailyGuidance);
      }

      return guidanceData;
    } catch (error) {
      console.error('Error generating navigation guidance:', error);
      return this.getFallbackGuidance(itinerary);
    }
  }

  // Generate overview guidance for entire trip
  async generateOverviewGuidance(itinerary, preferences) {
    const totalActivities = itinerary.itinerary.reduce((sum, day) => sum + (day.activities?.length || 0), 0);
    const destinations = this.extractUniqueDestinations(itinerary);
    
    return {
      totalDays: itinerary.itinerary.length,
      totalActivities,
      uniqueDestinations: destinations.length,
      recommendedTransport: this.getRecommendedTransportMode(itinerary, preferences),
      estimatedTotalTravelTime: await this.calculateTotalTravelTime(itinerary, preferences),
      keyTransportHubs: this.identifyTransportHubs(itinerary),
      generalTips: this.getGeneralNavigationTips(itinerary, preferences)
    };
  }

  // Generate daily navigation guidance
  async generateDailyGuidance(day, dayNumber, preferences) {
    if (!day.activities || day.activities.length === 0) {
      return this.getEmptyDayGuidance(dayNumber);
    }

    const routes = await this.calculateDayRoutes(day.activities, preferences);
    const transportAnalysis = this.analyzeDayTransport(day.activities, routes);
    
    return {
      dayNumber,
      date: day.date,
      totalActivities: day.activities.length,
      routes: routes,
      transport: transportAnalysis,
      walkingDistance: this.calculateWalkingDistance(routes),
      estimatedTravelTime: this.calculateDayTravelTime(routes),
      recommendations: this.generateDayNavigationRecommendations(day, routes, preferences),
      realTimeUpdates: {
        trafficAware: true,
        transitUpdates: true,
        weatherConsiderations: true
      }
    };
  }

  // Calculate routes between activities
  async calculateDayRoutes(activities, preferences) {
    const routes = [];
    
    for (let i = 0; i < activities.length - 1; i++) {
      const from = activities[i];
      const to = activities[i + 1];
      
      const route = await this.getRoute(from, to, preferences);
      routes.push({
        from: {
          name: from.name,
          location: from.location
        },
        to: {
          name: to.name,
          location: to.location
        },
        ...route
      });
    }
    
    return routes;
  }

  // Get route between two points with multiple transport options
  async getRoute(from, to, preferences) {
    const fromCoords = this.extractCoordinates(from.location);
    const toCoords = this.extractCoordinates(to.location);
    
    if (!fromCoords || !toCoords) {
      return this.getFallbackRoute(from, to);
    }

    const cacheKey = `route_${fromCoords.lat}_${fromCoords.lng}_${toCoords.lat}_${toCoords.lng}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return this.addRealTimeUpdates(cached.data, preferences);
      }
    }

    try {
      // Get routes for different transport modes
      const transportModes = ['walking', 'transit', 'driving'];
      const routeOptions = {};

      for (const mode of transportModes) {
        try {
          const routeData = await this.fetchGoogleDirections(fromCoords, toCoords, mode);
          routeOptions[mode] = this.processRouteData(routeData, mode);
        } catch (error) {
          console.warn(`Failed to get ${mode} route:`, error);
          routeOptions[mode] = this.getFallbackRouteData(mode);
        }
      }

      const route = {
        options: routeOptions,
        recommended: this.selectRecommendedRoute(routeOptions, preferences),
        lastUpdated: new Date().toISOString()
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: route,
        timestamp: Date.now()
      });

      return this.addRealTimeUpdates(route, preferences);
    } catch (error) {
      console.error('Error calculating route:', error);
      return this.getFallbackRoute(from, to);
    }
  }

  // Fetch directions from Google Maps API
  async fetchGoogleDirections(origin, destination, mode) {
    const params = new URLSearchParams({
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: mode,
      key: this.apiKey,
      alternatives: 'true',
      departure_time: 'now'
    });

    const url = `https://maps.googleapis.com/maps/api/directions/json?${params}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Directions API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Directions API status: ${data.status}`);
    }

    return data;
  }

  // Process route data from Google Directions API
  processRouteData(directionsData, mode) {
    const route = directionsData.routes[0];
    if (!route) return null;

    const leg = route.legs[0];
    
    return {
      mode,
      duration: {
        value: leg.duration.value,
        text: leg.duration.text
      },
      distance: {
        value: leg.distance.value,
        text: leg.distance.text
      },
      steps: this.processRouteSteps(leg.steps, mode),
      polyline: route.overview_polyline?.points,
      fare: leg.fare ? {
        currency: leg.fare.currency,
        value: leg.fare.value,
        text: leg.fare.text
      } : null,
      warnings: route.warnings || [],
      copyrights: route.copyrights
    };
  }

  // Process individual route steps
  processRouteSteps(steps, mode) {
    return steps.map((step, index) => ({
      stepNumber: index + 1,
      instruction: step.html_instructions?.replace(/<[^>]*>/g, '') || 'Continue',
      distance: step.distance,
      duration: step.duration,
      startLocation: step.start_location,
      endLocation: step.end_location,
      travelMode: step.travel_mode,
      transitDetails: step.transit_details ? {
        line: step.transit_details.line,
        departureStop: step.transit_details.departure_stop,
        arrivalStop: step.transit_details.arrival_stop,
        departureTime: step.transit_details.departure_time,
        arrivalTime: step.transit_details.arrival_time,
        headsign: step.transit_details.headsign
      } : null,
      polyline: step.polyline?.points
    }));
  }

  // Add real-time updates to route data
  async addRealTimeUpdates(route, preferences) {
    try {
      // Add real-time traffic data for driving routes
      if (route.options?.driving) {
        const trafficData = await this.getRealTimeTraffic(route.options.driving);
        route.options.driving.realTime = trafficData;
      }

      // Add real-time transit data
      if (route.options?.transit) {
        const transitData = await this.getRealTimeTransit(route.options.transit);
        route.options.transit.realTime = transitData;
      }

      route.realTimeLastUpdated = new Date().toISOString();
      return route;
    } catch (error) {
      console.warn('Failed to add real-time updates:', error);
      return route;
    }
  }

  // Get real-time traffic information
  async getRealTimeTraffic(drivingRoute) {
    // This would integrate with real-time traffic APIs
    return {
      currentDuration: drivingRoute.duration.value * (0.8 + Math.random() * 0.4), // Simulate traffic
      trafficConditions: 'moderate',
      incidents: [],
      alternativeRoutes: []
    };
  }

  // Get real-time transit information
  async getRealTimeTransit(transitRoute) {
    // This would integrate with real-time transit APIs
    return {
      delays: [],
      serviceAlerts: [],
      nextDepartures: [],
      crowdingInfo: 'moderate'
    };
  }

  // Analyze transport options for the entire itinerary
  async analyzeTransportOptions(itinerary, preferences) {
    const analysis = {
      walkingFriendly: true,
      publicTransitCoverage: 'good',
      drivingRecommended: false,
      bikingFeasible: true,
      recommendations: []
    };

    // Analyze walking distances
    const totalWalkingDistance = await this.calculateTotalWalkingDistance(itinerary);
    analysis.walkingFriendly = totalWalkingDistance < 15000; // 15km total

    // Analyze public transit needs
    const longDistanceRoutes = await this.identifyLongDistanceRoutes(itinerary);
    analysis.publicTransitCoverage = longDistanceRoutes.length > 3 ? 'essential' : 'helpful';

    // Generate recommendations
    if (totalWalkingDistance > 20000) {
      analysis.recommendations.push({
        type: 'transport',
        message: 'Consider day passes for public transport due to long distances',
        priority: 'high'
      });
    }

    if (longDistanceRoutes.length > 0) {
      analysis.recommendations.push({
        type: 'planning',
        message: 'Plan extra time for longer transport connections',
        priority: 'medium'
      });
    }

    return analysis;
  }

  // Helper methods
  extractCoordinates(location) {
    if (!location) return null;
    
    // Handle different location formats
    if (location.lat && location.lng) {
      return { lat: location.lat, lng: location.lng };
    }
    if (location.latitude && location.longitude) {
      return { lat: location.latitude, lng: location.longitude };
    }
    if (location.coordinates) {
      return this.extractCoordinates(location.coordinates);
    }
    
    return null;
  }

  extractUniqueDestinations(itinerary) {
    const destinations = new Set();
    
    itinerary.itinerary.forEach(day => {
      day.activities?.forEach(activity => {
        if (activity.location) {
          const coords = this.extractCoordinates(activity.location);
          if (coords) {
            destinations.add(`${coords.lat.toFixed(3)},${coords.lng.toFixed(3)}`);
          }
        }
      });
    });
    
    return Array.from(destinations);
  }

  getRecommendedTransportMode(itinerary, preferences) {
    // Analyze itinerary to recommend primary transport mode
    const totalActivities = itinerary.itinerary.reduce((sum, day) => sum + (day.activities?.length || 0), 0);
    
    if (totalActivities < 10) return 'walking';
    if (preferences.budget?.max < 2000) return 'public_transit';
    return 'mixed';
  }

  async calculateTotalTravelTime(itinerary, preferences) {
    // Simplified calculation - would sum all route times
    const totalActivities = itinerary.itinerary.reduce((sum, day) => sum + (day.activities?.length || 0), 0);
    return `${Math.round(totalActivities * 15)} minutes per day average`;
  }

  identifyTransportHubs(itinerary) {
    // Identify major transport hubs (airports, train stations, etc.)
    return [
      'Main Airport',
      'Central Train Station',
      'City Center Metro Hub'
    ];
  }

  getGeneralNavigationTips(itinerary, preferences) {
    return [
      'Download offline maps before traveling',
      'Keep backup transportation options in mind',
      'Allow extra time for first-time routes',
      'Check local transport apps and schedules'
    ];
  }

  selectRecommendedRoute(routeOptions, preferences) {
    // Select best route based on preferences
    const modes = Object.keys(routeOptions).filter(mode => routeOptions[mode]);
    
    if (preferences.transportPreference) {
      return preferences.transportPreference;
    }
    
    // Default logic: prefer walking for short distances, transit for longer
    if (routeOptions.walking && routeOptions.walking.duration.value < 900) { // 15 minutes
      return 'walking';
    }
    
    if (routeOptions.transit) {
      return 'transit';
    }
    
    return modes[0] || 'walking';
  }

  analyzeDayTransport(activities, routes) {
    return {
      totalRoutes: routes.length,
      recommendedModes: routes.map(route => route.recommended),
      estimatedCosts: this.calculateTransportCosts(routes),
      tips: this.generateTransportTips(routes)
    };
  }

  calculateWalkingDistance(routes) {
    return routes.reduce((total, route) => {
      const walkingOption = route.options?.walking;
      return total + (walkingOption?.distance?.value || 0);
    }, 0);
  }

  calculateDayTravelTime(routes) {
    return routes.reduce((total, route) => {
      const recommendedOption = route.options?.[route.recommended];
      return total + (recommendedOption?.duration?.value || 0);
    }, 0);
  }

  generateDayNavigationRecommendations(day, routes, preferences) {
    const recommendations = [];
    
    const totalWalkingTime = routes.reduce((sum, route) => {
      const walking = route.options?.walking;
      return sum + (walking?.duration?.value || 0);
    }, 0);
    
    if (totalWalkingTime > 3600) { // More than 1 hour walking
      recommendations.push('Consider using public transport for longer distances');
    }
    
    if (routes.some(route => route.options?.transit)) {
      recommendations.push('Check public transport schedules and buy day passes if available');
    }
    
    return recommendations;
  }

  // Fallback methods
  getFallbackRoute(from, to) {
    return {
      options: {
        walking: {
          mode: 'walking',
          duration: { value: 900, text: '15 mins' },
          distance: { value: 1000, text: '1.0 km' },
          steps: []
        }
      },
      recommended: 'walking',
      lastUpdated: new Date().toISOString()
    };
  }

  getFallbackRouteData(mode) {
    const defaults = {
      walking: { duration: { value: 900, text: '15 mins' }, distance: { value: 1000, text: '1.0 km' } },
      transit: { duration: { value: 1200, text: '20 mins' }, distance: { value: 5000, text: '5.0 km' } },
      driving: { duration: { value: 600, text: '10 mins' }, distance: { value: 3000, text: '3.0 km' } }
    };
    
    return {
      mode,
      ...defaults[mode],
      steps: []
    };
  }

  getEmptyDayGuidance(dayNumber) {
    return {
      dayNumber,
      totalActivities: 0,
      routes: [],
      transport: { totalRoutes: 0, recommendedModes: [], estimatedCosts: 0 },
      walkingDistance: 0,
      estimatedTravelTime: 0,
      recommendations: ['No activities planned for this day']
    };
  }

  getFallbackGuidance(itinerary) {
    return {
      overview: {
        totalDays: itinerary.itinerary?.length || 0,
        totalActivities: 0,
        recommendedTransport: 'walking',
        generalTips: ['Use local transportation apps', 'Keep maps offline']
      },
      dailyRoutes: [],
      transportOptions: {
        walkingFriendly: true,
        recommendations: []
      }
    };
  }

  async calculateTotalWalkingDistance(itinerary) {
    // Simplified calculation
    const totalActivities = itinerary.itinerary.reduce((sum, day) => sum + (day.activities?.length || 0), 0);
    return totalActivities * 800; // Assume 800m average between activities
  }

  async identifyLongDistanceRoutes(itinerary) {
    // Simplified - would analyze actual distances
    return [];
  }

  calculateTransportCosts(routes) {
    // Simplified cost calculation
    return routes.length * 3; // $3 average per route
  }

  generateTransportTips(routes) {
    return [
      'Check for day passes if using public transport multiple times',
      'Allow extra time for first-time routes',
      'Keep alternative transport options in mind'
    ];
  }
}

// Create singleton instance
const navigationService = new NavigationService();

// React hook for navigation service
export const useNavigationService = () => {
  const telemetry = useTelemetry();

  return {
    getNavigationGuidance: async (itinerary, preferences) => {
      const startTime = Date.now();
      try {
        telemetry.trackEvent('navigation_guidance_started', { 
          days: itinerary.itinerary?.length,
          totalActivities: itinerary.itinerary?.reduce((sum, day) => sum + (day.activities?.length || 0), 0)
        });
        
        const guidance = await navigationService.getNavigationGuidance(itinerary, preferences);
        const processingTime = Date.now() - startTime;
        
        telemetry.trackEvent('navigation_guidance_completed', { 
          processingTime,
          totalRoutes: guidance.dailyRoutes?.reduce((sum, day) => sum + (day.routes?.length || 0), 0)
        });
        
        return guidance;
      } catch (error) {
        telemetry.trackError(error, { action: 'getNavigationGuidance' });
        throw error;
      }
    }
  };
};

export default navigationService;
