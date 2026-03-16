<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  consumed: number
  goal: number
}>()

const remaining = computed(() => Math.max(0, props.goal - props.consumed))
const percentage = computed(() =>
  props.goal > 0 ? Math.min(100, Math.round((props.consumed / props.goal) * 100)) : 0,
)

// SVG ring (viewBox 36x36, r=16)
const CIRCUMFERENCE = 2 * Math.PI * 16
const dashOffset = computed(
  () => CIRCUMFERENCE * (1 - Math.min(1, props.consumed / (props.goal || 1))),
)
</script>

<template>
  <div class="flex items-center gap-4">
    <div>
      <h2 class="text-3xl font-bold">{{ remaining.toLocaleString() }}</h2>
      <p class="text-sm font-medium text-muted-foreground">Calories Remaining</p>
    </div>
    <div class="relative size-20">
      <svg class="size-full -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          class="text-muted/40"
        />
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          class="text-primary transition-all duration-700"
          :stroke-dasharray="CIRCUMFERENCE"
          :stroke-dashoffset="dashOffset"
          stroke-linecap="round"
        />
      </svg>
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-xs font-bold">{{ percentage }}%</span>
      </div>
    </div>
  </div>
</template>
