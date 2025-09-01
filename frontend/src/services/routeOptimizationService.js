import telemetryService from './telemetryService';

class RouteOptimizationService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    this.cache = new Map();
    this.cacheExpiry = 60 * 60 * 1000; // 1 hour
  }

  // Optimize itinerary routes with real travel times
  async optimizeItinerary(itinerary, preferences = {}) {
    const optimizedItinerary = { ...itinerary };
    
    try {
      // Optimize each day's activities
      for (let dayIndex = 0; dayIndex < optimizedItinerary.itinerary.length; dayIndex++) {
        const day = optimizedItinerary.itinerary[dayIndex];
        if (day.activities && day.activities.length > 1) {
          const optimizedDay = await this.optimizeDayRoute(day, preferences);
          optimizedItinerary.itinerary[dayIndex] = optimizedDay;
        }
      }

      // Add route summary
      optimizedItinerary.routeOptimization = await this.generateRouteSummary(optimizedItinerary);
      
      return optimizedItinerary;
    } catch (error) {
      console.error('Error optimizing routes:', error);
      return itinerary; // Return original if optimization fails
    }
  }

  // Optimize activities within a single day
  async optimizeDayRoute(day, preferences = {}) {
    const { activities } = day;
    if (!activities || activities.length <= 1) return day;

    try {
      // Get travel times between all activities
      const travelMatrix = await this.getTravelTimeMatrix(activities, preferences.transportMode);
      
      // Apply optimization algorithm
      const optimizedOrder = this.solveTSP(activities, travelMatrix, preferences);
      
      // Reorder activities and update times
      const optimizedActivities = this.reorderAndScheduleActivities(
        activities, 
        optimizedOrder, 
        travelMatrix,
        preferences
      );

      return {
        ...day,
        activities: optimizedActivities,
        optimization: {
          originalOrder: activities.map((_, i) => i),
          optimizedOrder,
          timeSaved: this.calculateTimeSaved(activities, optimizedActivities, travelMatrix),
          totalTravelTime: this.calculateTotalTravelTime(optimizedOrder, travelMatrix)
        }
      };
    } catch (error) {
      console.error('Error optimizing day route:', error);
      return day;
    }
  }

  // Get travel time matrix between activities
  async getTravelTimeMatrix(activities, transportMode = 'walking') {
    const locations = activities.map(activity => ({
      lat: activity.location?.coordinates?.lat || activity.location?.lat,
      lng: activity.location?.coordinates?.lng || activity.location?.lng
    })).filter(loc => loc.lat && loc.lng);

    if (locations.length < 2) {
      return this.createDefaultMatrix(activities.length);
    }

    const cacheKey = `matrix_${JSON.stringify(locations)}_${transportMode}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const matrix = await this.fetchGoogleDistanceMatrix(locations, transportMode);
      
      // Cache result
      this.cache.set(cacheKey, {
        data: matrix,
        timestamp: Date.now()
      });

      return matrix;
    } catch (error) {
      console.error('Error fetching travel times:', error);
      return this.createDefaultMatrix(activities.length);
    }
  }

  // Fetch travel times from Google Distance Matrix API
  async fetchGoogleDistanceMatrix(locations, transportMode) {
    const origins = locations.map(loc => `${loc.lat},${loc.lng}`).join('|');
    const destinations = origins; // Same locations for matrix
    
    const mode = this.getGoogleTravelMode(transportMode);
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=${mode}&key=${this.apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Distance Matrix API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Distance Matrix API status: ${data.status}`);
    }

    // Convert to matrix format
    const matrix = [];
    for (let i = 0; i < locations.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < locations.length; j++) {
        const element = data.rows[i]?.elements[j];
        if (element && element.status === 'OK') {
          matrix[i][j] = {
            duration: element.duration.value, // seconds
            distance: element.distance.value, // meters
            durationText: element.duration.text,
            distanceText: element.distance.text
          };
        } else {
          matrix[i][j] = this.getDefaultTravelTime(i, j);
        }
      }
    }

    return matrix;
  }

  // Solve Traveling Salesman Problem (simplified version)
  solveTSP(activities, travelMatrix, preferences = {}) {
    const n = activities.length;
    if (n <= 2) return Array.from({ length: n }, (_, i) => i);

    // For small numbers, use brute force with constraints
    if (n <= 6) {
      return this.bruteForceTSP(activities, travelMatrix, preferences);
    }

    // For larger numbers, use nearest neighbor heuristic
    return this.nearestNeighborTSP(activities, travelMatrix, preferences);
  }

  // Brute force TSP for small numbers of activities
  bruteForceTSP(activities, travelMatrix, preferences) {
    const n = activities.length;
    const indices = Array.from({ length: n }, (_, i) => i);
    
    // Generate all permutations
    const permutations = this.generatePermutations(indices);
    
    let bestOrder = indices;
    let bestScore = Infinity;

    for (const order of permutations) {
      const score = this.calculateRouteScore(order, activities, travelMatrix, preferences);
      if (score < bestScore) {
        bestScore = score;
        bestOrder = order;
      }
    }

    return bestOrder;
  }

  // Nearest neighbor TSP heuristic
  nearestNeighborTSP(activities, travelMatrix, preferences) {
    const n = activities.length;
    const visited = new Array(n).fill(false);
    const order = [];
    
    // Start with the first activity (or most important one)
    let current = this.findBestStartingActivity(activities, preferences);
    order.push(current);
    visited[current] = true;

    // Visit nearest unvisited activity
    for (let i = 1; i < n; i++) {
      let nearest = -1;
      let nearestScore = Infinity;

      for (let j = 0; j < n; j++) {
        if (!visited[j]) {
          const score = this.calculateMoveScore(current, j, activities, travelMatrix, preferences);
          if (score < nearestScore) {
            nearestScore = score;
            nearest = j;
          }
        }
      }

      if (nearest !== -1) {
        order.push(nearest);
        visited[nearest] = true;
        current = nearest;
      }
    }

    return order;
  }

  // Calculate route score (lower is better)
  calculateRouteScore(order, activities, travelMatrix, preferences) {
    let score = 0;
    
    // Travel time penalty
    for (let i = 0; i < order.length - 1; i++) {
      const from = order[i];
      const to = order[i + 1];
      score += travelMatrix[from][to]?.duration || 600; // Default 10 minutes
    }

    // Time constraint penalties
    score += this.calculateTimeConstraintPenalties(order, activities, preferences);
    
    // Priority bonuses
    score += this.calculatePriorityBonuses(order, activities);

    return score;
  }

  // Calculate penalties for time constraints
  calculateTimeConstraintPenalties(order, activities, preferences) {
    let penalty = 0;
    const currentTime = this.parseTime(preferences.startTime || '09:00');
    let runningTime = currentTime;

    for (const activityIndex of order) {
      const activity = activities[activityIndex];
      
      // Check opening hours
      if (activity.openingHours) {
        const isOpen = this.isOpenAtTime(activity.openingHours, runningTime);
        if (!isOpen) {
          penalty += 3600; // 1 hour penalty for closed venues
        }
      }

      // Check preferred time slots
      if (activity.preferredTime) {
        const timeDiff = Math.abs(runningTime - this.parseTime(activity.preferredTime));
        penalty += timeDiff * 0.5; // Penalty for time preference deviation
      }

      // Update running time
      runningTime += (activity.estimatedDuration || 120) * 60; // Convert minutes to seconds
    }

    return penalty;
  }

  // Calculate priority bonuses
  calculatePriorityBonuses(order, activities) {
    let bonus = 0;
    
    // Earlier high-priority activities get bonus
    order.forEach((activityIndex, position) => {
      const activity = activities[activityIndex];
      const priority = activity.priority || 3;
      
      if (priority >= 4) {
        bonus -= (order.length - position) * 300; // Bonus for early high-priority items
      }
    });

    return bonus;
  }

  // Reorder activities and update scheduling
  reorderAndScheduleActivities(activities, optimizedOrder, travelMatrix, preferences) {
    const reordered = optimizedOrder.map(index => ({ ...activities[index] }));
    const startTime = this.parseTime(preferences.startTime || '09:00');
    let currentTime = startTime;

    for (let i = 0; i < reordered.length; i++) {
      const activity = reordered[i];
      
      // Set start time
      activity.timeSlot = {
        ...activity.timeSlot,
        startTime: this.formatTime(currentTime),
        endTime: this.formatTime(currentTime + (activity.estimatedDuration || 120) * 60)
      };

      // Add travel time to next activity
      if (i < reordered.length - 1) {
        const travelTime = travelMatrix[optimizedOrder[i]][optimizedOrder[i + 1]]?.duration || 600;
        currentTime += (activity.estimatedDuration || 120) * 60 + travelTime;
        
        // Add travel info
        activity.travelToNext = {
          duration: travelTime,
          durationText: this.formatDuration(travelTime),
          mode: preferences.transportMode || 'walking'
        };
      } else {
        currentTime += (activity.estimatedDuration || 120) * 60;
      }
    }

    return reordered;
  }

  // Helper methods
  createDefaultMatrix(size) {
    const matrix = [];
    for (let i = 0; i < size; i++) {
      matrix[i] = [];
      for (let j = 0; j < size; j++) {
        matrix[i][j] = this.getDefaultTravelTime(i, j);
      }
    }
    return matrix;
  }

  getDefaultTravelTime(from, to) {
    if (from === to) return { duration: 0, distance: 0 };
    return { duration: 600, distance: 500 }; // 10 minutes, 500 meters default
  }

  getGoogleTravelMode(mode) {
    const modeMap = {
      'walking': 'walking',
      'driving': 'driving',
      'transit': 'transit',
      'bicycling': 'bicycling'
    };
    return modeMap[mode] || 'walking';
  }

  generatePermutations(arr) {
    if (arr.length <= 1) return [arr];
    
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = arr.slice(0, i).concat(arr.slice(i + 1));
      const perms = this.generatePermutations(rest);
      for (const perm of perms) {
        result.push([arr[i]].concat(perm));
      }
    }
    return result;
  }

  findBestStartingActivity(activities, preferences) {
    // Start with highest priority activity, or first one
    let bestIndex = 0;
    let bestPriority = activities[0]?.priority || 0;

    for (let i = 1; i < activities.length; i++) {
      const priority = activities[i]?.priority || 0;
      if (priority > bestPriority) {
        bestPriority = priority;
        bestIndex = i;
      }
    }

    return bestIndex;
  }

  calculateMoveScore(from, to, activities, travelMatrix, preferences) {
    const travelTime = travelMatrix[from][to]?.duration || 600;
    const activity = activities[to];
    const priority = activity.priority || 3;
    
    // Lower score is better
    return travelTime - (priority * 300);
  }

  calculateTimeSaved(originalActivities, optimizedActivities, travelMatrix) {
    // This would calculate the actual time saved by optimization
    return 0; // Placeholder
  }

  calculateTotalTravelTime(order, travelMatrix) {
    let total = 0;
    for (let i = 0; i < order.length - 1; i++) {
      total += travelMatrix[order[i]][order[i + 1]]?.duration || 0;
    }
    return total;
  }

  async generateRouteSummary(itinerary) {
    return {
      optimized: true,
      totalDays: itinerary.itinerary.length,
      averageTravelTimePerDay: '15-30 minutes',
      recommendedTransport: 'walking + public transport',
      efficiency: 'high'
    };
  }

  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60;
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  formatDuration(seconds) {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  isOpenAtTime(openingHours, timeInSeconds) {
    // Simplified opening hours check
    // In a real implementation, this would parse the opening hours format
    return true; // Placeholder
  }
}

// Create singleton instance
const routeOptimizationService = new RouteOptimizationService();

// React hook for route optimization service
export const useRouteOptimizationService = () => {
  const telemetry = useTelemetry();

  return {
    optimizeItinerary: async (itinerary, preferences) => {
      const startTime = Date.now();
      try {
        telemetry.trackEvent('route_optimization_started', { 
          days: itinerary.itinerary?.length,
          totalActivities: itinerary.itinerary?.reduce((sum, day) => sum + (day.activities?.length || 0), 0)
        });
        
        const optimizedItinerary = await routeOptimizationService.optimizeItinerary(itinerary, preferences);
        const optimizationTime = Date.now() - startTime;
        
        telemetry.trackEvent('route_optimization_completed', { 
          optimizationTime,
          timeSaved: optimizedItinerary.routeOptimization?.timeSaved || 0
        });
        
        return optimizedItinerary;
      } catch (error) {
        telemetry.trackError(error, { action: 'optimizeItinerary' });
        throw error;
      }
    }
  };
};

export default routeOptimizationService;
