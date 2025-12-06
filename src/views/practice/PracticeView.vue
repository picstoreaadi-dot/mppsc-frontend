<template>
  <div style="min-height: 100vh; background: #0f172a; overflow: hidden;">
    <!-- Language Toggle -->
    <LanguageToggle />

    <!-- Loading State -->
    <div v-if="isLoading" style="display: flex; align-items: center; justify-content: center; min-height: 100vh;">
      <div style="text-align: center;">
        <div style="width: 4rem; height: 4rem; border: 4px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 1rem; color: #94a3b8;">Loading practice session...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Progress Bar at top -->
      <div style="padding: 1rem 1.5rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
        <button
          @click="exitPractice"
          style="padding: 0.5rem; border-radius: 9999px; background: rgba(148, 163, 184, 0.1); border: none; cursor: pointer; transition: all 0.2s;"
          @mouseover="($event.currentTarget as HTMLElement).style.background = 'rgba(148, 163, 184, 0.2)'"
          @mouseout="($event.currentTarget as HTMLElement).style.background = 'rgba(148, 163, 184, 0.1)'"
        >
          <X style="width: 1.5rem; height: 1.5rem; color: white;" />
        </button>

        <!-- Center: Question counter and Timer -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.25rem;">
          <span style="font-size: 0.875rem; font-weight: 500; color: #94a3b8;">
            {{ currentQuestionIndex + 1 }} / {{ totalQuestions }}
          </span>
          <!-- Timer Display -->
          <div
            style="display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 700; transition: all 0.3s;"
            :style="{
              background: timerStatus === 'danger' ? 'rgba(239, 68, 68, 0.2)' : timerStatus === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: timerColor
            }"
          >
            <Clock style="width: 1rem; height: 1rem;" />
            {{ formattedTime }}
          </div>
        </div>

        <button
          @click="toggleBookmark"
          style="padding: 0.5rem; border-radius: 9999px; background: rgba(148, 163, 184, 0.1); border: none; cursor: pointer; transition: all 0.2s;"
          @mouseover="($event.currentTarget as HTMLElement).style.background = 'rgba(148, 163, 184, 0.2)'"
          @mouseout="($event.currentTarget as HTMLElement).style.background = 'rgba(148, 163, 184, 0.1)'"
        >
          <Bookmark
            style="width: 1.5rem; height: 1.5rem;"
            :style="{ color: isBookmarked ? '#f59e0b' : 'white', fill: isBookmarked ? '#f59e0b' : 'none' }"
          />
        </button>
      </div>
      <div style="width: 100%; height: 0.5rem; background: #334155; border-radius: 9999px; overflow: hidden;">
        <div style="height: 100%; background: #3b82f6; transition: width 0.3s;" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>

    <!-- Card Stack Area (Top 70%) -->
    <div
      ref="cardContainer"
      style="padding: 0 1.5rem; padding-bottom: 1.5rem; overflow-y: auto; height: calc(100vh - 30vh - 80px);"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- No Questions Fallback -->
      <div
        v-if="!currentQuestion && !isLoading"
        style="text-align: center; padding: 3rem; background: #1e293b; border-radius: 1.5rem; margin: 2rem 0;"
      >
        <p style="color: #94a3b8; font-size: 1.25rem; margin-bottom: 1rem;">No questions available</p>
        <p style="color: #64748b; font-size: 0.875rem;">This practice session has no questions.</p>
        <button
          @click="router.push('/dashboard')"
          style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;"
        >
          Return to Dashboard
        </button>
      </div>

      <div
        v-if="currentQuestion"
        style="background: #1e293b; border-radius: 1.5rem; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);"
        :style="cardStyle"
      >
        <!-- Hidden debug trigger -->
        <div style="display: none;">{{ debugOptionHighlight }}</div>

        <!-- Question Number & Topic Badge -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <span style="font-size: 0.875rem; font-weight: 600; color: #3b82f6;">
            Question {{ currentQuestionIndex + 1 }}
          </span>
          <span style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: rgba(59, 130, 246, 0.2); color: #93c5fd;">
            {{ topicName }}
          </span>
        </div>

        <!-- Question Text -->
        <div
          style="font-size: 1.125rem; margin-bottom: 1.5rem; color: #e0e0e0; line-height: 1.75;"
          :class="language === 'hi' ? 'hindi' : ''"
        >
          {{ questionText }}
        </div>

        <!-- Options -->
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button
            v-for="(option, index) in options"
            :key="index"
            style="width: 100%; padding: 1rem; border-radius: 0.75rem; border: 2px solid; transition: all 0.2s; cursor: pointer; text-align: left;"
            :style="{
              borderColor: currentQuestionState?.selectedOption === getOptionLetter(index) ? '#3b82f6' : (currentQuestionState?.eliminatedOptions.includes(getOptionLetter(index)) ? '#64748b' : '#334155'),
              background: currentQuestionState?.selectedOption === getOptionLetter(index) ? 'rgba(59, 130, 246, 0.1)' : (currentQuestionState?.eliminatedOptions.includes(getOptionLetter(index)) ? '#0f172a' : '#0f172a'),
              opacity: currentQuestionState?.eliminatedOptions.includes(getOptionLetter(index)) ? '0.5' : '1',
              textDecoration: currentQuestionState?.eliminatedOptions.includes(getOptionLetter(index)) ? 'line-through' : 'none'
            }"
            @click="selectOption(getOptionLetter(index)); console.log('[PracticeView] Option clicked:', getOptionLetter(index))"
            @contextmenu.prevent="toggleElimination(getOptionLetter(index))"
            @touchstart="handleLongPressStart($event, getOptionLetter(index))"
            @touchend="handleLongPressEnd"
          >
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="flex-shrink: 0; width: 2rem; height: 2rem; border-radius: 9999px; border: 2px solid #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: 600; color: white;">
                {{ ['A', 'B', 'C', 'D'][index] }}
              </span>
              <span style="flex: 1; color: white;" :class="language === 'hi' ? 'hindi' : ''">
                {{ option }}
              </span>
            </div>
          </button>
        </div>

        <!-- Explanation Section (Always visible, but with warning before answering) -->
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #334155;">
          <!-- Warning Banner (Before Answering) -->
          <div
            v-if="!currentQuestionState?.isAnswered && !showExplanationWarningDismissed"
            style="padding: 0.75rem 1rem; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 0.5rem; margin-bottom: 1rem; display: flex; align-items: flex-start; gap: 0.5rem;"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" style="flex-shrink: 0; margin-top: 0.125rem;">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div style="flex: 1;">
              <p style="font-size: 0.8rem; color: #fbbf24; font-weight: 600; margin-bottom: 0.25rem;">
                {{ language === 'hi' ? 'पहले खुद हल करें!' : 'Try solving it yourself first!' }}
              </p>
              <p style="font-size: 0.75rem; color: #d1d5db;">
                {{ language === 'hi'
                  ? 'व्याख्या देखने से पहले प्रश्न का उत्तर देने का प्रयास करें। इससे आपकी याददाश्त बेहतर होगी।'
                  : 'Try answering the question before viewing the explanation. This helps with better retention.'
                }}
              </p>
            </div>
          </div>

          <button
            @click="toggleExplanation"
            style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 0.75rem 0; font-weight: 600; color: white; background: none; border: none; cursor: pointer;"
          >
            <span style="display: flex; align-items: center; gap: 0.5rem;">
              {{ currentQuestionState?.showExplanation ? '▼' : '▶' }}
              {{ language === 'hi' ? 'व्याख्या देखें' : 'Show Explanation' }}
              <span v-if="!currentQuestionState?.isAnswered" style="font-size: 0.75rem; padding: 0.125rem 0.5rem; background: rgba(251, 191, 36, 0.2); color: #fbbf24; border-radius: 9999px;">
                {{ language === 'hi' ? 'सावधान' : 'Spoiler' }}
              </span>
            </span>
          </button>

          <div
            v-show="currentQuestionState?.showExplanation"
            style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;"
          >
            <!-- Official Explanation -->
            <div style="color: #d1d5db; line-height: 1.75;" :class="language === 'hi' ? 'hindi' : ''">
              {{ explanation }}
            </div>

            <!-- AI Action Pills -->
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              <button
                @click="getAIExplanation('eli5')"
                :disabled="isLoadingAI"
                style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 9999px; background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.875rem; cursor: pointer; transition: all 0.2s;"
                :style="{ opacity: isLoadingAI ? 0.5 : 1 }"
              >
                <Sparkles style="width: 1rem; height: 1rem;" />
                {{ language === 'hi' ? 'सरल भाषा में' : 'Explain like I\'m 5' }}
              </button>
              <button
                @click="getAIExplanation('detailed')"
                :disabled="isLoadingAI"
                style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 9999px; background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.875rem; cursor: pointer; transition: all 0.2s;"
                :style="{ opacity: isLoadingAI ? 0.5 : 1 }"
              >
                <Brain style="width: 1rem; height: 1rem;" />
                {{ language === 'hi' ? 'विस्तृत व्याख्या' : 'Detailed Explanation' }}
              </button>
              <button
                @click="getAIExplanation('hindi')"
                :disabled="isLoadingAI"
                style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 9999px; background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.875rem; cursor: pointer; transition: all 0.2s;"
                :style="{ opacity: isLoadingAI ? 0.5 : 1 }"
              >
                <MessageCircle style="width: 1rem; height: 1rem;" />
                {{ language === 'hi' ? 'हिंदी में' : 'Explain in Hindi' }}
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="isLoadingAI" style="display: flex; align-items: center; gap: 0.5rem; color: #94a3b8; font-size: 0.875rem;">
              <div style="width: 1rem; height: 1rem; border: 2px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
              {{ language === 'hi' ? 'AI व्याख्या लोड हो रही है...' : 'Loading AI explanation...' }}
            </div>

            <!-- AI Generated Content -->
            <div
              v-if="currentQuestionState?.showAIExplanation && currentQuestionState?.aiExplanation"
              style="padding: 1rem; background: rgba(59, 130, 246, 0.05); border-radius: 0.75rem; border-left: 4px solid #3b82f6;"
            >
              <div style="display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
                <Sparkles style="width: 1.25rem; height: 1.25rem; color: #3b82f6; flex-shrink: 0; margin-top: 0.125rem;" />
                <div style="font-weight: 600; color: #93c5fd;">
                  {{ language === 'hi' ? 'AI व्याख्या' : 'AI Explanation' }}
                </div>
              </div>
              <div style="color: #d1d5db; line-height: 1.75; white-space: pre-wrap;">
                {{ currentQuestionState.aiExplanation }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Swipe Hint -->
      <div style="text-align: center; margin-top: 1rem; font-size: 0.875rem; color: #94a3b8;">
        ← Swipe for navigation →
      </div>
    </div>

    <!-- Thumb Zone (Bottom 30%) -->
    <div style="position: fixed; bottom: 0; left: 0; right: 0; background: #1e293b; padding: 1.5rem; box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.3);">
      <div style="display: flex; flex-direction: column; justify-content: center; gap: 1rem; max-width: 80rem; margin: 0 auto;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button
            @click="previousQuestion"
            :disabled="!canGoPrevious"
            style="padding: 1rem; border-radius: 0.75rem; background: #334155; border: none; cursor: pointer; transition: all 0.2s;"
            :style="{ opacity: !canGoPrevious ? '0.4' : '1', cursor: !canGoPrevious ? 'not-allowed' : 'pointer' }"
          >
            <ChevronLeft style="width: 1.5rem; height: 1.5rem; color: white;" />
          </button>

          <button
            v-if="currentQuestionState?.isAnswered"
            @click="toggleReviewMark"
            style="padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; transition: all 0.2s; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;"
            :style="{
              background: currentQuestionState.isMarkedForReview ? '#f59e0b' : '#334155',
              color: 'white'
            }"
          >
            <Flag style="width: 1.25rem; height: 1.25rem;" />
            {{ currentQuestionState.isMarkedForReview ? 'Marked' : 'Mark for Review' }}
          </button>

          <button
            @click="nextQuestion"
            :disabled="!canGoNext"
            style="padding: 1rem; border-radius: 0.75rem; background: #3b82f6; color: white; border: none; cursor: pointer; transition: all 0.2s;"
            :style="{ opacity: !canGoNext ? '0.4' : '1', cursor: !canGoNext ? 'not-allowed' : 'pointer' }"
          >
            <ChevronRight style="width: 1.5rem; height: 1.5rem;" />
          </button>
        </div>

        <!-- Submit Button (when on last question) -->
        <button
          v-if="currentQuestionIndex === totalQuestions - 1"
          @click="submitPractice"
          style="width: 100%; padding: 1rem; border-radius: 0.75rem; background: #10b981; color: white; font-weight: 700; font-size: 1.125rem; border: none; cursor: pointer; transition: all 0.2s;"
          @mouseover="($event.currentTarget as HTMLElement).style.background = '#059669'"
          @mouseout="($event.currentTarget as HTMLElement).style.background = '#10b981'"
        >
          Complete Practice
        </button>
      </div>
    </div>
    </div>
  </div>
