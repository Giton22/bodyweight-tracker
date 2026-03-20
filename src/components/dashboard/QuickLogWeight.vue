<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { toast } from 'vue-sonner'
import { Icon } from '@iconify/vue'
import { useWeightStore } from '@/stores/weight'
import { useUnits } from '@/composables/useUnits'
import { useNumericField } from '@/composables/useNumericField'
import { todayISO } from '@/lib/date'
import { useToday } from '@/composables/useToday'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import InlineActionCard from '@/components/dashboard/InlineActionCard.vue'

const store = useWeightStore()
const { convert, isKg, format, toKg } = useUnits()
const todayRef = useToday()

const todayEntry = computed(() => store.sortedEntries.find((e) => e.date === todayRef.value))

const editing = ref(false)
const saving = ref(false)
const weightField = useNumericField({ min: 1, required: true })
const inputRef = ref<InstanceType<typeof Input> | null>(null)

const summary = computed(() => (todayEntry.value ? format(todayEntry.value.weightKg) : 'No entry'))
const description = computed(() =>
  todayEntry.value ? 'Tap edit to update today' : 'Log today without leaving the dashboard',
)

function startEditing() {
  weightField.reset(todayEntry.value ? convert(todayEntry.value.weightKg) : undefined)
  editing.value = true
  nextTick(() => {
    const el = inputRef.value?.$el?.querySelector('input') ?? inputRef.value?.$el
    el?.focus()
  })
}

async function save() {
  if (!weightField.validate() || saving.value) return

  saving.value = true
  try {
    await store.addEntry({
      date: todayISO(),
      weightKg: toKg(weightField.numericValue.value!),
    })

    editing.value = false
    weightField.reset()
  } catch {
    toast.error('Failed to save weight entry')
  } finally {
    saving.value = false
  }
}

function cancel() {
  editing.value = false
  weightField.reset()
}
</script>

<template>
  <InlineActionCard
    title="Today's Weight"
    icon="lucide:scale"
    :editing="editing"
    :summary="summary"
    :description="description"
    class="bg-primary/5 border-primary/20"
    @edit="startEditing"
    @cancel="cancel"
  >
    <form class="flex flex-col gap-2 pt-1" @submit.prevent="save">
      <div class="flex items-center gap-2">
        <Input
          ref="inputRef"
          v-model="weightField.displayValue.value"
          type="text"
          inputmode="decimal"
          :placeholder="isKg ? 'kg' : 'lbs'"
          class="h-8 w-28"
          v-bind="weightField.inputAttrs.value"
          :class="{ 'animate-shake': weightField.shaking.value }"
        />
        <Button
          type="submit"
          size="sm"
          class="h-8"
          :disabled="!weightField.numericValue.value || saving"
        >
          <Icon
            :icon="saving ? 'lucide:loader-circle' : 'lucide:check'"
            class="h-4 w-4"
            :class="saving && 'animate-spin'"
          />
          <span>{{ todayEntry ? 'Update' : 'Save' }}</span>
        </Button>
      </div>
      <p v-if="weightField.error.value" class="text-xs text-destructive">
        {{ weightField.error.value }}
      </p>
    </form>
  </InlineActionCard>
</template>
