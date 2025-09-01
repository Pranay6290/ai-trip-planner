class ExpenseEstimationService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 60 * 60 * 1000; // 1 hour
    
    // Cost data by city tier and category
    this.costDatabase = {
      cityTiers: {
        tier1: { // Major expensive cities (NYC, London, Tokyo, etc.)
          accommodation: { budget: 80, moderate: 150, luxury: 300 },
          food: { budget: 40, moderate: 70, luxury: 120 },
          transport: { daily: 15, taxi: 3.5, uber: 2.8 },
          activities: { free: 0, budget: 15, moderate: 30, premium: 60 }
        },
        tier2: { // Mid-tier cities (Barcelona, Prague, etc.)
          accommodation: { budget: 50, moderate: 100, luxury: 200 },
          food: { budget: 25, moderate: 45, luxury: 80 },
          transport: { daily: 10, taxi: 2.5, uber: 2.0 },
          activities: { free: 0, budget: 10, moderate: 20, premium: 40 }
        },
        tier3: { // Budget-friendly cities (Bangkok, Budapest, etc.)
          accommodation: { budget: 25, moderate: 60, luxury: 120 },
          food: { budget: 15, moderate: 25, luxury: 50 },
          transport: { daily: 5, taxi: 1.5, uber: 1.2 },
          activities: { free: 0, budget: 5, moderate: 15, premium: 25 }
        }
      }
    };
  }

  // Main expense estimation function
  async estimateExpenses(tripData, preferences = {}) {
    const cacheKey = `expenses_${JSON.stringify(tripData)}_${JSON.stringify(preferences)}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const destination = tripData.destination;
      const duration = tripData.duration || tripData.tripLength || 3;
      const travelers = tripData.travelers || 1;
      const places = tripData.places || tripData.itinerary || [];

      // Determine city tier
      const cityTier = this.determineCityTier(destination);
      const costs = this.costDatabase.cityTiers[cityTier];

      // Calculate each expense category
      const accommodation = this.calculateAccommodationCosts(costs, duration, travelers, preferences);
      const food = this.calculateFoodCosts(costs, duration, travelers, preferences);
      const transportation = this.calculateTransportationCosts(costs, duration, travelers, places, preferences);
      const activities = this.calculateActivityCosts(costs, places, travelers, preferences);
      const miscellaneous = this.calculateMiscellaneousCosts(duration, travelers, preferences);

      const totalEstimate = accommodation.total + food.total + transportation.total + activities.total + miscellaneous.total;

      const estimate = {
        total: Math.round(totalEstimate),
        perPerson: Math.round(totalEstimate / travelers),
        perDay: Math.round(totalEstimate / duration),
        confidence: this.calculateConfidence(tripData, preferences),
        breakdown: {
          accommodation,
          food,
          transportation,
          activities,
          miscellaneous
        },
        budgetAlignment: this.analyzeBudgetAlignment(totalEstimate, preferences.budget),
        recommendations: this.generateCostRecommendations(totalEstimate, preferences),
        cityTier,
        currency: 'INR'
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: estimate,
        timestamp: Date.now()
      });

      return estimate;
    } catch (error) {
      console.error('Error estimating expenses:', error);
      throw error;
    }
  }

  // Determine city cost tier
  determineCityTier(destination) {
    const expensiveCities = [
      'new york', 'london', 'tokyo', 'paris', 'zurich', 'geneva', 'oslo',
      'copenhagen', 'sydney', 'singapore', 'hong kong', 'san francisco',
      'los angeles', 'boston', 'washington dc', 'seattle', 'vancouver'
    ];

    const moderateCities = [
      'barcelona', 'madrid', 'rome', 'milan', 'amsterdam', 'berlin',
      'vienna', 'prague', 'dublin', 'edinburgh', 'stockholm', 'helsinki',
      'toronto', 'montreal', 'chicago', 'philadelphia', 'miami', 'las vegas'
    ];

    const cityName = destination.name?.toLowerCase() || '';
    
    if (expensiveCities.some(city => cityName.includes(city))) {
      return 'tier1';
    } else if (moderateCities.some(city => cityName.includes(city))) {
      return 'tier2';
    } else {
      return 'tier3';
    }
  }

  // Calculate accommodation costs
  calculateAccommodationCosts(costs, duration, travelers, preferences) {
    const level = preferences.accommodationLevel || 'moderate';
    const baseRate = costs.accommodation[level];
    
    // Adjust for number of travelers (assume room sharing)
    const rooms = Math.ceil(travelers / 2);
    const totalCost = baseRate * duration * rooms;

    return {
      total: totalCost,
      perNight: baseRate * rooms,
      nights: duration,
      level,
      breakdown: {
        baseRate,
        rooms,
        adjustments: []
      }
    };
  }

  // Calculate food costs
  calculateFoodCosts(costs, duration, travelers, preferences) {
    const level = preferences.foodLevel || 'moderate';
    const baseRate = costs.food[level];
    
    // Adjust based on dining preferences
    let multiplier = 1;
    if (preferences.diningStyle === 'street_food') multiplier = 0.7;
    else if (preferences.diningStyle === 'fine_dining') multiplier = 1.5;
    else if (preferences.diningStyle === 'self_catering') multiplier = 0.5;

    const dailyCost = baseRate * multiplier;
    const totalCost = dailyCost * duration * travelers;

    return {
      total: totalCost,
      perDay: dailyCost * travelers,
      perPerson: dailyCost,
      level,
      breakdown: {
        breakfast: dailyCost * 0.25,
        lunch: dailyCost * 0.35,
        dinner: dailyCost * 0.4
      }
    };
  }

  // Calculate transportation costs
  calculateTransportationCosts(costs, duration, travelers, places, preferences) {
    const mode = preferences.transportMode || 'mixed';
    let dailyTransport = costs.transport.daily;
    
    // Adjust based on transport mode
    if (mode === 'walking') dailyTransport *= 0.3;
    else if (mode === 'taxi') dailyTransport = costs.transport.taxi * 10; // Assume 10 rides per day
    else if (mode === 'uber') dailyTransport = costs.transport.uber * 10;
    else if (mode === 'rental_car') dailyTransport = 40; // Average car rental + gas

    // Add inter-attraction transport based on number of places
    const placesPerDay = places.length / duration;
    const interAttractionCost = placesPerDay * costs.transport.taxi * 0.5;

    const totalDaily = (dailyTransport + interAttractionCost) * travelers;
    const totalCost = totalDaily * duration;

    return {
      total: totalCost,
      perDay: totalDaily,
      mode,
      breakdown: {
        dailyTransport: dailyTransport * travelers * duration,
        interAttraction: interAttractionCost * travelers * duration,
        airportTransfer: 50 * travelers // Estimated
      }
    };
  }

  // Calculate activity costs
  calculateActivityCosts(costs, places, travelers, preferences) {
    let totalCost = 0;
    const breakdown = {
      free: 0,
      budget: 0,
      moderate: 0,
      premium: 0
    };

    places.forEach(place => {
      let activityCost = 0;
      
      // Determine activity cost level based on place type and price level
      if (place.priceLevel === undefined || place.priceLevel === 0) {
        activityCost = costs.activities.free;
        breakdown.free += activityCost;
      } else if (place.priceLevel === 1) {
        activityCost = costs.activities.budget;
        breakdown.budget += activityCost;
      } else if (place.priceLevel === 2) {
        activityCost = costs.activities.moderate;
        breakdown.moderate += activityCost;
      } else {
        activityCost = costs.activities.premium;
        breakdown.premium += activityCost;
      }

      totalCost += activityCost * travelers;
    });

    return {
      total: totalCost,
      perActivity: totalCost / Math.max(places.length, 1),
      breakdown
    };
  }

  // Calculate miscellaneous costs
  calculateMiscellaneousCosts(duration, travelers, preferences) {
    const dailyMisc = 20; // Shopping, tips, emergency fund, etc.
    const totalCost = dailyMisc * duration * travelers;

    return {
      total: totalCost,
      perDay: dailyMisc * travelers,
      breakdown: {
        shopping: totalCost * 0.4,
        tips: totalCost * 0.2,
        emergency: totalCost * 0.2,
        souvenirs: totalCost * 0.2
      }
    };
  }

  // Calculate confidence level of estimate
  calculateConfidence(tripData, preferences) {
    let confidence = 0.7; // Base confidence

    // Increase confidence based on available data
    if (tripData.destination?.name) confidence += 0.1;
    if (tripData.duration) confidence += 0.1;
    if (tripData.places?.length > 0) confidence += 0.1;
    if (preferences.accommodationLevel) confidence += 0.05;
    if (preferences.foodLevel) confidence += 0.05;

    return Math.min(confidence, 0.95);
  }

  // Analyze budget alignment
  analyzeBudgetAlignment(estimate, budget) {
    if (!budget || !budget.total) {
      return {
        status: 'unknown',
        message: 'No budget specified for comparison'
      };
    }

    const difference = budget.total - estimate;
    const percentageDiff = (difference / budget.total) * 100;

    if (percentageDiff > 20) {
      return {
        status: 'under_budget',
        difference: Math.abs(difference),
        percentage: Math.abs(percentageDiff),
        message: `You're ${Math.round(Math.abs(percentageDiff))}% under budget! Consider upgrading experiences.`
      };
    } else if (percentageDiff < -20) {
      return {
        status: 'over_budget',
        difference: Math.abs(difference),
        percentage: Math.abs(percentageDiff),
        message: `You're ${Math.round(Math.abs(percentageDiff))}% over budget. Consider cost-saving options.`
      };
    } else {
      return {
        status: 'on_budget',
        difference: Math.abs(difference),
        percentage: Math.abs(percentageDiff),
        message: 'Your estimate aligns well with your budget!'
      };
    }
  }

  // Generate cost-saving or upgrade recommendations
  generateCostRecommendations(estimate, preferences) {
    const recommendations = [];

    // Accommodation recommendations
    if (preferences.accommodationLevel === 'luxury') {
      recommendations.push({
        category: 'accommodation',
        type: 'cost_saving',
        message: 'Consider moderate accommodation to save up to 50%',
        savings: estimate * 0.15
      });
    } else if (preferences.accommodationLevel === 'budget') {
      recommendations.push({
        category: 'accommodation',
        type: 'upgrade',
        message: 'Upgrade to moderate accommodation for better comfort',
        cost: estimate * 0.1
      });
    }

    // Food recommendations
    if (preferences.foodLevel === 'luxury') {
      recommendations.push({
        category: 'food',
        type: 'cost_saving',
        message: 'Mix fine dining with local eateries to save 30%',
        savings: estimate * 0.12
      });
    }

    // Transport recommendations
    if (preferences.transportMode === 'taxi') {
      recommendations.push({
        category: 'transportation',
        type: 'cost_saving',
        message: 'Use public transport to save up to 70%',
        savings: estimate * 0.08
      });
    }

    return recommendations;
  }

  // Get detailed cost breakdown for specific categories
  getDetailedBreakdown(estimate, category) {
    const breakdown = estimate.breakdown[category];
    if (!breakdown) return null;

    return {
      category,
      ...breakdown,
      percentage: (breakdown.total / estimate.total) * 100,
      recommendations: estimate.recommendations.filter(r => r.category === category)
    };
  }

  // Compare costs between different preference options
  compareOptions(tripData, optionsArray) {
    const comparisons = [];

    optionsArray.forEach(async (options, index) => {
      const estimate = await this.estimateExpenses(tripData, options);
      comparisons.push({
        option: index + 1,
        preferences: options,
        estimate,
        savings: index > 0 ? comparisons[0].estimate.total - estimate.total : 0
      });
    });

    return comparisons;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export default new ExpenseEstimationService();
