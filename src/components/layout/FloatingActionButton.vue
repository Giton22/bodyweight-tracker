<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useHaptics } from '@/composables/useHaptics'

const emit = defineEmits<{
  logFood: []
  scanBarcode: []
  logWeight: []
}>()

const haptics = useHaptics()
const expanded = ref(false)

const actions = [
  { key: 'logWeight', label: 'Log Weight', icon: 'lucide:scale', event: 'logWeight' as const },
  {
    key: 'scanBarcode',
    label: 'Scan Barcode',
    icon: 'lucide:scan-barcode',
    event: 'scanBarcode' as const,
  },
  { key: 'logFood', label: 'Log Food', icon: 'lucide:utensils', event: 'logFood' as const },
]

function toggle() {
  expanded.value = !expanded.value
  haptics.light()
}

function close() {
  expanded.value = false
}

function handleAction(event: 'logFood' | 'scanBarcode' | 'logWeight') {
  haptics.success()
  close()
  emit(event)
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fab-backdrop">
      <div v-if="expanded" class="fixed inset-0 z-40 bg-black/40 lg:hidden" @click="close" />
    </Transition>

    <!-- FAB container -->
    <div class="fixed bottom-24 right-4 z-40 flex flex-col-reverse items-end gap-3 lg:hidden">
      <!-- Action buttons -->
      <template v-for="(action, index) in actions" :key="action.key">
        <Transition name="fab-action">
          <button
            v-if="expanded"
            class="flex items-center gap-2"
            :style="{ transitionDelay: `${index * 50}ms` }"
            @click="handleAction(action.event)"
          >
            <span class="rounded-full bg-background px-3 py-1.5 text-sm font-medium shadow-warm">
              {{ action.label }}
            </span>
            <div class="flex size-12 items-center justify-center rounded-full bg-primary shadow-lg">
              <Icon :icon="action.icon" class="size-5 text-primary-foreground" />
            </div>
          </button>
        </Transition>
      </template>

      <!-- Main FAB -->
      <button
        class="flex size-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform active:scale-95"
        @click="toggle"
      >
        <Icon
          icon="lucide:plus"
          class="size-6 text-primary-foreground transition-transform duration-200"
          :class="{ 'rotate-45': expanded }"
        />
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.fab-backdrop-enter-active,
.fab-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.fab-backdrop-enter-from,
.fab-backdrop-leave-to {
  opacity: 0;
}

.fab-action-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fab-action-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.fab-action-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}
.fab-action-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}
</style>
