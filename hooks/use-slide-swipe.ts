'use client'

import { useRef, type RefObject, type TouchEvent } from 'react'
import { flushSync } from 'react-dom'

interface SlideSwipeOptions {
  onNext: () => void
  onPrevious: () => void
  /** False at the first item: dragging right then only stretches and springs back. */
  canGoBack: () => boolean
  /** Space between the element and its neighbours, in px. */
  gap?: number
}

interface Gesture {
  startX: number
  startY: number
  axis?: 'x' | 'y'
  dx: number
  lastX: number
  lastTime: number
  /** px per ms, positive to the right. */
  velocity: number
}

const SLIDE_MS = 300
const SETTLE = 'cubic-bezier(0.2, 0.7, 0.2, 1)'
/** Distance (share of the width) or flick speed (px/ms) that commits a swipe. */
const COMMIT_DISTANCE = 0.3
const COMMIT_VELOCITY = 0.5

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const at = (x: number) => ({ transform: `translateX(${x}px)` })

/**
 * Swipe a carousel track whose previous and next items are already rendered
 * either side of it: the track follows the finger, then either slides a
 * neighbour into place or springs back. Mostly-vertical gestures are left
 * alone so the page still scrolls (pair with `touch-pan-y`). `slideNext`
 * runs the same animation for a button.
 */
export function useSlideSwipe(
  ref: RefObject<HTMLElement | null>,
  { onNext, onPrevious, canGoBack, gap = 0 }: SlideSwipeOptions,
) {
  const gesture = useRef<Gesture | null>(null)
  const busy = useRef(false)

  async function slide(next: boolean, from = 0) {
    const el = ref.current
    const change = next ? onNext : onPrevious
    if (!el || reducedMotion()) {
      if (el) el.style.transform = ''
      change()
      return
    }
    busy.current = true
    el.style.transform = ''
    try {
      // Held at the end so the neighbour stays centred until the content swap
      // re-renders it as the current item; then the track resets unseen.
      const animation = el.animate([at(from), at((next ? -1 : 1) * (el.offsetWidth + gap))], {
        duration: SLIDE_MS,
        easing: SETTLE,
        fill: 'forwards',
      })
      await animation.finished
      flushSync(change)
      animation.cancel()
    } catch {
      // Cancelled, e.g. the card unmounted mid-animation.
    } finally {
      busy.current = false
    }
  }

  function springBack(from: number) {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
    if (from !== 0 && !reducedMotion()) el.animate([at(from), at(0)], { duration: SLIDE_MS, easing: SETTLE })
  }

  return {
    slideNext() {
      if (!busy.current) void slide(true)
    },
    handlers: {
      onTouchStart(event: TouchEvent) {
        const touch = event.touches[0]
        if (busy.current || !touch || event.touches.length > 1) return
        gesture.current = {
          startX: touch.clientX,
          startY: touch.clientY,
          dx: 0,
          lastX: touch.clientX,
          lastTime: event.timeStamp,
          velocity: 0,
        }
      },
      onTouchMove(event: TouchEvent) {
        const g = gesture.current
        const touch = event.touches[0]
        if (!g || !touch) return
        let dx = touch.clientX - g.startX
        const dy = touch.clientY - g.startY
        if (!g.axis) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
          g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        }
        if (g.axis !== 'x') return
        if (dx > 0 && !canGoBack()) dx /= 3
        const elapsed = event.timeStamp - g.lastTime
        if (elapsed > 0) g.velocity = (touch.clientX - g.lastX) / elapsed
        g.lastX = touch.clientX
        g.lastTime = event.timeStamp
        g.dx = dx
        if (ref.current) ref.current.style.transform = `translateX(${dx}px)`
      },
      onTouchEnd() {
        const g = gesture.current
        gesture.current = null
        if (!g || g.axis !== 'x') return
        const width = ref.current?.offsetWidth ?? 1
        const far = Math.abs(g.dx) > width * COMMIT_DISTANCE
        if (g.dx < 0 && (far || g.velocity < -COMMIT_VELOCITY)) void slide(true, g.dx)
        else if (g.dx > 0 && canGoBack() && (far || g.velocity > COMMIT_VELOCITY)) void slide(false, g.dx)
        else springBack(g.dx)
      },
      onTouchCancel() {
        const g = gesture.current
        gesture.current = null
        if (g?.axis === 'x') springBack(g.dx)
      },
    },
  }
}
