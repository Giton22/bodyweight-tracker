<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { toast } from 'vue-sonner'
import { useWeightStore } from '@/stores/weight'
import { useFoodStore } from '@/stores/food'
import { today } from '@/composables/useToday'
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import { useSwipeDayNavigation } from '@/composables/useSwipeDayNavigation'
import { addDays, formatDateShort } from '@/lib/date'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CaloriesRingProgress from '@/components/dashboard/CaloriesRingProgress.vue'
import MacroProgressBars from '@/components/dashboard/MacroProgressBars.vue'
import MealSection from '@/components/dashboard/food/MealSection.vue'
import LogFoodDialog from '@/components/dashboard/food/LogFoodDialog.vue'
import EditFoodLogDialog from '@/components/dashboard/food/EditFoodLogDialog.vue'
import type { FoodItem, FoodLogEntry, MealType } from '@/types'
import NutritionLogSkeleton from '@/components/dashboard/skeletons/NutritionLogSkeleton.vue'

const route = useRoute()

const showSkeleton = computed(() => foodStore.isLoading && foodStore.foodLog.length === 0)
const weightStore = useWeightStore()
const foodStore = useFoodStore()

// ── Date navigation ──
const selectedDate = ref(today.value)
const isToday = computed(() => selectedDate.value === today.value)

function prevDay() {
  selectedDate.value = addDays(selectedDate.value, -1)
}
function nextDay() {
  selectedDate.value = addDays(selectedDate.value, 1)
}
function goToday() {
  selectedDate.value = today.value
}

const dateLabel = computed(() => {
  if (selectedDate.value === today.value) return 'Today'
  if (selectedDate.value === addDays(today.value, -1)) return 'Yesterday'
  if (selectedDate.value === addDays(today.value, 1)) return 'Tomorrow'
  return formatDateShort(selectedDate.value)
})

// ── Calorie & macro data for selected date ──
const daySummary = computed(() => {
  return weightStore.dailyCalorieRows.find((r) => r.date === selectedDate.value) ?? null
})
const consumed = computed(() => daySummary.value?.consumedKcal ?? 0)
const goal = computed(() => daySummary.value?.goalKcal ?? 2000)

const dayMacros = computed(() => {
  const s = foodStore.dailyFoodSummaries.get(selectedDate.value)
  return {
    protein: s?.totalProtein ?? 0,
    carbs: s?.totalCarbs ?? 0,
    fat: s?.totalFat ?? 0,
  }
})
const macroGoals = computed(() => ({
  protein: weightStore.settings.proteinGoalG ?? 150,
  carbs: weightStore.settings.carbsGoalG ?? 250,
  fat: weightStore.settings.fatGoalG ?? 65,
}))

function formatNumber(value: number) {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1)
}

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

function entriesForMeal(meal: MealType) {
  return foodStore.foodLog.filter((e) => e.date === selectedDate.value && e.mealType === meal)
}

// Dialog state
const logFoodOpen = ref(false)
const logFoodInitialMeal = ref<MealType | undefined>(undefined)
const logFoodInitialFood = ref<FoodItem | undefined>(undefined)
const editFoodOpen = ref(false)
const editingFoodEntry = ref<FoodLogEntry | null>(null)

function onLogFoodClosed(isOpen: boolean) {
  logFoodOpen.value = isOpen
  if (!isOpen) {
    logFoodInitialMeal.value = undefined
    logFoodInitialFood.value = undefined
  }
}

function openAddFood(meal: MealType) {
  logFoodInitialMeal.value = meal
  logFoodInitialFood.value = undefined
  logFoodOpen.value = true
}

function openRecentFood(food: FoodItem) {
  logFoodInitialMeal.value = undefined
  logFoodInitialFood.value = food
  logFoodOpen.value = true
}

function openEditFood(entry: FoodLogEntry) {
  editingFoodEntry.value = entry
  editFoodOpen.value = true
}

async function deleteEntry(entry: FoodLogEntry) {
  try {
    await foodStore.deleteFoodLogEntry(entry.id)
    toast.success('Entry deleted')
  } catch {
    toast.error('Failed to delete entry')
  }
}

async function duplicateEntry(entry: FoodLogEntry) {
  try {
    await foodStore.logFood({
      date: entry.date,
      mealType: entry.mealType,
      foodName: entry.foodName,
      amountG: entry.amountG,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
    })
    toast.success('Entry duplicated')
  } catch {
    toast.error('Failed to duplicate entry')
  }
}

