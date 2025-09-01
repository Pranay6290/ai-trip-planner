# 🚀 Deployment Guide - AI Trip Planner

> **Made with ❤️ by Pranay Gupta**

This guide will help you deploy your AI Trip Planner to production environments.

## 📋 Pre-Deployment Checklist

### ✅ Environment Variables Setup
Ensure all required environment variables are configured:

#### Frontend (.env)
```env
VITE_GOOGLE_GEMINI_AI_API_KEY=your_gemini_api_key
VITE_GOOGLE_PLACES_API_KEY=your_places_api_key
VITE_GOOGLE_AUTH_CLIENT_ID=your_google_oauth_client_id
```

#### Backend (.env)
```env
PORT=5000
NODE_ENV=production
GOOGLE_GEMINI_AI_API_KEY=your_gemini_api_key
GOOGLE_PLACES_API_KEY=your_places_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FRONTEND_URL=https://your-frontend-domain.com
```

### ✅ Firebase Configuration
1. **Authentication Setup**
   - Enable Google OAuth in Firebase Console
   - Add authorized domains for production
   - Configure OAuth consent screen

2. **Firestore Database**
   - Set up security rules
   - Create indexes if needed
   - Configure backup policies

3. **Service Account Key**
   - Generate service account key for backend
   - Add to environment variables securely

## 🌐 Frontend Deployment (Vercel)

### Option 1: GitHub Integration (Recommended)
1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure build settings:
     - Framework Preset: `Vite`
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. **Environment Variables**
   - Add all `VITE_*` environment variables in Vercel dashboard
   - Go to Project Settings → Environment Variables

4. **Domain Configuration**
   - Add custom domain if desired
   - Configure DNS settings

### Option 2: Manual Deployment
```bash
# Build the project
cd frontend
npm run build

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🖥️ Backend Deployment (Railway)

### Option 1: GitHub Integration (Recommended)
1. **Prepare for Deployment**
   ```bash
   # Ensure package.json has correct start script
   cd backend
   # Verify package.json scripts section includes:
   # "start": "node server.js"
   ```

2. **Deploy on Railway**
   - Visit [railway.app](https://railway.app)
   - Create new project from GitHub repo
   - Select backend folder as root
   - Configure environment variables

3. **Environment Variables**
   - Add all backend environment variables
   - Ensure `NODE_ENV=production`
   - Set `PORT` (Railway will provide this automatically)

### Option 2: Heroku Deployment
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set GOOGLE_GEMINI_AI_API_KEY=your_key
# ... add all other env vars

# Deploy
git subtree push --prefix backend heroku main
```

## 🔧 Production Optimizations

### Frontend Optimizations
1. **Build Optimization**
   ```bash
   # Analyze bundle size
   npm run build:analyze
   
   # Update dependencies
   npm run update-deps
   ```

2. **Performance Monitoring**
   - Add Google Analytics
   - Implement error tracking (Sentry)
   - Monitor Core Web Vitals

### Backend Optimizations
1. **Security Headers**
   - Already implemented with Helmet.js
   - Configure CORS for production domains

2. **Rate Limiting**
   - Already implemented
   - Adjust limits for production traffic

3. **Monitoring**
   - Add logging service (Winston + LogDNA)
   - Implement health checks
   - Monitor API performance

## 🔒 Security Considerations

### API Keys Security
- Never commit API keys to version control
- Use environment variables only
- Rotate keys regularly
- Monitor API usage

### Firebase Security
- Configure Firestore security rules
- Enable audit logging
- Set up monitoring alerts

### HTTPS & SSL
- Ensure all connections use HTTPS
- Configure SSL certificates
- Enable HSTS headers

## 📊 Monitoring & Analytics

### Frontend Monitoring
```javascript
// Add to main.jsx for production
if (process.env.NODE_ENV === 'production') {
  // Google Analytics
  // Error tracking
  // Performance monitoring
}
```

### Backend Monitoring
- Health check endpoint: `/health`
- API metrics and logging
- Error tracking and alerts

## 🚀 CI/CD Pipeline (Optional)

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🧪 Testing Before Deployment

### Frontend Testing
```bash
cd frontend
npm run build
npm run preview
# Test all functionality
```

### Backend Testing
```bash
cd backend
npm start
# Test all API endpoints
# Verify database connections
```

## 📱 Post-Deployment Steps

1. **Verify Functionality**
   - Test user registration/login
   - Test trip creation
   - Test all API endpoints

2. **Performance Testing**
   - Check page load speeds
   - Test mobile responsiveness
   - Verify API response times

3. **SEO Optimization**
   - Submit sitemap to Google
   - Verify meta tags
   - Test social media sharing

## 🔄 Maintenance

### Regular Updates
- Update dependencies monthly
- Monitor security vulnerabilities
- Review and rotate API keys

### Backup Strategy
- Automated Firestore backups
- Code repository backups
- Environment variables backup

## 📞 Support

For deployment issues or questions:
- Check the logs in your deployment platform
- Verify all environment variables
- Test API endpoints individually
- Contact: **Pranay Gupta**

---

<div align="center">
  <p>Made with ❤️ by <strong>Pranay Gupta</strong></p>
  <p>© 2024 AI Trip Planner. All rights reserved.</p>
</div>
