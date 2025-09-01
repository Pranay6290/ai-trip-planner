import { getFirestore } from '../config/firebase.js';
import { apiConfig } from '../config/apis.js';

class TelemetryService {
  constructor() {
    // Disable Firestore to prevent authentication errors
    this.db = null;
    this.events = [];
    this.batchSize = 50;
    this.flushInterval = 30000; // 30 seconds
    this.isFirestoreAvailable = false; // Disabled to prevent Firebase auth errors

    console.log('📊 Telemetry Service initialized: In-memory mode (Firebase disabled to prevent auth errors)');

    // Don't start batch processor to avoid Firebase calls
    // this.startBatchProcessor();
  }

  // Core event tracking
  async trackEvent(eventName, properties = {}, userId = null) {
    const event = {
      eventName,
      userId,
      sessionId: properties.sessionId || this.generateSessionId(),
      timestamp: new Date().toISOString(),
      properties: {
        ...properties,
        userAgent: properties.userAgent || 'Unknown',
        ip: properties.ip || 'Unknown',
        referrer: properties.referrer || 'Unknown',
        platform: properties.platform || 'web'
      }
    };

    // Add to batch
    this.events.push(event);

    // Immediate flush for critical events
    const criticalEvents = ['error', 'payment_completed', 'trip_exported'];
    if (criticalEvents.includes(eventName)) {
      await this.flushEvents();
    }

    return event;
  }

  // Trip planning events
  async trackSearchStarted(userId, searchQuery, filters = {}) {
    return this.trackEvent('search_started', {
      searchQuery,
      filters,
      timestamp: Date.now()
    }, userId);
  }

  async trackDestinationSelected(userId, destination, searchResults = []) {
    return this.trackEvent('destination_selected', {
      destination: destination.name,
      placeId: destination.placeId,
      country: destination.country,
      searchResultsCount: searchResults.length,
      selectionIndex: searchResults.findIndex(r => r.placeId === destination.placeId)
    }, userId);
  }

  async trackFilterApplied(userId, filterType, filterValue, resultCount) {
    return this.trackEvent('filter_applied', {
      filterType,
      filterValue,
      resultCount,
      timestamp: Date.now()
    }, userId);
  }

  async trackItineraryGenerated(userId, tripData, generationTime) {
    return this.trackEvent('itinerary_generated', {
      destination: tripData.destination?.name,
      duration: tripData.duration,
      budget: tripData.budget?.total,
      travelers: tripData.travelers?.length || 1,
      activitiesCount: tripData.itinerary?.reduce((acc, day) => acc + (day.activities?.length || 0), 0),
      generationTimeMs: generationTime,
      aiModel: 'gemini-1.5-flash'
    }, userId);
  }

  async trackActivityAdded(userId, tripId, activity, method = 'manual') {
    return this.trackEvent('activity_added', {
      tripId,
      activityId: activity.id,
      activityName: activity.placeRef?.name,
      category: activity.category,
      method, // 'manual', 'ai_suggestion', 'recommendation'
      dayNumber: activity.dayNumber,
      timeSlot: activity.timeSlot
    }, userId);
  }

  async trackTripExported(userId, tripId, exportFormat, exportMethod) {
    return this.trackEvent('trip_exported', {
      tripId,
      exportFormat, // 'pdf', 'ics', 'json'
      exportMethod, // 'download', 'email', 'share'
      timestamp: Date.now()
    }, userId);
  }

  async trackCollaborationInvited(userId, tripId, inviteeCount, inviteMethod) {
    return this.trackEvent('collaboration_invited', {
      tripId,
      inviteeCount,
      inviteMethod, // 'email', 'link', 'social'
      timestamp: Date.now()
    }, userId);
  }

  async trackChatMessage(userId, tripId, messageType, intent, responseTime) {
    return this.trackEvent('chat_message_sent', {
      tripId,
      messageType, // 'user', 'assistant'
      intent, // 'search_place', 'modify_itinerary', 'get_info'
      responseTimeMs: responseTime,
      timestamp: Date.now()
    }, userId);
  }

