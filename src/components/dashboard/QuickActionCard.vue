<template>
  <div
    @click="$emit('click')"
    style="background: #1e293b; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); cursor: pointer; transition: all 0.3s; border-left: 4px solid #3b82f6;"
    @mouseover="$event.currentTarget.style.transform = 'translateY(-4px)'; $event.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.4)'"
    @mouseout="$event.currentTarget.style.transform = 'translateY(0)'; $event.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.3)'"
  >
    <div style="display: flex; align-items: start; gap: 1rem;">
      <div style="flex-shrink: 0; width: 3rem; height: 3rem; background: rgba(59, 130, 246, 0.1); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      </div>
      <div style="flex: 1;">
        <h3 style="font-size: 1.125rem; font-weight: 700; color: white; margin-bottom: 0.25rem;">
          {{ title }}
        </h3>
        <p style="font-size: 0.875rem; color: #94a3b8;">
          {{ subtitle }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  icon?: string
}>()

defineEmits(['click'])
</script>
