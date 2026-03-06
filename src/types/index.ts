export interface WeightEntry {
  id: string
  date: string // ISO date string YYYY-MM-DD
  weightKg: number
  note?: string
}

export type WeightUnit = 'kg' | 'lbs'

export type TimeRange = 30 | 60 | 90

export interface UserSettings {
  unit: WeightUnit
  goalWeightKg: number
  heightCm: number
}
