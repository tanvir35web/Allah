'use client'

import { Bookmark, BookmarkX, Play } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

/** How long a press must be held to open the menu. */
const LONG_PRESS_MS = 500
/** Moving further than this (a scroll) cancels the press. */
const MOVE_TOLERANCE_PX = 10

/** Where on screen (viewport coordinates) the menu was asked for. */
export interface MenuPoint {
  x: number
  y: number
}

/**
 * Long-press detection for ayahs. Returns pointer handlers to spread on an
 * ayah, plus `consumeClick()`, which reports (once) that a long press just
 * happened, so the click that follows it can be ignored.
 */
export function useLongPress(onLongPress: (ayah: number, point: MenuPoint) => void) {
  const timer = useRef<number | undefined>(undefined)
  const start = useRef<MenuPoint | null>(null)
  const fired = useRef(false)

  const cancel = () => {
    window.clearTimeout(timer.current)
    timer.current = undefined
    start.current = null
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const handlers = (ayah: number) => ({
    onPointerDown: (event: PointerEvent) => {
      if (event.button !== 0) return
      fired.current = false
      const point = { x: event.clientX, y: event.clientY }
      start.current = point
      timer.current = window.setTimeout(() => {
        fired.current = true
        navigator.vibrate?.(12)
        onLongPress(ayah, point)
        cancel()
      }, LONG_PRESS_MS)
    },
    onPointerMove: (event: PointerEvent) => {
      const origin = start.current
      if (!origin) return
      if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > MOVE_TOLERANCE_PX) cancel()
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    // Right-click on desktop, and the long-press menu on Android: open ours instead.
    onContextMenu: (event: MouseEvent) => {
      event.preventDefault()
      cancel()
      if (!fired.current) {
        fired.current = true
        onLongPress(ayah, { x: event.clientX, y: event.clientY })
      }
    },
  })

  /** True (once) if the click being handled ends a long press. */
  const consumeClick = () => {
    const was = fired.current
    fired.current = false
    return was
  }

  return { handlers, consumeClick }
}

interface AyahActionsProps {
  ayah: number | null
  /** Where the press happened; the menu opens next to it. */
  point: MenuPoint | null
  bookmarked: boolean
  canPlay: boolean
  onSave: () => void
  onRemove: () => void
  onPlay: () => void
  onClose: () => void
}

/** Keeps the menu this far from the screen edges. */
const EDGE = 12
/** Gap between the finger and the menu. */
const GAP = 14

/**
 * The long-press menu, opening right where the ayah was pressed: below the
 * finger, or above it when there is no room below, and kept on screen.
 * Rendered into <body> through a portal: an ancestor's transform (the page's
 * entry animation) would otherwise make `fixed` position relative to the page
 * instead of the screen.
 */
export function AyahActions({ ayah, point, bookmarked, canPlay, onSave, onRemove, onPlay, onClose }: AyahActionsProps) {
  const menu = useRef<HTMLDivElement>(null)
  const first = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)
  const open = ayah !== null && point !== null

  // Measure the menu, then place it beside the press point within the viewport.
  useLayoutEffect(() => {
    if (!open || !menu.current || !point) return
    const { width, height } = menu.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const left = Math.min(Math.max(point.x - width / 2, EDGE), viewportWidth - width - EDGE)
    const below = point.y + GAP
    const top =
      below + height <= viewportHeight - EDGE ? below : Math.max(point.y - GAP - height, EDGE)
    // Positioning needs the rendered size, so it can only be set after layout.
    setPosition({ left, top })
  }, [open, point])

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition(null)
      return
    }
    first.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    // The menu belongs to a spot on the page: scrolling or resizing closes it.
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onClose, { passive: true })
    window.addEventListener('resize', onClose)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onClose)
      window.removeEventListener('resize', onClose)
    }
  }, [open, onClose])

  if (!open) return null

  const action =
    'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition-colors'
  const run = (fn: () => void) => () => {
    fn()
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50" role="presentation">
      {/* Invisible backdrop: a tap anywhere else closes the menu. */}
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default" />
      <div
        ref={menu}
        role="dialog"
        aria-modal="true"
        aria-label={`Ayah ${ayah}`}
        style={position ?? { left: point.x, top: point.y }}
        className={cn(
          'absolute w-56 rounded-2xl border border-border/70 bg-card p-1.5 shadow-xl',
          // Hidden for the one frame before it is measured and placed.
          position ? 'animate-pop' : 'invisible',
        )}
      >
        <p className="px-3 pt-1.5 pb-1 text-[0.6875rem] font-bold tracking-wider text-muted-foreground uppercase">
          Ayah {ayah}
        </p>
        {bookmarked ? (
          <button ref={first} type="button" onClick={run(onRemove)} className={cn(action, 'text-danger hover:bg-danger-soft/40')}>
            <BookmarkX className="size-4 shrink-0" aria-hidden />
            Remove bookmark
          </button>
        ) : (
          <button ref={first} type="button" onClick={run(onSave)} className={cn(action, 'hover:bg-primary-soft')}>
            <Bookmark className="size-4 shrink-0 text-primary" aria-hidden />
            Save as last read
          </button>
        )}
        {canPlay ? (
          <button type="button" onClick={run(onPlay)} className={cn(action, 'hover:bg-muted')}>
            <Play className="size-4 shrink-0 text-primary" aria-hidden />
            Play from this ayah
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
