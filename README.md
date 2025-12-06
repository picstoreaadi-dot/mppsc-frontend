# MPPSC Mock Test - Frontend

A psychology-driven, modern frontend for the MPPSC (Madhya Pradesh Public Service Commission) exam preparation platform. Built with Vue 3, TypeScript, Tailwind CSS, and a focus on "Cognitive Ease" UX principles.

## 🎨 Design Philosophy: "Cognitive Ease"

This UI/UX is designed following psychological principles to maximize learning effectiveness and minimize cognitive load.

### Key Principles

1. **Visual Noise Reduction**: Paper-white (#FAFAFA) backgrounds reduce eye strain
2. **Color as Logic**: Colors convey meaning, not decoration
   - Blue: Actions • Green: Correct • Red: Incorrect • Orange: Attention • Grey: Passive
3. **Bilingual by Default**: Floating language toggle for instant Hindi/English switching
4. **Thumb Zone Design**: Mobile actions in bottom 30% of screen
5. **Flow State**: Card-stack interface with swipe gestures

## 🚀 Features

### Dashboard - "Command Center"
- Streak tracking with fire icon
- Daily personalized weak area recommendation  
- Adaptive actions based on time of day
- Resume abandoned tests

### Practice Interface - "Flow State"
- Card-stack UI with swipe navigation
- Haptic feedback and animations
- AI explanations ("Explain like I'm 5")
- Elimination mode (long-press)

### Mock Exam - "Simulation"
- Full-screen minimalist mode
- Color-changing timer (Green → Yellow → Red)
- Question palette drawer
- Elimination mode

### Analytics - "The Mirror"
- Radar chart for topic comparison
- Time analysis per subject
- Percentile rankings

## 🛠️ Tech Stack

- Vue 3 + TypeScript + Vite
- Tailwind CSS
- Pinia (State Management)
- Axios (HTTP Client)
- Chart.js + Lucide Icons

## 🚦 Getting Started

\`\`\`bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit VITE_API_URL in .env

# Run dev server
npm run dev

# Build for production
npm run build
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── components/      # Reusable components
├── views/           # Page components
├── stores/          # Pinia stores (auth, test, analytics, settings)
├── services/        # API client
├── router/          # Vue Router
├── types/           # TypeScript types
└── style.css        # Global styles + Tailwind
\`\`\`

## 🎯 Key Features

- **Bilingual Support**: Complete Hindi/English switching
- **Dark Mode**: High-contrast colors (#E0E0E0 text)
- **Mobile Optimized**: Thumb zone design, swipe gestures
- **Cognitive Ease**: Paper-white backgrounds, meaningful colors
- **Micro-interactions**: Pulse/shake animations, haptic feedback

## 📱 Mobile Features

- Thumb-zone optimized (bottom 30%)
- Swipe gestures for navigation
- Long-press for elimination
- Safe area support for iOS notch

## 🌐 Backend Integration

Backend API should run at: `http://localhost:8000` (configurable)

See `src/services/api.ts` for all API endpoints.

---

**Built with ❤️ for MPPSC aspirants**
