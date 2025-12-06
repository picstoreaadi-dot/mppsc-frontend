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
          <h1 style="font-size: 1.5rem; font-weight: 700; color: white;">
            Bookmarks
            <span v-if="totalBookmarks > 0" style="font-size: 1rem; color: #94a3b8; font-weight: 400;">
              ({{ totalBookmarks }})
            </span>
          </h1>
          <div style="width: 2.5rem;"></div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh;">
      <div style="width: 3rem; height: 3rem; border: 4px solid #334155; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #94a3b8; margin-top: 1rem;">Loading bookmarks...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; padding: 0 1.5rem;">
      <div style="width: 4rem; height: 4rem; background: rgba(239, 68, 68, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
        <span style="font-size: 2rem;">!</span>
      </div>
      <h2 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">Failed to Load</h2>
      <p style="color: #94a3b8; text-align: center; margin-bottom: 1.5rem;">{{ error }}</p>
      <button
        @click="loadBookmarks"
        style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border-radius: 0.75rem; font-weight: 600; border: none; cursor: pointer;"
      >
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="bookmarks.length === 0" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; padding: 0 1.5rem;">
      <Bookmark style="width: 6rem; height: 6rem; color: #475569; margin-bottom: 1rem;" />
      <h2 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">No Bookmarks Yet</h2>
      <p style="color: #94a3b8; text-align: center; margin-bottom: 1.5rem;">
        Start bookmarking important questions during practice
      </p>
      <button
        @click="$router.push('/dashboard')"
        style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border-radius: 0.75rem; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s;"
        @mouseover="$event.currentTarget.style.background = '#2563eb'"
        @mouseout="$event.currentTarget.style.background = '#3b82f6'"
      >
        Start Practicing
      </button>
    </div>

    <!-- Bookmarks List -->
    <div v-else style="max-width: 64rem; margin: 0 auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
      <div
        v-for="(bookmark, index) in bookmarks"
        :key="bookmark.id"
        style="background: #1e293b; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);"
      >
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem;">
          <span style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: rgba(59, 130, 246, 0.2); color: #93c5fd;">
            {{ formatTopic(bookmark.topic) }}
          </span>
          <button
            @click="removeBookmark(index)"
            :disabled="removingIndex === index"
            style="padding: 0.5rem; border-radius: 0.5rem; background: rgba(239, 68, 68, 0.1); border: none; cursor: pointer; transition: all 0.2s;"
            :style="{ opacity: removingIndex === index ? 0.5 : 1 }"
            @mouseover="$event.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'"
            @mouseout="$event.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'"
          >
            <Trash2 style="width: 1.25rem; height: 1.25rem; color: #ef4444;" />
          </button>
        </div>

        <div style="font-size: 1.125rem; margin-bottom: 1rem; color: #e0e0e0; line-height: 1.6;">
          {{ getQuestionText(bookmark) }}
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
          <div
            v-for="optionKey in ['A', 'B', 'C', 'D']"
            :key="optionKey"
            style="padding: 0.75rem; border-radius: 0.5rem; border: 2px solid;"
            :style="{
              background: optionKey === bookmark.correctAnswer ? 'rgba(16, 185, 129, 0.1)' : '#0f172a',
              borderColor: optionKey === bookmark.correctAnswer ? '#10b981' : '#334155',
              color: 'white'
            }"
          >
            <span style="font-weight: 600; margin-right: 0.5rem; color: #94a3b8;">{{ optionKey }}.</span>
            {{ getOptions(bookmark)[optionKey] || 'N/A' }}
          </div>
        </div>

        <div v-if="bookmark.explanation" style="font-size: 0.875rem; color: #94a3b8; background: #0f172a; padding: 1rem; border-radius: 0.5rem;">
          <strong style="color: #10b981;">Explanation:</strong> {{ bookmark.explanation }}
        </div>

        <div v-if="bookmark.notes" style="font-size: 0.875rem; color: #fbbf24; margin-top: 0.75rem;">
          <strong>Your Notes:</strong> {{ bookmark.notes }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ChevronLeft, Bookmark, Trash2 } from 'lucide-vue-next'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import { useSettingsStore } from '@/stores/settings'
import { storeToRefs } from 'pinia'
import api from '@/services/api'

const settingsStore = useSettingsStore()
const { language } = storeToRefs(settingsStore)

