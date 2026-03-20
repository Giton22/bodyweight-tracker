<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DrawerContent, DrawerOverlay, DrawerPortal } from 'vaul-vue'
import { cn } from '@/lib/utils'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay data-slot="drawer-overlay" class="fixed inset-0 z-50 bg-black/80" />
    <DrawerContent
      data-slot="drawer-content"
      v-bind="$attrs"
      :class="
        cn(
          'bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[96dvh] flex-col rounded-t-xl border',
          props.class,
        )
      "
    >
      <div class="bg-muted-foreground/20 mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full" />
      <div class="px-4">
        <slot />
      </div>
    </DrawerContent>
  </DrawerPortal>
</template>
