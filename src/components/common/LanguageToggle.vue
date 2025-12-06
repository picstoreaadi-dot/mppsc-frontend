<template>
  <button
    @click="toggleLanguage"
    class="lang-toggle"
    :aria-label="language === 'en' ? 'Switch to Hindi' : 'Switch to English'"
  >
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <span style="font-size: 1.125rem; font-weight: 600;">{{ language === 'en' ? 'अ' : 'A' }}</span>
      <div
        style="position: relative; width: 3rem; height: 1.5rem; border-radius: 9999px; transition: background-color 0.3s;"
        :style="{ backgroundColor: language === 'en' ? '#3b82f6' : '#f59e0b' }"
      >
        <div
          style="position: absolute; top: 0.25rem; left: 0.25rem; width: 1rem; height: 1rem; background: white; border-radius: 9999px; transition: transform 0.3s;"
          :style="{ transform: language === 'hi' ? 'translateX(1.5rem)' : 'translateX(0)' }"
        ></div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const { language } = storeToRefs(settingsStore)

function toggleLanguage() {
  settingsStore.toggleLanguage()
  settingsStore.triggerHaptic('light')
}
</script>
