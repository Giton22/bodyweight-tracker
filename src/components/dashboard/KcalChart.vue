<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisStackedBar, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue'
import { useWeightStore } from '@/stores/weight'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

interface ChartDatum {
  date: number
  consumed: number
  exceeded: boolean
  hasConsumed: boolean
}

const store = useWeightStore()

const chartConfig: ChartConfig = {
  consumed: {
    label: 'Consumed',
    color: 'var(--chart-2)',
  },
}

const data = computed(() => store.calorieChartData as ChartDatum[])

// Use index as X so each data point gets exactly one tick — no repeated date labels
const x = (_d: ChartDatum, i: number) => i

const yConsumed = (d: ChartDatum) => d.hasConsumed ? d.consumed : 0

const barColor = (d: ChartDatum) => {
  if (!d.hasConsumed) return 'var(--muted)'
  if (d.exceeded) return 'var(--destructive)'
  return 'var(--chart-2)'
}

function formatDate(ms: number | Date): string {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Map index back to the date label of that data point
const xTickFormat = (i: number) => {
  const d = data.value[Math.round(i)]
  return d ? formatDate(d.date) : ''
}

const numTicks = computed(() => Math.min(data.value.length, 12))

const domainY = computed((): [number, number] => {
  if (data.value.length === 0) return [0, 3000]
  const values = data.value.filter(d => d.hasConsumed).map(d => d.consumed)
  if (values.length === 0) return [0, 3000]
  return [0, Math.max(...values) * 1.15]
})
</script>

<template>
  <ChartContainer :config="chartConfig" class="h-[280px] w-full">
    <VisXYContainer :data="data" :margin="{ top: 10, right: 10, bottom: 30, left: 55 }" :domain-y="domainY">
      <VisStackedBar
        :x="x"
        :y="[yConsumed]"
        :color="barColor"
        :bar-padding="0.3"
        :rounded-corners="4"
      />
      <VisAxis
        type="x"
        :tick-format="xTickFormat"
        :num-ticks="numTicks"
        label=""
      />
      <VisAxis
        type="y"
        :tick-format="(v: number) => `${v} kcal`"
        :num-ticks="5"
        label=""
      />
      <VisCrosshair
        :template="(d: ChartDatum) => `${formatDate(d.date)}: ${d.hasConsumed ? d.consumed + ' kcal' : 'No data'}`"
        color="var(--chart-2)"
      />
      <VisTooltip>
        <template #default="{ data: tooltipData }">
          <ChartTooltipContent
            v-if="tooltipData"
            :config="chartConfig"
            :payload="{ consumed: tooltipData.consumed }"
            :x="tooltipData.date"
            :label-formatter="formatDate"
          />
        </template>
      </VisTooltip>
    </VisXYContainer>
  </ChartContainer>
</template>
