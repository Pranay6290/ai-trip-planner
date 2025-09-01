# 🌟 AI Trip Planner - Next Level Travel Planning

> **Made with ❤️ by Pranay Gupta**

A revolutionary full-stack AI-powered trip planning application that creates personalized travel itineraries using advanced AI technology. Built with modern web technologies and featuring a stunning, responsive design.

## ✨ Features

### 🤖 AI-Powered Planning
- **Google Gemini AI Integration** - Advanced AI generates personalized trip recommendations
- **Smart Itinerary Creation** - Day-by-day detailed planning with optimal time management
- **Intelligent Recommendations** - Hotels, attractions, and activities tailored to your preferences

### 🔐 Modern Authentication
- **Firebase Authentication** - Secure user management
- **Google OAuth Integration** - Quick sign-in with Google
- **Email/Password Authentication** - Traditional login options
- **Protected Routes** - Secure access to user-specific content

### 🎨 Beautiful UI/UX
- **Modern Gradient Design** - Stunning visual aesthetics with smooth gradients
- **Framer Motion Animations** - Smooth, professional animations throughout
- **Responsive Design** - Perfect experience on all devices
- **Glass Morphism Effects** - Modern backdrop blur and transparency effects

### 🏗️ Full-Stack Architecture
- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express + Firebase Admin
- **Database**: Firestore (NoSQL)
- **APIs**: Google Gemini AI, Google Places API
- **Deployment**: Vercel (Frontend) + Railway/Heroku (Backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project
- Google Cloud Platform account (for APIs)

### 1. Clone the Repository
```bash
git clone https://github.com/pranaygupta/ai-trip-planner.git
cd ai-trip-planner
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
GOOGLE_GEMINI_AI_API_KEY=your_gemini_api_key
GOOGLE_PLACES_API_KEY=your_places_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FRONTEND_URL=http://localhost:5173
```

Start backend server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_GOOGLE_GEMINI_AI_API_KEY=your_gemini_api_key
VITE_GOOGLE_PLACES_API_KEY=your_places_api_key
VITE_GOOGLE_AUTH_CLIENT_ID=your_google_oauth_client_id
```

Start frontend development server:
```bash
npm run dev
```

## 🔧 API Keys Setup

### Google Gemini AI API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to your environment variables

### Google Places API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Places API (New) and Places API
3. Create credentials (API Key)
4. Add to your environment variables

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication (Google & Email/Password)
3. Create Firestore database
4. Get your config keys
5. For backend: Generate service account key

## 📱 Application Flow

### 1. **Landing Page**
- Modern hero section with gradient backgrounds
- Feature showcase with animated cards
- Call-to-action buttons for sign up/login

### 2. **Authentication**
- Beautiful login/signup forms with animations
- Google OAuth integration
- Form validation and error handling

### 3. **Trip Creation**
- Step-by-step wizard interface
- Destination selection with Google Places autocomplete
- Budget and traveler type selection
- AI-powered trip generation

### 4. **Trip Management**
- Personal trip dashboard
- Trip cards with modern design
- Trip statistics and analytics

### 5. **Trip Viewing**
- Detailed trip itinerary display
- Hotel recommendations with booking links
- Day-by-day activity planning
- Share functionality

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **React Hot Toast** - Beautiful notifications
- **Heroicons** - Beautiful SVG icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Firebase Admin** - Server-side Firebase SDK
- **Google Generative AI** - Gemini AI integration
- **Axios** - HTTP client
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

### Database & Services
- **Firestore** - NoSQL document database
- **Firebase Auth** - Authentication service
- **Google Gemini AI** - AI trip generation
- **Google Places API** - Location data and photos

## 🎨 Design Features

### Modern UI Elements
- **Gradient Backgrounds** - Beautiful color transitions
- **Glass Morphism** - Backdrop blur effects
- **Smooth Animations** - Framer Motion powered
- **Responsive Grid Layouts** - Perfect on all screen sizes
- **Interactive Hover Effects** - Enhanced user experience

### Color Scheme
- **Primary**: Blue to Purple gradients
- **Secondary**: Soft pastels and whites
- **Accent**: Vibrant blues and purples
- **Text**: Modern gray scales

## 📊 Project Structure

```
ai-trip-planner/
├── backend/
│   ├── config/
│   │   └── firebase.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── tripRoutes.js
│   │   └── placesRoutes.js
│   ├── services/
│   │   ├── geminiService.js
│   │   └── placesService.js
│   ├── middleware/
│   │   └── auth.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── create-trip/
│   │   ├── my-trips/
│   │   ├── view-trip/
│   │   └── service/
│   └── public/
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Create new project on Railway or Heroku
2. Connect your GitHub repository
3. Add environment variables
4. Deploy backend service

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Pranay Gupta**
- Portfolio: [pranaygupta.dev](https://pranaygupta.dev)
- LinkedIn: [linkedin.com/in/pranaygupta](https://linkedin.com/in/pranaygupta)
- GitHub: [github.com/pranaygupta](https://github.com/pranaygupta)

## 🙏 Acknowledgments

- Google for Gemini AI and Places API
- Firebase for backend services
- Vercel for hosting
- The open-source community for amazing tools and libraries

---

<div align="center">
  <p>Made with ❤️ by <strong>Pranay Gupta</strong></p>
  <p>© 2024 AI Trip Planner. All rights reserved.</p>
</div>

