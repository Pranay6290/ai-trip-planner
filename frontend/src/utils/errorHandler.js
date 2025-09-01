import toast from 'react-hot-toast';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  FIREBASE: 'FIREBASE_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error messages
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Network connection error. Please check your internet connection.',
  [ERROR_TYPES.FIREBASE]: 'Database error. Please try again later.',
  [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
  [ERROR_TYPES.AUTHENTICATION]: 'Authentication error. Please sign in again.',
  [ERROR_TYPES.PERMISSION]: 'You don\'t have permission to perform this action.',
  [ERROR_TYPES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

// Determine error type based on error object
export const getErrorType = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;

  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';

  // Firebase errors
  if (errorCode.includes('firebase') || errorCode.includes('firestore')) {
    return ERROR_TYPES.FIREBASE;
  }

  // Authentication errors
  if (errorCode.includes('auth') || errorCode.includes('permission-denied')) {
    return ERROR_TYPES.AUTHENTICATION;
  }

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || error.name === 'NetworkError') {
    return ERROR_TYPES.NETWORK;
  }

  // Not found errors
  if (errorCode.includes('not-found') || errorMessage.includes('not found')) {
    return ERROR_TYPES.NOT_FOUND;
  }

  // Validation errors
  if (errorCode.includes('invalid') || errorMessage.includes('validation')) {
    return ERROR_TYPES.VALIDATION;
  }

  return ERROR_TYPES.UNKNOWN;
};

// Get user-friendly error message
export const getErrorMessage = (error, customMessage = null) => {
  if (customMessage) return customMessage;
  
  const errorType = getErrorType(error);
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN];
};

// Enhanced error handler
export const handleError = (error, options = {}) => {
  const {
    showToast = true,
    logToConsole = true,
    customMessage = null,
    context = 'Unknown',
    onError = null
  } = options;

  // Log to console in development
  if (logToConsole && import.meta.env.DEV) {
    console.group(`🚨 Error in ${context}`);
    console.error('Error object:', error);
    console.error('Stack trace:', error.stack);
    console.error('Error type:', getErrorType(error));
    console.groupEnd();
  }

  // Get user-friendly message
  const message = getErrorMessage(error, customMessage);

  // Show toast notification
  if (showToast) {
    const errorType = getErrorType(error);
    const toastOptions = {
      duration: 5000,
      style: {
        background: '#ef4444',
        color: '#fff',
      },
    };

    switch (errorType) {
      case ERROR_TYPES.NETWORK:
        toast.error(message, { ...toastOptions, icon: '🌐' });
        break;
      case ERROR_TYPES.FIREBASE:
        toast.error(message, { ...toastOptions, icon: '🔥' });
        break;
      case ERROR_TYPES.AUTHENTICATION:
        toast.error(message, { ...toastOptions, icon: '🔐' });
        break;
      case ERROR_TYPES.VALIDATION:
        toast.error(message, { ...toastOptions, icon: '⚠️' });
        break;
      default:
        toast.error(message, toastOptions);
    }
  }

  // Call custom error handler if provided
  if (onError && typeof onError === 'function') {
    onError(error, message);
  }

  return {
    type: getErrorType(error),
    message,
    originalError: error
  };
};

// Async error wrapper
export const withErrorHandling = (asyncFn, options = {}) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleError(error, options);
      throw error; // Re-throw to allow caller to handle if needed
    }
  };
};

// React error boundary helper
export const createErrorBoundary = (fallbackComponent) => {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      handleError(error, {
        context: 'React Error Boundary',
        showToast: false, // Don't show toast for boundary errors
        customMessage: 'A component error occurred'
      });
    }

    render() {
      if (this.state.hasError) {
        return fallbackComponent ? fallbackComponent(this.state.error) : (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
              <p className="text-gray-600 mb-6">We're sorry, but something unexpected happened.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        );
      }

      return this.props.children;
    }
  };
};

// Validation helpers
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`${fieldName} is required`);
  }
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address');
  }
};

export const validateMinLength = (value, minLength, fieldName) => {
  if (value.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters long`);
  }
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const end = performance.now();
      
      if (import.meta.env.DEV) {
        console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`❌ ${name} failed after ${(end - start).toFixed(2)}ms:`, error);
      throw error;
    }
  };
};

export default {
  handleError,
  withErrorHandling,
  createErrorBoundary,
  getErrorType,
  getErrorMessage,
  validateRequired,
  validateEmail,
  validateMinLength,
  measurePerformance,
  ERROR_TYPES
};
