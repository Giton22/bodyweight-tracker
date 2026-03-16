<script setup lang="ts">
import { useWeightStore } from '@/stores/weight'
import { useUnits } from '@/composables/useUnits'

const store = useWeightStore()
const { format } = useUnits()

const items = [
  {
    label: 'Start',
    getValue: () =>
      store.sortedEntries.length > 0
        ? format(store.sortedEntries[store.sortedEntries.length - 1]!.weightKg)
        : '—',
  },
  {
    label: 'Current',
    getValue: () => (store.currentWeight !== null ? format(store.currentWeight) : '—'),
  },
  {
    label: 'Goal',
    getValue: () => (store.settings.goalWeightKg ? format(store.settings.goalWeightKg) : '—'),
  },
]
</script>

<template>
  <div class="flex justify-around border-t border-border pt-4">
    <div v-for="item in items" :key="item.label" class="text-center">
      <div class="text-[10px] uppercase text-muted-foreground">{{ item.label }}</div>
      <div class="font-bold">{{ item.getValue() }}</div>
    </div>
  </div>
</template>
