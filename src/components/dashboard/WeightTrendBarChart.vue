<script setup lang="ts">
import { computed } from 'vue'
import { useWeightStore } from '@/stores/weight'
import { useUnits } from '@/composables/useUnits'

const store = useWeightStore()
const { convert } = useUnits()

// Get up to 7 most recent entries for the bar chart
const chartData = computed(() => {
  const entries = store.sortedEntries.slice(0, 7).reverse()
  if (entries.length === 0) return []

  const weights = entries.map((e) => e.weightKg)
  const maxW = Math.max(...weights)
  const minW = Math.min(...weights)
  const range = maxW - minW || 1

  return entries.map((entry, i) => {
    const normalized = ((entry.weightKg - minW) / range) * 0.4 + 0.5 // 50%-90% height range
    const date = new Date(entry.date)
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' })
    const isLatest = i === entries.length - 1
    return {
      id: entry.id,
      weight: convert(entry.weightKg),
      label: dayLabel,
      height: `${Math.round(normalized * 100)}%`,
      isLatest,
    }
  })
})

const weeklyChange = computed(() => {
  if (!store.weightTrend) return null
  return store.weightTrend
})
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Weight Trend
      </h3>
      <span v-if="weeklyChange !== null" class="text-xs font-bold text-primary">
        {{ weeklyChange > 0 ? '+' : '' }}{{ convert(weeklyChange) }}
        {{ store.settings.unit === 'kg' ? 'kg' : 'lbs' }} this week
      </span>
    </div>

    <div
      v-if="chartData.length === 0"
      class="flex h-40 items-center justify-center text-sm text-muted-foreground"
    >
      No weight data yet
    </div>

    <div v-else class="relative flex h-40 items-end gap-2 px-2">
      <div
        v-for="bar in chartData"
        :key="bar.id"
        class="group relative flex-1"
        :style="{ height: '100%' }"
      >
        <div
          class="absolute bottom-6 w-full rounded-t transition-colors"
          :class="bar.isLatest ? 'bg-primary' : 'bg-primary/20 group-hover:bg-primary/40'"
          :style="{ height: bar.height }"
        />
        <span
          class="absolute -bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-medium"
          :class="bar.isLatest ? 'text-foreground font-bold' : 'text-muted-foreground'"
        >
          {{ bar.label }}
        </span>
      </div>
    </div>
  </div>
</template>
