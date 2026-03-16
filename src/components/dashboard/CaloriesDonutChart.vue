<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  consumed: number
  goal: number
}>()

const RADIUS = 58
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const remaining = computed(() => Math.max(0, props.goal - props.consumed))
const percentage = computed(() =>
  props.goal > 0 ? Math.min(100, Math.round((props.consumed / props.goal) * 100)) : 0,
)
const strokeOffset = computed(() =>
  props.goal > 0 ? CIRCUMFERENCE * (1 - Math.min(1, props.consumed / props.goal)) : CIRCUMFERENCE,
)
</script>

<template>
  <div class="relative flex items-center justify-center" style="width: 128px; height: 128px">
    <svg class="size-full -rotate-90" viewBox="0 0 128 128">
      <circle
        cx="64"
        cy="64"
        :r="RADIUS"
        fill="transparent"
        stroke="currentColor"
        stroke-width="8"
        class="text-muted/40"
      />
      <circle
        cx="64"
        cy="64"
        :r="RADIUS"
        fill="transparent"
        stroke="currentColor"
        stroke-width="8"
        class="text-primary transition-all duration-700"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="strokeOffset"
        stroke-linecap="round"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="text-2xl font-bold">{{ remaining.toLocaleString() }}</span>
      <span class="text-[10px] uppercase text-muted-foreground">kcal left</span>
    </div>
  </div>
</template>
