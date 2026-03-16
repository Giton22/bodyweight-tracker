<script setup lang="ts">
import { useRoute } from 'vue-router'
import KcalSection from '@/components/dashboard/KcalSection.vue'

const route = useRoute()
</script>

<template>
  <div class="p-4 lg:p-8">
    <div class="mx-auto max-w-7xl">
      <!-- Desktop heading -->
      <div class="mb-6 hidden lg:block">
        <h2 class="text-3xl font-black tracking-tight">Nutrition Overview</h2>
        <p class="text-muted-foreground">Calorie history, trends, and daily breakdown.</p>
      </div>

      <!-- Tab navigation -->
      <div class="mb-6 flex gap-4 border-b border-border">
        <RouterLink
          to="/nutrition"
          class="border-b-2 px-1 pb-2 text-sm font-medium transition-colors"
          :class="
            route.path === '/nutrition'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          "
        >
          Food Log
        </RouterLink>
        <RouterLink
          to="/nutrition/overview"
          class="border-b-2 px-1 pb-2 text-sm font-medium transition-colors"
          :class="
            route.path === '/nutrition/overview'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          "
        >
          Overview
        </RouterLink>
      </div>

      <KcalSection />
    </div>
  </div>
</template>
