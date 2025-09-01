# AI Trip Planner - Setup Instructions

## Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

## Environment Configuration

### Frontend (.env file in frontend folder)
The frontend/.env file has been configured with:
- Firebase configuration
- Google Gemini AI API key
- Google Places API key
- Google Maps API key

### Backend (.env file in backend folder)
The backend/.env file has been configured with:
- Server configuration
- Google API keys
- Firebase configuration

## Installation & Running

### Option 1: Use the startup script
1. Double-click `start-project.bat` to automatically install dependencies and start both servers

### Option 2: Manual setup
1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

4. Start the frontend server (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

## Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Keys Configured
- ✅ Google Gemini AI API Key
- ✅ Google Places API Key
- ✅ Google Maps API Key
- ✅ Firebase Configuration

## Features Available
- Trip planning with AI
- Google Places integration
- Firebase authentication
- Real-time trip management

## Troubleshooting
1. If you get Firebase errors, make sure all environment variables are correctly set
2. If Google API calls fail, verify your API keys have the necessary permissions
3. Make sure both servers are running on different ports (5173 for frontend, 5000 for backend)

## Next Steps
1. Test the application by creating a new trip
2. Verify Firebase authentication is working
3. Test Google Places API integration
4. Check AI trip generation functionality
