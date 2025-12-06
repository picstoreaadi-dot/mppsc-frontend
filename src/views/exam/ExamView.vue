<template>
  <div class="flex flex-col h-[100dvh] bg-passive-50 dark:bg-dark-bg text-passive-900 dark:text-dark-text no-select overflow-hidden">
    <!-- Header - Fixed Top -->
    <header class="h-16 bg-white dark:bg-dark-surface shadow-sm z-20 flex items-center justify-between px-4 flex-none">
      <div class="flex items-center gap-3">
        <!-- Timer -->
        <div 
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-medium text-sm transition-colors"
          :class="{
            'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400': timerStatus === 'safe',
            'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400': timerStatus === 'warning',
            'bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400': timerStatus === 'danger',
          }"
        >
          <Clock class="w-4 h-4" />
          <span>{{ formatTime(timeRemaining) }}</span>
        </div>
      </div>

      <!-- Center Info (Hidden on small mobile) -->
      <div class="hidden sm:flex flex-col items-center">
        <span class="text-xs font-semibold text-passive-500 uppercase tracking-wider">
          Question {{ currentQuestionIndex + 1 }} / {{ totalQuestions }}
        </span>
      </div>

      <div class="flex items-center gap-2">
         <!-- Submit Button (Header) -->
        <button
          @click="confirmSubmit"
          class="px-3 py-1.5 rounded-lg bg-success-500 text-white text-xs font-bold hover:bg-success-600 transition-colors shadow-sm"
        >
          Finish
        </button>

        <!-- Palette Toggle -->
        <button
          @click="togglePalette"
          class="p-2 rounded-lg bg-passive-100 dark:bg-passive-800 text-passive-600 dark:text-passive-400 hover:bg-passive-200 dark:hover:bg-passive-700 transition-colors"
        >
          <div class="grid grid-cols-3 gap-0.5 w-5 h-5">
            <div v-for="i in 9" :key="i" class="bg-current rounded-sm w-1 h-1"></div>
          </div>
        </button>
      </div>
    </header>

    <!-- Main Content - Scrollable -->
    <main class="flex-1 overflow-y-auto overflow-x-hidden relative w-full">
      <div class="max-w-3xl mx-auto p-4 pb-24 min-h-full flex flex-col">
        <!-- Question Card -->
        <div v-if="currentQuestion" class="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-passive-200 dark:border-passive-800 p-5 md:p-8 flex-1 flex flex-col">
          
          <!-- Question Meta -->
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-passive-100 dark:border-passive-800/50">
            <span class="text-xs font-bold text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded">
              Q. {{ currentQuestionIndex + 1 }}
            </span>
            <span class="text-xs font-medium text-passive-500 truncate max-w-[150px]">
              {{ topicName }}
            </span>
          </div>

          <!-- Question Text -->
          <div
            class="text-lg md:text-xl font-medium mb-8 leading-relaxed text-passive-900 dark:text-dark-text"
            :class="language === 'hi' ? 'font-hindi' : ''"
          >
            {{ questionText }}
          </div>

          <!-- Options -->
          <div class="space-y-3 mt-auto">
            <button
              v-for="(option, index) in options"
              :key="index"
              class="w-full relative group transition-all duration-200 active:scale-[0.99] outline-none"
              :disabled="false" 
              @click="selectOption(option)"
              @contextmenu.prevent="toggleElimination(option)"
            >
              <div 
                class="flex items-start gap-4 p-4 rounded-xl border-2 text-left"
                :class="getOptionClasses(option)"
              >
                <!-- Option Letter -->
                <span 
                  class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors mt-0.5"
                  :class="getOptionLetterClasses(option)"
                >
                  {{ ['A', 'B', 'C', 'D'][index] }}
                </span>

                <!-- Option Text -->
                <span 
                  class="flex-1 text-base leading-snug"
                  :class="[
                    language === 'hi' ? 'font-hindi' : '',
                    currentQuestionState?.eliminatedOptions.includes(option) ? 'opacity-50 line-through decoration-2' : ''
                  ]"
                >
                  {{ option }}
                </span>
              </div>
            </button>
          </div>
          
           <!-- Mobile Hint -->
          <div class="mt-6 text-center text-xs text-passive-400 dark:text-passive-600">
             Long press option to eliminate
          </div>

        </div>
      </div>
    </main>

    <!-- Footer - Navigation - Fixed Bottom -->
    <footer class="h-16 bg-white dark:bg-dark-surface border-t border-passive-200 dark:border-passive-800 flex items-center justify-between px-4 z-20 flex-none gap-4">
      
      <button
        @click="previousQuestion"
        :disabled="!canGoPrevious"
        class="flex-1 h-10 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold bg-passive-100 dark:bg-passive-800 text-passive-700 dark:text-passive-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:bg-passive-200"
      >
        <ChevronLeft class="w-4 h-4" />
        <span class="hidden sm:inline">Prev</span>
      </button>

      <button
        @click="toggleReviewMark"
        class="flex-none h-10 w-10 rounded-full flex items-center justify-center transition-colors"
        :class="currentQuestionState?.isMarkedForReview 
          ? 'bg-attention-100 text-attention-600 dark:bg-attention-900/30' 
          : 'bg-transparent text-passive-400 hover:bg-passive-100 dark:hover:bg-passive-800'"
      >
        <Flag class="w-5 h-5" :fill="currentQuestionState?.isMarkedForReview ? 'currentColor' : 'none'" />
      </button>

      <button
        @click="nextQuestion"
        :disabled="!canGoNext"
        class="flex-1 h-10 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold bg-primary-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:bg-primary-600 active:bg-primary-700 transition-colors"
      >
        <span class="hidden sm:inline">Next</span>
        <ChevronRight class="w-4 h-4" />
      </button>

    </footer>

    <!-- Palette Drawer -->
    <div
      class="fixed inset-y-0 right-0 w-80 bg-white dark:bg-dark-surface shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
      :class="isPaletteOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="p-4 border-b border-passive-200 dark:border-passive-700 flex items-center justify-between bg-passive-50 dark:bg-dark-bg/50">
        <h3 class="font-bold text-lg">Question Palette</h3>
        <button
          @click="closePalette"
          class="p-2 rounded-lg hover:bg-passive-200 dark:hover:bg-passive-700 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <!-- Legend -->
        <div class="grid grid-cols-2 gap-3 mb-6 text-xs text-passive-600 dark:text-passive-400 p-3 bg-passive-50 dark:bg-passive-900/50 rounded-xl">
           <div class="flex items-center gap-2">
             <div class="w-3 h-3 rounded-full bg-success-500"></div> Answered
           </div>
           <div class="flex items-center gap-2">
             <div class="w-3 h-3 rounded-full bg-attention-500"></div> Marked
           </div>
           <div class="flex items-center gap-2">
             <div class="w-3 h-3 rounded-full border border-passive-400"></div> Not Visited
           </div>
           <div class="flex items-center gap-2">
             <div class="w-3 h-3 rounded-full bg-primary-500"></div> Current
           </div>
        </div>

        <div class="grid grid-cols-5 gap-3">
          <button
            v-for="(_question, index) in questions"
            :key="index"
            @click="goToQuestion(index)"
            class="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-all relative"
            :class="getPaletteDotClass(index)"
          >
            <Flag v-if="getQuestionState(index)?.isMarkedForReview" class="w-3 h-3 absolute top-1 right-1" fill="currentColor" />
            {{ index + 1 }}
          </button>
        </div>
      </div>
      
      <!-- Quick Actions in Palette -->
      <div class="p-4 border-t border-passive-200 dark:border-passive-700 grid grid-cols-2 gap-3 bg-passive-50 dark:bg-dark-bg/50">
          <button @click="goToFirstUnanswered" class="text-xs font-medium text-passive-600 hover:text-primary-500 py-2">
             Unanswered
          </button>
          <button @click="goToNextMarked" class="text-xs font-medium text-passive-600 hover:text-primary-500 py-2">
             Next Marked
          </button>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="isPaletteOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
      @click="closePalette"
    ></div>

    <!-- Submit Modal -->
    <div
      v-if="showSubmitModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showSubmitModal = false"></div>
      <div class="bg-white dark:bg-dark-surface rounded-2xl w-full max-w-sm p-6 relative z-10 shadow-2xl transform transition-all scale-100">
        
        <h3 class="text-xl font-bold mb-2 text-center">Ready to Submit?</h3>
        
        <div class="py-6 flex justify-center gap-8 text-center">
            <div>
               <div class="text-3xl font-bold text-success-500">{{ answeredCount }}</div>
               <div class="text-xs text-passive-500 font-medium uppercase tracking-wide mt-1">Answered</div>
            </div>
            <div>
               <div class="text-3xl font-bold text-passive-400">{{ totalQuestions - answeredCount }}</div>
               <div class="text-xs text-passive-500 font-medium uppercase tracking-wide mt-1">Left</div>
            </div>
             <div>
               <div class="text-3xl font-bold text-attention-500">{{ markedCount }}</div>
               <div class="text-xs text-passive-500 font-medium uppercase tracking-wide mt-1">Marked</div>
            </div>
        </div>

        <p v-if="totalQuestions - answeredCount > 0" class="text-center text-sm text-danger-500 mb-6 bg-danger-50 dark:bg-danger-900/20 py-2 rounded-lg">
           You have unanswered questions!
        </p>

        <div class="grid grid-cols-2 gap-4">
          <button
            @click="showSubmitModal = false"
            class="py-3 rounded-xl font-semibold text-passive-600 bg-passive-100 hover:bg-passive-200 dark:bg-passive-800 dark:text-passive-300 transition-colors"
          >
            Keep Taking
          </button>
          <button
            @click="submitExam"
            class="py-3 rounded-xl font-bold text-white bg-success-500 hover:bg-success-600 shadow-lg shadow-success-500/20 transition-all active:scale-[0.98]"
          >
            Submit Now
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
  // CRITICAL FIX: Pass current question ID to prevent ghost clicks on transition
  if (currentQuestion.value) {
    testStore.selectOption(currentQuestion.value.id, option)
  }
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
  closePalette()
}

