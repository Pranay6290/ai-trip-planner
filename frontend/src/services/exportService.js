import { useTelemetry } from './telemetryService';

class ExportService {
  constructor() {
    this.cache = new Map();
    this.offlineData = new Map();
    this.serviceWorkerRegistration = null;
    this.initializeServiceWorker();
  }

  // Initialize service worker for offline functionality
  async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Export itinerary to PDF
  async exportToPDF(tripData, itinerary, options = {}) {
    try {
      const pdfData = await this.generatePDFData(tripData, itinerary, options);
      
      // Create PDF using jsPDF or similar library
      const pdf = await this.createPDF(pdfData);
      
      // Download or return PDF
      if (options.download !== false) {
        this.downloadFile(pdf, `${tripData.destination?.name || 'Trip'}_Itinerary.pdf`, 'application/pdf');
      }

      return {
        success: true,
        format: 'pdf',
        size: pdf.length,
        filename: `${tripData.destination?.name || 'Trip'}_Itinerary.pdf`
      };
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error(`Failed to export PDF: ${error.message}`);
    }
  }

  // Export itinerary to ICS (calendar format)
  async exportToICS(tripData, itinerary, options = {}) {
    try {
      const icsContent = this.generateICSContent(tripData, itinerary, options);
      
      if (options.download !== false) {
        this.downloadFile(icsContent, `${tripData.destination?.name || 'Trip'}_Calendar.ics`, 'text/calendar');
      }

      return {
        success: true,
        format: 'ics',
        size: icsContent.length,
        filename: `${tripData.destination?.name || 'Trip'}_Calendar.ics`,
        content: icsContent
      };
    } catch (error) {
      console.error('Error exporting to ICS:', error);
      throw new Error(`Failed to export ICS: ${error.message}`);
    }
  }

  // Export itinerary to JSON
  async exportToJSON(tripData, itinerary, options = {}) {
    try {
      const exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          source: 'AI Trip Planner',
          author: 'Pranay Gupta'
        },
        tripData: tripData,
        itinerary: itinerary,
        exportOptions: options
      };

      const jsonContent = JSON.stringify(exportData, null, 2);
      
      if (options.download !== false) {
        this.downloadFile(jsonContent, `${tripData.destination?.name || 'Trip'}_Data.json`, 'application/json');
      }

