<template>
  <div style="min-height: 100vh; background: #0f172a; padding-bottom: 6rem;">
    <LanguageToggle />

    <!-- Header -->
    <div style="background: #1e293b; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3); position: sticky; top: 0; z-index: 10;">
      <div style="max-width: 64rem; margin: 0 auto; padding: 1rem 1.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button @click="$router.back()" style="padding: 0.5rem; border-radius: 0.5rem; background: rgba(59, 130, 246, 0.1); border: none; cursor: pointer;">
            <ChevronLeft style="width: 1.5rem; height: 1.5rem; color: #3b82f6;" />
          </button>
          <h1 style="font-size: 1.5rem; font-weight: 700; color: white;">Progress Tracking</h1>
          <div style="width: 2.5rem;"></div>
        </div>

        <!-- Period Filter -->
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center;">
          <button
            v-for="period in ['weekly', 'monthly', 'quarterly']"
            :key="period"
            @click="selectedPeriod = period; loadData()"
            :style="{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              textTransform: 'capitalize',
              background: selectedPeriod === period ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
              color: selectedPeriod === period ? 'white' : '#93c5fd'
            }"
          >
            {{ period }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" style="display: flex; justify-content: center; padding: 3rem;">
      <div style="width: 3rem; height: 3rem; border: 3px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    </div>

    <!-- Content -->
    <div v-else style="max-width: 64rem; margin: 0 auto; padding: 1.5rem;">
      <!-- Summary Stats -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <div
          v-for="stat in summaryStats"
          :key="stat.label"
          style="background: #1e293b; border-radius: 1rem; padding: 1.5rem; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);"
        >
          <div style="font-size: 2rem; font-weight: 700; color: #3b82f6; margin-bottom: 0.5rem;">
            {{ stat.value }}
          </div>
          <div style="font-size: 0.875rem; color: #94a3b8;">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Accuracy Over Time -->
      <div style="background: #1e293b; border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); margin-bottom: 2rem;">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <TrendingUp style="width: 1.5rem; height: 1.5rem; color: #3b82f6;" />
          Accuracy Trend
        </h2>
        <div v-if="chartData.length > 0" style="display: flex; flex-direction: column; gap: 1rem;">
          <div
            v-for="(point, index) in chartData"
            :key="index"
            style="display: flex; align-items: center; gap: 1rem;"
          >
            <div style="width: 80px; font-size: 0.875rem; color: #94a3b8;">
              {{ formatDate(point.date) }}
            </div>
            <div style="flex: 1; background: #0f172a; border-radius: 0.5rem; height: 2.5rem; position: relative; overflow: hidden;">
              <div
                style="height: 100%; background: linear-gradient(to right, #3b82f6, #10b981); border-radius: 0.5rem; transition: width 0.5s; display: flex; align-items: center; justify-content: flex-end; padding-right: 0.75rem;"
                :style="{ width: `${point.accuracy}%` }"
              >
                <span style="font-weight: 700; color: white; font-size: 0.875rem;">
                  {{ point.accuracy }}%
                </span>
              </div>
            </div>
            <div style="width: 80px; font-size: 0.875rem; color: #94a3b8; text-align: right;">
              {{ point.questions_attempted }} questions
            </div>
          </div>
        </div>
        <div v-else style="text-align: center; padding: 3rem 0; color: #94a3b8;">
          No data available for this period
        </div>
      </div>

      <!-- Topic Comparison -->
      <div style="background: #1e293b; border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); margin-bottom: 2rem;">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <BarChart style="width: 1.5rem; height: 1.5rem; color: #3b82f6;" />
          Topic Performance
        </h2>
        <div v-if="topicComparison.length > 0" style="display: flex; flex-direction: column; gap: 1rem;">
          <div
            v-for="topic in topicComparison"
            :key="topic.topic"
            style="display: flex; align-items: center; gap: 1rem;"
          >
            <div style="flex: 1; font-size: 0.875rem; color: #e0e0e0; font-weight: 500;">
              {{ topic.topic_name }}
            </div>
            <div style="width: 60%; background: #0f172a; border-radius: 0.5rem; height: 2rem; position: relative; overflow: hidden;">
              <div
                style="height: 100%; border-radius: 0.5rem; transition: width 0.5s;"
                :style="{
                  width: `${topic.accuracy_percentage}%`,
                  background: getAccuracyColor(topic.accuracy_percentage)
                }"
              ></div>
            </div>
            <div style="width: 60px; font-size: 0.875rem; font-weight: 600; text-align: right;"
                 :style="{ color: getAccuracyColor(topic.accuracy_percentage) }">
              {{ Math.round(topic.accuracy_percentage) }}%
            </div>
          </div>
        </div>
        <div v-else style="text-align: center; padding: 3rem 0; color: #94a3b8;">
          Complete some tests to see topic comparison
        </div>
      </div>

      <!-- Daily Activity -->
      <div style="background: #1e293b; border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <Activity style="width: 1.5rem; height: 1.5rem; color: #3b82f6;" />
          Daily Activity (Last 30 Days)
        </h2>
        <div v-if="activityData.length > 0" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(30px, 1fr)); gap: 0.5rem;">
          <div
            v-for="day in activityData"
            :key="day.date"
            :title="`${formatDate(day.date)}: ${day.questions_practiced} questions`"
            style="aspect-ratio: 1; border-radius: 0.25rem; transition: transform 0.2s; cursor: pointer;"
            :style="{
              background: getActivityColor(day.questions_practiced)
            }"
            @mouseover="$event.currentTarget.style.transform = 'scale(1.1)'"
            @mouseout="$event.currentTarget.style.transform = 'scale(1)'"
          ></div>
        </div>
        <div v-else style="text-align: center; padding: 3rem 0; color: #94a3b8;">
          No activity data available
        </div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1rem; font-size: 0.75rem; color: #94a3b8;">
          <span>Less</span>
          <div style="display: flex; gap: 0.25rem;">
            <div style="width: 1rem; height: 1rem; background: #0f172a; border-radius: 0.25rem;"></div>
            <div style="width: 1rem; height: 1rem; background: rgba(59, 130, 246, 0.3); border-radius: 0.25rem;"></div>
            <div style="width: 1rem; height: 1rem; background: rgba(59, 130, 246, 0.6); border-radius: 0.25rem;"></div>
            <div style="width: 1rem; height: 1rem; background: #3b82f6; border-radius: 0.25rem;"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ChevronLeft, TrendingUp, BarChart, Activity } from 'lucide-vue-next'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import api from '@/services/api'

