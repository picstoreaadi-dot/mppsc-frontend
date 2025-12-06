<template>
  <div style="min-height: 100vh; background: #0f172a;">
    <LanguageToggle />

    <!-- Header -->
    <div style="background: linear-gradient(to bottom right, #f59e0b, #ef4444); color: white; padding: 2rem 1.5rem;">
      <div style="max-width: 64rem; margin: 0 auto;">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
          <Trophy style="width: 2rem; height: 2rem;" />
          <h1 style="font-size: 1.875rem; font-weight: 700;">Leaderboard</h1>
        </div>
        <p style="opacity: 0.9;">Compete with thousands of MPPSC aspirants</p>

        <!-- Period Selector -->
        <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
          <button
            v-for="period in [{key: 'weekly', label: 'Weekly'}, {key: 'monthly', label: 'Monthly'}, {key: 'all_time', label: 'All Time'}]"
            :key="period.key"
            @click="selectedPeriod = period.key"
            style="padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; transition: all 0.2s; border: none; cursor: pointer;"
            :style="{
              background: selectedPeriod === period.key ? 'white' : 'rgba(255, 255, 255, 0.2)',
              color: selectedPeriod === period.key ? '#ef4444' : 'white'
            }"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Your Position -->
    <div style="max-width: 64rem; margin: 0 auto; padding: 1.5rem;">
      <div v-if="userPosition" style="background: linear-gradient(to bottom right, #3b82f6, #1d4ed8); color: white; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
        <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Your Position</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
          <div style="text-align: center;">
            <div style="font-size: 2.5rem; font-weight: 700;">#{{ userPosition.rank }}</div>
            <div style="font-size: 0.875rem; opacity: 0.8;">Your Rank</div>
          </div>
          <div style="text-align: center; border-left: 1px solid rgba(255, 255, 255, 0.2); border-right: 1px solid rgba(255, 255, 255, 0.2);">
            <div style="font-size: 2.5rem; font-weight: 700;">{{ userPosition.avg_score?.toFixed(1) || 0 }}%</div>
            <div style="font-size: 0.875rem; opacity: 0.8;">Avg Score</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 2.5rem; font-weight: 700;">{{ topUsers.length }}</div>
            <div style="font-size: 0.875rem; opacity: 0.8;">Total Users</div>
          </div>
        </div>
        <p v-if="userPosition.rank && topUsers.length > 0" style="margin-top: 1rem; font-size: 0.875rem; opacity: 0.9; text-align: center;">
          🎯 You're performing better than {{ Math.round((1 - userPosition.rank / topUsers.length) * 100) }}% of all aspirants!
        </p>
      </div>

      <!-- Leaderboard List -->
      <div style="background: #1e293b; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
        <div v-if="isLoading" style="text-align: center; padding: 2rem; color: #94a3b8;">
          Loading leaderboard...
        </div>
        <div v-else-if="topUsers.length === 0" style="text-align: center; padding: 2rem; color: #94a3b8;">
          No leaderboard data available for this period
        </div>
        <div v-else style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div
            v-for="(user, index) in topUsers"
            :key="user.user_id || index"
            style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 0.75rem; transition: all 0.2s; cursor: pointer;"
            @mouseover="$event.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)'"
            @mouseout="$event.currentTarget.style.background = 'transparent'"
          >
            <div style="font-size: 1.5rem; font-weight: 700; color: #94a3b8; width: 3rem;">
              {{ user.rank || (index + 1) }}
            </div>
            <div style="width: 3rem; height: 3rem; border-radius: 9999px; background: rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center; color: #93c5fd; font-weight: 700; font-size: 1.125rem;">
              {{ (user.full_name || 'User')[0].toUpperCase() }}
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 600; color: white;">{{ user.full_name || 'Anonymous' }}</div>
              <div style="font-size: 0.875rem; color: #94a3b8;">{{ user.tests_completed || 0 }} tests completed</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.25rem; font-weight: 700; color: #10b981;">{{ user.avg_score?.toFixed(0) || 0 }}%</div>
              <div style="font-size: 0.75rem; color: #94a3b8;">avg score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Trophy } from 'lucide-vue-next'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import api from '@/services/api'

const selectedPeriod = ref('weekly')
const topUsers = ref<any[]>([])
const userPosition = ref<any>(null)
const isLoading = ref(true)

async function loadLeaderboard() {
  isLoading.value = true
  try {
    const data = await api.getLeaderboard(selectedPeriod.value as any)
    // Handle both old array format and new object format
    if (Array.isArray(data)) {
      topUsers.value = data
      userPosition.value = null
    } else {
      topUsers.value = data.leaderboard || []
      userPosition.value = data.user_position || null
    }
  } catch (error) {
    console.error('Failed to load leaderboard:', error)
    topUsers.value = []
    userPosition.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadLeaderboard()
})

watch(selectedPeriod, () => {
  loadLeaderboard()
})
</script>
