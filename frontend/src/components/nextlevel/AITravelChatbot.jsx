import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon, 
  SparklesIcon,
  XMarkIcon,
  MicrophoneIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import workingAIService from '../../services/workingAIService';
import toast from 'react-hot-toast';

const AITravelChatbot = ({ onTripGenerated, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI travel assistant. I can help you plan amazing trips to India! Try asking me something like:\n\n• \"Plan a 3-day trip to Goa for 2 people with ₹20,000\"\n• \"I want to visit temples and beaches in South India\"\n• \"Suggest a weekend getaway from Mumbai\"",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognition = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-IN';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
        toast.error('Speech recognition failed');
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

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
      // Check if it's a trip planning request
      if (inputMessage.toLowerCase().includes('plan') || 
          inputMessage.toLowerCase().includes('trip') ||
          inputMessage.toLowerCase().includes('visit') ||
          inputMessage.toLowerCase().includes('days')) {
        
        // Generate trip plan
        const tripPlan = await workingAIService.generateTrip(inputMessage);
        
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: `Great! I've created a personalized trip plan for you. Here's what I found:\n\n🎯 **${tripPlan.tripSummary.destination}** for ${tripPlan.tripSummary.duration} days\n👥 ${tripPlan.tripSummary.travelers}\n💰 Budget: ${tripPlan.tripSummary.budget}\n\n✨ Your trip includes ${tripPlan.hotels?.length || 0} hotel options and a ${tripPlan.itinerary?.length || 0}-day detailed itinerary!\n\nWould you like me to show you the full details or modify anything?`,
          timestamp: new Date(),
          tripPlan: tripPlan
        };

        setMessages(prev => [...prev, botResponse]);
        
        // Notify parent component
        if (onTripGenerated) {
          onTripGenerated(tripPlan);
        }
        
        toast.success('Trip plan generated!');
      } else {
        // Handle general queries
        const responses = [
          "I'd be happy to help you plan your trip! Could you tell me:\n• Where would you like to go?\n• How many days?\n• How many people?\n• What's your budget?",
          "I specialize in Indian destinations! Some popular options are:\n🏖️ Goa - Beaches & nightlife\n🏔️ Himachal - Mountains & adventure\n🏛️ Rajasthan - Heritage & culture\n🌴 Kerala - Backwaters & nature\n\nWhat interests you most?",
          "For the best recommendations, I need a few details:\n• Your preferred destination\n• Trip duration\n• Number of travelers\n• Budget range\n• Interests (beaches, mountains, culture, etc.)"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: randomResponse,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm having trouble processing that request. Could you try rephrasing it? For example: 'Plan a 3-day trip to Kerala for 2 people with ₹15,000 budget'",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      toast.error('Failed to process request');
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = () => {
    if (recognition.current && !isListening) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const quickSuggestions = [
    "Plan a weekend trip to Goa",
    "3 days in Rajasthan for family",
    "Budget trip to Kerala",
    "Hill station near Mumbai"
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 ${className}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Travel Assistant</h3>
                  <p className="text-xs opacity-90">Powered by TripCraft AI</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800 shadow-sm border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    {message.tripPlan && (
                      <button
                        onClick={() => onTripGenerated && onTripGenerated(message.tripPlan)}
                        className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200 transition-colors"
                      >
                        View Full Trip Plan
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white p-3 rounded-2xl shadow-sm border">
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

            {/* Quick Suggestions */}
            {messages.length <= 1 && (
              <div className="p-3 border-t bg-white">
                <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
                <div className="flex flex-wrap gap-1">
                  {quickSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(suggestion)}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me about your next trip..."
                    className="w-full p-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                    disabled={isTyping}
                  />
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                      isListening ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-blue-500'
                    }`}
                  >
                    {isListening ? <StopIcon className="w-4 h-4" /> : <MicrophoneIcon className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AITravelChatbot;