const selectedPeriod = ref<'weekly' | 'monthly' | 'quarterly'>('monthly')
const isLoading = ref(true)
const chartData = ref<any[]>([])
const topicComparison = ref<any[]>([])
const activityData = ref<any[]>([])

const summaryStats = computed(() => {
  if (chartData.value.length === 0) return []

  const totalQuestions = chartData.value.reduce((sum, point) => sum + (point.questions_attempted || 0), 0)
  const avgAccuracy = chartData.value.reduce((sum, point) => sum + (point.accuracy || 0), 0) / chartData.value.length || 0
  const testsCompleted = chartData.value.filter(point => point.test_completed).length

  return [
    { label: 'Questions Attempted', value: totalQuestions },
    { label: 'Average Accuracy', value: `${Math.round(avgAccuracy)}%` },
    { label: 'Tests Completed', value: testsCompleted || chartData.value.length }
  ]
})

onMounted(() => {
  loadData()
})

async function loadData() {
  isLoading.value = true
  try {
    // Load progress chart data
    const progressData = await api.getProgressChart()
    chartData.value = progressData.chart_data || []

    // Load topic comparison
    const comparison = await api.getTopicComparison()
    topicComparison.value = comparison.topics || []

    // Load activity data
    const activity = await api.getDailyActivity(30)
    activityData.value = activity || []
  } catch (error) {
    console.error('Failed to load progress data:', error)
  } finally {
    isLoading.value = false
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return '#10b981'
  if (accuracy >= 60) return '#3b82f6'
  if (accuracy >= 40) return '#f59e0b'
  return '#ef4444'
}

function getActivityColor(count: number): string {
  if (count === 0) return '#0f172a'
  if (count < 5) return 'rgba(59, 130, 246, 0.3)'
  if (count < 10) return 'rgba(59, 130, 246, 0.6)'
  return '#3b82f6'
}
</script>

<style>
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
