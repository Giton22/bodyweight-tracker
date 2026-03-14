/**
 * Shared BMI category definitions and lookup logic.
 * Single source of truth — used by the weight store, dashboard, gauge, and settings.
 */

export interface BmiCategory {
  /** Full WHO label, e.g. "Severely Underweight" */
  label: string
  /** Abbreviated label for tight spaces, e.g. "Severe" */
  shortLabel: string
  /** Semantic color key used for badge variant mapping */
  color: 'blue' | 'sky' | 'green' | 'yellow' | 'orange' | 'red'
  /** Tailwind text color class */
  textColorClass: string
  /** Tailwind background color class (for gauge segments, dots) */
  bgColorClass: string
  /** Human-readable description */
  description: string
  /** Lower bound (inclusive) */
  min: number
  /** Upper bound (exclusive, except last) */
  max: number
  /** BMI range display string, e.g. "18.5–25.0" */
  range: string
}

export const BMI_CATEGORIES: BmiCategory[] = [
  {
    label: 'Severely Underweight',
    shortLabel: 'Severe',
    color: 'blue',
    textColorClass: 'text-blue-600',
    bgColorClass: 'bg-blue-600',
    description: 'Possible malnutrition or eating disorder',
    min: 0,
    max: 16.0,
    range: '< 16.0',
  },
  {
    label: 'Moderately Underweight',
    shortLabel: 'Moderate',
    color: 'blue',
    textColorClass: 'text-blue-500',
    bgColorClass: 'bg-blue-400',
    description: 'Moderately underweight',
    min: 16.0,
    max: 17.0,
    range: '16.0–17.0',
  },
  {
    label: 'Mildly Underweight',
    shortLabel: 'Mild',
    color: 'sky',
    textColorClass: 'text-sky-500',
    bgColorClass: 'bg-sky-400',
    description: 'Slightly below healthy range',
    min: 17.0,
    max: 18.5,
    range: '17.0–18.5',
  },
  {
    label: 'Normal Weight',
    shortLabel: 'Normal',
    color: 'green',
    textColorClass: 'text-green-600',
    bgColorClass: 'bg-green-500',
    description: 'Healthy BMI range (18.5–25)',
    min: 18.5,
    max: 25.0,
    range: '18.5–25.0',
  },
  {
    label: 'Overweight',
    shortLabel: 'Overweight',
    color: 'yellow',
    textColorClass: 'text-yellow-600',
    bgColorClass: 'bg-yellow-400',
    description: 'Pre-obese, increased health risk',
    min: 25.0,
    max: 30.0,
    range: '25.0–30.0',
  },
  {
    label: 'Obese Class I',
    shortLabel: 'Obese I',
    color: 'orange',
    textColorClass: 'text-orange-500',
    bgColorClass: 'bg-orange-400',
    description: 'Moderately obese',
    min: 30.0,
    max: 35.0,
    range: '30.0–35.0',
  },
  {
    label: 'Obese Class II',
    shortLabel: 'Obese II',
    color: 'red',
    textColorClass: 'text-orange-600',
    bgColorClass: 'bg-orange-600',
    description: 'Severely obese',
    min: 35.0,
    max: 40.0,
    range: '35.0–40.0',
  },
  {
    label: 'Obese Class III',
    shortLabel: 'Obese III',
    color: 'red',
    textColorClass: 'text-red-600',
    bgColorClass: 'bg-red-600',
    description: 'Very severely obese',
    min: 40.0,
    max: 45.0,
    range: '\u2265 40.0',
  },
]

/**
 * Get the WHO BMI category for a given BMI value.
 * Returns null if bmi is null.
 */
export function getBmiCategory(bmi: number | null): BmiCategory | null {
  if (bmi === null) return null
  for (const cat of BMI_CATEGORIES) {
    if (bmi < cat.max) return cat
  }
  // BMI >= 45 falls into the last category
  return BMI_CATEGORIES[BMI_CATEGORIES.length - 1]!
}
