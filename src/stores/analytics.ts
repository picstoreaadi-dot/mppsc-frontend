// ============================================================================
// Analytics Store
// Manages user performance analytics and statistics
// ============================================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  AnalyticsDashboard,
  TopicStat,
  LeaderboardEntry,
  TestSession,
  DashboardSummary,
} from '@/types'
import { api } from '@/services/api'

export const useAnalyticsStore = defineStore('analytics', () => {
  // State
  const dashboard = ref<AnalyticsDashboard | null>(null)
  const topicStats = ref<TopicStat[]>([])
  const weakTopics = ref<TopicStat[]>([])
  const strongTopics = ref<TopicStat[]>([])
  const recentTests = ref<TestSession[]>([])
  const leaderboard = ref<LeaderboardEntry[]>([])
  const performanceSummary = ref<DashboardSummary | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const currentStreak = computed(() => dashboard.value?.summary.current_streak_days || 0)

  const overallAccuracy = computed(() =>
    dashboard.value?.summary.overall_accuracy || 0
  )

  const totalTests = computed(() => dashboard.value?.summary.total_tests_taken || 0)

  const improvementRate = computed(() => 0) // Not available in API

  const hasData = computed(() => totalTests.value > 0)

  // Get weak area recommendation
  const weakestTopic = computed(() => {
    if (weakTopics.value.length === 0) return null
    return weakTopics.value[0]
  })

  // Get strongest topic
  const strongestTopic = computed(() => {
    if (strongTopics.value.length === 0) return null
    return strongTopics.value[0]
  })

  // Actions
  async function fetchDashboard() {
    try {
      isLoading.value = true
      error.value = null

      const data = await api.getDashboard()
      dashboard.value = data
      topicStats.value = data.summary.topic_stats || []
      weakTopics.value = data.weak_topics || []
      strongTopics.value = data.strong_topics || []
      // recentTests not provided in dashboard summary, fetched separately

      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch dashboard'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPerformanceSummary() {
    try {
      const data = await api.getPerformanceSummary()
      performanceSummary.value = data
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch performance summary'
      return false
    }
  }

  async function fetchTopicStats() {
    try {
      const data = await api.getAllTopics()
      topicStats.value = data
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch topic stats'
      return false
    }
  }

  async function fetchWeakTopics() {
    try {
      const data = await api.getWeakTopics()
      weakTopics.value = data
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch weak topics'
      return false
    }
  }

  async function fetchStrongTopics() {
    try {
      const data = await api.getStrongTopics()
      strongTopics.value = data
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch strong topics'
      return false
    }
  }

  async function fetchLeaderboard(period: 'weekly' | 'monthly' | 'all_time' = 'weekly') {
    try {
      const data = await api.getLeaderboard(period)
      leaderboard.value = data
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch leaderboard'
      return false
    }
  }

  async function fetchRecentTests(limit = 10) {
    try {
      const data = await api.getTestHistory(limit)
      recentTests.value = data
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch test history'
      return false
    }
  }

  function getTopicStat(topicId: string) {
    return topicStats.value.find((t) => t.topic === topicId)
  }

  function getStrengthLevel(accuracy: number): 'weak' | 'average' | 'strong' | 'expert' {
    if (accuracy < 40) return 'weak'
    if (accuracy < 60) return 'average'
    if (accuracy < 80) return 'strong'
    return 'expert'
  }

  function getStrengthColor(level: string) {
    const colors = {
      weak: 'danger',
      average: 'attention',
      strong: 'success',
      expert: 'primary',
    }
    return colors[level as keyof typeof colors] || 'passive'
  }

  // Radar chart data for topic comparison
  const radarChartData = computed(() => {
    if (topicStats.value.length === 0) return null

    return {
      labels: topicStats.value.map((t) => t.topic_name_en),
      datasets: [
        {
          label: 'Your Performance',
          data: topicStats.value.map((t) => t.accuracy_percentage),
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)',
          pointBackgroundColor: 'rgb(59, 130, 246)',
        },
      ],
    }
  })

  // Progress over time data
  const progressChartData = computed(() => {
    if (recentTests.value.length === 0) return null

    return {
      labels: recentTests.value.map((t) =>
        new Date(t.created_at).toLocaleDateString()
      ),
      datasets: [
        {
          label: 'Score',
          data: recentTests.value.map((t) => t.score || 0),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
      ],
    }
  })

  function clearError() {
    error.value = null
  }

  return {
    // State
    dashboard,
    topicStats,
    weakTopics,
    strongTopics,
    recentTests,
    leaderboard,
    performanceSummary,
    isLoading,
    error,

    // Computed
    currentStreak,
    overallAccuracy,
    totalTests,
    improvementRate,
    hasData,
    weakestTopic,
    strongestTopic,
    radarChartData,
    progressChartData,

    // Actions
    fetchDashboard,
    fetchPerformanceSummary,
    fetchTopicStats,
    fetchWeakTopics,
    fetchStrongTopics,
    fetchLeaderboard,
    fetchRecentTests,
    getTopicStat,
    getStrengthLevel,
    getStrengthColor,
    clearError,
  }
})
