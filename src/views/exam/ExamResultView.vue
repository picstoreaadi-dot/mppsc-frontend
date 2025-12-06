<template>
  <div class="min-h-screen bg-paper-white dark:bg-dark-bg">
    <LanguageToggle />

    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <template v-else-if="testResult">
      <!-- Hero Section - Score Display -->
      <div class="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-12 px-4">
        <div class="max-w-4xl mx-auto text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-4">
            <Trophy class="w-5 h-5" />
            <span class="text-sm font-medium">Test Completed!</span>
          </div>

          <div class="text-7xl font-bold mb-2">{{ percentage }}%</div>
          <p class="text-xl opacity-90 mb-2">Your Score: {{ testResult.score }}</p>
          <p class="text-sm opacity-75 mb-6">{{ testTypeFormatted }} {{ topicFormatted }}</p>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div class="bg-white/10 rounded-xl p-4">
              <div class="text-3xl font-bold text-green-300">{{ correctAnswers }}</div>
              <div class="text-sm opacity-80">Correct</div>
            </div>
            <div class="bg-white/10 rounded-xl p-4">
              <div class="text-3xl font-bold text-red-300">{{ wrongAnswers }}</div>
              <div class="text-sm opacity-80">Incorrect</div>
            </div>
            <div class="bg-white/10 rounded-xl p-4">
              <div class="text-3xl font-bold text-yellow-300">{{ skippedQuestions }}</div>
              <div class="text-sm opacity-80">Skipped</div>
            </div>
            <div class="bg-white/10 rounded-xl p-4">
              <div class="text-3xl font-bold">{{ timeTakenFormatted }}</div>
              <div class="text-sm opacity-80">Time Taken</div>
            </div>
          </div>

          <!-- Additional Stats -->
          <div class="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto text-sm">
            <div class="bg-white/10 rounded-lg p-3">
              <div class="opacity-80">Attempted</div>
              <div class="text-2xl font-bold">{{ attemptedQuestions }}/{{ totalQuestions }}</div>
            </div>
            <div class="bg-white/10 rounded-lg p-3">
              <div class="opacity-80">Accuracy</div>
              <div class="text-2xl font-bold">{{ accuracyPercentage }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Analysis -->
      <div class="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <!-- Topic Breakdown -->
        <div v-if="topicBreakdown.length > 0" class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Topic Breakdown</h2>
          </div>

          <div class="space-y-5">
            <div v-for="topic in topicBreakdown" :key="topic.name" class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-between mb-3">
                <span class="font-bold text-gray-900 dark:text-gray-100 text-base">{{ topic.name }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {{ topic.correct }}/{{ topic.total }}
                  </span>
                  <span
                    class="text-sm font-bold px-3 py-1 rounded-full"
                    :class="{
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400': topic.score >= 70,
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400': topic.score >= 40 && topic.score < 70,
                      'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400': topic.score < 40
                    }"
                  >
                    {{ topic.score }}%
                  </span>
                </div>
              </div>

              <div class="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  class="h-4 rounded-full transition-all duration-500 shadow-inner"
                  :class="{
                    'bg-gradient-to-r from-emerald-400 to-emerald-600': topic.score >= 70,
                    'bg-gradient-to-r from-amber-400 to-amber-600': topic.score >= 40 && topic.score < 70,
                    'bg-gradient-to-r from-rose-400 to-rose-600': topic.score < 40
                  }"
                  :style="{ width: Math.max(topic.score, 5) + '%' }"
                >
                  <div class="w-full h-full bg-white/20"></div>
                </div>
              </div>

              <div class="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mt-3">
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  {{ topic.attempted }} attempted
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  {{ topic.wrong }} wrong
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions Review -->
        <div v-if="questionsWithAnswers.length > 0" class="space-y-6">
          <div class="flex items-center gap-3 px-2">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Questions Review</h2>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ questionsWithAnswers.length }} questions</span>
          </div>

          <div
            v-for="(qa, index) in questionsWithAnswers"
            :key="index"
            class="rounded-2xl shadow-xl overflow-hidden border-l-8 transition-all hover:shadow-2xl"
            :class="{
              'border-emerald-500 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/30 dark:to-gray-800': qa.is_correct,
              'border-rose-500 bg-gradient-to-r from-rose-50 to-white dark:from-rose-950/30 dark:to-gray-800': qa.user_answer && !qa.is_correct,
              'border-slate-400 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/30 dark:to-gray-800': !qa.user_answer
            }"
          >
            <!-- Question Header -->
            <div class="px-6 py-4 border-b-2 border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg"
                    :class="{
                      'bg-gradient-to-br from-emerald-400 to-emerald-600': qa.is_correct,
                      'bg-gradient-to-br from-rose-400 to-rose-600': qa.user_answer && !qa.is_correct,
                      'bg-gradient-to-br from-slate-400 to-slate-600': !qa.user_answer
                    }"
                  >
                    {{ qa.order }}
                  </div>
                  <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Question</p>
                    <p class="text-xs text-gray-500 dark:text-gray-500">
                      {{ qa.question.exam_year ? `Year ${qa.question.exam_year}` : 'Practice' }}
                    </p>
                  </div>
                </div>
                <div
                  class="px-4 py-2 rounded-full font-bold text-sm shadow-md"
                  :class="{
                    'bg-emerald-500 text-white': qa.is_correct,
                    'bg-rose-500 text-white': qa.user_answer && !qa.is_correct,
                    'bg-slate-400 text-white': !qa.user_answer
                  }"
                >
                  {{ qa.is_correct ? '✓ CORRECT' : qa.user_answer ? '✗ WRONG' : '− SKIPPED' }}
                </div>
              </div>
            </div>

            <!-- Question Text -->
            <div class="px-6 py-5 bg-white dark:bg-gray-800/50">
              <p class="text-lg leading-relaxed text-gray-900 dark:text-gray-50 font-medium">
                {{ language === 'hi' ? qa.question.question_text_hi : qa.question.question_text_en }}
              </p>
            </div>

            <!-- Options -->
            <div class="px-6 py-5 bg-gray-50/50 dark:bg-gray-900/30 space-y-3">
              <div
                v-for="(option, key) in (language === 'hi' ? qa.question.options_hi : qa.question.options_en)"
                :key="key"
                class="group relative flex items-start gap-4 p-4 rounded-xl transition-all duration-200"
                :class="{
                  'bg-gradient-to-r from-emerald-100 via-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:via-emerald-900/20 dark:to-emerald-900/40 ring-2 ring-emerald-500 shadow-lg': key === qa.correct_answer,
                  'bg-gradient-to-r from-rose-100 via-rose-50 to-rose-100 dark:from-rose-900/40 dark:via-rose-900/20 dark:to-rose-900/40 ring-2 ring-rose-500 shadow-lg': qa.user_answer === key && key !== qa.correct_answer,
                  'bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-700': key !== qa.correct_answer && qa.user_answer !== key
                }"
              >
                <!-- Option Letter Badge -->
                <div
                  class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-black text-base shadow-md"
                  :class="{
                    'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white': key === qa.correct_answer,
                    'bg-gradient-to-br from-rose-500 to-rose-700 text-white': qa.user_answer === key && key !== qa.correct_answer,
                    'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-700 dark:text-gray-200': key !== qa.correct_answer && qa.user_answer !== key
                  }"
                >
                  {{ key }}
                </div>

                <!-- Option Text -->
                <div class="flex-1 min-w-0">
                  <p
                    class="text-base leading-relaxed"
                    :class="{
                      'text-gray-900 dark:text-gray-50 font-bold': key === qa.correct_answer || qa.user_answer === key,
                      'text-gray-700 dark:text-gray-300 font-medium': key !== qa.correct_answer && qa.user_answer !== key
                    }"
                  >
                    {{ option }}
                  </p>

                  <!-- Status Tags -->
                  <div v-if="key === qa.correct_answer || qa.user_answer === key" class="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      v-if="key === qa.correct_answer"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm"
                      :class="qa.user_answer === key ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white'"
                    >
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                      CORRECT ANSWER
                    </span>
                    <span
                      v-if="qa.user_answer === key && key !== qa.correct_answer"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow-sm"
                    >
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                      </svg>
                      YOUR ANSWER
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Explanation -->
            <div v-if="getExplanation(qa)" class="px-6 py-5 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-950/30 dark:via-blue-950/30 dark:to-indigo-950/30 border-t-2 border-blue-200 dark:border-blue-800">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="font-bold text-blue-900 dark:text-blue-300 mb-2 text-sm uppercase tracking-wide">Explanation</p>
                  <p class="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {{ getExplanation(qa) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button @click="router.push('/analytics')" class="py-4 rounded-xl bg-primary-500 text-white font-semibold">
            View Detailed Analytics
          </button>
          <button @click="router.push('/dashboard')" class="py-4 rounded-xl border-2 border-primary-500 text-primary-500 font-semibold">
            Back to Dashboard
          </button>
        </div>
      </div>
    </template>

    <div v-else class="flex flex-col items-center justify-center min-h-screen text-passive-500">
      <p class="text-lg mb-4">Failed to load results.</p>
      <button @click="router.push('/dashboard')" class="text-primary-500 hover:underline">
        Go to Dashboard
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Trophy } from 'lucide-vue-next'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import { useTestStore } from '@/stores/test'
import { useSettingsStore } from '@/stores/settings'
import { TOPICS } from '@/types'

