import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  SparklesIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  PlayIcon,
  ArrowRightIcon,
  GlobeAltIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const ModernHomepage = () => {
  const navigate = useNavigate();
  const [currentDestination, setCurrentDestination] = useState(0);
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    people: 2,
    budget: 15000
  });

  const destinations = [
    { name: "Mumbai", emoji: "🏙️", gradient: "from-blue-500 to-cyan-500" },
    { name: "Paris", emoji: "🗼", gradient: "from-purple-500 to-pink-500" },
    { name: "Tokyo", emoji: "🏯", gradient: "from-red-500 to-orange-500" },
    { name: "Bali", emoji: "🏝️", gradient: "from-green-500 to-teal-500" },
    { name: "Dubai", emoji: "🏜️", gradient: "from-yellow-500 to-orange-500" },
    { name: "London", emoji: "🎡", gradient: "from-indigo-500 to-purple-500" }
  ];

  const floatingIcons = [
    { icon: "✈️", size: "text-4xl", delay: 0, duration: 8, x: "10%", y: "20%" },
    { icon: "🗺️", size: "text-5xl", delay: 2, duration: 10, x: "80%", y: "15%" },
    { icon: "🎒", size: "text-3xl", delay: 4, duration: 9, x: "15%", y: "70%" },
    { icon: "📸", size: "text-4xl", delay: 1, duration: 7, x: "85%", y: "75%" },
    { icon: "🌍", size: "text-6xl", delay: 3, duration: 11, x: "50%", y: "10%" },
    { icon: "🏖️", size: "text-3xl", delay: 5, duration: 8, x: "70%", y: "60%" },
    { icon: "🎭", size: "text-4xl", delay: 6, duration: 9, x: "25%", y: "45%" },
    { icon: "🍜", size: "text-3xl", delay: 7, duration: 10, x: "75%", y: "35%" }
  ];

  const features = [
    {
      icon: SparklesIcon,
      title: "AI-Powered Planning",
      description: "Smart algorithms create perfect itineraries",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: GlobeAltIcon,
      title: "Global Destinations",
      description: "50+ destinations with real attractions",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: CurrencyRupeeIcon,
      title: "Smart Budgeting",
      description: "Detailed cost breakdowns and optimization",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: HeartIcon,
      title: "Personalized Experience",
      description: "Tailored to your interests and preferences",
      gradient: "from-red-500 to-pink-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDestination((prev) => (prev + 1) % destinations.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStartPlanning = () => {
    if (!formData.destination.trim()) {
      alert('Please enter a destination');
      return;
    }
    navigate('/plan-next-level-trip', { 
      state: { 
        prefillData: formData
      }
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-animated-gradient"></div>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Floating Travel Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            className={`absolute ${item.size} opacity-20 text-white`}
            style={{ left: item.x, top: item.y }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, Math.random() * 10 - 5, 0],
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

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            
            {/* Hero Header */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-center mb-16"
            >
              {/* AI Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="inline-flex items-center glass-card px-6 py-3 rounded-full mb-8"
              >
                <SparklesIcon className="w-5 h-5 text-white mr-2" />
                <span className="text-sm font-semibold text-white">Powered by Advanced AI</span>
              </motion.div>

              {/* Main Title with Gradient Text */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="glass-card p-8 rounded-3xl mb-8 backdrop-blur-xl"
              >
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    Plan Your Perfect
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    AI-Powered Trip
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
                  Experience the future of travel planning with intelligent itineraries, 
                  real places, exact timings, and personalized recommendations.
                </p>
              </motion.div>

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
                    className={`inline-flex items-center bg-gradient-to-r ${destinations[currentDestination].gradient} px-6 py-3 rounded-full font-bold text-xl shadow-2xl`}
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
              className="max-w-4xl mx-auto glass-card p-8 rounded-3xl mb-16"
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
                    className="w-full px-6 py-4 glass border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-xl transition-all duration-300 placeholder-white/70 text-white"
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
                    className="w-full px-6 py-4 glass border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-xl transition-all duration-300 text-white"
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
                    className="w-full px-6 py-4 glass border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-xl transition-all duration-300 text-white"
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
                  className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider backdrop-blur-sm"
                />
                <div className="flex justify-between text-xs text-white/60 mt-2">
                  <span>₹5K</span>
                  <span>₹1L</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.button
                  onClick={handleStartPlanning}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-5 px-10 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 flex items-center justify-center group"
                >
                  <SparklesIcon className="w-6 h-6 mr-3 group-hover:animate-spin" />
                  Start Planning Now
                  <ArrowRightIcon className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center text-white/80 hover:text-white font-medium transition-colors group"
                >
                  <div className="w-12 h-12 glass rounded-full flex items-center justify-center mr-3 group-hover:bg-white/20 transition-all">
                    <PlayIcon className="w-6 h-6 ml-1" />
                  </div>
                  Watch Demo
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-24 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
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
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="glass-card p-8 rounded-3xl text-center group cursor-pointer"
                >
                  <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernHomepage;
