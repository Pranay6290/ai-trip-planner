import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const NextLevelChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI travel assistant. I can help you plan amazing trips to any destination worldwide! Try asking me something like 'Plan a 3-day trip to Mumbai for 2 people with ₹15,000 budget' or 'What are the best places to visit in Kolkata?'",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Quick action buttons
  const quickActions = [
    {
      icon: MapPinIcon,
      text: "Plan a trip to Mumbai",
      action: () => handleQuickAction("Plan a 3-day trip to Mumbai for 2 people with ₹15,000 budget")
    },
    {
      icon: CalendarDaysIcon,
      text: "Weekend getaway ideas",
      action: () => handleQuickAction("Suggest weekend getaway destinations from Delhi for 2 days")
    },
    {
      icon: CurrencyRupeeIcon,
      text: "Budget trip planning",
      action: () => handleQuickAction("Plan a budget-friendly trip to Goa for 4 days under ₹20,000")
    },
    {
      icon: SparklesIcon,
      text: "Best time to visit",
      action: () => handleQuickAction("What's the best time to visit Rajasthan?")
    }
  ];

  const handleQuickAction = (message) => {
    setInputMessage(message);
    handleSendMessage(message);
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      const botResponse = await generateBotResponse(messageText);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse.content,
        actions: botResponse.actions,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I encountered an error. Please try again or use our trip planner directly.",
        actions: [
          {
            text: "Open Trip Planner",
            action: () => navigate('/plan-next-level-trip')
          }
        ],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateBotResponse = async (userMessage) => {
    const message = userMessage.toLowerCase();

    // Trip planning requests
    if (message.includes('plan') && (message.includes('trip') || message.includes('travel'))) {
      return {
        content: "I'd love to help you plan an amazing trip! I can see you're interested in trip planning. Let me guide you to our advanced trip planner where I can create a detailed itinerary with specific places, timings, costs, and local recommendations.",
        actions: [
          {
            text: "🚀 Start Planning Now",
            action: () => navigate('/plan-next-level-trip')
          },
          {
            text: "View Sample Itineraries",
            action: () => navigate('/my-trips')
          }
        ]
      };
    }

    // Destination information requests
    if (message.includes('mumbai')) {
      return {
        content: "Mumbai is an amazing destination! Here are the top attractions: Gateway of India, Marine Drive, Elephanta Caves, Chhatrapati Shivaji Terminus, and Haji Ali Dargah. The best time to visit is October to February. Would you like me to create a detailed itinerary?",
        actions: [
          {
            text: "Plan Mumbai Trip",
            action: () => {
              navigate('/plan-next-level-trip');
              // Pre-fill Mumbai as destination
              setTimeout(() => {
                const destinationInput = document.querySelector('input[placeholder*="Mumbai"]');
                if (destinationInput) {
                  destinationInput.value = 'Mumbai';
                  destinationInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }, 1000);
            }
          }
        ]
      };
    }

    if (message.includes('kolkata')) {
      return {
        content: "Kolkata, the cultural capital of India! Must-visit places include Victoria Memorial, Howrah Bridge, Dakshineswar Temple, Park Street, and the Indian Museum. The city is famous for its literature, art, and delicious Bengali cuisine. Best time to visit is October to March.",
        actions: [
          {
            text: "Plan Kolkata Trip",
            action: () => {
              navigate('/plan-next-level-trip');
              setTimeout(() => {
                const destinationInput = document.querySelector('input[placeholder*="Mumbai"]');
                if (destinationInput) {
                  destinationInput.value = 'Kolkata';
                  destinationInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }, 1000);
            }
          }
        ]
      };
    }

    if (message.includes('delhi')) {
      return {
        content: "Delhi offers a perfect blend of history and modernity! Top attractions: Red Fort, India Gate, Qutub Minar, Lotus Temple, Humayun's Tomb, and Chandni Chowk. Don't miss the street food at Paranthe Wali Gali!",
        actions: [
          {
            text: "Plan Delhi Trip",
            action: () => navigate('/plan-next-level-trip')
          }
        ]
      };
    }

    // Budget-related queries
    if (message.includes('budget') || message.includes('cheap') || message.includes('affordable')) {
      return {
        content: "I can help you plan budget-friendly trips! Our AI considers your budget and suggests cost-effective attractions, local food options, and transportation. Popular budget destinations include Rishikesh, Pushkar, Hampi, and Gokarna.",
        actions: [
          {
            text: "Plan Budget Trip",
            action: () => navigate('/plan-next-level-trip')
          }
        ]
      };
    }

    // Best time queries
    if (message.includes('best time') || message.includes('when to visit')) {
      return {
        content: "The best time to visit depends on your destination:\n\n• North India (Delhi, Rajasthan): October to March\n• South India (Bangalore, Chennai): November to February\n• Hill Stations: April to June, September to November\n• Beaches (Goa, Kerala): November to March\n• Northeast: October to April",
        actions: [
          {
            text: "Get Detailed Weather Info",
            action: () => navigate('/plan-next-level-trip')
          }
        ]
      };
    }

    // International destinations
    if (message.includes('international') || message.includes('abroad') || message.includes('foreign')) {
      return {
        content: "I can help plan international trips too! Popular destinations include Paris, London, Tokyo, New York, Dubai, Singapore, and Thailand. Our AI provides detailed itineraries with local attractions, restaurants, and cultural tips.",
        actions: [
          {
            text: "Plan International Trip",
            action: () => navigate('/plan-next-level-trip')
          }
        ]
      };
    }

    // Default response
    return {
      content: "I'm here to help with all your travel planning needs! I can assist with:\n\n• Creating detailed itineraries for any destination\n• Budget planning and cost breakdowns\n• Best time to visit recommendations\n• Local food and cultural experiences\n• Transportation and accommodation suggestions\n\nWhat would you like to know about your next adventure?",
      actions: [
        {
          text: "Start Trip Planning",
          action: () => navigate('/plan-next-level-trip')
        },
        {
          text: "Browse Destinations",
          action: () => navigate('/')
        }
      ]
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-40 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Travel Assistant</h3>
                  <p className="text-xs opacity-80">Always here to help!</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>

                    {/* Action Buttons */}
                    {message.actions && (
                      <div className="mt-4 space-y-2">
                        {message.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={action.action}
                            className={`w-full text-left text-xs px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                              message.type === 'user'
                                ? 'bg-white/20 hover:bg-white/30 text-white'
                                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {action.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="p-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-3">Quick actions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={action.action}
                        className="flex items-center space-x-2 p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Icon className="w-4 h-4 text-blue-600" />
                        <span className="truncate">{action.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about travel plans..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default NextLevelChatbot;
