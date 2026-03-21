import { describe, expect, it } from 'vite-plus/test'
import {
  buildCombinedSearchState,
  buildDailyFoodSummaries,
  buildFavoriteFoods,
  buildFrequentFoods,
  buildRecentFoods,
  cleanupDetachedFoodCollections,
  compareUsageRecency,
  dedupeByFoodItem,
  foodsForDashboardTab,
} from '@/lib/food/helpers'

const foodItems = [
  {
    id: '1',
    name: 'Greek Yogurt',
    caloriesPer100g: 59,
    defaultServingG: 170,
    source: 'manual' as const,
  },
  { id: '2', name: 'Banana', caloriesPer100g: 89, defaultServingG: 118, source: 'manual' as const },
]

describe('food helpers', () => {
  it('dedupes by food item using the latest candidate', () => {
    const items = dedupeByFoodItem(
      [
        { id: 'a', foodItem: '1', created: '2026-03-20' },
        { id: 'b', foodItem: '1', created: '2026-03-21' },
      ],
      (current, next) => next.created > current.created,
    )

    expect(items).toEqual([{ id: 'b', foodItem: '1', created: '2026-03-21' }])
  })

  it('compares usage recency by date then id', () => {
    expect(
      compareUsageRecency(
        { lastLoggedDate: '2026-03-20', id: '1' },
        { lastLoggedDate: '2026-03-21', id: '2' },
      ),
    ).toBeGreaterThan(0)
  })

  it('cleans detached collections and builds daily summaries', () => {
    expect(
      cleanupDetachedFoodCollections(foodItems, [
        { id: 'fav-1', foodItem: '1' },
        { id: 'fav-2', foodItem: 'missing' },
      ]),
    ).toEqual([{ id: 'fav-1', foodItem: '1' }])

    const summaries = buildDailyFoodSummaries([
      {
        id: 'log-1',
        date: '2026-03-21',
        mealType: 'breakfast',
        foodItem: '1',
        foodName: 'Greek Yogurt',
        amountG: 170,
        calories: 100.4,
        protein: 17.1,
        carbs: 7.2,
        fat: 0.4,
      },
      {
        id: 'log-2',
        date: '2026-03-21',
        mealType: 'snack',
        foodItem: '2',
        foodName: 'Banana',
        amountG: 118,
        calories: 105.2,
        protein: 1.3,
        carbs: 27,
        fat: 0.3,
      },
    ])

    expect(summaries.get('2026-03-21')).toEqual({
      meals: {
        breakfast: [expect.objectContaining({ id: 'log-1', foodName: 'Greek Yogurt' })],
        lunch: [],
        dinner: [],
        snack: [expect.objectContaining({ id: 'log-2', foodName: 'Banana' })],
      },
      totalCalories: 205.6,
      totalProtein: 18.4,
      totalCarbs: 34.2,
      totalFat: 0.7,
    })
  })

  it('builds favorite, recent, and frequent foods for dashboard tabs', () => {
    const resolve = (id: string) => foodItems.find((item) => item.id === id)
    const favorites = buildFavoriteFoods(
      [{ id: 'fav-1', foodItem: '2', created: '2026-03-21' }],
      resolve,
    )
    const recents = buildRecentFoods(
      [
        {
          id: 'recent-1',
          foodItem: '1',
          lastLoggedAt: '2026-03-21T10:00:00Z',
          lastLoggedDate: '2026-03-21',
          lastMealType: 'breakfast',
          lastAmountG: 170,
          timesLogged: 1,
        },
      ],
      resolve,
    )
    const frequent = buildFrequentFoods(
      [
        {
          id: 'freq-1',
          foodItem: '1',
          lastLoggedAt: '2026-03-21T10:00:00Z',
          lastLoggedDate: '2026-03-21',
          lastMealType: 'breakfast',
          lastAmountG: 170,
          timesLogged: 4,
        },
      ],
      resolve,
    )

    expect(favorites).toEqual([foodItems[1]])
    expect(recents).toEqual([foodItems[0]])
    expect(frequent).toEqual([foodItems[0]])
    expect(foodsForDashboardTab('favorites', favorites, recents, frequent)).toEqual([foodItems[1]])
    expect(foodsForDashboardTab('recent', favorites, recents, frequent)).toEqual([foodItems[0]])
    expect(foodsForDashboardTab('frequent', favorites, recents, frequent)).toEqual([foodItems[0]])
  })

  it('builds combined search state from local and remote matches', () => {
    const state = buildCombinedSearchState({
      dashboardQuery: 'banana',
      foodItems,
      searchResults: [
        {
          name: 'Banana chips',
          barcode: '',
          brand: '',
          caloriesPer100g: 0,
          proteinPer100g: 0,
          carbsPer100g: 0,
          fatPer100g: 0,
          servingG: 0,
          offId: '',
        },
      ],
      isSearching: false,
    })

    expect(state.query).toBe('banana')
    expect(state.personalMatches).toEqual([foodItems[1]])
    expect(state.remoteResults).toHaveLength(1)
    expect(state.hasQuery).toBe(true)
    expect(state.showEmptyState).toBe(false)
  })
})
