import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  UsersIcon,
  HeartIcon,
  SparklesIcon,
  InformationCircleIcon,
  CameraIcon,
  BuildingOfficeIcon,
  ShoppingBagIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const ModernItinerary = ({ tripData }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // Sample data structure - replace with your actual data
  const sampleTripData = {
    tripSummary: {
      destination: "Mumbai",
      duration: 3,
      travelers: 2,
      totalBudget: "₹15,000",
      totalAttractions: 9,
      tripMood: "Cultural Explorer"
    },
    dailyItinerary: [
      {
        day: 1,
        theme: "Heritage & Culture",
        totalBudget: "₹5,000",
        schedule: {
          morning: {
            time: "9:00 AM - 12:00 PM",
            places: [{
              placeName: "Gateway of India",
              placeDetails: "Iconic monument built during British Raj, perfect for photography",
              ticketPricing: "₹0 (Free)",
              rating: 4.3,
              duration: "2 hours",
              category: "heritage",
              insiderTips: "Visit during sunset for best photos",
              placeImageUrl: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f"
            }]
          },
          afternoon: {
            time: "2:00 PM - 6:00 PM",
            places: [{
              placeName: "Chhatrapati Shivaji Terminus",
              placeDetails: "UNESCO World Heritage railway station with Victorian architecture",
              ticketPricing: "₹50",
              rating: 4.5,
              duration: "1.5 hours",
              category: "heritage",
              insiderTips: "Best photography spots are on the upper floors",
              placeImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96"
            }]
          },
          evening: {
            time: "6:00 PM - 9:00 PM",
            places: [{
              placeName: "Marine Drive",
              placeDetails: "Queen's Necklace - Mumbai's iconic promenade with sea views",
              ticketPricing: "₹0 (Free)",
              rating: 4.4,
              duration: "2 hours",
              category: "scenic",
              insiderTips: "Perfect for evening walks and street food",
              placeImageUrl: "https://images.unsplash.com/photo-1595658658481-d53d3f999875"
            }]
          }
        }
      },
      {
        day: 2,
        theme: "Modern & Shopping",
        totalBudget: "₹6,000",
        schedule: {
          morning: {
            time: "10:00 AM - 1:00 PM",
            places: [{
              placeName: "Bandra-Worli Sea Link",
              placeDetails: "Modern engineering marvel connecting Bandra and Worli",
              ticketPricing: "₹75 (Toll)",
              rating: 4.2,
              duration: "1 hour",
              category: "modern",
              insiderTips: "Great views from both sides of the bridge",
              placeImageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220"
            }]
          },
          afternoon: {
            time: "2:00 PM - 6:00 PM",
            places: [{
              placeName: "Palladium Mall",
              placeDetails: "Premium shopping destination with international brands",
              ticketPricing: "₹0 (Entry Free)",
              rating: 4.1,
              duration: "3 hours",
              category: "shopping",
              insiderTips: "Food court on top floor has great city views",
              placeImageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8"
            }]
          },
          evening: {
            time: "7:00 PM - 10:00 PM",
            places: [{
              placeName: "Juhu Beach",
              placeDetails: "Popular beach known for street food and Bollywood celebrity homes",
              ticketPricing: "₹0 (Free)",
              rating: 4.0,
              duration: "2 hours",
              category: "beach",
              insiderTips: "Try the famous bhel puri and pav bhaji",
              placeImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
            }]
          }
        }
      },
      {
        day: 3,
        theme: "Culture & Food",
        totalBudget: "₹4,000",
        schedule: {
          morning: {
            time: "9:00 AM - 12:00 PM",
            places: [{
              placeName: "Elephanta Caves",
              placeDetails: "Ancient rock-cut caves dedicated to Lord Shiva, UNESCO World Heritage Site",
              ticketPricing: "₹40 + Ferry ₹150",
              rating: 4.6,
              duration: "4 hours",
              category: "heritage",
              insiderTips: "Take the morning ferry to avoid crowds",
              placeImageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220"
            }]
          },
          afternoon: {
            time: "2:00 PM - 5:00 PM",
            places: [{
              placeName: "Crawford Market",
              placeDetails: "Historic market for fresh produce, spices, and local goods",
              ticketPricing: "₹0 (Free)",
              rating: 4.2,
              duration: "2 hours",
              category: "market",
              insiderTips: "Bargain for better prices, try fresh fruit juices",
              placeImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96"
            }]
          },
          evening: {
            time: "6:00 PM - 9:00 PM",
            places: [{
              placeName: "Mohammed Ali Road",
              placeDetails: "Famous food street known for authentic Mughlai cuisine",
              ticketPricing: "₹500-800 per person",
              rating: 4.7,
              duration: "2 hours",
              category: "food",
              insiderTips: "Visit during Ramadan for the best experience",
              placeImageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b"
            }]
          }
        }
      }
    ]
  };

  const data = tripData || sampleTripData;

  const getCategoryIcon = (category) => {
    const iconMap = {
      heritage: BuildingOfficeIcon,
      modern: SparklesIcon,
      shopping: ShoppingBagIcon,
      scenic: CameraIcon,
      beach: HeartIcon,
      market: ShoppingBagIcon,
      food: AcademicCapIcon
    };
    return iconMap[category] || MapPinIcon;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      heritage: "from-amber-500 to-orange-500",
      modern: "from-blue-500 to-cyan-500",
      shopping: "from-purple-500 to-pink-500",
      scenic: "from-green-500 to-teal-500",
      beach: "from-cyan-500 to-blue-500",
      market: "from-red-500 to-pink-500",
      food: "from-yellow-500 to-orange-500"
    };
    return colorMap[category] || "from-gray-500 to-gray-600";
  };

  const PlaceCard = ({ place, timeSlot }) => {
    const CategoryIcon = getCategoryIcon(place.category);
    const categoryGradient = getCategoryColor(place.category);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className="glass-card rounded-3xl overflow-hidden group cursor-pointer"
      >
        {/* Place Image */}
        <div className="h-56 relative overflow-hidden">
          <img 
            src={place.placeImageUrl} 
            alt={place.placeName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              e.target.src = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop`;
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          
          {/* Time Badge */}
          <div className="absolute top-4 left-4 glass px-4 py-2 rounded-full text-sm font-semibold text-white border border-white/30">
            {timeSlot}
          </div>
          
          {/* Rating Badge */}
          <div className="absolute top-4 right-4 glass px-3 py-2 rounded-full text-sm font-bold flex items-center text-white border border-white/30">
            <StarIcon className="w-4 h-4 mr-1 text-yellow-400" />
            {place.rating}
          </div>

          {/* Category Badge */}
          <div className={`absolute bottom-4 left-4 bg-gradient-to-r ${categoryGradient} px-3 py-2 rounded-full flex items-center`}>
            <CategoryIcon className="w-4 h-4 text-white mr-2" />
            <span className="text-white text-sm font-medium capitalize">{place.category}</span>
          </div>
        </div>

        {/* Place Content */}
        <div className="p-8">
          <h3 className="text-2xl font-bold text-white mb-3 leading-tight">{place.placeName}</h3>
          <p className="text-white/80 mb-6 leading-relaxed">{place.placeDetails}</p>

          {/* Key Information Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center p-3 glass-dark rounded-2xl">
              <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center mr-3">
                <CurrencyRupeeIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-green-400 font-medium uppercase tracking-wide">Cost</div>
                <div className="font-bold text-white text-sm">{place.ticketPricing}</div>
              </div>
            </div>
            
            <div className="flex items-center p-3 glass-dark rounded-2xl">
              <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                <ClockIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-blue-400 font-medium uppercase tracking-wide">Duration</div>
                <div className="font-bold text-white text-sm">{place.duration}</div>
              </div>
            </div>
          </div>

          {/* Insider Tips */}
          {place.insiderTips && (
            <div className="glass-dark rounded-2xl p-4 mb-6">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-yellow-500 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                  <InformationCircleIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-yellow-400 text-sm mb-1">💡 Insider Tip</h4>
                  <p className="text-white/80 text-sm leading-relaxed">{place.insiderTips}</p>
                </div>
              </div>
            </div>
          )}

          {/* View on Map Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full bg-gradient-to-r ${categoryGradient} text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-500 flex items-center justify-center group`}
          >
            <MapPinIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            View on Map
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-animated-gradient">
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Trip Summary Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-card p-10 rounded-3xl mb-10 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full animate-pulse-slow"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full animate-float"></div>
          </div>
          
          <div className="relative z-10 text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold mb-4 text-white"
            >
              {data.tripSummary?.destination || 'Your Trip'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-2xl text-white/90 font-light"
            >
              {data.tripSummary?.tripMood || 'Amazing'} Adventure Awaits! ✨
            </motion.p>
          </div>

          {/* Stats Grid */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: CalendarDaysIcon, value: data.tripSummary?.duration || data.dailyItinerary?.length, label: 'Days' },
              { icon: UsersIcon, value: data.tripSummary?.travelers || '2', label: 'Travelers' },
              { icon: HeartIcon, value: data.tripSummary?.totalAttractions || 'Many', label: 'Attractions' },
              { icon: CurrencyRupeeIcon, value: data.tripSummary?.totalBudget || 'Budget', label: 'Total Budget' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="text-center glass-dark rounded-2xl p-6 hover:bg-white/20 transition-all duration-300"
                >
                  <Icon className="w-10 h-10 mx-auto mb-3 text-white" />
                  <div className="text-3xl font-bold mb-1 text-white">{stat.value}</div>
                  <div className="text-sm text-white/75 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Day Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex justify-center mb-10"
        >
          <div className="glass-card p-2 rounded-2xl flex items-center space-x-2">
            <button
              onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
              disabled={selectedDay === 0}
              className="p-2 rounded-xl text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            
            {data.dailyItinerary?.map((day, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedDay(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedDay === index
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-white/80 hover:bg-white/20'
                }`}
              >
                <div className="text-sm">Day {day.day}</div>
                <div className="text-xs opacity-75">{day.theme}</div>
              </motion.button>
            ))}
            
            <button
              onClick={() => setSelectedDay(Math.min(data.dailyItinerary?.length - 1 || 0, selectedDay + 1))}
              disabled={selectedDay === (data.dailyItinerary?.length - 1 || 0)}
              className="p-2 rounded-xl text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Day Content */}
        <AnimatePresence mode="wait">
          {data.dailyItinerary && data.dailyItinerary[selectedDay] && (
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Day Header */}
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-2">
                  Day {data.dailyItinerary[selectedDay].day}
                </h2>
                <p className="text-xl text-white/80 mb-4">
                  {data.dailyItinerary[selectedDay].theme}
                </p>
                <div className="inline-flex items-center glass-card px-6 py-3 rounded-full">
                  <CurrencyRupeeIcon className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-white font-semibold">
                    Budget: {data.dailyItinerary[selectedDay].totalBudget}
                  </span>
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-12">
                {Object.entries(data.dailyItinerary[selectedDay].schedule).map(([timeSlot, timeData]) => (
                  <motion.div
                    key={timeSlot}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div className="flex items-center mb-6">
                      <div className="glass-card px-6 py-3 rounded-full mr-4">
                        <h3 className="text-xl font-bold text-white capitalize">{timeSlot}</h3>
                      </div>
                      <div className="text-white/80">{timeData.time}</div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                      {timeData.places?.map((place, placeIndex) => (
                        <PlaceCard
                          key={placeIndex}
                          place={place}
                          timeSlot={timeSlot}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModernItinerary;
