import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon,
  MapIcon,
  CloudIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  ArrowRightIcon,
  PlayIcon,
  HeartIcon,
  StarIcon,
  GlobeAltIcon,
  CameraIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import AITravelChatbot from '../components/nextlevel/AITravelChatbot';
import { EnhancedButton, EnhancedCard } from '../components/ui/EnhancedComponents';

const NextLevelHome = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  const [currentFeature, setCurrentFeature] = useState(0);
  const [showDemo, setShowDemo] = useState(false);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      id: 'ai-chat',
      title: 'AI Travel Assistant',
      description: 'Chat naturally with AI to plan your perfect trip',
      icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />,
      color: 'purple',
      demo: '"Plan a 3-day romantic trip to Goa for ₹25,000"',
      benefits: ['Natural language planning', 'Instant responses', 'Smart suggestions']
    },
    {
      id: 'route-optimization',
      title: 'Smart Route Optimizer',
      description: 'AI clusters attractions to minimize travel time',
      icon: <MapIcon className="w-8 h-8" />,
      color: 'blue',
      demo: 'Saves 2-4 hours daily by optimizing routes',
      benefits: ['Time optimization', 'Cost reduction', 'Better experience']
    },
    {
      id: 'weather-planning',
      title: 'Weather-Aware Planning',
      description: 'Automatically adjusts plans based on weather forecasts',
      icon: <CloudIcon className="w-8 h-8" />,
      color: 'green',
      demo: 'Moves outdoor activities indoors when rain is forecast',
      benefits: ['Weather protection', 'Flexible planning', 'No surprises']
    },
    {
      id: 'expense-tracking',
      title: 'Smart Expense Estimator',
      description: 'Real-time budget tracking with optimization tips',
      icon: <CurrencyRupeeIcon className="w-8 h-8" />,
      color: 'yellow',
      demo: 'Tracks every expense and suggests savings',
      benefits: ['Budget control', 'Cost optimization', 'Transparent pricing']
    },
    {
      id: 'collaboration',
      title: 'Collaborative Planning',
      description: 'Plan together with friends and family',
      icon: <UserGroupIcon className="w-8 h-8" />,
      color: 'pink',
      demo: 'Friends vote on activities and share suggestions',
      benefits: ['Group consensus', 'Shared planning', 'Better decisions']
    },
    {
      id: 'multimodal',
      title: 'Multimodal Travel Guide',
      description: 'Real-time transport options and routing',
      icon: <RocketLaunchIcon className="w-8 h-8" />,
      color: 'indigo',
      demo: 'Shows buses, trains, taxis with live timing',
      benefits: ['Real-time data', 'Multiple options', 'Cost comparison']
    }
  ];

  const stats = [
    { label: 'AI-Generated Trips', value: '10,000+', icon: '🤖' },
    { label: 'Time Saved', value: '50,000+ hrs', icon: '⏰' },
    { label: 'Happy Travelers', value: '25,000+', icon: '😊' },
    { label: 'Destinations Covered', value: '500+', icon: '🌍' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <motion.section 
        style={{ y: y1, opacity }}
        className="relative overflow-hidden py-20 px-6"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Next-Level
              </span>
              <br />
              <span className="text-gray-900">Trip Planning</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience the future of travel planning with AI-powered features that make every trip perfect
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <EnhancedButton
                onClick={() => navigate('/create-trip-ultra')}
                variant="primary"
                size="lg"
                icon={SparklesIcon}
                className="shadow-glow"
              >
                Start Planning
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </EnhancedButton>

              <EnhancedButton
                onClick={() => setShowDemo(true)}
                variant="ghost"
                size="lg"
                icon={PlayIcon}
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Watch Demo
              </EnhancedButton>
            </div>

            {/* Quick Trip Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-16"
            >
              <p className="text-lg text-gray-600 mb-6">Popular Quick Trips</p>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { destination: 'Goa', days: '3 days', price: '₹15,000', icon: '🏖️' },
                  { destination: 'Manali', days: '4 days', price: '₹20,000', icon: '🏔️' },
                  { destination: 'Kerala', days: '5 days', price: '₹25,000', icon: '🌴' },
                  { destination: 'Rajasthan', days: '6 days', price: '₹30,000', icon: '🏰' }
                ].map((trip, index) => (
                  <motion.button
                    key={trip.destination}
                    onClick={() => navigate(`/create-trip-ultra?destination=${trip.destination}&duration=${trip.days.split(' ')[0]}`)}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg hover:shadow-xl border border-white/30 transition-all duration-300"
                  >
                    <div className="text-3xl mb-2">{trip.icon}</div>
                    <div className="font-semibold text-gray-900">{trip.destination}</div>
                    <div className="text-sm text-gray-600">{trip.days}</div>
                    <div className="text-sm font-semibold text-purple-600">{trip.price}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          style={{ y: y2 }}
          className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-60"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          style={{ y: y1 }}
          className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-60"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </motion.section>

      {/* Features Showcase */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🚀 Revolutionary AI Features
            </h2>
            <p className="text-xl text-gray-600">
              Experience the next generation of travel planning technology
            </p>
          </motion.div>

          {/* Interactive Feature Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Feature List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    currentFeature === index
                      ? `bg-${feature.color}-50 border-2 border-${feature.color}-500 shadow-lg`
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 bg-${feature.color}-100 rounded-xl`}>
                      <div className={`text-${feature.color}-600`}>
                        {feature.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {feature.description}
                      </p>
                      
                      <div className="space-y-1">
                        {feature.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature Demo */}
            <motion.div
              key={currentFeature}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200"
            >
              <div className="text-center mb-6">
                <div className={`p-4 bg-${features[currentFeature].color}-100 rounded-2xl w-fit mx-auto mb-4`}>
                  <div className={`text-${features[currentFeature].color}-600`}>
                    {features[currentFeature].icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {features[currentFeature].title}
                </h3>
                <p className="text-gray-600">
                  {features[currentFeature].description}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Demo:</h4>
                <p className="text-gray-700 italic">"{features[currentFeature].demo}"</p>
              </div>
              
              <button
                onClick={() => navigate('/create-trip-ultra')}
                className={`w-full bg-gradient-to-r from-${features[currentFeature].color}-600 to-${features[currentFeature].color}-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300`}
              >
                Try This Feature
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              📊 Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-600">
              Join the revolution in AI-powered travel planning
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white"
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start planning your next adventure with AI-powered precision
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => navigate('/create-trip-ultra')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center space-x-3 px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <RocketLaunchIcon className="w-6 h-6" />
                <span>Start Your Journey</span>
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/test')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center space-x-3 px-8 py-4 border-2 border-white text-white rounded-2xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                <SparklesIcon className="w-6 h-6" />
                <span>Test Features</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Chatbot */}
      <AITravelChatbot
        onTripGenerated={(trip) => {
          console.log('Trip generated from home page:', trip);
          navigate('/create-trip-ultra', { state: { generatedTrip: trip } });
        }}
      />
    </div>
  );
};

export default NextLevelHome;
