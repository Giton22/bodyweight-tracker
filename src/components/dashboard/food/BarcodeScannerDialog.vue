<script setup lang="ts">
import { ref, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogDescription as DialogDescription,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
} from '@/components/ui/responsive-dialog'
import { DialogTrigger } from '@/components/ui/dialog'

defineProps<{
  hideTrigger?: boolean
}>()

const emit = defineEmits<{
  scanned: [code: string]
}>()

const open = defineModel<boolean>('open', { default: false })
const scannerRef = ref<HTMLDivElement | null>(null)
const errorMessage = ref('')
let scanner: InstanceType<typeof import('html5-qrcode').Html5Qrcode> | null = null

async function startScanner() {
  errorMessage.value = ''
  await nextTick()

  if (!scannerRef.value) return

  try {
    const { Html5Qrcode } = await import('html5-qrcode')
    scanner = new Html5Qrcode(scannerRef.value.id)

    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 150 } },
      (decodedText: string) => {
        void stopScanner()
        open.value = false
        emit('scanned', decodedText)
      },
      () => {
        // ignore scan failures (no barcode in frame)
      },
    )
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to access camera'
  }
}

async function stopScanner() {
  if (scanner) {
    try {
      await scanner.stop()
      scanner.clear()
    } catch {
      // ignore cleanup errors
    }
    scanner = null
  }
}

function onOpenChange(value: boolean) {
  open.value = value
  if (value) {
    void startScanner()
  } else {
    void stopScanner()
  }
}

onBeforeUnmount(() => {
  void stopScanner()
})
</script>

<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogTrigger v-if="!hideTrigger" as-child>
      <Button variant="outline" size="icon" title="Scan barcode">
        <Icon icon="lucide:scan-barcode" class="h-4 w-4" />
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[420px]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Icon icon="lucide:scan-barcode" class="h-5 w-5 text-primary" />
          Scan Barcode
        </DialogTitle>
        <DialogDescription> Point your camera at a food product barcode. </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <div
          id="barcode-scanner-region"
          ref="scannerRef"
          class="mx-auto aspect-video w-full overflow-hidden rounded-lg bg-muted"
        />
        <p v-if="errorMessage" class="mt-2 text-center text-sm text-destructive">
          {{ errorMessage }}
        </p>
      </div>
    </DialogContent>
  </Dialog>
</template>
