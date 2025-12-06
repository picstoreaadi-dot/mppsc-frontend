<template>
  <div style="min-height: 100vh; background: #0f172a; padding-bottom: 6rem;">
    <!-- Language Toggle -->
    <LanguageToggle />

    <!-- Loading State -->
    <div v-if="isLoading" style="display: flex; align-items: center; justify-content: center; min-height: 100vh;">
      <div style="text-align: center;">
        <div style="width: 4rem; height: 4rem; border: 4px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 1rem; color: #94a3b8;">Loading...</p>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else style="max-width: 80rem; margin: 0 auto; padding: 1.5rem;">
      <!-- Streak Header - Top Center -->
      <div style="display: flex; justify-content: center; margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 9999px; background: linear-gradient(to right, #f59e0b, #ef4444); color: white; font-weight: 700; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>
          <span style="font-size: 1.125rem;">Day {{ currentStreak }}</span>
        </div>
      </div>

      <!-- Welcome Message -->
      <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="font-size: 2rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">
          {{ greeting }}, {{ userName }}!
        </h1>
        <p style="color: #94a3b8; font-size: 1.125rem;">
          Your personalized exam prep dashboard
        </p>
      </div>

      <!-- Daily Vitamin Card -->
      <div
        v-if="weakestTopic"
        @click="startWeakAreaPractice"
        style="background: linear-gradient(to bottom right, #3b82f6, #1d4ed8); color: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3); margin-bottom: 2rem; cursor: pointer; transition: transform 0.3s;"
        @mouseover="$event.currentTarget.style.transform = 'scale(1.02)'"
        @mouseout="$event.currentTarget.style.transform = 'scale(1)'"
      >
        <div style="display: flex; align-items: start; gap: 1.5rem;">
          <div style="flex-shrink: 0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <div style="flex: 1;">
            <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem;">Daily Vitamin 💊</h2>
            <p style="font-size: 1.25rem; margin-bottom: 0.5rem;">
              Your weakness is <span style="font-weight: 700;">{{ weakestTopic.topic_name }}</span>
            </p>
            <p style="opacity: 0.9;">Solve {{ recommendedQuestions }} questions to improve</p>
            <div style="margin-top: 1rem;">
              <span style="font-size: 0.875rem; opacity: 0.8;">Current accuracy: {{ weakestTopic.accuracy_percentage?.toFixed(1) || 0 }}%</span>
              <span style="margin-left: 1rem; font-size: 0.875rem; opacity: 0.8;">{{ weakestTopic.total_questions_attempted || 0 }} attempted</span>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        <QuickActionCard
          v-for="action in quickActions"
          :key="action.title"
          :title="action.title"
          :subtitle="action.subtitle"
          :icon="action.icon"
          @click="handleQuickAction(action.type)"
        />
      </div>

      <!-- Performance Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        <StatCard
          v-for="stat in stats"
          :key="stat.label"
          :value="stat.value"
          :label="stat.label"
          :icon="stat.icon"
        />
      </div>

      <!-- Topic Performance -->
      <div style="background: #1e293b; border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 1.5rem;">
          Topic Performance
        </h2>
        <div v-if="weeklyTopics.length > 0" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
          <TopicCard
            v-for="topic in weeklyTopics.slice(0, 6)"
            :key="topic.topic"
            :topic="{
              id: topic.topic,
              name: topic.topic_name || topic.topic_name_en || topic.topic,
              accuracy: topic.accuracy_percentage || 0,
              total: topic.total_questions_attempted || 0,
              strength: (topic.accuracy_percentage || 0) < 60 ? 'weak' : (topic.accuracy_percentage || 0) < 75 ? 'average' : 'strong'
            }"
            @click="goToTopicPractice(topic.topic)"
          />
        </div>
        <div v-else style="text-align: center; padding: 3rem 0;">
          <p style="color: #94a3b8; font-size: 1.125rem;">Complete some tests to see your topic performance</p>
        </div>
      </div>

      <!-- Recent Tests -->
      <div style="background: #1e293b; border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: white;">Recent Tests</h2>
          <button
            @click="router.push('/analytics')"
            style="color: #3b82f6; font-weight: 500; background: none; border: none; cursor: pointer; font-size: 0.875rem;"
          >
            View All →
          </button>
        </div>
        <div v-if="recentTests.length === 0" style="text-align: center; padding: 3rem 0;">
          <p style="color: #94a3b8; font-size: 1.125rem;">No tests taken yet. Start practicing!</p>
        </div>
        <div v-else style="display: flex; flex-direction: column; gap: 1rem;">
          <TestHistoryItem
            v-for="test in recentTests"
            :key="test.id"
            :test="{
              id: test.id,
              name: formatTestType(test.test_type),
              date: new Date(test.started_at || test.created_at).toLocaleDateString(),
              questions: test.total_questions || 0,
              answered: test.attempted_questions || 0,
              score: test.score || 0,
              status: test.status || 'in_progress'
            }"
            @click="viewTestResult(test.id)"
          />
        </div>
      </div>
    </div>

    <!-- Practice Setup Modal -->
    <PracticeSetupModal
      :is-open="showPracticeModal"
      @close="showPracticeModal = false"
      @start="handlePracticeStart"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import QuickActionCard from '@/components/dashboard/QuickActionCard.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import TopicCard from '@/components/dashboard/TopicCard.vue'
