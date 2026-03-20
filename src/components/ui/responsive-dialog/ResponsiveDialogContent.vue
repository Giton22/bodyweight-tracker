<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { inject, ref } from 'vue'
import { DialogContent } from '@/components/ui/dialog'
import { DrawerContent } from '@/components/ui/drawer'
import { RESPONSIVE_DIALOG_KEY } from './keys'

defineOptions({
  inheritAttrs: false,
})

defineProps<{
  class?: HTMLAttributes['class']
}>()

const isMobile = inject(RESPONSIVE_DIALOG_KEY, ref(false))
</script>

<template>
  <DrawerContent v-if="isMobile" v-bind="$attrs" :class="class">
    <slot />
  </DrawerContent>
  <DialogContent v-else v-bind="$attrs" :class="class">
    <slot />
  </DialogContent>
</template>
