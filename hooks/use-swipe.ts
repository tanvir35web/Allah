'use client'

import { useRef, type TouchEvent } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  /** Minimum horizontal distance in px. */
  threshold?: number
}

/**
 * Lightweight horizontal swipe detection. Ignores mostly-vertical gestures
 * so normal scrolling is never hijacked.
 */
export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 60 }: SwipeHandlers) {
  const start = useRef<{ x: number; y: number; time: number } | null>(null)

  return {
    onTouchStart(event: TouchEvent) {
      const touch = event.touches[0]
      if (!touch || event.touches.length > 1) return
      start.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    },
    onTouchEnd(event: TouchEvent) {
      const origin = start.current
      start.current = null
      const touch = event.changedTouches[0]
      if (!origin || !touch) return
      const dx = touch.clientX - origin.x
      const dy = touch.clientY - origin.y
      const quick = Date.now() - origin.time < 600
      if (!quick || Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5) return
      if (dx < 0) onSwipeLeft?.()
      else onSwipeRight?.()
    },
  }
}
