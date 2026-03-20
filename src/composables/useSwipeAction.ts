import { ref, type Ref } from 'vue'

export interface UseSwipeActionOptions {
  threshold?: number
  maxSwipe?: number
}

export function useSwipeAction(options: UseSwipeActionOptions = {}) {
  const { threshold = 80, maxSwipe = 100 } = options

  const offsetX = ref(0)
  const isSwiping = ref(false)
  const direction: Ref<'left' | 'right' | null> = ref(null)

  let startX = 0
  let startY = 0
  let isTracking = false

  function onTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    if (!touch) return
    startX = touch.clientX
    startY = touch.clientY
    isTracking = false
    isSwiping.value = false
  }

  function onTouchMove(e: TouchEvent) {
    const touch = e.touches[0]
    if (!touch) return
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    // Determine if horizontal swipe (only on first significant move)
    if (!isTracking && !isSwiping.value) {
      if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
        isTracking = true
        isSwiping.value = true
      } else if (Math.abs(deltaY) > 10) {
        // Vertical scroll — bail out
        return
      } else {
        return
      }
    }

    if (!isTracking) return

    e.preventDefault()
    const clamped = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX))
    offsetX.value = clamped
    direction.value = clamped < 0 ? 'left' : clamped > 0 ? 'right' : null
  }

  function onTouchEnd(): { action: 'delete' | 'duplicate' | null } {
    isTracking = false
    isSwiping.value = false

    let action: 'delete' | 'duplicate' | null = null

    if (offsetX.value <= -threshold) {
      action = 'delete'
    } else if (offsetX.value >= threshold) {
      action = 'duplicate'
    }

    // Snap back
    offsetX.value = 0
    direction.value = null

    return { action }
  }

  function reset() {
    offsetX.value = 0
    direction.value = null
    isSwiping.value = false
    isTracking = false
  }

  return {
    offsetX,
    isSwiping,
    direction,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    reset,
  }
}
