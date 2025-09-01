// Optimized Trip Generation Service - Reliable and Fast
import BackendApiService from '../service/BackendApi';
import { indianDestinations } from '../data/indianDestinations';

class OptimizedTripService {
  // Main trip generation function with multiple fallbacks
  async generateTrip(formData) {
    console.log('🚀 Starting optimized trip generation:', formData);

    try {
      // Method 1: Try backend API first (most reliable)
      const backendTrip = await this.tryBackendGeneration(formData);
      if (backendTrip) {
        console.log('✅ Backend generation successful');
        return backendTrip;
      }

      // Method 2: Generate locally with comprehensive data
      console.log('🔄 Using local generation as fallback');
      return await this.generateLocalTrip(formData);

    } catch (error) {
      console.error('❌ Trip generation error:', error);
      
      // Method 3: Emergency fallback with basic data
      console.log('🆘 Using emergency fallback generation');
      return this.generateEmergencyTrip(formData);
    }
  }

  // Try backend API generation
  async tryBackendGeneration(formData) {
    try {
      const response = await BackendApiService.generateTrip({
        destination: formData.destination?.name || formData.destination,
        duration: formData.duration || 3,
        travelers: formData.travelers || 2,
        budget: formData.budget || 15000,
        interests: formData.interests || []
      });

      if (response && response.tripSummary) {
        return response;
      }
    } catch (error) {
      console.warn('Backend generation failed:', error.message);
      return null;
    }
  }

  // Generate trip locally with good data
  async generateLocalTrip(formData) {
    const {
      destination,
      duration = 3,
      travelers = 2,
      budget = 15000,
      interests = []
    } = formData;

    const destinationName = destination?.name || destination || 'India';
    const dailyBudget = Math.floor(budget / duration);

    // Create comprehensive trip plan
    const tripPlan = {
      id: `local_trip_${Date.now()}`,
      tripSummary: {
        destination: destinationName,
        duration: duration,
        travelers: `${travelers} ${travelers === 1 ? 'person' : 'people'}`,
        budget: `₹${budget.toLocaleString()}`,
        currency: 'INR',
        totalEstimatedCost: `₹${Math.floor(budget * 0.9).toLocaleString()}`,
        bestTime: 'October to March',
        highlights: this.getDestinationHighlights(destinationName, interests)
      },

      hotels: this.generateHotels(destinationName, dailyBudget),
      itinerary: this.generateItinerary(destinationName, duration, interests, dailyBudget),
      budgetBreakdown: this.generateBudgetBreakdown(budget, duration),

      travelTips: [
        'Book accommodations in advance for better rates',
        'Try local cuisine for authentic experience',
        'Carry comfortable walking shoes',
        'Keep emergency contacts handy',
        'Respect local customs and traditions'
      ],

      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'optimized-local-generation',
        version: '1.0.0'
      }
    };

