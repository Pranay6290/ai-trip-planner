import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-lg', icon: 'text-sm' },
    md: { container: 'w-10 h-10', text: 'text-xl', icon: 'text-base' },
    lg: { container: 'w-12 h-12', text: 'text-2xl', icon: 'text-lg' },
    xl: { container: 'w-16 h-16', text: 'text-3xl', icon: 'text-xl' }
  };

  const currentSize = sizes[size];

  return (
    <motion.div 
      className={`flex items-center space-x-3 ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {/* Logo Icon */}
      <div className={`${currentSize.container} bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}>
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="text-white font-bold"
        >
          <div className="relative">
            {/* Airplane icon */}
            <svg 
              className={`${currentSize.icon} w-6 h-6`} 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
            {/* Sparkle effect */}
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full"
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                delay: 0.5
              }}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Logo Text */}
      <div className="flex flex-col">
        <motion.span 
          className={`${currentSize.text} font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          TripCraft
        </motion.span>
        {size === 'lg' || size === 'xl' ? (
          <motion.span 
            className="text-xs text-gray-500 font-medium -mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            AI Travel Planner
          </motion.span>
        ) : null}
      </div>
    </motion.div>
  );
};

export default Logo;
