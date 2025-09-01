import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  SparklesIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MicrophoneIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { searchIndianDestinations } from '../../data/indianDestinations';
import placesService from '../../services/placesService';
import itineraryService from '../../services/itineraryService';

const TravelChatbot = ({ tripContext, onTripUpdate, isOpen, onToggle }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI travel assistant. I can help you plan your trip, find places, adjust your itinerary, and answer any travel questions. What would you like to do?",
      timestamp: new Date(),
      suggestions: [
        "Find restaurants near my hotel",
        "Add a museum to day 2",
        "What's the weather like?",
        "Suggest budget-friendly activities"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Available tools for the chatbot
  const tools = {
    searchPlaces: async (query, location) => {
      return await placesService.textSearch(query, location);
    },
    addPlaceToTrip: async (place, day) => {
      // This would integrate with the trip management system
      return { success: true, message: `Added ${place.name} to day ${day}` };
    },
    removeFromTrip: async (placeId) => {
      return { success: true, message: 'Place removed from trip' };
    },
    regenerateDay: async (dayNumber) => {
      // Regenerate a specific day's itinerary
      return { success: true, message: `Day ${dayNumber} regenerated` };
    },
    extendTrip: async (additionalDays) => {
      return { success: true, message: `Trip extended by ${additionalDays} days` };
    },
    getBudgetInfo: () => {
      return tripContext?.budget || { total: 0, spent: 0, remaining: 0 };
    },
    getWeatherInfo: async () => {
      // This would integrate with weather service
      return { condition: 'sunny', temperature: 22, forecast: 'Clear skies' };
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await processMessage(inputMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
        actions: response.actions
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      let errorContent = "I'm sorry, I encountered an error. Please try again or rephrase your question.";

      // Enhanced error handling for different types of failures
      if (error.message.includes('429') ||
          error.message.includes('quota') ||
          error.message.includes('rate limit') ||
          error.message.includes('Too Many Requests')) {
        errorContent = "🚫 I've reached my daily AI quota limit. But I can still help you plan your trip using my built-in knowledge! Try asking about popular destinations in India, or let me suggest some amazing places to visit.";
      } else if (error.message.includes('timeout')) {
        errorContent = "⏰ My response took too long. Let me try to help you with a quick suggestion instead!";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorContent = "🌐 I'm having connectivity issues, but I can still help you plan your trip offline! What destination are you interested in?";
      }

      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: errorContent,
        timestamp: new Date(),
        actions: [
          { type: 'suggestion', text: 'Popular destinations in India' },
          { type: 'suggestion', text: 'Plan a 3-day trip' },
          { type: 'suggestion', text: 'Budget travel tips' }
        ]
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const processMessage = async (message) => {
    try {
      // NEVER USE AI - ALWAYS USE FALLBACK RESPONSES
      const lowerMessage = message.toLowerCase();

      // Greeting responses
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return {
          content: "Hello! 👋 I'm your AI travel assistant. I can help you plan amazing trips across India! What destination are you thinking about?",
          suggestions: ['Plan a trip to Goa', 'Show me hill stations', 'Budget travel tips']
        };
      }

      // Destination-specific responses
      if (lowerMessage.includes('goa')) {
        return {
          content: "🏖️ **Goa - The Beach Paradise!**\n\nGoa is perfect for beaches, nightlife, and Portuguese heritage!\n\n🏖️ **Best Beaches**: Baga, Calangute, Anjuna, Palolem\n🏛️ **Heritage**: Old Goa churches, Fort Aguada\n🍽️ **Food**: Seafood, Feni, Portuguese cuisine\n⏰ **Best Time**: October to March\n💰 **Budget**: ₹3,000-5,000 per day",
          suggestions: ['Create Goa itinerary', 'Goa budget planning', 'Goa beaches guide']
        };
      }

      if (lowerMessage.includes('kerala')) {
        return {
          content: "🌴 **Kerala - God's Own Country!**\n\n🚤 **Backwaters**: Alleppey, Kumarakom\n🏔️ **Hill Stations**: Munnar, Wayanad\n🏖️ **Beaches**: Kovalam, Varkala\n🐘 **Wildlife**: Periyar, Thekkady\n💆 **Ayurveda**: Traditional treatments\n⏰ **Best Time**: October to March",
          suggestions: ['Plan Kerala backwaters trip', 'Kerala hill stations', 'Ayurveda packages']
        };
      }

      if (lowerMessage.includes('rajasthan')) {
        return {
          content: "🏰 **Rajasthan - Land of Kings!**\n\n🏰 **Cities**: Jaipur, Udaipur, Jodhpur, Jaisalmer\n🏛️ **Palaces**: City Palace, Hawa Mahal, Mehrangarh Fort\n🐪 **Desert**: Thar Desert safari\n🎨 **Culture**: Folk music, dance, handicrafts\n⏰ **Best Time**: October to March",
          suggestions: ['Rajasthan royal tour', 'Desert safari planning', 'Palace hotels']
        };
      }

      // Budget queries
      if (lowerMessage.includes('budget') || lowerMessage.includes('cheap')) {
        return {
          content: "💰 **Budget Travel Tips for India:**\n\n🚂 **Transport**: Use trains and buses\n🏨 **Stay**: Hostels, guesthouses (₹500-1500/night)\n🍽️ **Food**: Local restaurants (₹100-300/meal)\n🎯 **Activities**: Free attractions, walking tours\n\n**Daily Budget**: ₹1,500-3,000 per person",
          suggestions: ['Plan budget trip to Goa', 'Backpacking tips', 'Cheap accommodation']
        };
      }

      // Default helpful response
      return {
        content: "I'd love to help you plan your trip! 🌟\n\nHere are some popular options:\n\n🏖️ **Beach Lovers**: Goa, Kerala, Andaman\n🏔️ **Mountain Enthusiasts**: Himachal, Uttarakhand\n🏛️ **Heritage Seekers**: Rajasthan, Delhi, Agra\n🌿 **Nature Lovers**: Kerala, Karnataka, Northeast\n\nWhat type of experience are you looking for?",
        suggestions: ['Beach destinations', 'Mountain getaways', 'Heritage tours', 'Nature and wildlife']
      };

    } catch (error) {
      console.error('Error in processMessage:', error);

      // Ultimate fallback
      return {
        content: "I'm here to help you plan amazing trips across India! 🇮🇳\n\nPopular destinations:\n🏖️ Goa • 🏔️ Himachal • 🏛️ Rajasthan • 🌴 Kerala\n\nWhat interests you most?",
        suggestions: ['Beach vacation', 'Mountain adventure', 'Cultural tour']
      };
    }
  };

  const buildContextPrompt = (message) => {
    const context = {
      currentTrip: tripContext,
      availableTools: Object.keys(tools),
      userMessage: message
    };

    return `
You are an AI travel assistant helping with trip planning. You have access to the following tools:
- searchPlaces: Find places by query and location
- addPlaceToTrip: Add a place to a specific day
- removeFromTrip: Remove a place from the trip
- regenerateDay: Regenerate a day's itinerary
- extendTrip: Add more days to the trip
- getBudgetInfo: Get budget information
- getWeatherInfo: Get weather information

Current trip context: ${JSON.stringify(context.currentTrip)}

User message: "${message}"

Respond in JSON format:
{
  "content": "Your response to the user",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "actions": [
    {
      "tool": "toolName",
      "parameters": {...}
    }
  ]
}

Be helpful, conversational, and provide actionable suggestions. If the user wants to modify their trip, use the appropriate tools.
`;
  };

  const parseAIResponse = (responseText) => {
    try {
      return JSON.parse(responseText);
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        content: responseText,
        suggestions: [],
        actions: []
      };
    }
  };

  const executeAction = async (action) => {
    const { tool, parameters } = action;
    
    if (tools[tool]) {
      try {
        const result = await tools[tool](...Object.values(parameters));
        
        // Notify parent component of trip updates
        if (tool.includes('Trip') || tool === 'regenerateDay' || tool === 'extendTrip') {
          onTripUpdate?.(result);
        }
        
        return result;
      } catch (error) {
        console.error(`Error executing ${tool}:`, error);
        return { success: false, error: error.message };
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-full">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">AI Travel Assistant</h3>
            <p className="text-xs text-blue-100">Always here to help</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md'
              } px-4 py-2`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about your trip..."
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Voice Input */}
            {recognitionRef.current && (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                  isListening ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {isListening ? (
                  <StopIcon className="w-4 h-4" />
                ) : (
                  <MicrophoneIcon className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-center space-x-4 mt-3">
          <button
            onClick={() => handleSuggestionClick("Find nearby restaurants")}
            className="flex items-center space-x-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
          >
            <MapPinIcon className="w-3 h-3" />
            <span>Places</span>
          </button>
          <button
            onClick={() => handleSuggestionClick("What's my budget status?")}
            className="flex items-center space-x-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
          >
            <CurrencyDollarIcon className="w-3 h-3" />
            <span>Budget</span>
          </button>
          <button
            onClick={() => handleSuggestionClick("Check the weather")}
            className="flex items-center space-x-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
          >
            <CalendarDaysIcon className="w-3 h-3" />
            <span>Weather</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TravelChatbot;
