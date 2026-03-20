<script setup lang="ts">
import { computed, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import { useHaptics } from '@/composables/useHaptics'
import type { FoodLogEntry, MealType } from '@/types'

const SWIPE_THRESHOLD = 80
const MAX_SWIPE = 100

const props = defineProps<{
  mealType: MealType
  entries: FoodLogEntry[]
}>()

const emit = defineEmits<{
  editEntry: [entry: FoodLogEntry]
  addFood: [mealType: MealType]
  deleteEntry: [entry: FoodLogEntry]
  duplicateEntry: [entry: FoodLogEntry]
}>()

const haptics = useHaptics()

const mealConfig: Record<MealType, { label: string; icon: string }> = {
  breakfast: { label: 'Breakfast', icon: 'lucide:sunrise' },
  lunch: { label: 'Lunch', icon: 'lucide:sun' },
  dinner: { label: 'Dinner', icon: 'lucide:sunset' },
  snack: { label: 'Snack', icon: 'lucide:cookie' },
}

const config = computed(() => mealConfig[props.mealType])
const addLabel = computed(() => `Add to ${config.value.label.toLowerCase()}`)

const subtotalCalories = computed(() => props.entries.reduce((s, e) => s + e.calories, 0))
const subtotalProtein = computed(() => props.entries.reduce((s, e) => s + (e.protein ?? 0), 0))
const subtotalCarbs = computed(() => props.entries.reduce((s, e) => s + (e.carbs ?? 0), 0))
const subtotalFat = computed(() => props.entries.reduce((s, e) => s + (e.fat ?? 0), 0))

function formatNumber(value: number) {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1)
}

function actionOpacity(entryId: string) {
  return Math.abs(swipeOffsets[entryId] ?? 0) > 2 ? 1 : 0
}

// Swipe state per entry
const swipeOffsets = reactive<Record<string, number>>({})
const swipeTracking = new Map<string, { startX: number; startY: number; active: boolean }>()

function onTouchStart(e: TouchEvent, entry: FoodLogEntry) {
  const touch = e.touches[0]
  swipeTracking.set(entry.id, { startX: touch.clientX, startY: touch.clientY, active: false })
}

function onTouchMove(e: TouchEvent, entry: FoodLogEntry) {
  const state = swipeTracking.get(entry.id)
  if (!state) return

  const touch = e.touches[0]
  const deltaX = touch.clientX - state.startX
  const deltaY = touch.clientY - state.startY

  if (!state.active) {
    if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      state.active = true
    } else if (Math.abs(deltaY) > 10) {
      swipeTracking.delete(entry.id)
      return
    } else {
      return
    }
  }

  e.preventDefault()
  swipeOffsets[entry.id] = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, deltaX))
}

