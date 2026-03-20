import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
}

export function usePullToRefresh(
  containerRef: Ref<HTMLElement | null>,
  options: UsePullToRefreshOptions,
) {
  const { onRefresh, threshold = 80 } = options

  const pullDistance = ref(0)
  const isRefreshing = ref(false)

  let startY = 0
  let isPulling = false

  function getScrollTop(): number {
    if (!containerRef.value) return 1
    // Check if the container itself scrolls, or fallback to window
    const el = containerRef.value
    if (el.scrollTop !== undefined && el.scrollHeight > el.clientHeight) {
      return el.scrollTop
    }
    return window.scrollY || document.documentElement.scrollTop
  }

  function onTouchStart(e: TouchEvent) {
    if (isRefreshing.value) return
    if (getScrollTop() > 0) return
    startY = e.touches[0]?.clientY ?? 0
    isPulling = true
  }

  function onTouchMove(e: TouchEvent) {
    if (!isPulling || isRefreshing.value) return
    if (getScrollTop() > 0) {
      isPulling = false
      pullDistance.value = 0
      return
    }

    const deltaY = (e.touches[0]?.clientY ?? 0) - startY
    if (deltaY < 0) {
      pullDistance.value = 0
      return
    }

    // Apply resistance — diminishing returns
    pullDistance.value = Math.min(deltaY * 0.4, threshold * 1.5)

    if (pullDistance.value > 10) {
      e.preventDefault()
    }
  }

  async function onTouchEnd() {
    if (!isPulling) return
    isPulling = false

    if (pullDistance.value >= threshold) {
      isRefreshing.value = true
      pullDistance.value = threshold * 0.5 // Hold at half height during refresh
      try {
        await onRefresh()
      } finally {
        isRefreshing.value = false
        pullDistance.value = 0
      }
    } else {
      pullDistance.value = 0
    }
  }

  onMounted(() => {
    const el = containerRef.value
    if (!el) return
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    const el = containerRef.value
    if (!el) return
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('touchend', onTouchEnd)
  })

  return {
    pullDistance,
    isRefreshing,
  }
}
