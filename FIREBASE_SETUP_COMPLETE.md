# 🔥 Firebase Setup Guide - AI Trip Planner

## ✅ Configuration Updated

Your Firebase configuration has been updated with the new project settings:

### Project Details:
- **Project ID**: `ai-trip-planner-268b`
- **Hosting Site**: `ai-trip-planner-268b-dfd33`
- **Auth Domain**: `ai-trip-planner-268b.firebaseapp.com`
- **Storage Bucket**: `ai-trip-planner-268b.firebasestorage.app`

## 🚀 Quick Setup Steps

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Set Firebase Project
```bash
firebase use ai-trip-planner-268b
```

### 4. Initialize Firebase Features
```bash
# Run the automated setup script
node setup-firebase.js

# Or manually initialize
firebase init
```

### 5. Enable Firebase Services

Go to [Firebase Console](https://console.firebase.google.com/project/ai-trip-planner-268b) and enable:

#### Authentication:
- Go to Authentication > Sign-in method
- Enable Email/Password
- Enable Google Sign-in
- Add your domain to authorized domains

#### Firestore Database:
- Go to Firestore Database
- Create database in production mode
- Deploy rules: `firebase deploy --only firestore:rules`

#### Hosting:
- Already configured in firebase.json
- Deploy: `firebase deploy --only hosting`

## 📁 Files Updated

### ✅ Configuration Files:
- `firebase.json` - Hosting and Firestore configuration
- `backend/firestore.rules` - Security rules
- `backend/firestore.indexes.json` - Database indexes
- `frontend/.env` - Frontend Firebase config
- `backend/.env` - Backend Firebase config

### ✅ Security Rules Applied:
- Users can only access their own data
- Trips are protected by user ownership
- Public read access for destinations
- Secure analytics collection

## 🔧 Environment Variables

### Frontend (.env):
```env
VITE_FIREBASE_API_KEY=AIzaSyB-OSNG5s1OUgxuXRUkCmbP3T0aFa75sas
VITE_FIREBASE_AUTH_DOMAIN=ai-trip-planner-268b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-trip-planner-268b
VITE_FIREBASE_STORAGE_BUCKET=ai-trip-planner-268b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=825378598374
VITE_FIREBASE_APP_ID=1:825378598374:web:534799b94148f38d3c7a27
```

### Backend (.env):
```env
FIREBASE_PROJECT_ID=ai-trip-planner-268b
FIREBASE_API_KEY=AIzaSyB-OSNG5s1OUgxuXRUkCmbP3T0aFa75sas
FIREBASE_AUTH_DOMAIN=ai-trip-planner-268b.firebaseapp.com
```

## 🚀 Deployment Commands

### Build and Deploy Frontend:
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting:ai-trip-planner-268b-dfd33
```

### Deploy Firestore Rules:
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### Full Deployment:
```bash
firebase deploy
```

## 🌐 Live URLs

After deployment, your app will be available at:
- **Live Site**: https://ai-trip-planner-268b-dfd33.web.app
- **Firebase Console**: https://console.firebase.google.com/project/ai-trip-planner-268b

## 🔍 Testing Firebase Setup

### Test Authentication:
1. Start the development server
2. Try signing up with email/password
3. Try Google sign-in
4. Check Firebase Console > Authentication > Users

### Test Firestore:
1. Create a trip in the app
2. Check Firebase Console > Firestore Database
3. Verify data is saved correctly

### Test Hosting:
1. Build the frontend: `npm run build`
2. Deploy: `firebase deploy --only hosting`
3. Visit the live URL

## 🛠️ Troubleshooting

### Common Issues:

1. **Permission Denied**:
   - Check Firestore rules
   - Ensure user is authenticated
   - Verify project ID matches

2. **Build Errors**:
   - Check environment variables
   - Run `npm install` in both frontend and backend
   - Clear cache: `npm run clean`

3. **Deployment Fails**:
   - Ensure you're logged in: `firebase login`
   - Check project selection: `firebase use ai-trip-planner-268b`
   - Verify build completed successfully

## 📞 Support

If you encounter issues:
1. Check the Firebase Console for error logs
2. Review browser console for client-side errors
3. Check server logs for backend issues
4. Ensure all API keys are correctly set

## 🎉 Next Steps

1. ✅ Firebase is configured
2. ✅ Security rules are applied
3. ✅ Environment variables are set
4. 🔄 Test the application locally
5. 🚀 Deploy to production
6. 📊 Monitor usage in Firebase Console
