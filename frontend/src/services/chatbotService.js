import { chatSession } from '../service/AIModal';
import { searchIndianDestinations } from '../data/indianDestinations';

class ChatbotService {
  constructor() {
    this.conversationHistory = new Map();
    this.contextCache = new Map();
    this.tools = this.initializeTools();
  }

  // Initialize available tools for the chatbot
  initializeTools() {
    return {
      searchPlaces: this.searchPlaces.bind(this),
      addActivity: this.addActivity.bind(this),
      removeActivity: this.removeActivity.bind(this),
      modifyItinerary: this.modifyItinerary.bind(this),
      getWeatherInfo: this.getWeatherInfo.bind(this),
      calculateBudget: this.calculateBudget.bind(this),
      findAlternatives: this.findAlternatives.bind(this),
      optimizeRoute: this.optimizeRoute.bind(this),
      getRecommendations: this.getRecommendations.bind(this),
      exportItinerary: this.exportItinerary.bind(this)
    };
  }

  // Process user message and generate response
  async processMessage(message, context = {}) {
    try {
      const { userId, tripId, currentItinerary } = context;
      
      // Get or create conversation history
      const conversationKey = `${userId}_${tripId}`;
      let conversation = this.conversationHistory.get(conversationKey) || [];
      
      // Add user message to history
      const userMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        context: context
      };
      conversation.push(userMessage);

      // Analyze user intent
      const intent = await this.analyzeIntent(message, conversation, context);
      
      // Generate AI response
      const aiResponse = await this.generateResponse(intent, conversation, context);
      
      // Execute any required actions
      const actionResults = await this.executeActions(aiResponse.actions || [], context);
      
      // Create assistant message
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse.content,
        actions: aiResponse.actions || [],
        actionResults: actionResults,
        timestamp: new Date().toISOString(),
        context: context
      };
      conversation.push(assistantMessage);

      // Update conversation history
      this.conversationHistory.set(conversationKey, conversation.slice(-20)); // Keep last 20 messages

