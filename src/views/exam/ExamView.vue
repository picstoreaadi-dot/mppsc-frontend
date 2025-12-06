<template>
  <div class="fullscreen no-select">
    <!-- Timer Bar - Sticky Top -->
    <div class="timer" :class="timerClass">
      <div class="flex items-center justify-center gap-4">
        <Clock class="w-6 h-6" />
        <span>{{ formatTime(timeRemaining) }}</span>
        <button
          @click="togglePalette"
          class="ml-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium"
        >
          Questions
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div
      class="px-4 md:px-8 pt-24 pb-8 overflow-y-auto"
      style="height: calc(100vh - 80px)"
    >
      <div class="max-w-4xl mx-auto">
        <!-- Question Card -->
        <div v-if="currentQuestion" class="bg-white dark:bg-dark-surface rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <!-- Question Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <span class="text-sm font-semibold text-primary-500">
                Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}
              </span>
              <span class="topic-badge bg-passive-100 text-passive-700 dark:bg-passive-800 dark:text-passive-300">
                {{ topicName }}
              </span>
            </div>
            <button
              @click="toggleReviewMark"
              class="p-2 rounded-lg hover:bg-passive-100 dark:hover:bg-passive-800 transition-colors"
              :class="currentQuestionState?.isMarkedForReview ? 'text-attention-500' : 'text-passive-400'"
            >
              <Flag class="w-5 h-5" :fill="currentQuestionState?.isMarkedForReview ? 'currentColor' : 'none'" />
            </button>
          </div>

          <!-- Question Text -->
          <div
            class="text-xl mb-8 text-passive-900 dark:text-dark-text leading-relaxed"
            :class="language === 'hi' ? 'hindi' : ''"
          >
            {{ questionText }}
          </div>

          <!-- Options -->
          <div class="space-y-4">
            <button
              v-for="(option, index) in options"
              :key="index"
              class="option-btn relative group"
              :class="{
                selected: currentQuestionState?.selectedOption === option,
                eliminated: currentQuestionState?.eliminatedOptions.includes(option),
              }"
              @click="selectOption(option)"
              @contextmenu.prevent="toggleElimination(option)"
            >
              <div class="flex items-center gap-4">
                <span class="flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg">
                  {{ ['A', 'B', 'C', 'D'][index] }}
                </span>
                <span class="flex-1 text-left text-lg" :class="language === 'hi' ? 'hindi' : ''">
                  {{ option }}
                </span>
              </div>

              <!-- Elimination hint on hover (desktop) -->
              <div class="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-passive-500">
                Right-click to eliminate
              </div>
            </button>
          </div>

          <!-- Elimination Instructions (Mobile) -->
          <div class="mt-6 p-4 bg-passive-50 dark:bg-passive-800/50 rounded-lg text-sm text-passive-600 dark:text-passive-400">
            💡 Tip: Long-press an option to cross it out (elimination mode)
          </div>
        </div>

        <!-- Navigation Controls -->
        <div class="flex items-center justify-between gap-4 mb-4">
          <button
            @click="previousQuestion"
            :disabled="!canGoPrevious"
            class="px-6 py-3 rounded-xl bg-white dark:bg-dark-surface shadow-md disabled:opacity-40 hover:shadow-lg transition-all flex items-center gap-2"
          >
            <ChevronLeft class="w-5 h-5" />
            Previous
          </button>

          <button
            @click="toggleReviewMark"
            class="px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
            :class="currentQuestionState?.isMarkedForReview
              ? 'bg-attention-500 text-white shadow-lg'
              : 'bg-white dark:bg-dark-surface text-passive-700 dark:text-passive-300 shadow-md'"
          >
            <Flag class="w-5 h-5" :fill="currentQuestionState?.isMarkedForReview ? 'currentColor' : 'none'" />
            {{ currentQuestionState?.isMarkedForReview ? 'Marked' : 'Mark' }}
          </button>

          <button
            @click="nextQuestion"
            :disabled="!canGoNext"
            class="px-6 py-3 rounded-xl bg-primary-500 text-white shadow-md disabled:opacity-40 hover:bg-primary-600 hover:shadow-lg transition-all flex items-center gap-2"
          >
            Next
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>

        <!-- Quick Actions -->
        <div class="flex items-center justify-center gap-4 text-sm">
          <button
            @click="goToFirstUnanswered"
            class="px-4 py-2 rounded-lg bg-white dark:bg-dark-surface text-passive-700 dark:text-passive-300 shadow hover:shadow-md transition-all"
          >
            Jump to Unanswered
          </button>
          <button
            @click="goToNextMarked"
            class="px-4 py-2 rounded-lg bg-white dark:bg-dark-surface text-attention-600 shadow hover:shadow-md transition-all"
          >
            Next Marked
          </button>
        </div>

        <!-- Submit Button (Fixed at bottom on mobile) -->
        <div class="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-paper-white dark:from-dark-bg to-transparent md:relative md:mt-8">
          <button
            @click="confirmSubmit"
            class="w-full py-4 rounded-xl bg-success-500 text-white font-bold text-lg hover:bg-success-600 active:scale-98 transition-all shadow-xl"
          >
            Submit Exam
          </button>
          <p class="text-center text-sm text-passive-600 dark:text-passive-400 mt-2">
            {{ answeredCount }}/{{ totalQuestions }} answered • {{ markedCount }} marked for review
          </p>
        </div>
      </div>
    </div>

    <!-- Question Palette Drawer -->
    <div
      class="palette-drawer"
      :class="{ closed: !isPaletteOpen }"
    >
      <div class="sticky top-0 bg-white dark:bg-dark-surface p-4 border-b border-passive-200 dark:border-passive-700 flex items-center justify-between">
        <h3 class="font-bold text-lg">Question Palette</h3>
        <button
          @click="closePalette"
          class="p-2 rounded-lg hover:bg-passive-100 dark:hover:bg-passive-800"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-4">
        <!-- Legend -->
        <div class="mb-6 space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full border-2 border-passive-300 bg-white dark:border-passive-700 dark:bg-dark-surface"></div>
            <span>Not Visited</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full border-2 border-primary-500 bg-primary-500 text-white flex items-center justify-center font-semibold">1</div>
            <span>Answered</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full border-2 border-attention-500 bg-attention-100 dark:bg-attention-900/20 flex items-center justify-center">
              <Flag class="w-4 h-4 text-attention-500" />
            </div>
            <span>Marked for Review</span>
          </div>
        </div>

        <!-- Question Grid -->
        <div class="grid grid-cols-5 gap-3">
          <button
            v-for="(_question, index) in questions"
            :key="index"
            @click="goToQuestion(index)"
            class="palette-dot"
            :class="getPaletteDotClass(index)"
          >
            <template v-if="getQuestionState(index)?.isMarkedForReview">
              <Flag class="w-4 h-4" />
            </template>
            <template v-else-if="getQuestionState(index)?.isAnswered">
              {{ index + 1 }}
            </template>
          </button>
        </div>
      </div>
    </div>

    <!-- Palette Backdrop -->
    <div
      v-if="isPaletteOpen"
      class="fixed inset-0 bg-black/50 z-30"
      @click="closePalette"
    ></div>

    <!-- Confirm Submit Modal -->
    <div
      v-if="showSubmitModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="showSubmitModal = false"
    >
      <div
        class="bg-white dark:bg-dark-surface rounded-2xl p-6 max-w-md w-full shadow-2xl"
        @click.stop
      >
        <h3 class="text-xl font-bold mb-4 text-passive-900 dark:text-dark-text">
          Submit Exam?
        </h3>
        <p class="text-passive-600 dark:text-passive-400 mb-6">
          You have answered {{ answeredCount }} out of {{ totalQuestions }} questions.
          <span v-if="totalQuestions - answeredCount > 0" class="text-danger-500 font-semibold">
            {{ totalQuestions - answeredCount }} questions are unanswered.
          </span>
        </p>
        <div class="flex gap-3">
          <button
            @click="showSubmitModal = false"
            class="flex-1 py-3 rounded-xl bg-passive-100 dark:bg-passive-800 text-passive-700 dark:text-passive-300 font-semibold"
          >
            Cancel
          </button>
          <button
            @click="submitExam"
            class="flex-1 py-3 rounded-xl bg-success-500 text-white font-semibold hover:bg-success-600"
          >
            Yes, Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-vue-next'

