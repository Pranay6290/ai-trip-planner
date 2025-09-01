import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      // Check if we have the required environment variables
      const hasCredentials = process.env.FIREBASE_PROJECT_ID &&
                           process.env.FIREBASE_CLIENT_EMAIL &&
                           process.env.FIREBASE_PRIVATE_KEY;

      if (hasCredentials &&
          !process.env.FIREBASE_CLIENT_EMAIL.includes('your-email') &&
          !process.env.FIREBASE_PRIVATE_KEY.includes('YOUR_PRIVATE_KEY_HERE')) {
        // Use service account credentials
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
          databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
        });
        console.log('✅ Firebase Admin initialized with service account');
      } else {
        // For development, try to initialize with application default credentials
        // This works if you have Firebase CLI installed and logged in
        try {
          admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID || 'ai-trip-planner-268b',
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || 'ai-trip-planner-268b'}-default-rtdb.firebaseio.com`
          });
          console.log('✅ Firebase Admin initialized with default credentials');
          console.log(`📍 Project ID: ${process.env.FIREBASE_PROJECT_ID || 'ai-trip-planner-268b'}`);
        } catch (defaultError) {
          console.warn('⚠️ Firebase Admin not initialized - some features may not work');
          console.warn('To fix this, either:');
          console.warn('1. Run "firebase login" and "firebase use ai-trip-planner-268b"');
          console.warn('2. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env');
          console.warn('3. Generate service account key from Firebase Console');
        }
      }
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    console.warn('⚠️ Continuing without Firebase Admin - some features may not work');
  }
};

// Get Firestore instance
export const getFirestore = () => {
  try {
    return admin.firestore();
  } catch (error) {
    console.error('Error getting Firestore instance:', error);
    return null;
  }
};

// Get Auth instance
export const getAuth = () => {
  try {
    return admin.auth();
  } catch (error) {
    console.error('Error getting Auth instance:', error);
    return null;
  }
};

// Verify Firebase ID Token
export const verifyIdToken = async (idToken) => {
  try {
    const auth = getAuth();
    if (!auth) throw new Error('Firebase Auth not initialized');
    
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
};

// Initialize Firebase on module load
initializeFirebase();

export default admin;
