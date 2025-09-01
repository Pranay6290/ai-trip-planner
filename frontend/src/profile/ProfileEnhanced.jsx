import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useFirestore } from '../services/firestoreService';
import ProfileStats from '../components/profile/ProfileStats';
import toast from 'react-hot-toast';
import {
  UserIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  CalendarIcon,
  HeartIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  CakeIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const ProfileEnhanced = () => {
  const { currentUser } = useAuth();
  const firestore = useFirestore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userTrips, setUserTrips] = useState([]);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    dateOfBirth: '',
    occupation: '',
    education: '',
    interests: [],
    travelPreferences: {
      favoriteDestinations: [],
      travelStyle: '',
      budgetRange: '',
      preferredSeason: ''
    },
    profilePhoto: null,
    stats: {
      tripsCompleted: 0,
      countriesVisited: 0,
      totalDistance: 0,
      favoriteDestination: ''
    }
  });

  const [tempProfileData, setTempProfileData] = useState({});

  // Available interests
  const availableInterests = [
    'Adventure', 'Culture', 'Food', 'Nature', 'Photography', 'History',
    'Art', 'Music', 'Sports', 'Beach', 'Mountains', 'Cities', 'Wildlife',
    'Architecture', 'Shopping', 'Nightlife', 'Spiritual', 'Luxury'
  ];

  // Travel styles
  const travelStyles = [
    'Backpacker', 'Luxury', 'Family', 'Solo', 'Couple', 'Group',
    'Business', 'Adventure', 'Relaxation', 'Cultural', 'Eco-friendly'
  ];

  useEffect(() => {
    if (currentUser) {
      loadProfileData();
    }
  }, [currentUser]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Load profile data and user trips in parallel
      const [userData, trips] = await Promise.all([
        firestore.getUserProfile(currentUser.uid),
        firestore.getUserTrips(currentUser.uid)
      ]);

      if (userData) {
        setProfileData({
          ...profileData,
          ...userData,
          email: currentUser.email,
          displayName: userData.displayName || currentUser.displayName || ''
        });
      } else {
        // Set default data from Firebase Auth
        setProfileData({
          ...profileData,
          email: currentUser.email,
          displayName: currentUser.displayName || ''
        });
      }

      // Set user trips for stats calculation
      setUserTrips(trips || []);

    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setTempProfileData({ ...profileData });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempProfileData({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Save profile data to Firestore
      await firestore.updateUserProfile(currentUser.uid, tempProfileData);
      
      setProfileData(tempProfileData);
      setIsEditing(false);
      setTempProfileData({});
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setTempProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setTempProfileData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleInterestToggle = (interest) => {
    const currentInterests = tempProfileData.interests || [];
    const updatedInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    
    handleInputChange('interests', updatedInterests);
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

  if (loading && !profileData.email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentData = isEditing ? tempProfileData : profileData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold mb-4"
            >
              My Travel Profile
            </motion.h1>
            <p className="text-xl text-blue-100">
              Manage your travel preferences and personal information
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-xl p-8 text-center"
            >
              {/* Profile Photo */}
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    {currentData.profilePhoto ? (
                      <img
                        src={currentData.profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <CameraIcon className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Basic Info */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentData.displayName || 'Travel Enthusiast'}
              </h2>
              <p className="text-gray-600 mb-4">{currentData.email}</p>
              
              {currentData.location && (
                <div className="flex items-center justify-center text-gray-600 mb-4">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  <span>{currentData.location}</span>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentData.stats?.tripsCompleted || 0}
                  </div>
                  <div className="text-sm text-gray-600">Trips</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {currentData.stats?.countriesVisited || 0}
                  </div>
                  <div className="text-sm text-gray-600">Countries</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8">
                {!isEditing ? (
                  <motion.button
                    onClick={handleEdit}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    <PencilIcon className="w-5 h-5 inline mr-2" />
                    Edit Profile
                  </motion.button>
                ) : (
                  <div className="flex space-x-3">
                    <motion.button
                      onClick={handleSave}
                      disabled={loading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckIcon className="w-5 h-5 inline mr-2" />
                      Save
                    </motion.button>
                    <motion.button
                      onClick={handleCancel}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 inline mr-2" />
                      Cancel
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <UserIcon className="w-6 h-6 mr-3 text-blue-600" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentData.displayName || ''}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl">
                      {currentData.displayName || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={currentData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {currentData.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City, Country"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {currentData.location || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={currentData.dateOfBirth || ''}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl flex items-center">
                      <CakeIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {currentData.dateOfBirth || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occupation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentData.occupation || ''}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your profession"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl flex items-center">
                      <BriefcaseIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {currentData.occupation || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Education */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentData.education || ''}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your education background"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl flex items-center">
                      <AcademicCapIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {currentData.education || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={currentData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself and your travel experiences..."
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl min-h-[100px]">
                    {currentData.bio || 'No bio provided'}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Travel Preferences */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <GlobeAltIcon className="w-6 h-6 mr-3 text-purple-600" />
                Travel Preferences
              </h3>

              {/* Travel Style */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Travel Style
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {travelStyles.map((style) => (
                      <button
                        key={style}
                        onClick={() => handleNestedInputChange('travelPreferences', 'travelStyle', style)}
                        className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 ${
                          currentData.travelPreferences?.travelStyle === style
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    {currentData.travelPreferences?.travelStyle || 'Not selected'}
                  </div>
                )}
              </div>

              {/* Interests */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Travel Interests
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableInterests.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 ${
                          (currentData.interests || []).includes(interest)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(currentData.interests || []).length > 0 ? (
                      currentData.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No interests selected</span>
                    )}
                  </div>
                )}
              </div>

              {/* Budget Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Budget Range
                  </label>
                  {isEditing ? (
                    <select
                      value={currentData.travelPreferences?.budgetRange || ''}
                      onChange={(e) => handleNestedInputChange('travelPreferences', 'budgetRange', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select budget range</option>
                      <option value="budget">Budget (₹500-1,500)</option>
                      <option value="mid-range">Mid-range (₹1,500-4,000)</option>
                      <option value="luxury">Luxury (₹4,000+)</option>
                    </select>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl">
                      {currentData.travelPreferences?.budgetRange || 'Not selected'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Season
                  </label>
                  {isEditing ? (
                    <select
                      value={currentData.travelPreferences?.preferredSeason || ''}
                      onChange={(e) => handleNestedInputChange('travelPreferences', 'preferredSeason', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select preferred season</option>
                      <option value="spring">Spring</option>
                      <option value="summer">Summer</option>
                      <option value="monsoon">Monsoon</option>
                      <option value="autumn">Autumn</option>
                      <option value="winter">Winter</option>
                    </select>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl">
                      {currentData.travelPreferences?.preferredSeason || 'Not selected'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Travel Statistics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <StarIcon className="w-6 h-6 mr-3 text-yellow-500" />
                Travel Statistics
              </h3>

              <ProfileStats stats={currentData.stats} userTrips={userTrips} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEnhanced;
