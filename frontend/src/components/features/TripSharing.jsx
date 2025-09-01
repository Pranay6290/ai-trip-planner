import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ShareIcon,
  LinkIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  XMarkIcon,
  CheckIcon,
  QrCodeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const TripSharing = ({ trip, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState('link');

  const tripUrl = `${window.location.origin}/view-trip/${trip.id}`;
  const tripTitle = trip.userSelection?.location?.label || trip.userSelection?.destination?.name || 'Amazing Trip';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(tripUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Trip to ${tripTitle}`,
          text: `Check out my amazing trip plan to ${tripTitle}!`,
          url: tripUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out my trip to ${tripTitle}`);
    const body = encodeURIComponent(
      `Hi!\n\nI wanted to share my amazing trip plan with you.\n\nDestination: ${tripTitle}\nDuration: ${trip.userSelection?.noOfDays} days\nBudget: ${trip.userSelection?.budget}\n\nView the full itinerary here: ${tripUrl}\n\nHappy travels!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleSMSShare = () => {
    const text = encodeURIComponent(`Check out my trip to ${tripTitle}: ${tripUrl}`);
    window.open(`sms:?body=${text}`);
  };

  const generateQRCode = () => {
    // Using a QR code service - in production, you might want to use a library
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tripUrl)}`;
  };

  const shareOptions = [
    {
      id: 'link',
      name: 'Copy Link',
      icon: LinkIcon,
      action: handleCopyLink,
      description: 'Copy the trip link to share anywhere'
    },
    {
      id: 'native',
      name: 'Share',
      icon: ShareIcon,
      action: handleNativeShare,
      description: 'Use your device\'s native sharing options'
    },
    {
      id: 'email',
      name: 'Email',
      icon: EnvelopeIcon,
      action: handleEmailShare,
      description: 'Share via email with a personalized message'
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: DevicePhoneMobileIcon,
      action: handleSMSShare,
      description: 'Send via text message'
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: QrCodeIcon,
      action: () => setShareMethod('qr'),
      description: 'Generate a QR code for easy scanning'
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <ShareIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Share Trip</h3>
                <p className="text-sm text-gray-600">Share your amazing journey</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Trip Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">{tripTitle}</h4>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{trip.userSelection?.noOfDays} days</span>
              <span>•</span>
              <span>{trip.userSelection?.traveler}</span>
              <span>•</span>
              <span>{trip.userSelection?.budget}</span>
            </div>
          </div>

          {/* Share Methods */}
          {shareMethod === 'link' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {shareOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={option.action}
                    className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <option.icon className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">{option.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* Direct Link */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tripUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <motion.button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      copied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copied ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      'Copy'
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* QR Code View */}
          {shareMethod === 'qr' && (
            <div className="text-center">
              <div className="bg-white p-4 rounded-2xl shadow-inner mb-4 inline-block">
                <img
                  src={generateQRCode()}
                  alt="Trip QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code to view the trip
              </p>
              <button
                onClick={() => setShareMethod('link')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to sharing options
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <GlobeAltIcon className="w-4 h-4" />
              <span>Anyone with the link can view this trip</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TripSharing;
