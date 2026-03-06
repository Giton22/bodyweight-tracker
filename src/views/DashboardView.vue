<script setup lang="ts">
import { computed } from 'vue'
import { useWeightStore } from '@/stores/weight'
import { useUnits } from '@/composables/useUnits'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatCard from '@/components/dashboard/StatCard.vue'
import WeightChart from '@/components/dashboard/WeightChart.vue'
import TimeRangeSelect from '@/components/dashboard/TimeRangeSelect.vue'
import LogWeightDialog from '@/components/dashboard/LogWeightDialog.vue'
import RecentEntries from '@/components/dashboard/RecentEntries.vue'

const store = useWeightStore()
const { format, formatDelta } = useUnits()

const bmiCategory = computed(() => {
  const bmi = store.bmi
  if (bmi === null) return ''
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
})

const goalRemaining = computed(() => {
  if (store.currentWeight === null) return null
  return store.currentWeight - store.settings.goalWeightKg
})
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
    <!-- Stat Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Current Weight"
        :value="store.currentWeight !== null ? format(store.currentWeight) : '—'"
        :description="store.latestEntry ? `as of ${store.latestEntry.date}` : undefined"
      />
      <StatCard
        title="Goal Weight"
        :value="format(store.settings.goalWeightKg)"
        :description="goalRemaining !== null ? `${formatDelta(goalRemaining)} remaining` : undefined"
      />
      <StatCard
        title="BMI"
        :value="store.bmi !== null ? String(store.bmi) : '—'"
        :description="bmiCategory"
      />
      <StatCard
        title="7-Day Trend"
        :value="store.weightTrend !== null ? formatDelta(store.weightTrend) : '—'"
        :trend="store.weightTrend !== null ? (store.weightTrend < 0 ? 'down' : store.weightTrend > 0 ? 'up' : 'neutral') : undefined"
        :trend-value="store.weightTrend !== null ? formatDelta(store.weightTrend) + '/week' : undefined"
        description="vs previous 7 days"
      />
    </div>

    <!-- Chart -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Weight History</CardTitle>
        <div class="flex items-center gap-2">
          <TimeRangeSelect />
          <LogWeightDialog />
        </div>
      </CardHeader>
      <CardContent>
        <WeightChart />
      </CardContent>
    </Card>

    <!-- Recent Entries -->
    <Card>
      <CardHeader>
        <CardTitle>Recent Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <RecentEntries />
      </CardContent>
    </Card>
  </div>
</template>
