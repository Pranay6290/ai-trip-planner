import React, { useState, useEffect } from 'react';
import { auth } from '../service/firebaseConfig';
import { validateFirebaseConfig } from '../utils/firebaseValidator';

const FirebaseTest = () => {
  const [configStatus, setConfigStatus] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    // Test Firebase configuration
    try {
      const validation = validateFirebaseConfig();
      setConfigStatus(validation);
    } catch (error) {
      setConfigStatus({ isValid: false, error: error.message });
    }

    // Test Firebase Auth
    try {
      if (auth) {
        setAuthStatus({ isValid: true, message: 'Firebase Auth initialized successfully' });
      } else {
        setAuthStatus({ isValid: false, message: 'Firebase Auth not initialized' });
      }
    } catch (error) {
      setAuthStatus({ isValid: false, message: error.message });
    }
  }, []);

  if (!configStatus) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p>Testing Firebase configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Configuration Status */}
      <div className={`p-4 rounded-lg border ${
        configStatus.isValid 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <h3 className="font-semibold mb-2">
          {configStatus.isValid ? '✅ Firebase Configuration' : '❌ Firebase Configuration'}
        </h3>
        {configStatus.isValid ? (
          <p className="text-green-700">All environment variables are properly configured</p>
        ) : (
          <div className="text-red-700">
            <p className="mb-2">Configuration issues found:</p>
            <ul className="list-disc list-inside space-y-1">
              {configStatus.errors?.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Auth Status */}
      <div className={`p-4 rounded-lg border ${
        authStatus?.isValid 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <h3 className="font-semibold mb-2">
          {authStatus?.isValid ? '✅ Firebase Auth' : '❌ Firebase Auth'}
        </h3>
        <p className={authStatus?.isValid ? 'text-green-700' : 'text-red-700'}>
          {authStatus?.message}
        </p>
      </div>

      {/* Help Section */}
      {(!configStatus.isValid || !authStatus?.isValid) && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold mb-2">🔧 How to Fix</h3>
          <div className="text-blue-700 space-y-2">
            <p>1. Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></p>
            <p>2. Select your project</p>
            <p>3. Go to Project Settings → General</p>
            <p>4. Scroll to "Your apps" section</p>
            <p>5. Copy the config values to your <code className="bg-blue-100 px-1 rounded">frontend/.env</code> file:</p>
            <pre className="bg-blue-100 p-2 rounded text-xs mt-2 overflow-x-auto">
{`VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirebaseTest;
