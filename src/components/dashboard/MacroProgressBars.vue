<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  protein: number
  proteinGoal?: number
  carbs: number
  carbsGoal?: number
  fat: number
  fatGoal?: number
  variant?: 'default' | 'diary'
}>()

const macros = computed(() => {
  const variant = props.variant ?? 'default'
  const base = {
    protein: {
      label: 'Protein',
      value: props.protein,
      goal: props.proteinGoal ?? 150,
    },
    carbs: {
      label: 'Carbs',
      value: props.carbs,
      goal: props.carbsGoal ?? 250,
    },
    fat: {
      label: 'Fat',
      value: props.fat,
      goal: props.fatGoal ?? 65,
    },
  }

  if (variant === 'diary') {
    return [
      { ...base.carbs, color: 'bg-primary', track: 'bg-muted' },
      { ...base.protein, color: 'bg-primary/80', track: 'bg-muted' },
      { ...base.fat, color: 'bg-primary/60', track: 'bg-muted' },
    ]
  }

  return [
    { ...base.protein, color: 'bg-primary', track: 'bg-muted' },
    { ...base.carbs, color: 'bg-orange-400', track: 'bg-muted' },
    { ...base.fat, color: 'bg-purple-400', track: 'bg-muted' },
  ]
})

function progressWidth(value: number, goal: number) {
  if (goal <= 0) return '0%'
  return `${Math.min(100, (value / goal) * 100)}%`
}
</script>

<template>
  <div class="space-y-3">
    <div v-for="macro in macros" :key="macro.label" class="space-y-1">
      <div
        class="flex justify-between text-xs"
        :class="props.variant === 'diary' ? 'text-card-foreground' : 'text-foreground'"
      >
        <span class="font-medium">{{ macro.label }}</span>
        <span class="text-muted-foreground"> {{ macro.value }}g / {{ macro.goal }}g </span>
      </div>
      <div class="h-1.5 w-full overflow-hidden rounded-full" :class="macro.track">
        <div
          :class="macro.color"
          class="h-full rounded-full transition-all duration-500"
          :style="{ width: progressWidth(macro.value, macro.goal) }"
        />
      </div>
    </div>
  </div>
</template>
