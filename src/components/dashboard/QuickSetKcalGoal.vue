<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Icon } from '@iconify/vue'
import { useWeightStore } from '@/stores/weight'
import { useNumericField } from '@/composables/useNumericField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import InlineActionCard from '@/components/dashboard/InlineActionCard.vue'

const store = useWeightStore()

const open = defineModel<boolean>('open', { default: false })

const goalField = useNumericField({ min: 1, required: true, allowDecimals: false })
const saving = ref(false)
const inputRef = ref<InstanceType<typeof Input> | null>(null)

const summary = computed(() =>
  store.currentGlobalKcalGoal !== null ? `${store.currentGlobalKcalGoal} kcal` : 'No goal set',
)

const description = computed(() =>
  store.currentGlobalKcalGoal !== null ? 'Applies from today forward' : 'Set your daily default',
)

watch(open, async (isOpen) => {
  if (isOpen) {
    goalField.reset(store.currentGlobalKcalGoal ?? undefined)
    await nextTick()
    const el = inputRef.value?.$el?.querySelector('input') ?? inputRef.value?.$el
    el?.focus()
    return
  }

  goalField.reset()
})

function startEditing() {
  open.value = true
}

function cancel() {
  open.value = false
}

async function submit() {
  if (!goalField.validate() || saving.value) return

  saving.value = true
  try {
    await store.setGlobalKcalGoal(Math.round(goalField.numericValue.value!))
    open.value = false
  } catch {
    toast.error('Failed to set calorie goal')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <InlineActionCard
    title="Daily Kcal Goal"
    icon="lucide:target"
    :editing="open"
    :summary="summary"
    :description="description"
    @edit="startEditing"
    @cancel="cancel"
  >
    <form class="grid gap-3 pt-1" @submit.prevent="submit">
      <div class="grid gap-2">
        <Label for="quick-kcal-goal">Goal</Label>
        <Input
          id="quick-kcal-goal"
          ref="inputRef"
          v-model="goalField.displayValue.value"
          type="text"
          inputmode="numeric"
          placeholder="e.g. 2000"
          v-bind="goalField.inputAttrs.value"
          :class="{ 'animate-shake': goalField.shaking.value }"
        />
        <p v-if="goalField.error.value" class="text-xs text-destructive">
          {{ goalField.error.value }}
        </p>
      </div>
      <div class="flex items-center justify-end gap-2">
        <Button type="submit" size="sm" :disabled="!goalField.numericValue.value || saving">
          <Icon v-if="saving" icon="lucide:loader-circle" class="h-4 w-4 animate-spin" />
          <span>{{ store.currentGlobalKcalGoal !== null ? 'Update goal' : 'Save goal' }}</span>
        </Button>
      </div>
    </form>
  </InlineActionCard>
</template>
