<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useFoodStore } from '@/stores/food'
import type { FoodItem } from '@/types'
import { Input } from '@/components/ui/input'
import FoodItemCard from './FoodItemCard.vue'

const props = withDefaults(
  defineProps<{
    recentFoods?: FoodItem[]
  }>(),
  {
    recentFoods: () => [],
  },
)

const emit = defineEmits<{
  selectResult: [
    result: {
      barcode: string
      name: string
      brand: string
      caloriesPer100g: number
      proteinPer100g: number
      carbsPer100g: number
      fatPer100g: number
      servingG: number
      offId: string
    },
  ]
  selectPersonal: [item: FoodItem]
  selectRecent: [item: FoodItem]
}>()

const foodStore = useFoodStore()
const query = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const personalMatches = ref<FoodItem[]>([])

const hasResults = computed(
  () =>
    query.value.trim() && (personalMatches.value.length > 0 || foodStore.searchResults.length > 0),
)
const hasQuery = computed(() => query.value.trim().length > 0)
const showRemoteSkeleton = computed(() => hasQuery.value && foodStore.isSearching)
const showEmptyState = computed(
  () =>
    hasQuery.value &&
    !foodStore.isSearching &&
    personalMatches.value.length === 0 &&
    foodStore.searchResults.length === 0,
)

watch(query, (q) => {
  if (debounceTimer) clearTimeout(debounceTimer)

  if (!q.trim()) {
    personalMatches.value = []
    foodStore.searchResults = []
    return
  }

  // Instant personal search
  const lower = q.toLowerCase()
  personalMatches.value = foodStore.foodItems
    .filter((f) => f.name.toLowerCase().includes(lower) || f.brand?.toLowerCase().includes(lower))
    .slice(0, 5)

  // Debounced API search
  debounceTimer = setTimeout(() => {
    void foodStore.searchFoods(q)
  }, 400)
})

function selectPersonalItem(item: FoodItem) {
  query.value = ''
  emit('selectPersonal', item)
}

function selectSearchResult(result: (typeof foodStore.searchResults)[number]) {
  query.value = ''
  emit('selectResult', result)
}

function selectRecentItem(item: FoodItem) {
  query.value = ''
  emit('selectRecent', item)
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="relative">
      <Icon
        icon="lucide:search"
        class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input v-model="query" type="text" placeholder="Search foods..." class="pl-9" />
      <Icon
        v-if="foodStore.isSearching"
        icon="lucide:loader-circle"
        class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
      />
    </div>

    <div
      v-if="hasQuery || props.recentFoods.length > 0"
      class="mt-3 min-h-0 flex-1 overflow-y-auto pb-1"
    >
      <div v-if="!hasQuery && props.recentFoods.length > 0" class="space-y-3">
        <div>
          <p class="px-3 pt-2 text-xs font-medium text-muted-foreground">Recent Foods</p>
          <div class="space-y-1.5 p-1.5">
            <FoodItemCard
              v-for="item in props.recentFoods"
              :key="item.id"
              :name="item.name"
              :brand="item.brand"
              :calories-per100g="item.caloriesPer100g"
              :protein-per100g="item.proteinPer100g"
              :carbs-per100g="item.carbsPer100g"
              :fat-per100g="item.fatPer100g"
              clickable
              @select="selectRecentItem(item)"
            />
          </div>
        </div>
      </div>

      <div v-else-if="hasResults || showRemoteSkeleton || showEmptyState" class="space-y-3">
        <!-- Personal library matches -->
        <div v-if="personalMatches.length > 0">
          <p class="px-3 pt-2 text-xs font-medium text-muted-foreground">My Foods</p>
          <div class="p-1.5">
            <FoodItemCard
              v-for="item in personalMatches"
              :key="item.id"
              :name="item.name"
              :brand="item.brand"
              :calories-per100g="item.caloriesPer100g"
              :protein-per100g="item.proteinPer100g"
              :carbs-per100g="item.carbsPer100g"
              :fat-per100g="item.fatPer100g"
              clickable
              @select="selectPersonalItem(item)"
            />
          </div>
        </div>

        <!-- API search results -->
        <div v-if="foodStore.searchResults.length > 0 || showRemoteSkeleton">
          <p class="px-3 pt-2 text-xs font-medium text-muted-foreground">OpenFoodFacts</p>
          <div v-if="foodStore.searchResults.length > 0" class="p-1.5">
            <FoodItemCard
              v-for="result in foodStore.searchResults"
              :key="result.barcode"
              :name="result.name"
              :brand="result.brand"
              :calories-per100g="result.caloriesPer100g"
              :protein-per100g="result.proteinPer100g"
              :carbs-per100g="result.carbsPer100g"
              :fat-per100g="result.fatPer100g"
              clickable
              @select="selectSearchResult(result)"
            />
          </div>
          <div v-else class="space-y-2 p-1.5">
            <div
              v-for="n in 3"
              :key="n"
              class="animate-shimmer rounded-lg border border-border px-3 py-5"
            />
          </div>
        </div>

        <div
          v-if="showEmptyState"
          class="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground"
        >
          <p class="font-medium text-foreground">No foods found</p>
          <p class="mt-1">Try a broader search term, brand name, or barcode scan.</p>
        </div>
      </div>
    </div>
  </div>
</template>
