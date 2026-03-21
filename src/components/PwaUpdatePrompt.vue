<script setup lang="ts">
import { usePwaUpdate } from '@/composables/usePwaUpdate'

const { needRefresh, offlineReady, updateServiceWorker, close } = usePwaUpdate()
</script>

<template>
  <div
    v-if="needRefresh || offlineReady"
    class="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-[70] mx-auto max-w-sm rounded-lg border border-border bg-card p-4 shadow-lg sm:inset-x-auto sm:bottom-6 sm:right-6"
    role="alert"
  >
    <div class="mb-3 text-sm text-foreground">
      <template v-if="needRefresh"> A new version is available. Reload to update? </template>
      <template v-else> App ready to work offline. </template>
    </div>
    <div class="flex gap-2">
      <button
        v-if="needRefresh"
        type="button"
        class="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        @click="updateServiceWorker()"
      >
        Reload
      </button>
      <button
        type="button"
        class="rounded-md bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
        @click="close()"
      >
        Dismiss
      </button>
    </div>
  </div>
</template>
