import { ref, computed, watch } from 'vue'
import { useWeightStore } from '@/stores/weight'
import {
  DEFAULT_DASHBOARD_LAYOUT,
  mergeLayout,
  type DashboardWidgetConfig,
} from '@/lib/dashboard-widgets'

export function useDashboardLayout() {
  const weightStore = useWeightStore()
  const isEditMode = ref(false)

  const layout = ref<DashboardWidgetConfig[]>(mergeLayout(weightStore.settings.dashboardLayout))

  // Sync layout when settings load from PocketBase
  watch(
    () => weightStore.settings.dashboardLayout,
    (saved) => {
      if (!isEditMode.value) {
        layout.value = mergeLayout(saved)
      }
    },
  )

  const visibleWidgets = computed(() => layout.value.filter((w) => w.visible))

  function toggleVisibility(id: string) {
    const widget = layout.value.find((w) => w.id === id)
    if (widget) {
      widget.visible = !widget.visible
    }
  }

  function resetLayout() {
    layout.value = DEFAULT_DASHBOARD_LAYOUT.map((d) => ({ ...d }))
    void saveLayout()
  }

  async function saveLayout() {
    const serialized = layout.value.map(({ id, visible }) => ({ id, visible }))
    await weightStore.persistSettings({ dashboardLayout: serialized })
  }

  function enterEditMode() {
    isEditMode.value = true
  }

  function exitEditMode() {
    isEditMode.value = false
    void saveLayout()
  }

  return {
    layout,
    isEditMode,
    visibleWidgets,
    toggleVisibility,
    resetLayout,
    saveLayout,
    enterEditMode,
    exitEditMode,
  }
}
