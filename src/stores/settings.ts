// ============================================================================
// Settings Store
// Manages app settings (language, dark mode, preferences)
// ============================================================================

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Language } from '@/types'
import { useAuthStore } from './auth'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const language = ref<Language>('en')
  const darkMode = ref(false)
  const soundEnabled = ref(true)
  const hapticEnabled = ref(true)
  const autoSaveAnswers = ref(true)

  // Load from localStorage
  const loadSettings = () => {
    const saved = localStorage.getItem('app_settings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        language.value = settings.language || 'en'
        darkMode.value = settings.darkMode || false
        soundEnabled.value = settings.soundEnabled !== false
        hapticEnabled.value = settings.hapticEnabled !== false
        autoSaveAnswers.value = settings.autoSaveAnswers !== false
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
    }

    // Check system dark mode preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      darkMode.value = true
    }

    // Sync with user's preferred language from auth
    const authStore = useAuthStore()
    if (authStore.user?.preferred_language) {
      language.value = authStore.user.preferred_language
    }
  }

  // Save to localStorage
  const saveSettings = () => {
    const settings = {
      language: language.value,
      darkMode: darkMode.value,
      soundEnabled: soundEnabled.value,
      hapticEnabled: hapticEnabled.value,
      autoSaveAnswers: autoSaveAnswers.value,
    }
    localStorage.setItem('app_settings', JSON.stringify(settings))
  }

  // Watch for changes and auto-save
  watch([language, darkMode, soundEnabled, hapticEnabled, autoSaveAnswers], () => {
    saveSettings()
  })

  // Apply dark mode class to document
  watch(darkMode, (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, { immediate: true })

  // Actions
  function toggleLanguage() {
    language.value = language.value === 'en' ? 'hi' : 'en'
  }

  function setLanguage(lang: Language) {
    language.value = lang
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
  }

  function setDarkMode(enabled: boolean) {
    darkMode.value = enabled
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
  }

  function toggleHaptic() {
    hapticEnabled.value = !hapticEnabled.value
  }

  function toggleAutoSave() {
    autoSaveAnswers.value = !autoSaveAnswers.value
  }

  // Haptic feedback (vibration)
  function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
    if (!hapticEnabled.value) return

    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 40,
      }
      navigator.vibrate(patterns[type])
    }
  }

  // Play sound effect
  function playSound(type: 'correct' | 'incorrect' | 'click' | 'complete') {
    if (!soundEnabled.value) return

    // TODO: Implement sound effects with Web Audio API or HTML5 Audio
    console.log('Playing sound:', type)
  }

  // Initialize
  loadSettings()

  return {
    // State
    language,
    darkMode,
    soundEnabled,
    hapticEnabled,
    autoSaveAnswers,

    // Actions
    toggleLanguage,
    setLanguage,
    toggleDarkMode,
    setDarkMode,
    toggleSound,
    toggleHaptic,
    toggleAutoSave,
    triggerHaptic,
    playSound,
    loadSettings,
    saveSettings,
  }
})