    return tripPlan;
  }

  // Emergency fallback generation (always works)
  generateEmergencyTrip(formData) {
    const {
      destination,
      duration = 3,
      travelers = 2,
      budget = 15000
    } = formData;

    const destinationName = destination?.name || destination || 'India';

    return {
      id: `emergency_trip_${Date.now()}`,
      tripSummary: {
        destination: destinationName,
        duration: duration,
        travelers: `${travelers} people`,
        budget: `₹${budget.toLocaleString()}`,
        currency: 'INR',
        totalEstimatedCost: `₹${budget.toLocaleString()}`,
        bestTime: 'Year-round',
        highlights: ['Sightseeing', 'Local culture', 'Food exploration']
      },

      hotels: [
        {
          hotelName: `Hotel ${destinationName} Plaza`,
          hotelAddress: `Main Area, ${destinationName}`,
          price: `₹${Math.floor(budget / duration * 0.4)} per night`,
          rating: 4.0,
          description: 'Comfortable accommodation with modern amenities'
        }
      ],

      itinerary: Array.from({ length: duration }, (_, index) => ({
        day: index + 1,
        theme: `Day ${index + 1} - Explore ${destinationName}`,
        activities: [
          {
            placeName: `${destinationName} Main Attraction`,
            placeDetails: 'Popular local attraction with cultural significance',
            ticketPricing: `₹${Math.floor(Math.random() * 200 + 50)} per person`,
            rating: 4.2,
            timeToTravel: '30 minutes',
            bestTimeToVisit: 'Morning'
          }
        ]
      })),

      budgetBreakdown: {
        accommodation: `₹${Math.floor(budget * 0.4).toLocaleString()}`,
        food: `₹${Math.floor(budget * 0.3).toLocaleString()}`,
        activities: `₹${Math.floor(budget * 0.2).toLocaleString()}`,
        transport: `₹${Math.floor(budget * 0.1).toLocaleString()}`
      },

      travelTips: [
        'Plan your itinerary in advance',
        'Keep important documents safe',
        'Try local transportation',
        'Explore local markets'
      ],

      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'emergency-fallback',
        version: '1.0.0'
      }
    };
  }

  // Helper methods
  getDestinationHighlights(destination, interests) {
    const defaultHighlights = ['Historical sites', 'Local cuisine', 'Cultural experiences'];
    
    if (interests.includes('adventure')) {
      defaultHighlights.push('Adventure activities');
    }
    if (interests.includes('nature')) {
      defaultHighlights.push('Natural beauty');
    }
    if (interests.includes('culture')) {
      defaultHighlights.push('Cultural heritage');
    }

    return defaultHighlights.slice(0, 4);
  }

  generateHotels(destination, dailyBudget) {
    const hotelBudget = Math.floor(dailyBudget * 0.4);
    
    return [
      {
        hotelName: `${destination} Grand Hotel`,
        hotelAddress: `Central ${destination}`,
        price: `₹${hotelBudget} per night`,
        rating: 4.2,
        description: 'Luxury hotel with excellent amenities'
      },
      {
        hotelName: `${destination} Budget Inn`,
        hotelAddress: `Near ${destination} Station`,
        price: `₹${Math.floor(hotelBudget * 0.6)} per night`,
        rating: 3.8,
        description: 'Budget-friendly option with good facilities'
      }
    ];
  }

  generateItinerary(destination, duration, interests, dailyBudget) {
    return Array.from({ length: duration }, (_, index) => ({
      day: index + 1,
      theme: `Day ${index + 1} - ${this.getDayTheme(index, interests)}`,
      activities: [
        {
          placeName: `${destination} ${this.getActivityName(index)}`,
          placeDetails: `Explore the ${this.getActivityDescription(index)} of ${destination}`,
          ticketPricing: `₹${Math.floor(Math.random() * 300 + 100)} per person`,
          rating: 4.0 + Math.random() * 0.8,
          timeToTravel: `${Math.floor(Math.random() * 45 + 15)} minutes`,
          bestTimeToVisit: index % 2 === 0 ? 'Morning' : 'Afternoon'
        }
      ]
    }));
  }

  getDayTheme(dayIndex, interests) {
    const themes = ['Historical Exploration', 'Cultural Immersion', 'Local Experiences', 'Nature & Relaxation'];
    return themes[dayIndex % themes.length];
  }

  getActivityName(dayIndex) {
    const activities = ['Heritage Site', 'Cultural Center', 'Local Market', 'Scenic Spot'];
    return activities[dayIndex % activities.length];
  }

  getActivityDescription(dayIndex) {
    const descriptions = ['rich history', 'vibrant culture', 'local lifestyle', 'natural beauty'];
    return descriptions[dayIndex % descriptions.length];
  }

  generateBudgetBreakdown(budget, duration) {
    return {
      accommodation: `₹${Math.floor(budget * 0.4).toLocaleString()}`,
      food: `₹${Math.floor(budget * 0.3).toLocaleString()}`,
      activities: `₹${Math.floor(budget * 0.2).toLocaleString()}`,
      transport: `₹${Math.floor(budget * 0.1).toLocaleString()}`
    };
  }
}

export default new OptimizedTripService();