</template>

<style>
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  X,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Flag,
  Sparkles,
  Brain,
  MessageCircle,
  Clock,
} from 'lucide-vue-next'

import { useTestStore } from '@/stores/test'
import { useSettingsStore } from '@/stores/settings'
import { TOPICS } from '@/types'
import LanguageToggle from '@/components/common/LanguageToggle.vue'

const router = useRouter()
const route = useRoute()
const testStore = useTestStore()
const settingsStore = useSettingsStore()

const { language } = storeToRefs(settingsStore)
const {
  currentQuestion,
  currentQuestionState,
  currentQuestionIndex,
  totalQuestions,
  progress,
  canGoNext,
  canGoPrevious,
  timeRemaining,
  timerStatus,
} = storeToRefs(testStore)

// Swipe gesture tracking
const cardContainer = ref<HTMLElement | null>(null)
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchCurrentX = ref(0)
const cardTranslateX = ref(0)
const showFeedback = ref(false)

// Long press tracking for elimination
const longPressTimer = ref<number | null>(null)
const longPressOption = ref<string | null>(null)

// Mock bookmark state (in production, sync with backend)
const isBookmarked = ref(false)
const isLoading = ref(true)
const isLoadingAI = ref(false)
const showExplanationWarningDismissed = ref(false)