// Pull-to-refresh
const containerRef = ref<HTMLElement | null>(null)
const { pullDistance, isRefreshing } = usePullToRefresh(containerRef, {
  async onRefresh() {
    await foodStore.loadFoodData()
  },
})

// Swipe between days
const swipeDirection = ref<'left' | 'right' | null>(null)
const { offsetX, onTouchStart, onTouchMove, onTouchEnd } = useSwipeDayNavigation(containerRef, {
  onPrev() {
    swipeDirection.value = 'right'
    prevDay()
  },
  onNext() {
    swipeDirection.value = 'left'
    nextDay()
  },
})

const recentFoods = computed(() => foodStore.recentFoods.slice(0, 8))
</script>

<template>
  <div ref="containerRef" class="p-4 lg:p-8">
    <!-- Pull-to-refresh indicator -->
    <div
      v-if="pullDistance > 0 || isRefreshing"
      class="flex items-center justify-center pb-2 lg:hidden"
      :style="{ height: `${Math.max(pullDistance, isRefreshing ? 40 : 0)}px` }"
    >
      <Icon
        icon="lucide:loader-circle"
        class="size-5 text-primary"
        :class="{ 'animate-spin': isRefreshing }"
      />
    </div>

    <div class="mx-auto max-w-7xl">
      <!-- Desktop heading -->
      <div class="mb-6 hidden lg:block">
        <h2 class="text-3xl font-black tracking-tight">Nutrition Log</h2>
        <p class="text-muted-foreground">Track your daily food intake and macros.</p>
      </div>

      <!-- Tab navigation -->
      <div class="mb-6 flex gap-4 border-b border-border">
        <RouterLink
          to="/nutrition"
          class="border-b-2 px-1 pb-2 text-sm font-medium transition-colors"
          :class="
            route.path === '/nutrition'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          "
        >
          Food Log
        </RouterLink>
        <RouterLink
          to="/nutrition/overview"
          class="border-b-2 px-1 pb-2 text-sm font-medium transition-colors"
          :class="
            route.path === '/nutrition/overview'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          "
        >
          Overview
        </RouterLink>
      </div>

      <div class="mx-auto max-w-4xl">
        <!-- Skeleton loading state -->
        <NutritionLogSkeleton v-if="showSkeleton" />

        <!-- Date Navigator -->
        <div v-if="!showSkeleton" class="mb-4 flex items-center justify-center gap-3">
          <Button variant="ghost" size="icon" class="size-11" @click="prevDay">
            <Icon icon="lucide:chevron-left" class="size-5" />
          </Button>
          <button
            class="min-w-[120px] text-center text-sm font-semibold"
            :class="isToday ? '' : 'cursor-pointer hover:underline'"
            @click="goToday"
          >
            {{ dateLabel }}
          </button>
          <Button variant="ghost" size="icon" class="size-11" @click="nextDay">
            <Icon icon="lucide:chevron-right" class="size-5" />
          </Button>
          <Button
            v-if="!isToday"
            variant="outline"
            size="sm"
            class="ml-1 h-7 text-xs"
            @click="goToday"
          >
            Today
          </Button>
        </div>

        <!-- Swipeable day content -->
        <div
          v-if="!showSkeleton"
          class="relative overflow-hidden"
          @touchstart.passive="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <Transition
            :name="swipeDirection === 'left' ? 'slide-left' : 'slide-right'"
            mode="out-in"
          >
            <div
              :key="selectedDate"
              class="space-y-4"
              :style="{
                transform: offsetX ? `translateX(${offsetX}px)` : undefined,
                transition: offsetX ? 'none' : undefined,
              }"
            >
              <Card class="animate-card-enter shadow-warm">
                <CardContent class="pt-5">
                  <div class="grid gap-4 lg:grid-cols-[170px_1fr] lg:items-center">
                    <div class="mx-auto w-full max-w-[170px]">
                      <CaloriesRingProgress :consumed="consumed" :goal="goal" />
                    </div>
                    <div class="space-y-4">
                      <div class="grid grid-cols-3 gap-2">
                        <div class="rounded-xl bg-muted/35 px-3 py-3 text-center">
                          <p class="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Goal
                          </p>
                          <p class="mt-1 text-base font-bold">{{ goal.toLocaleString() }}</p>
                        </div>
                        <div class="rounded-xl bg-muted/35 px-3 py-3 text-center">
                          <p class="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Food
                          </p>
                          <p class="mt-1 text-base font-bold">{{ formatNumber(consumed) }}</p>
                        </div>
                        <div class="rounded-xl bg-primary/8 px-3 py-3 text-center">
                          <p class="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Left
                          </p>
                          <p class="mt-1 text-base font-bold text-primary">
                            {{ formatNumber(Math.max(0, goal - consumed)) }}
                          </p>
                        </div>
                      </div>

                      <div class="rounded-2xl border border-border/70 bg-background p-3">
                        <div class="mb-3 flex items-center justify-between">
                          <div>
                            <h3 class="text-sm font-semibold">Macros</h3>
                            <p class="text-xs text-muted-foreground">Personal targets for today</p>
                          </div>
                          <RouterLink
                            to="/profile"
                            class="text-xs font-medium text-primary hover:underline"
                          >
                            Edit goals
                          </RouterLink>
                        </div>
                        <MacroProgressBars
                          :protein="dayMacros.protein"
                          :protein-goal="macroGoals.protein"
                          :carbs="dayMacros.carbs"
                          :carbs-goal="macroGoals.carbs"
                          :fat="dayMacros.fat"
                          :fat-goal="macroGoals.fat"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card class="animate-card-enter shadow-warm" style="animation-delay: 50ms">
                <CardContent class="pt-5">
                  <div class="mb-3 flex items-center justify-between">
                    <div>
                      <h3 class="text-base font-bold">Recent Foods</h3>
                      <p class="text-xs text-muted-foreground">
                        Tap once to reopen with saved nutrition.
                      </p>
                    </div>
                    <Icon icon="lucide:history" class="size-4 text-muted-foreground" />
                  </div>

                  <div
                    v-if="recentFoods.length === 0"
                    class="rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted-foreground"
                  >
                    Your recently logged foods will appear here.
                  </div>

                  <div v-else class="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
                    <button
                      v-for="food in recentFoods"
                      :key="food.id"
                      type="button"
                      class="min-w-[180px] shrink-0 rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                      @click="openRecentFood(food)"
                    >
                      <div class="mb-3 flex items-center justify-between gap-3">
                        <div
                          class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"
                        >
                          <Icon icon="lucide:utensils" class="size-4" />
                        </div>
                        <span class="text-xs font-medium text-muted-foreground">
                          {{ food.defaultServingG || 100 }}g default
                        </span>
                      </div>
                      <p class="line-clamp-2 text-sm font-semibold">{{ food.name }}</p>
                      <p v-if="food.brand" class="mt-1 text-xs text-muted-foreground">
                        {{ food.brand }}
                      </p>
                      <div class="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span class="font-semibold text-foreground">
                          {{ formatNumber(food.caloriesPer100g) }} kcal
                        </span>
                        <span v-if="food.proteinPer100g"
                          >P {{ formatNumber(food.proteinPer100g) }}g</span
                        >
                        <span v-if="food.carbsPer100g"
                          >C {{ formatNumber(food.carbsPer100g) }}g</span
                        >
                        <span v-if="food.fatPer100g">F {{ formatNumber(food.fatPer100g) }}g</span>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>

              <div class="space-y-4">
                <Card
                  v-for="meal in mealTypes"
                  :key="meal"
                  class="animate-card-enter shadow-warm"
                  :style="{ animationDelay: `${100 + mealTypes.indexOf(meal) * 50}ms` }"
                >
                  <CardContent class="pt-4">
                    <MealSection
                      :meal-type="meal"
                      :entries="entriesForMeal(meal)"
                      @add-food="openAddFood"
                      @edit-entry="openEditFood"
                      @delete-entry="deleteEntry"
                      @duplicate-entry="duplicateEntry"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <LogFoodDialog
      :open="logFoodOpen"
      :initial-date="selectedDate"
      :initial-meal-type="logFoodInitialMeal"
      :initial-food="logFoodInitialFood"
      hide-trigger
      @update:open="onLogFoodClosed"
    />
    <EditFoodLogDialog v-model:open="editFoodOpen" :entry="editingFoodEntry" />
  </div>
</template>
