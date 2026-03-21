import type {
  DailyFoodSummary,
  FoodDashboardTab,
  FoodFavorite,
  FoodFrequent,
  FoodItem,
  FoodLogEntry,
  FoodRecent,
} from '@/types'
import type { OFFSearchResult } from '@/lib/food/repository'

export function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function compareFoodNames(a: FoodItem | undefined, b: FoodItem | undefined): number {
  const aName = a?.name.toLocaleLowerCase() ?? ''
  const bName = b?.name.toLocaleLowerCase() ?? ''
  return aName.localeCompare(bName)
}

export function dedupeByFoodItem<T extends { foodItem: string }>(
  items: T[],
  shouldReplace: (current: T, next: T) => boolean,
): T[] {
  const byFoodItem = new Map<string, T>()

  for (const item of items) {
    const existing = byFoodItem.get(item.foodItem)
    if (!existing || shouldReplace(existing, item)) {
      byFoodItem.set(item.foodItem, item)
    }
  }

  return [...byFoodItem.values()]
}

export function compareUsageRecency(
  a: { lastLoggedDate: string; id: string },
  b: { lastLoggedDate: string; id: string },
) {
  const dateCmp = b.lastLoggedDate.localeCompare(a.lastLoggedDate)
  if (dateCmp !== 0) return dateCmp
  return b.id.localeCompare(a.id)
}

export function cleanupDetachedFoodCollections<T extends { foodItem: string }>(
  foodItems: FoodItem[],
  items: T[],
): T[] {
  const validIds = new Set(foodItems.map((item) => item.id))
  return items.filter((item) => validIds.has(item.foodItem))
}

export function buildDailyFoodSummaries(foodLog: FoodLogEntry[]): Map<string, DailyFoodSummary> {
  const map = new Map<string, DailyFoodSummary>()

  for (const entry of foodLog) {
    let summary = map.get(entry.date)
    if (!summary) {
      summary = {
        meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      }
      map.set(entry.date, summary)
    }

    summary.meals[entry.mealType].push(entry)
    summary.totalCalories = round1(summary.totalCalories + entry.calories)
    summary.totalProtein = round1(summary.totalProtein + (entry.protein ?? 0))
    summary.totalCarbs = round1(summary.totalCarbs + (entry.carbs ?? 0))
    summary.totalFat = round1(summary.totalFat + (entry.fat ?? 0))
  }

  return map
}

export function buildFavoriteFoods(
  favorites: FoodFavorite[],
  resolveFoodItem: (foodItemId: string) => FoodItem | undefined,
): FoodItem[] {
  return [...favorites]
    .sort((a, b) => {
      const createdCmp = (b.created ?? '').localeCompare(a.created ?? '')
      if (createdCmp !== 0) return createdCmp
      return compareFoodNames(resolveFoodItem(a.foodItem), resolveFoodItem(b.foodItem))
    })
    .map((item) => resolveFoodItem(item.foodItem))
    .filter((item): item is FoodItem => item != null)
}

export function buildRecentFoods(
  recents: FoodRecent[],
  resolveFoodItem: (foodItemId: string) => FoodItem | undefined,
): FoodItem[] {
  return [...recents]
    .sort((a, b) => {
      const recencyCmp = (b.lastLoggedAt ?? '').localeCompare(a.lastLoggedAt ?? '')
      if (recencyCmp !== 0) return recencyCmp
      return compareFoodNames(resolveFoodItem(a.foodItem), resolveFoodItem(b.foodItem))
    })
    .map((item) => resolveFoodItem(item.foodItem))
    .filter((item): item is FoodItem => item != null)
}

export function buildFrequentFoods(
  frequent: FoodFrequent[],
  resolveFoodItem: (foodItemId: string) => FoodItem | undefined,
): FoodItem[] {
  return [...frequent]
    .sort((a, b) => {
      if (b.timesLogged !== a.timesLogged) return b.timesLogged - a.timesLogged
      const recencyCmp = (b.lastLoggedAt ?? '').localeCompare(a.lastLoggedAt ?? '')
      if (recencyCmp !== 0) return recencyCmp
      return compareFoodNames(resolveFoodItem(a.foodItem), resolveFoodItem(b.foodItem))
    })
    .map((item) => resolveFoodItem(item.foodItem))
    .filter((item): item is FoodItem => item != null)
}

export function foodsForDashboardTab(
  tab: FoodDashboardTab,
  favorites: FoodItem[],
  recents: FoodItem[],
  frequent: FoodItem[],
): FoodItem[] {
  if (tab === 'favorites') return favorites
  if (tab === 'recent') return recents
  return frequent
}

export function buildCombinedSearchState(options: {
  dashboardQuery: string
  foodItems: FoodItem[]
  searchResults: OFFSearchResult[]
  isSearching: boolean
}) {
  const { dashboardQuery, foodItems, searchResults, isSearching } = options
  const query = dashboardQuery.trim().toLowerCase()
  const personalMatches = query
    ? foodItems
        .filter(
          (food) =>
            food.name.toLowerCase().includes(query) ||
            food.brand?.toLowerCase().includes(query) ||
            food.barcode?.toLowerCase().includes(query),
        )
        .slice(0, 8)
    : []

  return {
    query: dashboardQuery.trim(),
    personalMatches,
    remoteResults: searchResults,
    hasQuery: dashboardQuery.trim().length > 0,
    showEmptyState:
      dashboardQuery.trim().length > 0 &&
      !isSearching &&
      personalMatches.length === 0 &&
      searchResults.length === 0,
  }
}
