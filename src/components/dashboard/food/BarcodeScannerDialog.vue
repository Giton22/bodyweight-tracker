<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { QrcodeStream, QrcodeCapture, QrcodeDropZone } from 'vue-qrcode-reader'
import type { DetectedBarcode } from 'vue-qrcode-reader'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import { useHaptics } from '@/composables/useHaptics'

defineProps<{
  hideTrigger?: boolean
}>()

const emit = defineEmits<{
  scanned: [code: string]
}>()

const open = defineModel<boolean>('open', { default: false })

const cameraReady = ref(false)
const cameraError = ref<Error | null>(null)
const paused = ref(false)
const torchActive = ref(false)
const torchSupported = ref(false)
const facingMode = ref<'environment' | 'user'>('environment')
const lastDetectedCode = ref<string | null>(null)
const isDraggingOver = ref(false)

const constraints = computed(() => ({ facingMode: facingMode.value }))

const haptics = useHaptics()

const BARCODE_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] as const

const ERROR_MESSAGES: Record<string, string> = {
  InsecureContextError: 'Camera requires HTTPS',
  StreamApiNotSupportedError: "Browser doesn't support camera",
  StreamLoadTimeoutError: 'Camera took too long to start',
  NotAllowedError: 'Camera permission denied',
  NotFoundError: 'No camera found',
  NotReadableError: 'Camera in use by another app',
}

function paintBoundingBox(codes: DetectedBarcode[], ctx: CanvasRenderingContext2D) {
  for (const code of codes) {
    const { boundingBox } = code
    ctx.lineWidth = 3
    ctx.strokeStyle = '#22c55e'
    ctx.strokeRect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.1)'
    ctx.fillRect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height)
  }
}

function onStreamDetect(detectedCodes: DetectedBarcode[]) {
  if (detectedCodes.length === 0) return
  const code = detectedCodes[0].rawValue
  if (!code) return

  paused.value = true
  lastDetectedCode.value = code
  haptics.success()

  setTimeout(() => {
    open.value = false
    emit('scanned', code)
  }, 800)
}

function onFileOrDropDetect(detectedCodes: DetectedBarcode[]) {
  if (detectedCodes.length === 0) return
  const code = detectedCodes[0].rawValue
  if (!code) return

  haptics.success()
  open.value = false
  emit('scanned', code)
}

function onCameraOn(capabilities: Partial<MediaTrackCapabilities>) {
  cameraReady.value = true
  cameraError.value = null
  torchSupported.value = 'torch' in capabilities
}

function onCameraOff() {
  cameraReady.value = false
}

function onError(error: Error) {
  cameraError.value = error
  cameraReady.value = false
}

function getFriendlyError(error: Error): string {
  return ERROR_MESSAGES[error.constructor.name] ?? ERROR_MESSAGES[error.name] ?? error.message
}

function toggleTorch() {
  torchActive.value = !torchActive.value
}

function switchCamera() {
  facingMode.value = facingMode.value === 'environment' ? 'user' : 'environment'
}

function retryCamera() {
  cameraError.value = null
  // Toggle facingMode to force QrcodeStream to re-init
  const current = facingMode.value
  facingMode.value = current === 'environment' ? 'user' : 'environment'
  setTimeout(() => {
    facingMode.value = current
  }, 50)
}

function close() {
  open.value = false
}

function resetState() {
  cameraReady.value = false
  cameraError.value = null
  paused.value = false
  torchActive.value = false
  torchSupported.value = false
  lastDetectedCode.value = null
  isDraggingOver.value = false
  facingMode.value = 'environment'
}

// Body scroll lock
let savedOverflow = ''

watch(open, (isOpen) => {
  if (isOpen) {
    savedOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = savedOverflow
    resetState()
  }
})

onBeforeUnmount(() => {
  if (open.value) {
    document.body.style.overflow = savedOverflow
  }
})
</script>