      return {
        message: assistantMessage,
        conversation: conversation,
        context: {
          ...context,
          lastIntent: intent,
          actionsExecuted: actionResults.length > 0
        }
      };
    } catch (error) {
      console.error('Error processing chatbot message:', error);
      return this.getErrorResponse(error, context);
    }
  }

  // Analyze user intent from message
  async analyzeIntent(message, conversation, context) {
    const prompt = this.buildIntentAnalysisPrompt(message, conversation, context);
    
    try {
      const result = await chatSession.sendMessage(prompt);
      const responseText = result?.response?.text();
      
      if (!responseText) {
        throw new Error('No response from AI service');
      }

      return this.parseIntentResponse(responseText);
    } catch (error) {
      console.error('Error analyzing intent:', error);
      return this.getFallbackIntent(message);
    }
  }

  // Build prompt for intent analysis
  buildIntentAnalysisPrompt(message, conversation, context) {
    const recentMessages = conversation.slice(-5).map(msg => 
      `${msg.type}: ${msg.content}`
    ).join('\n');

    return `
You are a travel planning assistant. Analyze the user's message and determine their intent.

CONVERSATION CONTEXT:
${recentMessages}

CURRENT MESSAGE: "${message}"

TRIP CONTEXT:
- Destination: ${context.currentItinerary?.tripSummary?.destination || 'Unknown'}
- Duration: ${context.currentItinerary?.tripSummary?.duration || 'Unknown'} days
- Current activities: ${context.currentItinerary?.itinerary?.length || 0} days planned

Analyze the intent and return JSON:
{
  "primaryIntent": "search_place|add_activity|remove_activity|modify_itinerary|get_info|get_recommendations|optimize_route|calculate_budget|general_question",
  "entities": {
    "places": ["place names mentioned"],
    "activities": ["activity types mentioned"],
    "time": "time references",
    "budget": "budget mentions",
    "preferences": ["preference mentions"]
  },
  "confidence": 0.0-1.0,
  "requiresAction": boolean,
  "suggestedActions": ["list of possible actions"],
  "clarificationNeeded": boolean,
  "clarificationQuestion": "question if clarification needed"
}

Return only the JSON object.
`;
  }

  // Parse intent analysis response
  parseIntentResponse(responseText) {
    try {
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error parsing intent response:', error);
      return this.getFallbackIntent();
    }
  }

  // Generate AI response based on intent
  async generateResponse(intent, conversation, context) {
    const prompt = this.buildResponsePrompt(intent, conversation, context);
    
    try {
      const result = await chatSession.sendMessage(prompt);
      const responseText = result?.response?.text();
      
      if (!responseText) {
        throw new Error('No response from AI service');
      }

      return this.parseResponseContent(responseText, intent);
    } catch (error) {
      console.error('Error generating response:', error);
      return this.getFallbackResponse(intent);
    }
  }

  // Build prompt for response generation
  buildResponsePrompt(intent, conversation, context) {
    const recentMessages = conversation.slice(-3).map(msg => 
      `${msg.type}: ${msg.content}`
    ).join('\n');

    return `
You are a helpful travel planning assistant. Generate a natural, conversational response.

CONVERSATION HISTORY:
${recentMessages}

USER INTENT: ${intent.primaryIntent}
ENTITIES: ${JSON.stringify(intent.entities)}
CONFIDENCE: ${intent.confidence}

TRIP CONTEXT:
- Destination: ${context.currentItinerary?.tripSummary?.destination || 'Unknown'}
- Duration: ${context.currentItinerary?.tripSummary?.duration || 'Unknown'} days
- Budget: ${context.currentItinerary?.tripSummary?.totalEstimatedCost || 'Unknown'}

INSTRUCTIONS:
1. Provide a helpful, conversational response
2. If actions are needed, specify them clearly
3. Be specific about what you're doing or recommending
4. Ask for clarification if needed
5. Keep responses concise but informative

Generate response in JSON format:
{
  "content": "Your conversational response to the user",
  "actions": [
    {
      "type": "search_place|add_activity|modify_itinerary|etc",
      "parameters": {"key": "value"},
      "description": "What this action does"
    }
  ],
  "suggestions": ["follow-up suggestions for the user"],
  "needsConfirmation": boolean
}

Return only the JSON object.
`;
  }

  // Parse response content
  parseResponseContent(responseText, intent) {
    try {
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanedText);
      
      return {
        content: parsed.content || "I'm here to help with your travel planning!",
        actions: parsed.actions || [],
        suggestions: parsed.suggestions || [],
        needsConfirmation: parsed.needsConfirmation || false
      };
    } catch (error) {
      console.error('Error parsing response content:', error);
      return this.getFallbackResponse(intent);
    }
  }

  // Execute actions requested by the AI
  async executeActions(actions, context) {
    const results = [];
    
    for (const action of actions) {
      try {
        const tool = this.tools[action.type];
        if (tool) {
          const result = await tool(action.parameters, context);
          results.push({
            action: action.type,
            success: true,
            result: result,
            description: action.description
          });
        } else {
          results.push({
            action: action.type,
            success: false,
            error: `Unknown action type: ${action.type}`,
            description: action.description
          });
        }
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
        results.push({
          action: action.type,
          success: false,
          error: error.message,
          description: action.description
        });
      }
    }
    
    return results;
  }

  // Tool implementations
  async searchPlaces(parameters, context) {
    const { query, location, type } = parameters;
    
    // This would integrate with the destination service
    return {
      query: query,
      results: [
        { name: 'Sample Place', rating: 4.5, type: type || 'attraction' }
      ]
    };
  }

  async addActivity(parameters, context) {
    const { activityName, day, time, location } = parameters;
    
    // This would modify the actual itinerary
    return {
      added: true,
      activity: activityName,
      day: day,
      time: time
    };
  }

  async removeActivity(parameters, context) {
    const { activityId, activityName, day } = parameters;
    
    return {
      removed: true,
      activity: activityName || activityId,
      day: day
    };
  }

  async modifyItinerary(parameters, context) {
    const { modificationType, details } = parameters;
    
    return {
      modified: true,
      type: modificationType,
      changes: details
    };
  }

  async getWeatherInfo(parameters, context) {
    const { date, location } = parameters;
    
    // This would integrate with weather service
    return {
      date: date,
      weather: 'Sunny, 22°C',
      recommendation: 'Great weather for outdoor activities!'
    };
  }

  async calculateBudget(parameters, context) {
    const { category, changes } = parameters;
    
    // This would integrate with expense service
    return {
      category: category,
      currentBudget: 1500,
      newEstimate: 1650,
      difference: 150
    };
  }

  async findAlternatives(parameters, context) {
    const { activityType, location, budget } = parameters;
    
    return {
      alternatives: [
        { name: 'Alternative 1', price: 25, rating: 4.2 },
        { name: 'Alternative 2', price: 35, rating: 4.5 }
      ]
    };
  }

  async optimizeRoute(parameters, context) {
    const { day, preferences } = parameters;
    
    return {
      optimized: true,
      timeSaved: '30 minutes',
      newOrder: ['Activity A', 'Activity B', 'Activity C']
    };
  }

  async getRecommendations(parameters, context) {
    const { type, preferences } = parameters;
    
    return {
      type: type,
      recommendations: [
        'Visit the local market in the morning',
        'Try the famous local cuisine',
        'Take a sunset photo at the viewpoint'
      ]
    };
  }

  async exportItinerary(parameters, context) {
    const { format } = parameters;
    
    return {
      exported: true,
      format: format,
      downloadUrl: '/api/export/trip-itinerary.pdf'
    };
  }

  // Helper methods
  getFallbackIntent(message = '') {
    return {
      primaryIntent: 'general_question',
      entities: {},
      confidence: 0.5,
      requiresAction: false,
      suggestedActions: [],
      clarificationNeeded: false
    };
  }

  getFallbackResponse(intent) {
    const responses = {
      search_place: "I can help you find places to visit. What type of place are you looking for?",
      add_activity: "I can help you add activities to your itinerary. What would you like to add?",
      remove_activity: "I can help you remove activities. Which activity would you like to remove?",
      get_info: "I'm here to provide information about your trip. What would you like to know?",
      general_question: "I'm your travel planning assistant. How can I help you with your trip?"
    };

    return {
      content: responses[intent.primaryIntent] || responses.general_question,
      actions: [],
      suggestions: [
        "Ask me to find places to visit",
        "Request to add or remove activities",
        "Get weather information",
        "Calculate budget estimates"
      ],
      needsConfirmation: false
    };
  }

  getErrorResponse(error, context) {
    return {
      message: {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I apologize, but I encountered an error. Please try rephrasing your request or contact support if the issue persists.",
        timestamp: new Date().toISOString(),
        error: true
      },
      conversation: [],
      context: context
    };
  }

  // Get conversation history
  getConversationHistory(userId, tripId) {
    const conversationKey = `${userId}_${tripId}`;
    return this.conversationHistory.get(conversationKey) || [];
  }

  // Clear conversation history
  clearConversationHistory(userId, tripId) {
    const conversationKey = `${userId}_${tripId}`;
    this.conversationHistory.delete(conversationKey);
  }

  // Get conversation summary
  async getConversationSummary(userId, tripId) {
    const conversation = this.getConversationHistory(userId, tripId);
    
    if (conversation.length === 0) {
      return {
        totalMessages: 0,
        userMessages: 0,
        assistantMessages: 0,
        actionsExecuted: 0,
        lastActivity: null
      };
    }

    const userMessages = conversation.filter(msg => msg.type === 'user');
    const assistantMessages = conversation.filter(msg => msg.type === 'assistant');
    const actionsExecuted = assistantMessages.reduce((sum, msg) => 
      sum + (msg.actionResults?.length || 0), 0
    );

    return {
      totalMessages: conversation.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      actionsExecuted: actionsExecuted,
      lastActivity: conversation[conversation.length - 1]?.timestamp
    };
  }
}

