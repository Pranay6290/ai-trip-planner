import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Enhanced Toast Notifications
export const showSuccessToast = (message, options = {}) => {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-green-500`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-6 w-6 text-green-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-gray-900">Success!</p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-green-600 hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  ), {
    duration: 4000,
    position: 'top-right',
    ...options
  });
};

export const showErrorToast = (message, options = {}) => {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-red-500`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-6 w-6 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-gray-900">Error</p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  ), {
    duration: 6000,
    position: 'top-right',
    ...options
  });
};

export const showInfoToast = (message, options = {}) => {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-blue-500`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-gray-900">Info</p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  ), {
    duration: 4000,
    position: 'top-right',
    ...options
  });
};

export const showWarningToast = (message, options = {}) => {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-yellow-500`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-gray-900">Warning</p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-yellow-600 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  ), {
    duration: 5000,
    position: 'top-right',
    ...options
  });
};

// Enhanced Confirmation Dialog
export const showConfirmationToast = (message, onConfirm, onCancel, options = {}) => {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto ring-1 ring-black ring-opacity-5`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-gray-900">Confirm Action</p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => {
                  onConfirm();
                  toast.dismiss(t.id);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  if (onCancel) onCancel();
                  toast.dismiss(t.id);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  ), {
    duration: Infinity,
    position: 'top-center',
    ...options
  });
};

// Special Trip-related Toasts
export const showTripSavedToast = (tripName) => {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-2xl rounded-2xl pointer-events-auto flex text-white`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold">Trip Saved!</p>
            <p className="mt-1 text-sm opacity-90">{tripName} has been saved to your trips</p>
          </div>
        </div>
      </div>
      <div className="flex">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  ), {
    duration: 4000,
    position: 'top-right'
  });
};

export default {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showConfirmationToast,
  showTripSavedToast
};
