import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Logo from './components/ui/Logo';

import ModernHomepage from './components/modern/ModernHomepage';
import QuickRecommendations from './components/custom/QuickRecommendations';
import { validateFirebaseConfig } from './utils/firebaseValidator';
import SetupGuide from './components/SetupGuide';
import FirebaseStatus from './components/FirebaseStatus';
import NextLevelChatbot from './components/chatbot/NextLevelChatbot';
import EnhancedFooter from './components/custom/EnhancedFooter';
import {
  MapPinIcon,
  SparklesIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ClockIcon,
  HeartIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

function App() {
  const { currentUser, isLoading } = useAuth();
  const [firebaseConfigValid, setFirebaseConfigValid] = useState(null);

  useEffect(() => {
    try {
      const validation = validateFirebaseConfig();
      setFirebaseConfigValid(validation.isValid);
    } catch (error) {
      console.error('Firebase configuration error:', error);
      setFirebaseConfigValid(false);
    }
  }, []);

  // Show setup guide if Firebase is not configured
  if (firebaseConfigValid === false) {
    return <SetupGuide />;
  }

  // Show loading while checking configuration
  if (firebaseConfigValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking Firebase configuration...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Planning',
      description: 'Get personalized trip recommendations powered by advanced AI technology'
    },
    {
      icon: MapPinIcon,
      title: 'Smart Destinations',
      description: 'Discover hidden gems and popular attractions tailored to your preferences'
    },
    {
      icon: ClockIcon,
      title: 'Time Optimization',
      description: 'Efficiently planned itineraries that maximize your travel experience'
    },
    {
      icon: UserGroupIcon,
      title: 'Group Planning',
      description: 'Perfect for solo travelers, couples, families, and friend groups'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Coverage',
      description: 'Plan trips to destinations worldwide with local insights'
    },
    {
      icon: HeartIcon,
      title: 'Personalized Experience',
      description: 'Every trip is unique, crafted specifically for your interests and budget'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Modern Homepage */}
      <ModernHomepage />



      {/* Ultra Professional Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white/85"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.8, type: "spring" }}
                className="flex justify-center mb-8"
              >
                <Logo size="xl" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-8 leading-tight tracking-tight"
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}
              >
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Your AI-Powered Travel Companion
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.8, type: "spring" }}
                className="flex justify-center mb-8"
              >
                <motion.span
                  className="text-6xl"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut"
                  }}
                >
                  ✨
                </motion.span>
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-2xl md:text-3xl text-slate-800 mb-6 max-w-4xl mx-auto font-semibold leading-relaxed"
            >
              Discover amazing destinations with AI-powered intelligence
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-lg text-slate-700 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Create personalized itineraries, get real-time recommendations, and make unforgettable memories
              with our intelligent travel planning assistant.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              {currentUser ? (
                <motion.div
                  whileHover={{
                    scale: 1.02,
                    y: -1,
                    boxShadow: "0 8px 25px rgba(59, 130, 246, 0.25)"
                  }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="relative"
                >
                  <Link
                    to="/enhanced-planner"
                    className="group relative inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-lg text-white overflow-hidden shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    {/* Minimal shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>

                    <span className="relative flex items-center z-10">
                      <SparklesIcon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                      Start Planning
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 2, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        →
                      </motion.div>
                    </span>
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      y: -2,
                      boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Link
                      to="/signup"
                      className="group relative inline-flex items-center justify-center px-10 py-4 rounded-2xl font-semibold text-lg text-white overflow-hidden shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <span className="relative flex items-center z-10">
                        <UserGroupIcon className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                        Get Started Free
                        <motion.div
                          className="ml-2"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          →
                        </motion.div>
                      </span>
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{
                      scale: 1.02,
                      y: -1
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative z-20"
                  >
                    <Link
                      to="/login"
                      className="group inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-lg text-slate-900 bg-white border-2 border-slate-400 hover:border-slate-600 hover:bg-slate-100 transition-all duration-200 shadow-xl hover:shadow-2xl"
                      style={{ position: 'relative', zIndex: 20 }}
                    >
                      <ArrowRightIcon className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform duration-200" />
                      Sign In
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>

          {/* Professional Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mt-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.3 }}
                className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-slate-800 font-semibold">Happy Travelers</div>
                <div className="text-slate-600 text-sm mt-1">Worldwide</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-4xl font-bold text-purple-600 mb-2">150+</div>
                <div className="text-slate-800 font-semibold">Destinations</div>
                <div className="text-slate-600 text-sm mt-1">Global Coverage</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-slate-800 font-semibold">AI Support</div>
                <div className="text-slate-600 text-sm mt-1">Always Available</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Development Firebase Status - Only show in development */}
      {import.meta.env.DEV && (
        <section className="py-8 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <FirebaseStatus />
          </div>
        </section>
      )}

      {/* Professional Features Section */}
      <section className="py-24 relative bg-white">
        {/* Clean background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight"
            >
              Why Choose Our{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Travel AI?
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
            >
              Experience the future of travel planning with intelligent recommendations,
              real-time optimization, and seamless organization.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Recommendations Section */}
      <QuickRecommendations />

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of travelers who trust our AI to plan their perfect trips.
            </p>
            {currentUser ? (
              <Link
                to="/create-trip"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 inline-block"
              >
                Create Your First Trip
              </Link>
            ) : (
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 inline-block"
              >
                Start Planning Today
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <EnhancedFooter />

      {/* AI Chatbot */}
      <NextLevelChatbot />

    </div>
  );
}

export default App;
