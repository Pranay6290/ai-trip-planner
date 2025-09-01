import express from 'express';
const router = express.Router();

// Analytics endpoint to receive telemetry data
router.post('/events', async (req, res) => {
  try {
    const { events, sessionId } = req.body;
    
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ 
        error: 'Invalid events data',
        message: 'Events must be an array'
      });
    }

    // In development, just log the events
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Received ${events.length} analytics events from session: ${sessionId}`);
      
      // Log event summary
      const eventSummary = events.reduce((acc, event) => {
        acc[event.eventName] = (acc[event.eventName] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📈 Event summary:', eventSummary);
    }

    // TODO: In production, store events in database or send to analytics service
    // For now, we'll just acknowledge receipt
    
    res.json({
      success: true,
      message: `Processed ${events.length} events`,
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error processing analytics events:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process analytics events'
    });
  }
});

// Health check for analytics service
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'analytics',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get analytics summary (for admin dashboard)
router.get('/summary', (req, res) => {
  // TODO: Implement analytics summary
  res.json({
    message: 'Analytics summary endpoint - coming soon',
    timestamp: new Date().toISOString()
  });
});

export default router;