function onTouchEnd(entry: FoodLogEntry) {
  const offset = swipeOffsets[entry.id] ?? 0
  const state = swipeTracking.get(entry.id)
  swipeTracking.delete(entry.id)

  if (offset <= -SWIPE_THRESHOLD) {
    haptics.error()
    emit('deleteEntry', entry)
  } else if (offset >= SWIPE_THRESHOLD) {
    haptics.light()
    emit('duplicateEntry', entry)
  } else if (!state?.active) {
    // No swipe — treat as tap
    emit('editEntry', entry)
  }

  swipeOffsets[entry.id] = 0
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Icon :icon="config.icon" class="h-4 w-4 text-muted-foreground" />
        <span class="text-base font-semibold">{{ config.label }}</span>
        <span v-if="entries.length > 0" class="text-xs text-muted-foreground">
          {{ formatNumber(subtotalCalories) }} kcal
        </span>
      </div>
      <button
        type="button"
        class="flex h-9 items-center gap-1 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        @click="$emit('addFood', mealType)"
      >
        <Icon icon="lucide:plus" class="h-3.5 w-3.5" />
        Add Food
      </button>
    </div>

    <button
      v-if="entries.length === 0"
      type="button"
      class="flex w-full items-center justify-between rounded-2xl border border-dashed border-border bg-muted/25 px-4 py-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
      @click="$emit('addFood', mealType)"
    >
      <div>
        <p class="text-sm font-semibold text-foreground">{{ addLabel }}</p>
        <p class="mt-1 text-xs text-muted-foreground">
          Start this meal with a saved or searched food.
        </p>
      </div>
      <div class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon icon="lucide:plus" class="size-4" />
      </div>
    </button>

    <div v-else class="space-y-2">
      <button
        type="button"
        class="flex w-full items-center justify-between rounded-xl border border-dashed border-border/70 bg-muted/20 px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
        @click="$emit('addFood', mealType)"
      >
        <span class="text-sm font-medium text-foreground">{{ addLabel }}</span>
        <Icon icon="lucide:plus" class="size-4 text-primary" />
      </button>

      <div class="space-y-2">
        <div v-for="entry in entries" :key="entry.id" class="relative overflow-hidden rounded-2xl">
          <!-- Background actions (revealed by swipe) -->
          <div
            class="absolute inset-y-0 left-0 flex items-center gap-1 bg-primary px-4 transition-opacity duration-150"
            :style="{ opacity: actionOpacity(entry.id) }"
          >
            <Icon icon="lucide:copy" class="size-4 text-primary-foreground" />
            <span class="text-xs font-medium text-primary-foreground">Copy</span>
          </div>
          <div
            class="absolute inset-y-0 right-0 flex items-center gap-1 bg-destructive px-4 transition-opacity duration-150"
            :style="{ opacity: actionOpacity(entry.id) }"
          >
            <span class="text-xs font-medium text-white">Delete</span>
            <Icon icon="lucide:trash-2" class="size-4 text-white" />
          </div>

          <!-- Swipeable entry -->
          <div
            data-swipe-item
            class="relative flex cursor-pointer items-start justify-between rounded-2xl border border-border/70 bg-background px-3 py-3 text-sm transition-colors hover:bg-muted/50"
            :style="{
              transform: `translateX(${swipeOffsets[entry.id] ?? 0}px)`,
              transition: swipeOffsets[entry.id] ? 'none' : 'transform 0.2s ease',
            }"
            @touchstart="onTouchStart($event, entry)"
            @touchmove="onTouchMove($event, entry)"
            @touchend="onTouchEnd(entry)"
            @click.stop
          >
            <div class="min-w-0 flex-1 pr-3">
              <p class="truncate font-medium text-foreground">{{ entry.foodName }}</p>
              <p class="mt-1 text-xs text-muted-foreground">{{ formatNumber(entry.amountG) }}g</p>
            </div>
            <div class="flex shrink-0 flex-col items-end gap-1">
              <span class="text-sm font-semibold text-foreground">
                {{ formatNumber(entry.calories) }} kcal
              </span>
              <div class="flex flex-wrap justify-end gap-2 text-[11px] text-muted-foreground">
                <span v-if="entry.protein">P {{ formatNumber(entry.protein) }}</span>
                <span v-if="entry.carbs">C {{ formatNumber(entry.carbs) }}</span>
                <span v-if="entry.fat">F {{ formatNumber(entry.fat) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subtotals row (only if there are entries with macros) -->
    <div
      v-if="entries.length > 1"
      class="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 border-t border-border/50 pt-2 text-xs text-muted-foreground"
    >
      <span class="font-medium text-foreground">{{ formatNumber(subtotalCalories) }} kcal</span>
      <span v-if="subtotalProtein">P {{ formatNumber(subtotalProtein) }}g</span>
      <span v-if="subtotalCarbs">C {{ formatNumber(subtotalCarbs) }}g</span>
      <span v-if="subtotalFat">F {{ formatNumber(subtotalFat) }}g</span>
    </div>
  </div>
</template>
