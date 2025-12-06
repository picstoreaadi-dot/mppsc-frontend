<template>
  <div
    @click="$emit('click')"
    style="background: #0f172a; border: 2px solid #334155; border-radius: 0.75rem; padding: 1.25rem; cursor: pointer; transition: all 0.2s;"
    @mouseover="$event.currentTarget.style.borderColor = '#3b82f6'"
    @mouseout="$event.currentTarget.style.borderColor = '#334155'"
  >
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
      <h4 style="font-weight: 600; color: white; font-size: 1rem;">
        {{ topic.name }}
      </h4>
      <span style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: rgba(239, 68, 68, 0.2); color: #fca5a5;">
        {{ topic.strength }}
      </span>
    </div>

    <!-- Progress Bar -->
    <div style="width: 100%; height: 0.5rem; background: #334155; border-radius: 9999px; overflow: hidden; margin-bottom: 0.75rem;">
      <div
        style="height: 100%; background: #3b82f6; transition: width 0.5s ease-out;"
        :style="{ width: topic.accuracy + '%' }"
      ></div>
    </div>

    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem;">
      <span style="color: #94a3b8;">
        {{ topic.total }} questions
      </span>
      <span style="font-weight: 600; color: #3b82f6;">
        {{ topic.accuracy.toFixed(1) }}%
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  topic: {
    id: string
    name: string
    accuracy: number
    total: number
    strength: string
  }
}>()

defineEmits(['click'])
</script>
