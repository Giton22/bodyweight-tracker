<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useColorMode } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const mode = useColorMode({ emitAuto: true })

function setMode(value: 'light' | 'dark' | 'auto') {
  mode.value = value
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="icon">
        <Icon
          icon="lucide:sun"
          class="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <Icon
          icon="lucide:moon"
          class="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="setMode('light')">Light</DropdownMenuItem>
      <DropdownMenuItem @click="setMode('dark')">Dark</DropdownMenuItem>
      <DropdownMenuItem @click="setMode('auto')">System</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
