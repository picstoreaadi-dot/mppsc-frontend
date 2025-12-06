<template>
  <div
    class="loading-state"
    :class="[`loading-state--${variant}`, { 'loading-state--full-page': fullPage }]"
    role="status"
    :aria-label="loadingText"
  >
    <!-- Spinner Variant -->
    <template v-if="variant === 'spinner'">
      <div class="loading-spinner" :class="`loading-spinner--${size}`">
        <div class="loading-spinner__ring"></div>
      </div>
      <p v-if="showText" class="loading-state__text">{{ loadingText }}</p>
    </template>

    <!-- Skeleton Variant -->
    <template v-else-if="variant === 'skeleton'">
      <slot>
        <!-- Default skeleton layout based on type -->
        <template v-if="skeletonType === 'card'">
          <div class="skeleton-card">
            <div class="skeleton skeleton--circle skeleton--avatar"></div>
            <div class="skeleton-card__content">
              <div class="skeleton skeleton--text skeleton--title"></div>
              <div class="skeleton skeleton--text skeleton--subtitle"></div>
            </div>
          </div>
        </template>

        <template v-else-if="skeletonType === 'list'">
          <div
            v-for="i in skeletonCount"
            :key="i"
            class="skeleton-list-item"
          >
            <div class="skeleton skeleton--circle skeleton--avatar-sm"></div>
            <div class="skeleton-list-item__content">
              <div class="skeleton skeleton--text skeleton--line-lg"></div>
              <div class="skeleton skeleton--text skeleton--line-sm"></div>
            </div>
          </div>
        </template>

        <template v-else-if="skeletonType === 'stats'">
          <div class="skeleton-stats">
            <div
              v-for="i in 4"
              :key="i"
              class="skeleton-stat-card"
            >
              <div class="skeleton skeleton--text skeleton--stat-value"></div>
              <div class="skeleton skeleton--text skeleton--stat-label"></div>
            </div>
          </div>
        </template>

        <template v-else-if="skeletonType === 'dashboard'">
          <!-- Stats Row -->
          <div class="skeleton-stats skeleton-stats--mb">
            <div
              v-for="i in 4"
              :key="i"
              class="skeleton-stat-card"
            >
              <div class="skeleton skeleton--text skeleton--stat-value"></div>
              <div class="skeleton skeleton--text skeleton--stat-label"></div>
            </div>
          </div>

          <!-- Cards Grid -->
          <div class="skeleton-grid">
            <div
              v-for="i in 4"
              :key="i"
              class="skeleton-card skeleton-card--large"
            >
              <div class="skeleton skeleton--text skeleton--title"></div>
              <div class="skeleton skeleton--text skeleton--line-full"></div>
              <div class="skeleton skeleton--text skeleton--line-lg"></div>
            </div>
          </div>
        </template>

        <template v-else-if="skeletonType === 'leaderboard'">
          <div class="skeleton-leaderboard">
            <!-- Header -->
            <div class="skeleton-leaderboard__header">
              <div class="skeleton skeleton--text skeleton--stat-value"></div>
              <div class="skeleton skeleton--text skeleton--line-sm"></div>
            </div>
            <!-- List -->
            <div
              v-for="i in 5"
              :key="i"
              class="skeleton-leaderboard__item"
            >
              <div class="skeleton skeleton--text skeleton--rank"></div>
              <div class="skeleton skeleton--circle skeleton--avatar-sm"></div>
              <div class="skeleton-leaderboard__content">
                <div class="skeleton skeleton--text skeleton--line-md"></div>
                <div class="skeleton skeleton--text skeleton--line-sm"></div>
              </div>
              <div class="skeleton skeleton--text skeleton--score"></div>
            </div>
          </div>
        </template>

        <template v-else-if="skeletonType === 'question'">
          <div class="skeleton-question">
            <div class="skeleton-question__header">
              <div class="skeleton skeleton--text skeleton--badge"></div>
              <div class="skeleton skeleton--text skeleton--badge"></div>
            </div>
            <div class="skeleton skeleton--text skeleton--line-full"></div>
            <div class="skeleton skeleton--text skeleton--line-full"></div>
            <div class="skeleton skeleton--text skeleton--line-lg"></div>
            <div class="skeleton-options">
              <div
                v-for="i in 4"
                :key="i"
                class="skeleton-option"
              >
                <div class="skeleton skeleton--circle skeleton--option-letter"></div>
                <div class="skeleton skeleton--text skeleton--line-full"></div>
              </div>
            </div>
          </div>
        </template>

        <!-- Default: simple lines -->
        <template v-else>
          <div
            v-for="i in skeletonCount"
            :key="i"
            class="skeleton skeleton--text skeleton--line-full"
            :style="{ width: getRandomWidth(i) }"
          ></div>
        </template>
      </slot>
    </template>

    <!-- Pulse Variant (simple dots) -->
    <template v-else-if="variant === 'pulse'">
      <div class="loading-pulse">
        <div class="loading-pulse__dot"></div>
        <div class="loading-pulse__dot"></div>
        <div class="loading-pulse__dot"></div>
      </div>
      <p v-if="showText" class="loading-state__text">{{ loadingText }}</p>
    </template>

    <!-- Progress Variant -->
    <template v-else-if="variant === 'progress'">
      <div class="loading-progress">
        <div
          class="loading-progress__bar"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <p v-if="showText" class="loading-state__text">{{ loadingText }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Loading variant */
    variant?: 'spinner' | 'skeleton' | 'pulse' | 'progress'
    /** Skeleton type for pre-built layouts */
    skeletonType?: 'card' | 'list' | 'stats' | 'dashboard' | 'leaderboard' | 'question' | 'default'
    /** Number of skeleton items to show */
    skeletonCount?: number
    /** Size for spinner variant */
    size?: 'sm' | 'md' | 'lg'
    /** Loading text to display */
    text?: string
    /** Whether to show loading text */
    showText?: boolean
    /** Full page mode */
    fullPage?: boolean
    /** Progress percentage (for progress variant) */
    progress?: number
  }>(),
  {
    variant: 'spinner',
    skeletonType: 'default',
    skeletonCount: 3,
    size: 'md',
    text: '',
    showText: true,
    fullPage: false,
    progress: 0,
  }
)

