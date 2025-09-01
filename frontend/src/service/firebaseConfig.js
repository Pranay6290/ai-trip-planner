// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { validateFirebaseConfig, logFirebaseConfigStatus } from '../utils/firebaseValidator';

// Validate Firebase configuration first
const validation = validateFirebaseConfig();

if (!validation.isValid) {
  console.error('❌ Firebase configuration is invalid!');
  validation.errors.forEach(error => console.error(`  - ${error}`));

  // Show helpful instructions
  console.log('\n🔧 To fix Firebase configuration:');
  console.log('1. Go to https://console.firebase.google.com');
  console.log('2. Select your project');
  console.log('3. Go to Project Settings > General');
  console.log('4. Scroll to "Your apps" and copy the config');
  console.log('5. Update your frontend/.env file with the correct values');

  throw new Error('Firebase configuration is invalid. Please check your .env file.');
}

// Use validated configuration
const firebaseConfig = validation.config;

// Log successful configuration
logFirebaseConfigStatus();

// Initialize Firebase
let app, db, auth, analytics;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  auth.languageCode = 'en';

  // Set auth persistence to LOCAL to prevent automatic sign-out
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn('⚠️ Could not set auth persistence:', error);
  });

  // Initialize Analytics (only when measurement ID is properly configured)
  if (firebaseConfig.measurementId &&
      firebaseConfig.measurementId !== '' &&
      !firebaseConfig.measurementId.includes('XXXXXXXXXX') &&
      typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
      console.log('✅ Firebase Analytics initialized');
    } catch (analyticsError) {
      console.warn('⚠️ Firebase Analytics initialization failed:', analyticsError.message);
    }
  } else {
    console.log('ℹ️ Firebase Analytics skipped - no valid measurement ID');
  }

  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.error('Please check your Firebase configuration in .env file');
  throw new Error('Firebase initialization failed. Please check your configuration.');
}

export { app, db, auth, analytics };

// Google Auth Provider with better configuration
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline'
});

// Add required scopes
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.addScope('openid');

// Authentication functions
export const signInWithGooglePopup = async () => {
  if (!auth) {
    console.error('❌ Firebase Auth not initialized');
    throw new Error('Firebase Auth not initialized');
  }

  try {
    console.log('🔄 Attempting Google sign-in...');

    // Add a small delay to ensure Google API is fully loaded
    await new Promise(resolve => setTimeout(resolve, 100));

    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Google sign-in successful:', result.user.email);
    return result;
  } catch (error) {
    console.error('❌ Google popup sign-in error:', error);

    // Handle specific Google Sign-In errors
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups and try again.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.code === 'auth/internal-error') {
      throw new Error('Authentication service error. Please try again later.');
    } else if (error.message && error.message.includes('initial state')) {
      throw new Error('Google Sign-In initialization error. Please refresh the page and try again.');
    }

    throw error;
  }
};

export const signInWithGoogleRedirect = () => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  return signInWithRedirect(auth, googleProvider);
};

export const createAuthUserWithEmailAndPassword = async (email, password) => {
  if (!email || !password) return;
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInAuthUserWithEmailAndPassword = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }

  try {
    console.log('🔄 Attempting email/password sign-in for:', email);

    // Clear any existing auth state first
    if (auth.currentUser) {
      console.log('🔄 Clearing existing auth state...');
      await signOut(auth);
    }

    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Email sign-in successful:', result.user.email);
    console.log('✅ User UID:', result.user.uid);

    // Verify the user token is valid
    const token = await result.user.getIdToken();
    console.log('✅ User token obtained successfully');

    return result;
  } catch (error) {
    console.error('❌ Email sign-in error:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);

    // Handle specific email sign-in errors
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address. Please sign up first.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    } else if (error.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    throw error;
  }
};

export const signOutUser = async () => await signOut(auth);

export const onAuthStateChangedListener = (callback) => onAuthStateChanged(auth, callback);

// User document functions
export const createUserDocumentFromAuth = async (userAuth, additionalInformation = {}) => {
  if (!userAuth) {
    console.warn('⚠️ No user auth provided to createUserDocumentFromAuth');
    return;
  }

  if (!db) {
    console.error('❌ Firestore not initialized');
    throw new Error('Firestore not initialized');
  }

  try {
    const userDocRef = doc(db, 'users', userAuth.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      const { displayName, email } = userAuth;
      const createdAt = new Date();

      console.log('🔄 Creating user document for:', email);

      await setDoc(userDocRef, {
        displayName: displayName || email?.split('@')[0] || 'User',
        email,
        createdAt,
        lastLoginAt: new Date(),
        ...additionalInformation
      });

      console.log('✅ User document created successfully');
    } else {
      // Update last login time for existing users
      await setDoc(userDocRef, {
        lastLoginAt: new Date()
      }, { merge: true });

      console.log('✅ User document updated with last login');
    }

    return userDocRef;
  } catch (error) {
    console.error('❌ Error creating/updating user document:', error);
    throw error;
  }
};

