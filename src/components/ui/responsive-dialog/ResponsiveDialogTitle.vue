<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { inject, ref } from 'vue'
import { DialogTitle } from '@/components/ui/dialog'
import { DrawerTitle } from '@/components/ui/drawer'
import { RESPONSIVE_DIALOG_KEY } from './keys'

defineProps<{
  class?: HTMLAttributes['class']
}>()

const isMobile = inject(RESPONSIVE_DIALOG_KEY, ref(false))
</script>

<template>
  <DrawerTitle v-if="isMobile" :class="class">
    <slot />
  </DrawerTitle>
  <DialogTitle v-else :class="class">
    <slot />
  </DialogTitle>
</template>
