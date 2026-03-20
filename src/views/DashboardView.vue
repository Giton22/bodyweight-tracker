<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import draggable from 'vuedraggable'
import { useWeightStore } from '@/stores/weight'
import { useFoodStore } from '@/stores/food'
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import { useDashboardLayout } from '@/composables/useDashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import BmiHalfCircleGauge from '@/components/dashboard/BmiHalfCircleGauge.vue'
import CaloriesDonutChart from '@/components/dashboard/CaloriesDonutChart.vue'
import MacroProgressBars from '@/components/dashboard/MacroProgressBars.vue'
import WeightTrendBarChart from '@/components/dashboard/WeightTrendBarChart.vue'
import WeightGoalSummary from '@/components/dashboard/WeightGoalSummary.vue'
import DashboardSkeleton from '@/components/dashboard/skeletons/DashboardSkeleton.vue'
import StreakCard from '@/components/dashboard/StreakCard.vue'

const weightStore = useWeightStore()
const foodStore = useFoodStore()

const todaySummary = computed(() => weightStore.todayCalorieSummary)
const consumed = computed(() => todaySummary.value?.consumedKcal ?? 0)
const goal = computed(() => todaySummary.value?.goalKcal ?? 2000)

const todayMacros = computed(() => {
  const s = foodStore.todayFoodSummary
  return {
    protein: s?.totalProtein ?? 0,
    carbs: s?.totalCarbs ?? 0,
    fat: s?.totalFat ?? 0,
  }
})

// Dashboard layout
const {
  layout,
  isEditMode,
  visibleWidgets,
  toggleVisibility,
  resetLayout,
  enterEditMode,
  exitEditMode,
} = useDashboardLayout()

const allHidden = computed(() => visibleWidgets.value.length === 0 && !isEditMode.value)

// Pull-to-refresh (disabled in edit mode)
const containerRef = ref<HTMLElement | null>(null)
const { pullDistance, isRefreshing } = usePullToRefresh(containerRef, {
  async onRefresh() {
    if (isEditMode.value) return
    await Promise.all([weightStore.loadAll(), foodStore.loadFoodData()])
  },
})

function onDragStart() {
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }
}
</script>

