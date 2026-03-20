<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Icon } from '@iconify/vue'
import type { MealType } from '@/types'
import { useFoodStore } from '@/stores/food'
import { useNumericField } from '@/composables/useNumericField'
import { useHaptics } from '@/composables/useHaptics'
import { todayISO } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import InlineActionCard from '@/components/dashboard/InlineActionCard.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const foodStore = useFoodStore()
const haptics = useHaptics()

const open = defineModel<boolean>('open', { default: false })

const saving = ref(false)
const date = ref(todayISO())
const mealType = ref<MealType>('snack')
const caloriesField = useNumericField({ min: 1, required: true, allowDecimals: false })
const name = ref('')
const caloriesInputRef = ref<InstanceType<typeof Input> | null>(null)

function guessCurrentMeal(): MealType {
  const hour = new Date().getHours()
  if (hour < 10) return 'breakfast'
  if (hour < 14) return 'lunch'
  if (hour < 17) return 'snack'
  return 'dinner'
}

function resetForm() {
  date.value = todayISO()
  mealType.value = guessCurrentMeal()
  caloriesField.reset()
  name.value = ''
}

const summary = computed(() => {
  const meal = mealType.value.charAt(0).toUpperCase() + mealType.value.slice(1)
  return name.value.trim() ? `${name.value.trim()} · ${meal}` : `Today · ${meal}`
})

const description = computed(() =>
  caloriesField.numericValue.value
    ? `${Math.round(caloriesField.numericValue.value)} kcal ready`
    : 'Quick calorie-only entry',
)

watch(open, async (isOpen) => {
  if (isOpen) {
    resetForm()
    await nextTick()
    const el = caloriesInputRef.value?.$el?.querySelector('input') ?? caloriesInputRef.value?.$el
    el?.focus()
    return
  }

  resetForm()
})

function startEditing() {
  open.value = true
}

function cancel() {
  open.value = false
}

async function submit() {
  if (!caloriesField.validate() || !date.value || saving.value) return

  saving.value = true
  try {
    await foodStore.quickLog(
      date.value,
      mealType.value,
      Math.round(caloriesField.numericValue.value!),
      name.value || undefined,
    )
    haptics.success()
    toast.success('Quick entry logged')
    open.value = false
  } catch {
    toast.error('Failed to save quick entry')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <InlineActionCard
    title="Quick Log"
    icon="lucide:zap"
    :editing="open"
    :summary="summary"
    :description="description"
    @edit="startEditing"
    @cancel="cancel"
  >
    <form class="grid gap-4 pt-1" @submit.prevent="submit">
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="grid gap-2">
          <Label for="inline-quick-date">Date</Label>
          <Input id="inline-quick-date" v-model="date" type="date" />
        </div>
        <div class="grid gap-2">
          <Label for="inline-quick-meal">Meal</Label>
          <Select v-model="mealType">
            <SelectTrigger id="inline-quick-meal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div class="grid gap-2">
        <Label for="inline-quick-calories">Calories (kcal)</Label>
        <Input
          id="inline-quick-calories"
          ref="caloriesInputRef"
          v-model="caloriesField.displayValue.value"
          type="text"
          inputmode="numeric"
          placeholder="e.g. 500"
          v-bind="caloriesField.inputAttrs.value"
          :class="{ 'animate-shake': caloriesField.shaking.value }"
        />
        <p v-if="caloriesField.error.value" class="text-xs text-destructive">
          {{ caloriesField.error.value }}
        </p>
      </div>
      <div class="grid gap-2">
        <Label for="inline-quick-name">Name (optional)</Label>
        <Input id="inline-quick-name" v-model="name" placeholder="e.g. Lunch at restaurant" />
      </div>
      <div class="flex items-center justify-end gap-2">
        <Button
          type="submit"
          size="sm"
          :disabled="!caloriesField.numericValue.value || !date || saving"
        >
          <Icon v-if="saving" icon="lucide:loader-circle" class="h-4 w-4 animate-spin" />
          <span>Save entry</span>
        </Button>
      </div>
    </form>
  </InlineActionCard>
</template>