  async trackVoteCast(userId, tripId, itemId, itemType, vote) {
    return this.trackEvent('vote_cast', {
      tripId,
      itemId,
      itemType, // 'activity', 'place', 'accommodation'
      vote, // 'up', 'down', 'neutral'
      timestamp: Date.now()
    }, userId);
  }

  async trackTripCompleted(userId, tripId, completionData) {
    return this.trackEvent('trip_completed', {
      tripId,
      duration: completionData.duration,
      activitiesCompleted: completionData.activitiesCompleted,
      budgetSpent: completionData.budgetSpent,
      rating: completionData.rating,
      feedback: completionData.feedback,
      timestamp: Date.now()
    }, userId);
  }

  // Error tracking
  async trackError(error, context = {}, userId = null) {
    return this.trackEvent('error', {
      errorMessage: error.message,
      errorStack: error.stack,
      errorCode: error.code,
      context,
      severity: this.getErrorSeverity(error),
      timestamp: Date.now()
    }, userId);
  }

  // Performance tracking
  async trackPerformance(metric, value, context = {}) {
    return this.trackEvent('performance', {
      metric, // 'page_load', 'api_response', 'ai_generation'
      value,
      unit: context.unit || 'ms',
      context,
      timestamp: Date.now()
    });
  }

  // API usage tracking
  async trackApiUsage(service, endpoint, responseTime, statusCode, userId = null) {
    return this.trackEvent('api_usage', {
      service, // 'google_places', 'gemini_ai', 'weather'
      endpoint,
      responseTimeMs: responseTime,
      statusCode,
      timestamp: Date.now()
    }, userId);
  }

  // Batch processing
  startBatchProcessor() {
    setInterval(async () => {
      if (this.events.length > 0) {
        await this.flushEvents();
      }
    }, this.flushInterval);
  }

  async flushEvents() {
    if (this.events.length === 0) return;

    const eventsToFlush = this.events.splice(0, this.batchSize);
    
    try {
      // Skip Firestore to prevent authentication errors
      console.log(`📊 Analytics Events (${eventsToFlush.length} - in-memory only):`,
        eventsToFlush.map(e => `${e.eventName}`).join(', '));

      // Skip external services to prevent errors
      // await this.sendToExternalServices(eventsToFlush);

      console.log(`✅ Processed ${eventsToFlush.length} analytics events`);
    } catch (error) {
      console.error('❌ Error flushing analytics events:', error);
      // Re-add events to queue for retry (only if it's a temporary error)
      if (error.code !== 'permission-denied' && error.code !== 'unauthenticated') {
        this.events.unshift(...eventsToFlush);
      }
    }
  }

  async sendToExternalServices(events) {
    // Send to Google Analytics 4
    if (apiConfig.analytics.google.measurementId) {
      await this.sendToGA4(events);
    }

    // Send to Mixpanel
    if (apiConfig.analytics.mixpanel.token) {
      await this.sendToMixpanel(events);
    }
  }

  async sendToGA4(events) {
    // Implementation for Google Analytics 4
    // This would use the Measurement Protocol
  }

  async sendToMixpanel(events) {
    // Implementation for Mixpanel
    // This would use the Mixpanel API
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getErrorSeverity(error) {
    if (error.code >= 500) return 'critical';
    if (error.code >= 400) return 'error';
    return 'warning';
  }

  // Analytics queries
  async getEventStats(eventName, timeRange = '7d') {
    if (!this.db) return null;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const snapshot = await this.db
      .collection('analytics')
      .where('eventName', '==', eventName)
      .where('timestamp', '>=', startDate.toISOString())
      .get();

    return {
      totalEvents: snapshot.size,
      uniqueUsers: new Set(snapshot.docs.map(doc => doc.data().userId)).size,
      events: snapshot.docs.map(doc => doc.data())
    };
  }

  async getUserJourney(userId, timeRange = '30d') {
    if (!this.db) return null;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const snapshot = await this.db
      .collection('analytics')
      .where('userId', '==', userId)
      .where('timestamp', '>=', startDate.toISOString())
      .orderBy('timestamp', 'asc')
      .get();

    return snapshot.docs.map(doc => doc.data());
  }
}

export default new TelemetryService();
