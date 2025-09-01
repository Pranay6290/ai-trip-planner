import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  PlusIcon,
  MapIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  GlobeAltIcon,
  HeartIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolidIcon,
  PlusIcon as PlusSolidIcon,
  MapIcon as MapSolidIcon,
  UserIcon as UserSolidIcon,
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Home',
      path: '/',
      icon: HomeIcon,
      activeIcon: HomeSolidIcon,
      color: 'blue'
    },
    {
      name: 'Create Trip',
      path: '/create-trip-ultra',
      icon: PlusIcon,
      activeIcon: PlusSolidIcon,
      color: 'purple'
    },
    {
      name: 'My Trips',
      path: '/my-trips',
      icon: MapIcon,
      activeIcon: MapSolidIcon,
      color: 'green'
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: UserIcon,
      activeIcon: UserSolidIcon,
      color: 'orange'
    }
  ];

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: HomeIcon },
    { name: 'Create Trip', path: '/create-trip-ultra', icon: PlusIcon },
    { name: 'My Trips', path: '/my-trips', icon: MapIcon },
    { name: 'Favorites', path: '/favorites', icon: HeartIcon },
    { name: 'Profile', path: '/profile', icon: UserIcon },
    { name: 'Settings', path: '/settings', icon: CogIcon }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600',
      purple: isActive ? 'text-purple-600 bg-purple-50' : 'text-gray-600',
      green: isActive ? 'text-green-600 bg-green-50' : 'text-gray-600',
      orange: isActive ? 'text-orange-600 bg-orange-50' : 'text-gray-600'
    };
    return colors[color] || colors.blue;
  };

  // Hide navigation on certain pages
  const hideNavigation = ['/login', '/signup', '/onboarding'].includes(location.pathname);

  if (hideNavigation) return null;

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-2xl">
          <div className="grid grid-cols-4 gap-1 px-2 py-2">
            {navigationItems.map((item) => {
              const active = isActive(item.path);
              const Icon = active ? item.activeIcon : item.icon;
              
              return (
                <motion.button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 ${getColorClasses(item.color, active)}`}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{item.name}</span>
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Hamburger Menu */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-3 bg-white/90 backdrop-blur-lg rounded-full shadow-lg border border-white/30"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <AnimatePresence mode="wait">
            {isMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <XMarkIcon className="w-6 h-6 text-gray-700" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Bars3Icon className="w-6 h-6 text-gray-700" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-lg shadow-2xl z-50 md:hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">TripCraft</h2>
                      <p className="text-sm text-gray-500">AI Travel Planner</p>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                {currentUser && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {currentUser.displayName || 'Travel Explorer'}
                        </p>
                        <p className="text-sm text-gray-600">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Menu Items */}
                <nav className="space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.button
                      key={item.name}
                      onClick={() => {
                        navigate(item.path);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </motion.button>
                  ))}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-center text-sm text-gray-500">
                    <p>Made with ❤️ for travelers</p>
                    <p className="mt-1">Version 2.0</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tablet/Desktop Navigation Enhancement */}
      <div className="hidden md:block fixed top-4 left-4 z-50">
        <motion.div
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <GlobeAltIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">TripCraft</span>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default MobileNavigation;
