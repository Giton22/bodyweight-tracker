<script setup lang="ts">
import { computed } from 'vue'
import { useWeightStore } from '@/stores/weight'
import { useUnits } from '@/composables/useUnits'

const store = useWeightStore()
const { format } = useUnits()

const startWeight = computed(() => {
  const entries = store.sortedEntries
  return entries.length > 0 ? entries[entries.length - 1]!.weightKg : null
})

const currentWeight = computed(() => store.currentWeight)
const goalWeight = computed(() => store.settings.goalWeightKg)

const percentage = computed(() => {
  if (!startWeight.value || !currentWeight.value || !goalWeight.value) return 0
  const total = Math.abs(startWeight.value - goalWeight.value)
  if (total === 0) return 100
  const progress = Math.abs(startWeight.value - currentWeight.value)
  return Math.min(100, Math.round((progress / total) * 100))
})

const remaining = computed(() => {
  if (!currentWeight.value || !goalWeight.value) return null
  return Math.abs(currentWeight.value - goalWeight.value)
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between text-sm font-medium">
      <span>Goal: {{ goalWeight ? format(goalWeight) : '—' }}</span>
      <span class="text-muted-foreground">{{ percentage }}% achieved</span>
    </div>
    <div class="h-3 w-full overflow-hidden rounded-full bg-muted">
      <div
        class="h-full rounded-full bg-primary transition-all duration-700"
        :style="{ width: `${percentage}%` }"
      />
    </div>
    <div class="grid grid-cols-2 gap-4 border-t border-border pt-4">
      <div>
        <p class="text-xs text-muted-foreground">Start</p>
        <p class="font-bold">{{ startWeight ? format(startWeight) : '—' }}</p>
      </div>
      <div>
        <p class="text-xs text-muted-foreground">Remaining</p>
        <p class="font-bold">{{ remaining !== null ? format(remaining) : '—' }}</p>
      </div>
    </div>
  </div>
</template>
