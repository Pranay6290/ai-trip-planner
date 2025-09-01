// Note: Auth context will be passed as parameter when needed
import { useAuth } from '../contexts/AuthContext';

class FrontendTelemetryService {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.batchSize = 50; // Increased batch size to reduce API calls
    this.flushInterval = 60000; // 60 seconds - reduced frequency
    this.isBackendAvailable = true; // Track backend availability

    // Start batch processing only if not in test environment
    if (typeof window !== 'undefined' && !window.location.href.includes('test')) {
      this.startBatchProcessor();
    }

    // Track page views (only in production)
    if (import.meta.env.PROD) {
      this.trackPageView();
    }

    // Track performance metrics (throttled)
    this.trackPerformanceMetrics();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Core event tracking with optimization
  trackEvent(eventName, properties = {}) {
    // Skip tracking in development unless explicitly enabled
    if (import.meta.env.DEV && !import.meta.env.VITE_ENABLE_ANALYTICS) {
      return;
    }

    // Skip if backend is known to be unavailable
    if (!this.isBackendAvailable && this.events.length > 100) {
      return;
    }

    const event = {
      eventName,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.pathname, // Only path, not full URL for privacy
      properties: {
        ...properties,
        platform: 'web',
        device: this.getDeviceType()
      }
    };

    this.events.push(event);
    
    // Immediate flush for critical events
    const criticalEvents = ['error', 'trip_exported', 'payment_completed'];
    if (criticalEvents.includes(eventName)) {
      this.flushEvents();
    }

    return event;
  }

  // Page tracking
  trackPageView(page = window.location.pathname) {
    return this.trackEvent('page_view', {
      page,
      title: document.title,
      timestamp: Date.now()
    });
  }

  // Trip planning events
  trackSearchStarted(searchQuery, filters = {}) {
    return this.trackEvent('search_started', {
      searchQuery,
      filters,
      timestamp: Date.now()
    });
  }

  trackDestinationSelected(destination, searchResults = []) {
    return this.trackEvent('destination_selected', {
      destination: destination.name || destination.label,
      placeId: destination.place_id,
      searchResultsCount: searchResults.length,
      selectionIndex: searchResults.findIndex(r => r.place_id === destination.place_id)
    });
  }

  trackFilterApplied(filterType, filterValue, resultCount) {
    return this.trackEvent('filter_applied', {
      filterType,
      filterValue,
      resultCount,
      timestamp: Date.now()
    });
  }

  trackItineraryGenerated(tripData, generationTime) {
    return this.trackEvent('itinerary_generated', {
      destination: tripData.destination?.name,
      duration: tripData.duration,
      budget: tripData.budget,
      travelers: tripData.travelers,
      generationTimeMs: generationTime,
      timestamp: Date.now()
    });
  }

  trackActivityAdded(activity, method = 'manual') {
    return this.trackEvent('activity_added', {
      activityName: activity.placeName || activity.name,
      category: activity.category,
      method, // 'manual', 'ai_suggestion', 'drag_drop'
      dayNumber: activity.dayNumber,
      timestamp: Date.now()
    });
  }

  trackTripExported(tripId, exportFormat, exportMethod) {
    return this.trackEvent('trip_exported', {
      tripId,
      exportFormat, // 'pdf', 'ics', 'json'
      exportMethod, // 'download', 'email', 'share'
      timestamp: Date.now()
    });
  }

  trackCollaborationInvited(tripId, inviteeCount, inviteMethod) {
    return this.trackEvent('collaboration_invited', {
      tripId,
      inviteeCount,
      inviteMethod, // 'email', 'link', 'social'
      timestamp: Date.now()
    });
  }

  trackChatMessage(messageType, intent, responseTime) {
    return this.trackEvent('chat_message_sent', {
      messageType, // 'user', 'assistant'
      intent, // 'search_place', 'modify_itinerary', 'get_info'
      responseTimeMs: responseTime,
      timestamp: Date.now()
    });
  }

  // User interaction events
  trackButtonClick(buttonName, context = {}) {
    return this.trackEvent('button_click', {
      buttonName,
      context,
      timestamp: Date.now()
    });
  }

  trackFormSubmit(formName, formData = {}) {
    return this.trackEvent('form_submit', {
      formName,
      formData: this.sanitizeFormData(formData),
      timestamp: Date.now()
    });
  }

  trackModalOpen(modalName, trigger) {
    return this.trackEvent('modal_open', {
      modalName,
      trigger, // 'button_click', 'auto', 'keyboard'
      timestamp: Date.now()
    });
  }

