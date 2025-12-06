<template>
  <div style="min-height: 100vh; background: #0f172a; padding-bottom: 6rem;">
    <LanguageToggle />

    <!-- Header -->
    <div style="background: #1e293b; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);">
      <div style="max-width: 64rem; margin: 0 auto; padding: 1rem 1.5rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <button
            @click="$router.back()"
            style="padding: 0.5rem; border-radius: 0.5rem; background: rgba(59, 130, 246, 0.1); border: none; cursor: pointer;"
          >
            <ChevronLeft style="width: 1.5rem; height: 1.5rem; color: #3b82f6;" />
          </button>
          <h1 style="font-size: 1.5rem; font-weight: 700; color: white;">Settings</h1>
        </div>
      </div>
    </div>

    <div style="max-width: 64rem; margin: 0 auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
      <!-- Appearance -->
      <div style="background: #1e293b; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
        <h2 style="font-size: 1.125rem; font-weight: 700; color: white; margin-bottom: 1rem;">Appearance</h2>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 500; color: white;">Dark Mode</div>
              <div style="font-size: 0.875rem; color: #94a3b8;">Reduce eye strain during night study</div>
            </div>
            <button
              @click="settingsStore.toggleDarkMode()"
              style="position: relative; width: 3.5rem; height: 2rem; border-radius: 9999px; transition: all 0.2s; border: none; cursor: pointer;"
              :style="{ background: darkMode ? '#3b82f6' : '#64748b' }"
            >
              <div
                style="position: absolute; top: 0.25rem; left: 0.25rem; width: 1.5rem; height: 1.5rem; background: white; border-radius: 9999px; transition: transform 0.2s;"
                :style="{ transform: darkMode ? 'translateX(1.5rem)' : 'translateX(0)' }"
              ></div>
            </button>
          </div>

          <div style="border-top: 1px solid #334155; padding-top: 1rem;">
            <div style="font-weight: 500; color: white; margin-bottom: 0.5rem;">Language</div>
            <div style="display: flex; gap: 0.5rem;">
              <button
                @click="settingsStore.setLanguage('en')"
                style="flex: 1; padding: 0.5rem; border-radius: 0.5rem; font-weight: 500; transition: all 0.2s; border: none; cursor: pointer;"
                :style="{
                  background: language === 'en' ? '#3b82f6' : '#334155',
                  color: 'white'
                }"
              >
                English
              </button>
              <button
                @click="settingsStore.setLanguage('hi')"
                style="flex: 1; padding: 0.5rem; border-radius: 0.5rem; font-weight: 500; transition: all 0.2s; border: none; cursor: pointer;"
                :style="{
                  background: language === 'hi' ? '#3b82f6' : '#334155',
                  color: 'white'
                }"
              >
                हिंदी
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Study Preferences -->
      <div style="background: #1e293b; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
        <h2 style="font-size: 1.125rem; font-weight: 700; color: white; margin-bottom: 1rem;">Study Preferences</h2>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 500; color: white;">Sound Effects</div>
              <div style="font-size: 0.875rem; color: #94a3b8;">Audio feedback for answers</div>
            </div>
            <button
              @click="settingsStore.toggleSound()"
              style="position: relative; width: 3.5rem; height: 2rem; border-radius: 9999px; transition: all 0.2s; border: none; cursor: pointer;"
              :style="{ background: soundEnabled ? '#10b981' : '#64748b' }"
            >
              <div
                style="position: absolute; top: 0.25rem; left: 0.25rem; width: 1.5rem; height: 1.5rem; background: white; border-radius: 9999px; transition: transform 0.2s;"
                :style="{ transform: soundEnabled ? 'translateX(1.5rem)' : 'translateX(0)' }"
              ></div>
            </button>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #334155; padding-top: 1rem;">
            <div>
              <div style="font-weight: 500; color: white;">Haptic Feedback</div>
              <div style="font-size: 0.875rem; color: #94a3b8;">Vibration on interactions</div>
            </div>
            <button
              @click="settingsStore.toggleHaptic()"
              style="position: relative; width: 3.5rem; height: 2rem; border-radius: 9999px; transition: all 0.2s; border: none; cursor: pointer;"
              :style="{ background: hapticEnabled ? '#10b981' : '#64748b' }"
            >
              <div
                style="position: absolute; top: 0.25rem; left: 0.25rem; width: 1.5rem; height: 1.5rem; background: white; border-radius: 9999px; transition: transform 0.2s;"
                :style="{ transform: hapticEnabled ? 'translateX(1.5rem)' : 'translateX(0)' }"
              ></div>
            </button>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #334155; padding-top: 1rem;">
            <div>
              <div style="font-weight: 500; color: white;">Auto-Save Answers</div>
              <div style="font-size: 0.875rem; color: #94a3b8;">Save answers automatically</div>
            </div>
            <button
              @click="settingsStore.toggleAutoSave()"
              style="position: relative; width: 3.5rem; height: 2rem; border-radius: 9999px; transition: all 0.2s; border: none; cursor: pointer;"
              :style="{ background: autoSaveAnswers ? '#10b981' : '#64748b' }"
            >
              <div
                style="position: absolute; top: 0.25rem; left: 0.25rem; width: 1.5rem; height: 1.5rem; background: white; border-radius: 9999px; transition: transform 0.2s;"
                :style="{ transform: autoSaveAnswers ? 'translateX(1.5rem)' : 'translateX(0)' }"
              ></div>
            </button>
          </div>
        </div>
      </div>

      <!-- Account -->
      <div style="background: #1e293b; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
        <h2 style="font-size: 1.125rem; font-weight: 700; color: white; margin-bottom: 1rem;">Account</h2>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button
            @click="$router.push('/profile')"
            style="width: 100%; text-align: left; padding: 1rem; border-radius: 0.5rem; background: transparent; border: none; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: space-between; color: white;"
            @mouseover="$event.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)'"
            @mouseout="$event.currentTarget.style.background = 'transparent'"
          >
            <span>Edit Profile</span>
            <ChevronRight style="width: 1.25rem; height: 1.25rem; color: #94a3b8;" />
          </button>

          <button
            @click="logout"
            style="width: 100%; text-align: left; padding: 1rem; border-radius: 0.5rem; background: transparent; border: none; cursor: pointer; transition: all 0.2s; color: #ef4444;"
            @mouseover="$event.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'"
            @mouseout="$event.currentTarget.style.background = 'transparent'"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import LanguageToggle from '@/components/common/LanguageToggle.vue'

const router = useRouter()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()

const { language, darkMode, soundEnabled, hapticEnabled, autoSaveAnswers } = storeToRefs(settingsStore)

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    authStore.logout()
    router.push('/login')
  }
}
</script>