import { useTestStore } from '@/stores/test'
import { useSettingsStore } from '@/stores/settings'
import { TOPICS } from '@/types'

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
  answeredCount,
  markedCount,
  canGoNext,
  canGoPrevious,
  timeRemaining,
  timerStatus,
  questions,
  questionStates,
} = storeToRefs(testStore)

const isPaletteOpen = ref(false)
const showSubmitModal = ref(false)

onMounted(async () => {
  const sessionId = route.params.sessionId as string
  await testStore.loadTestSession(sessionId)
  testStore.startTimer()
})

onUnmounted(() => {
  testStore.pauseTimer()
})

const timerClass = computed(() => timerStatus.value)

const questionText = computed(() => {
  if (!currentQuestion.value) return ''
  return language.value === 'hi'
    ? currentQuestion.value.question.question_text_hi
    : currentQuestion.value.question.question_text_en
})

const options = computed(() => {
  if (!currentQuestion.value) return []
  return language.value === 'hi'
    ? currentQuestion.value.question.options_hi
    : currentQuestion.value.question.options_en
})

const topicName = computed(() => {
  if (!currentQuestion.value) return ''
  const topic = TOPICS.find(t => t.id === currentQuestion.value!.question.standardized_topic)
  return language.value === 'hi' ? topic?.name_hi : topic?.name_en
})

