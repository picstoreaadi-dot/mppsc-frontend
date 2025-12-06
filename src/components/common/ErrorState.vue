<template>
  <div
    class="error-state"
    :class="[`error-state--${variant}`, { 'error-state--full-page': fullPage }]"
    role="alert"
  >
    <div class="error-state__content">
      <!-- Icon -->
      <div class="error-state__icon" :class="`error-state__icon--${iconType}`">
        <!-- Network Error Icon -->
        <svg v-if="iconType === 'network'" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>

        <!-- Server Error Icon -->
        <svg v-else-if="iconType === 'server'" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
          <path d="M22 12 L12 12 M12 12 L14 10 M12 12 L14 14" stroke="#ef4444" stroke-width="2"></path>
        </svg>

        <!-- Not Found Icon -->
        <svg v-else-if="iconType === 'not-found'" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>

        <!-- Forbidden Icon -->
        <svg v-else-if="iconType === 'forbidden'" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          <line x1="12" y1="15" x2="12" y2="17"></line>
        </svg>

        <!-- Generic Error Icon -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>

      <!-- Title -->
      <h2 class="error-state__title">{{ displayTitle }}</h2>

      <!-- Message -->
      <p class="error-state__message">{{ displayMessage }}</p>

      <!-- Error Details (collapsible for developers) -->
      <details v-if="showDetails && errorCode" class="error-state__details">
        <summary>Technical Details</summary>
        <pre>{{ errorDetails }}</pre>
      </details>

      <!-- Actions -->
      <div class="error-state__actions">
        <button
          v-if="retryable && typeof onRetry === 'function'"
          class="error-state__button error-state__button--primary"
          :disabled="isRetrying"
          @click="handleRetry"
        >
          <svg v-if="isRetrying" class="error-state__spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          {{ isRetrying ? 'Retrying...' : 'Try Again' }}
        </button>

        <button
          v-if="showHomeButton"
          class="error-state__button error-state__button--secondary"
          @click="goHome"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Go to Dashboard
        </button>

        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { ErrorCode } from '@/services/api'

const props = withDefaults(
  defineProps<{
    /** Error title (optional - auto-generated based on code if not provided) */
    title?: string
    /** Error message */
    message?: string
    /** Error code from API */
    errorCode?: ErrorCode
    /** HTTP status code */
    statusCode?: number
    /** Whether the error is retryable */
    retryable?: boolean
    /** Callback function for retry */
    onRetry?: () => Promise<void> | void
    /** Visual variant */
    variant?: 'default' | 'inline' | 'card'
    /** Full page mode */
    fullPage?: boolean
    /** Show home/dashboard button */
    showHomeButton?: boolean
    /** Show technical details */
    showDetails?: boolean
  }>(),
  {
    title: '',
    message: '',
    errorCode: undefined,
    statusCode: undefined,
    retryable: true,
    onRetry: undefined,
    variant: 'default',
    fullPage: false,
    showHomeButton: true,
    showDetails: false,
  }
)

const emit = defineEmits<{
  retry: []
}>()

const router = useRouter()
const isRetrying = ref(false)

// Error type configuration
const errorConfig: Record<ErrorCode, { title: string; icon: string }> = {
  NETWORK_ERROR: {
    title: 'Connection Lost',
    icon: 'network',
  },
  TIMEOUT: {
    title: 'Request Timeout',
    icon: 'network',
  },
  UNAUTHORIZED: {
    title: 'Session Expired',
    icon: 'forbidden',
  },
  FORBIDDEN: {
    title: 'Access Denied',
    icon: 'forbidden',
  },
  NOT_FOUND: {
    title: 'Not Found',
    icon: 'not-found',
  },
  VALIDATION_ERROR: {
    title: 'Invalid Data',
    icon: 'error',
  },
  SERVER_ERROR: {
    title: 'Server Error',
    icon: 'server',
  },
  SERVICE_UNAVAILABLE: {
    title: 'Service Unavailable',
    icon: 'server',
  },
  RATE_LIMITED: {
    title: 'Too Many Requests',
    icon: 'error',
  },
  UNKNOWN_ERROR: {
    title: 'Something Went Wrong',
    icon: 'error',
  },
}

// Computed
const iconType = computed(() => {
  if (props.errorCode && errorConfig[props.errorCode]) {
    return errorConfig[props.errorCode].icon
  }
  return 'error'
})

const displayTitle = computed(() => {
  if (props.title) return props.title
  if (props.errorCode && errorConfig[props.errorCode]) {
    return errorConfig[props.errorCode].title
  }
  return 'Something Went Wrong'
})

const displayMessage = computed(() => {
  if (props.message) return props.message
  return 'An unexpected error occurred. Please try again.'
})

const errorDetails = computed(() => {
  return JSON.stringify(
    {
      code: props.errorCode,
      status: props.statusCode,
      timestamp: new Date().toISOString(),
    },
    null,
    2
  )
})

// Methods
async function handleRetry(): Promise<void> {
  if (isRetrying.value) return

  isRetrying.value = true
  emit('retry')

  try {
    if (props.onRetry) {
      await props.onRetry()
    }
  } finally {
    isRetrying.value = false
  }
}

function goHome(): void {
  router.push('/dashboard')
}
</script>

<style scoped>
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.error-state--full-page {
  min-height: 60vh;
}

.error-state--inline {
  padding: 1rem;
}

.error-state--card {
  background: #1e293b;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

.error-state__content {
  max-width: 400px;
}

/* Icon Styles */
.error-state__icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-state__icon--network {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.error-state__icon--server {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.error-state__icon--not-found {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.error-state__icon--forbidden {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.error-state__icon--error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Text Styles */
.error-state__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
}

.error-state__message {
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* Details */
.error-state__details {
  margin-bottom: 1.5rem;
  text-align: left;
}

.error-state__details summary {
  cursor: pointer;
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.error-state__details pre {
  background: #0f172a;
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: #94a3b8;
  overflow-x: auto;
}

/* Actions */
.error-state__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.error-state__button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.error-state__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-state__button--primary {
  background: #3b82f6;
  color: white;
}

.error-state__button--primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.error-state__button--secondary {
  background: #334155;
  color: white;
}

.error-state__button--secondary:hover:not(:disabled) {
  background: #475569;
}

/* Spinner */
.error-state__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Inline variant */
.error-state--inline .error-state__icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
}

.error-state--inline .error-state__icon svg {
  width: 24px;
  height: 24px;
}

.error-state--inline .error-state__title {
  font-size: 1.125rem;
}

.error-state--inline .error-state__message {
  font-size: 0.875rem;
}

.error-state--inline .error-state__button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Mobile */
@media (max-width: 640px) {
  .error-state__actions {
    flex-direction: column;
    width: 100%;
  }

  .error-state__button {
    width: 100%;
    justify-content: center;
  }
}
</style>
