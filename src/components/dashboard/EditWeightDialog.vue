<script setup lang="ts">
import { ref, watch } from 'vue'
import type { WeightEntry } from '@/types'
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
} from '@/components/ui/dialog'

const props = defineProps<{
  open: boolean
  entry: WeightEntry | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const store = useWeightStore()
const { isKg, convert } = useUnits()

const weightValue = ref<number | undefined>()
const noteValue = ref('')
const weightInputRef = ref<InstanceType<typeof Input> | null>(null)

watch(
  () => ({ isOpen: props.open, entry: props.entry }),
  ({ isOpen, entry }) => {
    if (!isOpen || !entry) return
    weightValue.value = Math.round(convert(entry.weightKg) * 10) / 10
    noteValue.value = entry.note ?? ''
  },
  { immediate: true },
)

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function closeDialog() {
  emit('update:open', false)
}

async function save() {
  if (!props.entry || !weightValue.value) return

  const weightKg = isKg.value ? weightValue.value : weightValue.value / 2.20462

  await store.updateEntry(props.entry.id, {
    weightKg: Math.round(weightKg * 10) / 10,
    note: noteValue.value || undefined,
  })

  closeDialog()
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Weight Entry</DialogTitle>
        <DialogDescription v-if="entry">
          Update weight for {{ formatDate(entry.date) }}.
        </DialogDescription>
      </DialogHeader>

      <form v-if="entry" class="grid gap-4 py-4" @submit.prevent="save">
        <div class="grid gap-2">
          <Label for="edit-weight">Weight ({{ isKg ? 'kg' : 'lbs' }})</Label>
          <Input
            id="edit-weight"
            ref="weightInputRef"
            v-model.number="weightValue"
            type="number"
            step="0.1"
            min="0"
            placeholder="Enter weight"
          />
        </div>
        <div class="grid gap-2">
          <Label for="edit-note">Note (optional)</Label>
          <Input id="edit-note" v-model="noteValue" placeholder="e.g. After workout" />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="closeDialog">Cancel</Button>
          <Button type="submit" :disabled="!weightValue">Save</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
