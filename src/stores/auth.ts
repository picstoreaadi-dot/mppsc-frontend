// ============================================================================
// Authentication Store
// Manages user authentication state
// ============================================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest, RegisterRequest } from '@/types'
import { api } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const userPreferredLanguage = computed(() => user.value?.preferred_language || 'en')
  const isPremium = computed(() => user.value?.is_premium || false)

  // Actions
  async function login(credentials: LoginRequest) {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.login(credentials)
      user.value = response.user
      isAuthenticated.value = true

      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: RegisterRequest) {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.register(data)
      user.value = response.user
      isAuthenticated.value = true

      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Registration failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCurrentUser() {
    try {
      isLoading.value = true
      const userData = await api.getCurrentUser()
      user.value = userData
      isAuthenticated.value = true
    } catch (err: any) {
      // Token might be invalid
      logout()
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(data: Partial<User>) {
    try {
      isLoading.value = true
      error.value = null

      const updatedUser = await api.updateProfile(data)
      user.value = updatedUser

      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Profile update failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    try {
      isLoading.value = true
      error.value = null

      await api.changePassword(oldPassword, newPassword)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Password change failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    api.logout()
    user.value = null
    isAuthenticated.value = false
    error.value = null
  }

  function clearError() {
    error.value = null
  }

  // Initialize auth state on app load
  async function initialize() {
    const token = localStorage.getItem('access_token')
    if (token) {
      await fetchCurrentUser()
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Computed
    userPreferredLanguage,
    isPremium,

    // Actions
    login,
    register,
    fetchCurrentUser,
    updateProfile,
    changePassword,
    logout,
    clearError,
    initialize,
  }
})
