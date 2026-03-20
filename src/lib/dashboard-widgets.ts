export interface DashboardWidgetConfig {
  id: string
  label: string
  visible: boolean
}

export const DEFAULT_DASHBOARD_LAYOUT: DashboardWidgetConfig[] = [
  { id: 'streak', label: 'Streak', visible: true },
  { id: 'bmi', label: 'Current BMI', visible: true },
  { id: 'daily-calories', label: 'Daily Calories', visible: true },
  { id: 'weight-trend', label: 'Weight Trend', visible: true },
]

/**
 * Merges a saved layout with defaults:
 * - Preserves saved order and visibility
 * - Drops widget IDs that no longer exist in defaults
 * - Appends new default widgets not yet in saved layout
 */
export function mergeLayout(
  saved: { id: string; visible: boolean }[] | undefined,
  defaults: DashboardWidgetConfig[] = DEFAULT_DASHBOARD_LAYOUT,
): DashboardWidgetConfig[] {
  if (!saved || saved.length === 0) {
    return defaults.map((d) => ({ ...d }))
  }

  const defaultMap = new Map(defaults.map((d) => [d.id, d]))
  const result: DashboardWidgetConfig[] = []
  const seen = new Set<string>()

  // Preserve saved order, drop removed widgets
  for (const item of saved) {
    const def = defaultMap.get(item.id)
    if (def) {
      result.push({ id: item.id, label: def.label, visible: item.visible })
      seen.add(item.id)
    }
  }

  // Append new widgets not in saved layout
  for (const def of defaults) {
    if (!seen.has(def.id)) {
      result.push({ ...def })
    }
  }

  return result
}
