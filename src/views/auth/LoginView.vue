<template>
  <div style="min-height: 100vh; background: linear-gradient(to bottom right, #3b82f6, #1d4ed8); display: flex; align-items: center; justify-content: center; padding: 1rem;">
    <div style="background: white; border-radius: 1rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); padding: 2rem; width: 100%; max-width: 28rem;">
      <!-- Logo/Header -->
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="width: 4rem; height: 4rem; background: #3b82f6; border-radius: 1rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
          <span style="font-size: 2rem; font-weight: 700; color: white;">M</span>
        </div>
        <h1 style="font-size: 1.5rem; font-weight: 700; color: #111827;">
          MPPSC Mock Test
        </h1>
        <p style="color: #6b7280; margin-top: 0.5rem;">
          Welcome back! Please login to continue
        </p>
      </div>

      <!-- Error Message -->
      <div
        v-if="authStore.error"
        style="margin-bottom: 1rem; padding: 1rem; background: #fee2e2; border: 1px solid #ef4444; border-radius: 0.5rem; color: #b91c1c;"
      >
        {{ authStore.error }}
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
            Email
          </label>
          <input
            v-model="email"
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
            v-model="password"
            type="password"
            required
            style="width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #e5e7eb; background: white; color: #111827; font-size: 1rem;"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          style="width: 100%; padding: 0.75rem; border-radius: 0.75rem; background: #3b82f6; color: white; font-weight: 600; cursor: pointer; border: none; font-size: 1rem; transition: all 0.2s;"
          :style="authStore.isLoading ? 'opacity: 0.5; cursor: not-allowed;' : ''"
          @mouseover="$event.target.style.background = '#2563eb'"
          @mouseout="$event.target.style.background = '#3b82f6'"
        >
          <span v-if="authStore.isLoading">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </form>

      <!-- Divider -->
      <div style="position: relative; margin: 1.5rem 0;">
        <div style="position: absolute; inset: 0; display: flex; align-items: center;">
          <div style="width: 100%; border-top: 1px solid #e5e7eb;"></div>
        </div>
        <div style="position: relative; display: flex; justify-content: center; font-size: 0.875rem;">
          <span style="padding: 0 0.5rem; background: white; color: #6b7280;">
            Don't have an account?
          </span>
        </div>
      </div>

      <!-- Register Link -->
      <router-link
        to="/register"
        style="display: block; text-align: center; padding: 0.75rem; border-radius: 0.75rem; border: 2px solid #3b82f6; color: #3b82f6; font-weight: 600; text-decoration: none; transition: all 0.2s;"
      >
        Create Account
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

async function handleLogin() {
  const success = await authStore.login({
    email: email.value,
    password: password.value,
  })

  if (success) {
    router.push('/dashboard')
  }
}
</script>
