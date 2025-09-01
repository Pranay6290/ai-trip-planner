# 🗄️ Data Models & Database Schema

> **AI Trip Planner - Made by Pranay Gupta**

## 📊 Core Data Models

### **1. User Model**
```typescript
interface User {
  id: string;                    // Firebase UID
  email: string;
  displayName: string;
  photoURL?: string;
  preferences: UserPreferences;
  profile: UserProfile;
  stats: UserStats;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActiveAt: Timestamp;
}

interface UserPreferences {
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  travelStyle: TravelStyle[];     // adventure, luxury, budget, family, etc.
  pace: 'slow' | 'moderate' | 'fast';
  interests: Interest[];          // food, culture, nature, nightlife, etc.
  accessibility: AccessibilityNeeds;
  language: string;
  timezone: string;
  notifications: NotificationSettings;
}

interface UserProfile {
  age?: number;
  location?: {
    city: string;
    country: string;
    coordinates: GeoPoint;
  };
  bio?: string;
  travelExperience: 'beginner' | 'intermediate' | 'expert';
  groupTravelPreference: 'solo' | 'couple' | 'family' | 'friends';
}

interface UserStats {
  tripsPlanned: number;
  tripsCompleted: number;
  countriesVisited: number;
  totalDaysPlanned: number;
  averageRating: number;
  lastTripDate?: Timestamp;
}
```

### **2. Trip Model**
```typescript
interface Trip {
  id: string;
  userId: string;               // Owner
  title: string;
  description?: string;
  destination: Destination;
  dates: {
    startDate: Timestamp;
    endDate: Timestamp;
    duration: number;           // days
    flexible: boolean;
  };
  budget: Budget;
  travelers: Traveler[];
  preferences: TripPreferences;
  itinerary: Day[];
  metadata: TripMetadata;
  collaboration: CollaborationSettings;
  status: TripStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Destination {
  name: string;
  placeId: string;             // Google Places ID
  coordinates: GeoPoint;
  country: string;
  region?: string;
  timezone: string;
  currency: string;
  language: string[];
  climate: ClimateInfo;
}

interface Budget {
  total: number;
  currency: string;
  breakdown: {
    accommodation: number;
    food: number;
    transportation: number;
    activities: number;
    shopping: number;
    miscellaneous: number;
  };
  spent?: number;
  remaining?: number;
}

interface Traveler {
  id: string;
  name: string;
  email?: string;
  age?: number;
  role: 'owner' | 'editor' | 'viewer';
  preferences?: UserPreferences;
  status: 'confirmed' | 'pending' | 'declined';
}
```

### **3. Day Model**
```typescript
interface Day {
  id: string;
  tripId: string;
  dayNumber: number;
  date: Timestamp;
  title?: string;
  theme?: string;              // "Cultural Exploration", "Food Tour", etc.
  activities: Activity[];
  transportation: Transportation[];
  meals: Meal[];
  accommodation?: Accommodation;
  weather?: WeatherInfo;
  budget: {
    planned: number;
    actual?: number;
  };
  notes?: string;
  status: 'planned' | 'in_progress' | 'completed';
}

interface Activity {
  id: string;
  placeRef: PlaceRef;
  timeSlot: TimeSlot;
  duration: number;            // minutes
  priority: 'must_see' | 'recommended' | 'optional';
  category: ActivityCategory;
  estimatedCost: number;
  actualCost?: number;
  rating?: number;
  notes?: string;
  bookingInfo?: BookingInfo;
  weather_dependent: boolean;
  indoor: boolean;
}

interface TimeSlot {
  startTime: string;           // HH:MM format
  endTime: string;
  flexible: boolean;
}
```

### **4. PlaceRef Model**
```typescript
interface PlaceRef {
  id: string;
  placeId: string;             // Google Places ID
  name: string;
  address: string;
  coordinates: GeoPoint;
  category: PlaceCategory;
  subcategory?: string;
  rating: number;
  priceLevel: 1 | 2 | 3 | 4;
  photos: Photo[];
  contact: ContactInfo;
  hours: OpeningHours;
  website?: string;
  description?: string;
  amenities: string[];
  accessibility: AccessibilityInfo;
  lastUpdated: Timestamp;
}

interface Photo {
  url: string;
  width: number;
  height: number;
  attribution?: string;
}

interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

interface OpeningHours {
  periods: Period[];
  weekdayText: string[];
  openNow?: boolean;
}

interface Period {
  open: TimeOfDay;
  close?: TimeOfDay;
}

interface TimeOfDay {
  day: number;                 // 0-6 (Sunday-Saturday)
  time: string;               // HHMM format
}
```

