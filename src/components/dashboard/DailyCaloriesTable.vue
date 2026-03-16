<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { DailyCalorieRow, MealType } from '@/types'
import { useWeightStore } from '@/stores/weight'
import { useFoodStore } from '@/stores/food'
import { formatDateShort } from '@/lib/date'
import { getCalorieStatus } from '@/lib/calorieStatus'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import EditCaloriesDayDialog from '@/components/dashboard/EditCaloriesDayDialog.vue'
import DailyFoodBreakdown from '@/components/dashboard/food/DailyFoodBreakdown.vue'
import LogFoodDialog from '@/components/dashboard/food/LogFoodDialog.vue'

const store = useWeightStore()
const foodStore = useFoodStore()

const selectedRow = ref<DailyCalorieRow | null>(null)
const editDialogOpen = ref(false)
const breakdownDialogOpen = ref(false)
const breakdownDate = ref<string | null>(null)
const scrollContainerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const containerHeight = ref(500)

const rows = computed(() => [...store.dailyCalorieRows].reverse())

const ROW_HEIGHT = 52
const OVERSCAN = 8
const VIRTUALIZATION_THRESHOLD = 120

const useVirtualRows = computed(() => rows.value.length > VIRTUALIZATION_THRESHOLD)

const visibleCount = computed(() => {
  if (!useVirtualRows.value) return rows.value.length
  return Math.ceil(containerHeight.value / ROW_HEIGHT) + OVERSCAN * 2
})

const startIndex = computed(() => {
  if (!useVirtualRows.value) return 0
  const firstVisibleIndex = Math.floor(scrollTop.value / ROW_HEIGHT)
  return Math.max(0, firstVisibleIndex - OVERSCAN)
})

const endIndex = computed(() => {
  if (!useVirtualRows.value) return rows.value.length
  return Math.min(rows.value.length, startIndex.value + visibleCount.value)
})

const visibleRows = computed(() => {
  if (!useVirtualRows.value) return rows.value
  return rows.value.slice(startIndex.value, endIndex.value)
})

const topSpacerHeight = computed(() => {
  if (!useVirtualRows.value) return 0
  return startIndex.value * ROW_HEIGHT
})

const bottomSpacerHeight = computed(() => {
  if (!useVirtualRows.value) return 0
  return Math.max(0, (rows.value.length - endIndex.value) * ROW_HEIGHT)
})

function measureContainer() {
  const el = scrollContainerRef.value
  if (!el) return
  containerHeight.value = el.clientHeight
}

function onScroll() {
  const el = scrollContainerRef.value
  if (!el) return
  scrollTop.value = el.scrollTop
}

onMounted(() => {
  measureContainer()
  window.addEventListener('resize', measureContainer)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureContainer)
})

function getStatus(row: DailyCalorieRow) {
  return getCalorieStatus(row.consumedKcal, row.goalKcal, store.settings.goalDirection)
}

function isStatusAlignedWithGoal(row: DailyCalorieRow): boolean {
  const status = getStatus(row)
  if (!status) return false
  if (status.side === 'target') return true

  const direction = store.settings.goalDirection ?? 'loss'
  return direction === 'loss' ? status.side === 'under' : status.side === 'over'
}

function getRowHighlightClass(row: DailyCalorieRow): string {
  const status = getStatus(row)
  if (!status) return ''
  if (isStatusAlignedWithGoal(row)) return 'bg-emerald-500/5 hover:bg-emerald-500/10'
  return 'bg-red-500/5 hover:bg-red-500/10'
}

function getConsumedClass(row: DailyCalorieRow): string {
  if (!getStatus(row)) return ''
  return isStatusAlignedWithGoal(row)
    ? 'font-semibold text-emerald-600 dark:text-emerald-400'
    : 'font-semibold text-red-600 dark:text-red-400'
}

function getFoodCount(date: string): number {
  const summary = foodStore.dailyFoodSummaries.get(date)
  if (!summary) return 0
  return Object.values(summary.meals).reduce((s, entries) => s + entries.length, 0)
}

function openRow(row: DailyCalorieRow) {
  const foodCount = getFoodCount(row.date)
  if (foodCount > 0) {
    breakdownDate.value = row.date
    breakdownDialogOpen.value = true
  } else {
    selectedRow.value = row
    editDialogOpen.value = true
  }
}

function openEditFromBreakdown(row: DailyCalorieRow) {
  selectedRow.value = row
  editDialogOpen.value = true
}

const logFoodOpen = ref(false)
const logFoodDate = ref<string | undefined>()
const logFoodMealType = ref<MealType | undefined>()

function onAddFood(mealType: MealType) {
  logFoodDate.value = breakdownDate.value ?? undefined
  logFoodMealType.value = mealType
  breakdownDialogOpen.value = false
  logFoodOpen.value = true
}
</script>

