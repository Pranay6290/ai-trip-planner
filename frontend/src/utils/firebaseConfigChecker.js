// Firebase Configuration Checker
// Made by Pranay Gupta

export const checkFirebaseConfiguration = async () => {
  const results = {
    environment: { status: 'checking', issues: [] },
    authentication: { status: 'checking', issues: [] },
    firestore: { status: 'checking', issues: [] },
    network: { status: 'checking', issues: [] },
    overall: { status: 'checking', message: '' }
  };

  console.log('🔍 Checking Firebase configuration...');

  // Check 1: Environment Variables
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  const invalidVars = requiredEnvVars.filter(varName => {
    const value = import.meta.env[varName];
    return value && (value.includes('your_') || value.includes('YOUR_') || value === '');
  });

  if (missingVars.length === 0 && invalidVars.length === 0) {
    results.environment.status = 'success';
  } else {
    results.environment.status = 'error';
    if (missingVars.length > 0) {
      results.environment.issues.push(`Missing variables: ${missingVars.join(', ')}`);
    }
    if (invalidVars.length > 0) {
      results.environment.issues.push(`Invalid placeholder values: ${invalidVars.join(', ')}`);
    }
  }

  // Check 2: Firebase Authentication Configuration
  try {
    const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    
    if (authDomain && projectId) {
      // Check if auth domain matches project ID pattern
      const expectedDomain = `${projectId}.firebaseapp.com`;
      if (authDomain === expectedDomain) {
        results.authentication.status = 'success';
      } else {
        results.authentication.status = 'warning';
        results.authentication.issues.push(`Auth domain "${authDomain}" doesn't match expected pattern "${expectedDomain}"`);
      }
    } else {
      results.authentication.status = 'error';
      results.authentication.issues.push('Missing auth domain or project ID');
    }
  } catch (error) {
    results.authentication.status = 'error';
    results.authentication.issues.push(`Auth configuration error: ${error.message}`);
  }

  // Check 3: Firestore Configuration
  try {
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
    
    if (projectId && storageBucket) {
      // Check if storage bucket matches project ID pattern
      const expectedBucket = `${projectId}.appspot.com` || `${projectId}.firebasestorage.app`;
      if (storageBucket.includes(projectId)) {
        results.firestore.status = 'success';
      } else {
        results.firestore.status = 'warning';
        results.firestore.issues.push(`Storage bucket "${storageBucket}" doesn't contain project ID "${projectId}"`);
      }
    } else {
      results.firestore.status = 'error';
      results.firestore.issues.push('Missing project ID or storage bucket');
    }
  } catch (error) {
    results.firestore.status = 'error';
    results.firestore.issues.push(`Firestore configuration error: ${error.message}`);
  }

  // Check 4: Network and Domain Configuration
  try {
    const currentDomain = window.location.hostname;
    const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
    
    // Common development domains
    const devDomains = ['localhost', '127.0.0.1', '0.0.0.0'];
    const isDevEnvironment = devDomains.includes(currentDomain);
    
    if (isDevEnvironment) {
      results.network.status = 'success';
      results.network.issues.push('Development environment detected - make sure localhost is in Firebase authorized domains');
    } else {
      results.network.status = 'warning';
      results.network.issues.push(`Production domain "${currentDomain}" - ensure it's added to Firebase authorized domains`);
    }
  } catch (error) {
    results.network.status = 'error';
    results.network.issues.push(`Network configuration error: ${error.message}`);
  }

  // Overall Status
  const hasErrors = Object.values(results).some(result => result.status === 'error');
  const hasWarnings = Object.values(results).some(result => result.status === 'warning');

  if (!hasErrors && !hasWarnings) {
    results.overall.status = 'success';
    results.overall.message = 'All Firebase configuration checks passed! 🎉';
  } else if (hasErrors) {
    results.overall.status = 'error';
    results.overall.message = 'Critical configuration issues found. Please fix these before proceeding.';
  } else {
    results.overall.status = 'warning';
    results.overall.message = 'Configuration looks good with minor warnings.';
  }

  console.log('📊 Firebase configuration check results:', results);
  return results;
};

export const getFirebaseSetupInstructions = () => {
  return {
    title: 'Firebase Setup Instructions',
    steps: [
      {
        step: 1,
        title: 'Go to Firebase Console',
        description: 'Visit https://console.firebase.google.com and select your project',
        action: 'Navigate to your Firebase project'
      },
      {
        step: 2,
        title: 'Enable Authentication',
        description: 'Go to Authentication → Sign-in method',
        action: 'Enable Email/Password and Google providers'
      },
      {
        step: 3,
        title: 'Configure Authorized Domains',
        description: 'In Authentication → Settings → Authorized domains',
        action: 'Add localhost, 127.0.0.1, and your production domain'
      },
      {
        step: 4,
        title: 'Enable Firestore',
        description: 'Go to Firestore Database',
        action: 'Create database in test mode'
      },
      {
        step: 5,
        title: 'Get Configuration',
        description: 'Go to Project Settings → General → Your apps',
        action: 'Copy the firebaseConfig object'
      },
      {
        step: 6,
        title: 'Update Environment Variables',
        description: 'Update your frontend/.env file',
        action: 'Replace all VITE_FIREBASE_* variables with actual values'
      },
      {
        step: 7,
        title: 'Restart Development Server',
        description: 'Stop and restart your dev server',
        action: 'npm run dev (after stopping current server)'
      }
    ],
    troubleshooting: [
      {
        issue: 'auth/network-request-failed',
        solution: 'Check internet connection and Firebase project status'
      },
      {
        issue: 'auth/unauthorized-domain',
        solution: 'Add your domain to Firebase authorized domains'
      },
      {
        issue: 'auth/popup-blocked',
        solution: 'Allow popups for this site or use redirect method'
      },
      {
        issue: 'Cross-Origin-Opener-Policy',
        solution: 'This is a browser security warning, usually safe to ignore'
      }
    ]
  };
};

export const generateFirebaseEnvTemplate = (projectId = 'your-project-id') => {
  return `# Firebase Configuration for ${projectId}
# Replace these values with your actual Firebase config

VITE_FIREBASE_API_KEY=AIzaSyB96Ex-CxCQ53susobUf7Lr69wqv-6Irs8
VITE_FIREBASE_AUTH_DOMAIN=${projectId}.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=${projectId}
VITE_FIREBASE_STORAGE_BUCKET=${projectId}.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1038244171634
VITE_FIREBASE_APP_ID=1:1038244171634:web:fc14ec77ec3ec7caa897eb
VITE_FIREBASE_MEASUREMENT_ID=G-46F6XHWS48

# Other API Keys (keep these as they are)
VITE_GOOGLE_GEMINI_AI_API_KEY=AIzaSyD_qdorXpygsi06l0VeUcRy0JwGANWv_0g
VITE_GOOGLE_PLACES_API_KEY=AIzaSyBx_mpCRN8nJ00phBGvJVLMhm0d-QMItDw
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBx_mpCRN8nJ00phBGvJVLMhm0d-QMItDw
VITE_WEATHER_API_KEY=your_weather_api_key_here`;
};

// Auto-run configuration check in development
if (import.meta.env.DEV) {
  checkFirebaseConfiguration().then(results => {
    if (results.overall.status === 'error') {
      console.error('🚨 Firebase configuration issues detected!');
      console.log('📋 Setup instructions:', getFirebaseSetupInstructions());
    } else {
      console.log('✅ Firebase configuration looks good!');
    }
  });
}
