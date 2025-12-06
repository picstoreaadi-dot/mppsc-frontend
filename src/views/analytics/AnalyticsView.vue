<template>
  <div style="min-height: 100vh; background: #0f172a; padding-bottom: 6rem;">
    <LanguageToggle />

    <!-- Header -->
    <div style="background: #1e293b; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3); position: sticky; top: 0; z-index: 10;">
      <div style="max-width: 80rem; margin: 0 auto; padding: 1rem 1.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button @click="$router.back()" style="padding: 0.5rem; border-radius: 0.5rem; background: rgba(59, 130, 246, 0.1); border: none; cursor: pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 style="font-size: 1.5rem; font-weight: 700; color: white;">Analytics</h1>
          <div style="width: 2.5rem;"></div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" style="max-width: 80rem; margin: 0 auto; padding: 2rem 1.5rem;">
      <LoadingState variant="skeleton" skeleton-type="dashboard" />
    </div>

    <!-- Error State -->
    <ErrorState
      v-else-if="error"
      :error-code="error.code"
      :message="error.message"
      :retryable="error.retryable"
      :on-retry="loadAnalytics"
      full-page
    />

    <!-- Content -->
    <div v-else style="max-width: 80rem; margin: 0 auto; padding: 2rem 1.5rem;">

      <!-- Performance Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        <div style="background: #1e293b; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
          <div style="font-size: 2.5rem; font-weight: 700; color: #3b82f6; margin-bottom: 0.5rem;">{{ overallAccuracy }}%</div>
          <div style="font-size: 0.875rem; color: #94a3b8;">Overall Accuracy</div>
        </div>
        <div style="background: #1e293b; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
          <div style="font-size: 2.5rem; font-weight: 700; color: #10b981; margin-bottom: 0.5rem;">{{ testsCompleted }}</div>
          <div style="font-size: 0.875rem; color: #94a3b8;">Tests Completed</div>
        </div>
        <div style="background: #1e293b; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
          <div style="font-size: 2.5rem; font-weight: 700; color: #f59e0b; margin-bottom: 0.5rem;">{{ currentStreak }}</div>
          <div style="font-size: 0.875rem; color: #94a3b8;">Day Streak</div>
        </div>
        <div style="background: #1e293b; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
          <div style="font-size: 2.5rem; font-weight: 700; color: #ef4444; margin-bottom: 0.5rem;">{{ studyTime }}</div>
          <div style="font-size: 0.875rem; color: #94a3b8;">Study Time</div>
        </div>
      </div>

      <!-- Radar Chart Placeholder -->
      <div style="background: #1e293b; border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 1rem;">Your Knowledge Shape</h2>
        <p style="font-size: 0.875rem; color: #94a3b8; margin-bottom: 2rem;">See your strengths and weaknesses at a glance</p>
        <div style="width: 100%; max-width: 32rem; height: 24rem; margin: 0 auto; background: #0f172a; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
          <RadarChart />
        </div>
      </div>

      <!-- Areas to Improve -->
      <div style="background: linear-gradient(to bottom right, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)); border: 2px solid rgba(239, 68, 68, 0.3); border-radius: 1rem; padding: 2rem; margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #fca5a5;">Areas to Improve</h2>
        </div>
        <p style="font-size: 0.875rem; color: #e0e0e0; margin-bottom: 1.5rem;">Focus on these topics to boost your score</p>

        <div v-if="weakTopics.length > 0" style="display: flex; flex-direction: column; gap: 1rem;">
          <div
            v-for="topic in weakTopics.slice(0, 3)"
            :key="topic.topic"
            @click="router.push(`/practice/topic/${topic.topic}`)"
            style="background: #1e293b; border-radius: 0.75rem; padding: 1.25rem; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;"
            @mouseover="$event.currentTarget.style.borderColor = '#ef4444'"
            @mouseout="$event.currentTarget.style.borderColor = 'transparent'"
          >
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
              <h3 style="font-weight: 600; color: white;">{{ topic.topic_name || topic.topic }}</h3>
              <span style="font-weight: 700; color: #ef4444;">{{ topic.accuracy_percentage?.toFixed(0) || 0 }}%</span>
            </div>
            <div style="width: 100%; height: 0.5rem; background: #334155; border-radius: 9999px; overflow: hidden; margin-bottom: 0.75rem;">
              <div style="height: 100%; background: #ef4444;" :style="{ width: (topic.accuracy_percentage || 0) + '%' }"></div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem;">
              <span style="color: #94a3b8;">{{ topic.total_questions_attempted || 0 }} questions attempted</span>
              <span style="color: #3b82f6; font-weight: 500;">Practice Now</span>
            </div>
          </div>
        </div>
        <div v-else style="text-align: center; padding: 2rem; color: #94a3b8;">
          Complete some tests to identify weak areas
        </div>
      </div>

      <!-- Strong Topics -->
      <div style="background: linear-gradient(to bottom right, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border: 2px solid rgba(16, 185, 129, 0.3); border-radius: 1rem; padding: 2rem; margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #6ee7b7;">Your Strengths</h2>
        </div>
        <p style="font-size: 0.875rem; color: #e0e0e0; margin-bottom: 1.5rem;">Keep up the great work in these topics!</p>

        <div v-if="strongTopics.length > 0" style="display: flex; flex-direction: column; gap: 1rem;">
          <div
            v-for="topic in strongTopics.slice(0, 3)"
            :key="topic.topic"
            style="background: #1e293b; border-radius: 0.75rem; padding: 1.25rem; border: 2px solid transparent; transition: all 0.2s;"
            @mouseover="$event.currentTarget.style.borderColor = '#10b981'"
            @mouseout="$event.currentTarget.style.borderColor = 'transparent'"
          >
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
              <h3 style="font-weight: 600; color: white;">{{ topic.topic_name || topic.topic }}</h3>
              <span style="font-weight: 700; color: #10b981;">{{ topic.accuracy_percentage?.toFixed(0) || 0 }}%</span>
            </div>
            <div style="width: 100%; height: 0.5rem; background: #334155; border-radius: 9999px; overflow: hidden; margin-bottom: 0.75rem;">
              <div style="height: 100%; background: #10b981;" :style="{ width: (topic.accuracy_percentage || 0) + '%' }"></div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem;">
              <span style="color: #94a3b8;">{{ topic.total_questions_attempted || 0 }} questions attempted</span>
              <span style="color: #10b981; font-weight: 500;">Mastered</span>
            </div>
          </div>
        </div>
        <div v-else style="text-align: center; padding: 2rem; color: #94a3b8;">
          Complete some tests to identify your strengths
        </div>
      </div>

      <!-- Time Analysis -->
      <div style="background: #1e293b; border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 1.5rem;">Time Analysis</h2>
        <div v-if="topicTimeAnalysis.length > 0" style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div v-for="topic in topicTimeAnalysis" :key="topic.name">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="font-size: 0.875rem; font-weight: 500; color: #e0e0e0;">{{ topic.name }}</span>
              <span style="font-size: 0.875rem; font-weight: 700; color: white;">{{ topic.formattedTime }}</span>
            </div>
            <div style="width: 100%; background: #334155; border-radius: 9999px; height: 0.5rem;">
              <div style="height: 100%; background: #3b82f6; border-radius: 9999px; transition: width 0.5s;" :style="{ width: topic.percentage + '%' }"></div>
            </div>
          </div>
        </div>
        <div v-else style="text-align: center; padding: 2rem; color: #94a3b8;">
          Complete some tests to see time analysis
        </div>
        <div v-if="topicTimeAnalysis.length > 0" style="margin-top: 1.5rem; padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: 0.75rem; border-left: 4px solid #3b82f6;">
          <p style="font-size: 0.875rem; color: #e0e0e0;">
            <strong>Insight:</strong> You spend more time on {{ topicTimeAnalysis[0]?.name || 'certain topics' }} questions compared to other topics.
          </p>
        </div>
      </div>

      <!-- Recommendations -->
      <div v-if="recommendations && recommendations.length > 0" style="background: linear-gradient(to bottom right, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05)); border: 2px solid rgba(168, 85, 247, 0.3); border-radius: 1rem; padding: 2rem; margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #d8b4fe;">Personalized Recommendations</h2>
        </div>
        <p style="font-size: 0.875rem; color: #e0e0e0; margin-bottom: 1.5rem;">AI-powered study suggestions based on your performance</p>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div
            v-for="(recommendation, index) in recommendations"
            :key="index"
            style="background: #1e293b; border-radius: 0.75rem; padding: 1.25rem; border-left: 4px solid #a855f7;"
          >
            <div style="display: flex; align-items: start; gap: 1rem;">
              <div style="flex-shrink: 0; width: 2rem; height: 2rem; background: rgba(168, 85, 247, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #a855f7; font-weight: 700;">
                {{ index + 1 }}
              </div>
              <p style="color: #e0e0e0; flex: 1; line-height: 1.6;">{{ recommendation }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily Activity -->
      <div style="background: #1e293b; border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 1.5rem;">Daily Activity</h2>
        <p style="font-size: 0.875rem; color: #94a3b8; margin-bottom: 2rem;">Your practice activity over the last 30 days</p>

        <div v-if="dailyActivity.length > 0" style="overflow-x: auto;">
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; min-width: 300px;">
            <div
              v-for="(day, index) in dailyActivity.slice(0, 28)"
              :key="index"
              :title="`${day.date}: ${day.questions_practiced || 0} questions, ${day.tests_completed || 0} tests`"
              style="aspect-ratio: 1; border-radius: 0.375rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s;"
              :style="{
                background: getActivityColor(day.questions_practiced || 0),
                transform: 'scale(1)'
              }"
              @mouseover="$event.currentTarget.style.transform = 'scale(1.1)'"
              @mouseout="$event.currentTarget.style.transform = 'scale(1)'"
            >
              <span style="font-size: 0.75rem; font-weight: 600; color: white; opacity: 0.8;">{{ new Date(day.date).getDate() }}</span>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 2rem;">
            <span style="font-size: 0.75rem; color: #94a3b8;">Less</span>
            <div style="display: flex; gap: 0.25rem;">
              <div style="width: 1rem; height: 1rem; border-radius: 0.25rem; background: #1e293b;"></div>
              <div style="width: 1rem; height: 1rem; border-radius: 0.25rem; background: #14532d;"></div>
              <div style="width: 1rem; height: 1rem; border-radius: 0.25rem; background: #15803d;"></div>
              <div style="width: 1rem; height: 1rem; border-radius: 0.25rem; background: #16a34a;"></div>
              <div style="width: 1rem; height: 1rem; border-radius: 0.25rem; background: #22c55e;"></div>
            </div>
            <span style="font-size: 0.75rem; color: #94a3b8;">More</span>
          </div>
        </div>
        <div v-else style="text-align: center; padding: 2rem; color: #94a3b8;">
          Complete some tests to see your activity
        </div>
      </div>

      <!-- Ghost Comparison -->
      <div style="background: linear-gradient(to bottom right, #3b82f6, #1d4ed8); color: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h2 style="font-size: 1.5rem; font-weight: 700;">Your Ranking</h2>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 1.5rem;">
          <div style="text-align: center;">
            <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">{{ userPercentile }}%</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">Percentile</div>
          </div>
          <div style="text-align: center; border-left: 1px solid rgba(255,255,255,0.2); border-right: 1px solid rgba(255,255,255,0.2);">
            <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">#{{ userRank }}</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">Rank</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">{{ totalUsers.toLocaleString() }}</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">Competitors</div>
          </div>
        </div>

        <div style="padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
          <p style="font-size: 0.875rem; opacity: 0.95; text-align: center;">
            You're performing better than <strong>{{ userPercentile }}%</strong> of all aspirants!
          </p>
        </div>

        <button @click="$router.push('/leaderboard')" style="width: 100%; margin-top: 1.5rem; padding: 0.75rem; background: rgba(255,255,255,0.2); border: none; border-radius: 0.75rem; color: white; font-weight: 600; cursor: pointer; transition: all 0.2s;">
          View Leaderboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import RadarChart from '@/components/analytics/RadarChart.vue'
