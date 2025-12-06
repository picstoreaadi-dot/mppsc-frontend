<template>
  <div
    v-if="isOpen"
    style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem;"
    @click="$emit('close')"
  >
    <div
      style="background: #1e293b; border-radius: 1rem; padding: 2rem; max-width: 42rem; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);"
      @click.stop
    >
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: white;">Start Practice</h2>
        <button
          @click="$emit('close')"
          style="padding: 0.5rem; border-radius: 0.5rem; background: rgba(148, 163, 184, 0.1); border: none; cursor: pointer; transition: all 0.2s;"
          @mouseover="$event.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)'"
          @mouseout="$event.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Topic Selection -->
      <div style="margin-bottom: 2rem;">
        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #e0e0e0; margin-bottom: 0.75rem;">
          Select Topic
        </label>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem;">
          <button
            v-for="topic in topics"
            :key="topic.id"
            @click="selectedTopic = topic.id"
            style="padding: 1rem; border-radius: 0.75rem; border: 2px solid; text-align: left; cursor: pointer; transition: all 0.2s;"
            :style="{
              borderColor: selectedTopic === topic.id ? '#3b82f6' : '#334155',
              background: selectedTopic === topic.id ? 'rgba(59, 130, 246, 0.1)' : '#0f172a'
            }"
          >
            <div style="font-weight: 600; color: white; margin-bottom: 0.25rem;">
              {{ language === 'hi' ? topic.name_hi : topic.name_en }}
            </div>
            <div style="font-size: 0.75rem; color: #94a3b8;">
              {{ topic.id }}
            </div>
          </button>
        </div>
      </div>

      <!-- Number of Questions -->
      <div style="margin-bottom: 2rem;">
        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #e0e0e0; margin-bottom: 0.75rem;">
          Number of Questions: {{ numQuestions }}
        </label>
        <input
          type="range"
          v-model.number="numQuestions"
          min="5"
          max="50"
          step="5"
          style="width: 100%; height: 0.5rem; border-radius: 9999px; background: #334155; outline: none; cursor: pointer;"
        />
        <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.75rem; color: #94a3b8;">
          <span>5 questions</span>
          <span>50 questions</span>
        </div>
      </div>

      <!-- Estimated Time -->
      <div style="padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: 0.75rem; border-left: 4px solid #3b82f6; margin-bottom: 2rem;">
        <div style="font-size: 0.875rem; color: #e0e0e0;">
          <strong>⏱️ Estimated Time:</strong> {{ estimatedTime }} minutes
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 1rem;">
        <button
          @click="$emit('close')"
          style="flex: 1; padding: 0.75rem; border-radius: 0.75rem; background: #334155; color: white; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s;"
          @mouseover="$event.currentTarget.style.background = '#475569'"
          @mouseout="$event.currentTarget.style.background = '#334155'"
        >
          Cancel
        </button>
        <button
          @click="startPractice"
          :disabled="!selectedTopic"
          style="flex: 1; padding: 0.75rem; border-radius: 0.75rem; background: #3b82f6; color: white; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s;"
          :style="{ opacity: !selectedTopic ? '0.5' : '1', cursor: !selectedTopic ? 'not-allowed' : 'pointer' }"
          @mouseover="selectedTopic && ($event.currentTarget.style.background = '#2563eb')"
          @mouseout="selectedTopic && ($event.currentTarget.style.background = '#3b82f6')"
        >
          Start Practice
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { TOPICS } from '@/types'
import type { TopicId } from '@/types'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  start: [{ topic: TopicId; numQuestions: number }]
}>()

const settingsStore = useSettingsStore()
const { language } = storeToRefs(settingsStore)

const topics = TOPICS
const selectedTopic = ref<TopicId | null>(null)
const numQuestions = ref(20)

const estimatedTime = computed(() => {
  // Estimate 1.5 minutes per question
  return Math.ceil(numQuestions.value * 1.5)
})

function startPractice() {
  if (selectedTopic.value) {
    emit('start', {
      topic: selectedTopic.value,
      numQuestions: numQuestions.value
    })
  }
}
</script>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>
