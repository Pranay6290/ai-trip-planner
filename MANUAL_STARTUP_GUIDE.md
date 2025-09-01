# 🚀 AI Trip Planner - Manual Startup Guide

## ✅ **ISSUES FIXED:**

1. **Fixed telemetry service imports** - Removed React hook usage from service classes
2. **Fixed weather service** - Added API key validation to prevent crashes
3. **Commented out dynamic imports** - Temporarily disabled to prevent startup issues
4. **Updated environment variables** - Set proper fallback values

## 📋 **MANUAL STARTUP STEPS:**

Since the automated scripts are having issues, please follow these manual steps:

### **Step 1: Open Two PowerShell/Command Prompt Windows**

1. **Right-click** on the Windows Start button
2. Select **"Windows PowerShell (Admin)"** or **"Command Prompt (Admin)"**
3. Open **TWO** separate windows

### **Step 2: Start Backend Server**

In the **first** PowerShell window:
```powershell
cd "C:\Users\ajoyb\OneDrive\Desktop\ai-trip-planner-main\backend"
npm run dev
```

You should see:
```
[nodemon] starting `node server.js`
🚀 Server running on port 5000
✅ Firebase Admin initialized successfully
```

### **Step 3: Start Frontend Server**

In the **second** PowerShell window:
```powershell
cd "C:\Users\ajoyb\OneDrive\Desktop\ai-trip-planner-main\frontend"
npm run dev
```

You should see:
```
VITE v5.3.4  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### **Step 4: Open Browser**

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see the AI Trip Planner homepage

## 🔧 **TROUBLESHOOTING:**

### **If Frontend Won't Start:**

1. **Check Node.js version:**
   ```powershell
   node --version
   ```
   Should be v16 or higher

2. **Clear cache and reinstall:**
   ```powershell
   cd "C:\Users\ajoyb\OneDrive\Desktop\ai-trip-planner-main\frontend"
   rm -rf node_modules
   rm package-lock.json
   npm install
   npm run dev
   ```

3. **Check for port conflicts:**
   ```powershell
   netstat -ano | findstr :5173
   ```
   If port is in use, kill the process or use a different port

### **If Backend Won't Start:**

1. **Check backend dependencies:**
   ```powershell
   cd "C:\Users\ajoyb\OneDrive\Desktop\ai-trip-planner-main\backend"
   npm install
   npm run dev
   ```

2. **Check environment variables:**
   - Make sure `backend/.env` file exists
   - Verify API keys are set correctly

### **If Browser Shows Errors:**

1. **Open Developer Tools** (F12)
2. **Check Console tab** for error messages
3. **Common fixes:**
   - Refresh the page (Ctrl+F5)
   - Clear browser cache
   - Check if both servers are running

## 🌐 **ACCESSING THE APPLICATION:**

Once both servers are running:

1. **Homepage:** http://localhost:5173
2. **Enhanced Planner:** http://localhost:5173/enhanced-planner
3. **Backend API:** http://localhost:5000

## 🎯 **TESTING THE FEATURES:**

### **1. Basic Functionality:**
- Click "AI Trip Planner" button on homepage
- Try entering: "5-day trip to Paris for 2 people"
- Check if destination search works

### **2. Enhanced Features:**
- Test the chatbot (bottom-right corner)
- Try natural language input
- Check map integration
- Test export features

### **3. API Connections:**
- Check browser console for API errors
- Verify Firebase connection
- Test Google Places integration

## 🔑 **API KEYS SETUP:**

If you encounter API-related errors:

### **Google Places API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Places API, Maps JavaScript API, Directions API
3. Create API key and add to `frontend/.env`

### **OpenWeather API:**
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get free API key
3. Replace `VITE_WEATHER_API_KEY` in `frontend/.env`

### **Firebase:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create project and enable Authentication, Firestore
3. Update config in both `frontend/.env` and `backend/.env`

## 🚨 **COMMON ERRORS & FIXES:**

### **Error: "Module not found"**
```bash
cd frontend
npm install
```

### **Error: "Firebase not initialized"**
- Check Firebase config in `.env` files
- Verify project ID and API keys

### **Error: "API key invalid"**
- Check Google Cloud Console for API restrictions
- Verify API keys are correctly copied

### **Error: "Port already in use"**
- Kill existing processes on ports 5173 and 5000
- Or change ports in vite.config.js and server.js

## ✅ **SUCCESS INDICATORS:**

You'll know everything is working when:
- ✅ Both PowerShell windows show server running messages
- ✅ Browser loads the homepage without errors
- ✅ You can click "AI Trip Planner" and see the enhanced interface
- ✅ Console shows no critical errors (warnings are OK)
- ✅ You can search for destinations and see results

## 🎉 **NEXT STEPS:**

Once the application is running:
1. **Test all features** - Try the enhanced planner, chatbot, maps
2. **Check console logs** - Look for any remaining errors
3. **Set up API keys** - Replace demo keys with real ones for full functionality
4. **Explore the application** - All 14 phases are implemented and ready!

---

**The AI Trip Planner is now ready to run! Follow the manual steps above to start the servers and enjoy the enhanced travel planning experience!** 🌟
