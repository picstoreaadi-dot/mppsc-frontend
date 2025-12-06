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
          <h1 style="font-size: 1.5rem; font-weight: 700; color: white;">Question Browser</h1>
          <div style="width: 2.5rem;"></div>
        </div>

        <!-- Search Bar -->
        <div style="margin-top: 1rem; position: relative;">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            placeholder="Search questions by keyword..."
            style="width: 100%; padding: 0.75rem 3rem 0.75rem 1rem; background: #0f172a; border: 2px solid #334155; border-radius: 0.75rem; color: white; font-size: 1rem;"
          />
          <Search style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); width: 1.5rem; height: 1.5rem; color: #64748b;" />
        </div>

        <!-- Topic Filter -->
        <div style="margin-top: 1rem; overflow-x: auto; display: flex; gap: 0.5rem; padding-bottom: 0.5rem;">
          <button
            @click="selectedTopic = null"
            :style="{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              background: !selectedTopic ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
              color: !selectedTopic ? 'white' : '#93c5fd'
            }"
          >
            All Topics
          </button>
          <button
            v-for="topic in topics"
            :key="topic.id"
            @click="selectTopic(topic.id)"
            :style="{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              background: selectedTopic === topic.id ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
              color: selectedTopic === topic.id ? 'white' : '#93c5fd'
            }"
          >
            {{ language === 'hi' ? topic.name_hi : topic.name_en }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" style="display: flex; justify-content: center; padding: 3rem;">
      <div style="width: 3rem; height: 3rem; border: 3px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    </div>

    <!-- Questions List -->
    <div v-else style="max-width: 64rem; margin: 0 auto; padding: 1.5rem;">
      <div v-if="questions.length === 0" style="text-align: center; padding: 3rem; color: #94a3b8;">
        <p style="font-size: 1.125rem; margin-bottom: 0.5rem;">No questions found</p>
        <p style="font-size: 0.875rem;">Try adjusting your search or filters</p>
      </div>

      <div v-else style="display: flex; flex-direction: column; gap: 1rem;">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          style="background: #1e293b; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); cursor: pointer; transition: transform 0.2s;"
          @click="viewQuestion(question)"
          @mouseover="$event.currentTarget.style.transform = 'translateY(-2px)'"
          @mouseout="$event.currentTarget.style.transform = 'translateY(0)'"
        >
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.75rem;">
            <span style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: rgba(59, 130, 246, 0.2); color: #93c5fd;">
              {{ getTopicName(question.standardized_topic) }}
            </span>
            <button
              @click.stop="toggleBookmark(question.id)"
              style="padding: 0.5rem; border-radius: 0.5rem; background: rgba(148, 163, 184, 0.1); border: none; cursor: pointer;"
            >
              <Bookmark
                style="width: 1.25rem; height: 1.25rem;"
                :style="{ color: bookmarkedQuestions.has(question.id) ? '#f59e0b' : 'white', fill: bookmarkedQuestions.has(question.id) ? '#f59e0b' : 'none' }"
              />
            </button>
          </div>

          <div style="font-size: 1rem; color: #e0e0e0; line-height: 1.6;">
            {{ language === 'hi' ? question.question_text_hi : question.question_text_en }}
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; font-size: 0.875rem; color: #94a3b8;">
            <span>Question {{ index + 1 }} of {{ questions.length }}</span>
            <ChevronRight style="width: 1.25rem; height: 1.25rem;" />
          </div>
        </div>

        <!-- Load More Button -->
        <button
          v-if="hasMore"
          @click="loadMore"
          style="width: 100%; padding: 1rem; background: rgba(59, 130, 246, 0.1); border: 2px solid #3b82f6; border-radius: 0.75rem; color: #93c5fd; font-weight: 600; cursor: pointer; transition: all 0.2s;"
          @mouseover="$event.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'"
          @mouseout="$event.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'"
        >
          Load More Questions
        </button>
      </div>
    </div>

    <!-- Question Detail Modal -->
    <div
      v-if="selectedQuestion"
      @click="selectedQuestion = null"
      style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem;"
    >
      <div
        @click.stop
        style="background: #1e293b; border-radius: 1.5rem; padding: 2rem; max-width: 48rem; width: 100%; max-height: 90vh; overflow-y: auto;"
      >
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
          <span style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: rgba(59, 130, 246, 0.2); color: #93c5fd;">
            {{ getTopicName(selectedQuestion.standardized_topic) }}
          </span>
          <button @click="selectedQuestion = null" style="padding: 0.5rem; border-radius: 0.5rem; background: rgba(148, 163, 184, 0.1); border: none; cursor: pointer;">
            <X style="width: 1.5rem; height: 1.5rem; color: white;" />
          </button>
        </div>

        <div style="font-size: 1.125rem; color: #e0e0e0; line-height: 1.75; margin-bottom: 1.5rem;">
          {{ language === 'hi' ? selectedQuestion.question_text_hi : selectedQuestion.question_text_en }}
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
          <div
            v-for="(option, i) in getOptions(selectedQuestion)"
            :key="i"
            style="padding: 1rem; border-radius: 0.75rem; border: 2px solid;"
            :style="{
              background: getOptionLetter(i) === selectedQuestion.predicted_answer ? 'rgba(16, 185, 129, 0.1)' : '#0f172a',
              borderColor: getOptionLetter(i) === selectedQuestion.predicted_answer ? '#10b981' : '#334155',
              color: 'white'
            }"
          >
            <span style="font-weight: 600; margin-right: 0.5rem;">{{ getOptionLetter(i) }}.</span>
            {{ option }}
          </div>
        </div>

        <div style="padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: 0.75rem; border-left: 4px solid #3b82f6;">
          <div style="font-weight: 600; color: #93c5fd; margin-bottom: 0.5rem;">Explanation</div>
          <div style="color: #d1d5db; line-height: 1.75;">
            {{ selectedQuestion.explanation || 'No explanation available' }}
          </div>
        </div>

        <button
          @click="toggleBookmark(selectedQuestion.id)"
          style="width: 100%; margin-top: 1.5rem; padding: 0.75rem; border-radius: 0.75rem; font-weight: 600; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"
          :style="{
            background: bookmarkedQuestions.has(selectedQuestion.id) ? '#f59e0b' : '#3b82f6',
            color: 'white'
          }"
        >
          <Bookmark
            style="width: 1.25rem; height: 1.25rem;"
            :style="{ fill: bookmarkedQuestions.has(selectedQuestion.id) ? 'white' : 'none' }"
          />
          {{ bookmarkedQuestions.has(selectedQuestion.id) ? 'Remove Bookmark' : 'Bookmark Question' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ChevronLeft, Search, Bookmark, ChevronRight, X } from 'lucide-vue-next'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import api from '@/services/api'
import { TOPICS } from '@/types'
import { useSettingsStore } from '@/stores/settings'
import { storeToRefs } from 'pinia'

const settingsStore = useSettingsStore()
const { language } = storeToRefs(settingsStore)

const searchQuery = ref('')
const selectedTopic = ref<string | null>(null)
const questions = ref<any[]>([])
const selectedQuestion = ref<any>(null)
const bookmarkedQuestions = ref<Set<number>>(new Set())
const isLoading = ref(false)
const currentPage = ref(0)
const hasMore = ref(true)
const topics = TOPICS

let searchTimeout: number | null = null

onMounted(async () => {
  await loadQuestions()
  await loadBookmarks()
})

async function loadQuestions() {
  isLoading.value = true
  try {
    if (searchQuery.value.trim()) {
      questions.value = await api.searchQuestions(searchQuery.value, 20)
      hasMore.value = false
    } else if (selectedTopic.value) {
      questions.value = await api.getQuestionsByTopic(selectedTopic.value as any, 20, currentPage.value * 20)
      hasMore.value = questions.value.length === 20
    } else {
      // Load from first topic if no filters
      questions.value = await api.getQuestionsByTopic('indian_history' as any, 20, currentPage.value * 20)
      hasMore.value = questions.value.length === 20
    }
  } catch (error) {
    console.error('Failed to load questions:', error)
  } finally {
    isLoading.value = false
  }
}

async function loadBookmarks() {
  try {
    const bookmarks = await api.getBookmarks()
    bookmarkedQuestions.value = new Set(bookmarks.map((b: any) => b.question_id))
  } catch (error) {
    console.error('Failed to load bookmarks:', error)
  }
}

function handleSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = window.setTimeout(() => {
    currentPage.value = 0
    loadQuestions()
  }, 500)
}