  trackModalClose(modalName, method) {
    return this.trackEvent('modal_close', {
      modalName,
      method, // 'button_click', 'escape', 'outside_click'
      timestamp: Date.now()
    });
  }

  // Error tracking
  trackError(error, context = {}) {
    return this.trackEvent('error', {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      context,
      url: window.location.href,
      timestamp: Date.now()
    });
  }

  // Performance tracking
  trackPerformance(metric, value, context = {}) {
    return this.trackEvent('performance', {
      metric, // 'page_load', 'component_render', 'api_call'
      value,
      unit: context.unit || 'ms',
      context,
      timestamp: Date.now()
    });
  }

  trackPerformanceMetrics() {
    // Track Core Web Vitals
    if ('web-vital' in window) {
      // This would integrate with web-vitals library
      // getCLS(this.trackWebVital.bind(this));
      // getFID(this.trackWebVital.bind(this));
      // getLCP(this.trackWebVital.bind(this));
    }

    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.trackPerformance('page_load_time', loadTime, {
        page: window.location.pathname
      });
    });
  }

  trackWebVital(metric) {
    this.trackPerformance(`web_vital_${metric.name.toLowerCase()}`, metric.value, {
      id: metric.id,
      delta: metric.delta
    });
  }

  // Batch processing
  startBatchProcessor() {
    setInterval(() => {
      if (this.events.length > 0) {
        this.flushEvents();
      }
    }, this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });
  }

  async flushEvents() {
    if (this.events.length === 0) return;

    const eventsToFlush = this.events.splice(0, this.batchSize);
    
    try {
      // Get backend URL from environment or use default
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      // Send to backend
      const response = await fetch(`${backendUrl}/api/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: eventsToFlush,
          sessionId: this.sessionId
        })
      });

      if (response.ok) {
        this.isBackendAvailable = true;
        console.log(`✅ Flushed ${eventsToFlush.length} analytics events to backend`);
      } else {
        this.isBackendAvailable = false;
        throw new Error(`Backend responded with ${response.status}`);
      }
    } catch (error) {
      this.isBackendAvailable = false;

      // Log events locally in development when backend is not available
      if (import.meta.env.DEV) {
        console.log(`📊 Analytics Events (${eventsToFlush.length}):`,
          eventsToFlush.map(e => `${e.eventName}: ${JSON.stringify(e.properties)}`).join(', '));
      }

      console.warn('⚠️ Analytics backend unavailable - events logged locally');
      // Don't re-add to queue to avoid infinite retry loops
    }
  }

  // Utility methods
  getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'chrome';
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Safari')) return 'safari';
    if (ua.includes('Edge')) return 'edge';
    return 'other';
  }

  sanitizeFormData(formData) {
    // Remove sensitive information
    const sanitized = { ...formData };
    const sensitiveFields = ['password', 'email', 'phone', 'creditCard'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  // Public API for React components
  static getInstance() {
    if (!window.telemetryService) {
      window.telemetryService = new FrontendTelemetryService();
    }
    return window.telemetryService;
  }
}

// Create singleton instance
const telemetryService = FrontendTelemetryService.getInstance();

// React hook for telemetry
export const useTelemetry = () => {
  const { currentUser } = useAuth();
  
  return {
    trackEvent: (eventName, properties = {}) => {
      return telemetryService.trackEvent(eventName, {
        ...properties,
        userId: currentUser?.uid
      });
    },
    trackPageView: (page) => telemetryService.trackPageView(page),
    trackSearchStarted: (query, filters) => telemetryService.trackSearchStarted(query, filters),
    trackDestinationSelected: (destination, results) => telemetryService.trackDestinationSelected(destination, results),
    trackFilterApplied: (type, value, count) => telemetryService.trackFilterApplied(type, value, count),
    trackItineraryGenerated: (data, time) => telemetryService.trackItineraryGenerated(data, time),
    trackActivityAdded: (activity, method) => telemetryService.trackActivityAdded(activity, method),
    trackTripExported: (id, format, method) => telemetryService.trackTripExported(id, format, method),
    trackButtonClick: (name, context) => telemetryService.trackButtonClick(name, context),
    trackFormSubmit: (name, data) => telemetryService.trackFormSubmit(name, data),
    trackError: (error, context) => telemetryService.trackError(error, context),
    trackPerformance: (metric, value, context) => telemetryService.trackPerformance(metric, value, context)
  };
};

export default telemetryService;
