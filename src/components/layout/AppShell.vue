<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import TopBar from './TopBar.vue'
import BottomNav from './BottomNav.vue'
import FloatingActionButton from './FloatingActionButton.vue'
import LogFoodDialog from '@/components/dashboard/food/LogFoodDialog.vue'
import BarcodeScannerDialog from '@/components/dashboard/food/BarcodeScannerDialog.vue'
import LogWeightDialog from '@/components/dashboard/LogWeightDialog.vue'

const route = useRoute()

const fabRoutes = new Set(['dashboard', 'weight', 'nutrition'])
const showFab = computed(() => fabRoutes.has(route.name as string))

const logFoodOpen = ref(false)
const barcodeOpen = ref(false)
const logWeightOpen = ref(false)
const scannedBarcode = ref<string | undefined>()

function onScanBarcode() {
  barcodeOpen.value = true
}

function onBarcodeScanned(code: string) {
  barcodeOpen.value = false
  scannedBarcode.value = code
  logFoodOpen.value = true
}

function onLogFoodClosed(open: boolean) {
  logFoodOpen.value = open
  if (!open) scannedBarcode.value = undefined
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <AppSidebar />
    <div class="lg:ml-64">
      <TopBar />
      <main class="relative overflow-x-hidden pb-20 pt-safe lg:pb-0 lg:pt-0">
        <slot />
      </main>
    </div>
    <BottomNav />

    <FloatingActionButton
      v-if="showFab"
      @log-food="logFoodOpen = true"
      @scan-barcode="onScanBarcode"
      @log-weight="logWeightOpen = true"
    />

    <!-- FAB-triggered dialogs -->
    <LogFoodDialog
      :open="logFoodOpen"
      hide-trigger
      :initial-barcode="scannedBarcode"
      @update:open="onLogFoodClosed"
    />
    <BarcodeScannerDialog v-model:open="barcodeOpen" hide-trigger @scanned="onBarcodeScanned" />
    <LogWeightDialog v-model:open="logWeightOpen" hide-trigger />
  </div>
</template>
