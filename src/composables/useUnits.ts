import { computed } from 'vue'
import { useWeightStore } from '@/stores/weight'

const KG_TO_LBS = 2.20462

export function useUnits() {
  const store = useWeightStore()

  const isKg = computed(() => store.settings.unit === 'kg')

  function convert(kg: number): number {
    return isKg.value ? Math.round(kg * 10) / 10 : Math.round(kg * KG_TO_LBS * 10) / 10
  }

  function format(kg: number): string {
    const value = convert(kg)
    const unit = isKg.value ? 'kg' : 'lbs'
    return `${value} ${unit}`
  }

  function formatDelta(kg: number): string {
    const value = convert(kg)
    const sign = value > 0 ? '+' : ''
    const unit = isKg.value ? 'kg' : 'lbs'
    return `${sign}${value} ${unit}`
  }

  function toggleUnit() {
    store.setUnit(isKg.value ? 'lbs' : 'kg')
  }

  return { isKg, convert, format, formatDelta, toggleUnit }
}
