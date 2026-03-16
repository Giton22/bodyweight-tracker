<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const navItems = [
  { to: '/', icon: 'lucide:layout-grid', label: 'Dashboard' },
  { to: '/weight', icon: 'lucide:trending-down', label: 'Weight' },
  { to: '/nutrition', icon: 'lucide:utensils', label: 'Nutrition' },
  { to: '/groups', icon: 'lucide:users', label: 'Groups' },
  { to: '/profile', icon: 'lucide:user', label: 'Profile' },
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <aside
    class="fixed left-0 top-0 z-30 hidden h-full w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 p-6">
      <div class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon icon="lucide:heart-pulse" class="size-5" />
      </div>
      <h1 class="text-lg font-bold tracking-tight text-sidebar-foreground">Slimrr</h1>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-1 px-4 py-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        :class="
          isActive(item.to)
            ? 'bg-primary/10 text-sidebar-foreground font-semibold'
            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        "
      >
        <Icon :icon="item.icon" class="size-5" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- User info at bottom -->
    <div class="border-t border-sidebar-border p-4">
      <div v-if="auth.isAuthenticated" class="flex items-center gap-3">
        <div
          class="flex size-10 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground"
        >
          <Icon icon="lucide:user" class="size-5" />
        </div>
        <div class="flex flex-col overflow-hidden">
          <p class="truncate text-sm font-semibold text-sidebar-foreground">
            {{ auth.currentUser?.name || auth.currentUser?.email }}
          </p>
          <p class="truncate text-xs text-sidebar-foreground/50">
            {{ auth.currentUser?.email }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>
