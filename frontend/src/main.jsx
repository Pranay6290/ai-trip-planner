import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AppModern from './AppModern.jsx'
import './index.css'
import './styles/enhanced-ui.css'
import './styles/responsiveEnhancements.css'
import ProjectOptimizer from './utils/projectOptimizer.js'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import LoadingSpinner from './components/ui/LoadingSpinner.jsx'

// Development utilities disabled to prevent auth conflicts

// Import components directly to fix loading issues
import CreateTrip from './create-trip/CreateTripUltra.jsx'
import CreateTripUltra from './create-trip/CreateTripUltra.jsx'
import NextLevelTripPlanner from './create-trip/NextLevelTripPlanner.jsx'
import ViewTrip from './view-trip/ViewTripEnhanced.jsx'
import ViewNextLevelTrip from './view-trip/ViewNextLevelTrip.jsx'
import NextLevelItineraryDisplayModern from './view-trip/NextLevelItineraryDisplayModern.jsx'
import MyTrips from './my-trips/MyTripsEnhanced.jsx'
import EnhancedTripPlanner from './components/enhanced/EnhancedTripPlanner.jsx'
import NextLevelHome from './pages/NextLevelHome.jsx'
import NextLevelPage from './pages/NextLevelPage.jsx'
import StatusDashboard from './pages/StatusDashboard.jsx'
import Login from './auth/Login.jsx'
import Signup from './auth/Signup.jsx'
import NotFound from './components/NotFound.jsx'


const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <AppModern />
      },
      {
        path: 'home',
        element: <App />
      },
      {
        path: '/create-trip',
        element: (
          <ProtectedRoute>
            <CreateTrip />
          </ProtectedRoute>
        )
      },
      {
        path: '/create-trip-ultra',
        element: (
          <ProtectedRoute>
            <CreateTripUltra />
          </ProtectedRoute>
        )
      },
      {
        path: '/plan-next-level-trip',
        element: (
          <ProtectedRoute>
            <NextLevelTripPlanner />
          </ProtectedRoute>
        )
      },
      {
        path: '/view-trip/:tripId',
        element: <ViewTrip />
      },
      {
        path: '/view-next-level-trip',
        element: (
          <ProtectedRoute>
            <ViewNextLevelTrip />
          </ProtectedRoute>
        )
      },
      {
        path: '/my-trips',
        element: (
          <ProtectedRoute>
            <MyTrips />
          </ProtectedRoute>
        )
      },
      {
        path: '/enhanced-planner',
        element: (
          <ProtectedRoute>
            <EnhancedTripPlanner />
          </ProtectedRoute>
        )
      },
      {
        path: '/next-level',
        element: <NextLevelPage />
      },
      {
        path: '/status',
        element: <StatusDashboard />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  }
])

// Initialize project optimizations
ProjectOptimizer.initializeOptimizations().then(() => {
  console.log('✅ Project optimizations loaded');
}).catch(error => {
  console.warn('⚠️ Some optimizations failed:', error);
});

// Apply emergency fixes
ProjectOptimizer.applyEmergencyFixes();

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#1f2937',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          },
        }}
      />
      <RouterProvider router={router}/>
    </AuthProvider>
  </ErrorBoundary>
)
