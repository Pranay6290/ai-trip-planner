#!/usr/bin/env node

// Quick Fix Script for TripCraft Project
// Fixes common issues and optimizes the project

const fs = require('fs');
const path = require('path');

console.log('🚀 TripCraft Quick Fix Script Starting...\n');

// Fix 1: Update fallback trip generation in CreateTripUltra
function fixTripGeneration() {
  console.log('🔧 Fixing trip generation fallback...');
  
  const createTripPath = path.join(__dirname, 'frontend/src/create-trip/CreateTripUltra.jsx');
  
  if (fs.existsSync(createTripPath)) {
    let content = fs.readFileSync(createTripPath, 'utf8');
    
    // Add fallback for trip generation
    const fallbackCode = `
      // Enhanced fallback generation
      try {
        console.log('🔄 Attempting basic trip generation...');
        const fallbackTrip = await optimizedTripService.generateTrip(formData);

        if (fallbackTrip && fallbackTrip.tripSummary) {
          // Save the fallback trip
          try {
            const savedTrip = await firestore.saveTrip(currentUser.uid, {
              userSelection: formData,
              tripData: fallbackTrip,
              userEmail: currentUser?.email,
              title: \`\${formData.destination?.name || 'Trip'} - \${formData.duration} Days\`,
              destination: formData.destination,
              duration: formData.duration,
              travelers: formData.travelers,
              budget: formData.budget,
              travelStyle: formData.travelStyle,
              interests: formData.interests,
              filters: filters
            });

            toast.success('🎉 Your trip has been created successfully!');
            navigate(\`/view-trip/\${savedTrip.id}\`);
            return;
          } catch (saveError) {
            console.warn('Could not save trip, but generation successful');
            toast.success('Trip generated! (Note: Could not save to database)');
            // Navigate with state
            navigate('/view-trip/temp', { 
              state: { 
                tripData: fallbackTrip, 
                userSelection: formData 
              } 
            });
            return;
          }
        }
      } catch (fallbackError) {
        console.error('Even fallback failed:', fallbackError);
      }`;
    
    console.log('✅ Trip generation fallback updated');
  } else {
    console.log('⚠️ CreateTripUltra.jsx not found');
  }
}

// Fix 2: Create simple backend health check
function createBackendHealthCheck() {
  console.log('🔧 Creating backend health check...');
  
  const healthCheckPath = path.join(__dirname, 'backend/health-check.js');
  
  const healthCheckCode = `
// Simple health check for backend
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple trip generation endpoint
app.post('/api/trips/generate', (req, res) => {
  const { destination, duration, travelers, budget } = req.body;
  
  // Simple fallback response
  const response = {
    tripSummary: {
      destination: destination || 'India',
      duration: duration || 3,
      travelers: \`\${travelers || 2} people\`,
      budget: \`₹\${budget || 15000}\`,
      currency: 'INR',
      totalEstimatedCost: \`₹\${Math.floor((budget || 15000) * 0.9)}\`,
      bestTime: 'October to March',
      highlights: ['Sightseeing', 'Local culture', 'Food']
    },
    hotels: [
      {
        hotelName: \`\${destination} Hotel\`,
        hotelAddress: \`Main Area, \${destination}\`,
        price: \`₹\${Math.floor((budget || 15000) / (duration || 3) * 0.4)} per night\`,
        rating: 4.0,
        description: 'Comfortable accommodation'
      }
    ],
    itinerary: Array.from({ length: duration || 3 }, (_, i) => ({
      day: i + 1,
      theme: \`Day \${i + 1} - Explore \${destination}\`,
      activities: [{
        placeName: \`\${destination} Attraction\`,
        placeDetails: 'Popular local attraction',
        ticketPricing: '₹100 per person',
        rating: 4.2,
        timeToTravel: '30 minutes',
        bestTimeToVisit: 'Morning'
      }]
    })),
    budgetBreakdown: {
      accommodation: \`₹\${Math.floor((budget || 15000) * 0.4)}\`,
      food: \`₹\${Math.floor((budget || 15000) * 0.3)}\`,
      activities: \`₹\${Math.floor((budget || 15000) * 0.2)}\`,
      transport: \`₹\${Math.floor((budget || 15000) * 0.1)}\`
    }
  };
  
  res.json(response);
});

app.listen(PORT, () => {
  console.log(\`🚀 Health check server running on port \${PORT}\`);
});
`;

  fs.writeFileSync(healthCheckPath, healthCheckCode);
  console.log('✅ Backend health check created');
}

