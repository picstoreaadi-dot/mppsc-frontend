# MPPSC Frontend - Complete Setup Guide

## 🚀 Quick Start

```bash
cd mppsc-vue-frontend
npm install
npm run dev
```

Open http://localhost:5173

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API running at http://localhost:8000
- Modern browser (Chrome, Firefox, Safari, Edge)

## 🔧 Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This installs:
- Vue 3 + TypeScript
- Tailwind CSS
- Pinia (state management)
- Vue Router
- Axios (HTTP client)
- Chart.js (radar/line charts)
- Lucide icons
- VueUse composables

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=MPPSC Mock Test
```

### 3. Run Development Server

```bash
npm run dev
```

Server starts at: http://localhost:5173

### 4. Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## 🎯 Project Structure Overview

```
mppsc-vue-frontend/
├── src/
│   ├── views/              # Page components (routes)
│   │   ├── DashboardView.vue         # Command Center
│   │   ├── practice/
│   │   │   └── PracticeView.vue      # Flow State (card swipe)
│   │   ├── exam/
│   │   │   ├── ExamView.vue          # Simulation mode
│   │   │   └── ExamResultView.vue
│   │   ├── analytics/
│   │   │   └── AnalyticsView.vue     # The Mirror (radar chart)
│   │   ├── auth/
│   │   │   ├── LoginView.vue
│   │   │   └── RegisterView.vue
│   │   ├── LeaderboardView.vue       # Ghost comparison
│   │   ├── BookmarksView.vue
│   │   └── SettingsView.vue
│   │
│   ├── components/         # Reusable components
│   │   ├── common/
│   │   │   └── LanguageToggle.vue    # Floating bilingual toggle
│   │   ├── dashboard/
│   │   │   ├── QuickActionCard.vue
│   │   │   ├── StatCard.vue
│   │   │   ├── TopicCard.vue
│   │   │   └── TestHistoryItem.vue
│   │   └── analytics/
│   │       ├── RadarChart.vue        # Hexagon knowledge shape
│   │       └── LineChart.vue
│   │
│   ├── stores/             # Pinia stores
│   │   ├── auth.ts         # Authentication + JWT
│   │   ├── test.ts         # Test sessions + timer
│   │   ├── analytics.ts    # Performance data
│   │   └── settings.ts     # Language, dark mode, preferences
│   │
│   ├── services/
│   │   └── api.ts          # API client with auto token refresh
│   │
│   ├── router/
│   │   └── index.ts        # Vue Router config
│   │
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces
│   │
│   ├── App.vue             # Root component
│   ├── main.ts             # App entry point
│   └── style.css           # Global styles + Tailwind
│
├── public/                 # Static assets
├── tailwind.config.js      # Custom design system
├── vite.config.ts          # Vite + path aliases
├── tsconfig.json           # TypeScript config
└── package.json
```

## 🎨 Key Design Features Implemented

### 1. **Cognitive Ease** ✅
- Paper-white (#FAFAFA) backgrounds
- Color-coded status (Blue=Action, Green=Correct, Red=Incorrect, Orange=Attention)
- High-contrast dark mode (#E0E0E0 text)

### 2. **Dashboard - "Command Center"** ✅
- Streak badge with fire icon (top center)
- Daily Vitamin card showing weakest topic
- Adaptive quick actions (time-based)
- Resume chip for abandoned tests (sticky bottom)

### 3. **Practice Interface - "Flow State"** ✅
- Card-stack UI with swipe gestures
- Touch interactions (swipe left/right)
- Haptic feedback simulation
- Micro-animations (pulse green, shake red)
- "Why?" collapsible explanation
- AI integration pills (Explain like I'm 5)
- AI content in pale blue background

### 4. **Mock Exam - "Simulation"** ✅
- Full-screen minimalist mode
- Color-changing timer (Green → Yellow → Red)
- Question palette drawer (slide from right)
- Color-coded dots (Hollow, Filled, Flag)
- Elimination mode (long-press/right-click)

### 5. **Analytics - "The Mirror"** ✅
- Radar chart showing knowledge shape
- Weak/strong area breakdown
- Time analysis per topic
- Ghost comparison (percentile ranking)
- Actionable insights

### 6. **Accessibility** ✅
- Thumb zone design (bottom 30%)
- Floating language toggle
- Dark mode with high contrast
- Mobile-first responsive design
- iOS safe area support

## 🌐 API Integration

Backend endpoints expected:

```
Authentication:
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me