import api, { APIError } from '@/services/api'

const router = useRouter()
const isLoading = ref(true)
const error = ref<APIError | null>(null)
const performanceData = ref<any>(null)
const weakTopics = ref<any[]>([])
const leaderboardData = ref<any>(null)

const strongTopics = ref<any[]>([])
const recommendations = ref<any>(null)
const dailyActivity = ref<any[]>([])

async function loadAnalytics() {
  isLoading.value = true
  error.value = null

  try {
    // Fetch ALL analytics data in parallel for maximum performance
    const [performance, weak, strong, leaderboard, recs, activity] = await Promise.all([
      api.getPerformanceSummary(),
      api.getWeakTopics(3),
      api.getStrongTopics(3),
      api.getLeaderboard('weekly'),
      api.getRecommendations(),
      api.getDailyActivity(30)
    ])

    performanceData.value = performance
    weakTopics.value = weak
    strongTopics.value = strong
    leaderboardData.value = leaderboard
    recommendations.value = recs
    dailyActivity.value = activity
  } catch (err: any) {
    console.error('Failed to load analytics:', err)
    error.value = err instanceof APIError ? err : new APIError(
      err.message || 'Failed to load analytics',
      'UNKNOWN_ERROR',
      0
    )
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadAnalytics()
})

const overallAccuracy = computed(() => {
  return performanceData.value?.overall_accuracy?.toFixed(1) || '0.0'
})

