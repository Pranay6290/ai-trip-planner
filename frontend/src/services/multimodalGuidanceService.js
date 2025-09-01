import placesService from './placesService';

class MultimodalGuidanceService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
    this.supportedModes = ['walking', 'driving', 'transit', 'bicycling'];
  }

  // Get multimodal directions between places
  async getMultimodalDirections(origin, destination, modes = ['walking', 'transit']) {
    const cacheKey = `directions_${JSON.stringify(origin)}_${JSON.stringify(destination)}_${modes.join(',')}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const directionsPromises = modes.map(mode => 
        this.getDirectionsForMode(origin, destination, mode)
      );

      const allDirections = await Promise.allSettled(directionsPromises);
      
      const validDirections = allDirections
        .filter(result => result.status === 'fulfilled' && result.value)
        .map((result, index) => ({
          mode: modes[index],
          ...result.value
        }));

      const comparison = this.compareTransportModes(validDirections);
      
      const result = {
        directions: validDirections,
        comparison,
        recommendation: this.getRecommendedMode(validDirections),
        lastUpdated: new Date().toISOString()
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Error getting multimodal directions:', error);
      throw error;
    }
  }

  // Get directions for a specific transport mode
  async getDirectionsForMode(origin, destination, mode) {
    try {
      const directions = await placesService.getDirections(origin, destination, mode);
      
      if (!directions || !directions.routes || directions.routes.length === 0) {
        return null;
      }

      const route = directions.routes[0];
      const leg = route.legs[0];

      return {
        duration: leg.duration.value, // seconds
        distance: leg.distance.value, // meters
        durationText: leg.duration.text,
        distanceText: leg.distance.text,
        steps: this.processSteps(leg.steps, mode),
        polyline: route.overview_polyline?.points,
        warnings: route.warnings || [],
        copyrights: route.copyrights,
        fare: route.fare || null,
        summary: route.summary
      };
    } catch (error) {
      console.error(`Error getting ${mode} directions:`, error);
      return null;
    }
  }

  // Process and enhance direction steps
  processSteps(steps, mode) {
    return steps.map((step, index) => ({
      stepNumber: index + 1,
      instruction: step.html_instructions?.replace(/<[^>]*>/g, '') || step.instructions,
      distance: step.distance.text,
      duration: step.duration.text,
      maneuver: step.maneuver,
      startLocation: step.start_location,
      endLocation: step.end_location,
      polyline: step.polyline?.points,
      travelMode: step.travel_mode || mode.toUpperCase(),
      transitDetails: step.transit_details ? this.processTransitDetails(step.transit_details) : null
    }));
  }

  // Process transit-specific details
  processTransitDetails(transitDetails) {
    return {
      line: {
        name: transitDetails.line?.name,
        shortName: transitDetails.line?.short_name,
        color: transitDetails.line?.color,
        vehicle: transitDetails.line?.vehicle?.name
      },
      departureStop: {
        name: transitDetails.departure_stop?.name,
        location: transitDetails.departure_stop?.location
      },
      arrivalStop: {
        name: transitDetails.arrival_stop?.name,
        location: transitDetails.arrival_stop?.location
      },
      departureTime: transitDetails.departure_time?.text,
      arrivalTime: transitDetails.arrival_time?.text,
      headsign: transitDetails.headsign,
      numStops: transitDetails.num_stops
    };
  }

  // Compare different transport modes
  compareTransportModes(directions) {
    if (directions.length === 0) return null;

    const comparison = {
      fastest: null,
      shortest: null,
      cheapest: null,
      mostEcoFriendly: null,
      summary: {}
    };

    // Find fastest route
    const fastestRoute = directions.reduce((prev, current) => 
      prev.duration < current.duration ? prev : current
    );
    comparison.fastest = { mode: fastestRoute.mode, duration: fastestRoute.durationText };

    // Find shortest route
    const shortestRoute = directions.reduce((prev, current) => 
      prev.distance < current.distance ? prev : current
    );
    comparison.shortest = { mode: shortestRoute.mode, distance: shortestRoute.distanceText };

    // Estimate costs and eco-friendliness
    directions.forEach(direction => {
      const cost = this.estimateCost(direction);
      const ecoScore = this.calculateEcoScore(direction.mode);
      
      comparison.summary[direction.mode] = {
        duration: direction.durationText,
        distance: direction.distanceText,
        estimatedCost: cost,
        ecoScore,
        pros: this.getModePros(direction.mode),
        cons: this.getModeCons(direction.mode)
      };

      // Track cheapest
      if (!comparison.cheapest || cost < comparison.cheapest.cost) {
        comparison.cheapest = { mode: direction.mode, cost };
      }

      // Track most eco-friendly
      if (!comparison.mostEcoFriendly || ecoScore > comparison.mostEcoFriendly.score) {
        comparison.mostEcoFriendly = { mode: direction.mode, score: ecoScore };
      }
    });

    return comparison;
  }

  // Estimate cost for different transport modes
  estimateCost(direction) {
    const mode = direction.mode;
    const distanceKm = direction.distance / 1000;

    switch (mode) {
      case 'walking':
        return 0;
      case 'bicycling':
        return 0; // Assuming own bike
      case 'transit':
        return direction.fare ? parseFloat(direction.fare.value) : Math.max(2, distanceKm * 0.5);
      case 'driving':
        return distanceKm * 0.3; // Rough estimate including gas and parking
      default:
        return 0;
    }
  }

  // Calculate eco-friendliness score (0-10)
  calculateEcoScore(mode) {
    const scores = {
      walking: 10,
      bicycling: 9,
      transit: 7,
      driving: 3
    };
    return scores[mode] || 5;
  }

  // Get pros for each transport mode
  getModePros(mode) {
    const pros = {
      walking: ['Free', 'Healthy', 'Eco-friendly', 'See more details'],
      bicycling: ['Fast for short distances', 'Eco-friendly', 'Healthy', 'Flexible'],
      transit: ['Cost-effective', 'No parking needed', 'Relaxing', 'Eco-friendly'],
      driving: ['Flexible timing', 'Direct route', 'Comfortable', 'Good for groups']
    };
    return pros[mode] || [];
  }

  // Get cons for each transport mode
  getModeCons(mode) {
    const cons = {
      walking: ['Slow for long distances', 'Weather dependent', 'Can be tiring'],
      bicycling: ['Weather dependent', 'Need bike', 'Traffic safety', 'Limited storage'],
      transit: ['Fixed schedules', 'Potential delays', 'Crowded', 'Limited coverage'],
      driving: ['Parking costs', 'Traffic', 'Expensive', 'Environmental impact']
    };
    return cons[mode] || [];
  }

  // Get recommended transport mode based on various factors
  getRecommendedMode(directions) {
    if (directions.length === 0) return null;

    // Score each mode based on multiple factors
    const scores = directions.map(direction => {
      let score = 0;
      const distanceKm = direction.distance / 1000;
      const durationMinutes = direction.duration / 60;

      // Distance-based scoring
      if (distanceKm < 1) {
        score += direction.mode === 'walking' ? 10 : 5;
      } else if (distanceKm < 5) {
        score += direction.mode === 'bicycling' ? 10 : direction.mode === 'transit' ? 8 : 6;
      } else {
        score += direction.mode === 'transit' ? 10 : direction.mode === 'driving' ? 8 : 3;
      }

      // Time efficiency scoring
      if (durationMinutes < 15) {
        score += 5;
      } else if (durationMinutes < 30) {
        score += 3;
      } else {
        score += 1;
      }

      // Cost scoring (inverse - lower cost = higher score)
      const cost = this.estimateCost(direction);
      score += cost === 0 ? 5 : cost < 5 ? 3 : 1;

      // Eco-friendliness scoring
      score += this.calculateEcoScore(direction.mode) / 2;

      return {
        mode: direction.mode,
        score,
        direction
      };
    });

    const recommended = scores.reduce((prev, current) => 
      prev.score > current.score ? prev : current
    );

    return {
      mode: recommended.mode,
      reason: this.getRecommendationReason(recommended.direction, scores),
      confidence: this.calculateRecommendationConfidence(scores)
    };
  }

  // Get reason for recommendation
  getRecommendationReason(direction, allScores) {
    const mode = direction.mode;
    const distanceKm = direction.distance / 1000;
    const durationMinutes = direction.duration / 60;

    if (mode === 'walking' && distanceKm < 1) {
      return 'Short distance - walking is healthy and free';
    } else if (mode === 'bicycling' && distanceKm < 5) {
      return 'Perfect distance for cycling - fast and eco-friendly';
    } else if (mode === 'transit') {
      return 'Public transit offers good balance of cost and convenience';
    } else if (mode === 'driving') {
      return 'Driving provides flexibility and comfort for this route';
    } else {
      return 'Best overall option considering distance, time, and cost';
    }
  }

  // Calculate confidence in recommendation
  calculateRecommendationConfidence(scores) {
    if (scores.length < 2) return 0.5;

    const sortedScores = scores.sort((a, b) => b.score - a.score);
    const topScore = sortedScores[0].score;
    const secondScore = sortedScores[1].score;
    
    const scoreDifference = topScore - secondScore;
    return Math.min(0.95, 0.5 + (scoreDifference / 20));
  }

  // Get live ETAs for all modes
  async getLiveETAs(origin, destination, modes = ['walking', 'transit', 'driving']) {
    try {
      const etaPromises = modes.map(async mode => {
        const directions = await this.getDirectionsForMode(origin, destination, mode);
        return {
          mode,
          eta: directions ? directions.duration : null,
          etaText: directions ? directions.durationText : 'N/A',
          lastUpdated: new Date().toISOString()
        };
      });

      const etas = await Promise.all(etaPromises);
      return etas.filter(eta => eta.eta !== null);
    } catch (error) {
      console.error('Error getting live ETAs:', error);
      return [];
    }
  }

  // Get step-by-step navigation for a specific mode
  async getStepByStepNavigation(origin, destination, mode) {
    const directions = await this.getDirectionsForMode(origin, destination, mode);
    
    if (!directions) {
      throw new Error(`No directions available for ${mode}`);
    }

    return {
      mode,
      totalDuration: directions.durationText,
      totalDistance: directions.distanceText,
      steps: directions.steps,
      overview: {
        startAddress: `${origin.lat}, ${origin.lng}`,
        endAddress: `${destination.lat}, ${destination.lng}`,
        summary: directions.summary
      },
      navigation: {
        currentStep: 0,
        completed: false,
        startTime: new Date().toISOString()
      }
    };
  }

  // Update navigation progress
  updateNavigationProgress(navigation, currentLocation) {
    // This would typically use GPS location to determine progress
    // For now, we'll provide a structure for tracking progress
    
    const updatedNavigation = { ...navigation };
    
    // Calculate distance to next step
    const nextStep = navigation.steps[navigation.navigation.currentStep];
    if (nextStep) {
      const distanceToNext = this.calculateDistance(
        currentLocation,
        nextStep.startLocation
      );
      
      // If close to next step (within 50 meters), advance
      if (distanceToNext < 0.05) { // 50 meters in km
        updatedNavigation.navigation.currentStep++;
        
        if (updatedNavigation.navigation.currentStep >= navigation.steps.length) {
          updatedNavigation.navigation.completed = true;
        }
      }
    }
    
    return updatedNavigation;
  }

  // Calculate distance between two points
  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLon = this.toRad(point2.lng - point1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(point1.lat)) * Math.cos(this.toRad(point2.lat)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export default new MultimodalGuidanceService();
