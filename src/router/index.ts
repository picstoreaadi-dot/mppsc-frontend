// ============================================================================
// Vue Router Configuration
// ============================================================================

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { guest: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/practice/:sessionId',
    name: 'practice',
    component: () => import('@/views/practice/PracticeView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/practice/topic/:topicId',
    name: 'practice-topic',
    component: () => import('@/views/practice/TopicPracticeView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/exam/:sessionId',
    name: 'exam',
    component: () => import('@/views/exam/ExamView.vue'),
    meta: { requiresAuth: true, fullscreen: true },
  },
  {
    path: '/exam/:sessionId/result',
    name: 'exam-result',
    component: () => import('@/views/exam/ExamResultView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('@/views/analytics/AnalyticsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/analytics/topic/:topicId',
    name: 'topic-analytics',
    component: () => import('@/views/analytics/TopicAnalyticsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/bookmarks',
    name: 'bookmarks',
    component: () => import('@/views/BookmarksView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: () => import('@/views/LeaderboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/questions',
    name: 'question-browser',
    component: () => import('@/views/QuestionBrowserView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/history',
    name: 'test-history',
    component: () => import('@/views/TestHistoryView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/ai-generator',
    name: 'ai-generator',
    component: () => import('@/views/AIQuestionGeneratorView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/progress',
    name: 'progress-chart',
    component: () => import('@/views/ProgressChartView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Initialize auth if not done
  if (!authStore.isAuthenticated && localStorage.getItem('access_token')) {
    await authStore.initialize()
  }

  // Check if route requires auth
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Redirect authenticated users away from guest pages
  if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
