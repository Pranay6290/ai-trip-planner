import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import ModernHomepage from './components/modern/ModernHomepage';
import NextLevelChatbot from './components/chatbot/NextLevelChatbot';
import EnhancedFooter from './components/custom/EnhancedFooter';

function AppModern() {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for smooth transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-animated-gradient flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-2xl font-bold text-white mb-2"
          >
            TripCraft AI
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-white/80"
          >
            Preparing your next-level travel experience...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Modern Homepage */}
      <ModernHomepage />
      
      {/* AI Chatbot */}
      <NextLevelChatbot />
      
      {/* Enhanced Footer */}
      <EnhancedFooter />
    </div>
  );
}

export default AppModern;
