import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import toast from 'react-hot-toast';
import {
  signInWithGooglePopup,
  signInWithGoogleRedirect,
  signInAuthUserWithEmailAndPassword,
  createUserDocumentFromAuth,
  auth
} from '../service/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Remove setCurrentUser to prevent conflicts

  // Redirect if user is already authenticated
  useEffect(() => {
    if (currentUser) {
      console.log('✅ User already authenticated, redirecting...');
      console.log('✅ Current user details:', {
        email: currentUser.email,
        uid: currentUser.uid,
        displayName: currentUser.displayName
      });
      navigate('/');
    }
  }, [currentUser, navigate]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleSignIn = async (useRedirect = false) => {
    setIsLoading(true);
    try {
      if (useRedirect) {
        // Use redirect method (page will reload)
        await signInWithGoogleRedirect();
        // Note: This won't reach the success code as page will redirect
        return;
      }

      console.log('🔄 Starting Google sign-in...');
      const result = await signInWithGooglePopup();
      console.log('🔄 Google sign-in result:', result);
      console.log('🔄 User object:', result?.user);
      console.log('🔄 User email:', result?.user?.email);
      console.log('🔄 User UID:', result?.user?.uid);

      if (result && result.user) {
        // Create user document if needed
        await createUserDocumentFromAuth(result.user);
        console.log('✅ Google sign-in successful:', result.user.email);
        toast.success('Welcome back! Successfully signed in with Google');

        // Force navigation after successful sign-in
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      } else {
        throw new Error('No user returned from Google sign-in');
      }
    } catch (error) {
      console.error('❌ Google sign in error:', error);

      // Handle specific error types
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      let shouldTryRedirect = false;
      let shouldRefresh = false;

      if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Trying redirect method...';
        shouldTryRedirect = true;
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized. Please contact support.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google sign-in is not enabled. Please contact support.';
      } else if (error.message && error.message.includes('initial state')) {
        errorMessage = 'Google Sign-In needs to be refreshed. Please refresh the page and try again.';
        shouldRefresh = true;
      } else if (error.message && error.message.includes('initialization')) {
        errorMessage = 'Please refresh the page and try signing in again.';
        shouldRefresh = true;
      }

      if (shouldTryRedirect && !useRedirect) {
        toast.info(errorMessage);
        // Try redirect method as fallback
        setTimeout(() => handleGoogleSignIn(true), 1000);
      } else if (shouldRefresh) {
        toast.error(errorMessage);
        // Offer to refresh the page
        setTimeout(() => {
          if (confirm('Would you like to refresh the page to fix the Google Sign-In issue?')) {
            window.location.reload();
          }
        }, 2000);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      if (!useRedirect) {
        setIsLoading(false);
      }
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔄 Starting email sign-in...');
      const result = await signInAuthUserWithEmailAndPassword(formData.email, formData.password);
      console.log('🔄 Email sign-in result:', result);

      if (result && result.user) {
        // Create user document if needed
        await createUserDocumentFromAuth(result.user);
        console.log('✅ Email sign-in successful:', result.user.email);
        toast.success('Welcome back! Successfully signed in');

        // Force navigation after successful sign-in
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      } else {
        throw new Error('No user returned from email sign-in');
      }
    } catch (error) {
      console.error('❌ Email sign in error:', error);
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Welcome Back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-gray-600 mt-2"
            >
              Sign in to continue your journey
            </motion.p>
          </div>

          {/* Google Sign In Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl py-3 px-4 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            <FcGoogle size={20} />
            <span className="font-medium text-gray-700">Continue with Google</span>
          </motion.button>



          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email Sign In Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            onSubmit={handleEmailSignIn}
            className="space-y-4"
          >
            {/* Email Input */}
            <div className="relative">
              <HiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>

            {/* Sign In Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </motion.form>

          {/* Sign Up Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center mt-6"
          >
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300"
              >
                Sign up
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
