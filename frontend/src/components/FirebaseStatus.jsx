import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useFirestore } from '../services/firestoreService';
import { validateFirebaseConfig } from '../utils/firebaseValidator';

const FirebaseStatus = () => {
  const { currentUser } = useAuth();
  const firestore = useFirestore();
  const [status, setStatus] = useState({
    config: null,
    auth: null,
    firestore: null,
    loading: true
  });

  useEffect(() => {
    checkFirebaseStatus();
  }, [currentUser]);

  const checkFirebaseStatus = async () => {
    setStatus(prev => ({ ...prev, loading: true }));

    try {
      // Check configuration
      const configValidation = validateFirebaseConfig();
      
      // Check authentication
      const authStatus = {
        isValid: !!currentUser,
        message: currentUser ? `Signed in as ${currentUser.email}` : 'Not signed in'
      };

      // Check Firestore connection
      let firestoreStatus;
      try {
        const connectionTest = await firestore.checkConnection();
        firestoreStatus = {
          isValid: connectionTest,
          message: connectionTest ? 'Firestore connected successfully' : 'Firestore connection failed'
        };
      } catch (error) {
        firestoreStatus = {
          isValid: false,
          message: `Firestore error: ${error.message}`
        };
      }

      setStatus({
        config: configValidation,
        auth: authStatus,
        firestore: firestoreStatus,
        loading: false
      });
    } catch (error) {
      console.error('Error checking Firebase status:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const testUserTrips = async () => {
    if (!currentUser) {
      alert('Please sign in first');
      return;
    }

    try {
      console.log('Testing user trips query...');
      const trips = await firestore.getUserTrips(currentUser.uid);
      console.log('✅ Query successful! Found', trips.length, 'trips');
      alert(`Query successful! Found ${trips.length} trips`);
    } catch (error) {
      console.error('❌ Query failed:', error);
      
      if (error.message.includes('index') || error.message.includes('failed-precondition')) {
        alert('Index required! Check the browser console for the index creation link.');
      } else {
        alert(`Query failed: ${error.message}`);
      }
    }
  };

  if (status.loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Checking Firebase status...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Firebase Status</h3>
      
      {/* Configuration Status */}
      <div className={`flex items-center space-x-3 p-3 rounded-lg ${
        status.config?.isValid ? 'bg-green-50' : 'bg-red-50'
      }`}>
        <div className={`w-3 h-3 rounded-full ${
          status.config?.isValid ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">Configuration</p>
          <p className={`text-sm ${
            status.config?.isValid ? 'text-green-700' : 'text-red-700'
          }`}>
            {status.config?.isValid ? 'All environment variables configured' : 'Configuration issues found'}
          </p>
        </div>
      </div>

      {/* Authentication Status */}
      <div className={`flex items-center space-x-3 p-3 rounded-lg ${
        status.auth?.isValid ? 'bg-green-50' : 'bg-yellow-50'
      }`}>
        <div className={`w-3 h-3 rounded-full ${
          status.auth?.isValid ? 'bg-green-500' : 'bg-yellow-500'
        }`}></div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">Authentication</p>
          <p className={`text-sm ${
            status.auth?.isValid ? 'text-green-700' : 'text-yellow-700'
          }`}>
            {status.auth?.message}
          </p>
        </div>
      </div>

      {/* Firestore Status */}
      <div className={`flex items-center space-x-3 p-3 rounded-lg ${
        status.firestore?.isValid ? 'bg-green-50' : 'bg-red-50'
      }`}>
        <div className={`w-3 h-3 rounded-full ${
          status.firestore?.isValid ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">Firestore Database</p>
          <p className={`text-sm ${
            status.firestore?.isValid ? 'text-green-700' : 'text-red-700'
          }`}>
            {status.firestore?.message}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t">
        <button
          onClick={checkFirebaseStatus}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Refresh Status
        </button>
        
        {currentUser && (
          <button
            onClick={testUserTrips}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Test Query
          </button>
        )}
      </div>

      {/* Configuration Errors */}
      {!status.config?.isValid && status.config?.errors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Configuration Issues:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {status.config.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Index Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">📋 About Firestore Indexes</h4>
        <p className="text-sm text-blue-700 mb-2">
          Firestore automatically creates indexes when you run queries that need them.
        </p>
        <p className="text-sm text-blue-700">
          When you first query your trips, Firebase will provide a direct link to create the required index. 
          Just click the link and confirm!
        </p>
      </div>
    </motion.div>
  );
};

export default FirebaseStatus;