<template>
  <div ref="containerRef" class="p-4 lg:p-8">
    <!-- Pull-to-refresh indicator -->
    <div
      v-if="(pullDistance > 0 || isRefreshing) && !isEditMode"
      class="flex items-center justify-center pb-2 lg:hidden"
      :style="{ height: `${Math.max(pullDistance, isRefreshing ? 40 : 0)}px` }"
    >
      <Icon
        icon="lucide:loader-circle"
        class="size-5 text-primary"
        :class="{ 'animate-spin': isRefreshing }"
      />
    </div>

    <div class="mx-auto max-w-7xl space-y-6 lg:space-y-8">
      <!-- Page heading -->
      <div class="flex items-center justify-between">
        <div class="hidden lg:block">
          <h2 class="text-3xl font-black tracking-tight">Health Dashboard</h2>
          <p class="text-muted-foreground">Welcome back! Here's your health overview for today.</p>
        </div>
        <!-- Edit mode controls -->
        <div v-if="weightStore.isSynced" class="ml-auto flex items-center gap-2">
          <template v-if="isEditMode">
            <button
              class="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              @click="resetLayout"
            >
              Reset to Default
            </button>
            <button
              class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              @click="exitEditMode"
            >
              Done
            </button>
          </template>
          <button
            v-else
            class="rounded-md p-2 text-muted-foreground hover:bg-muted"
            title="Customize dashboard"
            @click="enterEditMode"
          >
            <Icon icon="lucide:pencil" class="size-4" />
          </button>
        </div>
      </div>

      <!-- Skeleton loading state -->
      <DashboardSkeleton v-if="!weightStore.isSynced" />

      <!-- Empty state -->
      <div
        v-else-if="allHidden"
        class="flex flex-col items-center justify-center gap-4 py-16 text-center"
      >
        <Icon icon="lucide:layout-dashboard" class="size-12 text-muted-foreground/50" />
        <p class="text-muted-foreground">Dashboard is empty. All widgets are hidden.</p>
        <button
          class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          @click="enterEditMode"
        >
          Customize Dashboard
        </button>
      </div>

      <!-- Draggable widget list -->
      <draggable
        v-else-if="weightStore.isSynced"
        v-model="layout"
        item-key="id"
        handle=".drag-handle"
        :disabled="!isEditMode"
        :animation="200"
        ghost-class="opacity-30"
        class="space-y-6 lg:space-y-8"
        @start="onDragStart"
      >
        <template #item="{ element }">
          <div
            v-show="isEditMode || element.visible"
            :class="{ 'opacity-50': !element.visible && isEditMode }"
          >
            <!-- Widget wrapper with edit controls -->
            <div class="relative">
              <!-- Edit mode overlay controls -->
              <div
                v-if="isEditMode"
                class="absolute -left-1 -top-1 z-10 flex items-center gap-1 rounded-md bg-background/90 p-1 shadow-sm ring-1 ring-border"
              >
                <button
                  class="drag-handle cursor-grab p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
                >
                  <Icon icon="lucide:grip-vertical" class="size-4" />
                </button>
                <button
                  class="p-1 text-muted-foreground hover:text-foreground"
                  :title="element.visible ? 'Hide widget' : 'Show widget'"
                  @click="toggleVisibility(element.id)"
                >
                  <Icon :icon="element.visible ? 'lucide:eye' : 'lucide:eye-off'" class="size-4" />
                </button>
              </div>

              <!-- Streak widget -->
              <StreakCard v-if="element.id === 'streak'" />

              <!-- BMI widget -->
              <Card v-else-if="element.id === 'bmi'" class="shadow-warm">
                <CardContent class="flex flex-col items-center justify-between pt-6">
                  <div class="mb-4 flex w-full items-center justify-between">
                    <h3 class="text-lg font-bold">Current BMI</h3>
                    <span
                      v-if="weightStore.bmiCategory"
                      class="text-sm font-medium"
                      :class="weightStore.bmiCategory.textColorClass"
                    >
                      {{ weightStore.bmiCategory.shortLabel }}
                    </span>
                  </div>
                  <BmiHalfCircleGauge
                    :bmi="weightStore.bmi"
                    :category="weightStore.bmiCategory?.shortLabel"
                  />
                  <p
                    v-if="weightStore.bmi !== null"
                    class="mt-4 text-center text-sm text-muted-foreground"
                  >
                    Your BMI is in the
                    <span class="font-semibold" :class="weightStore.bmiCategory?.textColorClass">
                      {{ weightStore.bmiCategory?.shortLabel?.toLowerCase() }}
                    </span>
                    range.
                  </p>
                  <p v-else class="mt-4 text-center text-sm text-muted-foreground">
                    Log weight and set height to see your BMI.
                  </p>
                </CardContent>
              </Card>

              <!-- Daily Calories widget -->
              <Card v-else-if="element.id === 'daily-calories'" class="shadow-warm">
                <CardContent class="flex flex-col gap-6 pt-6 md:flex-row md:gap-8">
                  <div class="flex-1">
                    <h3 class="mb-6 text-lg font-bold">Daily Calories</h3>
                    <MacroProgressBars
                      :protein="todayMacros.protein"
                      :carbs="todayMacros.carbs"
                      :fat="todayMacros.fat"
                    />
                  </div>
                  <div
                    class="flex flex-col items-center justify-center border-t border-border pt-6 md:min-w-[200px] md:border-l md:border-t-0 md:pl-8 md:pt-0"
                  >
                    <CaloriesDonutChart :consumed="consumed" :goal="goal" />
                    <p class="mt-2 text-sm font-semibold">Goal: {{ goal.toLocaleString() }} kcal</p>
                    <p class="text-xs text-muted-foreground">
                      {{ goal > 0 ? Math.round((consumed / goal) * 100) : 0 }}% of daily target
                    </p>
                  </div>
                </CardContent>
              </Card>

              <!-- Weight Trend widget -->
              <Card v-else-if="element.id === 'weight-trend'" class="shadow-warm">
                <CardContent class="pt-6">
                  <WeightTrendBarChart />
                  <WeightGoalSummary class="mt-6" />
                </CardContent>
              </Card>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>
