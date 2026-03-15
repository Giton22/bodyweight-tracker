<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Icon } from '@iconify/vue'
import type { FoodLogEntry, MealType } from '@/types'
import { useFoodStore } from '@/stores/food'
import { useNumericField } from '@/composables/useNumericField'
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
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  entry: FoodLogEntry | null
}>()

const foodStore = useFoodStore()

const mealType = ref<MealType>('lunch')
const amountField = useNumericField({ min: 1, max: 99999, required: true, allowDecimals: false })
const caloriesField = useNumericField({ min: 0, max: 99999, required: true, allowDecimals: false })
const saving = ref(false)
const deleting = ref(false)

watch(
  () => ({ isOpen: open.value, entry: props.entry }),
  ({ isOpen, entry }) => {
    if (!isOpen || !entry) return
    mealType.value = entry.mealType
    amountField.reset(entry.amountG)
    caloriesField.reset(entry.calories)
  },
  { immediate: true },
)

async function save() {
  if (!props.entry || saving.value) return
  if (!amountField.validate() || !caloriesField.validate()) return

  saving.value = true
  try {
    await foodStore.updateFoodLogEntry(props.entry.id, {
      mealType: mealType.value,
      amountG: Math.round(amountField.numericValue.value!),
      calories: Math.round(caloriesField.numericValue.value!),
    })
    open.value = false
  } catch {
    toast.error('Failed to update entry')
  } finally {
    saving.value = false
  }
}

async function deleteEntry() {
  if (!props.entry || deleting.value) return
  deleting.value = true
  try {
    await foodStore.deleteFoodLogEntry(props.entry.id)
    open.value = false
    toast.success('Entry deleted')
  } catch {
    toast.error('Failed to delete entry')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Food Entry</DialogTitle>
        <DialogDescription v-if="entry">
          {{ entry.foodName }} — {{ entry.date }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="entry" class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="edit-meal">Meal</Label>
          <Select v-model="mealType">
            <SelectTrigger id="edit-meal">
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

        <div class="grid gap-2">
          <Label for="edit-amount">Amount (g)</Label>
          <Input
            id="edit-amount"
            v-model="amountField.displayValue.value"
            type="text"
            inputmode="numeric"
            v-bind="amountField.inputAttrs.value"
            :class="{ 'animate-shake': amountField.shaking.value }"
          />
          <p v-if="amountField.error.value" class="text-xs text-destructive">
            {{ amountField.error.value }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="edit-calories">Calories (kcal)</Label>
          <Input
            id="edit-calories"
            v-model="caloriesField.displayValue.value"
            type="text"
            inputmode="numeric"
            v-bind="caloriesField.inputAttrs.value"
            :class="{ 'animate-shake': caloriesField.shaking.value }"
          />
          <p v-if="caloriesField.error.value" class="text-xs text-destructive">
            {{ caloriesField.error.value }}
          </p>
        </div>
      </div>

      <DialogFooter class="flex-col gap-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          :disabled="deleting"
          @click="deleteEntry"
        >
          <Icon v-if="deleting" icon="lucide:loader-circle" class="mr-2 h-4 w-4 animate-spin" />
          <Icon v-else icon="lucide:trash-2" class="mr-2 h-4 w-4" />
          Delete
        </Button>
        <div class="flex gap-2">
          <Button type="button" variant="outline" @click="open = false">Cancel</Button>
          <Button type="button" :disabled="saving" @click="save">
            <Icon v-if="saving" icon="lucide:loader-circle" class="mr-2 h-4 w-4 animate-spin" />
            Save
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