      return {
        success: true,
        format: 'json',
        size: jsonContent.length,
        filename: `${tripData.destination?.name || 'Trip'}_Data.json`,
        content: exportData
      };
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw new Error(`Failed to export JSON: ${error.message}`);
    }
  }

  // Generate shareable link
  async generateShareableLink(tripData, itinerary, options = {}) {
    try {
      // Create a shareable trip ID
      const shareId = this.generateShareId();
      
      // Store trip data for sharing (would use backend API)
      const shareData = {
        id: shareId,
        tripData: tripData,
        itinerary: itinerary,
        permissions: options.permissions || 'view',
        expiresAt: options.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        createdAt: new Date().toISOString()
      };

      // In a real implementation, this would save to backend
      this.cache.set(`share_${shareId}`, shareData);

      const shareUrl = `${window.location.origin}/shared-trip/${shareId}`;

      return {
        success: true,
        shareId: shareId,
        shareUrl: shareUrl,
        permissions: shareData.permissions,
        expiresAt: shareData.expiresAt
      };
    } catch (error) {
      console.error('Error generating shareable link:', error);
      throw new Error(`Failed to generate shareable link: ${error.message}`);
    }
  }

  // Prepare trip for offline access
  async prepareOfflineTrip(tripData, itinerary, options = {}) {
    try {
      const offlineData = {
        tripData: tripData,
        itinerary: itinerary,
        offlineAssets: await this.cacheOfflineAssets(itinerary),
        maps: await this.cacheOfflineMaps(itinerary),
        lastUpdated: new Date().toISOString(),
        version: 1
      };

      // Store in IndexedDB for offline access
      await this.storeOfflineData(tripData.id, offlineData);

      // Cache essential assets
      if (this.serviceWorkerRegistration) {
        await this.cacheEssentialAssets();
      }

      return {
        success: true,
        offlineReady: true,
        dataSize: JSON.stringify(offlineData).length,
        assetsCount: offlineData.offlineAssets.length,
        mapsCount: offlineData.maps.length
      };
    } catch (error) {
      console.error('Error preparing offline trip:', error);
      throw new Error(`Failed to prepare offline trip: ${error.message}`);
    }
  }

  // Generate PDF data structure
  async generatePDFData(tripData, itinerary, options) {
    return {
      title: `${tripData.destination?.name || 'Trip'} Itinerary`,
      subtitle: `${itinerary.tripSummary?.duration || tripData.duration} Day Trip Plan`,
      metadata: {
        destination: tripData.destination?.name,
        duration: itinerary.tripSummary?.duration || tripData.duration,
        travelers: tripData.travelers,
        budget: itinerary.tripSummary?.totalEstimatedCost,
        generatedAt: new Date().toLocaleDateString(),
        generatedBy: 'AI Trip Planner by Pranay Gupta'
      },
      summary: {
        highlights: itinerary.tripSummary?.highlights || [],
        bestTimeToVisit: itinerary.tripSummary?.bestTimeToVisit,
        totalEstimatedCost: itinerary.tripSummary?.totalEstimatedCost,
        accommodation: itinerary.accommodation || []
      },
      dailyItinerary: itinerary.itinerary?.map((day, index) => ({
        dayNumber: index + 1,
        date: day.date,
        theme: day.theme,
        activities: day.activities?.map(activity => ({
          time: activity.timeSlot?.startTime,
          name: activity.name,
          description: activity.description,
          location: activity.location?.address,
          duration: activity.duration,
          cost: activity.cost?.amount,
          tips: activity.tips,
          category: activity.category
        })) || [],
        meals: day.meals || {},
        transportation: day.transportation || {},
        dailyBudget: day.dailyBudget || {}
      })) || [],
      practicalInfo: itinerary.practicalInfo || {},
      alternatives: itinerary.alternatives || {},
      footer: {
        disclaimer: 'This itinerary was generated by AI and should be verified before travel.',
        contact: 'For support, visit our website or contact us.',
        copyright: '© 2024 AI Trip Planner. Made with ❤️ by Pranay Gupta.'
      }
    };
  }

  // Create PDF from data
  async createPDF(pdfData) {
    // This would use a PDF generation library like jsPDF
    // For now, return a mock PDF content
    const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(${pdfData.title}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF
`;
    
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  // Generate ICS calendar content
  generateICSContent(tripData, itinerary, options) {
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AI Trip Planner//Trip Itinerary//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${tripData.destination?.name || 'Trip'} Itinerary`,
      'X-WR-CALDESC:Generated by AI Trip Planner'
    ];

    // Add events for each activity
    itinerary.itinerary?.forEach((day, dayIndex) => {
      day.activities?.forEach((activity, activityIndex) => {
        const startDate = new Date(day.date);
        const startTime = activity.timeSlot?.startTime || '09:00';
        const [hours, minutes] = startTime.split(':');
        startDate.setHours(parseInt(hours), parseInt(minutes));

        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + (activity.estimatedDuration || 120));

        const eventId = `${tripData.id || 'trip'}-day${dayIndex + 1}-activity${activityIndex + 1}`;
        
        icsLines.push(
          'BEGIN:VEVENT',
          `UID:${eventId}@aitripplanner.com`,
          `DTSTART:${this.formatICSDate(startDate)}`,
          `DTEND:${this.formatICSDate(endDate)}`,
          `SUMMARY:${activity.name}`,
          `DESCRIPTION:${activity.description || ''}`,
          `LOCATION:${activity.location?.address || ''}`,
          `CATEGORIES:${activity.category || 'Travel'}`,
          'STATUS:CONFIRMED',
          'TRANSP:OPAQUE',
          'END:VEVENT'
        );
      });
    });

    icsLines.push('END:VCALENDAR');
    return icsLines.join('\r\n');
  }

  // Cache offline assets (images, etc.)
  async cacheOfflineAssets(itinerary) {
    const assets = [];
    
    // Extract image URLs from itinerary
    itinerary.itinerary?.forEach(day => {
      day.activities?.forEach(activity => {
        if (activity.photos) {
          activity.photos.forEach(photo => {
            assets.push({
              url: photo.url,
              type: 'image',
              activityId: activity.id
            });
          });
        }
      });
    });

    // Cache assets using service worker
    if (this.serviceWorkerRegistration && assets.length > 0) {
      try {
        await this.serviceWorkerRegistration.active?.postMessage({
          type: 'CACHE_ASSETS',
          assets: assets.map(asset => asset.url)
        });
      } catch (error) {
        console.warn('Failed to cache assets:', error);
      }
    }

    return assets;
  }

  // Cache offline maps
  async cacheOfflineMaps(itinerary) {
    const maps = [];
    
    // Generate map tiles for key locations
    itinerary.itinerary?.forEach((day, dayIndex) => {
      day.activities?.forEach(activity => {
        if (activity.location?.coordinates) {
          maps.push({
            dayNumber: dayIndex + 1,
            activityId: activity.id,
            coordinates: activity.location.coordinates,
            mapUrl: this.generateStaticMapUrl(activity.location.coordinates)
          });
        }
      });
    });

    return maps;
  }

  // Store data in IndexedDB for offline access
  async storeOfflineData(tripId, data) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TripPlannerOffline', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['trips'], 'readwrite');
        const store = transaction.objectStore('trips');
        
        const putRequest = store.put({ id: tripId, data: data });
        putRequest.onsuccess = () => resolve(true);
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('trips')) {
          db.createObjectStore('trips', { keyPath: 'id' });
        }
      };
    });
  }

  // Helper methods
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  generateShareId() {
    return `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  formatICSDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  generateStaticMapUrl(coordinates, zoom = 15, size = '400x300') {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=${zoom}&size=${size}&key=${apiKey}`;
  }

  async cacheEssentialAssets() {
    const essentialAssets = [
      '/',
      '/static/css/main.css',
      '/static/js/main.js',
      '/manifest.json'
    ];

    if (this.serviceWorkerRegistration) {
      await this.serviceWorkerRegistration.active?.postMessage({
        type: 'CACHE_ESSENTIAL',
        assets: essentialAssets
      });
    }
  }

  // Get offline trip data
  async getOfflineTrip(tripId) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TripPlannerOffline', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['trips'], 'readonly');
        const store = transaction.objectStore('trips');
        
        const getRequest = store.get(tripId);
        getRequest.onsuccess = () => {
          resolve(getRequest.result?.data || null);
        };
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }

  // Check if trip is available offline
  async isOfflineAvailable(tripId) {
    try {
      const offlineData = await this.getOfflineTrip(tripId);
      return !!offlineData;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const exportService = new ExportService();

// React hook for export service
export const useExportService = () => {
  const telemetry = useTelemetry();

  return {
    exportToPDF: async (tripData, itinerary, options) => {
      try {
        telemetry.trackTripExported(tripData.id, 'pdf', 'download');
        return await exportService.exportToPDF(tripData, itinerary, options);
      } catch (error) {
        telemetry.trackError(error, { action: 'exportToPDF', tripId: tripData.id });
        throw error;
      }
    },

    exportToICS: async (tripData, itinerary, options) => {
      try {
        telemetry.trackTripExported(tripData.id, 'ics', 'download');
        return await exportService.exportToICS(tripData, itinerary, options);
      } catch (error) {
        telemetry.trackError(error, { action: 'exportToICS', tripId: tripData.id });
        throw error;
      }
    },

    exportToJSON: async (tripData, itinerary, options) => {
      try {
        telemetry.trackTripExported(tripData.id, 'json', 'download');
        return await exportService.exportToJSON(tripData, itinerary, options);
      } catch (error) {
        telemetry.trackError(error, { action: 'exportToJSON', tripId: tripData.id });
        throw error;
      }
    },

    generateShareableLink: async (tripData, itinerary, options) => {
      try {
        const result = await exportService.generateShareableLink(tripData, itinerary, options);
        telemetry.trackEvent('shareable_link_generated', { 
          tripId: tripData.id,
          permissions: result.permissions 
        });
        return result;
      } catch (error) {
        telemetry.trackError(error, { action: 'generateShareableLink', tripId: tripData.id });
        throw error;
      }
    },

    prepareOfflineTrip: async (tripData, itinerary, options) => {
      try {
        const result = await exportService.prepareOfflineTrip(tripData, itinerary, options);
        telemetry.trackEvent('offline_trip_prepared', { 
          tripId: tripData.id,
          dataSize: result.dataSize,
          assetsCount: result.assetsCount 
        });
        return result;
      } catch (error) {
        telemetry.trackError(error, { action: 'prepareOfflineTrip', tripId: tripData.id });
        throw error;
      }
    },

    getOfflineTrip: async (tripId) => {
      try {
        return await exportService.getOfflineTrip(tripId);
      } catch (error) {
        telemetry.trackError(error, { action: 'getOfflineTrip', tripId });
        throw error;
      }
    },

    isOfflineAvailable: async (tripId) => {
      try {
        return await exportService.isOfflineAvailable(tripId);
      } catch (error) {
        telemetry.trackError(error, { action: 'isOfflineAvailable', tripId });
        return false;
      }
    }
  };
};

export default exportService;
