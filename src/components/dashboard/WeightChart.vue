<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisLine, VisAxis, VisCrosshair, VisTooltip, VisScatter } from '@unovis/vue'
import { useWeightStore } from '@/stores/weight'
import { useUnits } from '@/composables/useUnits'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

interface WeightDatum {
  date: number
  weight: number
}

const store = useWeightStore()
const { convert, isKg } = useUnits()

const chartConfig: ChartConfig = {
  weight: {
    label: 'Weight',
    color: 'var(--chart-1)',
  },
}

const data = computed((): WeightDatum[] =>
  store.averagedEntries.map(e => ({
    date: new Date(e.date).getTime(),
    weight: convert(e.weightKg),
  })),
)

// Use index as X so each data point gets exactly one tick — no repeated date labels
const x = (_d: WeightDatum, i: number) => i
const y = (d: WeightDatum) => d.weight

function formatDate(ms: number | Date): string {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Map index back to the date label of that data point
const xTickFormat = (i: number) => {
  const d = data.value[Math.round(i)]
  return d ? formatDate(d.date) : ''
}

const numTicks = computed(() => Math.min(data.value.length, 12))

const unitLabel = computed(() => isKg.value ? 'kg' : 'lbs')

const domainY = computed((): [number, number] => {
  if (data.value.length === 0) return [0, 100]
  const weights = data.value.map(d => d.weight)
  const min = Math.min(...weights)
  const max = Math.max(...weights)
  return [Math.floor(min / 10) * 10, Math.ceil(max / 10) * 10]
})
</script>

<template>
  <ChartContainer :config="chartConfig" class="h-[280px] w-full">
    <VisXYContainer :data="data" :margin="{ top: 10, right: 10, bottom: 30, left: 45 }" :domain-y="domainY">
      <VisLine
        :x="x"
        :y="y"
        color="var(--chart-1)"
        :line-width="2"
        :curve-type="'monotoneX'"
      />
      <VisScatter
        :x="x"
        :y="y"
        color="none"
        stroke-color="var(--chart-1)"
        :stroke-width="2"
        :size="8"
      />
      <VisAxis
        type="x"
        :tick-format="xTickFormat"
        :num-ticks="numTicks"
        label=""
      />
      <VisAxis
        type="y"
        :tick-format="(v: number) => `${v} ${unitLabel}`"
        :num-ticks="5"
        label=""
      />
      <VisCrosshair
        :template="(d: WeightDatum) => `${formatDate(d.date)}: ${d.weight} ${unitLabel}`"
        color="var(--chart-1)"
      />
      <VisTooltip>
        <template #default="{ data: tooltipData }">
          <ChartTooltipContent
            v-if="tooltipData"
            :config="chartConfig"
            :payload="{ weight: tooltipData.weight }"
            :x="tooltipData.date"
            :label-formatter="formatDate"
          />
        </template>
      </VisTooltip>
    </VisXYContainer>
  </ChartContainer>
</template>
