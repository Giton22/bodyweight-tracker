<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ModeToggle from './ModeToggle.vue'
import UnitToggle from '@/components/dashboard/UnitToggle.vue'
</script>

<template>
  <header class="border-b bg-background">
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
      <div class="flex items-center gap-2">
        <Icon icon="lucide:scale" class="h-6 w-6 text-primary" />
        <h1 class="text-lg font-semibold">Bodyweight Tracker</h1>
      </div>
      <div class="flex items-center gap-2">
        <UnitToggle />
        <ModeToggle />
      </div>
    </div>
  </header>
</template>
