import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestore } from '../../services/firestoreService';
import Logo from '../ui/Logo';
import {
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  MapIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  StarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Header = React.memo(() => {
  const { currentUser, signOut } = useAuth();
  const firestore = useFirestore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    phone: '',
    location: '',
    occupation: '',
    profilePhoto: null
  });
  const [tempProfileData, setTempProfileData] = useState({});
  const [userTrips, setUserTrips] = useState([]);
  const location = useLocation();
  const profileRef = useRef(null);

  // Load profile data when user is available
  useEffect(() => {
    if (currentUser) {
      loadProfileData();
    }
  }, [currentUser]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
        setIsEditingProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadProfileData = async () => {
    try {
      const [userData, trips] = await Promise.all([
        firestore.getUserProfile(currentUser.uid),
        firestore.getUserTrips(currentUser.uid)
      ]);

      if (userData) {
        setProfileData({
          ...userData,
          displayName: userData.displayName || currentUser.displayName || '',
        });
      } else {
        setProfileData({
          displayName: currentUser.displayName || '',
          phone: '',
          location: '',
          occupation: '',
          profilePhoto: null
        });
      }

      setUserTrips(trips || []);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      setIsProfileOpen(false);
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const handleEditProfile = () => {
    setTempProfileData({ ...profileData });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      await firestore.updateUserProfile(currentUser.uid, tempProfileData);
      setProfileData(tempProfileData);
      setIsEditingProfile(false);
      setTempProfileData({});
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setTempProfileData({});
    setIsEditingProfile(false);
  };

  const handleInputChange = (field, value) => {
    setTempProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('profilePhoto', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate user stats
  const userStats = {
    totalTrips: userTrips.length,
    countriesVisited: new Set(userTrips.map(trip => trip.destination?.name?.split(',')[1]?.trim()).filter(Boolean)).size,
    totalDays: userTrips.reduce((sum, trip) => sum + (trip.duration || 0), 0)
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return null; // Don't show header on auth pages
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {currentUser ? (
              <>
                <Link
                  to="/create-trip"
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Create Trip</span>
                </Link>
                <Link
                  to="/my-trips"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-300"
                >
                  <MapIcon className="w-4 h-4" />
                  <span>My Trips</span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="w-8 h-8 text-gray-600" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </span>
                  </button>

                  {/* Enhanced Profile Panel */}
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                    >
                      {/* Profile Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                        <div className="flex items-center space-x-4">
                          {/* Profile Photo */}
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 p-1">
                              <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                                {(isEditingProfile ? tempProfileData.profilePhoto : profileData.profilePhoto) ? (
                                  <img
                                    src={isEditingProfile ? tempProfileData.profilePhoto : profileData.profilePhoto}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <UserIcon className="w-8 h-8 text-gray-400" />
                                )}
                              </div>
                            </div>
                            {isEditingProfile && (
                              <label className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                                <CameraIcon className="w-3 h-3" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePhotoUpload}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>

                          {/* Profile Info */}
                          <div className="flex-1">
                            {isEditingProfile ? (
                              <input
                                type="text"
                                value={tempProfileData.displayName || ''}
                                onChange={(e) => handleInputChange('displayName', e.target.value)}
                                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                                placeholder="Your name"
                              />
                            ) : (
                              <h3 className="text-lg font-bold">
                                {profileData.displayName || currentUser.displayName || 'Travel Enthusiast'}
                              </h3>
                            )}
                            <p className="text-blue-100 text-sm">{currentUser.email}</p>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
                          <div className="text-center">
                            <div className="text-xl font-bold">{userStats.totalTrips}</div>
                            <div className="text-xs text-blue-100">Trips</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold">{userStats.countriesVisited}</div>
                            <div className="text-xs text-blue-100">Countries</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold">{userStats.totalDays}</div>
                            <div className="text-xs text-blue-100">Days</div>
                          </div>
                        </div>
                      </div>

                      {/* Profile Details */}
                      <div className="p-6 space-y-4">
                        {/* Phone */}
                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="w-5 h-5 text-gray-400" />
                          {isEditingProfile ? (
                            <input
                              type="tel"
                              value={tempProfileData.phone || ''}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                              placeholder="Phone number"
                            />
                          ) : (
                            <span className="text-gray-700">
                              {profileData.phone || 'Add phone number'}
                            </span>
                          )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center space-x-3">
                          <MapPinIcon className="w-5 h-5 text-gray-400" />
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={tempProfileData.location || ''}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                              placeholder="City, Country"
                            />
                          ) : (
                            <span className="text-gray-700">
                              {profileData.location || 'Add location'}
                            </span>
                          )}
                        </div>

                        {/* Occupation */}
                        <div className="flex items-center space-x-3">
                          <BriefcaseIcon className="w-5 h-5 text-gray-400" />
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={tempProfileData.occupation || ''}
                              onChange={(e) => handleInputChange('occupation', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                              placeholder="Your profession"
                            />
                          ) : (
                            <span className="text-gray-700">
                              {profileData.occupation || 'Add occupation'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="px-6 pb-6">
                        {!isEditingProfile ? (
                          <div className="space-y-3">
                            <button
                              onClick={handleEditProfile}
                              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                            >
                              <PencilIcon className="w-4 h-4" />
                              <span>Edit Profile</span>
                            </button>
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors duration-300"
                            >
                              <ArrowRightOnRectangleIcon className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-3">
                            <button
                              onClick={handleSaveProfile}
                              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-300"
                            >
                              <CheckIcon className="w-4 h-4" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors duration-300"
                            >
                              <XMarkIcon className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4"
          >
            {currentUser ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 px-4 py-2">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <UserCircleIcon className="w-10 h-10 text-gray-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {currentUser.displayName || 'User'}
                    </p>
                    <p className="text-sm text-gray-500">{currentUser.email}</p>
                  </div>
                </div>
                <Link
                  to="/create-trip"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Create Trip</span>
                </Link>
                <Link
                  to="/my-trips"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MapIcon className="w-5 h-5" />
                  <span>My Trips</span>
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-300 w-full text-left"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 mx-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
});

Header.displayName = 'Header';

export default Header;
