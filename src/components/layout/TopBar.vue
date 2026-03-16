<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import ModeToggle from './ModeToggle.vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

function logout() {
  auth.logout()
  router.push('/auth')
}
</script>

<template>
  <header
    class="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-md lg:flex"
  >
    <!-- Left: placeholder search -->
    <div class="relative w-96"></div>

    <!-- Right: actions -->
    <div class="flex items-center gap-3">
      <ModeToggle />

      <DropdownMenu v-if="auth.isAuthenticated">
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon" class="rounded-full">
            <div
              class="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
              <Icon icon="lucide:user" class="size-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel class="font-normal">
            <p class="text-xs text-muted-foreground">Signed in as</p>
            <p class="truncate text-sm font-medium">
              {{ auth.currentUser?.name || auth.currentUser?.email }}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="router.push('/profile')">
            <Icon icon="lucide:settings" class="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="text-destructive focus:text-destructive" @click="logout">
            <Icon icon="lucide:log-out" class="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>
