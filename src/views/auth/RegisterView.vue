<template>
  <div style="min-height: 100vh; background: linear-gradient(to bottom right, #10b981, #059669); display: flex; align-items: center; justify-content: center; padding: 1rem;">
    <div style="background: white; border-radius: 1rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); padding: 2rem; width: 100%; max-width: 28rem;">
      <!-- Logo/Header -->
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="width: 4rem; height: 4rem; background: #10b981; border-radius: 1rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
          <span style="font-size: 2rem; font-weight: 700; color: white;">M</span>
        </div>
        <h1 style="font-size: 1.5rem; font-weight: 700; color: #111827;">
          Create Account
        </h1>
        <p style="color: #6b7280; margin-top: 0.5rem;">
          Start your MPPSC preparation journey
        </p>
      </div>

      <!-- Error Message -->
      <div
        v-if="authStore.error"
        style="margin-bottom: 1rem; padding: 1rem; background: #fee2e2; border: 1px solid #ef4444; border-radius: 0.5rem; color: #b91c1c;"
      >
        {{ authStore.error }}
      </div>

      <!-- Register Form -->
      <form @submit.prevent="handleRegister" style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
            Full Name
          </label>
          <input
            v-model="formData.fullName"
            type="text"
            required
            style="width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #e5e7eb; background: white; color: #111827; font-size: 1rem;"
            placeholder="Rajesh Kumar"
          />
        </div>

        <div>
          <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
            Email
          </label>
          <input
            v-model="formData.email"
            type="email"
            required
            style="width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #e5e7eb; background: white; color: #111827; font-size: 1rem;"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
            Password
          </label>
          <input
            v-model="formData.password"
            type="password"
            required
            minlength="8"
            style="width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #e5e7eb; background: white; color: #111827; font-size: 1rem;"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
            Preferred Language
          </label>
          <select
            v-model="formData.language"
            style="width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #e5e7eb; background: white; color: #111827; font-size: 1rem;"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
          </select>
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          style="width: 100%; padding: 0.75rem; border-radius: 0.75rem; background: #10b981; color: white; font-weight: 600; cursor: pointer; border: none; font-size: 1rem; transition: all 0.2s; margin-top: 0.5rem;"
          :style="authStore.isLoading ? 'opacity: 0.5; cursor: not-allowed;' : ''"
        >
          <span v-if="authStore.isLoading">Creating account...</span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <!-- Divider -->
      <div style="position: relative; margin: 1.5rem 0;">
        <div style="position: absolute; inset: 0; display: flex; align-items: center;">
          <div style="width: 100%; border-top: 1px solid #e5e7eb;"></div>
        </div>
        <div style="position: relative; display: flex; justify-content: center; font-size: 0.875rem;">
          <span style="padding: 0 0.5rem; background: white; color: #6b7280;">
            Already have an account?
          </span>
        </div>
      </div>

      <!-- Login Link -->
      <router-link
        to="/login"
        style="display: block; text-align: center; padding: 0.75rem; border-radius: 0.75rem; border: 2px solid #10b981; color: #10b981; font-weight: 600; text-decoration: none; transition: all 0.2s;"
      >
        Login
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Language } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  fullName: '',
  email: '',
  password: '',
  language: 'en' as Language,
})

async function handleRegister() {
  const success = await authStore.register({
    email: formData.value.email,
    password: formData.value.password,
    full_name: formData.value.fullName,
    preferred_language: formData.value.language,
  })

  if (success) {
    router.push('/dashboard')
  }
}
</script>
