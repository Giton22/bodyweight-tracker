<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import TopBar from './TopBar.vue'
import BottomNav from './BottomNav.vue'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <AppSidebar />
    <div class="lg:ml-64">
      <TopBar />
      <main class="relative overflow-x-hidden pb-20 pt-safe lg:pb-0 lg:pt-0">
        <slot />
      </main>
    </div>
    <BottomNav />
  </div>
</template>
