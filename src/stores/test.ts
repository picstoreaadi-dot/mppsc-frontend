// ============================================================================
// Test Store
// Manages test sessions, questions, answers, and timer
// ============================================================================

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  TestSession,
  TestQuestionWithDetails,
  CreateTestRequest,
  TestResult,
  QuestionUIState,
  TopicId,
} from '@/types'
import { api } from '@/services/api'
import { useSettingsStore } from './settings'

// ============================================================================
// LocalStorage Helper Functions for State Persistence
// ============================================================================

interface SessionState {
  sessionId: string
  currentQuestionIndex: number
  questions: Record<string, QuestionUIState>
  timeRemaining: number  // Save timer state
  lastUpdated: number
}

const STORAGE_PREFIX = 'mppsc_test_session_'
const STATE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function saveSessionState(sessionId: string, questionIndex: number, questionStates: Map<string, QuestionUIState>, timeRemainingValue: number) {
  try {
    const questionsObj: Record<string, QuestionUIState> = {}
    questionStates.forEach((state, id) => {
      questionsObj[id] = {
        selectedOption: state.selectedOption,
        eliminatedOptions: state.eliminatedOptions,
        isAnswered: state.isAnswered,
        isMarkedForReview: state.isMarkedForReview,
        timeSpent: state.timeSpent,
        // Don't save UI-only states
        showExplanation: false,
        showAIExplanation: false,
        aiExplanation: undefined,
      }
    })

    const state: SessionState = {
      sessionId,
      currentQuestionIndex: questionIndex,
      questions: questionsObj,
      timeRemaining: timeRemainingValue,
      lastUpdated: Date.now(),
    }

    localStorage.setItem(`${STORAGE_PREFIX}${sessionId}`, JSON.stringify(state))
    console.log(`[TestStore] Saved state for session ${sessionId}`)
  } catch (error) {
    console.error('[TestStore] Failed to save session state:', error)
  }
}

function loadSessionState(sessionId: string): SessionState | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${sessionId}`)
    if (!stored) return null

    const state: SessionState = JSON.parse(stored)

    // Check if state is expired
    if (Date.now() - state.lastUpdated > STATE_EXPIRY_MS) {
      console.log(`[TestStore] Session state expired for ${sessionId}`)
      clearSessionState(sessionId)
      return null
    }

    console.log(`[TestStore] Loaded saved state for session ${sessionId}`)
    return state
  } catch (error) {
    console.error('[TestStore] Failed to load session state:', error)
    return null
  }
}

function clearSessionState(sessionId: string) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${sessionId}`)
    console.log(`[TestStore] Cleared state for session ${sessionId}`)
  } catch (error) {
    console.error('[TestStore] Failed to clear session state:', error)
  }
}

function clearAllExpiredStates() {
  try {
    const keys = Object.keys(localStorage)
    const now = Date.now()

    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key)
          if (stored) {
            const state: SessionState = JSON.parse(stored)
            if (now - state.lastUpdated > STATE_EXPIRY_MS) {
              localStorage.removeItem(key)
              console.log(`[TestStore] Removed expired state: ${key}`)
            }
          }
        } catch (e) {
          // Invalid JSON, remove it
          localStorage.removeItem(key)
        }
      }
    })
  } catch (error) {
    console.error('[TestStore] Failed to clear expired states:', error)
  }
}

