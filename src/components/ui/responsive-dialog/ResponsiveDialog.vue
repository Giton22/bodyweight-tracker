<script setup lang="ts">
import { provide } from 'vue'
import { Dialog } from '@/components/ui/dialog'
import { Drawer } from '@/components/ui/drawer'
import { useIsMobile } from './useIsMobile'
import { RESPONSIVE_DIALOG_KEY } from './keys'

const open = defineModel<boolean>('open', { default: false })

const isMobile = useIsMobile()
provide(RESPONSIVE_DIALOG_KEY, isMobile)
</script>

<template>
  <Drawer v-if="isMobile" v-model:open="open">
    <slot />
  </Drawer>
  <Dialog v-else v-model:open="open">
    <slot />
  </Dialog>
</template>
