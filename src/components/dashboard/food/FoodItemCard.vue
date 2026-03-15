<script setup lang="ts">
defineProps<{
  name: string
  brand?: string
  caloriesPer100g: number
  proteinPer100g?: number
  carbsPer100g?: number
  fatPer100g?: number
  servingG?: number
  clickable?: boolean
}>()

defineEmits<{
  select: []
}>()
</script>

<template>
  <div
    class="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm transition-colors"
    :class="clickable ? 'cursor-pointer hover:bg-muted/50' : ''"
    @click="clickable && $emit('select')"
  >
    <div class="min-w-0 flex-1">
      <p class="truncate font-medium">{{ name }}</p>
      <p v-if="brand" class="truncate text-xs text-muted-foreground">{{ brand }}</p>
    </div>
    <div class="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
      <span class="font-semibold text-foreground">{{ caloriesPer100g }} kcal</span>
      <span v-if="proteinPer100g">P {{ proteinPer100g }}g</span>
      <span v-if="carbsPer100g">C {{ carbsPer100g }}g</span>
      <span v-if="fatPer100g">F {{ fatPer100g }}g</span>
    </div>
  </div>
</template>
