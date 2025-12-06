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
          <h1 style="font-size: 1.5rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 0.5rem;">
            <Sparkles style="width: 1.5rem; height: 1.5rem; color: #3b82f6;" />
            AI Question Generator
          </h1>
          <div style="width: 2.5rem;"></div>
        </div>
      </div>
    </div>

    <div style="max-width: 48rem; margin: 0 auto; padding: 1.5rem;">
      <!-- Generator Card -->
      <div style="background: #1e293b; border-radius: 1.5rem; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
          <div style="padding: 0.75rem; background: rgba(59, 130, 246, 0.1); border-radius: 0.75rem;">
            <Brain style="width: 1.5rem; height: 1.5rem; color: #3b82f6;" />
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 700; color: white;">Generate Custom Questions</h2>
            <p style="font-size: 0.875rem; color: #94a3b8;">Use AI to create practice questions tailored to your needs</p>
          </div>
        </div>

        <!-- Topic Selection -->
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #e0e0e0; margin-bottom: 0.5rem;">
            Select Topic
          </label>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
            <button
              v-for="topic in topics"
              :key="topic.id"
              @click="selectedTopic = topic.id"
              :style="{
                padding: '0.75rem',
                borderRadius: '0.75rem',
                border: '2px solid',
                borderColor: selectedTopic === topic.id ? '#3b82f6' : '#334155',
                background: selectedTopic === topic.id ? 'rgba(59, 130, 246, 0.1)' : '#0f172a',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }"
            >
              {{ language === 'hi' ? topic.name_hi : topic.name_en }}
            </button>
          </div>
        </div>

        <!-- Number of Questions -->
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #e0e0e0; margin-bottom: 0.5rem;">
            Number of Questions: {{ numQuestions }}
          </label>
          <input
            v-model.number="numQuestions"
            type="range"
            min="1"
            max="10"
            style="width: 100%; accent-color: #3b82f6;"
          />
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <!-- Difficulty Level -->
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #e0e0e0; margin-bottom: 0.5rem;">
            Difficulty Level
          </label>
          <div style="display: flex; gap: 0.5rem;">
            <button
              v-for="level in ['easy', 'medium', 'hard']"
              :key="level"
              @click="difficulty = level"
              :style="{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '0.75rem',
                border: '2px solid',
                borderColor: difficulty === level ? '#3b82f6' : '#334155',
                background: difficulty === level ? 'rgba(59, 130, 246, 0.1)' : '#0f172a',
                color: 'white',
                fontWeight: '600',
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }"
            >
              {{ level }}
            </button>
          </div>
        </div>

        <!-- Keyword Input (Optional) -->
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #e0e0e0; margin-bottom: 0.5rem;">
            {{ language === 'hi' ? 'विशेष कीवर्ड (वैकल्पिक)' : 'Specific Keyword (Optional)' }}
          </label>
          <input
            v-model="keyword"
            :placeholder="language === 'hi' ? 'उदा., संविधान, नदियाँ, अर्थव्यवस्था...' : 'e.g., Constitution, Rivers, Economy...'"
            style="width: 100%; padding: 0.75rem; background: #0f172a; border: 2px solid #334155; border-radius: 0.75rem; color: white; font-size: 0.875rem;"
            @focus="($event.target as HTMLElement).style.borderColor = '#3b82f6'"
            @blur="($event.target as HTMLElement).style.borderColor = '#334155'"
          />
          <p style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">
            {{ language === 'hi' ? 'लक्षित प्रश्न उत्पन्न करने के लिए एक विशिष्ट अवधारणा दर्ज करें' : 'Enter a specific concept to generate targeted questions' }}
          </p>
        </div>

        <!-- Warning Message -->
        <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 0.75rem; display: flex; align-items: flex-start; gap: 0.75rem;">
          <div style="flex-shrink: 0; margin-top: 0.125rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div>
            <p style="font-size: 0.875rem; font-weight: 600; color: #fbbf24; margin-bottom: 0.25rem;">
              {{ language === 'hi' ? 'कृपया धैर्य रखें' : 'Please be patient' }}
            </p>
            <p style="font-size: 0.8rem; color: #d1d5db; line-height: 1.5;">
              {{ language === 'hi'
                ? 'AI द्वारा प्रश्न उत्पन्न करने में 15-30 सेकंड या उससे अधिक समय लग सकता है। कृपया प्रतीक्षा करें और पेज को रीफ्रेश न करें।'
                : 'Generating questions using AI may take 15-30 seconds or more. Please wait and do not refresh the page.'
              }}
            </p>
          </div>
        </div>

        <!-- Generate Button -->
        <button
          @click="generateQuestions"
          :disabled="!selectedTopic || isGenerating"
          style="width: 100%; padding: 1rem; border-radius: 0.75rem; font-weight: 700; font-size: 1rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s;"
          :style="{
            background: (!selectedTopic || isGenerating) ? '#334155' : '#3b82f6',
            color: 'white',
            opacity: (!selectedTopic || isGenerating) ? '0.5' : '1',
            cursor: (!selectedTopic || isGenerating) ? 'not-allowed' : 'pointer'
          }"
        >
          <Sparkles v-if="!isGenerating" style="width: 1.25rem; height: 1.25rem;" />
          <div v-else style="width: 1.25rem; height: 1.25rem; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          {{ isGenerating ? 'Generating...' : 'Generate Questions' }}
        </button>
      </div>

      <!-- Generated Questions -->
      <div v-if="generatedQuestions.length > 0" style="margin-top: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 0.5rem;">
            <CheckCircle style="width: 1.5rem; height: 1.5rem; color: #10b981;" />
            Generated Questions ({{ generatedQuestions.length }})
          </h3>
          <div style="font-size: 0.875rem; color: #94a3b8;">
            Score: {{ correctCount }}/{{ submittedCount }}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div
            v-for="(question, index) in generatedQuestions"
            :key="index"
            style="background: #1e293b; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);"
          >
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <span style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: rgba(59, 130, 246, 0.2); color: #93c5fd;">
                Question {{ index + 1 }}
              </span>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: rgba(16, 185, 129, 0.2); color: #10b981;">
                  {{ question.difficulty_level }}
                </span>
                <!-- Show result badge after submission -->
                <span
                  v-if="isSubmitted(index)"
                  style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;"
                  :style="{
                    background: isCorrect(index) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: isCorrect(index) ? '#10b981' : '#ef4444'
                  }"
                >
                  {{ isCorrect(index) ? 'Correct!' : 'Incorrect' }}
                </span>
              </div>
            </div>

            <div style="font-size: 1rem; color: #e0e0e0; line-height: 1.75; margin-bottom: 1rem;">
              {{ language === 'hi' ? question.question_text_hi : question.question_text_en }}
            </div>

            <!-- Options - Interactive before submission -->
            <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
              <button
                v-for="optionKey in ['A', 'B', 'C', 'D']"
                :key="optionKey"
                @click="selectOption(index, optionKey)"
                :disabled="isSubmitted(index)"
                style="padding: 0.75rem; border-radius: 0.5rem; border: 2px solid; text-align: left; cursor: pointer; transition: all 0.2s;"
                :style="getOptionStyle(index, optionKey, question.correct_answer)"
              >
                <span style="font-weight: 600; margin-right: 0.5rem;">{{ optionKey }}.</span>
                {{ getOptionText(question, optionKey) }}
              </button>
            </div>

            <!-- Submit Button (before submission) -->
            <button
              v-if="!isSubmitted(index) && selectedAnswers[index]"
              @click="submitAnswer(index)"
              style="width: 100%; padding: 0.75rem; background: #3b82f6; color: white; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; margin-bottom: 1rem; transition: all 0.2s;"
              @mouseover="($event.currentTarget as HTMLElement).style.background = '#2563eb'"
              @mouseout="($event.currentTarget as HTMLElement).style.background = '#3b82f6'"
            >
              Submit Answer
            </button>

            <!-- Prompt to select (if no option selected) -->
            <div
              v-if="!isSubmitted(index) && !selectedAnswers[index]"
              style="text-align: center; color: #94a3b8; font-size: 0.875rem; padding: 0.5rem;"
            >
              Select an option above to answer
            </div>

            <!-- Explanation (only shown after submission) -->
            <div
              v-if="isSubmitted(index)"
              style="padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: 0.75rem; border-left: 4px solid #3b82f6;"
            >
              <div style="font-weight: 600; color: #93c5fd; margin-bottom: 0.5rem; font-size: 0.875rem;">
                Correct Answer: {{ question.correct_answer }}
              </div>
              <div style="color: #d1d5db; font-size: 0.875rem; line-height: 1.75;">
                {{ question.explanation }}
              </div>
            </div>
          </div>
        </div>

        <!-- Summary after all answered -->
        <div
          v-if="submittedCount === generatedQuestions.length"
          style="margin-top: 1.5rem; padding: 1.5rem; background: #1e293b; border-radius: 1rem; text-align: center;"
        >
          <div style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">
            Final Score: {{ correctCount }}/{{ generatedQuestions.length }}
          </div>
          <div style="font-size: 1rem; color: #94a3b8; margin-bottom: 1rem;">
            {{ Math.round((correctCount / generatedQuestions.length) * 100) }}% Accuracy
          </div>
          <div style="display: flex; gap: 1rem; justify-content: center;">
            <button
              @click="resetQuiz"
              style="padding: 0.75rem 1.5rem; background: #334155; color: white; border-radius: 0.75rem; font-weight: 600; border: none; cursor: pointer;"
            >
              Try Again
            </button>
            <button
              @click="generatedQuestions = []; selectedAnswers = {}; submittedQuestions = new Set()"
              style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border-radius: 0.75rem; font-weight: 600; border: none; cursor: pointer;"
            >
              Generate New Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, Sparkles, Brain, CheckCircle } from 'lucide-vue-next'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import api from '@/services/api'
