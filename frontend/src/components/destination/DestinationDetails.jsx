import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  StarIcon,
  ClockIcon,
  PhoneIcon,
  GlobeAltIcon,
  PhotoIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  CurrencyDollarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import placesService from '../../services/placesService';

const DestinationDetails = ({ destination, onPlaceSelect }) => {
  const [categorizedPlaces, setCategorizedPlaces] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('attractions');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  const categories = {
    attractions: { name: 'Attractions', icon: '🏛️', color: 'blue' },
    restaurants: { name: 'Restaurants', icon: '🍽️', color: 'green' },
    hotels: { name: 'Hotels', icon: '🏨', color: 'purple' },
    shopping: { name: 'Shopping', icon: '🛍️', color: 'pink' },
    nightlife: { name: 'Nightlife', icon: '🌃', color: 'indigo' },
    activities: { name: 'Activities', icon: '🎯', color: 'orange' }
  };

  useEffect(() => {
    if (destination?.location) {
      fetchCategorizedPlaces();
    }
  }, [destination]);

  const fetchCategorizedPlaces = async () => {
    setLoading(true);
    try {
      const places = await placesService.getCategorizedPlaces(destination.location);
      setCategorizedPlaces(places);
    } catch (error) {
      console.error('Error fetching categorized places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceClick = async (place) => {
    try {
      const details = await placesService.getPlaceDetails(place.placeId);
      setSelectedPlace({ ...place, ...details });
    } catch (error) {
      console.error('Error fetching place details:', error);
      setSelectedPlace(place);
    }
  };

  const toggleFavorite = (placeId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(placeId)) {
      newFavorites.delete(placeId);
    } else {
      newFavorites.add(placeId);
    }
    setFavorites(newFavorites);
    
    // Save to localStorage
    localStorage.setItem('favoritePlaces', JSON.stringify([...newFavorites]));
  };

  const getPriceLevel = (level) => {
    if (!level) return 'Price not available';
    return '$'.repeat(level) + '·'.repeat(4 - level);
  };

  const formatOpeningHours = (openingHours) => {
    if (!openingHours) return 'Hours not available';
    if (openingHours.open_now) {
      return 'Open now';
    }
    return 'Closed now';
  };

  if (!destination) {
    return (
      <div className="text-center py-12">
        <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Destination</h3>
        <p className="text-gray-500">Choose a destination to explore attractions, restaurants, and more</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Destination Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-full">
            <MapPinIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{destination.name}</h2>
            <p className="text-blue-100">{destination.address}</p>
            {destination.rating && (
              <div className="flex items-center space-x-1 mt-2">
                <StarIcon className="w-4 h-4 fill-current text-yellow-300" />
                <span className="font-medium">{destination.rating}</span>
                <span className="text-blue-200">({destination.reviews?.length || 0} reviews)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {Object.entries(categories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
              activeCategory === key
                ? `bg-${category.color}-100 text-${category.color}-700 border-2 border-${category.color}-300`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{category.icon}</span>
            <span className="font-medium">{category.name}</span>
            <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">
              {categorizedPlaces[key]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Places Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-64"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorizedPlaces[activeCategory]?.map((place, index) => (
            <motion.div
              key={place.placeId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => handlePlaceClick(place)}
            >
              {/* Place Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                {place.photos?.[0] ? (
                  <img
                    src={place.photos[0].url}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(place.placeId);
                    }}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  >
                    {favorites.has(place.placeId) ? (
                      <HeartSolidIcon className="w-4 h-4 text-red-500" />
                    ) : (
                      <HeartIcon className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Status Badge */}
                {place.openNow !== undefined && (
                  <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                    place.openNow 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {place.openNow ? 'Open Now' : 'Closed'}
                  </div>
                )}
              </div>

              {/* Place Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                  {place.name}
                </h3>
                
                <div className="flex items-center space-x-2 mb-2">
                  {place.rating && (
                    <>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4 fill-current text-yellow-500" />
                        <span className="font-medium text-gray-900">{place.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                    </>
                  )}
                  {place.priceLevel && (
                    <>
                      <span className="text-gray-600">{getPriceLevel(place.priceLevel)}</span>
                      <span className="text-gray-300">•</span>
                    </>
                  )}
                  <span className="text-gray-500 text-sm">{place.types?.[0]?.replace(/_/g, ' ')}</span>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {place.address}
                </p>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlaceSelect?.(place);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Add to Trip
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaceClick(place);
                    }}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && (!categorizedPlaces[activeCategory] || categorizedPlaces[activeCategory].length === 0) && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">{categories[activeCategory].icon}</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No {categories[activeCategory].name} Found
          </h3>
          <p className="text-gray-500">
            Try selecting a different category or search for a different destination
          </p>
        </div>
      )}

      {/* Place Detail Modal */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPlace(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal content will be added in the next part */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPlace.name}</h2>
                  <button
                    onClick={() => setSelectedPlace(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                
                {/* Place details content */}
                <div className="space-y-4">
                  {selectedPlace.photos?.[0] && (
                    <img
                      src={selectedPlace.photos[0].url}
                      alt={selectedPlace.name}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  )}
                  
                  <div className="flex items-center space-x-4">
                    {selectedPlace.rating && (
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-5 h-5 fill-current text-yellow-500" />
                        <span className="font-medium">{selectedPlace.rating}</span>
                      </div>
                    )}
                    {selectedPlace.priceLevel && (
                      <span className="text-gray-600">{getPriceLevel(selectedPlace.priceLevel)}</span>
                    )}
                  </div>
                  
                  <p className="text-gray-600">{selectedPlace.address}</p>
                  
                  {selectedPlace.openingHours && (
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                      <span>{formatOpeningHours(selectedPlace.openingHours)}</span>
                    </div>
                  )}
                  
                  {selectedPlace.phone && (
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <span>{selectedPlace.phone}</span>
                    </div>
                  )}
                  
                  {selectedPlace.website && (
                    <div className="flex items-center space-x-2">
                      <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                      <a 
                        href={selectedPlace.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        onPlaceSelect?.(selectedPlace);
                        setSelectedPlace(null);
                      }}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                      Add to Trip
                    </button>
                    <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <ShareIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DestinationDetails;
