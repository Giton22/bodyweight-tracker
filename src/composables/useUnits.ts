import { computed } from 'vue'
import { useWeightStore } from '@/stores/weight'

// ── Pure conversion helpers (no reactivity — safe to use in stores) ──

export const KG_TO_LBS = 2.20462

/** Convert kilograms to pounds (rounded to 1 decimal). */
export function kgToLbs(kg: number): number {
  return Math.round(kg * KG_TO_LBS * 10) / 10
}

/** Convert pounds to kilograms (rounded to 1 decimal). */
export function lbsToKg(lbs: number): number {
  return Math.round((lbs / KG_TO_LBS) * 10) / 10
}

// ── Reactive composable (requires active Pinia store) ──

export function useUnits() {
  const store = useWeightStore()

  const isKg = computed(() => store.settings.unit === 'kg')

  /** Convert kg to the user's preferred display unit. */
  function convert(kg: number): number {
    return isKg.value ? Math.round(kg * 10) / 10 : kgToLbs(kg)
  }

  /** Convert a display-unit value back to kg. */
  function toKg(displayValue: number): number {
    return isKg.value ? Math.round(displayValue * 10) / 10 : lbsToKg(displayValue)
  }

  /** Format kg as "75.2 kg" or "165.8 lbs". */
  function format(kg: number): string {
    const value = convert(kg)
    const unit = isKg.value ? 'kg' : 'lbs'
    return `${value} ${unit}`
  }

  /** Format a kg delta as "+1.2 kg" or "-2.6 lbs". */
  function formatDelta(kg: number): string {
    const value = convert(kg)
    const sign = value > 0 ? '+' : ''
    const unit = isKg.value ? 'kg' : 'lbs'
    return `${sign}${value} ${unit}`
  }

  function toggleUnit() {
    store.setUnit(isKg.value ? 'lbs' : 'kg')
  }

  return { isKg, convert, toKg, format, formatDelta, toggleUnit }
}
