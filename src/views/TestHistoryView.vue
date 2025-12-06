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
          <h1 style="font-size: 1.5rem; font-weight: 700; color: white;">Test History</h1>
          <div style="width: 2.5rem;"></div>
        </div>

        <!-- Filters -->
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem;">
          <button
            @click="filterStatus = null; filterTestType = null; loadHistory()"
            :style="{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              background: !filterStatus && !filterTestType ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
              color: !filterStatus && !filterTestType ? 'white' : '#93c5fd'
            }"
          >
            All Tests
          </button>
          <button
            @click="filterStatus = 'in_progress'; filterTestType = null; loadHistory()"
            :style="{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              background: filterStatus === 'in_progress' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
              color: filterStatus === 'in_progress' ? 'white' : '#93c5fd'
            }"
          >
            In Progress
          </button>
          <button
            @click="filterStatus = 'completed'; filterTestType = null; loadHistory()"
            :style="{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              background: filterStatus === 'completed' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
              color: filterStatus === 'completed' ? 'white' : '#93c5fd'
            }"
          >
            Completed
          </button>
          <button
            @click="filterTestType = 'full_length_test'; filterStatus = null; loadHistory()"
            :style="{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              background: filterTestType === 'full_length_test' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
              color: filterTestType === 'full_length_test' ? 'white' : '#93c5fd'
            }"
          >
            Full Tests
          </button>
          <button
            @click="filterTestType = 'quick_practice'; filterStatus = null; loadHistory()"
            :style="{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              background: filterTestType === 'quick_practice' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
              color: filterTestType === 'quick_practice' ? 'white' : '#93c5fd'
            }"
          >
            Quick Practice
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" style="display: flex; justify-content: center; padding: 3rem;">
      <div style="width: 3rem; height: 3rem; border: 3px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="tests.length === 0" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem;">
      <History style="width: 6rem; height: 6rem; color: #475569; margin-bottom: 1rem;" />
      <h2 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">No Test History</h2>
      <p style="color: #94a3b8; text-align: center; margin-bottom: 1.5rem;">
        Start taking tests to see your history here
      </p>
      <button
        @click="$router.push('/dashboard')"
        style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border-radius: 0.75rem; font-weight: 600; border: none; cursor: pointer;"
      >
        Take a Test
      </button>
    </div>

    <!-- Test History List -->
    <div v-else style="max-width: 64rem; margin: 0 auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
      <div
        v-for="test in tests"
        :key="test.id"
        @click="handleTestClick(test)"
        :style="{
          background: test.status === 'in_progress' ? 'linear-gradient(135deg, #1e293b 0%, #1e3a5f 100%)' : '#1e293b',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: test.status === 'in_progress' ? '0 4px 12px -1px rgba(59, 130, 246, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          position: 'relative',
          border: test.status === 'in_progress' ? '1px solid rgba(59, 130, 246, 0.3)' : 'none'
        }"
        @mouseover="$event.currentTarget.style.transform = 'translateY(-2px)'"
        @mouseout="$event.currentTarget.style.transform = 'translateY(0)'"
      >
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem;">
          <div style="flex: 1;">
            <h3 style="font-size: 1.125rem; font-weight: 700; color: white; margin-bottom: 0.25rem;">
              {{ getTestTypeName(test.test_type) }}
            </h3>
            <p style="font-size: 0.875rem; color: #94a3b8;">
              {{ formatDate(test.created_at) }}
            </p>
          </div>

          <!-- Status and Resume Button Container -->
          <div style="display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0;">
            <span
              style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;"
              :style="{
                background: getStatusColor(test.status).bg,
                color: getStatusColor(test.status).text
              }"
            >
              {{ formatStatus(test.status) }}
            </span>

            <!-- Resume Button for In Progress Tests -->
            <button
              v-if="test.status === 'in_progress'"
              @click.stop="handleTestClick(test)"
              style="padding: 0.5rem 1rem; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 9999px; font-size: 0.75rem; font-weight: 700; color: white; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5); transition: all 0.2s; animation: pulse 2s ease-in-out infinite;"
              @mouseover="$event.currentTarget.style.transform = 'scale(1.05)'"
              @mouseout="$event.currentTarget.style.transform = 'scale(1)'"
            >
              <Play style="width: 1rem; height: 1rem;" />
              Resume
            </button>
          </div>
        </div>

        <!-- Stats for In Progress Tests -->
        <div v-if="test.status === 'in_progress'" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
          <div style="text-align: center; padding: 0.75rem; background: rgba(59, 130, 246, 0.1); border-radius: 0.5rem; border: 1px solid rgba(59, 130, 246, 0.2);">
            <div style="font-size: 1.5rem; font-weight: 700; color: #3b82f6;">
              {{ test.attempted_questions || 0 }}
            </div>
            <div style="font-size: 0.75rem; color: #93c5fd;">Attempted</div>
          </div>
          <div style="text-align: center; padding: 0.75rem; background: rgba(148, 163, 184, 0.1); border-radius: 0.5rem; border: 1px solid rgba(148, 163, 184, 0.2);">
            <div style="font-size: 1.5rem; font-weight: 700; color: #94a3b8;">
              {{ (test.total_questions || 0) - (test.attempted_questions || 0) }}
            </div>
            <div style="font-size: 0.75rem; color: #94a3b8;">Not Attempted</div>
          </div>
          <div style="text-align: center; padding: 0.75rem; background: rgba(59, 130, 246, 0.1); border-radius: 0.5rem; border: 1px solid rgba(59, 130, 246, 0.2);">
            <div style="font-size: 1.5rem; font-weight: 700; color: #60a5fa;">
              {{ Math.round(((test.attempted_questions || 0) / (test.total_questions || 1)) * 100) }}%
            </div>
            <div style="font-size: 0.75rem; color: #93c5fd;">Progress</div>
          </div>
        </div>

        <!-- Stats for Completed Tests -->
        <div v-else style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
          <div style="text-align: center; padding: 0.75rem; background: #0f172a; border-radius: 0.5rem;">
            <div style="font-size: 1.5rem; font-weight: 700; color: #3b82f6;">
              {{ test.score !== undefined ? Math.round(test.score) : 'N/A' }}%
            </div>
            <div style="font-size: 0.75rem; color: #94a3b8;">Score</div>
          </div>
          <div style="text-align: center; padding: 0.75rem; background: #0f172a; border-radius: 0.5rem;">
            <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">
              {{ test.correct_answers || 0 }}
            </div>
            <div style="font-size: 0.75rem; color: #94a3b8;">Correct</div>
          </div>
          <div style="text-align: center; padding: 0.75rem; background: #0f172a; border-radius: 0.5rem;">
            <div style="font-size: 1.5rem; font-weight: 700; color: #ef4444;">
              {{ test.wrong_answers || 0 }}
            </div>
            <div style="font-size: 0.75rem; color: #94a3b8;">Wrong</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; color: #94a3b8;">
          <span>
            {{ test.attempted_questions || 0 }} / {{ test.total_questions || 0 }} Questions
          </span>
          <ChevronRight style="width: 1.25rem; height: 1.25rem;" />
        </div>
      </div>

      <!-- Load More Button -->
      <button
        v-if="hasMore"
        @click="loadMore"
        style="width: 100%; padding: 1rem; background: rgba(59, 130, 246, 0.1); border: 2px solid #3b82f6; border-radius: 0.75rem; color: #93c5fd; font-weight: 600; cursor: pointer;"
      >
        Load More
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, History, Play } from 'lucide-vue-next'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import api from '@/services/api'

