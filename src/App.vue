<template>
  <div id="app">
    <!-- Global Network Status Banner -->
    <NetworkStatus />

    <!-- Global Error Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div
          v-if="globalError"
          class="global-error-toast"
          role="alert"
        >
          <div class="global-error-toast__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="global-error-toast__content">
            <span class="global-error-toast__message">{{ globalError.message }}</span>
          </div>
          <button
            class="global-error-toast__close"
            @click="dismissError"
            aria-label="Dismiss error"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- Main Router View -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useSettingsStore } from './stores/settings'
import { apiErrorBus, type APIError } from './services/api'
import NetworkStatus from './components/common/NetworkStatus.vue'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

// Global error state
const globalError = ref<APIError | null>(null)
let errorTimeout: number | null = null

// Error handling
function handleGlobalError(error: APIError): void {
  // Don't show errors that are handled locally (like 401, 404)
  if (error.code === 'UNAUTHORIZED' || error.code === 'NOT_FOUND') {
    return
  }

  globalError.value = error

  // Auto-dismiss after 5 seconds
  if (errorTimeout) {
    clearTimeout(errorTimeout)
  }
  errorTimeout = window.setTimeout(() => {
    globalError.value = null
  }, 5000)
}

function handleAuthFailure(): void {
  // Redirect to login on auth failure
  router.push('/login')
}

function dismissError(): void {
  globalError.value = null
  if (errorTimeout) {
    clearTimeout(errorTimeout)
  }
}

// Lifecycle
onMounted(async () => {
  // Initialize auth state
  await authStore.initialize()

  // Load settings (including dark mode)
  settingsStore.loadSettings()

  // Subscribe to global errors
  const unsubError = apiErrorBus.onError(handleGlobalError)
  const unsubAuth = apiErrorBus.onAuthFailure(handleAuthFailure)

  // Store unsubscribe functions for cleanup
  ;(window as any).__apiErrorUnsubscribers = [unsubError, unsubAuth]
})

onUnmounted(() => {
  // Cleanup subscriptions
  const unsubs = (window as any).__apiErrorUnsubscribers
  if (unsubs) {
    unsubs.forEach((unsub: () => void) => unsub())
  }

  if (errorTimeout) {
    clearTimeout(errorTimeout)
  }
})
</script>

<style>
/* Global styles are in style.css */
#app {
  min-height: 100vh;
}

/* Global Error Toast */
.global-error-toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(220, 38, 38, 0.4);
  max-width: calc(100% - 2rem);
  width: auto;
  min-width: 300px;
}

.global-error-toast__icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.global-error-toast__content {
  flex: 1;
  min-width: 0;
}

.global-error-toast__message {
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.4;
}

.global-error-toast__close {
  flex-shrink: 0;
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 0.375rem;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.global-error-toast__close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Toast Animation */
.toast-enter-active,
.toast-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(-50%) translateY(-20px);
  opacity: 0;
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .global-error-toast {
    left: 1rem;
    right: 1rem;
    transform: none;
    min-width: auto;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: translateY(-20px);
  }
}
</style>