<template>
  <div class="space-y-3">
    <!-- Empty state (shared) -->
    <div v-if="rows.length === 0" class="py-12 text-center">
      <div class="flex flex-col items-center gap-2">
        <Icon
          icon="lucide:utensils"
          class="h-12 w-12 text-muted-foreground/25 animate-gentle-bob"
        />
        <p class="text-sm font-medium text-foreground/70">No calorie entries yet</p>
        <p class="text-xs text-muted-foreground">Log your first meal to start tracking</p>
      </div>
    </div>

    <template v-else>
      <!-- Mobile: card list -->
      <div class="max-h-[500px] space-y-2 overflow-auto lg:hidden">
        <div
          v-for="row in rows"
          :key="row.date"
          class="flex cursor-pointer items-center justify-between rounded-xl border border-border/50 bg-card p-4 transition-colors"
          :class="getRowHighlightClass(row)"
          @click="openRow(row)"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <Icon icon="lucide:utensils" class="size-5" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium">{{ formatDateShort(row.date) }}</p>
              <Badge
                v-if="getFoodCount(row.date) > 0"
                variant="secondary"
                class="mt-0.5 px-1.5 py-0 text-[10px]"
              >
                {{ getFoodCount(row.date) }} items
              </Badge>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <p v-if="row.consumedKcal !== null" class="text-sm" :class="getConsumedClass(row)">
                {{ row.consumedKcal }} <span class="text-xs text-muted-foreground">kcal</span>
              </p>
              <p v-else class="text-sm text-muted-foreground">—</p>
              <p class="text-xs text-muted-foreground">
                <template v-if="row.goalKcal !== null">Goal: {{ row.goalKcal }}</template>
                <template v-else>No goal</template>
              </p>
              <Badge
                v-if="row.consumedKcal !== null && row.goalKcal !== null && getStatus(row)"
                class="mt-0.5 text-[10px]"
                :class="getStatus(row)?.badgeClass"
              >
                {{ getStatus(row)?.label }}
              </Badge>
            </div>
            <button
              type="button"
              class="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              @click.stop="openEditFromBreakdown(row)"
            >
              <Icon icon="lucide:pencil" class="size-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop: table -->
      <div
        ref="scrollContainerRef"
        class="hidden max-h-[500px] overflow-auto rounded-lg border border-border lg:block"
        @scroll="onScroll"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Consumed (kcal)</TableHead>
              <TableHead>Goal (kcal)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="topSpacerHeight > 0" aria-hidden="true">
              <TableCell
                :style="{ height: `${topSpacerHeight}px`, padding: 0, border: 'none' }"
                colspan="5"
              />
            </TableRow>
            <TableRow
              v-for="row in visibleRows"
              :key="row.date"
              class="cursor-pointer transition-colors duration-150 even:bg-muted/20 hover:bg-primary/5"
              :class="getRowHighlightClass(row)"
              @click="openRow(row)"
            >
              <TableCell class="font-medium">
                <div class="flex items-center gap-1.5">
                  {{ formatDateShort(row.date) }}
                  <Badge
                    v-if="getFoodCount(row.date) > 0"
                    variant="secondary"
                    class="px-1.5 py-0 text-[10px]"
                  >
                    {{ getFoodCount(row.date) }} items
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <span v-if="row.consumedKcal !== null" :class="getConsumedClass(row)">
                  {{ row.consumedKcal }}
                </span>
                <span v-else class="text-muted-foreground">—</span>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-1.5">
                  <span v-if="row.goalKcal !== null">{{ row.goalKcal }}</span>
                  <span v-else class="text-muted-foreground">—</span>
                  <Badge
                    v-if="row.goalSource === 'override'"
                    variant="secondary"
                    class="px-1.5 py-0 text-[10px]"
                  >
                    custom
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <template v-if="row.consumedKcal !== null && row.goalKcal !== null">
                  <Badge v-if="getStatus(row)" class="text-xs" :class="getStatus(row)?.badgeClass">
                    {{ getStatus(row)?.label }}
                  </Badge>
                </template>
                <span v-else class="text-xs text-muted-foreground">—</span>
              </TableCell>
              <TableCell class="text-right">
                <button
                  type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-background hover:text-foreground"
                  @click.stop="openEditFromBreakdown(row)"
                >
                  <Icon icon="lucide:pencil" class="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
            <TableRow v-if="bottomSpacerHeight > 0" aria-hidden="true">
              <TableCell
                :style="{ height: `${bottomSpacerHeight}px`, padding: 0, border: 'none' }"
                colspan="5"
              />
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </template>

    <EditCaloriesDayDialog v-model:open="editDialogOpen" :row="selectedRow" />
    <DailyFoodBreakdown
      v-model:open="breakdownDialogOpen"
      :date="breakdownDate"
      @add-food="onAddFood"
    />
    <LogFoodDialog
      v-model:open="logFoodOpen"
      :initial-date="logFoodDate"
      :initial-meal-type="logFoodMealType"
      hide-trigger
    />
  </div>
</template>