import { TOPICS } from '@/types'
import { useSettingsStore } from '@/stores/settings'
import { storeToRefs } from 'pinia'

const settingsStore = useSettingsStore()
const { language } = storeToRefs(settingsStore)

const topics = TOPICS
const selectedTopic = ref<string | null>(null)
const numQuestions = ref(5)
const difficulty = ref('medium')
const keyword = ref('')
const isGenerating = ref(false)
const generatedQuestions = ref<any[]>([])

// Quiz state
const selectedAnswers = ref<Record<number, string>>({})
const submittedQuestions = ref<Set<number>>(new Set())

// Computed properties for score
const submittedCount = computed(() => submittedQuestions.value.size)
const correctCount = computed(() => {
  let count = 0
  submittedQuestions.value.forEach(index => {
    if (selectedAnswers.value[index] === generatedQuestions.value[index]?.correct_answer) {
      count++
    }
  })
  return count
})

async function generateQuestions() {
  if (!selectedTopic.value || isGenerating.value) return

  isGenerating.value = true
  generatedQuestions.value = []
  // Reset quiz state
  selectedAnswers.value = {}
  submittedQuestions.value = new Set()

  try {
    if (keyword.value.trim()) {
      // Generate by keyword - uses extended 2 minute timeout
      const question = await api.generateAIQuestionByKeyword(
        selectedTopic.value,
        keyword.value.trim()
      )
      generatedQuestions.value = question ? [question] : []
    } else {
      // Generate bulk questions - uses extended 2 minute timeout
      const response = await api.generateAIQuestions({
        topic: selectedTopic.value as any,
        count: numQuestions.value,
        difficulty: difficulty.value as any
      })
      generatedQuestions.value = response.questions || []
    }

    if (generatedQuestions.value.length === 0) {
      const msg = language.value === 'hi'
        ? 'कोई प्रश्न उत्पन्न नहीं हुआ। कृपया पुनः प्रयास करें।'
        : 'No questions were generated. Please try again.'
      alert(msg)
    }
  } catch (error: any) {
    console.error('Failed to generate questions:', error)
    const errorMsg = language.value === 'hi'
      ? `प्रश्न उत्पन्न करने में विफल: ${error.message || 'कृपया पुनः प्रयास करें।'}`
      : `Failed to generate questions: ${error.message || 'Please try again.'}`
    alert(errorMsg)
  } finally {
    isGenerating.value = false
  }
}

