import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  SparklesIcon,
  RocketLaunchIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  UsersIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import designSystem from '../styles/designSystem';

const NextLevelPage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const nextLevelFeatures = [
    {
      icon: SparklesIcon,
      title: "AI-Powered Intelligence",
      description: "Advanced algorithms create personalized itineraries with real places, exact timings, and optimal routes.",
      benefits: ["Smart attraction distribution", "No day repetition", "Budget optimization", "Time efficiency"],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: GlobeAltIcon,
      title: "Global Destination Coverage",
      description: "50+ destinations worldwide with real attractions, restaurants, and local experiences.",
      benefits: ["Mumbai to Paris", "Tokyo to New York", "Real place data", "Local insights"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Intelligent Chatbot",
      description: "AI assistant that understands your travel queries and provides contextual responses.",
      benefits: ["Natural language", "Smart suggestions", "Instant help", "24/7 availability"],
      color: "from-green-500 to-teal-500"
    },
    {
      icon: CurrencyRupeeIcon,
      title: "Smart Budget Management",
      description: "Detailed cost breakdowns with real-time budget tracking and optimization.",
      benefits: ["Category breakdown", "Real-time tracking", "Cost optimization", "Transparent pricing"],
      color: "from-orange-500 to-red-500"
    },
    {
      icon: MapPinIcon,
      title: "Interactive Maps & Routes",
      description: "Integrated Google Maps with optimized routes and travel time calculations.",
      benefits: ["Route optimization", "Travel time", "Distance calculation", "Transport suggestions"],
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: ShieldCheckIcon,
      title: "Production-Grade Quality",
      description: "Enterprise-level performance, security, and reliability for seamless experience.",
      benefits: ["95+ Lighthouse score", "Error handling", "Security", "Scalability"],
      color: "from-gray-500 to-slate-500"
    }
  ];

  const stats = [
    { number: "50+", label: "Global Destinations", icon: GlobeAltIcon },
    { number: "1000+", label: "Real Attractions", icon: MapPinIcon },
    { number: "95+", label: "Performance Score", icon: RocketLaunchIcon },
    { number: "24/7", label: "AI Support", icon: ChatBubbleLeftRightIcon }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Mumbai Trip",
      text: "The AI created an amazing 5-day Mumbai itinerary with real places and exact timings. No generic suggestions!",
      rating: 5
    },
    {
      name: "David Chen",
      location: "Paris Adventure",
      text: "Incredible detail! Every attraction had insider tips, costs, and optimal visiting times. Saved hours of planning.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      location: "Tokyo Experience",
      text: "The budget breakdown was spot-on. Knew exactly what to expect and stayed within budget throughout the trip.",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % nextLevelFeatures.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-800 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto text-center">
            
            {/* Hero Header */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-16"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className={`inline-flex items-center ${designSystem.components.card.glass} px-8 py-4 mb-8`}
              >
                <RocketLaunchIcon className="w-6 h-6 text-white mr-3" />
                <span className="text-lg font-semibold text-white">Next-Level AI Trip Planner</span>
              </motion.div>

              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                Experience the
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Future of Travel
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
                Revolutionary AI technology that creates detailed, personalized itineraries with real places, 
                exact timings, and intelligent optimization. No more generic travel planning.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <motion.button
                  onClick={() => navigate('/plan-next-level-trip')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${designSystem.components.button.cta} group`}
                >
                  <RocketLaunchIcon className="w-6 h-6 mr-3 group-hover:translate-y-1 transition-transform" />
                  Start Planning Now
                  <ArrowRightIcon className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <Link
                  to="/demo"
                  className="flex items-center text-white/80 hover:text-white font-medium transition-colors group"
                >
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 group-hover:bg-white/20 transition-all">
                    <SparklesIcon className="w-6 h-6" />
                  </div>
                  Watch Demo
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 py-24 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by Travelers Worldwide
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Join thousands who have discovered the power of AI-driven travel planning.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`${designSystem.components.card.glass} p-8 text-center group hover:scale-105 transition-all duration-300`}
                >
                  <Icon className="w-12 h-12 mx-auto mb-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/70 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Next-Level Features
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Discover the revolutionary features that make our AI trip planner the most advanced travel planning tool.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {nextLevelFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`${designSystem.components.card.glass} p-8 group cursor-pointer`}
                >
                  <div className={`w-16 h-16 mb-6 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-white/70 mb-6 leading-relaxed">{feature.description}</p>
                  
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-white/60">
                        <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative z-10 py-24 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What Travelers Say
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Real experiences from travelers who've used our next-level AI trip planner.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${designSystem.components.card.glass} p-8`}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-white/80 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-white/60 text-sm">{testimonial.location}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              Ready to Experience
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Next-Level Travel?
              </span>
            </h2>
            
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Join the revolution in travel planning. Create your perfect trip with AI intelligence that understands your needs.
            </p>

            <motion.button
              onClick={() => navigate('/plan-next-level-trip')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`${designSystem.components.button.cta} group text-xl px-12 py-6`}
            >
              <RocketLaunchIcon className="w-8 h-8 mr-4 group-hover:translate-y-1 transition-transform" />
              Start Your Next-Level Journey
              <SparklesIcon className="w-8 h-8 ml-4 group-hover:rotate-12 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NextLevelPage;
