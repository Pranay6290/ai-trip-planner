import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChangedListener, 
  createUserDocumentFromAuth,
  signOutUser 
} from '../service/firebaseConfig';

// Create Auth Context
const AuthContext = createContext({
  currentUser: null,
  setCurrentUser: () => null,
  isLoading: true,
  signOut: () => null
});

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    console.log('🔄 Setting up Firebase auth listener...');

    try {
      unsubscribe = onAuthStateChangedListener(async (user) => {
        console.log('🔄 Auth state changed:', user ? `${user.email} (${user.uid})` : 'signed out');

        if (user) {
          // Verify the user is actually authenticated
          try {
            const token = await user.getIdToken(true); // Force refresh token
            console.log('🔄 User token refreshed successfully');

            // Create user document in background without blocking
            createUserDocumentFromAuth(user).catch(error => {
              console.warn('⚠️ User document creation failed:', error);
            });

            setCurrentUser(user);
            console.log('✅ User authenticated successfully:', user.email);
            console.log('✅ User UID:', user.uid);
            console.log('✅ User token valid:', !!token);
          } catch (tokenError) {
            console.error('❌ User token invalid, signing out:', tokenError);
            if (tokenError.code) {
              console.error('   Firebase Error Code:', tokenError.code);
              console.error('   Firebase Error Message:', tokenError.message);
            }
            await signOutUser().catch(console.error);
            setCurrentUser(null);
          }
        } else {
          console.log('🔄 User signed out or not authenticated');
          setCurrentUser(null);
        }

        setIsLoading(false);
      });

      console.log('✅ Auth listener set up successfully');
    } catch (error) {
      console.error('❌ Error setting up auth listener:', error);
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        console.log('🔄 Cleaning up auth listener');
        unsubscribe();
      }
    };
  }, []); // Empty dependency array - only run once

  const signOut = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    currentUser,
    setCurrentUser,
    isLoading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;