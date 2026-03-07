<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  bmi: number | null
}

const props = defineProps<Props>()

// BMI gauge spans from 15 to 45 (covers all practical categories)
const GAUGE_MIN = 15
const GAUGE_MAX = 45
const GAUGE_RANGE = GAUGE_MAX - GAUGE_MIN

// WHO category segments (start, end, color class, label)
const segments = [
  { min: 15, max: 16, colorClass: 'bg-blue-600', label: 'Severe' },
  { min: 16, max: 17, colorClass: 'bg-blue-400', label: 'Moderate' },
  { min: 17, max: 18.5, colorClass: 'bg-sky-400', label: 'Mild' },
  { min: 18.5, max: 25, colorClass: 'bg-green-500', label: 'Normal' },
  { min: 25, max: 30, colorClass: 'bg-yellow-400', label: 'Overweight' },
  { min: 30, max: 35, colorClass: 'bg-orange-400', label: 'Obese I' },
  { min: 35, max: 40, colorClass: 'bg-orange-600', label: 'Obese II' },
  { min: 40, max: 45, colorClass: 'bg-red-600', label: 'Obese III' },
]

// Compute each segment's left % and width %
const segmentStyles = computed(() =>
  segments.map(s => ({
    ...s,
    left: `${((s.min - GAUGE_MIN) / GAUGE_RANGE) * 100}%`,
    width: `${((s.max - s.min) / GAUGE_RANGE) * 100}%`,
  })),
)

// Clamp the marker position within the gauge
const markerPosition = computed(() => {
  if (props.bmi === null) return null
  const clamped = Math.min(Math.max(props.bmi, GAUGE_MIN), GAUGE_MAX)
  return `${((clamped - GAUGE_MIN) / GAUGE_RANGE) * 100}%`
})

// Tick marks at key BMI thresholds
const ticks = [16, 17, 18.5, 25, 30, 35, 40]
const tickStyles = computed(() =>
  ticks.map(value => ({
    value,
    position: `${((value - GAUGE_MIN) / GAUGE_RANGE) * 100}%`,
  })),
)
</script>

<template>
  <div class="w-full select-none">
    <!-- Gauge bar -->
    <div class="relative h-6 w-full overflow-visible rounded-full">
      <!-- Colored segments -->
      <div
        v-for="seg in segmentStyles"
        :key="seg.min"
        :class="seg.colorClass"
        class="absolute top-0 h-full"
        :style="{ left: seg.left, width: seg.width }"
      />

      <!-- Tick marks -->
      <div
        v-for="tick in tickStyles"
        :key="tick.value"
        class="absolute top-0 h-full w-px bg-background/50"
        :style="{ left: tick.position }"
      />

      <!-- BMI position marker -->
      <template v-if="markerPosition !== null">
        <div
          class="absolute top-1/2 z-10 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-md ring-2 ring-background"
          :style="{ left: markerPosition }"
        />
      </template>
    </div>

    <!-- Tick labels -->
    <div class="relative mt-1 h-4 w-full text-[10px] text-muted-foreground">
      <span
        v-for="tick in tickStyles"
        :key="tick.value"
        class="absolute -translate-x-1/2"
        :style="{ left: tick.position }"
      >
        {{ tick.value }}
      </span>
    </div>

    <!-- Category labels -->
    <div class="relative mt-1 h-4 w-full">
      <div
        v-for="seg in segmentStyles"
        :key="seg.min"
        class="absolute truncate text-center text-[9px] text-muted-foreground"
        :style="{ left: seg.left, width: seg.width }"
      >
        {{ seg.label }}
      </div>
    </div>
  </div>
</template>
