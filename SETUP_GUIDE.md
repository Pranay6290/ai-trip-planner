# 🚀 AI Trip Planner - Setup Guide

## 📋 Prerequisites

Before running the enhanced AI Trip Planner, ensure you have:

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **API Keys** (see configuration section)

## 🔧 Installation

### 1. Install Dependencies

```bash
# Frontend dependencies
cd frontend
npm install

# Backend dependencies  
cd ../backend
npm install
```

### 2. Environment Configuration

Create `.env` files in both frontend and backend directories:

#### Frontend `.env`:
```env
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

#### Backend `.env`:
```env
GOOGLE_AI_API_KEY=your_google_ai_api_key
FIREBASE_SERVICE_ACCOUNT_KEY=path_to_firebase_service_account.json
PORT=5000
```

## 🔑 API Keys Setup

### 1. Google Places API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Places API**, **Maps JavaScript API**, **Directions API**
4. Create credentials (API Key)
5. Restrict the key to your domain for security

### 2. OpenWeather API
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Add to frontend `.env`

### 3. Google AI (Gemini)
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Create API key for Gemini
3. Add to backend `.env`

### 4. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable **Authentication**, **Firestore**, **Storage**
4. Get configuration keys
5. Download service account key for backend

## 🚀 Running the Application

### Development Mode

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Production Build

```bash
# Frontend build
cd frontend
npm run build

# Backend production
cd backend
npm start
```

## 🌐 Accessing the Application

1. **Frontend**: http://localhost:5173
2. **Backend**: http://localhost:5000
3. **Enhanced Planner**: http://localhost:5173/enhanced-planner

## 🎯 Testing the Features

### 1. Natural Language Input
Try these examples:
- "5-day romantic trip to Paris for 2 people with $3000 budget"
- "Family vacation to Tokyo, love food and museums, avoid crowds"
- "Budget backpacking through Europe for 2 weeks"

### 2. AI Chatbot
- Click the chat icon in bottom right
- Ask: "Find restaurants near my hotel"
- Ask: "What's the weather like?"
- Ask: "Add a museum to day 2"

### 3. Collaborative Planning
- Create a trip and share it
- Multiple users can join and vote on places
- Real-time updates across all users

### 4. Export Features
- Export trip as PDF with maps and images
- Export to calendar (.ics file)
- Generate QR codes for sharing

## 🔧 Troubleshooting

### Common Issues

1. **API Key Errors**
   - Ensure all API keys are correctly set in `.env` files
   - Check API quotas and billing in respective consoles
   - Verify API restrictions and permissions

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Ensure all dependencies are installed

3. **Firebase Connection Issues**
   - Verify Firebase configuration
   - Check Firestore security rules
   - Ensure service account key is valid

4. **Map Not Loading**
   - Check Google Maps API key
   - Verify domain restrictions
   - Ensure Maps JavaScript API is enabled

### Performance Tips

1. **Enable Caching**
   - API responses are cached automatically
   - Clear cache if experiencing stale data

2. **Optimize Images**
   - Images are lazy-loaded by default
   - Use appropriate image sizes for better performance

3. **Network Optimization**
   - Use debounced search inputs
   - Batch API requests where possible

## 📱 Mobile Testing

Test on various devices:
- **iOS Safari** - Touch interactions and PWA features
- **Android Chrome** - Voice input and offline capabilities
- **Desktop** - Full feature set and keyboard navigation

## 🛡️ Security Considerations

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables
   - Restrict API keys to specific domains

2. **Firebase Security**
   - Configure proper Firestore security rules
   - Enable authentication for sensitive operations
   - Monitor usage and set quotas

## 📊 Monitoring & Analytics

The application includes:
- **Error tracking** with detailed logging
- **Performance monitoring** with telemetry
- **User analytics** for feature usage
- **API usage tracking** for cost optimization

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Natural language input parses trip requests correctly
- ✅ Maps load with interactive markers and street view
- ✅ Weather data displays for selected destinations
- ✅ AI chatbot responds to travel questions
- ✅ PDF exports generate with maps and images
- ✅ Collaborative features sync in real-time
- ✅ Offline mode works without internet

## 🆘 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all API keys are correctly configured
3. Ensure all services are running
4. Check network connectivity for API calls

## 🎯 Next Steps

Once everything is running:
1. **Explore all features** - Try every component and service
2. **Test edge cases** - Invalid inputs, network failures, etc.
3. **Performance testing** - Load testing with multiple users
4. **Mobile optimization** - Test on various devices and screen sizes
5. **Production deployment** - Deploy to your preferred hosting platform

The AI Trip Planner is now ready to provide an exceptional travel planning experience! 🌟
