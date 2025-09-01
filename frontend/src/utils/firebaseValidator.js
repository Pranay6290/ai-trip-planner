// Firebase Configuration Validator
// Made by Pranay Gupta

export const validateFirebaseConfig = () => {
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const optionalEnvVars = [
    'VITE_FIREBASE_MEASUREMENT_ID'
  ];

  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

  const missingVars = [];
  const invalidVars = [];

  // Check for missing variables
  requiredEnvVars.forEach(envVar => {
    const value = import.meta.env[envVar];
    if (!value) {
      missingVars.push(envVar);
    } else if (value.includes('your_') || value.includes('YOUR_')) {
      invalidVars.push(envVar);
    }
  });

  const isValid = missingVars.length === 0 && invalidVars.length === 0;

  return {
    isValid,
    config,
    missingVars,
    invalidVars,
    errors: [
      ...missingVars.map(v => `Missing environment variable: ${v}`),
      ...invalidVars.map(v => `Invalid placeholder value for: ${v}`)
    ]
  };
};

export const logFirebaseConfigStatus = () => {
  const validation = validateFirebaseConfig();
  
  if (validation.isValid) {
    console.log('✅ Firebase configuration is valid');
    return true;
  } else {
    console.error('❌ Firebase configuration errors:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    
    console.log('\n🔧 To fix these issues:');
    console.log('1. Copy your Firebase config from: https://console.firebase.google.com');
    console.log('2. Go to Project Settings > General > Your apps');
    console.log('3. Copy the config values to your .env file');
    console.log('4. Make sure all VITE_FIREBASE_* variables are set correctly');
    
    return false;
  }
};

export const getFirebaseConfigHelp = () => {
  return {
    steps: [
      {
        step: 1,
        title: 'Go to Firebase Console',
        description: 'Visit https://console.firebase.google.com',
        action: 'Navigate to your project'
      },
      {
        step: 2,
        title: 'Project Settings',
        description: 'Click the gear icon and select "Project settings"',
        action: 'Find your project settings'
      },
      {
        step: 3,
        title: 'App Configuration',
        description: 'Scroll down to "Your apps" section',
        action: 'Look for your web app'
      },
      {
        step: 4,
        title: 'Copy Config',
        description: 'Copy the firebaseConfig object values',
        action: 'Get your configuration values'
      },
      {
        step: 5,
        title: 'Update .env',
        description: 'Add the values to your frontend/.env file',
        action: 'Set environment variables'
      }
    ],
    envTemplate: `# Add these to your frontend/.env file:
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id`
  };
};
