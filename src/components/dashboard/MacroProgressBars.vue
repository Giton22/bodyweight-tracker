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
          :style="{ width: `${Math.min(100, (macro.value / macro.goal) * 100)}%` }"
        />
      </div>
    </div>
  </div>
</template>
