'use client'

import { Bookmark, BookmarkX, Play } from 'lucide-react'
import { useEffect, useRef, type MouseEvent, type PointerEvent } from 'react'
import { cn } from '@/lib/utils'

/** How long a press must be held to open the menu. */
const LONG_PRESS_MS = 500
/** Moving further than this (a scroll) cancels the press. */
const MOVE_TOLERANCE_PX = 10

/**
 * Long-press detection for ayahs. Returns pointer handlers to spread on an
 * ayah, plus `consumeClick()`, which reports (once) that a long press just
 * happened, so the click that follows it can be ignored.
 */
export function useLongPress(onLongPress: (ayah: number) => void) {
  const timer = useRef<number | undefined>(undefined)
  const start = useRef<{ x: number; y: number } | null>(null)
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
      start.current = { x: event.clientX, y: event.clientY }
      timer.current = window.setTimeout(() => {
        fired.current = true
        navigator.vibrate?.(12)
        onLongPress(ayah)
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
        onLongPress(ayah)
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
  bookmarked: boolean
  canPlay: boolean
  onSave: () => void
  onRemove: () => void
  onPlay: () => void
  onClose: () => void
}

/** The long-press menu: a bottom sheet on phones, a small centred card on wider screens. */
export function AyahActions({ ayah, bookmarked, canPlay, onSave, onRemove, onPlay, onClose }: AyahActionsProps) {
  const first = useRef<HTMLButtonElement>(null)
  const open = ayah !== null

  useEffect(() => {
    if (!open) return
    first.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const action =
    'flex min-h-13 w-full items-center gap-3 rounded-2xl px-4 text-left text-[0.9375rem] font-semibold transition-colors'
  const run = (fn: () => void) => () => {
    fn()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="animate-fade absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Ayah ${ayah}`}
        className="animate-rise relative m-3 w-full max-w-sm rounded-3xl border border-border/70 bg-card p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-xl sm:pb-2"
      >
        <p className="px-4 pt-2 pb-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">Ayah {ayah}</p>
        {bookmarked ? (
          <button ref={first} type="button" onClick={run(onRemove)} className={cn(action, 'text-danger hover:bg-danger-soft/40')}>
            <BookmarkX className="size-5 shrink-0" aria-hidden />
            Remove bookmark
          </button>
        ) : (
          <button ref={first} type="button" onClick={run(onSave)} className={cn(action, 'hover:bg-primary-soft')}>
            <Bookmark className="size-5 shrink-0 text-primary" aria-hidden />
            Save as last read
          </button>
        )}
        {canPlay ? (
          <button type="button" onClick={run(onPlay)} className={cn(action, 'hover:bg-muted')}>
            <Play className="size-5 shrink-0 text-primary" aria-hidden />
            Play from this ayah
          </button>
        ) : null}
        <button type="button" onClick={onClose} className={cn(action, 'justify-center text-muted-foreground hover:bg-muted')}>
          Cancel
        </button>
      </div>
    </div>
  )
}
