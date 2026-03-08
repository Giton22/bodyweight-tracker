<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
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
const { isKg, convert } = useUnits()

function localDateISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const open = ref(false)
const date = ref(localDateISO())
const weight = ref<number | undefined>()
const note = ref('')
const weightInputRef = ref<InstanceType<typeof Input> | null>(null)

const existingEntry = computed(() =>
  store.sortedEntries.find(e => e.date === date.value),
)

const isUpdating = computed(() => !!existingEntry.value)

// Pre-fill when date changes to a date with an existing entry
watch(date, (newDate) => {
  const existing = store.sortedEntries.find(e => e.date === newDate)
  if (existing) {
    weight.value = Math.round(convert(existing.weightKg) * 10) / 10
    note.value = existing.note ?? ''
  }
})

// Auto-focus weight input when dialog opens
watch(open, (isOpen) => {
  if (isOpen) {
    date.value = localDateISO()
    // Pre-fill if today already has an entry
    const existing = store.sortedEntries.find(e => e.date === date.value)
    if (existing) {
      weight.value = Math.round(convert(existing.weightKg) * 10) / 10
      note.value = existing.note ?? ''
    }
    nextTick(() => {
      const el = weightInputRef.value?.$el?.querySelector('input') ?? weightInputRef.value?.$el
      el?.focus()
    })
  }
})

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
  date.value = localDateISO()
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
        <DialogDescription>{{ isUpdating ? 'Update an existing weight entry.' : 'Add a new weight entry.' }}</DialogDescription>
      </DialogHeader>
      <form class="grid gap-4 py-4" @submit.prevent="submit">
        <div class="grid gap-2">
          <Label for="date">Date</Label>
          <Input id="date" v-model="date" type="date" />
          <p v-if="isUpdating" class="text-xs text-amber-500">
            Updating existing entry
          </p>
        </div>
        <div class="grid gap-2">
          <Label for="weight">Weight ({{ isKg ? 'kg' : 'lbs' }})</Label>
          <Input
            id="weight"
            ref="weightInputRef"
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
          <Button type="submit" :disabled="!weight || !date">
            {{ isUpdating ? 'Update' : 'Save' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
