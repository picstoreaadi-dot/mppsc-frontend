<template>
  <!-- Offline Banner - Fixed at top of screen -->
  <Teleport to="body">
    <Transition name="slide-down">
      <div
        v-if="!isOnline"
        class="network-status-banner offline"
        role="alert"
        aria-live="assertive"
      >
        <div class="banner-content">
          <div class="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
              <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
          </div>
          <div class="message-container">
            <span class="title">You're Offline</span>
            <span class="subtitle">{{ offlineMessage }}</span>
          </div>
          <div v-if="pendingCount > 0" class="pending-badge">
            {{ pendingCount }} pending
          </div>
        </div>
      </div>
    </Transition>

    <!-- Back Online Toast -->
    <Transition name="slide-up">
      <div
        v-if="showOnlineToast"
        class="network-status-toast online"
        role="status"
        aria-live="polite"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Back online{{ pendingCount > 0 ? ' - syncing data...' : '' }}</span>
      </div>
    </Transition>

    <!-- Sync Status Indicator (for test-taking) -->
    <Transition name="fade">
      <div
        v-if="showSyncIndicator && pendingCount > 0 && isOnline"
        class="sync-indicator"
        role="status"
        aria-live="polite"
      >
        <div class="sync-spinner"></div>
        <span>Syncing {{ pendingCount }} {{ pendingCount === 1 ? 'answer' : 'answers' }}...</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/services/api'

const props = withDefaults(
  defineProps<{
    /** Show sync indicator for pending requests (useful during tests) */
    showSyncIndicator?: boolean
    /** Custom message when offline */
    customOfflineMessage?: string
  }>(),
  {
    showSyncIndicator: true,
    customOfflineMessage: '',
  }
)

const route = useRoute()

// State
const isOnline = ref(navigator.onLine)
const showOnlineToast = ref(false)
const pendingCount = ref(0)
let onlineToastTimeout: number | null = null
let pendingCheckInterval: number | null = null

// Computed
const isInTest = computed(() => {
  return route.path.includes('/practice/') || route.path.includes('/exam/')
})

const offlineMessage = computed(() => {
  if (props.customOfflineMessage) {
    return props.customOfflineMessage
  }
  if (isInTest.value) {
    return 'Your answers are saved locally and will sync when you reconnect.'
  }
  return 'Some features may not work until you reconnect.'
})

// Methods
function updateOnlineStatus(): void {
  const wasOffline = !isOnline.value
  isOnline.value = navigator.onLine

  if (wasOffline && isOnline.value) {
    // Just came back online
    showOnlineToast.value = true

    if (onlineToastTimeout) {
      clearTimeout(onlineToastTimeout)
    }

    onlineToastTimeout = window.setTimeout(() => {
      showOnlineToast.value = false
    }, 3000)
  }
}

function checkPendingRequests(): void {
  pendingCount.value = api.getPendingRequestCount()
}

// Lifecycle
onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  // Check pending requests periodically
  checkPendingRequests()
  pendingCheckInterval = window.setInterval(checkPendingRequests, 2000)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)

  if (onlineToastTimeout) {
    clearTimeout(onlineToastTimeout)
  }

  if (pendingCheckInterval) {
    clearInterval(pendingCheckInterval)
  }
})

// Watch for route changes to update test status
watch(
  () => route.path,
  () => {
    // Reset toast when navigating
    showOnlineToast.value = false
  }
)

// Expose for parent components
defineExpose({
  isOnline,
  pendingCount,
})
</script>

<style scoped>
/* Banner Styles */
.network-status-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.network-status-banner.offline {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

.banner-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-container {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
}

.message-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.title {
  font-weight: 700;
  font-size: 0.9375rem;
}

.subtitle {
  font-size: 0.8125rem;
  opacity: 0.9;
}

.pending-badge {
  flex-shrink: 0;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Toast Styles */
.network-status-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.network-status-toast.online {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
}

/* Sync Indicator */
.sync-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: #94a3b8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.sync-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #334155;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateX(-50%) translateY(20px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .banner-content {
    flex-wrap: wrap;
  }

  .pending-badge {
    width: 100%;
    text-align: center;
    margin-top: 0.5rem;
  }

  .network-status-toast {
    bottom: 80px;
    left: 1rem;
    right: 1rem;
    transform: none;
  }

  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: translateY(20px);
  }
}
</style>
