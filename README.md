# Pathshala Coach

An AI-powered adaptive learning platform designed for government exam preparation in India. Pathshala Coach provides personalized learning experiences with multilingual support, adaptive quizzes, AI-powered study assistance, and comprehensive progress tracking.

## 🚀 Features

### Core Learning Features
- **Adaptive Learning System**: 40/40/20 question distribution (beginner/intermediate/advanced)
- **Multilingual Support**: English, Hindi, Tamil, Bengali, and Kannada
- **Diagnostic Testing**: Personalized assessment to determine learning level
- **Concept Reels**: Short video explanations for quick concept learning
- **Spaced Repetition Flashcards**: SM-2 algorithm for optimal retention
- **Learning Path**: Dynamic learning paths based on user progress

### AI-Powered Features
- **AI Sarthi**: Context-aware chatbot powered by Google Gemini for study assistance
- **AI Interview Coach**: Practice interviews with real-time feedback on speech, eye contact, and fluency
- **Error Pattern Recognition**: AI analysis of common mistakes and weak areas
- **Personalized Study Plans**: AI-generated study plans based on diagnostic results

### Progress & Analytics
- **Real-time Progress Tracking**: Dashboard with XP, streaks, accuracy, and rankings
- **Subject-wise Progress**: Detailed analytics per subject and topic
- **Weekly Activity Charts**: Visual representation of study activity
- **Performance Analytics**: Track improvement over time

### User Experience
- **Offline Mode**: Download content for offline access
- **PWA Support**: Install as a Progressive Web App
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Data Saver Mode**: Optimized for low-data environments

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **AI Integration**: Google Gemini API
- **State Management**: React Query, React Context
- **Routing**: React Router DOM v6
- **Internationalization**: react-i18next
- **Deployment**: Netlify

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled
- Google Gemini API key

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pathshala-ai-coach-main
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication:
   - Email/Password provider
   - Google Sign-in
3. Create Firestore Database (start in test mode for development)
4. Enable Storage (optional, for future features)
5. Copy your Firebase configuration to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📜 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📁 Project Structure

```
pathshala-ai-coach-main/
├── public/
│   ├── videos/          # Concept video files
│   ├── manifest.json    # PWA manifest
│   └── sw.js           # Service worker
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/         # shadcn/ui components
│   │   └── ...
│   ├── config/         # Firebase & Gemini configuration
│   ├── hooks/          # Custom React hooks
│   ├── i18n/           # Internationalization
│   │   └── locales/    # Translation files
│   ├── pages/          # Page components
│   ├── services/       # API services & business logic
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── data/               # Question bank JSON files
├── netlify.toml        # Netlify deployment configuration
└── package.json
```

## 🎯 Key Features Implementation

### Adaptive Quiz System
- Questions distributed as 40% beginner, 40% intermediate, 20% advanced
- Dynamic difficulty adjustment based on performance
- Real-time feedback and explanations

### Spaced Repetition (SM-2 Algorithm)
- Optimal review intervals for flashcard retention
- Automatic scheduling based on performance
- Mastery tracking per topic

### AI Integration
- **AI Sarthi**: Context-aware responses with user progress integration
- **Interview Coach**: Real-time speech analysis and feedback
- **Study Plan Generation**: Personalized plans based on weak areas

### Offline Support
- Service Worker for offline functionality
- IndexedDB for local data storage
- Downloadable content for offline access

## 🌐 Deployment

### Netlify Deployment

1. Connect your repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in Netlify dashboard
4. Deploy

The `netlify.toml` file is pre-configured with:
- SPA routing redirects
- Security headers
- Cache optimization
- Service Worker support

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security

- Firebase Authentication for secure user management
- Environment variables for sensitive API keys
- Security headers configured in Netlify
- HTTPS enforced in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 📞 Support

For support, please contact the development team or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Advanced analytics dashboard
- [ ] Social features (leaderboards, study groups)
- [ ] Mobile app (React Native)
- [ ] Additional exam types (UPSC, Railway)
- [ ] Live classes integration
- [ ] Payment integration for premium features

---

**Built with ❤️ for Indian students preparing for government exams**
