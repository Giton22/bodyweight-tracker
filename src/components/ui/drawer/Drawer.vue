<script setup lang="ts">
import { DrawerRoot } from 'vaul-vue'

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <DrawerRoot v-model:open="open">
    <slot />
  </DrawerRoot>
</template>