async function selectTopic(topicId: string) {
  selectedTopic.value = topicId
  currentPage.value = 0
  await loadQuestions()
}

async function loadMore() {
  currentPage.value++
  await loadQuestions()
}

function viewQuestion(question: any) {
  selectedQuestion.value = question
}

async function toggleBookmark(questionId: number) {
  try {
    if (bookmarkedQuestions.value.has(questionId)) {
      await api.removeBookmark(questionId.toString())
      bookmarkedQuestions.value.delete(questionId)
    } else {
      await api.addBookmark(questionId.toString())
      bookmarkedQuestions.value.add(questionId)
    }
  } catch (error) {
    console.error('Failed to toggle bookmark:', error)
    alert('Failed to bookmark question')
  }
}

function getTopicName(topicId: string) {
  const topic = TOPICS.find(t => t.id === topicId)
  return language.value === 'hi' ? topic?.name_hi : topic?.name_en
}

function getOptions(question: any) {
  const opts = language.value === 'hi' ? question.options_hi : question.options_en
  if (opts && typeof opts === 'object' && !Array.isArray(opts)) {
    return [opts.A, opts.B, opts.C, opts.D].filter(Boolean)
  }
  return Array.isArray(opts) ? opts : []
}

function getOptionLetter(index: number): string {
  return ['A', 'B', 'C', 'D'][index]
}
</script>

<style>
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