function goToNextMarked() {
  testStore.goToNextMarked()
  settingsStore.triggerHaptic('medium')
  closePalette()
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

function getOptionClasses(option: string) {
  const isSelected = currentQuestionState.value?.selectedOption === option
  const isEliminated = currentQuestionState.value?.eliminatedOptions.includes(option)
  
  if (isEliminated) {
    return 'border-passive-200 dark:border-passive-800 bg-passive-50 dark:bg-passive-900/30 text-passive-400'
  }
  
  if (isSelected) {
    return 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100 shadow-sm'
  }
  
  return 'border-passive-200 dark:border-passive-700 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-passive-50 dark:hover:bg-passive-800/50 bg-white dark:bg-dark-surface'
}

function getOptionLetterClasses(option: string) {
  const isSelected = currentQuestionState.value?.selectedOption === option
  const isEliminated = currentQuestionState.value?.eliminatedOptions.includes(option)
  
  if (isEliminated) {
    return 'bg-passive-200 dark:bg-passive-800 text-passive-500'
  }
  
  if (isSelected) {
    return 'bg-primary-500 text-white'
  }
  
  return 'bg-passive-100 dark:bg-passive-800 text-passive-600 dark:text-passive-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 group-hover:text-primary-600'
}

function getPaletteDotClass(index: number) {
  const state = getQuestionState(index)
  const isCurrent = index === currentQuestionIndex.value
  
  if (isCurrent) {
    return 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110 border-2 border-white dark:border-dark-bg z-10'
  }
  
  if (state?.isMarkedForReview) {
    return 'bg-attention-100 text-attention-700 dark:bg-attention-900/30 dark:text-attention-400 border border-attention-200 dark:border-attention-800'
  }
  
  if (state?.isAnswered) {
    return 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400 border border-success-200 dark:border-success-800'
  }
  
  return 'bg-passive-100 dark:bg-passive-800 text-passive-500 border border-transparent'
}

function formatTime(seconds: number): string {
  return testStore.formatTime(seconds)
}
</script>

<style scoped>
/* Mobile adjustments */
@media (max-width: 640px) {
  .fullscreen {
    height: 100dvh; /* Dynamic viewport height for mobile browsers */
  }
}
</style>