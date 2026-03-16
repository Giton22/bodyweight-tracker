<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  bmi: number | null
  category?: string
}>()

// SVG half-circle gauge. Arc from 180° to 0° (left to right).
// BMI range: 15-40 mapped across the arc.
const GAUGE_MIN = 15
const GAUGE_MAX = 40
const RADIUS = 80
const STROKE_WIDTH = 14
const CX = 96
const CY = 96

const halfCircumference = Math.PI * RADIUS // half circle

const categoryColor = computed(() => {
  if (!props.bmi) return 'text-muted-foreground'
  if (props.bmi < 18.5) return 'text-blue-500'
  if (props.bmi < 25) return 'text-emerald-500'
  if (props.bmi < 30) return 'text-yellow-500'
  return 'text-red-500'
})

const categoryLabel = computed(() => {
  if (!props.category) {
    if (!props.bmi) return ''
    if (props.bmi < 18.5) return 'Underweight'
    if (props.bmi < 25) return 'Normal'
    if (props.bmi < 30) return 'Overweight'
    return 'Obese'
  }
  return props.category
})

// How much of the arc is filled
const arcFraction = computed(() => {
  if (!props.bmi) return 0
  const clamped = Math.min(Math.max(props.bmi, GAUGE_MIN), GAUGE_MAX)
  return (clamped - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)
})

const filledOffset = computed(() => {
  return halfCircumference * (1 - arcFraction.value)
})
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="relative" style="width: 192px; height: 106px; overflow: hidden">
      <svg width="192" height="192" viewBox="0 0 192 192" class="absolute top-0 left-0">
        <!-- Background arc -->
        <circle
          :cx="CX"
          :cy="CY"
          :r="RADIUS"
          fill="transparent"
          stroke="currentColor"
          :stroke-width="STROKE_WIDTH"
          class="text-muted/60"
          stroke-dasharray="251.33 502.65"
          stroke-dashoffset="0"
          stroke-linecap="round"
          transform="rotate(180 96 96)"
        />
        <!-- Filled arc -->
        <circle
          v-if="bmi !== null"
          :cx="CX"
          :cy="CY"
          :r="RADIUS"
          fill="transparent"
          stroke="currentColor"
          :stroke-width="STROKE_WIDTH"
          class="text-primary transition-all duration-700"
          :stroke-dasharray="`${halfCircumference} ${halfCircumference * 2}`"
          :stroke-dashoffset="filledOffset"
          stroke-linecap="round"
          transform="rotate(180 96 96)"
        />
      </svg>
      <!-- Center text -->
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <span class="text-3xl font-black">{{ bmi ?? '—' }}</span>
      </div>
    </div>
    <!-- Labels -->
    <div class="flex w-48 justify-between px-4 text-[10px] text-muted-foreground">
      <span>15</span>
      <span>25</span>
      <span>40</span>
    </div>
    <span
      v-if="categoryLabel"
      class="mt-1 text-xs font-bold uppercase tracking-wider"
      :class="categoryColor"
    >
      {{ categoryLabel }}
    </span>
  </div>
</template>
