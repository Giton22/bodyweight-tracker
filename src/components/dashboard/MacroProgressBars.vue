<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  protein: number
  proteinGoal?: number
  carbs: number
  carbsGoal?: number
  fat: number
  fatGoal?: number
}>()

const macros = computed(() => [
  {
    label: 'Protein',
    value: props.protein,
    goal: props.proteinGoal ?? 150,
    color: 'bg-primary',
  },
  {
    label: 'Carbs',
    value: props.carbs,
    goal: props.carbsGoal ?? 250,
    color: 'bg-orange-400',
  },
  {
    label: 'Fat',
    value: props.fat,
    goal: props.fatGoal ?? 65,
    color: 'bg-purple-400',
  },
])

function progressWidth(value: number, goal: number) {
  if (goal <= 0) return '0%'
  return `${Math.min(100, (value / goal) * 100)}%`
}
</script>

<template>
  <div class="space-y-3">
    <div v-for="macro in macros" :key="macro.label" class="space-y-1">
      <div class="flex justify-between text-xs">
        <span class="font-medium">{{ macro.label }}</span>
        <span class="text-muted-foreground">{{ macro.value }}g / {{ macro.goal }}g</span>
      </div>
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          :class="macro.color"
          class="h-full rounded-full transition-all duration-500"
          :style="{ width: progressWidth(macro.value, macro.goal) }"
        />
      </div>
    </div>
  </div>
</template>
