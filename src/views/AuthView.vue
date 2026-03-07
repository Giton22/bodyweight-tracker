<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const router = useRouter()
const auth = useAuthStore()

const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')

async function submit() {
  try {
    if (mode.value === 'login') {
      await auth.login(email.value, password.value)
    }
    else {
      await auth.register(email.value, password.value)
    }
    router.push('/')
  }
  catch {
    // error is displayed via auth.error
  }
}

function switchMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  auth.clearError()
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-4">
    <Card class="w-full max-w-sm">
      <CardHeader class="text-center">
        <div class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon icon="lucide:scale" class="h-6 w-6 text-primary" />
        </div>
        <CardTitle class="text-xl">
          {{ mode === 'login' ? 'Welcome back' : 'Create account' }}
        </CardTitle>
        <CardDescription>
          {{ mode === 'login' ? 'Sign in to your bodyweight tracker' : 'Start tracking your bodyweight' }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="flex flex-col gap-4" @submit.prevent="submit">
          <div class="flex flex-col gap-1.5">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              :placeholder="mode === 'register' ? 'At least 8 characters' : '••••••••'"
              autocomplete="current-password"
              required
            />
          </div>

          <p v-if="auth.error" class="text-sm text-destructive">
            {{ auth.error }}
          </p>

          <Button type="submit" class="w-full" :disabled="auth.isLoading">
            <Icon v-if="auth.isLoading" icon="lucide:loader-circle" class="animate-spin" />
            {{ mode === 'login' ? 'Sign in' : 'Create account' }}
          </Button>
        </form>

        <p class="mt-4 text-center text-sm text-muted-foreground">
          {{ mode === 'login' ? "Don't have an account?" : 'Already have an account?' }}
          <button
            type="button"
            class="ml-1 font-medium text-primary underline-offset-4 hover:underline"
            @click="switchMode"
          >
            {{ mode === 'login' ? 'Sign up' : 'Sign in' }}
          </button>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
