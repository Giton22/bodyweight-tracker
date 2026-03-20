<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { inject, ref } from 'vue'
import { DialogDescription } from '@/components/ui/dialog'
import { DrawerDescription } from '@/components/ui/drawer'
import { RESPONSIVE_DIALOG_KEY } from './keys'

defineProps<{
  class?: HTMLAttributes['class']
}>()

const isMobile = inject(RESPONSIVE_DIALOG_KEY, ref(false))
</script>

<template>
  <DrawerDescription v-if="isMobile" :class="class">
    <slot />
  </DrawerDescription>
  <DialogDescription v-else :class="class">
    <slot />
  </DialogDescription>
</template>
