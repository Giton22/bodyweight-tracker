<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useWeightStore } from '@/stores/weight'
import { useUnits } from '@/composables/useUnits'
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
const { isKg } = useUnits()

const open = ref(false)
const date = ref(new Date().toISOString().split('T')[0]!)
const weight = ref<number | undefined>()
const note = ref('')

function submit() {
  if (!weight.value || !date.value) return

  const weightKg = isKg.value ? weight.value : weight.value / 2.20462

  store.addEntry({
    date: date.value,
    weightKg: Math.round(weightKg * 10) / 10,
    note: note.value || undefined,
  })

  // Reset
  weight.value = undefined
  note.value = ''
  date.value = new Date().toISOString().split('T')[0]!
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button>
        <Icon icon="lucide:plus" class="mr-2 h-4 w-4" />
        Log Weight
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Log Weight</DialogTitle>
        <DialogDescription>Add a new weight entry.</DialogDescription>
      </DialogHeader>
      <form class="grid gap-4 py-4" @submit.prevent="submit">
        <div class="grid gap-2">
          <Label for="date">Date</Label>
          <Input id="date" v-model="date" type="date" />
        </div>
        <div class="grid gap-2">
          <Label for="weight">Weight ({{ isKg ? 'kg' : 'lbs' }})</Label>
          <Input
            id="weight"
            v-model.number="weight"
            type="number"
            step="0.1"
            min="0"
            placeholder="Enter weight"
          />
        </div>
        <div class="grid gap-2">
          <Label for="note">Note (optional)</Label>
          <Input id="note" v-model="note" placeholder="e.g. After workout" />
        </div>
        <DialogFooter>
          <Button type="submit" :disabled="!weight || !date">Save</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