export const useTestStore = defineStore('test', () => {
  // Clear expired states on store initialization
  clearAllExpiredStates()

  // State
  const currentSession = ref<TestSession | null>(null)
  const questions = ref<TestQuestionWithDetails[]>([])
  const currentQuestionIndex = ref(0)
  const questionStates = ref<Map<string, QuestionUIState>>(new Map())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Timer state
  const timeRemaining = ref(0) // seconds
  const timerInterval = ref<number | null>(null)
  const isTimerRunning = ref(false)
  const testResult = ref<TestResult | null>(null)

  // Auto-save state to localStorage whenever it changes
  // Debounced to avoid excessive writes
  let saveTimeout: number | null = null

  function debouncedSave() {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    saveTimeout = window.setTimeout(() => {
      if (currentSession.value?.id) {
        saveSessionState(currentSession.value.id, currentQuestionIndex.value, questionStates.value, timeRemaining.value)
      }
    }, 500) // Save 500ms after last change
  }

  // Watch for changes to auto-save (including timer every 10 seconds)
  watch([currentQuestionIndex, questionStates], () => {
    debouncedSave()
  }, { deep: true })

  // Save timer periodically (every 10 seconds) to track time spent
  let timerSaveInterval: number | null = null
  watch(isTimerRunning, (running) => {
    if (running) {
      timerSaveInterval = window.setInterval(() => {
        debouncedSave()
      }, 10000) // Save every 10 seconds while timer is running
    } else {
      if (timerSaveInterval) {
        clearInterval(timerSaveInterval)
        timerSaveInterval = null
      }
    }
  })

  // Computed
  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

  const currentQuestionState = computed(() => {
    if (!currentQuestion.value) return null
    const key = currentQuestion.value.id

    console.log('[TestStore] currentQuestionState accessed with key:', key, 'Type:', typeof key)
    console.log('[TestStore] questionStates.has(key):', questionStates.value.has(key))
    console.log('[TestStore] Available keys:', Array.from(questionStates.value.keys()).map(k => ({ key: k, type: typeof k })))

    if (!questionStates.value.has(key)) {
      console.warn('[TestStore] ⚠️ State not found! Creating default state - selected answer will be lost!')
      console.warn('[TestStore] This means key type mismatch or state not initialized')

      questionStates.value.set(key, {
        selectedOption: undefined,
        eliminatedOptions: [],
        isAnswered: false,
        showExplanation: false,
        showAIExplanation: false,
        isMarkedForReview: false,
        timeSpent: 0,
      })
    }

    const state = questionStates.value.get(key)!
    console.log('[TestStore] Returning state:', { selectedOption: state.selectedOption, isAnswered: state.isAnswered })
    return state
  })

  const totalQuestions = computed(() => questions.value.length)

  const answeredCount = computed(() => {
    return Array.from(questionStates.value.values()).filter(s => s.isAnswered).length
  })

  const markedCount = computed(() => {
    return Array.from(questionStates.value.values()).filter(s => s.isMarkedForReview).length
  })

  const progress = computed(() => {
    if (totalQuestions.value === 0) return 0
    return (answeredCount.value / totalQuestions.value) * 100
  })

  const timerStatus = computed(() => {
    if (!currentSession.value) return 'safe'
    const percentage = (timeRemaining.value / (currentSession.value.time_limit_minutes * 60)) * 100
    if (percentage > 50) return 'safe'
    if (percentage > 20) return 'warning'
    return 'danger'
  })

  const canGoNext = computed(() => currentQuestionIndex.value < totalQuestions.value - 1)
  const canGoPrevious = computed(() => currentQuestionIndex.value > 0)

  // Actions
  async function createTest(request: CreateTestRequest) {
    try {
      isLoading.value = true
      error.value = null

      const session = await api.createTest(request)
      await loadTestSession(session.id)

      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to create test'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function startQuickTest(type: 'full' | 'topic' | 'practice' | 'weak' | 'ai', topic?: TopicId) {
    try {
      isLoading.value = true
      error.value = null

      let session: TestSession

      switch (type) {
        case 'full':
          session = await api.startFullLengthTest()
          break
        case 'topic':
          if (!topic) throw new Error('Topic required for topic test')
          session = await api.startTopicTest(topic)
          break
        case 'practice':
          session = await api.startQuickPractice()
          break
        case 'weak':
          session = await api.startWeakAreaTest()
          break
        case 'ai':
          if (!topic) throw new Error('Topic required for AI test')
          session = await api.startAIGeneratedTest(topic)
          break
        default:
          throw new Error('Invalid test type')
      }

      await loadTestSession(session.id)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to start test'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function loadTestSession(sessionId: string) {
    try {
      isLoading.value = true
      error.value = null

      console.log('[TestStore] Loading session:', sessionId)

      // Fetch the test session
      const session = await api.getTestSession(sessionId)
      console.log('[TestStore] Session loaded:', session)
      console.log('[TestStore] Session type:', typeof session)
      console.log('[TestStore] Session keys:', Object.keys(session))

      currentSession.value = session

      // The backend should return questions with the session
      // If session has a questions property, use it
      if ((session as any).questions && Array.isArray((session as any).questions)) {
        const rawQuestion = (session as any).questions[0]
        console.log('[TestStore] Raw question from backend:', rawQuestion)
        console.log('[TestStore] Question keys:', Object.keys(rawQuestion))
        console.log('[TestStore] question.id:', rawQuestion.id)
        console.log('[TestStore] question.test_question_id:', rawQuestion.test_question_id)

        // Transform backend flat format to frontend nested format
        questions.value = (session as any).questions.map((q: any) => {
          // The backend GET /session returns questions differently than POST /create
          // GET /session includes test_question_id at the root level
          const questionId = q.id  // This is the DB question ID
          const testQuestionId = q.test_question_id  // This is the UUID from test_questions table

          console.log('[TestStore] Mapping question:', {
            questionId,
            questionIdType: typeof questionId,
            testQuestionId,
            order: q.order,
            user_answer: q.user_answer
          })

          return {
            id: questionId,
            test_question_id: testQuestionId,
            question_order: q.order || q.question_order,
            is_ai_generated: q.is_ai_generated || false,
            user_answer: q.user_answer,
            is_bookmarked: q.is_bookmarked || false,
            // Nested question object for frontend compatibility
            question: {
              id: questionId,  // DB question ID
              question_text_en: q.question_text_en,
              question_text_hi: q.question_text_hi,
              options_en: q.options_en,
              options_hi: q.options_hi,
              context_text_en: q.context_text_en,
              context_text_hi: q.context_text_hi,
              correct_answer: q.correct_answer,
              explanation_en: q.explanation_en,
              explanation_hi: q.explanation_hi,
              standardized_topic: q.standardized_topic || q.topic,
              has_image: q.has_image || false,
              visual_description: q.visual_description,
              exam_year: q.exam_year,
              difficulty_level: q.difficulty_level
            }
          }
        })
        console.log('[TestStore] Loaded', questions.value.length, 'questions')
        console.log('[TestStore] First transformed question:', questions.value[0])
      } else {
        // If no questions in session, we need to handle this
        console.error('[TestStore] No questions found in session response!')
        console.error('[TestStore] Session data:', JSON.stringify(session, null, 2))
        questions.value = []
      }

      // Load saved state from localStorage for this session
      const savedState = loadSessionState(sessionId)

      // Initialize timer
      const timeLimitMinutes = session.time_limit_minutes || 30
      timeRemaining.value = timeLimitMinutes * 60

      // Restore time from localStorage if available (most recent), otherwise from backend
      if (savedState?.timeRemaining !== undefined) {
        timeRemaining.value = savedState.timeRemaining
        console.log('[TestStore] Restored timer from localStorage:', savedState.timeRemaining)
      } else if (session.time_spent_seconds || session.time_taken_seconds) {
        timeRemaining.value -= (session.time_spent_seconds || session.time_taken_seconds || 0)
        console.log('[TestStore] Calculated timer from backend time_spent_seconds')
      }

      // Reset question index to saved position or start from first unanswered
      currentQuestionIndex.value = 0
      questionStates.value.clear()

      // Initialize question states for all questions
      // IMPORTANT: Restore user's previous answers and UI state for in-progress tests
      let firstUnansweredIndex = -1

      questions.value.forEach((q, index) => {
        const questionId = q.id
        const savedQuestionState = savedState?.questions?.[questionId]

        // Check if user has already answered this question (from backend)
        const hasUserAnswer = q.user_answer !== null && q.user_answer !== undefined

        console.log(`[TestStore] Initializing question ${index + 1}:`, {
          questionId,
          user_answer: q.user_answer,
          hasUserAnswer,
          savedQuestionState
        })

        // Initialize state with saved or default values
        const state: QuestionUIState = {
          selectedOption: hasUserAnswer ? q.user_answer : (savedQuestionState?.selectedOption || undefined),
          eliminatedOptions: savedQuestionState?.eliminatedOptions || [],
          isAnswered: hasUserAnswer || (savedQuestionState?.isAnswered || false),
          showExplanation: false, // Never restore this, always start fresh
          showAIExplanation: false, // Never restore this
          isMarkedForReview: savedQuestionState?.isMarkedForReview || false,
          timeSpent: savedQuestionState?.timeSpent || 0,
          aiExplanation: undefined, // Don't persist AI explanations
        }

        console.log(`[TestStore] State for question ${index + 1}:`, state)
        console.log(`[TestStore] Storing state with key:`, questionId, 'Type:', typeof questionId)

        questionStates.value.set(questionId, state)

        // Track first unanswered question
        if (firstUnansweredIndex === -1 && !state.isAnswered) {
          firstUnansweredIndex = index
        }
      })

      // Restore current question index (go to last viewed or first unanswered)
      if (savedState?.currentQuestionIndex !== undefined && savedState.currentQuestionIndex < questions.value.length) {
        currentQuestionIndex.value = savedState.currentQuestionIndex
      } else if (firstUnansweredIndex !== -1) {
        currentQuestionIndex.value = firstUnansweredIndex
      }

      console.log(`Loaded session ${sessionId} with ${questions.value.length} questions`)
      console.log(`Restored ${Array.from(questionStates.value.values()).filter(s => s.isAnswered).length} answered questions`)
      console.log(`Starting at question ${currentQuestionIndex.value + 1}`)

      return true
    } catch (err: any) {
      console.error('Error loading test session:', err)
      error.value = err.response?.data?.detail || err.message || 'Failed to load test session'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function startTimer() {
    if (isTimerRunning.value) return

    isTimerRunning.value = true
    timerInterval.value = window.setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--

        // Auto-submit when time runs out
        if (timeRemaining.value === 0) {
          stopTimer()
          submitTest()
        }
      }
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
    isTimerRunning.value = false
  }

  function pauseTimer() {
    stopTimer()
  }

  function resumeTimer() {
    startTimer()
  }

  function selectOption(option: string) {
    if (!currentQuestionState.value) return

    const settingsStore = useSettingsStore()
    settingsStore.triggerHaptic('light')

    currentQuestionState.value.selectedOption = option
    currentQuestionState.value.isAnswered = true

    // Immediately save to localStorage
    debouncedSave()

    // ALWAYS save to backend for in-progress tests to be resumable
    // This ensures answers persist across browser sessions
    saveAnswer(option)
  }

  function toggleElimination(option: string) {
    if (!currentQuestionState.value) return

    const eliminated = currentQuestionState.value.eliminatedOptions
    const index = eliminated.indexOf(option)

    if (index > -1) {
      eliminated.splice(index, 1)
    } else {
      eliminated.push(option)
    }

    const settingsStore = useSettingsStore()
    settingsStore.triggerHaptic('light')

    // Save to localStorage
    debouncedSave()
  }

  function toggleReviewMark() {
    if (!currentQuestionState.value) return

    currentQuestionState.value.isMarkedForReview = !currentQuestionState.value.isMarkedForReview

    const settingsStore = useSettingsStore()
    settingsStore.triggerHaptic('medium')

    // Save to localStorage
    debouncedSave()
  }

  function toggleExplanation() {
    if (!currentQuestionState.value) return
    currentQuestionState.value.showExplanation = !currentQuestionState.value.showExplanation
  }

  async function getAIExplanation(mode: 'eli5' | 'detailed' | 'hindi' = 'eli5') {
    if (!currentQuestion.value || !currentQuestionState.value) return

    try {
      const explanation = await api.getAIExplanation({
        question_id: currentQuestion.value.question.id,
        mode,
      })

      currentQuestionState.value.aiExplanation = explanation
      currentQuestionState.value.showAIExplanation = true
    } catch (err: any) {
      console.error('Failed to get AI explanation:', err)
    }
  }

  async function saveAnswer(answer: string) {
    if (!currentSession.value || !currentQuestion.value) return

    try {
      // Backend expects: question_id (int), test_question_id (str), answer (str), time_spent_seconds (int)
      const payload = {
        question_id: Number(currentQuestion.value.question.id),  // Convert to int
        test_question_id: (currentQuestion.value as any).test_question_id || currentQuestion.value.id,
        answer: answer.toUpperCase(),  // Ensure uppercase (A, B, C, D)
        time_spent_seconds: Math.floor(currentQuestionState.value?.timeSpent || 0),
      }

      console.log('[TestStore] Submitting answer:', payload)
      console.log('[TestStore] Current question:', currentQuestion.value)

      await api.submitAnswer(currentSession.value.id, payload)
      console.log('[TestStore] Answer saved successfully')
    } catch (err: any) {
      console.error('[TestStore] Failed to save answer:', err)
      console.error('[TestStore] Error response:', err.response?.data)
      console.error('[TestStore] Error status:', err.response?.status)
    }
  }

  function goToQuestion(index: number) {
    if (index >= 0 && index < totalQuestions.value) {
      currentQuestionIndex.value = index
    }
  }

  function nextQuestion() {
    if (canGoNext.value) {
      currentQuestionIndex.value++
    }
  }

  function previousQuestion() {
    if (canGoPrevious.value) {
      currentQuestionIndex.value--
    }
  }

  function goToFirstUnanswered() {
    const index = questions.value.findIndex((q) => {
      const state = questionStates.value.get(q.id)
      return !state?.isAnswered
    })
    if (index !== -1) {
      currentQuestionIndex.value = index
    }
  }

  function goToNextMarked() {
    const startIndex = currentQuestionIndex.value + 1
    for (let i = startIndex; i < questions.value.length; i++) {
      const q = questions.value[i]
      if (!q) continue
      const state = questionStates.value.get(q.id)
      if (state?.isMarkedForReview) {
        currentQuestionIndex.value = i
        return
      }
    }
    // Wrap around
    for (let i = 0; i < startIndex; i++) {
      const q = questions.value[i]
      if (!q) continue
      const state = questionStates.value.get(q.id)
      if (state?.isMarkedForReview) {
        currentQuestionIndex.value = i
        return
      }
    }
  }

  async function submitTest(): Promise<TestResult | null> {
    if (!currentSession.value) return null

    try {
      stopTimer()
      isLoading.value = true

      const sessionId = currentSession.value.id
      const result = await api.submitTest(sessionId)

      // Clear localStorage after successful submit
      clearSessionState(sessionId)

      const settingsStore = useSettingsStore()
      settingsStore.playSound('complete')
      settingsStore.triggerHaptic('heavy')

      return result
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to submit test'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function abandonTest() {
    if (!currentSession.value) return false

    try {
      stopTimer()
      const sessionId = currentSession.value.id
      await api.abandonTest(sessionId)

      // Clear localStorage after abandoning
      clearSessionState(sessionId)

      clearTest()
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to abandon test'
      return false
    }
  }

  async function getTestResult(sessionId: string) {
    try {
      isLoading.value = true
      error.value = null
      const result = await api.getTestResult(sessionId)
      testResult.value = result
      return result
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load test result'
      return null
    } finally {
      isLoading.value = false
    }
  }

  function clearTest() {
    currentSession.value = null
    questions.value = []
    currentQuestionIndex.value = 0
    questionStates.value.clear()
    stopTimer()
    timeRemaining.value = 0
    error.value = null
    testResult.value = null
  }

  // Format time as MM:SS
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    // State
    currentSession,
    questions,
    currentQuestionIndex,
    questionStates,
    isLoading,
    error,
    timeRemaining,
    isTimerRunning,
    testResult,

    // Computed
    currentQuestion,
    currentQuestionState,
    totalQuestions,
    answeredCount,
    markedCount,
    progress,
    timerStatus,
    canGoNext,
    canGoPrevious,

    // Actions
    createTest,
    startQuickTest,
    loadTestSession,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    selectOption,
    toggleElimination,
    toggleReviewMark,
    toggleExplanation,
    getAIExplanation,
    saveAnswer,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    goToFirstUnanswered,
    goToNextMarked,
    submitTest,
    abandonTest,
    getTestResult,
    clearTest,
    formatTime,
  }
})