import TestHistoryItem from '@/components/dashboard/TestHistoryItem.vue'
import PracticeSetupModal from '@/components/practice/PracticeSetupModal.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const showDailyVitamin = ref(true)
const showPracticeModal = ref(false)

// Import API
import api from '@/services/api'

const userName = computed(() => authStore.user?.full_name?.split(' ')[0] || 'Student')

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
})

const quickActions = ref([
  {
    type: 'full_test',
    title: 'Full Length Test',
    subtitle: '100 questions • 120 min',
    icon: 'FileText',
  },
  {
    type: 'quick_practice',
    title: 'Quick Practice',
    subtitle: '20 questions • 30 min',
    icon: 'Zap',
  },
  {
    type: 'ai_generator',
    title: 'AI Question Generator',
    subtitle: 'Create custom questions',
    icon: 'Sparkles',
  },
  {
    type: 'bookmarks',
    title: 'Bookmarks',
    subtitle: 'Saved questions',
    icon: 'Bookmark',
  },
  {
    type: 'question_browser',
    title: 'Browse Questions',
    subtitle: 'Search & explore questions',
    icon: 'BookOpen',
  },
  {
    type: 'test_history',
    title: 'Test History',
    subtitle: 'View past performance',
    icon: 'History',
  },
  {
    type: 'weak_areas',
    title: 'Weak Areas',
    subtitle: 'Focus on improvement',
    icon: 'Brain',
  },
])

const stats = ref([
  { value: '0', label: 'Total Tests', icon: 'FileText' },
  { value: '0.0%', label: 'Accuracy', icon: 'Target' },
  { value: '+0.0%', label: 'Improvement', icon: 'TrendingUp' },
  { value: '0', label: 'Day Streak', icon: 'Clock' },
])

const dashboardData = ref<any>(null)
const weeklyTopics = ref<any[]>([])
const recentTests = ref<any[]>([])

onMounted(async () => {
  isLoading.value = true
  try {
    // Fetch dashboard data
    dashboardData.value = await api.getDashboard()

    // Update stats with real data
    if (dashboardData.value?.summary) {
      const perf = dashboardData.value.summary
      stats.value = [
        { value: String(perf.total_tests_taken || 0), label: 'Total Tests', icon: 'FileText' },
        { value: `${(perf.overall_accuracy || 0).toFixed(1)}%`, label: 'Accuracy', icon: 'Target' },
        { value: `+0.0%`, label: 'Improvement', icon: 'TrendingUp' },
        { value: String(perf.current_streak_days || 0), label: 'Day Streak', icon: 'Clock' },
      ]
    }

    // Use weak topics from dashboard data if available, otherwise fetch
    if (dashboardData.value?.weak_topics) {
      weeklyTopics.value = dashboardData.value.weak_topics
    } else {
      weeklyTopics.value = await api.getWeakTopics()
    }

    // Use recent_tests from dashboard data if available
    if (dashboardData.value?.recent_tests) {
      recentTests.value = dashboardData.value.recent_tests.slice(0, 5)
    } else {
      // Fallback to test history API
      const historyResponse: any = await api.getTestHistory(5)
      recentTests.value = historyResponse.items || historyResponse || []
    }
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  } finally {
    isLoading.value = false
  }
})