### **5. Message Model (Chat)**
```typescript
interface Message {
  id: string;
  tripId?: string;
  userId: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  context?: ChatContext;
  actions?: ChatAction[];
  timestamp: Timestamp;
  metadata?: MessageMetadata;
}

interface ChatContext {
  tripId?: string;
  currentStep?: string;
  userIntent?: string;
  entities?: Entity[];
  confidence?: number;
}

interface ChatAction {
  type: 'search_place' | 'add_activity' | 'modify_itinerary' | 'get_weather' | 'calculate_budget';
  parameters: Record<string, any>;
  result?: any;
  status: 'pending' | 'completed' | 'failed';
}

interface Entity {
  type: 'location' | 'date' | 'budget' | 'activity' | 'preference';
  value: string;
  confidence: number;
}
```

### **6. Vote Model (Collaboration)**
```typescript
interface Vote {
  id: string;
  tripId: string;
  itemId: string;              // Activity, Place, or Day ID
  itemType: 'activity' | 'place' | 'day' | 'accommodation';
  userId: string;
  vote: 'up' | 'down' | 'neutral';
  comment?: string;
  timestamp: Timestamp;
}

interface VotingSummary {
  itemId: string;
  upVotes: number;
  downVotes: number;
  neutralVotes: number;
  totalVotes: number;
  score: number;               // Calculated score
  consensus: 'strong_yes' | 'yes' | 'neutral' | 'no' | 'strong_no';
}
```

## 🏗️ Database Collections Structure

### **Firestore Collections**

```
/users/{userId}
  - User document
  
/trips/{tripId}
  - Trip document
  /days/{dayId}
    - Day document
    /activities/{activityId}
      - Activity document
  /messages/{messageId}
    - Chat message document
  /votes/{voteId}
    - Vote document
  /collaborators/{userId}
    - Collaborator document

/places/{placeId}
  - Cached place information
  
/templates/{templateId}
  - Trip templates
  
/analytics/{eventId}
  - Analytics events
```

### **Indexes Required**

```javascript
// Compound indexes for efficient queries
const indexes = [
  // Trips by user and status
  { collection: 'trips', fields: ['userId', 'status', 'createdAt'] },
  
  // Activities by day and time
  { collection: 'trips/{tripId}/days/{dayId}/activities', fields: ['timeSlot.startTime', 'priority'] },
  
  // Messages by trip and timestamp
  { collection: 'trips/{tripId}/messages', fields: ['timestamp', 'type'] },
  
  // Votes by item and user
  { collection: 'trips/{tripId}/votes', fields: ['itemId', 'userId'] },
  
  // Places by category and rating
  { collection: 'places', fields: ['category', 'rating', 'lastUpdated'] }
];
```

## 🔄 Data Flow Patterns

### **Trip Creation Flow**
1. User input → Trip preferences
2. AI processing → Place suggestions
3. User selection → Itinerary generation
4. Optimization → Final trip plan
5. Collaboration → Shared planning

### **Real-time Updates**
- Firestore real-time listeners for collaborative features
- WebSocket connections for chat functionality
- Push notifications for important updates

### **Caching Strategy**
- Place data cached locally and in Firestore
- User preferences cached in local storage
- Trip data synced with offline capability

## 📊 Analytics Events

### **Core Events**
```typescript
interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  sessionId: string;
  timestamp: Timestamp;
  properties: Record<string, any>;
}

// Key events to track
const events = [
  'search_started',
  'destination_selected',
  'filter_applied',
  'itinerary_generated',
  'activity_added',
  'trip_exported',
  'collaboration_invited',
  'chat_message_sent',
  'vote_cast',
  'trip_completed'
];
```

---

<div align="center">
  <p><strong>Made with ❤️ by Pranay Gupta</strong></p>
  <p>© 2024 AI Trip Planner. All rights reserved.</p>
</div>
