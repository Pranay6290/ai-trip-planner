import { searchIndianDestinations } from '../data/indianDestinations';

class NLPService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    
    // Keywords for parsing
    this.destinationKeywords = ['to', 'in', 'visit', 'go to', 'trip to', 'travel to'];
    this.durationKeywords = ['days', 'day', 'weeks', 'week', 'nights', 'night'];
    this.budgetKeywords = ['budget', 'cost', 'spend', 'rupees', '₹', 'rs'];
    this.travelerKeywords = ['people', 'person', 'travelers', 'friends', 'family', 'couple'];
    this.interestKeywords = {
      adventure: ['adventure', 'trekking', 'hiking', 'sports', 'climbing'],
      culture: ['culture', 'heritage', 'temples', 'museums', 'history'],
      nature: ['nature', 'wildlife', 'parks', 'gardens', 'scenic'],
      food: ['food', 'cuisine', 'restaurants', 'street food', 'local food'],
      relaxation: ['relax', 'spa', 'beach', 'peaceful', 'calm'],
      shopping: ['shopping', 'markets', 'souvenirs', 'handicrafts']
    };
  }

  // Parse natural language input into structured trip data (NO AI - LOCAL PARSING ONLY)
  async parseNaturalLanguageInput(userInput) {
    const cacheKey = `nlp_${userInput.toLowerCase().trim()}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      console.log('🔍 Parsing natural language input locally (NO AI):', userInput);
      
      // NEVER USE AI - ALWAYS USE LOCAL PARSING
      const parsedData = this.parseInputLocally(userInput);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: parsedData,
        timestamp: Date.now()
      });

      console.log('✅ Local parsing successful:', parsedData);
      return parsedData;
    } catch (error) {
      console.error('Error parsing natural language input:', error);
      
      // Return a helpful default instead of throwing
      return this.getDefaultParsedData(userInput);
    }
  }

  // Parse input locally using keyword matching and patterns
  parseInputLocally(userInput) {
    const input = userInput.toLowerCase().trim();
    const words = input.split(/\s+/);
    
    // Extract destination
    const destination = this.extractDestination(input, words);
    
    // Extract duration
    const duration = this.extractDuration(input, words);
    
    // Extract budget
    const budget = this.extractBudget(input, words);
    
    // Extract travelers
    const travelers = this.extractTravelers(input, words);
    
    // Extract interests
    const interests = this.extractInterests(input, words);
    
    return {
      destination,
      duration,
      budget,
      travelers,
      interests,
      confidence: this.calculateConfidence(destination, duration, budget, travelers),
      originalInput: userInput
    };
  }

  // Extract destination from input
  extractDestination(input, words) {
    // Try to find any Indian destination mentioned
    for (const word of words) {
      const matches = searchIndianDestinations(word);
      if (matches.length > 0) {
        return {
          name: matches[0].name,
          state: matches[0].state,
          category: matches[0].category
        };
      }
    }
    
    // Try multi-word destinations
    for (let i = 0; i < words.length - 1; i++) {
      const twoWords = words.slice(i, i + 2).join(' ');
      const matches = searchIndianDestinations(twoWords);
      if (matches.length > 0) {
        return {
          name: matches[0].name,
          state: matches[0].state,
          category: matches[0].category
        };
      }
    }
    
    // Default destination
    return {
      name: 'India',
      state: 'Multiple States',
      category: 'country'
    };
  }

  // Extract duration from input
  extractDuration(input, words) {
    const durationPattern = /(\d+)\s*(days?|nights?|weeks?)/i;
    const match = input.match(durationPattern);
    
    if (match) {
      let duration = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit.includes('week')) {
        duration *= 7;
      } else if (unit.includes('night')) {
        duration += 1; // nights to days conversion
      }
      
      return Math.max(1, Math.min(duration, 30)); // 1-30 days
    }
    
    // Look for number words
    const numberWords = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    };
    
    for (const [word, num] of Object.entries(numberWords)) {
      if (input.includes(word) && this.durationKeywords.some(k => input.includes(k))) {
        return num;
      }
    }
    
    return 3; // Default 3 days
  }

  // Extract budget from input
  extractBudget(input, words) {
    // Look for budget patterns
    const budgetPatterns = [
      /₹\s*(\d+(?:,\d+)*)/,
      /rs\.?\s*(\d+(?:,\d+)*)/i,
      /rupees?\s*(\d+(?:,\d+)*)/i,
      /budget\s*(?:of|is)?\s*₹?\s*(\d+(?:,\d+)*)/i,
      /spend\s*₹?\s*(\d+(?:,\d+)*)/i
    ];
    
    for (const pattern of budgetPatterns) {
      const match = input.match(pattern);
      if (match) {
        const amount = parseInt(match[1].replace(/,/g, ''));
        return Math.max(1000, Math.min(amount, 1000000)); // 1K to 10L
      }
    }
    
    // Look for budget keywords with numbers
    const numbers = input.match(/\d+/g);
    if (numbers && this.budgetKeywords.some(k => input.includes(k))) {
      const amount = parseInt(numbers[0]);
      if (amount > 100) {
        return Math.max(1000, Math.min(amount, 1000000));
      }
    }
    
    return 15000; // Default budget
  }

  // Extract number of travelers
  extractTravelers(input, words) {
    // Look for traveler patterns
    const travelerPatterns = [
      /(\d+)\s*(?:people|persons?|travelers?|friends?)/i,
      /(?:for|with)\s*(\d+)/i,
      /group\s*of\s*(\d+)/i
    ];
    
    for (const pattern of travelerPatterns) {
      const match = input.match(pattern);
      if (match) {
        const count = parseInt(match[1]);
        return Math.max(1, Math.min(count, 20)); // 1-20 people
      }
    }
    
    // Check for specific keywords
    if (input.includes('couple')) return 2;
    if (input.includes('family')) return 4;
    if (input.includes('solo') || input.includes('alone')) return 1;
    if (input.includes('friends')) return 4;
    
    return 2; // Default 2 people
  }

  // Extract interests from input
  extractInterests(input, words) {
    const interests = [];
    
    for (const [interest, keywords] of Object.entries(this.interestKeywords)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        interests.push(interest);
      }
    }
    
    // If no specific interests found, add some defaults
    if (interests.length === 0) {
      interests.push('culture', 'nature');
    }
    
    return interests;
  }

  // Calculate confidence score
  calculateConfidence(destination, duration, budget, travelers) {
    let confidence = 0;
    
    if (destination.name !== 'India') confidence += 0.3;
    if (duration !== 3) confidence += 0.2;
    if (budget !== 15000) confidence += 0.2;
    if (travelers !== 2) confidence += 0.1;
    
    return Math.min(confidence + 0.2, 1.0); // Base confidence + bonuses
  }

  // Get default parsed data when parsing fails
  getDefaultParsedData(userInput) {
    return {
      destination: {
        name: 'India',
        state: 'Multiple States',
        category: 'country'
      },
      duration: 3,
      budget: 15000,
      travelers: 2,
      interests: ['culture', 'nature'],
      confidence: 0.1,
      originalInput: userInput,
      note: 'Using default values - please refine your search'
    };
  }

  // Validate parsed data
  validateParsedData(data) {
    return {
      destination: data.destination || { name: 'India', state: 'India', category: 'country' },
      duration: Math.max(1, Math.min(data.duration || 3, 30)),
      budget: Math.max(1000, Math.min(data.budget || 15000, 1000000)),
      travelers: Math.max(1, Math.min(data.travelers || 2, 20)),
      interests: Array.isArray(data.interests) && data.interests.length > 0 
        ? data.interests 
        : ['culture', 'nature'],
      confidence: Math.max(0, Math.min(data.confidence || 0.5, 1))
    };
  }
}

// Create and export singleton instance
const nlpService = new NLPService();
export default nlpService;
