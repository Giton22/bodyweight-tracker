<script setup lang="ts">
import { computed } from 'vue'
import { useWeightStore } from '@/stores/weight'
import type { TimeRange } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps<{
  target: 'weight' | 'calories'
}>()

const store = useWeightStore()

const currentValue = computed(() =>
  props.target === 'weight' ? store.weightTimeRange : store.calorieTimeRange,
)

// oxlint-disable-next-line @typescript-eslint/no-explicit-any
function onValueChange(value: any) {
  const range = Number(value) as TimeRange
  if (props.target === 'weight') {
    store.setWeightTimeRange(range)
  } else {
    store.setCalorieTimeRange(range)
  }
}

const fmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })

function rangeLabel(days: TimeRange): string {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return `${fmt.format(start)} – ${fmt.format(end)}`
}

const options: { value: TimeRange; label: string }[] = [7, 30, 60, 90].map((d) => ({
  value: d as TimeRange,
  label: rangeLabel(d as TimeRange),
}))
</script>

<template>
  <Select :model-value="String(currentValue)" @update:model-value="onValueChange">
    <SelectTrigger class="w-[180px]">
      <SelectValue placeholder="Time range" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="opt in options" :key="opt.value" :value="String(opt.value)">
        {{ opt.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