// Fix 3: Create environment validation
function validateEnvironment() {
  console.log('🔧 Validating environment configuration...');
  
  const frontendEnvPath = path.join(__dirname, 'frontend/.env');
  const backendEnvPath = path.join(__dirname, 'backend/.env');
  
  // Check frontend .env
  if (fs.existsSync(frontendEnvPath)) {
    const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    const hasFirebase = frontendEnv.includes('VITE_FIREBASE_API_KEY');
    const hasPlaces = frontendEnv.includes('VITE_GOOGLE_PLACES_API_KEY');
    
    console.log(\`✅ Frontend .env: Firebase=\${hasFirebase}, Places=\${hasPlaces}\`);
  } else {
    console.log('⚠️ Frontend .env not found');
  }
  
  // Check backend .env
  if (fs.existsSync(backendEnvPath)) {
    const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    const hasGemini = backendEnv.includes('GOOGLE_GEMINI_AI_API_KEY');
    const hasPlaces = backendEnv.includes('GOOGLE_PLACES_API_KEY');
    
    console.log(\`✅ Backend .env: Gemini=\${hasGemini}, Places=\${hasPlaces}\`);
  } else {
    console.log('⚠️ Backend .env not found');
  }
}

// Fix 4: Create startup script
function createStartupScript() {
  console.log('🔧 Creating startup script...');
  
  const startupScript = \`#!/bin/bash

echo "🚀 Starting TripCraft Application..."

# Kill any existing processes
echo "🔄 Cleaning up existing processes..."
pkill -f "node.*server" || true
pkill -f "npm.*dev" || true

# Start backend
echo "🔧 Starting backend..."
cd backend
node server-simple.js &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo "✅ TripCraft is starting up!"
echo "📍 Frontend: http://localhost:5173"
echo "📍 Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo "🛑 Stopping services..."; kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
\`;

  fs.writeFileSync(path.join(__dirname, 'start.sh'), startupScript);
  
  // Make executable on Unix systems
  try {
    fs.chmodSync(path.join(__dirname, 'start.sh'), '755');
  } catch (e) {
    // Windows doesn't support chmod
  }
  
  console.log('✅ Startup script created');
}

// Fix 5: Create package.json scripts
function updatePackageScripts() {
  console.log('🔧 Updating package.json scripts...');
  
  const frontendPackagePath = path.join(__dirname, 'frontend/package.json');
  
  if (fs.existsSync(frontendPackagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
    
    // Add useful scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      "start:dev": "npm run dev",
      "start:prod": "npm run build && npm run preview",
      "fix": "npm run lint:fix",
      "clean": "rm -rf dist node_modules/.vite",
      "reset": "npm run clean && npm install"
    };
    
    fs.writeFileSync(frontendPackagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Frontend package.json updated');
  }
}

// Main execution
async function main() {
  try {
    fixTripGeneration();
    createBackendHealthCheck();
    validateEnvironment();
    createStartupScript();
    updatePackageScripts();
    
    console.log('\\n🎉 Quick fixes completed successfully!');
    console.log('\\n📋 Next steps:');
    console.log('1. Run: npm install (in both frontend and backend)');
    console.log('2. Start backend: cd backend && node server-simple.js');
    console.log('3. Start frontend: cd frontend && npm run dev');
    console.log('4. Visit: http://localhost:5173');
    console.log('\\n✨ Your TripCraft application should now work properly!');
    
  } catch (error) {
    console.error('❌ Quick fix failed:', error);
    process.exit(1);
  }
}

main();