onMounted(async () => {
  // Load practice session from route parameter
  const sessionId = route.params.sessionId as string
  console.log('[PracticeView] Session ID from route:', sessionId)

  if (!sessionId || sessionId === 'undefined') {
    console.error('[PracticeView] No valid session ID')
    alert('No session ID provided')
    router.push('/dashboard')
    return
  }

  try {
    console.log('[PracticeView] Loading test session...')
    const success = await testStore.loadTestSession(sessionId)
    console.log('[PracticeView] Load result:', success)
    console.log('[PracticeView] Questions loaded:', testStore.questions.length)
    console.log('[PracticeView] Current question:', testStore.currentQuestion)
    console.log('[PracticeView] Current question state:', currentQuestionState.value)

    if (!success || testStore.questions.length === 0) {
      console.error('[PracticeView] No questions in session')
      alert('This session has no questions. Please try again.')
      router.push('/dashboard')
      return
    }

    isLoading.value = false
    testStore.startTimer()
    console.log('[PracticeView] Practice session loaded successfully')

    // Debug: Log selected option state
    if (currentQuestionState.value?.selectedOption) {
      console.log('[PracticeView] First question has selected option:', currentQuestionState.value.selectedOption)
    }
  } catch (error) {
    console.error('[PracticeView] Failed to load test session:', error)
    alert(`Failed to load practice session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    router.push('/dashboard')
  }
})

onUnmounted(() => {
  // Clean up any timers
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
  }
})

const questionText = computed(() => {
  if (!currentQuestion.value) return ''
  return language.value === 'hi'
    ? currentQuestion.value.question.question_text_hi
    : currentQuestion.value.question.question_text_en
})

const options = computed(() => {
  if (!currentQuestion.value) return []
  const opts = language.value === 'hi'
    ? currentQuestion.value.question.options_hi
    : currentQuestion.value.question.options_en

  // Backend returns options as object {"A": "text", "B": "text", "C": "text", "D": "text"}
  // Convert to array ["text", "text", "text", "text"]
  if (opts && typeof opts === 'object' && !Array.isArray(opts)) {
    const optsObj = opts as unknown as { A?: string; B?: string; C?: string; D?: string }
    return [optsObj.A, optsObj.B, optsObj.C, optsObj.D].filter(Boolean) as string[]
  }

  // If already an array, return as is
  return Array.isArray(opts) ? opts : []
})

const explanation = computed(() => {
  if (!currentQuestion.value) return ''
  return language.value === 'hi'
    ? currentQuestion.value.question.explanation_hi || 'Explanation not available'
    : currentQuestion.value.question.explanation_en || 'Explanation not available'
})

const topicName = computed(() => {
  if (!currentQuestion.value) return ''
  const topic = TOPICS.find(t => t.id === currentQuestion.value!.question.standardized_topic)
  return language.value === 'hi' ? topic?.name_hi : topic?.name_en
})

// Timer formatting
const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const timerColor = computed(() => {
  if (timerStatus.value === 'danger') return '#ef4444'
  if (timerStatus.value === 'warning') return '#f59e0b'
  return '#10b981'
})

// Debug computed to log option highlighting
const debugOptionHighlight = computed(() => {
  if (!currentQuestionState.value) return null
  const result = {
    selectedOption: currentQuestionState.value.selectedOption,
    selectedOptionType: typeof currentQuestionState.value.selectedOption,
    comparisons: ['A', 'B', 'C', 'D'].map(letter => ({
      letter,
      matches: currentQuestionState.value?.selectedOption === letter,
      strictEquality: currentQuestionState.value?.selectedOption === letter,
      looseEquality: currentQuestionState.value?.selectedOption == letter
    }))
  }
  console.log('[PracticeView] Option highlighting debug:', result)
  return result
})

const cardStyle = computed(() => {
  return {
    transform: `translateX(${cardTranslateX.value}px)`,
    transition: cardTranslateX.value === 0 ? 'transform 0.3s ease-out' : 'none',
  }
})

// Helper function to convert index to letter (0 -> 'A', 1 -> 'B', etc.)
function getOptionLetter(index: number): string {
  return ['A', 'B', 'C', 'D'][index] || 'A'
}

function selectOption(option: string) {
  console.log('[PracticeView] selectOption called with:', option)
  testStore.selectOption(option)
  showFeedback.value = true
  settingsStore.playSound(isCorrectAnswer(option) ? 'correct' : 'incorrect')

  // Hide feedback after animation
  setTimeout(() => {
    showFeedback.value = false
  }, 500)
}

function isCorrectAnswer(option: string): boolean {
  if (!currentQuestion.value) return false
  // option is now "A", "B", "C", or "D"
  // predicted_answer should also be "A", "B", "C", or "D"
  const correctAnswer = currentQuestion.value.question.predicted_answer
  return correctAnswer === option
}

function toggleElimination(option: string) {
  testStore.toggleElimination(option)
}

function handleLongPressStart(_event: TouchEvent, option: string) {
  longPressOption.value = option
  longPressTimer.value = window.setTimeout(() => {
    settingsStore.triggerHaptic('medium')
    toggleElimination(option)
  }, 500)
}

function handleLongPressEnd() {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  longPressOption.value = null
}

function toggleReviewMark() {
  testStore.toggleReviewMark()
}

function toggleExplanation() {
  testStore.toggleExplanation()
}

async function getAIExplanation(mode: 'eli5' | 'detailed' | 'hindi') {
  isLoadingAI.value = true
  try {
    await testStore.getAIExplanation(mode)
  } finally {
    isLoadingAI.value = false
  }
  settingsStore.triggerHaptic('light')
}

// generateSimilar function removed - not currently used

function toggleBookmark() {
  isBookmarked.value = !isBookmarked.value
  settingsStore.triggerHaptic('light')
}

// Swipe handlers
function handleTouchStart(event: TouchEvent) {
  const touch = event.touches[0]
  if (!touch) return
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
}

function handleTouchMove(event: TouchEvent) {
  const touch = event.touches[0]
  if (!touch) return
  touchCurrentX.value = touch.clientX
  const deltaX = touchCurrentX.value - touchStartX.value
  const deltaY = touch.clientY - touchStartY.value

  // Only allow horizontal swipes (not vertical scrolling)
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    cardTranslateX.value = deltaX * 0.5 // Damping effect
  }
}

function handleTouchEnd() {
  const deltaX = touchCurrentX.value - touchStartX.value
  const threshold = 100

  if (deltaX > threshold && canGoPrevious.value) {
    previousQuestion()
  } else if (deltaX < -threshold && canGoNext.value) {
    nextQuestion()
  }

  // Reset
  cardTranslateX.value = 0
  touchStartX.value = 0
  touchCurrentX.value = 0
}

function nextQuestion() {
  testStore.nextQuestion()
  settingsStore.triggerHaptic('light')
}

function previousQuestion() {
  testStore.previousQuestion()
  settingsStore.triggerHaptic('light')
}

function exitPractice() {
  if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
    router.push('/dashboard')
  }
}

async function submitPractice() {
  const result = await testStore.submitTest()
  if (result) {
    router.push(`/exam/${testStore.currentSession?.id}/result`)
  }
}
</script>