const route = useRoute()
const router = useRouter()
const testStore = useTestStore()
const settingsStore = useSettingsStore()
const { testResult, isLoading } = storeToRefs(testStore)
const { language } = storeToRefs(settingsStore)

onMounted(async () => {
  const sessionId = route.params.sessionId as string
  if (sessionId) {
    await testStore.getTestResult(sessionId)
  }
})

const percentage = computed(() => {
  if (!testResult.value || testResult.value.total_questions === 0) return 0
  return Math.round((testResult.value.correct_answers / testResult.value.total_questions) * 100)
})

const correctAnswers = computed(() => testResult.value?.correct_answers || 0)
const wrongAnswers = computed(() => testResult.value?.wrong_answers || 0)
const skippedQuestions = computed(() => testResult.value?.skipped_questions || 0)
const attemptedQuestions = computed(() => testResult.value?.attempted_questions || 0)
const totalQuestions = computed(() => testResult.value?.total_questions || 0)

const accuracyPercentage = computed(() => {
  if (!testResult.value || attemptedQuestions.value === 0) return 0
  return Math.round((testResult.value.correct_answers / attemptedQuestions.value) * 100)
})

const testTypeFormatted = computed(() => {
  if (!testResult.value?.test_type) return ''
  const types: Record<string, string> = {
    'full_length_test': 'Full Length Test',
    'topic_test': 'Topic Test',
    'quick_practice': 'Quick Practice',
    'weak_area_test': 'Weak Area Test',
    'ai_generated': 'AI Generated Test'
  }
  return types[testResult.value.test_type] || testResult.value.test_type
})

