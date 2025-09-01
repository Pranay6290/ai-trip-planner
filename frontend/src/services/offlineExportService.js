import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

class OfflineExportService {
  constructor() {
    this.offlineData = new Map();
    this.cacheKey = 'tripPlannerOfflineData';
  }

  // Export trip as PDF
  async exportTripAsPDF(tripData, options = {}) {
    try {
      const {
        includeMap = true,
        includeImages = true,
        includeWeather = true,
        includeBudget = true,
        format = 'a4'
      } = options;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: format
      });

      let yPosition = 20;

      // Title Page
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Trip to ${tripData.destination?.name || 'Unknown Destination'}`, 20, yPosition);
      
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Duration: ${tripData.duration || tripData.tripLength || 'N/A'} days`, 20, yPosition);
      
      yPosition += 8;
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
      
      yPosition += 20;

      // Trip Overview
      if (tripData.summary) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Trip Overview', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const overviewLines = pdf.splitTextToSize(tripData.summary, 170);
        pdf.text(overviewLines, 20, yPosition);
        yPosition += overviewLines.length * 5 + 10;
      }

      // Budget Information
      if (includeBudget && tripData.budget) {
        yPosition = this.addBudgetSection(pdf, tripData.budget, yPosition);
      }

      // Weather Information
      if (includeWeather && tripData.weather) {
        yPosition = this.addWeatherSection(pdf, tripData.weather, yPosition);
      }

      // Daily Itinerary - Enhanced with more places
      if (tripData.itinerary && tripData.itinerary.length > 0) {
        yPosition = await this.addEnhancedItinerarySection(pdf, tripData, yPosition, includeImages);
      } else if (tripData.tripData?.itinerary) {
        // Fallback to tripData.tripData.itinerary
        yPosition = await this.addEnhancedItinerarySection(pdf, tripData.tripData, yPosition, includeImages);
      }

      // Hotels Section - Enhanced with AI-generated hotels
      yPosition = await this.addEnhancedHotelsSection(pdf, tripData, yPosition);

      // Additional Places Section
      yPosition = await this.addAdditionalPlacesSection(pdf, tripData, yPosition);

      // Save the PDF
      const fileName = `${tripData.destination?.name || 'trip'}-itinerary.pdf`;
      pdf.save(fileName);

      return { success: true, fileName };
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  }

  // Add budget section to PDF
  addBudgetSection(pdf, budget, yPosition) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Budget Breakdown', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    if (budget.total) {
      pdf.text(`Total Budget: ₹${budget.total.toLocaleString()}`, 20, yPosition);
      yPosition += 6;
    }

    if (budget.breakdown) {
      Object.entries(budget.breakdown).forEach(([category, amount]) => {
        pdf.text(`${category.charAt(0).toUpperCase() + category.slice(1)}: ₹${amount.toLocaleString()}`, 25, yPosition);
        yPosition += 5;
      });
    }

    return yPosition + 10;
  }

  // Add weather section to PDF
  addWeatherSection(pdf, weather, yPosition) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Weather Forecast', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    if (weather.summary) {
      pdf.text(`Outlook: ${weather.summary.outlook}`, 20, yPosition);
      yPosition += 6;
    }

    if (weather.forecast && weather.forecast.length > 0) {
      weather.forecast.forEach((day, index) => {
        const dayText = `Day ${index + 1}: ${day.temperature?.max || 'N/A'}°C, ${day.description || 'No description'}`;
        pdf.text(dayText, 25, yPosition);
        yPosition += 5;
      });
    }

    return yPosition + 10;
  }

  // Enhanced itinerary section with more places and details
  async addEnhancedItinerarySection(pdf, tripData, yPosition, includeImages) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Daily Itinerary', 20, yPosition);
    yPosition += 15;

    const itinerary = tripData.itinerary || tripData.tripData?.itinerary || [];
    const destination = tripData.destination?.name || tripData.userSelection?.destination?.name || 'Popular Destination';

    for (let dayIndex = 0; dayIndex < Math.max(itinerary.length, tripData.duration || 3); dayIndex++) {
      const day = itinerary[dayIndex] || {};

      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      // Day header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const dayTitle = day.theme || `Day ${dayIndex + 1} Exploration`;
      pdf.text(`Day ${dayIndex + 1} - ${dayTitle}`, 20, yPosition);
      yPosition += 10;

      // Get places for this day - enhanced with AI suggestions
      let places = day.places || day.activities || day.plan || [];

      // If no places, generate some based on destination
      if (places.length === 0) {
        places = this.generatePlacesForDay(destination, dayIndex + 1);
      }

      // Ensure we have at least 3-4 places per day
      while (places.length < 3) {
        places.push(...this.generateAdditionalPlaces(destination, places.length + 1));
      }

      places.slice(0, 5).forEach((place, placeIndex) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        const placeName = place.name || place.placeName || place.activityName || `Attraction ${placeIndex + 1}`;
        pdf.text(`${placeIndex + 1}. ${placeName}`, 25, yPosition);
        yPosition += 6;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');

        if (place.time) {
          pdf.text(`Time: ${place.time}`, 30, yPosition);
          yPosition += 4;
        }

        const address = place.address || place.placeDetails || `${destination}, India`;
        const addressLines = pdf.splitTextToSize(`Address: ${address}`, 160);
        pdf.text(addressLines, 30, yPosition);
        yPosition += addressLines.length * 4;

        if (place.rating || place.ticketPricing) {
          const details = [];
          if (place.rating) details.push(`Rating: ${place.rating}/5`);
          if (place.ticketPricing) details.push(`Price: ${place.ticketPricing}`);
          pdf.text(details.join(' | '), 30, yPosition);
          yPosition += 4;
        }

        if (place.description) {
          const descLines = pdf.splitTextToSize(place.description, 160);
          pdf.text(descLines, 30, yPosition);
          yPosition += descLines.length * 4;
        }

        if (place.rating) {
          pdf.text(`Rating: ${place.rating}/5`, 30, yPosition);
          yPosition += 4;
        }

        yPosition += 5;
      });

      yPosition += 10;
    }

    return yPosition;
  }

  // Add hotels section to PDF
  addHotelsSection(pdf, hotels, yPosition) {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommended Hotels', 20, yPosition);
    yPosition += 15;

    hotels.slice(0, 5).forEach((hotel, index) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${hotel.name}`, 25, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      if (hotel.rating) {
        pdf.text(`Rating: ${hotel.rating}/5`, 30, yPosition);
        yPosition += 5;
      }

      if (hotel.price) {
        pdf.text(`Price: ${hotel.price}`, 30, yPosition);
        yPosition += 5;
      }

      if (hotel.address) {
        const addressLines = pdf.splitTextToSize(`Address: ${hotel.address}`, 160);
        pdf.text(addressLines, 30, yPosition);
        yPosition += addressLines.length * 5;
      }

      yPosition += 8;
    });

    return yPosition;
  }

  // Export trip as calendar events (.ics)
  exportTripAsCalendar(tripData) {
    try {
      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AI Trip Planner//Trip Itinerary//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
      ];

      const startDate = new Date(tripData.startDate || Date.now());
      
      if (tripData.itinerary) {
        tripData.itinerary.forEach((day, dayIndex) => {
          const dayDate = new Date(startDate);
          dayDate.setDate(startDate.getDate() + dayIndex);
          
          const places = day.places || day.activities || [];
          places.forEach((place, placeIndex) => {
            const eventStart = new Date(dayDate);
            const eventTime = place.time || '09:00';
            const [hours, minutes] = eventTime.split(':');
            eventStart.setHours(parseInt(hours), parseInt(minutes));
            
            const eventEnd = new Date(eventStart);
            eventEnd.setMinutes(eventEnd.getMinutes() + (place.estimatedDuration || 90));

            icsContent.push(
              'BEGIN:VEVENT',
              `UID:${Date.now()}-${dayIndex}-${placeIndex}@tripplanner.com`,
              `DTSTART:${this.formatDateForICS(eventStart)}`,
              `DTEND:${this.formatDateForICS(eventEnd)}`,
              `SUMMARY:${place.name}`,
              `DESCRIPTION:${place.description || place.address || ''}`,
              `LOCATION:${place.address || ''}`,
              'END:VEVENT'
            );
          });
        });
      }

      icsContent.push('END:VCALENDAR');

      const icsString = icsContent.join('\r\n');
      const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
      
      const fileName = `${tripData.destination?.name || 'trip'}-calendar.ics`;
      this.downloadBlob(blob, fileName);

      return { success: true, fileName };
    } catch (error) {
      console.error('Error exporting calendar:', error);
      throw error;
    }
  }

  // Format date for ICS format
  formatDateForICS(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  // Cache trip data for offline access
  cacheForOffline(tripData) {
    try {
      const offlineTrip = {
        ...tripData,
        cachedAt: new Date().toISOString(),
        offlineVersion: true
      };

      // Store in localStorage
      const existingData = JSON.parse(localStorage.getItem(this.cacheKey) || '[]');
      const updatedData = existingData.filter(trip => trip.id !== tripData.id);
      updatedData.unshift(offlineTrip);
      
      // Keep only last 10 trips
      const limitedData = updatedData.slice(0, 10);
      localStorage.setItem(this.cacheKey, JSON.stringify(limitedData));

      // Store in memory cache
      this.offlineData.set(tripData.id, offlineTrip);

      return { success: true, cachedAt: offlineTrip.cachedAt };
    } catch (error) {
      console.error('Error caching trip for offline:', error);
      throw error;
    }
  }

  // Get cached trips for offline access
  getCachedTrips() {
    try {
      const cachedData = JSON.parse(localStorage.getItem(this.cacheKey) || '[]');
      return cachedData;
    } catch (error) {
      console.error('Error getting cached trips:', error);
      return [];
    }
  }

  // Get specific cached trip
  getCachedTrip(tripId) {
    // Check memory cache first
    if (this.offlineData.has(tripId)) {
      return this.offlineData.get(tripId);
    }

    // Check localStorage
    const cachedTrips = this.getCachedTrips();
    return cachedTrips.find(trip => trip.id === tripId);
  }

  // Clear offline cache
  clearOfflineCache() {
    localStorage.removeItem(this.cacheKey);
    this.offlineData.clear();
  }

  // Check if app is offline
  isOffline() {
    return !navigator.onLine;
  }

  // Download blob as file
  downloadBlob(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Export trip data as JSON
  exportTripAsJSON(tripData) {
    try {
      const exportData = {
        ...tripData,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      const fileName = `${tripData.destination?.name || 'trip'}-data.json`;
      this.downloadBlob(blob, fileName);

      return { success: true, fileName };
    } catch (error) {
      console.error('Error exporting JSON:', error);
      throw error;
    }
  }

  // Generate QR code for trip sharing
  generateTripQRCode(tripData) {
    const tripUrl = `${window.location.origin}/view-trip/${tripData.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tripUrl)}`;

    return {
      url: qrCodeUrl,
      tripUrl,
      downloadUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&download=1&data=${encodeURIComponent(tripUrl)}`
    };
  }

  // Generate places for a day based on destination
  generatePlacesForDay(destination, dayNumber) {
    const destinationPlaces = {
      'mumbai': [
        { name: 'Gateway of India', time: '9:00 AM', address: 'Apollo Bandar, Colaba, Mumbai', rating: '4.5', ticketPricing: 'Free' },
        { name: 'Marine Drive', time: '11:00 AM', address: 'Marine Drive, Mumbai', rating: '4.3', ticketPricing: 'Free' },
        { name: 'Chhatrapati Shivaji Terminus', time: '2:00 PM', address: 'Fort, Mumbai', rating: '4.4', ticketPricing: 'Free' },
        { name: 'Elephanta Caves', time: '4:00 PM', address: 'Elephanta Island, Mumbai', rating: '4.2', ticketPricing: '₹40' }
      ],
      'delhi': [
        { name: 'Red Fort', time: '9:00 AM', address: 'Netaji Subhash Marg, Delhi', rating: '4.3', ticketPricing: '₹35' },
        { name: 'India Gate', time: '11:00 AM', address: 'Rajpath, New Delhi', rating: '4.4', ticketPricing: 'Free' },
        { name: 'Qutub Minar', time: '2:00 PM', address: 'Mehrauli, Delhi', rating: '4.2', ticketPricing: '₹30' },
        { name: 'Lotus Temple', time: '4:00 PM', address: 'Lotus Temple Rd, Delhi', rating: '4.5', ticketPricing: 'Free' }
      ],
      'goa': [
        { name: 'Baga Beach', time: '9:00 AM', address: 'Baga, Goa', rating: '4.2', ticketPricing: 'Free' },
        { name: 'Basilica of Bom Jesus', time: '11:00 AM', address: 'Old Goa', rating: '4.4', ticketPricing: '₹5' },
        { name: 'Fort Aguada', time: '2:00 PM', address: 'Candolim, Goa', rating: '4.1', ticketPricing: 'Free' },
        { name: 'Dudhsagar Falls', time: '4:00 PM', address: 'Mollem, Goa', rating: '4.6', ticketPricing: '₹30' }
      ]
    };

    const destKey = destination.toLowerCase();
    const places = destinationPlaces[destKey] || [
      { name: `${destination} Heritage Site`, time: '9:00 AM', address: `${destination}, India`, rating: '4.2', ticketPricing: '₹50' },
      { name: `${destination} Local Market`, time: '11:00 AM', address: `${destination}, India`, rating: '4.0', ticketPricing: 'Free' },
      { name: `${destination} Temple`, time: '2:00 PM', address: `${destination}, India`, rating: '4.3', ticketPricing: '₹20' },
      { name: `${destination} Museum`, time: '4:00 PM', address: `${destination}, India`, rating: '4.1', ticketPricing: '₹30' }
    ];

    return places.slice((dayNumber - 1) % places.length, ((dayNumber - 1) % places.length) + 3);
  }

  // Generate additional places
  generateAdditionalPlaces(destination, count) {
    const additionalPlaces = [
      { name: `${destination} Park`, time: '10:00 AM', address: `${destination}, India`, rating: '4.0', ticketPricing: 'Free' },
      { name: `${destination} Restaurant`, time: '12:00 PM', address: `${destination}, India`, rating: '4.2', ticketPricing: '₹500 for 2' },
      { name: `${destination} Shopping Center`, time: '3:00 PM', address: `${destination}, India`, rating: '4.1', ticketPricing: 'Varies' },
      { name: `${destination} Cultural Center`, time: '5:00 PM', address: `${destination}, India`, rating: '4.3', ticketPricing: '₹100' }
    ];

    return [additionalPlaces[count % additionalPlaces.length]];
  }

  // Enhanced hotels section
  async addEnhancedHotelsSection(pdf, tripData, yPosition) {
    if (yPosition > 220) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommended Hotels', 20, yPosition);
    yPosition += 15;

    const destination = tripData.destination?.name || tripData.userSelection?.destination?.name || 'Popular Destination';
    const budget = tripData.budget || tripData.userSelection?.budget || 'Medium';

    const hotels = this.generateHotelsForDestination(destination, budget);

    hotels.forEach((hotel, index) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${hotel.name}`, 25, yPosition);
      yPosition += 6;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');

      pdf.text(`Address: ${hotel.address}`, 30, yPosition);
      yPosition += 4;

      pdf.text(`Price: ${hotel.price} | Rating: ${hotel.rating}/5`, 30, yPosition);
      yPosition += 4;

      if (hotel.amenities) {
        pdf.text(`Amenities: ${hotel.amenities}`, 30, yPosition);
        yPosition += 6;
      }
    });

    return yPosition + 10;
  }

  // Generate hotels for destination
  generateHotelsForDestination(destination, budget) {
    const budgetLevel = typeof budget === 'string' ? budget.toLowerCase() : 'medium';

    const hotelsByBudget = {
      low: [
        { name: `${destination} Budget Inn`, address: `Central ${destination}`, price: '₹1,500/night', rating: '3.8', amenities: 'WiFi, AC, Breakfast' },
        { name: `${destination} Hostel`, address: `Near Station, ${destination}`, price: '₹800/night', rating: '3.5', amenities: 'WiFi, Shared Kitchen' },
        { name: `${destination} Guest House`, address: `Old City, ${destination}`, price: '₹1,200/night', rating: '3.6', amenities: 'WiFi, Room Service' }
      ],
      medium: [
        { name: `${destination} Grand Hotel`, address: `City Center, ${destination}`, price: '₹3,500/night', rating: '4.2', amenities: 'WiFi, Pool, Gym, Restaurant' },
        { name: `${destination} Palace`, address: `Heritage Area, ${destination}`, price: '₹4,000/night', rating: '4.3', amenities: 'WiFi, Spa, Restaurant, Bar' },
        { name: `${destination} Comfort Inn`, address: `Business District, ${destination}`, price: '₹2,800/night', rating: '4.0', amenities: 'WiFi, AC, Breakfast, Gym' }
      ],
      high: [
        { name: `${destination} Luxury Resort`, address: `Premium Location, ${destination}`, price: '₹8,500/night', rating: '4.7', amenities: 'WiFi, Pool, Spa, Multiple Restaurants, Concierge' },
        { name: `${destination} Five Star Hotel`, address: `Downtown, ${destination}`, price: '₹12,000/night', rating: '4.8', amenities: 'WiFi, Pool, Spa, Fine Dining, Butler Service' },
        { name: `${destination} Heritage Hotel`, address: `Historic Quarter, ${destination}`, price: '₹10,000/night', rating: '4.6', amenities: 'WiFi, Heritage Architecture, Fine Dining, Spa' }
      ]
    };

    return hotelsByBudget[budgetLevel] || hotelsByBudget.medium;
  }

  // Additional places section
  async addAdditionalPlacesSection(pdf, tripData, yPosition) {
    if (yPosition > 220) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Additional Recommendations', 20, yPosition);
    yPosition += 15;

    const destination = tripData.destination?.name || tripData.userSelection?.destination?.name || 'Popular Destination';

    const recommendations = [
      { category: 'Local Cuisine', items: [`${destination} Street Food`, `Traditional ${destination} Restaurant`, `Local Sweet Shop`] },
      { category: 'Shopping', items: [`${destination} Local Market`, `Handicraft Center`, `Souvenir Shops`] },
      { category: 'Transportation', items: ['Local Bus Service', 'Auto Rickshaw', 'Taxi Services', 'Metro (if available)'] }
    ];

    recommendations.forEach(rec => {
      if (yPosition > 260) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(rec.category, 25, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      rec.items.forEach(item => {
        pdf.text(`• ${item}`, 30, yPosition);
        yPosition += 4;
      });
      yPosition += 5;
    });

    return yPosition;
  }
}

export default new OfflineExportService();