async function startWeakAreaPractice() {
  try {
    const session = await api.startWeakAreaTest()
    const sessionId = (session as any).session_id || (session as any).id
    router.push(`/practice/${sessionId}`)
  } catch (error) {
    console.error('Failed to start weak area practice:', error)
    alert('Failed to start weak area practice. Please try again.')
  }
}

async function handleQuickAction(type: string) {
  try {
    // Direct navigation for new features
    if (type === 'ai_generator') {
      router.push('/ai-generator')
      return
    }
    if (type === 'bookmarks') {
      router.push('/bookmarks')
      return
    }
    if (type === 'question_browser') {
      router.push('/questions')
      return
    }
    if (type === 'test_history') {
      router.push('/history')
      return
    }

    if (type === 'quick_practice') {
      // Show modal for topic selection
      showPracticeModal.value = true
      return
    }

    let session
    if (type === 'full_test') {
      session = await api.startFullLengthTest()
    } else if (type === 'weak_areas') {
      session = await api.startWeakAreaTest()
    }

    if (session) {
      const sessionId = (session as any).session_id || (session as any).id
      router.push(`/practice/${sessionId}`)
    }
  } catch (error) {
    console.error('Failed to start test:', error)
    alert('Failed to start test. Please try again.')
  }
}

async function handlePracticeStart({ topic, numQuestions }: { topic: any; numQuestions: number }) {
  try {
    showPracticeModal.value = false
    isLoading.value = true

    console.log('Starting practice with:', { topic, numQuestions })
    const session = await api.startQuickPractice(topic, numQuestions)
    console.log('Session created:', session)

    // Backend returns session_id, not id
    const sessionId = (session as any).session_id || (session as any).id

    if (!sessionId) {
      throw new Error('Invalid session response - no session ID')
    }

    console.log('Navigating to /practice/' + sessionId)
    router.push(`/practice/${sessionId}`)
  } catch (error) {
    console.error('Failed to start practice:', error)
    alert(`Failed to start practice: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    isLoading.value = false
  }
}

async function goToTopicPractice(topicId: string) {
  try {
    const session = await api.startTopicTest(topicId as any)
    const sessionId = (session as any).session_id || (session as any).id
    router.push(`/practice/${sessionId}`)
  } catch (error) {
    console.error('Failed to start topic practice:', error)
    alert('Failed to start topic practice. Please try again.')
  }
}

function viewTestResult(testId: string) {
  router.push(`/exam/${testId}/result`)
}

const currentStreak = computed(() => {
  return dashboardData.value?.summary?.current_streak_days || 0
})

const weakestTopic = computed(() => {
  if (!dashboardData.value?.weak_topics || dashboardData.value.weak_topics.length === 0) {
    return null
  }
  return dashboardData.value.weak_topics[0]
})

const recommendedQuestions = computed(() => {
  if (!weakestTopic.value) return 20
  const accuracy = weakestTopic.value.accuracy_percentage || 0
  if (accuracy < 30) return 20
  if (accuracy < 50) return 15
  return 10
})

function formatTestType(testType: string): string {
  const types: Record<string, string> = {
    'full_length_test': 'Full Length Test',
    'topic_test': 'Topic Test',
    'quick_practice': 'Quick Practice',
    'weak_area_test': 'Weak Area Test',
    'ai_generated': 'AI Generated Test'
  }
  return types[testType] || testType
}
</script>

<style>
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