const loadingText = computed(() => {
  return props.text || 'Loading...'
})

function getRandomWidth(seed: number): string {
  const widths = ['100%', '90%', '75%', '85%', '60%']
  return widths[seed % widths.length]
}
</script>

<style scoped>
/* Base Styles */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-state--full-page {
  min-height: 60vh;
}

.loading-state__text {
  margin-top: 1rem;
  color: #94a3b8;
  font-size: 0.9375rem;
}

/* Spinner Variant */
.loading-spinner {
  position: relative;
}

.loading-spinner--sm {
  width: 24px;
  height: 24px;
}

.loading-spinner--md {
  width: 48px;
  height: 48px;
}

.loading-spinner--lg {
  width: 64px;
  height: 64px;
}

.loading-spinner__ring {
  width: 100%;
  height: 100%;
  border: 4px solid #334155;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner--sm .loading-spinner__ring {
  border-width: 2px;
}

.loading-spinner--lg .loading-spinner__ring {
  border-width: 5px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Pulse Variant */
.loading-pulse {
  display: flex;
  gap: 0.5rem;
}

.loading-pulse__dot {
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border-radius: 50%;
  animation: pulse-dot 1.4s ease-in-out infinite both;
}

.loading-pulse__dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-pulse__dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes pulse-dot {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Progress Variant */
.loading-progress {
  width: 200px;
  height: 6px;
  background: #334155;
  border-radius: 9999px;
  overflow: hidden;
}

.loading-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

/* Skeleton Base */
.skeleton {
  background: linear-gradient(
    90deg,
    #1e293b 25%,
    #334155 50%,
    #1e293b 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: 0.375rem;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Skeleton Shapes */
.skeleton--circle {
  border-radius: 50%;
}

.skeleton--avatar {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.skeleton--avatar-sm {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.skeleton--option-letter {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.skeleton--text {
  height: 16px;
}

.skeleton--title {
  width: 60%;
  height: 20px;
  margin-bottom: 0.5rem;
}

.skeleton--subtitle {
  width: 40%;
  height: 14px;
}

.skeleton--line-full {
  width: 100%;
  margin-bottom: 0.75rem;
}

.skeleton--line-lg {
  width: 80%;
  margin-bottom: 0.75rem;
}

.skeleton--line-md {
  width: 60%;
  margin-bottom: 0.5rem;
}

.skeleton--line-sm {
  width: 40%;
}

.skeleton--stat-value {
  width: 60px;
  height: 32px;
  margin-bottom: 0.5rem;
}

.skeleton--stat-label {
  width: 80px;
  height: 12px;
}

.skeleton--badge {
  width: 80px;
  height: 24px;
  border-radius: 9999px;
}

.skeleton--rank {
  width: 30px;
  height: 24px;
}

.skeleton--score {
  width: 50px;
  height: 24px;
}

/* Skeleton Layouts */
.skeleton-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #1e293b;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
}

.skeleton-card--large {
  flex-direction: column;
  align-items: flex-start;
  padding: 1.5rem;
}

.skeleton-card__content {
  flex: 1;
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #334155;
}

.skeleton-list-item__content {
  flex: 1;
}

.skeleton-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  width: 100%;
}

.skeleton-stats--mb {
  margin-bottom: 2rem;
}

.skeleton-stat-card {
  background: #1e293b;
  padding: 1.25rem;
  border-radius: 0.75rem;
  text-align: center;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  width: 100%;
}

.skeleton-leaderboard {
  width: 100%;
  max-width: 600px;
}

.skeleton-leaderboard__header {
  background: #1e293b;
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
}

.skeleton-leaderboard__item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #1e293b;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

.skeleton-leaderboard__content {
  flex: 1;
}

.skeleton-question {
  width: 100%;
  max-width: 800px;
  background: #1e293b;
  padding: 2rem;
  border-radius: 1rem;
}

.skeleton-question__header {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.skeleton-options {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #0f172a;
  border-radius: 0.5rem;
}

/* Skeleton variant overrides */
.loading-state--skeleton {
  align-items: stretch;
  width: 100%;
  padding: 0;
}
</style>
