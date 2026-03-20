<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { inject, ref } from 'vue'
import { DialogFooter } from '@/components/ui/dialog'
import { DrawerFooter } from '@/components/ui/drawer'
import { RESPONSIVE_DIALOG_KEY } from './keys'

defineProps<{
  class?: HTMLAttributes['class']
}>()

const isMobile = inject(RESPONSIVE_DIALOG_KEY, ref(false))
</script>

<template>
  <DrawerFooter v-if="isMobile" :class="class">
    <slot />
  </DrawerFooter>
  <DialogFooter v-else :class="class">
    <slot />
  </DialogFooter>
</template>