Tests:
POST /api/v1/tests/create
GET  /api/v1/tests/session/:id
POST /api/v1/tests/session/:id/answer
POST /api/v1/tests/session/:id/submit

Analytics:
GET /api/v1/analytics/dashboard
GET /api/v1/analytics/weak-topics
GET /api/v1/analytics/leaderboard

...and more (see src/services/api.ts)
```

## 🎯 Usage Flow

1. **User logs in** → JWT token stored
2. **Dashboard loads** → Shows streak, weak areas, recent tests
3. **User starts practice** → Card-swipe interface with haptic feedback
4. **Or takes mock exam** → Full-screen with timer and palette
5. **Completes test** → Detailed results with topic breakdown
6. **Views analytics** → Radar chart, time analysis, peer ranking

## 🛠️ Development Tips

### Hot Module Replacement
Changes to Vue files reflect instantly without page reload.

### TypeScript
All components use `<script setup lang="ts">` syntax.
Type checking: `npm run build` (includes tsc)

### Tailwind CSS
- Custom colors defined in `tailwind.config.js`
- Component classes in `style.css`
- Use `dark:` prefix for dark mode styles

### State Management
```typescript
// In any component:
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

// Access state:
console.log(authStore.user)

// Call actions:
await authStore.login({ email, password })
```

### API Calls
```typescript
import { api } from '@/services/api'

// API client handles auth tokens automatically
const dashboard = await api.getDashboard()
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173
npm run dev
```

### API Connection Issues
- Ensure backend is running on port 8000
- Check `.env` has correct `VITE_API_URL`
- Check browser console for CORS errors

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Regenerate types
npm run build
```

## 📦 Production Deployment

### Build
```bash
npm run build
# Output: dist/ folder
```

### Docker
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Vercel/Netlify
Just connect your Git repo - builds automatically.

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: { ... },  // Change blue
  success: { ... },  // Change green
  ...
}
```

### Add New Routes
1. Create view in `src/views/`
2. Add route in `src/router/index.ts`
3. Add navigation link in Dashboard

### Modify API URL
Change in `.env`:
```
VITE_API_URL=https://your-api.com
```

## ✅ Checklist: What's Implemented

- [x] Login/Register with JWT
- [x] Dashboard with streak & daily vitamin
- [x] Practice mode with card swipe
- [x] Mock exam with full-screen + timer
- [x] Question palette drawer
- [x] Elimination mode
- [x] Analytics with radar chart
- [x] Leaderboard with ghost comparison
- [x] Bookmarks
- [x] Settings (dark mode, language, sounds)
- [x] Floating language toggle
- [x] Haptic feedback
- [x] Micro-animations
- [x] Responsive mobile design
- [x] Thumb zone optimization
- [x] AI integration UI (pills)
- [x] Time-based adaptive actions

## 📚 Next Steps

To complete remaining features:

1. **Connect real API endpoints** - Replace mock data
2. **Add proper i18n** - Use vue-i18n for translations
3. **Implement PWA** - Add service worker for offline
4. **Add E2E tests** - Playwright/Cypress
5. **Performance optimization** - Lazy loading, code splitting
6. **Analytics tracking** - Google Analytics/Mixpanel
7. **Error monitoring** - Sentry integration

## 🤝 Support

Issues? Check:
1. Backend is running
2. `.env` is configured
3. Node version is 18+
4. Browser console for errors

---

**Ready to run!** 🚀

```bash
npm run dev
```
