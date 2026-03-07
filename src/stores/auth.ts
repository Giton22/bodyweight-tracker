import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthRecord } from 'pocketbase'
import { pb } from '@/lib/pocketbase'

export const useAuthStore = defineStore('auth', () => {
  // PocketBase persists auth state in localStorage automatically via authStore
  const currentUser = ref<AuthRecord | null>(pb.authStore.record)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => pb.authStore.isValid && currentUser.value !== null)

  // Keep local ref in sync when PocketBase auth state changes (e.g. token refresh)
  pb.authStore.onChange((token, record) => {
    currentUser.value = record
  })

  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null
    try {
      const auth = await pb.collection('users').authWithPassword(email, password)
      currentUser.value = auth.record
    }
    catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Login failed'
      throw e
    }
    finally {
      isLoading.value = false
    }
  }

  async function register(email: string, password: string) {
    isLoading.value = true
    error.value = null
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
      })
      // Auto-login after successful registration
      await login(email, password)
    }
    catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Registration failed'
      throw e
    }
    finally {
      isLoading.value = false
    }
  }

  function logout() {
    pb.authStore.clear()
    currentUser.value = null
  }

  function clearError() {
    error.value = null
  }

  return {
    currentUser,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
  }
})
