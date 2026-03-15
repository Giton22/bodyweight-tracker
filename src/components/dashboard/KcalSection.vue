<script setup lang="ts">
import { computed } from 'vue'
import { useWeightStore } from '@/stores/weight'
import { useFoodStore } from '@/stores/food'
import { getCalorieStatus } from '@/lib/calorieStatus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatCard from '@/components/dashboard/StatCard.vue'
import KcalChart from '@/components/dashboard/KcalChart.vue'
import DailyCaloriesTable from '@/components/dashboard/DailyCaloriesTable.vue'
import TimeRangeSelect from '@/components/dashboard/TimeRangeSelect.vue'
import SetKcalGoalDialog from '@/components/dashboard/SetKcalGoalDialog.vue'
import LogFoodDialog from '@/components/dashboard/food/LogFoodDialog.vue'
import QuickLogDialog from '@/components/dashboard/food/QuickLogDialog.vue'

const store = useWeightStore()
const foodStore = useFoodStore()

const todayKcalRemaining = computed(() => {
  const summary = store.todayCalorieSummary
  if (!summary || summary.goalKcal === null || summary.consumedKcal === null) return null
  return summary.goalKcal - summary.consumedKcal
})

const todayKcalStatus = computed(() => {
  const summary = store.todayCalorieSummary
  if (!summary) return null
  return getCalorieStatus(summary.consumedKcal, summary.goalKcal, store.settings.goalDirection)
})

const calorieGoalDirectionLabel = computed(() =>
  (store.settings.goalDirection ?? 'loss') === 'gain' ? 'gain' : 'loss',
)

const todayKcalStatusLine = computed(() => {
  if (!todayKcalStatus.value) return undefined
  if (todayKcalStatus.value.side === 'target') return 'On target'
  return `${todayKcalStatus.value.label} kcal`
})

const todayMacros = computed(() => {
  const summary = foodStore.todayFoodSummary
  if (!summary) return null
  return {
    protein: summary.totalProtein,
    carbs: summary.totalCarbs,
    fat: summary.totalFat,
  }
})

const filteredCalorieCount = computed(() => store.dailyCalorieRows.length)
const totalCalorieCount = computed(() => {
  const foodDates = foodStore.dailyFoodSummaries.size
  const calorieDates = store.calorieEntries.length
  return Math.max(foodDates, calorieDates)
})

const caloriesCountHint = computed(() => {
  if (totalCalorieCount.value === 0) return ''
  return `Showing ${filteredCalorieCount.value} of ${totalCalorieCount.value} days`
})
</script>

<template>
  <div class="space-y-6">
    <!-- Kcal Stat Cards -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        class="animate-card-enter"
        style="animation-delay: 0ms"
        title="Today's Intake"
        :value="
          store.todayCalorieSummary?.consumedKcal !== null &&
          store.todayCalorieSummary?.consumedKcal !== undefined
            ? `${store.todayCalorieSummary.consumedKcal} kcal`
            : '—'
        "
        :description="
          todayMacros
            ? `P ${todayMacros.protein}g · C ${todayMacros.carbs}g · F ${todayMacros.fat}g`
            : store.todayCalorieSummary?.goalKcal !== null &&
                store.todayCalorieSummary?.goalKcal !== undefined
              ? `Goal: ${store.todayCalorieSummary.goalKcal} kcal`
              : 'No goal set'
        "
      />
      <StatCard
        class="animate-card-enter"
        style="animation-delay: 50ms"
        title="Kcal Remaining"
        :value="todayKcalRemaining !== null ? `${todayKcalRemaining} kcal` : '—'"
        :value-class="todayKcalStatus?.textClass"
        :trend-value="todayKcalStatusLine"
        :description="todayKcalStatus ? `${calorieGoalDirectionLabel} goal mode` : undefined"
      />
      <StatCard
        class="animate-card-enter"
        style="animation-delay: 100ms"
        title="Weekly Avg Kcal"
        :value="store.weeklyCalorieAverage !== null ? `${store.weeklyCalorieAverage} kcal` : '—'"
        description="This week average"
      />
    </div>

    <!-- Kcal Chart -->
    <Card class="animate-card-enter" style="animation-delay: 150ms">
      <CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Calorie History</CardTitle>
        <div class="flex flex-wrap items-center gap-2">
          <TimeRangeSelect target="calories" />
          <SetKcalGoalDialog />
          <QuickLogDialog />
          <LogFoodDialog />
        </div>
      </CardHeader>
      <CardContent>
        <KcalChart />
      </CardContent>
    </Card>

    <!-- Daily Calories Table -->
    <Card class="animate-card-enter" style="animation-delay: 200ms">
      <CardHeader>
        <div class="flex flex-wrap items-end justify-between gap-2">
          <CardTitle>Daily Calories</CardTitle>
          <p v-if="caloriesCountHint" class="text-xs text-muted-foreground">
            {{ caloriesCountHint }}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <DailyCaloriesTable />
      </CardContent>
    </Card>
  </div>
</template>
