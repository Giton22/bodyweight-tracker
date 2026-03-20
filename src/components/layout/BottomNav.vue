<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useHaptics } from '@/composables/useHaptics'

const route = useRoute()
const haptics = useHaptics()

const navItems = [
  { to: '/', icon: 'lucide:layout-grid', activeIcon: 'lucide:layout-grid', label: 'Dashboard' },
  {
    to: '/weight',
    icon: 'lucide:trending-down',
    activeIcon: 'lucide:trending-down',
    label: 'Weight',
  },
  { to: '/nutrition', icon: 'lucide:utensils', activeIcon: 'lucide:utensils', label: 'Nutrition' },
  { to: '/groups', icon: 'lucide:users', activeIcon: 'lucide:users', label: 'Groups' },
  { to: '/profile', icon: 'lucide:user', activeIcon: 'lucide:user', label: 'Profile' },
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
  >
    <div class="flex items-center justify-around px-2 pb-safe pt-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-1 p-2 transition-colors"
        :class="isActive(item.to) ? 'text-primary' : 'text-muted-foreground'"
        @click="haptics.light()"
      >
        <Icon :icon="isActive(item.to) ? item.activeIcon : item.icon" class="size-5" />
        <span class="text-[10px] font-semibold">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