const router = useRouter()

const tests = ref<any[]>([])
const isLoading = ref(false)
const currentPage = ref(0)
const hasMore = ref(true)
const filterStatus = ref<string | null>(null)
const filterTestType = ref<string | null>(null)

onMounted(() => {
  loadHistory()
})

async function loadHistory() {
  isLoading.value = true
  currentPage.value = 0
  try {
    const response: any = await api.client.get('/api/v1/tests/history', {
      params: {
        test_type: filterTestType.value,
        status: filterStatus.value,
        page: currentPage.value + 1,
        page_size: 20
      }
    })

    if (response.data.items) {
      tests.value = response.data.items
      hasMore.value = response.data.page < response.data.total_pages
    } else {
      tests.value = response.data
      hasMore.value = response.data.length === 20
    }
  } catch (error) {
    console.error('Failed to load test history:', error)
    tests.value = []
  } finally {
    isLoading.value = false
  }
}

async function loadMore() {
  currentPage.value++
  try {
    const response: any = await api.client.get('/api/v1/tests/history', {
      params: {
        test_type: filterTestType.value,
        status: filterStatus.value,
        page: currentPage.value + 1,
        page_size: 20
      }
    })

    if (response.data.items) {
      tests.value.push(...response.data.items)
      hasMore.value = response.data.page < response.data.total_pages
    } else {
      tests.value.push(...response.data)
      hasMore.value = response.data.length === 20
    }
  } catch (error) {
    console.error('Failed to load more tests:', error)
  }
}

function handleTestClick(test: any) {
  // If test is in progress, resume it
  if (test.status === 'in_progress') {
    const sessionId = test.session_id || test.id
    router.push(`/practice/${sessionId}`)
  } else {
    // Otherwise, view the result
    const testId = test.session_id || test.id
    router.push(`/exam/${testId}/result`)
  }
}

function getTestTypeName(type: string): string {
  const names: Record<string, string> = {
    full_length_test: 'Full Length Test',
    topic_test: 'Topic Test',
    quick_practice: 'Quick Practice',
    weak_area_test: 'Weak Area Test',
    ai_generated: 'AI Generated Test'
  }
  return names[type] || type
}

function formatStatus(status: string): string {
  const formatted: Record<string, string> = {
    in_progress: 'In Progress',
    completed: 'Completed',
    abandoned: 'Abandoned',
    timed_out: 'Timed Out'
  }
  return formatted[status] || status
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString()
}

function getStatusColor(status: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    completed: { bg: 'rgba(16, 185, 129, 0.2)', text: '#10b981' },
    in_progress: { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' },
    abandoned: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
    timed_out: { bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' }
  }
  return colors[status] || { bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8' }
}
</script>

<style>
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}
</style>
