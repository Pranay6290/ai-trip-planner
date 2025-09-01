import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, GlobeAltIcon, MapPinIcon, HeartIcon } from '@heroicons/react/24/outline';

const EnhancedLoading = ({ message = "Creating your perfect trip...", showIcons = true }) => {
  const icons = [SparklesIcon, GlobeAltIcon, MapPinIcon, HeartIcon];
  
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const iconVariants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 180, 360],
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  const pulseVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center z-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
            backgroundSize: '400% 400%'
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
        {/* Main loading animation */}
        <div className="mb-12">
          {showIcons && (
            <motion.div
              variants={containerVariants}
              animate="animate"
              className="flex justify-center space-x-6 mb-8"
            >
              {icons.map((Icon, index) => (
                <motion.div
                  key={index}
                  variants={iconVariants}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-2xl"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <Icon className="w-8 h-8" />
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {/* Central loading spinner */}
          <div className="relative flex justify-center mb-8">
            <motion.div
              className="w-32 h-32 rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <motion.div
                  variants={pulseVariants}
                  animate="animate"
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
            </motion.div>
            
            {/* Orbiting elements */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-6 h-6 rounded-full bg-gradient-to-r from-pink-400 to-yellow-400"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0',
                }}
                animate={{
                  rotate: 360,
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.5
                }}
                initial={{
                  x: 80 + i * 20,
                  y: -12,
                }}
              />
            ))}
          </div>
        </div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            style={{ backgroundSize: '200% 200%' }}
          >
            {message}
          </motion.h2>
          
          <motion.p
            className="text-lg text-gray-600 max-w-md mx-auto"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Our AI is crafting something amazing for you ✨
          </motion.p>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mt-8">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Fun facts or tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 max-w-md mx-auto"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-2xl mb-2"
          >
            💡
          </motion.div>
          <p className="text-sm text-gray-600">
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Did you know? Our AI considers over 1000 factors to create your perfect itinerary!
            </motion.span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedLoading;