function selectOption(questionIndex: number, optionKey: string) {
  if (submittedQuestions.value.has(questionIndex)) return
  selectedAnswers.value[questionIndex] = optionKey
}

function submitAnswer(questionIndex: number) {
  submittedQuestions.value = new Set([...submittedQuestions.value, questionIndex])
}

function isSubmitted(questionIndex: number): boolean {
  return submittedQuestions.value.has(questionIndex)
}

function isCorrect(questionIndex: number): boolean {
  const question = generatedQuestions.value[questionIndex]
  return selectedAnswers.value[questionIndex] === question?.correct_answer
}

function getOptionText(question: any, optionKey: string): string {
  const opts = language.value === 'hi' ? question.options_hi : question.options_en
  return opts?.[optionKey] || ''
}

function getOptionStyle(questionIndex: number, optionKey: string, correctAnswer: string) {
  const isSelected = selectedAnswers.value[questionIndex] === optionKey
  const submitted = isSubmitted(questionIndex)

  if (!submitted) {
    // Before submission - show selection state only
    return {
      background: isSelected ? 'rgba(59, 130, 246, 0.2)' : '#0f172a',
      borderColor: isSelected ? '#3b82f6' : '#334155',
      color: 'white',
      cursor: 'pointer'
    }
  }

  // After submission - show correct/incorrect
  const isCorrectOption = optionKey === correctAnswer
  const isUserAnswer = isSelected

  if (isCorrectOption) {
    return {
      background: 'rgba(16, 185, 129, 0.2)',
      borderColor: '#10b981',
      color: 'white',
      cursor: 'default'
    }
  }

  if (isUserAnswer && !isCorrectOption) {
    return {
      background: 'rgba(239, 68, 68, 0.2)',
      borderColor: '#ef4444',
      color: 'white',
      cursor: 'default'
    }
  }

  return {
    background: '#0f172a',
    borderColor: '#334155',
    color: '#94a3b8',
    cursor: 'default'
  }
}

function resetQuiz() {
  selectedAnswers.value = {}
  submittedQuestions.value = new Set()
}
</script>

<style>
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
