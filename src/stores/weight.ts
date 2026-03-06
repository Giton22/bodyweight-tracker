import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { TimeRange, UserSettings, WeightEntry } from '@/types'
import { generateMockEntries } from '@/lib/mock-data'

export const useWeightStore = defineStore('weight', () => {
  const entries = ref<WeightEntry[]>(generateMockEntries())

  const settings = ref<UserSettings>({
    unit: 'kg',
    goalWeightKg: 75,
    heightCm: 178,
  })

  const selectedTimeRange = ref<TimeRange>(90)

  // Getters
  const sortedEntries = computed(() =>
    [...entries.value].sort((a, b) => a.date.localeCompare(b.date)),
  )

  const filteredEntries = computed(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - selectedTimeRange.value)
    const cutoffStr = cutoff.toISOString().split('T')[0]!
    return sortedEntries.value.filter(e => e.date >= cutoffStr)
  })

  const latestEntry = computed(() =>
    sortedEntries.value.at(-1),
  )

  const currentWeight = computed(() =>
    latestEntry.value?.weightKg ?? null,
  )

  const bmi = computed(() => {
    if (!currentWeight.value || !settings.value.heightCm) return null
    const heightM = settings.value.heightCm / 100
    return Math.round((currentWeight.value / (heightM * heightM)) * 10) / 10
  })

  const weightTrend = computed(() => {
    const sorted = sortedEntries.value
    if (sorted.length < 2) return null

    const recent = sorted.slice(-7)
    const older = sorted.slice(-14, -7)
    if (older.length === 0) return null

    const recentAvg = recent.reduce((s, e) => s + e.weightKg, 0) / recent.length
    const olderAvg = older.reduce((s, e) => s + e.weightKg, 0) / older.length
    return Math.round((recentAvg - olderAvg) * 100) / 100
  })

  const chartData = computed(() =>
    filteredEntries.value.map(e => ({
      date: new Date(e.date).getTime(),
      weight: e.weightKg,
    })),
  )

  // Actions
  function addEntry(entry: Omit<WeightEntry, 'id'>) {
    entries.value.push({
      ...entry,
      id: crypto.randomUUID(),
    })
  }

  function deleteEntry(id: string) {
    entries.value = entries.value.filter(e => e.id !== id)
  }

  function setUnit(unit: 'kg' | 'lbs') {
    settings.value.unit = unit
  }

  function setTimeRange(range: TimeRange) {
    selectedTimeRange.value = range
  }

  return {
    entries,
    settings,
    selectedTimeRange,
    sortedEntries,
    filteredEntries,
    latestEntry,
    currentWeight,
    bmi,
    weightTrend,
    chartData,
    addEntry,
    deleteEntry,
    setUnit,
    setTimeRange,
  }
})