interface BookmarkItem {
  id: string
  questionId: number
  topic: string
  questionTextEn: string
  questionTextHi: string
  optionsEn: Record<string, string>
  optionsHi: Record<string, string>
  correctAnswer: string
  explanation: string
  notes?: string
}

const bookmarks = ref<BookmarkItem[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const totalBookmarks = ref(0)
const removingIndex = ref<number | null>(null)

// Topic name formatting with Hindi support
const topicNamesEn: Record<string, string> = {
  'indian_history': 'Indian History',
  'mp_history_culture': 'MP History & Culture',
  'indian_geography': 'Indian Geography',
  'mp_geography': 'MP Geography',
  'indian_polity': 'Indian Polity',
  'mp_polity': 'MP Polity',
  'indian_economy': 'Indian Economy',
  'mp_economy': 'MP Economy',
  'science_environment_health': 'Science & Environment',
  'current_affairs_ict': 'Current Affairs & ICT',
  'mp_tribes_heritage': 'MP Tribes & Heritage'
}

const topicNamesHi: Record<string, string> = {
  'indian_history': 'भारतीय इतिहास',
  'mp_history_culture': 'म.प्र. इतिहास और संस्कृति',
  'indian_geography': 'भारतीय भूगोल',
  'mp_geography': 'म.प्र. भूगोल',
  'indian_polity': 'भारतीय राजव्यवस्था',
  'mp_polity': 'म.प्र. राजव्यवस्था',
  'indian_economy': 'भारतीय अर्थव्यवस्था',
  'mp_economy': 'म.प्र. अर्थव्यवस्था',
  'science_environment_health': 'विज्ञान और पर्यावरण',
  'current_affairs_ict': 'समसामयिकी और आईसीटी',
  'mp_tribes_heritage': 'म.प्र. जनजाति और विरासत'
}

function formatTopic(topic: string): string {
  const names = language.value === 'hi' ? topicNamesHi : topicNamesEn
  return names[topic] || topic?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'
}

// Helper functions to get language-specific content
function getQuestionText(bookmark: BookmarkItem): string {
  if (language.value === 'hi') {
    return bookmark.questionTextHi || bookmark.questionTextEn || 'Question not available'
  }
  return bookmark.questionTextEn || bookmark.questionTextHi || 'Question not available'
}

function getOptions(bookmark: BookmarkItem): Record<string, string> {
  if (language.value === 'hi') {
    return bookmark.optionsHi && Object.keys(bookmark.optionsHi).length > 0
      ? bookmark.optionsHi
      : bookmark.optionsEn || {}
  }
  return bookmark.optionsEn && Object.keys(bookmark.optionsEn).length > 0
    ? bookmark.optionsEn
    : bookmark.optionsHi || {}
}

async function loadBookmarks() {
  isLoading.value = true
  error.value = null

  try {
    // The API returns { items: Bookmark[], total: number }
    const response = await api.getBookmarks()

    totalBookmarks.value = response.total || response.items?.length || 0

    bookmarks.value = (response.items || []).map((bookmark: any) => {
      // The backend joins with questions table, so question data is nested under 'questions' key
      const question = bookmark.questions || bookmark.question || {}
      return {
        id: bookmark.id,
        questionId: bookmark.question_id || question.id,
        topic: question.standardized_topic || 'General',
        questionTextEn: question.question_text_en || '',
        questionTextHi: question.question_text_hi || '',
        optionsEn: question.options_en || {},
        optionsHi: question.options_hi || {},
        correctAnswer: question.predicted_answer || 'A',
        explanation: question.explanation || '',
        notes: bookmark.notes
      }
    })
  } catch (err: any) {
    console.error('Failed to load bookmarks:', err)
    error.value = err.message || 'Failed to load bookmarks. Please try again.'
  } finally {
    isLoading.value = false
  }
}

async function removeBookmark(index: number) {
  if (!confirm('Remove this bookmark?')) return

  removingIndex.value = index
  try {
    const bookmark = bookmarks.value[index]
    // The API expects question_id, not bookmark id
    await api.removeBookmark(String(bookmark.questionId))
    bookmarks.value.splice(index, 1)
    totalBookmarks.value--
  } catch (err: any) {
    console.error('Failed to remove bookmark:', err)
    alert('Failed to remove bookmark: ' + (err.message || 'Unknown error'))
  } finally {
    removingIndex.value = null
  }
}

onMounted(() => {
  loadBookmarks()
})
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
