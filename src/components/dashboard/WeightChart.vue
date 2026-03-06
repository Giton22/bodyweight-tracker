<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisLine, VisArea, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue'
import { useWeightStore } from '@/stores/weight'
import { useUnits } from '@/composables/useUnits'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

const store = useWeightStore()
const { convert, isKg } = useUnits()

const chartConfig: ChartConfig = {
  weight: {
    label: 'Weight',
    color: 'var(--chart-1)',
  },
}

const data = computed(() =>
  store.filteredEntries.map(e => ({
    date: new Date(e.date).getTime(),
    weight: convert(e.weightKg),
  })),
)

const x = (d: { date: number }) => d.date
const y = (d: { date: number, weight: number }) => d.weight

function formatDate(ms: number | Date): string {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const unitLabel = computed(() => isKg.value ? 'kg' : 'lbs')
</script>

<template>
  <ChartContainer :config="chartConfig" class="min-h-[300px] w-full">
    <VisXYContainer :data="data" :margin="{ top: 10, right: 10, bottom: 30, left: 45 }">
      <VisArea
        :x="x"
        :y="y"
        color="var(--chart-1)"
        :opacity="0.1"
        :curve-type="'monotoneX'"
      />
      <VisLine
        :x="x"
        :y="y"
        color="var(--chart-1)"
        :line-width="2"
        :curve-type="'monotoneX'"
      />
      <VisAxis
        type="x"
        :tick-format="formatDate"
        :num-ticks="6"
        label=""
      />
      <VisAxis
        type="y"
        :tick-format="(v: number) => `${v} ${unitLabel}`"
        :num-ticks="5"
        label=""
      />
      <VisCrosshair
        :template="(d: { date: number, weight: number }) => `${formatDate(d.date)}: ${d.weight} ${unitLabel}`"
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
