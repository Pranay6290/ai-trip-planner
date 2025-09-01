import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  PhotoIcon,
  EyeIcon,
  StarIcon,
  ClockIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const EnhancedMapExperience = ({ 
  places, 
  center, 
  onPlaceSelect, 
  selectedPlace,
  showHiddenGems = true,
  dayColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
}) => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [streetView, setStreetView] = useState(null);
  const [showStreetView, setShowStreetView] = useState(false);
  const [hiddenGems, setHiddenGems] = useState([]);
  const [mapStyle, setMapStyle] = useState('roadmap');
  const [showTraffic, setShowTraffic] = useState(false);
  const [dayFilter, setDayFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const mapRef = useRef(null);
  const streetViewRef = useRef(null);

  // Initialize Google Maps
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: center || { lat: 40.7128, lng: -74.0060 },
      zoom: 13,
      mapTypeId: mapStyle,
      styles: getMapStyles(mapStyle),
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true
    });

    setMap(mapInstance);
    setIsLoading(false);

    // Initialize Street View
    const streetViewInstance = new window.google.maps.StreetViewPanorama(
      streetViewRef.current,
      {
        position: center,
        pov: { heading: 34, pitch: 10 },
        visible: false
      }
    );

    setStreetView(streetViewInstance);
    mapInstance.setStreetView(streetViewInstance);

    return () => {
      // Cleanup
      markers.forEach(marker => marker.setMap(null));
    };
  }, [center, mapStyle]);

  // Update markers when places change
  useEffect(() => {
    if (!map || !places) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers = [];
    const bounds = new window.google.maps.LatLngBounds();

    places.forEach((place, index) => {
      if (!place.location) return;

      // Filter by day if needed
      if (dayFilter !== 'all' && place.day && place.day !== parseInt(dayFilter)) {
        return;
      }

      const marker = new window.google.maps.Marker({
        position: place.location,
        map: map,
        title: place.name,
        icon: createCustomMarker(place, index),
        animation: window.google.maps.Animation.DROP
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(place)
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        onPlaceSelect?.(place);
      });

      marker.addListener('mouseover', () => {
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 750);
      });

      newMarkers.push(marker);
      bounds.extend(place.location);
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      if (newMarkers.length === 1) {
        map.setZoom(15);
      }
    }

    // Load hidden gems if enabled
    if (showHiddenGems) {
      loadHiddenGems();
    }
  }, [map, places, dayFilter, showHiddenGems]);

  // Create custom marker icon
  const createCustomMarker = (place, index) => {
    const dayColor = place.day ? dayColors[(place.day - 1) % dayColors.length] : '#6B7280';
    
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: dayColor,
      fillOpacity: 0.8,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: place === selectedPlace ? 12 : 8,
      labelOrigin: new window.google.maps.Point(0, 0)
    };
  };

  // Create info window content
  const createInfoWindowContent = (place) => {
    return `
      <div class="p-3 max-w-xs">
        <h3 class="font-bold text-lg mb-2">${place.name}</h3>
        ${place.rating ? `<div class="flex items-center mb-2">
          <span class="text-yellow-500">★</span>
          <span class="ml-1">${place.rating}/5</span>
        </div>` : ''}
        ${place.address ? `<p class="text-sm text-gray-600 mb-2">${place.address}</p>` : ''}
        ${place.time ? `<p class="text-sm text-blue-600">⏰ ${place.time}</p>` : ''}
        <div class="mt-3 flex space-x-2">
          <button onclick="window.showStreetViewForPlace('${place.placeId}')" 
                  class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
            Street View
          </button>
          ${place.photos && place.photos.length > 0 ? `
            <button onclick="window.showPlacePhotos('${place.placeId}')" 
                    class="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">
              Photos
            </button>
          ` : ''}
        </div>
      </div>
    `;
  };

  // Load hidden gems near the area
  const loadHiddenGems = async () => {
    if (!map || !center) return;

    try {
      // This would typically call a service to find hidden gems
      // For now, we'll simulate with nearby places that have high ratings but low tourist density
      const service = new window.google.maps.places.PlacesService(map);
      
      const request = {
        location: center,
        radius: 5000,
        type: ['tourist_attraction', 'restaurant', 'cafe'],
        fields: ['place_id', 'name', 'geometry', 'rating', 'user_ratings_total']
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          // Filter for hidden gems (high rating, low review count)
          const gems = results.filter(place => 
            place.rating >= 4.3 && 
            place.user_ratings_total < 100 &&
            place.user_ratings_total > 10
          ).slice(0, 5);

          setHiddenGems(gems);
          
          // Add hidden gem markers
          gems.forEach(gem => {
            const marker = new window.google.maps.Marker({
              position: gem.geometry.location,
              map: map,
              title: `Hidden Gem: ${gem.name}`,
              icon: {
                path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                fillColor: '#F59E0B',
                fillOpacity: 0.8,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                scale: 6
              }
            });

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div class="p-2">
                  <h4 class="font-bold text-amber-600">💎 Hidden Gem</h4>
                  <h3 class="font-semibold">${gem.name}</h3>
                  <p class="text-sm">⭐ ${gem.rating}/5 (${gem.user_ratings_total} reviews)</p>
                  <p class="text-xs text-gray-600 mt-1">Less crowded, highly rated!</p>
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });
          });
        }
      });
    } catch (error) {
      console.error('Error loading hidden gems:', error);
    }
  };

  // Show street view for a place
  const showStreetViewForPlace = (place) => {
    if (!streetView || !place.location) return;

    streetView.setPosition(place.location);
    streetView.setVisible(true);
    setShowStreetView(true);
  };

  // Get map styles based on selected style
  const getMapStyles = (style) => {
    const styles = {
      roadmap: [],
      satellite: [],
      hybrid: [],
      terrain: [],
      dark: [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
      ],
      retro: [
        { elementType: 'geometry', stylers: [{ color: '#ebe3cd' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#523735' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f1e6' }] }
      ]
    };

    return styles[style] || styles.roadmap;
  };

  // Toggle traffic layer
  const toggleTraffic = () => {
    if (!map) return;

    if (showTraffic) {
      // Remove traffic layer
      setShowTraffic(false);
    } else {
      // Add traffic layer
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(map);
      setShowTraffic(true);
    }
  };

  // Draw route between places
  const drawRoute = () => {
    if (!map || !places || places.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#3B82F6',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });

    directionsRenderer.setMap(map);

    const waypoints = places.slice(1, -1).map(place => ({
      location: place.location,
      stopover: true
    }));

    const request = {
      origin: places[0].location,
      destination: places[places.length - 1].location,
      waypoints: waypoints,
      travelMode: window.google.maps.TravelMode.WALKING,
      optimizeWaypoints: true
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
      }
    });
  };

  // Expose functions to global scope for info window buttons
  useEffect(() => {
    window.showStreetViewForPlace = (placeId) => {
      const place = places.find(p => p.placeId === placeId);
      if (place) showStreetViewForPlace(place);
    };

    window.showPlacePhotos = (placeId) => {
      const place = places.find(p => p.placeId === placeId);
      if (place && place.photos) {
        // This would open a photo gallery modal
        console.log('Show photos for:', place.name);
      }
    };

    return () => {
      delete window.showStreetViewForPlace;
      delete window.showPlacePhotos;
    };
  }, [places]);

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading interactive map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-xl">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        {/* Map Style Selector */}
        <select
          value={mapStyle}
          onChange={(e) => setMapStyle(e.target.value)}
          className="px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md text-sm border border-gray-200"
        >
          <option value="roadmap">Roadmap</option>
          <option value="satellite">Satellite</option>
          <option value="hybrid">Hybrid</option>
          <option value="terrain">Terrain</option>
          <option value="dark">Dark</option>
          <option value="retro">Retro</option>
        </select>

        {/* Day Filter */}
        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value)}
          className="px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md text-sm border border-gray-200"
        >
          <option value="all">All Days</option>
          {Array.from({ length: 7 }, (_, i) => (
            <option key={i + 1} value={i + 1}>Day {i + 1}</option>
          ))}
        </select>
      </div>

      {/* Map Action Buttons */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button
          onClick={toggleTraffic}
          className={`p-2 rounded-lg shadow-md transition-colors ${
            showTraffic 
              ? 'bg-red-500 text-white' 
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white'
          }`}
          title="Toggle Traffic"
        >
          <AdjustmentsHorizontalIcon className="w-5 h-5" />
        </button>

        <button
          onClick={drawRoute}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md text-gray-700 hover:bg-white transition-colors"
          title="Show Route"
        >
          <MapPinIcon className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowStreetView(!showStreetView)}
          className={`p-2 rounded-lg shadow-md transition-colors ${
            showStreetView 
              ? 'bg-blue-500 text-white' 
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white'
          }`}
          title="Toggle Street View"
        >
          <EyeIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Hidden Gems Counter */}
      {hiddenGems.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 bg-amber-500 text-white px-3 py-2 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <span className="text-lg">💎</span>
            <span className="text-sm font-medium">{hiddenGems.length} Hidden Gems</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3">
        <h4 className="text-sm font-semibold mb-2">Legend</h4>
        <div className="space-y-1">
          {dayColors.slice(0, Math.min(7, dayColors.length)).map((color, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-xs">Day {index + 1}</span>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-xs">Hidden Gems</span>
          </div>
        </div>
      </div>

      {/* Main Map */}
      <div 
        ref={mapRef} 
        className={`w-full h-full ${showStreetView ? 'w-1/2' : 'w-full'} transition-all duration-300`}
      />

      {/* Street View */}
      <AnimatePresence>
        {showStreetView && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute top-0 right-0 w-1/2 h-full"
          >
            <div ref={streetViewRef} className="w-full h-full" />
            <button
              onClick={() => setShowStreetView(false)}
              className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md text-gray-700 hover:bg-white transition-colors"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedMapExperience;
