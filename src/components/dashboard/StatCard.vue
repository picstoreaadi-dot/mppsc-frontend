<template>
  <div style="background: #1e293b; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
    <div style="display: flex; align-items: center; gap: 1rem;">
      <div style="flex-shrink: 0; width: 3rem; height: 3rem; background: rgba(59, 130, 246, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>
      <div style="flex: 1;">
        <div style="font-size: 1.875rem; font-weight: 700; color: white; margin-bottom: 0.25rem;">
          {{ value }}
        </div>
        <div style="font-size: 0.875rem; color: #94a3b8;">
          {{ label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: string | number
  label: string
  icon?: string
}>()
</script>
