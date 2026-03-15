<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { toast } from 'vue-sonner'
import { Icon } from '@iconify/vue'
import type { MealType } from '@/types'
import { useFoodStore } from '@/stores/food'
import { useNumericField } from '@/composables/useNumericField'
import { todayISO } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const foodStore = useFoodStore()

const open = ref(false)
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

function onOpenChange(value: boolean) {
  open.value = value
  if (value) {
    date.value = todayISO()
    mealType.value = guessCurrentMeal()
    caloriesField.reset()
    name.value = ''
    nextTick(() => {
      const el = caloriesInputRef.value?.$el?.querySelector('input') ?? caloriesInputRef.value?.$el
      el?.focus()
    })
  }
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
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogTrigger as-child>
      <Button variant="outline">
        <Icon icon="lucide:zap" class="mr-2 h-4 w-4" />
        Quick Log
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Icon icon="lucide:zap" class="h-5 w-5 text-primary" />
          Quick Log
        </DialogTitle>
        <DialogDescription>Log calories without specifying a food item.</DialogDescription>
      </DialogHeader>
      <form class="grid gap-4 py-4" @submit.prevent="submit">
        <div class="grid grid-cols-2 gap-3">
          <div class="grid gap-2">
            <Label for="quick-date">Date</Label>
            <Input id="quick-date" v-model="date" type="date" />
          </div>
          <div class="grid gap-2">
            <Label for="quick-meal">Meal</Label>
            <Select v-model="mealType">
              <SelectTrigger id="quick-meal">
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
          <Label for="quick-calories">Calories (kcal)</Label>
          <Input
            id="quick-calories"
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
          <Label for="quick-name">Name (optional)</Label>
          <Input id="quick-name" v-model="name" placeholder="e.g. Lunch at restaurant" />
        </div>
        <DialogFooter>
          <Button type="submit" :disabled="!caloriesField.numericValue.value || !date || saving">
            <Icon v-if="saving" icon="lucide:loader-circle" class="mr-2 h-4 w-4 animate-spin" />
            Save
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
