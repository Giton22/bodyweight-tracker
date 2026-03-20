<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { inject, ref } from 'vue'
import { DialogHeader } from '@/components/ui/dialog'
import { DrawerHeader } from '@/components/ui/drawer'
import { RESPONSIVE_DIALOG_KEY } from './keys'

defineProps<{
  class?: HTMLAttributes['class']
}>()

const isMobile = inject(RESPONSIVE_DIALOG_KEY, ref(false))
</script>

<template>
  <DrawerHeader v-if="isMobile" :class="class">
    <slot />
  </DrawerHeader>
  <DialogHeader v-else :class="class">
    <slot />
  </DialogHeader>
</template>
