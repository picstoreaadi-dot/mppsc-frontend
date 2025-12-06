<template>
  <div
    @click="$emit('click')"
    style="display: flex; align-items: center; justify-content: between; padding: 1.25rem; border-radius: 0.75rem; border: 1px solid #334155; background: #0f172a; cursor: pointer; transition: all 0.2s;"
    @mouseover="$event.currentTarget.style.borderColor = '#3b82f6'; $event.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.2)'"
    @mouseout="$event.currentTarget.style.borderColor = '#334155'; $event.currentTarget.style.boxShadow = 'none'"
  >
    <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
      <div style="flex-shrink: 0; width: 3rem; height: 3rem; background: rgba(16, 185, 129, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <div style="flex: 1;">
        <h4 style="font-weight: 600; color: white; margin-bottom: 0.25rem;">
          {{ test.name }}
        </h4>
        <p style="font-size: 0.875rem; color: #94a3b8;">
          {{ test.date }} • {{ test.questions }} questions
        </p>
      </div>

      <div style="text-align: right;">
        <div style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.25rem;">
          {{ test.score }}%
        </div>
        <div style="font-size: 0.75rem; color: #94a3b8;">
          {{ test.answered }}/{{ test.questions }}
        </div>
      </div>
    </div>

    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="margin-left: 1rem;">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  test: {
    id: string
    name: string
    date: string
    questions: number
    answered: number
    score: number
  }
}>()

defineEmits(['click'])
</script>
