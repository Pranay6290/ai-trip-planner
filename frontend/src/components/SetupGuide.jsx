import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FirebaseTest from './FirebaseTest';

const SetupGuide = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showTest, setShowTest] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Create Firebase Project',
      description: 'Set up your Firebase project and enable Authentication',
      content: (
        <div className="space-y-4">
          <p>1. Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Firebase Console</a></p>
          <p>2. Click "Create a project" or select existing project</p>
          <p>3. Enable Google Analytics (optional)</p>
          <p>4. Wait for project creation to complete</p>
        </div>
      )
    },
    {
      id: 2,
      title: 'Enable Authentication',
      description: 'Configure authentication methods',
      content: (
        <div className="space-y-4">
          <p>1. In your Firebase project, go to <strong>Authentication</strong></p>
          <p>2. Click <strong>Get started</strong></p>
          <p>3. Go to <strong>Sign-in method</strong> tab</p>
          <p>4. Enable <strong>Email/Password</strong> and <strong>Google</strong> providers</p>
          <p>5. For Google sign-in, add your domain to authorized domains</p>
        </div>
      )
    },
    {
      id: 3,
      title: 'Enable Firestore',
      description: 'Set up Firestore database',
      content: (
        <div className="space-y-4">
          <p>1. Go to <strong>Firestore Database</strong></p>
          <p>2. Click <strong>Create database</strong></p>
          <p>3. Choose <strong>Start in test mode</strong> (for development)</p>
          <p>4. Select a location for your database</p>
          <p>5. Click <strong>Done</strong></p>
        </div>
      )
    },
    {
      id: 4,
      title: 'Get Configuration',
      description: 'Copy your Firebase configuration',
      content: (
        <div className="space-y-4">
          <p>1. Go to <strong>Project Settings</strong> (gear icon)</p>
          <p>2. Scroll down to <strong>Your apps</strong> section</p>
          <p>3. If no web app exists, click <strong>Add app</strong> → Web</p>
          <p>4. Copy the <code className="bg-gray-100 px-1 rounded">firebaseConfig</code> object</p>
          <div className="bg-gray-100 p-3 rounded text-sm">
            <p className="font-semibold mb-2">Your config will look like:</p>
            <pre className="text-xs overflow-x-auto">
{`const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'Update Environment Variables',
      description: 'Add configuration to your .env file',
      content: (
        <div className="space-y-4">
          <p>1. Open <code className="bg-gray-100 px-1 rounded">frontend/.env</code> file</p>
          <p>2. Replace the placeholder values with your actual Firebase config:</p>
          <div className="bg-gray-900 text-green-400 p-4 rounded text-sm font-mono">
            <pre>
{`VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id`}
            </pre>
          </div>
          <p className="text-amber-600">⚠️ <strong>Important:</strong> Restart your development server after updating .env</p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔧 Firebase Setup Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Follow these steps to configure Firebase for your AI Trip Planner
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.id}
                </div>
                {step.id < steps.length && (
                  <div className={`w-full h-1 mx-4 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 mb-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Step {currentStep}: {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600">{steps[currentStep - 1].description}</p>
          </div>
          
          <div className="text-gray-700">
            {steps[currentStep - 1].content}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span>← Previous</span>
          </button>

          <div className="flex space-x-4">
            <button
              onClick={() => setShowTest(!showTest)}
              className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-all duration-300"
            >
              {showTest ? 'Hide Test' : 'Test Configuration'}
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                <span>Next →</span>
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-300"
              >
                <span>Complete Setup</span>
              </button>
            )}
          </div>
        </div>

        {/* Firebase Test Component */}
        {showTest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Configuration Test</h3>
            <FirebaseTest />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SetupGuide;