function selectOption(option: string) {
  testStore.selectOption(option)
}

function toggleElimination(option: string) {
  testStore.toggleElimination(option)
  settingsStore.triggerHaptic('light')
}

function toggleReviewMark() {
  testStore.toggleReviewMark()
}

function nextQuestion() {
  testStore.nextQuestion()
  settingsStore.triggerHaptic('light')
}

function previousQuestion() {
  testStore.previousQuestion()
  settingsStore.triggerHaptic('light')
}

function goToQuestion(index: number) {
  testStore.goToQuestion(index)
  closePalette()
  settingsStore.triggerHaptic('light')
}

function goToFirstUnanswered() {
  testStore.goToFirstUnanswered()
  settingsStore.triggerHaptic('medium')
}

function goToNextMarked() {
  testStore.goToNextMarked()
  settingsStore.triggerHaptic('medium')
}

function togglePalette() {
  isPaletteOpen.value = !isPaletteOpen.value
}

function closePalette() {
  isPaletteOpen.value = false
}

function confirmSubmit() {
  showSubmitModal.value = true
}

async function submitExam() {
  showSubmitModal.value = false
  const result = await testStore.submitTest()
  if (result) {
    router.push(`/exam/${testStore.currentSession?.id}/result`)
  }
}

function getQuestionState(index: number) {
  const question = questions.value[index]
  if (!question) return null
  return questionStates.value.get(question.id)
}

function getPaletteDotClass(index: number) {
  const state = getQuestionState(index)
  const isCurrent = index === currentQuestionIndex.value

  const classes = []

  if (isCurrent) {
    classes.push('current')
  }

  if (state?.isMarkedForReview) {
    classes.push('marked')
  } else if (state?.isAnswered) {
    classes.push('answered')
  } else {
    classes.push('unanswered')
  }

  return classes.join(' ')
}

function formatTime(seconds: number): string {
  return testStore.formatTime(seconds)
}
</script>
