<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { useWeightStore } from '@/stores/weight'
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

const store = useWeightStore()

function localDateISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const open = ref(false)
const date = ref(localDateISO())
const calories = ref<number | undefined>()
const note = ref('')
const caloriesInputRef = ref<InstanceType<typeof Input> | null>(null)

async function submit() {
  if (!calories.value || !date.value) return

  await store.saveDailyCalories({
    date: date.value,
    calories: Math.round(calories.value),
    goalOverrideKcal: null,
    note: note.value || undefined,
  })

  // Reset
  calories.value = undefined
  note.value = ''
  date.value = localDateISO()
  open.value = false
}

function onOpenChange(value: boolean) {
  if (value) {
    date.value = localDateISO()
    nextTick(() => {
      const el = caloriesInputRef.value?.$el?.querySelector('input') ?? caloriesInputRef.value?.$el
      el?.focus()
    })
  }
  open.value = value
}
</script>

<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogTrigger as-child>
      <Button>
        <Icon icon="lucide:plus" class="mr-2 h-4 w-4" />
        Log Calories
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Log Calories</DialogTitle>
        <DialogDescription>Add calories consumed for a day.</DialogDescription>
      </DialogHeader>
      <form class="grid gap-4 py-4" @submit.prevent="submit">
        <div class="grid gap-2">
          <Label for="cal-date">Date</Label>
          <Input id="cal-date" v-model="date" type="date" />
        </div>
        <div class="grid gap-2">
          <Label for="cal-calories">Consumed kcal</Label>
          <Input
            id="cal-calories"
            ref="caloriesInputRef"
            v-model.number="calories"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 2000"
          />
        </div>
        <div class="grid gap-2">
          <Label for="cal-note">Note (optional)</Label>
          <Input id="cal-note" v-model="note" placeholder="e.g. Cheat day" />
        </div>
        <DialogFooter>
          <Button type="submit" :disabled="!calories || !date">Save</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
