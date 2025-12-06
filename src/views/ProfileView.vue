<template>
  <div style="min-height: 100vh; background: #0f172a; padding-bottom: 6rem;">
    <LanguageToggle />

    <!-- Header -->
    <div style="background: #1e293b; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);">
      <div style="max-width: 64rem; margin: 0 auto; padding: 1rem 1.5rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <button
            @click="$router.back()"
            style="padding: 0.5rem; border-radius: 0.5rem; background: rgba(59, 130, 246, 0.1); border: none; cursor: pointer; transition: all 0.2s;"
            @mouseover="($event.currentTarget as HTMLElement).style.background = 'rgba(59, 130, 246, 0.2)'"
            @mouseout="($event.currentTarget as HTMLElement).style.background = 'rgba(59, 130, 246, 0.1)'"
          >
            <ChevronLeft style="width: 1.5rem; height: 1.5rem; color: #3b82f6;" />
          </button>
          <h1 style="font-size: 1.5rem; font-weight: 700; color: white;">Profile</h1>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div style="max-width: 64rem; margin: 0 auto; padding: 1.5rem;">
      <div style="background: #1e293b; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="width: 6rem; height: 6rem; background: rgba(59, 130, 246, 0.2); border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
            <span style="font-size: 2.5rem; font-weight: 700; color: #3b82f6;">{{ userInitial }}</span>
          </div>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: white;">{{ authStore.user?.full_name }}</h2>
          <p style="color: #94a3b8;">{{ authStore.user?.email }}</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #d1d5db; margin-bottom: 0.5rem;">
              Full Name
            </label>
            <input
              v-model="fullName"
              type="text"
              placeholder="Enter your full name"
              style="width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #334155; background: #0f172a; color: #e0e0e0;"
              @focus="($event.target as HTMLElement).style.borderColor = '#3b82f6'"
              @blur="($event.target as HTMLElement).style.borderColor = '#334155'"
            />
          </div>

          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #d1d5db; margin-bottom: 0.5rem;">
              Email
            </label>
            <input
              type="email"
              :value="authStore.user?.email"
              disabled
              style="width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #334155; background: #0f172a; color: #e0e0e0; cursor: not-allowed; opacity: 0.6;"
            />
            <p style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">Email cannot be changed</p>
          </div>

          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #d1d5db; margin-bottom: 0.5rem;">
              Phone Number (Optional)
            </label>
            <input
              v-model="phone"
              type="tel"
              placeholder="Enter your phone number"
              style="width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #334155; background: #0f172a; color: #e0e0e0;"
              @focus="($event.target as HTMLElement).style.borderColor = '#3b82f6'"
              @blur="($event.target as HTMLElement).style.borderColor = '#334155'"
            />
          </div>

          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #d1d5db; margin-bottom: 0.5rem;">
              Preferred Language
            </label>
            <select
              v-model="preferredLanguage"
              style="width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #334155; background: #0f172a; color: #e0e0e0; cursor: pointer;"
              @focus="($event.target as HTMLElement).style.borderColor = '#3b82f6'"
              @blur="($event.target as HTMLElement).style.borderColor = '#334155'"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>

          <button
            @click="saveProfile"
            :disabled="isSaving"
            style="width: 100%; padding: 1rem; border-radius: 0.75rem; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem;"
            :style="{
              background: isSaving ? '#334155' : '#3b82f6',
              color: 'white',
              opacity: isSaving ? '0.6' : '1',
              cursor: isSaving ? 'not-allowed' : 'pointer'
            }"
          >
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>

        <!-- Change Password Section -->
        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #334155;">
          <h3 style="font-size: 1.125rem; font-weight: 700; color: white; margin-bottom: 1rem;">Change Password</h3>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #d1d5db; margin-bottom: 0.5rem;">
                Current Password
              </label>
              <input
                v-model="oldPassword"
                type="password"
                placeholder="Enter current password"
                style="width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #334155; background: #0f172a; color: #e0e0e0;"
                @focus="($event.target as HTMLElement).style.borderColor = '#3b82f6'"
                @blur="($event.target as HTMLElement).style.borderColor = '#334155'"
              />
            </div>

            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #d1d5db; margin-bottom: 0.5rem;">
                New Password
              </label>
              <input
                v-model="newPassword"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                style="width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #334155; background: #0f172a; color: #e0e0e0;"
                @focus="($event.target as HTMLElement).style.borderColor = '#3b82f6'"
                @blur="($event.target as HTMLElement).style.borderColor = '#334155'"
              />
            </div>

            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #d1d5db; margin-bottom: 0.5rem;">
                Confirm New Password
              </label>
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                style="width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #334155; background: #0f172a; color: #e0e0e0;"
                @focus="($event.target as HTMLElement).style.borderColor = '#3b82f6'"
                @blur="($event.target as HTMLElement).style.borderColor = '#334155'"
              />
            </div>

            <button
              @click="changePassword"
              :disabled="isChangingPassword || !oldPassword || !newPassword || newPassword !== confirmPassword"
              style="width: 100%; padding: 1rem; border-radius: 0.75rem; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s;"
              :style="{
                background: (isChangingPassword || !oldPassword || !newPassword || newPassword !== confirmPassword) ? '#334155' : '#10b981',
                color: 'white',
                opacity: (isChangingPassword || !oldPassword || !newPassword || newPassword !== confirmPassword) ? '0.6' : '1',
                cursor: (isChangingPassword || !oldPassword || !newPassword || newPassword !== confirmPassword) ? 'not-allowed' : 'pointer'
              }"
            >
              {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import api from '@/services/api'

const authStore = useAuthStore()

const fullName = ref('')
const phone = ref('')
const preferredLanguage = ref('en')
const isSaving = ref(false)

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isChangingPassword = ref(false)

const userInitial = computed(() => {
  return authStore.user?.full_name?.charAt(0).toUpperCase() || 'U'
})

onMounted(() => {
  if (authStore.user) {
    fullName.value = authStore.user.full_name || ''
    phone.value = authStore.user.phone || ''
    preferredLanguage.value = authStore.user.preferred_language || 'en'
  }
})

async function saveProfile() {
  if (isSaving.value) return

  isSaving.value = true
  try {
    const updatedUser = await api.updateProfile({
      full_name: fullName.value,
      phone: phone.value,
      preferred_language: preferredLanguage.value as 'en' | 'hi'
    })

    // Update the auth store
    if (authStore.user) {
      authStore.user.full_name = updatedUser.full_name
      authStore.user.phone = updatedUser.phone
      authStore.user.preferred_language = updatedUser.preferred_language
    }

    alert('Profile updated successfully!')
  } catch (error) {
    console.error('Failed to update profile:', error)
    alert('Failed to update profile. Please try again.')
  } finally {
    isSaving.value = false
  }
}

async function changePassword() {
  if (isChangingPassword.value || !oldPassword.value || !newPassword.value) return

  if (newPassword.value !== confirmPassword.value) {
    alert('Passwords do not match!')
    return
  }

  if (newPassword.value.length < 6) {
    alert('Password must be at least 6 characters long!')
    return
  }

  isChangingPassword.value = true
  try {
    await api.changePassword(oldPassword.value, newPassword.value)

    // Clear form
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    alert('Password changed successfully!')
  } catch (error: any) {
    console.error('Failed to change password:', error)
    const errorMsg = error.response?.data?.detail || 'Failed to change password. Please check your current password.'
    alert(errorMsg)
  } finally {
    isChangingPassword.value = false
  }
}
</script>
