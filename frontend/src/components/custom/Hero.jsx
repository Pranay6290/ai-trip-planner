import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UsersIcon,
  ArrowRightIcon,
  PlayIcon,
  CurrencyRupeeIcon,
  ChevronDownIcon,
  PaperAirplaneIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import designSystem from '../../styles/designSystem';
import { toast } from 'react-hot-toast';

function Hero() {
  const navigate = useNavigate();
  const [currentDestination, setCurrentDestination] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    people: 2,
    budget: 15000
  });

  const destinations = [
    { name: "Mumbai", emoji: "🏙️", color: "from-blue-500 to-cyan-500" },
    { name: "Paris", emoji: "🗼", color: "from-purple-500 to-pink-500" },
    { name: "Tokyo", emoji: "🏯", color: "from-red-500 to-orange-500" },
    { name: "Bali", emoji: "🏝️", color: "from-green-500 to-teal-500" },
    { name: "New York", emoji: "🗽", color: "from-yellow-500 to-orange-500" },
    { name: "Dubai", emoji: "🏜️", color: "from-orange-500 to-red-500" }
  ];

  const floatingIcons = [
    { icon: "✈️", delay: 0, duration: 8 },
    { icon: "🗺️", delay: 2, duration: 10 },
    { icon: "🎒", delay: 4, duration: 9 },
    { icon: "📸", delay: 1, duration: 7 },
    { icon: "🌍", delay: 3, duration: 11 },
    { icon: "🏖️", delay: 5, duration: 8 }
  ];

  const features = [
    { icon: SparklesIcon, text: "AI-Powered Planning", description: "Smart itineraries tailored to you" },
    { icon: MapPinIcon, text: "Global Destinations", description: "50+ destinations worldwide" },
    { icon: CalendarDaysIcon, text: "Smart Scheduling", description: "Optimized timing & routes" },
    { icon: CurrencyRupeeIcon, text: "Budget Tracking", description: "Real-time cost management" }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentDestination((prev) => (prev + 1) % destinations.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlanTrip = () => {
    if (!formData.destination.trim()) {
      toast.error('Please enter a destination');
      return;
    }

    // Navigate to trip planner with pre-filled data
    navigate('/plan-next-level-trip', {
      state: {
        prefillData: {
          destination: formData.destination,
          duration: formData.days,
          travelers: formData.people,
          budget: formData.budget
        }
      }
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className={`absolute inset-0 ${designSystem.gradients.heroBackground} ${designSystem.gradients.animated}`}>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Floating Travel Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl opacity-20"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, Math.random() * 20 - 10, 0],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-float delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">

            {/* Hero Header */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-center mb-16"
            >
              {/* AI Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className={`inline-flex items-center ${designSystem.components.card.glass} px-6 py-3 mb-8`}
              >
                <SparklesIcon className="w-5 h-5 text-white mr-2" />
                <span className="text-sm font-semibold text-white">Powered by Advanced AI</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight"
                style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
              >
                Plan Your Perfect Trip
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  with AI
                </span>
              </motion.h1>

              {/* Animated Destination Showcase */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex items-center justify-center mb-12"
              >
                <span className="text-xl text-white/80 mr-4">Discover amazing places like</span>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentDestination}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex items-center bg-gradient-to-r ${destinations[currentDestination].color} px-6 py-3 rounded-full font-bold text-xl shadow-2xl`}
                  >
                    <span className="mr-3 text-2xl">{destinations[currentDestination].emoji}</span>
                    {destinations[currentDestination].name}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Trip Planning Form */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className={`max-w-4xl mx-auto ${designSystem.components.card.glass} p-8 mb-16`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Destination Input */}
                <div className="lg:col-span-2">
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    <MapPinIcon className="w-4 h-4 inline mr-1" />
                    Where to?
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    placeholder="Enter destination..."
                    className={designSystem.components.input.glass}
                  />
                </div>

                {/* Days Input */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                    Days
                  </label>
                  <select
                    value={formData.days}
                    onChange={(e) => handleInputChange('days', parseInt(e.target.value))}
                    className={designSystem.components.input.glass}
                  >
                    {[1,2,3,4,5,6,7,10,14].map(day => (
                      <option key={day} value={day} className="bg-gray-800 text-white">
                        {day} {day === 1 ? 'Day' : 'Days'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* People Input */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    <UsersIcon className="w-4 h-4 inline mr-1" />
                    People
                  </label>
                  <select
                    value={formData.people}
                    onChange={(e) => handleInputChange('people', parseInt(e.target.value))}
                    className={designSystem.components.input.glass}
                  >
                    {[1,2,3,4,5,6,8,10].map(count => (
                      <option key={count} value={count} className="bg-gray-800 text-white">
                        {count} {count === 1 ? 'Person' : 'People'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget Slider */}
              <div className="mb-8">
                <label className="block text-white/80 text-sm font-medium mb-4">
                  <CurrencyRupeeIcon className="w-4 h-4 inline mr-1" />
                  Budget: ₹{formData.budget.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-white/60 mt-2">
                  <span>₹5K</span>
                  <span>₹1L</span>
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                onClick={handlePlanTrip}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full ${designSystem.components.button.cta} group`}
              >
                <PaperAirplaneIcon className="w-6 h-6 mr-3 group-hover:translate-x-1 transition-transform" />
                Plan My Perfect Trip
                <SparklesIcon className="w-6 h-6 ml-3 group-hover:rotate-12 transition-transform" />
              </motion.button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2 }}
              className="text-center"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex flex-col items-center text-white/60 cursor-pointer hover:text-white/80 transition-colors"
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="text-sm font-medium mb-2">Discover Features</span>
                <ChevronDownIcon className="w-6 h-6" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 py-24 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose Our AI Trip Planner?
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Experience the future of travel planning with intelligent features designed to create your perfect journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`${designSystem.components.card.glass} p-8 text-center group cursor-pointer`}
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.text}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  )
}

export default Hero
