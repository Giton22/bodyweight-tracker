<script setup lang="ts">
import { computed } from 'vue'
import MacroProgressBars from '@/components/dashboard/MacroProgressBars.vue'

const props = defineProps<{
  consumed: number
  goal: number
  protein: number
  proteinGoal: number
  carbs: number
  carbsGoal: number
  fat: number
  fatGoal: number
}>()

const remaining = computed(() => Math.max(0, props.goal - props.consumed))
const roundedConsumed = computed(() => Math.round(props.consumed))
const roundedGoal = computed(() => Math.round(props.goal))
const roundedRemaining = computed(() => Math.round(remaining.value))
const progress = computed(() => {
  if (props.goal <= 0) return 0
  return Math.min(100, Math.round((props.consumed / props.goal) * 100))
})

const ringOffset = computed(() => {
  const circumference = 2 * Math.PI * 42
  return circumference * (1 - progress.value / 100)
})

const summaryStats = computed(() => [
  { label: 'Eaten', value: roundedConsumed.value.toLocaleString() },
  { label: 'Remaining', value: roundedRemaining.value.toLocaleString(), accent: true },
  { label: 'Goal', value: roundedGoal.value.toLocaleString() },
])
</script>

<template>
  <div
    class="overflow-hidden rounded-[2rem] border border-border bg-card p-5 text-card-foreground shadow-warm-lg lg:p-6"
  >
    <div class="space-y-5">
      <div class="flex flex-col items-center text-center">
        <div class="relative size-32 shrink-0 sm:size-36">
          <svg class="size-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              stroke-width="8"
              class="text-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              stroke-width="8"
              class="text-primary transition-all duration-700"
              :stroke-dasharray="2 * Math.PI * 42"
              :stroke-dashoffset="ringOffset"
              stroke-linecap="round"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-xl font-bold tracking-tight text-card-foreground sm:text-2xl">
              {{ roundedRemaining.toLocaleString() }}
            </span>
            <span class="mt-1 text-[11px] font-medium text-muted-foreground">Remaining</span>
            <span class="mt-1 text-[11px] font-medium text-muted-foreground">
              {{ progress }}% of goal
            </span>
          </div>
        </div>

        <div class="mt-4 grid w-full grid-cols-3 gap-2.5 sm:gap-3">
          <div
            v-for="item in summaryStats"
            :key="item.label"
            class="rounded-[1.25rem] border px-3 py-3 text-center"
            :class="
              item.accent ? 'border-primary/25 bg-primary/8' : 'border-border bg-background/60'
            "
          >
            <p class="text-[11px] font-medium text-muted-foreground">
              {{ item.label }}
            </p>
            <p
              class="mt-1 text-lg font-bold tracking-tight sm:text-xl"
              :class="item.accent ? 'text-primary' : 'text-card-foreground'"
            >
              {{ item.value }}
            </p>
            <p class="text-[11px] text-muted-foreground">kcal</p>
          </div>
        </div>
      </div>

      <div class="rounded-[1.5rem] border border-border bg-background/60 p-4 sm:p-5">
        <div class="mb-4">
          <p class="text-sm font-bold text-card-foreground">Macros</p>
          <p class="mt-1 text-sm text-muted-foreground">Today’s intake against your targets</p>
        </div>
        <MacroProgressBars
          variant="diary"
          :protein="protein"
          :protein-goal="proteinGoal"
          :carbs="carbs"
          :carbs-goal="carbsGoal"
          :fat="fat"
          :fat-goal="fatGoal"
        />
      </div>
    </div>
  </div>
</template>