<template>
  <Button
    v-if="!hideTrigger"
    variant="outline"
    size="icon"
    title="Scan barcode"
    @click="open = true"
  >
    <Icon icon="lucide:scan-barcode" class="h-4 w-4" />
  </Button>

  <Teleport to="body">
    <Transition name="scanner">
      <div v-if="open" class="fixed inset-0 z-[100] flex flex-col bg-black">
        <!-- LAYER 1: Camera stream or error state -->
        <div class="relative flex-1 overflow-hidden">
          <template v-if="!cameraError">
            <QrcodeStream
              :formats="[...BARCODE_FORMATS]"
              :constraints="constraints"
              :paused="paused"
              :torch="torchActive"
              :track="paintBoundingBox"
              class="h-full w-full object-cover"
              @detect="onStreamDetect"
              @camera-on="onCameraOn"
              @camera-off="onCameraOff"
              @error="onError"
            >
              <!-- Loading spinner (before camera ready) -->
              <div
                v-if="!cameraReady"
                class="absolute inset-0 flex items-center justify-center bg-black"
              >
                <Icon icon="lucide:loader-circle" class="h-12 w-12 animate-spin text-white/60" />
              </div>

              <!-- Scanning guide crosshair -->
              <div
                v-if="cameraReady && !lastDetectedCode"
                class="absolute inset-0 flex items-center justify-center"
              >
                <div class="relative h-56 w-56">
                  <!-- Corner brackets -->
                  <div
                    class="absolute left-0 top-0 h-8 w-8 border-l-[3px] border-t-[3px] rounded-tl border-white/80"
                  />
                  <div
                    class="absolute right-0 top-0 h-8 w-8 border-r-[3px] border-t-[3px] rounded-tr border-white/80"
                  />
                  <div
                    class="absolute bottom-0 left-0 h-8 w-8 border-b-[3px] border-l-[3px] rounded-bl border-white/80"
                  />
                  <div
                    class="absolute bottom-0 right-0 h-8 w-8 border-b-[3px] border-r-[3px] rounded-br border-white/80"
                  />
                  <!-- Animated scan line -->
                  <div class="scanner-line absolute left-2 right-2 h-0.5 bg-green-500/80" />
                </div>
              </div>

              <!-- Detection confirmation banner -->
              <div
                v-if="lastDetectedCode"
                class="absolute inset-0 flex items-center justify-center bg-black/40"
              >
                <div
                  class="flex flex-col items-center gap-3 rounded-2xl bg-black/70 px-8 py-6 backdrop-blur-sm"
                >
                  <div class="flex h-14 w-14 items-center justify-center rounded-full bg-green-500">
                    <Icon icon="lucide:check" class="h-8 w-8 text-white" />
                  </div>
                  <span class="font-mono text-lg font-semibold text-white">
                    {{ lastDetectedCode }}
                  </span>
                </div>
              </div>
            </QrcodeStream>
          </template>

          <!-- LAYER 4: Error state (replaces camera view) -->
          <div
            v-else
            class="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black px-8"
          >
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
              <Icon icon="lucide:camera-off" class="h-10 w-10 text-destructive" />
            </div>
            <p class="text-center text-lg font-medium text-white">
              {{ getFriendlyError(cameraError) }}
            </p>
            <div class="flex flex-col items-center gap-3">
              <Button variant="outline" class="gap-2" @click="retryCamera">
                <Icon icon="lucide:refresh-cw" class="h-4 w-4" />
                Retry Camera
              </Button>
              <p class="text-sm text-white/50">Or upload an image below</p>
            </div>

            <!-- File upload fallback -->
            <label
              class="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-white transition-colors hover:bg-white/20"
            >
              <Icon icon="lucide:upload" class="h-5 w-5" />
              <span class="text-sm font-medium">Choose Image</span>
              <QrcodeCapture
                :formats="[...BARCODE_FORMATS]"
                class="hidden"
                @detect="onFileOrDropDetect"
              />
            </label>

            <!-- Desktop drop zone fallback -->
            <QrcodeDropZone
              :formats="[...BARCODE_FORMATS]"
              class="mt-2 hidden w-full max-w-sm rounded-lg border-2 border-dashed border-white/20 p-6 text-center transition-colors lg:block"
              :class="{ 'border-green-500 bg-green-500/10': isDraggingOver }"
              @detect="onFileOrDropDetect"
              @dragover="(v: boolean) => (isDraggingOver = v)"
              @error="onError"
            >
              <div class="flex flex-col items-center gap-2 text-white/50">
                <Icon icon="lucide:image-plus" class="h-8 w-8" />
                <span class="text-sm">Drop barcode image here</span>
              </div>
            </QrcodeDropZone>
          </div>
        </div>

        <!-- LAYER 2: Top toolbar -->
        <div
          class="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)]"
          style="padding-top: max(env(safe-area-inset-top, 0px), 12px)"
        >
          <Button
            variant="ghost"
            size="icon"
            class="h-11 w-11 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white"
            @click="close"
          >
            <Icon icon="lucide:x" class="h-6 w-6" />
          </Button>

          <div class="flex gap-2">
            <Button
              v-if="torchSupported && !cameraError"
              variant="ghost"
              size="icon"
              class="h-11 w-11 rounded-full backdrop-blur-sm"
              :class="
                torchActive
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400 hover:text-black'
                  : 'bg-black/40 text-white hover:bg-black/60 hover:text-white'
              "
              @click="toggleTorch"
            >
              <Icon :icon="torchActive ? 'lucide:zap' : 'lucide:zap-off'" class="h-5 w-5" />
            </Button>
            <Button
              v-if="!cameraError"
              variant="ghost"
              size="icon"
              class="h-11 w-11 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white"
              @click="switchCamera"
            >
              <Icon icon="lucide:switch-camera" class="h-5 w-5" />
            </Button>
          </div>
        </div>

        <!-- LAYER 3: Bottom toolbar -->
        <div
          v-if="!cameraError"
          class="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 px-4 pb-[env(safe-area-inset-bottom,12px)]"
          style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 12px)"
        >
          <!-- File upload button -->
          <label
            class="flex cursor-pointer items-center gap-2 rounded-full bg-black/40 px-5 py-3 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <Icon icon="lucide:image-plus" class="h-5 w-5" />
            <span class="text-sm font-medium">Upload</span>
            <QrcodeCapture
              :formats="[...BARCODE_FORMATS]"
              class="hidden"
              @detect="onFileOrDropDetect"
            />
          </label>

          <!-- Desktop drop zone -->
          <QrcodeDropZone
            :formats="[...BARCODE_FORMATS]"
            class="hidden rounded-full border-2 border-dashed border-white/30 px-5 py-3 transition-colors lg:block"
            :class="{ 'border-green-500 bg-green-500/10': isDraggingOver }"
            @detect="onFileOrDropDetect"
            @dragover="(v: boolean) => (isDraggingOver = v)"
            @error="onError"
          >
            <div class="flex items-center gap-2 text-white/60">
              <Icon icon="lucide:upload" class="h-5 w-5" />
              <span class="text-sm">Drop image</span>
            </div>
          </QrcodeDropZone>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.scanner-enter-active,
.scanner-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.scanner-enter-from,
.scanner-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

@keyframes scan-line {
  0% {
    top: 10%;
  }
  50% {
    top: 90%;
  }
  100% {
    top: 10%;
  }
}

.scanner-line {
  animation: scan-line 2.5s ease-in-out infinite;
}
</style>