const topicFormatted = computed(() => {
  if (!testResult.value?.topic) return ''
  const topic = TOPICS.find((t: any) => t.id === testResult.value.topic)
  if (!topic) return ''
  return `- ${language.value === 'hi' ? topic.name_hi : topic.name_en}`
})

const timeTakenFormatted = computed(() => {
  if (!testResult.value) return '00:00'
  const seconds = testResult.value.time_taken_seconds || 0
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const topicBreakdown = computed(() => {
  if (!testResult.value?.topic_breakdown) return []

  return Object.entries(testResult.value.topic_breakdown).map(([topicId, stats]: [string, any]) => {
    const topic = TOPICS.find((t: any) => t.id === topicId)
    // Use topic name if available, otherwise format the ID
    const name = topic
      ? (language.value === 'hi' ? topic.name_hi : topic.name_en)
      : topicId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

    const score = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0

    return {
      name,
      score,
      total: stats.total,
      attempted: stats.attempted,
      correct: stats.correct,
      wrong: stats.wrong
    }
  })
})

const questionsWithAnswers = computed(() => {
  if (!testResult.value?.questions_with_answers) return []
  return testResult.value.questions_with_answers
})

// Helper function to get explanation from the correct path
function getExplanation(qa: any): string {
  // Try multiple possible paths for explanation
  if (language.value === 'hi') {
    return qa.question?.explanation_hi || qa.question?.explanation || qa.explanation || ''
  }
  return qa.question?.explanation || qa.explanation || ''
}
</script>
