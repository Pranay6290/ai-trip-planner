import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Star } from 'lucide-react';

const QuickRecommendations = () => {
  const navigate = useNavigate();

  const recommendations = [
    {
      id: 1,
      title: '3 Days Trip to Digha',
      destination: 'Digha, West Bengal',
      duration: 3,
      travelers: 4,
      budget: 15000,
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
      highlights: ['Beach Resort', 'Seafood', 'Marine Aquarium'],
      rating: 4.2,
      category: 'Beach'
    },
    {
      id: 2,
      title: '2 Days Trip to Digha',
      destination: 'Digha, West Bengal',
      duration: 2,
      travelers: 2,
      budget: 8000,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      highlights: ['Romantic Getaway', 'Sunset Views', 'Beach Walks'],
      rating: 4.0,
      category: 'Beach'
    },
    {
      id: 3,
      title: '4 Days Trip to Goa',
      destination: 'Goa',
      duration: 4,
      travelers: 6,
      budget: 25000,
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2',
      highlights: ['Beach Parties', 'Water Sports', 'Portuguese Heritage'],
      rating: 4.5,
      category: 'Beach'
    },
    {
      id: 4,
      title: '5 Days Trip to Kerala',
      destination: 'Kerala',
      duration: 5,
      travelers: 4,
      budget: 30000,
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
      highlights: ['Backwaters', 'Hill Stations', 'Ayurveda'],
      rating: 4.6,
      category: 'Nature'
    },
    {
      id: 5,
      title: '3 Days Trip to Rajasthan',
      destination: 'Rajasthan',
      duration: 3,
      travelers: 2,
      budget: 20000,
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245',
      highlights: ['Royal Palaces', 'Desert Safari', 'Cultural Heritage'],
      rating: 4.4,
      category: 'Heritage'
    },
    {
      id: 6,
      title: '2 Days Trip to Manali',
      destination: 'Manali, Himachal Pradesh',
      duration: 2,
      travelers: 4,
      budget: 18000,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      highlights: ['Snow Mountains', 'Adventure Sports', 'Hill Station'],
      rating: 4.3,
      category: 'Adventure'
    }
  ];

  const handleRecommendationClick = (recommendation) => {
    // Navigate to create-trip page with pre-filled data
    const queryParams = new URLSearchParams({
      destination: recommendation.destination,
      duration: recommendation.duration,
      travelers: recommendation.travelers,
      budget: recommendation.budget,
      preselected: 'true'
    });
    
    navigate(`/create-trip?${queryParams.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          🎯 Quick Trip Recommendations
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Popular trip ideas to get you started. Click on any recommendation to customize and generate your perfect itinerary!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-translate-y-2 border border-gray-100 hover:border-blue-200 group overflow-hidden"
            onClick={() => handleRecommendationClick(recommendation)}
          >
            <div className="relative overflow-hidden">
              <img
                src={recommendation.image}
                alt={recommendation.title}
                className="w-full h-48 object-cover rounded-t-2xl transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1 shadow-lg border border-white/20">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-gray-800">{recommendation.rating}</span>
              </div>

              <div className="absolute top-4 left-4">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                  ✨ {recommendation.category.toUpperCase()}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/20">
                  <div className="text-sm font-semibold text-gray-800">{recommendation.duration} Days</div>
                  <div className="text-xs text-gray-600">₹{recommendation.budget.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {recommendation.title}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{recommendation.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{recommendation.duration} Days</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{recommendation.travelers} Travelers</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  ₹{recommendation.budget.toLocaleString()}
                </div>
                <div className="flex flex-wrap gap-1">
                  {recommendation.highlights.map((highlight, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                Plan This Trip →
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center mt-12"
      >
        <p className="text-gray-600 mb-6">
          Want to create a completely custom trip?
        </p>
        <button
          onClick={() => navigate('/create-trip-ultra')}
          className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
        >
          🤖 Create Custom AI Trip
        </button>
      </motion.div>
    </div>
  );
};

export default QuickRecommendations;
