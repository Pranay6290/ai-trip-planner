// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  createMockTripData: () => ({
    destination: 'Delhi',
    duration: 3,
    travelers: 2,
    budget: 15000,
    interests: ['culture', 'food']
  }),
  
  createMockPlaceData: () => ({
    id: 'test_place_1',
    name: 'Test Place',
    address: 'Test Address, Delhi',
    location: { lat: 28.6139, lng: 77.2090 },
    rating: 4.5,
    photos: [],
    types: ['tourist_attraction']
  })
};

// Set test timeouts
jest.setTimeout(30000);
