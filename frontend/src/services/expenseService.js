import { useTelemetry } from './telemetryService';

class ExpenseService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    this.exchangeRates = new Map();
    this.lastRateUpdate = null;
  }

  // Calculate comprehensive trip expenses
  async calculateTripExpenses(tripData, itinerary) {
    try {
      const destination = tripData.destination?.name || tripData.destination?.label;
      const duration = tripData.duration || itinerary.itinerary?.length || 5;
      const travelers = tripData.travelers || 2;
      const budgetLevel = this.getBudgetLevel(tripData.budget);

      // Get destination cost data
      const destinationCosts = await this.getDestinationCosts(destination);
      
      // Calculate category expenses
      const expenses = {
        accommodation: await this.calculateAccommodationCosts(destination, duration, travelers, budgetLevel),
        food: await this.calculateFoodCosts(destination, duration, travelers, budgetLevel, itinerary),
        transportation: await this.calculateTransportationCosts(destination, duration, travelers, budgetLevel, itinerary),
        activities: await this.calculateActivityCosts(itinerary, budgetLevel),
        shopping: await this.calculateShoppingCosts(destination, duration, travelers, budgetLevel),
        miscellaneous: await this.calculateMiscellaneousCosts(destination, duration, travelers, budgetLevel)
      };

      // Calculate totals and confidence intervals
      const totalEstimate = Object.values(expenses).reduce((sum, category) => sum + category.estimate, 0);
      const totalMin = Object.values(expenses).reduce((sum, category) => sum + category.min, 0);
      const totalMax = Object.values(expenses).reduce((sum, category) => sum + category.max, 0);

      // Compare with user budget
      const budgetAnalysis = this.analyzeBudgetAlignment(
        { min: totalMin, estimate: totalEstimate, max: totalMax },
        tripData.budget
      );

      return {
        total: {
          estimate: Math.round(totalEstimate),
          min: Math.round(totalMin),
          max: Math.round(totalMax),
          currency: 'INR',
          confidence: this.calculateConfidence(destinationCosts, itinerary)
        },
        breakdown: expenses,
        dailyAverage: Math.round(totalEstimate / duration),
        perPerson: Math.round(totalEstimate / travelers),
        budgetAnalysis,
        recommendations: this.generateBudgetRecommendations(expenses, budgetAnalysis, tripData),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating trip expenses:', error);
      return this.getFallbackExpenseEstimate(tripData);
    }
  }

  // Get destination-specific cost data
  async getDestinationCosts(destination) {
    const cacheKey = `destination_costs_${destination}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      // In a real implementation, this would fetch from cost-of-living APIs
      const costs = this.getDestinationCostData(destination);
      
      this.cache.set(cacheKey, {
        data: costs,
        timestamp: Date.now()
      });

      return costs;
    } catch (error) {
      console.error('Error fetching destination costs:', error);
      return this.getDefaultCostData();
    }
  }

  // Calculate accommodation costs
  async calculateAccommodationCosts(destination, duration, travelers, budgetLevel) {
    const costs = await this.getDestinationCosts(destination);
    const baseRate = costs.accommodation[budgetLevel] || costs.accommodation.moderate;
    
    // Adjust for group size (assume double occupancy)
    const rooms = Math.ceil(travelers / 2);
    const totalCost = baseRate * duration * rooms;

    return {
      category: 'accommodation',
      estimate: totalCost,
      min: totalCost * 0.7,
      max: totalCost * 1.4,
      breakdown: {
        baseRate: baseRate,
        nights: duration,
        rooms: rooms,
        taxes: totalCost * 0.15
      },
      tips: this.getAccommodationTips(budgetLevel, destination)
    };
  }

  // Calculate food costs
  async calculateFoodCosts(destination, duration, travelers, budgetLevel, itinerary) {
    const costs = await this.getDestinationCosts(destination);
    const dailyFoodCost = costs.food[budgetLevel] || costs.food.moderate;
    
    // Count restaurant meals in itinerary
    let plannedMeals = 0;
    if (itinerary?.itinerary) {
      itinerary.itinerary.forEach(day => {
        if (day.meals) {
          plannedMeals += Object.keys(day.meals).length;
        }
      });
    }

    const totalMeals = duration * 3; // 3 meals per day
    const casualMeals = totalMeals - plannedMeals;
    
    const restaurantCost = plannedMeals * dailyFoodCost * 1.5; // Restaurant premium
    const casualCost = casualMeals * dailyFoodCost * 0.7; // Casual dining
    const totalCost = (restaurantCost + casualCost) * travelers;

    return {
      category: 'food',
      estimate: totalCost,
      min: totalCost * 0.6,
      max: totalCost * 1.8,
      breakdown: {
        restaurantMeals: restaurantCost * travelers,
        casualMeals: casualCost * travelers,
        plannedMeals: plannedMeals,
        casualMeals: casualMeals
      },
      tips: this.getFoodTips(budgetLevel, destination)
    };
  }

  // Calculate transportation costs
  async calculateTransportationCosts(destination, duration, travelers, budgetLevel, itinerary) {
    const costs = await this.getDestinationCosts(destination);
    
    // Airport transfers
    const airportTransfer = costs.transportation.airportTransfer * 2; // Round trip
    
    // Daily local transport
    const dailyTransport = costs.transportation.daily[budgetLevel] || costs.transportation.daily.moderate;
    const localTransport = dailyTransport * duration * travelers;
    
    // Inter-city transport (if multiple cities)
    const intercityTransport = this.calculateIntercityTransport(itinerary, costs);
    
    const totalCost = airportTransfer + localTransport + intercityTransport;

    return {
      category: 'transportation',
      estimate: totalCost,
      min: totalCost * 0.8,
      max: totalCost * 1.5,
      breakdown: {
        airportTransfer: airportTransfer,
        localTransport: localTransport,
        intercityTransport: intercityTransport
      },
      tips: this.getTransportationTips(budgetLevel, destination)
    };
  }

  // Calculate activity costs
  async calculateActivityCosts(itinerary, budgetLevel) {
    let totalCost = 0;
    const activities = [];

    if (itinerary?.itinerary) {
      itinerary.itinerary.forEach(day => {
        if (day.activities) {
          day.activities.forEach(activity => {
            const cost = activity.cost?.amount || this.estimateActivityCost(activity, budgetLevel);
            totalCost += cost;
            activities.push({
              name: activity.name,
              cost: cost,
              type: activity.type
            });
          });
        }
      });
    }

    return {
      category: 'activities',
      estimate: totalCost,
      min: totalCost * 0.7,
      max: totalCost * 1.3,
      breakdown: {
        activities: activities,
        averagePerActivity: activities.length > 0 ? totalCost / activities.length : 0
      },
      tips: this.getActivityTips(budgetLevel)
    };
  }

  // Calculate shopping costs
  async calculateShoppingCosts(destination, duration, travelers, budgetLevel) {
    const costs = await this.getDestinationCosts(destination);
    const dailyShopping = costs.shopping[budgetLevel] || costs.shopping.moderate;
    const totalCost = dailyShopping * duration * travelers;

    return {
      category: 'shopping',
      estimate: totalCost,
      min: totalCost * 0.3,
      max: totalCost * 3,
      breakdown: {
        souvenirs: totalCost * 0.6,
        clothing: totalCost * 0.3,
        gifts: totalCost * 0.1
      },
      tips: this.getShoppingTips(budgetLevel, destination)
    };
  }

  // Calculate miscellaneous costs
  async calculateMiscellaneousCosts(destination, duration, travelers, budgetLevel) {
    const costs = await this.getDestinationCosts(destination);
    const dailyMisc = costs.miscellaneous[budgetLevel] || costs.miscellaneous.moderate;
    const totalCost = dailyMisc * duration * travelers;

    return {
      category: 'miscellaneous',
      estimate: totalCost,
      min: totalCost * 0.5,
      max: totalCost * 2,
      breakdown: {
        tips: totalCost * 0.4,
        emergencies: totalCost * 0.3,
        communications: totalCost * 0.2,
        other: totalCost * 0.1
      },
      tips: this.getMiscellaneousTips(budgetLevel)
    };
  }

  // Analyze budget alignment
  analyzeBudgetAlignment(estimate, userBudget) {
    if (!userBudget || (!userBudget.max && !userBudget.total)) {
      return {
        status: 'unknown',
        message: 'No budget specified',
        difference: 0,
        recommendations: []
      };
    }

    const budgetAmount = userBudget.max || userBudget.total || userBudget;
    const difference = budgetAmount - estimate.estimate;
    const percentageDiff = (difference / budgetAmount) * 100;

    let status, message;
    if (percentageDiff > 20) {
      status = 'under_budget';
      message = `You're ${Math.round(Math.abs(percentageDiff))}% under budget. Consider upgrading experiences!`;
    } else if (percentageDiff > -10) {
      status = 'on_budget';
      message = 'Your budget aligns well with estimated costs.';
    } else if (percentageDiff > -30) {
      status = 'over_budget';
      message = `You're ${Math.round(Math.abs(percentageDiff))}% over budget. Consider some adjustments.`;
    } else {
      status = 'significantly_over';
      message = `Estimated costs are ${Math.round(Math.abs(percentageDiff))}% over your budget.`;
    }

    return {
      status,
      message,
      difference: Math.round(difference),
      percentageDiff: Math.round(percentageDiff),
      recommendations: this.getBudgetAdjustmentRecommendations(status, difference, estimate)
    };
  }

  // Generate budget recommendations
  generateBudgetRecommendations(expenses, budgetAnalysis, tripData) {
    const recommendations = [];

    // Category-specific recommendations
    Object.entries(expenses).forEach(([category, data]) => {
      if (data.tips && data.tips.length > 0) {
        recommendations.push({
          category,
          type: 'savings',
          tips: data.tips
        });
      }
    });

    // Budget alignment recommendations
    if (budgetAnalysis.recommendations) {
      recommendations.push(...budgetAnalysis.recommendations);
    }

    // Seasonal recommendations
    recommendations.push({
      category: 'timing',
      type: 'seasonal',
      tips: this.getSeasonalSavingTips(tripData.destination)
    });

    return recommendations;
  }

  // Helper methods
  getBudgetLevel(budget) {
    if (!budget) return 'moderate';
    const amount = budget.max || budget.total || budget;
    if (amount < 1500) return 'budget';
    if (amount < 5000) return 'moderate';
    return 'luxury';
  }

  getDestinationCostData(destination) {
    // This would be replaced with real cost data from APIs
    const defaultCosts = {
      accommodation: {
        budget: 50,
        moderate: 120,
        luxury: 300
      },
      food: {
        budget: 25,
        moderate: 50,
        luxury: 100
      },
      transportation: {
        airportTransfer: 30,
        daily: {
          budget: 10,
          moderate: 20,
          luxury: 50
        }
      },
      shopping: {
        budget: 20,
        moderate: 50,
        luxury: 150
      },
      miscellaneous: {
        budget: 15,
        moderate: 30,
        luxury: 75
      }
    };

    // Adjust costs based on destination
    const multipliers = {
      'tokyo': 1.4,
      'london': 1.3,
      'new york': 1.3,
      'paris': 1.2,
      'dubai': 1.2,
      'bangkok': 0.6,
      'prague': 0.7,
      'budapest': 0.6
    };

    const multiplier = multipliers[destination?.toLowerCase()] || 1.0;
    
    // Apply multiplier to all costs
    const adjustedCosts = JSON.parse(JSON.stringify(defaultCosts));
    Object.keys(adjustedCosts).forEach(category => {
      if (typeof adjustedCosts[category] === 'object') {
        Object.keys(adjustedCosts[category]).forEach(subcategory => {
          if (typeof adjustedCosts[category][subcategory] === 'object') {
            Object.keys(adjustedCosts[category][subcategory]).forEach(level => {
              adjustedCosts[category][subcategory][level] *= multiplier;
            });
          } else {
            adjustedCosts[category][subcategory] *= multiplier;
          }
        });
      }
    });

    return adjustedCosts;
  }

  getDefaultCostData() {
    return this.getDestinationCostData('default');
  }

  estimateActivityCost(activity, budgetLevel) {
    const baseCosts = {
      budget: { attraction: 15, restaurant: 25, experience: 40 },
      moderate: { attraction: 25, restaurant: 45, experience: 75 },
      luxury: { attraction: 50, restaurant: 100, experience: 150 }
    };

    const costs = baseCosts[budgetLevel] || baseCosts.moderate;
    return costs[activity.type] || costs.attraction;
  }

  calculateIntercityTransport(itinerary, costs) {
    // Simplified - would analyze if multiple cities are visited
    return 0;
  }

  calculateConfidence(destinationCosts, itinerary) {
    let confidence = 0.7; // Base confidence
    
    // Higher confidence if we have detailed itinerary
    if (itinerary?.itinerary && itinerary.itinerary.length > 0) {
      confidence += 0.2;
    }
    
    // Higher confidence for well-known destinations
    if (destinationCosts && Object.keys(destinationCosts).length > 0) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  getFallbackExpenseEstimate(tripData) {
    const duration = tripData.duration || 5;
    const travelers = tripData.travelers || 2;
    const dailyBudget = 100; // Default daily budget per person
    
    const total = dailyBudget * duration * travelers;
    
    return {
      total: {
        estimate: total,
        min: total * 0.7,
        max: total * 1.5,
        currency: 'INR',
        confidence: 0.5
      },
      breakdown: {
        accommodation: { estimate: total * 0.35 },
        food: { estimate: total * 0.25 },
        transportation: { estimate: total * 0.15 },
        activities: { estimate: total * 0.15 },
        shopping: { estimate: total * 0.05 },
        miscellaneous: { estimate: total * 0.05 }
      },
      dailyAverage: dailyBudget * travelers,
      perPerson: total / travelers,
      budgetAnalysis: { status: 'unknown', message: 'Estimate based on average costs' },
      recommendations: [],
      lastUpdated: new Date().toISOString()
    };
  }

  // Tip generation methods
  getAccommodationTips(budgetLevel, destination) {
    const tips = {
      budget: [
        'Book hostels or budget hotels in advance',
        'Consider staying slightly outside city center',
        'Look for accommodations with kitchen facilities'
      ],
      moderate: [
        'Book 2-3 months in advance for better rates',
        'Consider boutique hotels for unique experiences',
        'Check for package deals including breakfast'
      ],
      luxury: [
        'Book directly with hotels for potential upgrades',
        'Consider loyalty programs for perks',
        'Look for suites during off-peak seasons'
      ]
    };
    return tips[budgetLevel] || tips.moderate;
  }

  getFoodTips(budgetLevel, destination) {
    return [
      'Try local street food for authentic experiences',
      'Look for lunch specials at upscale restaurants',
      'Visit local markets for fresh ingredients',
      'Ask locals for restaurant recommendations'
    ];
  }

  getTransportationTips(budgetLevel, destination) {
    return [
      'Use public transportation for cost savings',
      'Consider day passes for multiple trips',
      'Walk when possible to explore neighborhoods',
      'Book airport transfers in advance'
    ];
  }

  getActivityTips(budgetLevel) {
    return [
      'Look for free walking tours',
      'Check for museum free days',
      'Book activities online for discounts',
      'Consider city tourist cards for multiple attractions'
    ];
  }

  getShoppingTips(budgetLevel, destination) {
    return [
      'Shop at local markets for better prices',
      'Avoid tourist shopping areas',
      'Negotiate prices where appropriate',
      'Check duty-free allowances'
    ];
  }

  getMiscellaneousTips(budgetLevel) {
    return [
      'Keep emergency cash separate',
      'Use local SIM cards for cheaper communication',
      'Tip according to local customs',
      'Keep receipts for expense tracking'
    ];
  }

  getBudgetAdjustmentRecommendations(status, difference, estimate) {
    const recommendations = [];
    
    if (status === 'over_budget' || status === 'significantly_over') {
      recommendations.push({
        type: 'reduce_accommodation',
        message: 'Consider lower-tier accommodations',
        savings: Math.round(estimate.breakdown.accommodation?.estimate * 0.3)
      });
      
      recommendations.push({
        type: 'reduce_activities',
        message: 'Focus on free or low-cost activities',
        savings: Math.round(estimate.breakdown.activities?.estimate * 0.4)
      });
    }
    
    if (status === 'under_budget') {
      recommendations.push({
        type: 'upgrade_accommodation',
        message: 'Consider upgrading to better hotels',
        cost: Math.round(difference * 0.4)
      });
      
      recommendations.push({
        type: 'add_experiences',
        message: 'Add premium experiences or tours',
        cost: Math.round(difference * 0.3)
      });
    }
    
    return recommendations;
  }

  getSeasonalSavingTips(destination) {
    return [
      'Travel during shoulder seasons for better rates',
      'Avoid major holidays and festivals',
      'Book flights on weekdays for lower prices',
      'Consider weather patterns for activity planning'
    ];
  }
}

// Create singleton instance
const expenseService = new ExpenseService();

// React hook for expense service
export const useExpenseService = () => {
  const telemetry = useTelemetry();

  return {
    calculateTripExpenses: async (tripData, itinerary) => {
      const startTime = Date.now();
      try {
        telemetry.trackEvent('expense_calculation_started', { 
          destination: tripData.destination?.name,
          duration: tripData.duration,
          travelers: tripData.travelers
        });
        
        const expenses = await expenseService.calculateTripExpenses(tripData, itinerary);
        const calculationTime = Date.now() - startTime;
        
        telemetry.trackEvent('expense_calculation_completed', { 
          calculationTime,
          totalEstimate: expenses.total.estimate,
          confidence: expenses.total.confidence,
          budgetStatus: expenses.budgetAnalysis.status
        });
        
        return expenses;
      } catch (error) {
        telemetry.trackError(error, { action: 'calculateTripExpenses', tripData });
        throw error;
      }
    }
  };
};

export default expenseService;