const testsCompleted = computed(() => {
  return performanceData.value?.total_tests_taken || 0
})

const currentStreak = computed(() => {
  return performanceData.value?.current_streak_days || 0
})

const studyTime = computed(() => {
  const hours = performanceData.value?.total_time_spent_hours || 0
  return `${hours.toFixed(1)}h`
})

const userRank = computed(() => {
  const userPos = leaderboardData.value?.user_position
  return userPos?.rank || 0
})

const userPercentile = computed(() => {
  const userPos = leaderboardData.value?.user_position
  const total = leaderboardData.value?.total_users || 0
  if (!userPos || !total) return 0
  return Math.round((1 - userPos.rank / total) * 100)
})

const totalUsers = computed(() => {
  return leaderboardData.value?.total_users || 0
})

const topicTimeAnalysis = computed(() => {
  const topics = performanceData.value?.topic_stats || []
  // Sort by avg_time_per_question descending
  const sorted = [...topics]
    .filter((t: any) => t.avg_time_per_question > 0)
    .sort((a: any, b: any) => b.avg_time_per_question - a.avg_time_per_question)
    .slice(0, 5) // Top 5 topics by time spent

  // Find max time for percentage calculation
  const maxTime = sorted.length > 0 ? sorted[0].avg_time_per_question : 1

  return sorted.map((topic: any) => ({
    name: topic.topic_name_en || topic.topic,
    avgTime: topic.avg_time_per_question,
    percentage: (topic.avg_time_per_question / maxTime) * 100,
    formattedTime: formatTime(topic.avg_time_per_question)
  }))
})

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

function getActivityColor(questionsCount: number): string {
  if (questionsCount === 0) return '#1e293b' // No activity
  if (questionsCount < 5) return '#14532d'   // Very low
  if (questionsCount < 10) return '#15803d'  // Low
  if (questionsCount < 20) return '#16a34a'  // Medium
  return '#22c55e'                           // High activity
}
</script>
