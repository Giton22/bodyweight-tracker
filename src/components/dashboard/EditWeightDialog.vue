<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Icon } from '@iconify/vue'
import type { WeightEntry } from '@/types'
import { useWeightStore } from '@/stores/weight'
import { useUnits } from '@/composables/useUnits'
import { formatDateLong } from '@/lib/date'
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

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  entry: WeightEntry | null
}>()

const store = useWeightStore()
const { isKg, convert, toKg } = useUnits()

const weightValue = ref<number | undefined>()
const noteValue = ref('')
const saving = ref(false)
const weightInputRef = ref<InstanceType<typeof Input> | null>(null)

watch(
  () => ({ isOpen: open.value, entry: props.entry }),
  ({ isOpen, entry }) => {
    if (!isOpen || !entry) return
    weightValue.value = Math.round(convert(entry.weightKg) * 10) / 10
    noteValue.value = entry.note ?? ''
  },
  { immediate: true },
)

function closeDialog() {
  open.value = false
}

async function save() {
  if (!props.entry || !weightValue.value || saving.value) return

  saving.value = true
  try {
    await store.updateEntry(props.entry.id, {
      weightKg: toKg(weightValue.value),
      note: noteValue.value || undefined,
    })

    closeDialog()
  } catch {
    toast.error('Failed to update weight entry')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Weight Entry</DialogTitle>
        <DialogDescription v-if="entry">
          Update weight for {{ formatDateLong(entry.date) }}.
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
          <Button type="submit" :disabled="!weightValue || saving">
            <Icon v-if="saving" icon="lucide:loader-circle" class="mr-2 h-4 w-4 animate-spin" />
            Save
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
