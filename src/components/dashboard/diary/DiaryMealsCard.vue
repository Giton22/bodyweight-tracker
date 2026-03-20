<script setup lang="ts">
import type { FoodLogEntry, MealType } from '@/types'
import DiaryMealRow from './DiaryMealRow.vue'

defineProps<{
  meals: Record<MealType, FoodLogEntry[]>
}>()

defineEmits<{
  add: [mealType: MealType]
  open: [mealType: MealType]
}>()

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
</script>

<template>
  <div class="overflow-hidden rounded-[2rem] border border-border bg-card shadow-warm-lg">
    <template v-for="mealType in mealTypes" :key="mealType">
      <DiaryMealRow
        :meal-type="mealType"
        :entries="meals[mealType]"
        @add="$emit('add', $event)"
        @open="$emit('open', $event)"
      />
      <div v-if="mealType !== 'snack'" class="mx-4 h-px bg-border" />
    </template>
  </div>
</template>