// Create singleton instance
const chatbotService = new ChatbotService();

// React hook for chatbot service
export const useChatbotService = () => {
  const telemetry = useTelemetry();

  return {
    processMessage: async (message, context) => {
      const startTime = Date.now();
      try {
        telemetry.trackChatMessage('user', context.lastIntent, 0);
        
        const response = await chatbotService.processMessage(message, context);
        const responseTime = Date.now() - startTime;
        
        telemetry.trackChatMessage('assistant', response.context?.lastIntent, responseTime);
        
        return response;
      } catch (error) {
        telemetry.trackError(error, { action: 'processMessage', message: message.substring(0, 100) });
        throw error;
      }
    },

    getConversationHistory: (userId, tripId) => {
      return chatbotService.getConversationHistory(userId, tripId);
    },

    clearConversationHistory: (userId, tripId) => {
      chatbotService.clearConversationHistory(userId, tripId);
      telemetry.trackEvent('conversation_cleared', { userId, tripId });
    },

    getConversationSummary: async (userId, tripId) => {
      try {
        const summary = await chatbotService.getConversationSummary(userId, tripId);
        telemetry.trackEvent('conversation_summary_requested', { 
          userId, 
          tripId, 
          totalMessages: summary.totalMessages 
        });
        return summary;
      } catch (error) {
        telemetry.trackError(error, { action: 'getConversationSummary', userId, tripId });
        throw error;
      }
    }
  };
};

export default chatbotService;
