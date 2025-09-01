#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔥 Firebase Setup Script for AI Trip Planner');
console.log('============================================\n');

const projectId = 'ai-trip-planner-268b';
const hostingSite = 'ai-trip-planner-268b-dfd33';

// Check if Firebase CLI is installed
function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI is installed');
    return true;
  } catch (error) {
    console.log('❌ Firebase CLI not found');
    console.log('📦 Installing Firebase CLI...');
    try {
      execSync('npm install -g firebase-tools', { stdio: 'inherit' });
      console.log('✅ Firebase CLI installed successfully');
      return true;
    } catch (installError) {
      console.error('❌ Failed to install Firebase CLI');
      console.log('Please install manually: npm install -g firebase-tools');
      return false;
    }
  }
}

// Check if user is logged in
function checkFirebaseLogin() {
  try {
    const result = execSync('firebase projects:list', { stdio: 'pipe' });
    console.log('✅ Firebase login verified');
    return true;
  } catch (error) {
    console.log('❌ Not logged in to Firebase');
    console.log('🔐 Please run: firebase login');
    return false;
  }
}

// Set Firebase project
function setFirebaseProject() {
  try {
    execSync(`firebase use ${projectId}`, { stdio: 'inherit' });
    console.log(`✅ Firebase project set to: ${projectId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to set Firebase project: ${projectId}`);
    console.log('Please ensure the project exists and you have access to it');
    return false;
  }
}

// Initialize Firebase features
function initializeFirebase() {
  try {
    console.log('🔧 Initializing Firebase features...');
    
    // Check if firebase.json already exists
    if (fs.existsSync('firebase.json')) {
      console.log('✅ firebase.json already exists');
    } else {
      console.log('📝 Creating firebase.json...');
      // The firebase.json file was already created earlier
    }

    // Initialize Firestore rules if they don't exist
    if (!fs.existsSync('backend/firestore.rules')) {
      console.log('📝 Creating Firestore rules...');
      const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Trips can be read and written by authenticated users
    match /trips/{tripId} {
      allow read, write: if request.auth != null;
    }
    
    // Public read access for destinations data
    match /destinations/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`;
      fs.writeFileSync('backend/firestore.rules', firestoreRules);
    }

    // Initialize Firestore indexes if they don't exist
    if (!fs.existsSync('backend/firestore.indexes.json')) {
      console.log('📝 Creating Firestore indexes...');
      const firestoreIndexes = {
        "indexes": [
          {
            "collectionGroup": "trips",
            "queryScope": "COLLECTION",
            "fields": [
              { "fieldPath": "userId", "order": "ASCENDING" },
              { "fieldPath": "createdAt", "order": "DESCENDING" }
            ]
          }
        ],
        "fieldOverrides": []
      };
      fs.writeFileSync('backend/firestore.indexes.json', JSON.stringify(firestoreIndexes, null, 2));
    }

    console.log('✅ Firebase initialization complete');
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    return false;
  }
}

// Build frontend for deployment
function buildFrontend() {
  try {
    console.log('🏗️ Building frontend for deployment...');
    execSync('cd frontend && npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend build complete');
    return true;
  } catch (error) {
    console.error('❌ Frontend build failed:', error.message);
    return false;
  }
}

// Deploy to Firebase Hosting
function deployToHosting() {
  try {
    console.log('🚀 Deploying to Firebase Hosting...');
    execSync(`firebase deploy --only hosting:${hostingSite}`, { stdio: 'inherit' });
    console.log('✅ Deployment complete!');
    console.log(`🌐 Your app is live at: https://${hostingSite}.web.app`);
    return true;
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    return false;
  }
}

// Main setup function
async function main() {
  console.log('Starting Firebase setup...\n');

  // Step 1: Check Firebase CLI
  if (!checkFirebaseCLI()) {
    process.exit(1);
  }

  // Step 2: Check login
  if (!checkFirebaseLogin()) {
    console.log('\n🔐 Please run the following commands:');
    console.log('1. firebase login');
    console.log('2. node setup-firebase.js');
    process.exit(1);
  }

  // Step 3: Set project
  if (!setFirebaseProject()) {
    process.exit(1);
  }

  // Step 4: Initialize Firebase
  if (!initializeFirebase()) {
    process.exit(1);
  }

  // Step 5: Build frontend
  if (!buildFrontend()) {
    process.exit(1);
  }

  // Step 6: Deploy (optional)
  console.log('\n🚀 Ready to deploy!');
  console.log('To deploy now, run: firebase deploy --only hosting:' + hostingSite);
  console.log('Or run this script with --deploy flag');

  if (process.argv.includes('--deploy')) {
    deployToHosting();
  }

  console.log('\n🎉 Firebase setup complete!');
  console.log('\n📚 Next steps:');
  console.log('1. Update your API keys in .env files');
  console.log('2. Test the application locally');
  console.log('3. Deploy when ready: firebase deploy');
}

main().catch(console.error);
