<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DrawerTitle } from 'vaul-vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <DrawerTitle
    data-slot="drawer-title"
    :class="cn('text-lg leading-none font-semibold tracking-tight', props.class)"
  >
    <slot />
  </DrawerTitle>
</template>
