<script setup lang="ts">
import { useWeightStore } from '@/stores/weight'
import { Button } from '@/components/ui/button'

const store = useWeightStore()
</script>

<template>
  <div class="flex items-center rounded-md border">
    <Button
      variant="ghost"
      size="sm"
      :class="store.settings.unit === 'kg' ? 'bg-accent' : ''"
      @click="store.setUnit('kg')"
    >
      kg
    </Button>
    <Button
      variant="ghost"
      size="sm"
      :class="store.settings.unit === 'lbs' ? 'bg-accent' : ''"
      @click="store.setUnit('lbs')"
    >
      lbs
    </Button>
  </div>
</template>
