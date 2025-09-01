import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../service/firebaseConfig';

class PersonalizationService {
  constructor() {
    this.userProfiles = new Map();
    this.recommendations = new Map();
  }

  // Get or create user profile
  async getUserProfile(userId) {
    if (!userId) return this.getDefaultProfile();

    // Check cache first
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId);
    }

    try {
      // Validate userId before using it
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        console.warn('⚠️ Invalid userId provided, using default profile');
        const defaultProfile = this.getDefaultProfile();
        this.userProfiles.set(userId, defaultProfile);
        return defaultProfile;
      }

      const docRef = doc(db, 'userProfiles', userId);
      const docSnap = await getDoc(docRef);
      
      let profile;
      if (docSnap.exists()) {
        profile = docSnap.data();
      } else {
        profile = this.getDefaultProfile();
        await setDoc(docRef, profile);
      }

      // Cache the profile
      this.userProfiles.set(userId, profile);
      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);

      // Enhanced error handling for different Firebase errors
      if (error.message.includes('permissions') ||
          error.message.includes('insufficient') ||
          error.code === 'permission-denied') {
        console.warn('🔒 Firebase permissions issue, using default profile');
      } else if (error.code === 'unavailable') {
        console.warn('🌐 Firebase unavailable, using default profile');
      } else {
        console.warn('⚠️ Firebase error, using default profile:', error.message);
      }

      const defaultProfile = this.getDefaultProfile();
      this.userProfiles.set(userId, defaultProfile);
      return defaultProfile;
    }
  }

  // Initialize user preferences (missing method)
  async initializeUserPreferences(userId) {
    try {
      console.log('🔧 Initializing user preferences for:', userId);
      const profile = await this.getUserProfile(userId);
      return profile;
    } catch (error) {
      console.error('Failed to initialize user preferences:', error);
      return this.getDefaultProfile();
    }
  }

  // Get default user profile
  getDefaultProfile() {
    return {
      preferences: {
        budgetRange: { min: 1000, max: 5000 },
        travelStyle: [],
        interests: [],
        pace: 'moderate',
        accommodation: 'hotel',
        transportation: 'mixed',
        groupSize: 2,
        seasonPreference: null
      },
      history: {
        destinations: [],
        activities: [],
        budgetSpent: [],
        ratings: [],
        completedTrips: 0
      },
      insights: {
        preferredBudgetLevel: 'moderate',
        favoriteCategories: [],
        averageTripDuration: 5,
        preferredPace: 'moderate',
        seasonalPatterns: {},
        destinationTypes: []
      },
      lastUpdated: new Date().toISOString(),
      version: 1
    };
  }

  // Update user profile with new trip data
  async updateUserProfile(userId, tripData, feedback = null) {
    if (!userId) return;

    try {
      const profile = await this.getUserProfile(userId);
      const updatedProfile = this.mergeProfileData(profile, tripData, feedback);
      
      // Update insights
      updatedProfile.insights = this.calculateInsights(updatedProfile);
      updatedProfile.lastUpdated = new Date().toISOString();

      // Save to database
      const docRef = doc(db, 'userProfiles', userId);
      await updateDoc(docRef, updatedProfile);

      // Update cache
      this.userProfiles.set(userId, updatedProfile);

      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Merge new trip data into profile
  mergeProfileData(profile, tripData, feedback) {
    const updated = { ...profile };

    // Update preferences based on trip selections
    if (tripData.budget) {
      updated.preferences.budgetRange = {
        min: Math.min(updated.preferences.budgetRange.min, tripData.budget.min || tripData.budget),
        max: Math.max(updated.preferences.budgetRange.max, tripData.budget.max || tripData.budget)
      };
    }

    if (tripData.travelStyle && tripData.travelStyle.length > 0) {
      updated.preferences.travelStyle = this.mergeArrays(
        updated.preferences.travelStyle, 
        tripData.travelStyle
      );
    }

    if (tripData.interests && tripData.interests.length > 0) {
      updated.preferences.interests = this.mergeArrays(
        updated.preferences.interests, 
        tripData.interests
      );
    }

    if (tripData.pace) {
      updated.preferences.pace = tripData.pace;
    }

    if (tripData.travelers) {
      updated.preferences.groupSize = tripData.travelers;
    }

    // Update history
    if (tripData.destination) {
      updated.history.destinations.push({
        name: tripData.destination.name,
        country: tripData.destination.country,
        visitedAt: new Date().toISOString()
      });
    }

    if (tripData.duration) {
      updated.history.tripDurations = updated.history.tripDurations || [];
      updated.history.tripDurations.push(tripData.duration);
    }

    // Add feedback if provided
    if (feedback) {
      updated.history.ratings.push({
        tripId: tripData.id,
        rating: feedback.rating,
        feedback: feedback.comments,
        createdAt: new Date().toISOString()
      });
    }

    return updated;
  }

  // Calculate user insights from profile data
  calculateInsights(profile) {
    const insights = { ...profile.insights };

    // Calculate preferred budget level
    const avgBudget = (profile.preferences.budgetRange.min + profile.preferences.budgetRange.max) / 2;
    if (avgBudget < 1500) {
      insights.preferredBudgetLevel = 'budget';
    } else if (avgBudget < 5000) {
      insights.preferredBudgetLevel = 'moderate';
    } else {
      insights.preferredBudgetLevel = 'luxury';
    }

    // Calculate favorite categories
    insights.favoriteCategories = this.getTopItems(profile.preferences.interests, 5);

    // Calculate average trip duration
    if (profile.history.tripDurations && profile.history.tripDurations.length > 0) {
      insights.averageTripDuration = Math.round(
        profile.history.tripDurations.reduce((sum, duration) => sum + duration, 0) / 
        profile.history.tripDurations.length
      );
    }

    // Calculate destination patterns
    if (profile.history.destinations && profile.history.destinations.length > 0) {
      const countries = profile.history.destinations.map(d => d.country).filter(Boolean);
      insights.visitedCountries = [...new Set(countries)];
      insights.favoriteRegions = this.analyzeRegionalPreferences(profile.history.destinations);
    }

    // Calculate seasonal patterns
    insights.seasonalPatterns = this.analyzeSeasonalPatterns(profile.history.destinations);

    return insights;
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(userId, tripData) {
    const profile = await this.getUserProfile(userId);
    
    return {
      destinations: this.recommendDestinations(profile, tripData),
      activities: this.recommendActivities(profile, tripData),
      budgetOptimization: this.recommendBudgetOptimization(profile, tripData),
      paceAdjustment: this.recommendPaceAdjustment(profile, tripData),
      seasonalTips: this.getSeasonalRecommendations(profile, tripData)
    };
  }

  // Recommend destinations based on profile
  recommendDestinations(profile, tripData) {
    const recommendations = [];
    
    // Based on previous destinations
    if (profile.history.destinations.length > 0) {
      const visitedCountries = profile.history.destinations.map(d => d.country);
      const uniqueCountries = [...new Set(visitedCountries)];
      
      if (uniqueCountries.length < 3) {
        recommendations.push({
          type: 'explore_new_regions',
          message: 'Consider exploring a new region for diverse experiences',
          suggestions: this.getSuggestedRegions(uniqueCountries)
        });
      }
    }

    // Based on interests
    if (profile.preferences.interests.length > 0) {
      recommendations.push({
        type: 'interest_based',
        message: 'Destinations perfect for your interests',
        suggestions: this.getDestinationsByInterests(profile.preferences.interests)
      });
    }

    // Based on budget
    recommendations.push({
      type: 'budget_optimized',
      message: 'Great value destinations for your budget',
      suggestions: this.getBudgetFriendlyDestinations(profile.preferences.budgetRange)
    });

    return recommendations;
  }

  // Recommend activities based on profile
  recommendActivities(profile, tripData) {
    const recommendations = [];
    
    // Based on interests
    if (profile.preferences.interests.length > 0) {
      recommendations.push({
        type: 'interest_match',
        activities: this.getActivitiesByInterests(profile.preferences.interests, tripData.destination)
      });
    }

    // Based on travel style
    if (profile.preferences.travelStyle.length > 0) {
      recommendations.push({
        type: 'style_match',
        activities: this.getActivitiesByStyle(profile.preferences.travelStyle, tripData.destination)
      });
    }

    // Based on pace preference
    recommendations.push({
      type: 'pace_optimized',
      activities: this.getActivitiesByPace(profile.preferences.pace, tripData.destination)
    });

    return recommendations;
  }

  // Recommend budget optimization
  recommendBudgetOptimization(profile, tripData) {
    const recommendations = [];
    const userBudget = tripData.budget?.max || profile.preferences.budgetRange.max;
    
    // Budget allocation suggestions
    recommendations.push({
      type: 'budget_allocation',
      suggestion: this.getOptimalBudgetAllocation(userBudget, tripData.duration, profile.insights.preferredBudgetLevel)
    });

    // Money-saving tips based on destination
    recommendations.push({
      type: 'money_saving_tips',
      tips: this.getDestinationSpecificSavingTips(tripData.destination, profile.insights.preferredBudgetLevel)
    });

    return recommendations;
  }

  // Helper methods
  mergeArrays(existing, newItems) {
    const combined = [...existing, ...newItems];
    const counts = {};
    
    combined.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  }

  getTopItems(items, limit = 5) {
    const counts = {};
    items.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item);
  }

  analyzeRegionalPreferences(destinations) {
    const regions = {
      'Europe': ['France', 'Italy', 'Spain', 'Germany', 'UK', 'Netherlands', 'Greece'],
      'Asia': ['Japan', 'China', 'Thailand', 'Singapore', 'South Korea', 'India'],
      'North America': ['USA', 'Canada', 'Mexico'],
      'South America': ['Brazil', 'Argentina', 'Chile', 'Peru'],
      'Africa': ['South Africa', 'Morocco', 'Egypt', 'Kenya'],
      'Oceania': ['Australia', 'New Zealand', 'Fiji']
    };

    const regionCounts = {};
    destinations.forEach(dest => {
      if (dest.country) {
        Object.entries(regions).forEach(([region, countries]) => {
          if (countries.includes(dest.country)) {
            regionCounts[region] = (regionCounts[region] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(regionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([region]) => region);
  }

  analyzeSeasonalPatterns(destinations) {
    const patterns = {};
    destinations.forEach(dest => {
      if (dest.visitedAt) {
        const month = new Date(dest.visitedAt).getMonth();
        const season = this.getSeasonFromMonth(month);
        patterns[season] = (patterns[season] || 0) + 1;
      }
    });
    return patterns;
  }

  getSeasonFromMonth(month) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  // Placeholder methods for recommendation logic
  getSuggestedRegions(visitedCountries) {
    return ['Southeast Asia', 'Eastern Europe', 'South America'];
  }

  getDestinationsByInterests(interests) {
    const mapping = {
      'museums': ['Paris', 'Rome', 'London', 'New York'],
      'nature': ['New Zealand', 'Costa Rica', 'Norway', 'Canada'],
      'food': ['Tokyo', 'Bangkok', 'Istanbul', 'Barcelona'],
      'beaches': ['Maldives', 'Bali', 'Santorini', 'Hawaii']
    };

    const suggestions = [];
    interests.forEach(interest => {
      if (mapping[interest]) {
        suggestions.push(...mapping[interest]);
      }
    });

    return [...new Set(suggestions)].slice(0, 5);
  }

  getBudgetFriendlyDestinations(budgetRange) {
    if (budgetRange.max < 2000) {
      return ['Prague', 'Budapest', 'Lisbon', 'Krakow', 'Bangkok'];
    } else if (budgetRange.max < 5000) {
      return ['Barcelona', 'Amsterdam', 'Vienna', 'Tokyo', 'Sydney'];
    } else {
      return ['Paris', 'London', 'New York', 'Dubai', 'Singapore'];
    }
  }

  getActivitiesByInterests(interests, destination) {
    // This would be implemented with real activity data
    return [];
  }

  getActivitiesByStyle(travelStyle, destination) {
    // This would be implemented with real activity data
    return [];
  }

  getActivitiesByPace(pace, destination) {
    // This would be implemented with real activity data
    return [];
  }

  getOptimalBudgetAllocation(totalBudget, duration, budgetLevel) {
    const allocations = {
      'budget': { accommodation: 0.3, food: 0.3, activities: 0.25, transport: 0.15 },
      'moderate': { accommodation: 0.35, food: 0.25, activities: 0.3, transport: 0.1 },
      'luxury': { accommodation: 0.4, food: 0.2, activities: 0.3, transport: 0.1 }
    };

    const allocation = allocations[budgetLevel] || allocations.moderate;
    const dailyBudget = totalBudget / duration;

    return {
      total: totalBudget,
      daily: dailyBudget,
      breakdown: {
        accommodation: Math.round(totalBudget * allocation.accommodation),
        food: Math.round(totalBudget * allocation.food),
        activities: Math.round(totalBudget * allocation.activities),
        transport: Math.round(totalBudget * allocation.transport)
      }
    };
  }

  getDestinationSpecificSavingTips(destination, budgetLevel) {
    // This would return destination-specific money-saving tips
    return [
      'Book accommodations in advance for better rates',
      'Use public transportation instead of taxis',
      'Eat at local restaurants rather than tourist areas',
      'Look for free walking tours and museum days'
    ];
  }

  // Missing methods that are called but not defined
  recommendPaceAdjustment(profile, tripData) {
    const preferredPace = profile.preferences?.pace || 'moderate';

    const recommendations = {
      relaxed: {
        suggestion: 'Take it slow and enjoy each moment',
        tips: ['Plan fewer activities per day', 'Include rest time', 'Choose nearby attractions']
      },
      moderate: {
        suggestion: 'Balance activity and relaxation',
        tips: ['Mix active and leisure activities', 'Plan buffer time', 'Include local experiences']
      },
      active: {
        suggestion: 'Pack in the adventures!',
        tips: ['Early morning starts', 'Multiple activities per day', 'Adventure sports']
      }
    };

    return recommendations[preferredPace] || recommendations.moderate;
  }

  recommendBudgetOptimization(profile, tripData) {
    const budget = tripData.budget || 15000;
    const duration = tripData.duration || 3;
    const dailyBudget = budget / duration;

    const tips = [];

    if (dailyBudget < 2000) {
      tips.push('Use public transport', 'Stay in hostels or budget hotels', 'Eat at local restaurants');
    } else if (dailyBudget < 5000) {
      tips.push('Mix of budget and mid-range options', 'Book accommodations in advance', 'Try local street food');
    } else {
      tips.push('Enjoy premium experiences', 'Consider luxury accommodations', 'Try fine dining');
    }

    return {
      dailyBudget: Math.floor(dailyBudget),
      tips,
      breakdown: {
        accommodation: Math.floor(dailyBudget * 0.4),
        food: Math.floor(dailyBudget * 0.3),
        activities: Math.floor(dailyBudget * 0.2),
        transport: Math.floor(dailyBudget * 0.1)
      }
    };
  }

  getSeasonalRecommendations(profile, tripData) {
    const month = new Date(tripData.startDate || Date.now()).getMonth();
    const season = this.getSeason(month);

    const recommendations = {
      summer: ['Visit hill stations', 'Early morning activities', 'Indoor attractions during peak hours'],
      monsoon: ['Enjoy the greenery', 'Indoor cultural activities', 'Waterfall visits'],
      winter: ['Perfect for sightseeing', 'Outdoor activities', 'Beach destinations'],
      spring: ['Ideal weather for all activities', 'Festival seasons', 'Outdoor adventures']
    };

    return recommendations[season] || recommendations.winter;
  }
}

// Create singleton instance
const personalizationService = new PersonalizationService();

// React hook for personalization service
export const usePersonalizationService = () => {
  // Note: telemetry service not available, using console logging instead

  return {
    getUserProfile: async (userId) => {
      try {
        const profile = await personalizationService.getUserProfile(userId);
        console.log('📊 User profile loaded:', {
          hasHistory: profile.history.destinations.length > 0,
          completedTrips: profile.history.completedTrips
        });
        return profile;
      } catch (error) {
        console.error('❌ Error getting user profile:', error, { action: 'getUserProfile', userId });
        throw error;
      }
    },

    updateUserProfile: async (userId, tripData, feedback) => {
      try {
        const updatedProfile = await personalizationService.updateUserProfile(userId, tripData, feedback);
        console.log('📊 User profile updated:', {
          userId,
          tripId: tripData.id,
          hasFeedback: !!feedback
        });
        return updatedProfile;
      } catch (error) {
        console.error('❌ Error updating user profile:', error, { action: 'updateUserProfile', userId });
        throw error;
      }
    },

    getPersonalizedRecommendations: async (userId, tripData) => {
      try {
        const recommendations = await personalizationService.getPersonalizedRecommendations(userId, tripData);
        console.log('📊 Personalized recommendations generated:', {
          userId,
          recommendationTypes: Object.keys(recommendations)
        });
        return recommendations;
      } catch (error) {
        console.error('❌ Error getting personalized recommendations:', error, { action: 'getPersonalizedRecommendations', userId });
        throw error;
      }
    }
  };
};

export default personalizationService;
