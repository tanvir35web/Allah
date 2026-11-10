'use client'

import { Clock } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAppData } from '@/components/providers/app-data-provider'
import { formatClock, formatDuration } from '@/lib/reading'
import { cn } from '@/lib/utils'

/** Reading time stops counting after this long without a scroll, tap or key press. */
const IDLE_MS = 120_000
/** How often reading time is saved while reading. */
const SAVE_MS = 15_000

/**
 * Counts time spent reading a surah while the page is on screen and in use,
 * saving to IndexedDB every few seconds and when the page is hidden or left.
 * Shows a clock that ticks every second.
 */
export function ReadingTimer({ surahId, surahName }: { surahId: number; surahName: string }) {
  const { ready, surahReadings, recordReading } = useAppData()
  const savedSeconds = surahReadings[surahId]?.seconds ?? 0
  // Seconds counted but not yet saved, so the clock ticks every second, not every save.
  const [unsavedSeconds, setUnsavedSeconds] = useState(0)
  // True after IDLE_MS without a scroll, tap or key press: the clock stops.
  const [paused, setPaused] = useState(false)
  const record = useRef(recordReading)
  useEffect(() => {
    record.current = recordReading
  }, [recordReading])

  useEffect(() => {
    if (!ready) return
    let lastActive = Date.now()
    let seconds = 0

    const save = () => {
      if (seconds === 0) return
      const counted = seconds
      seconds = 0
      // Once saved, those seconds are in the stored total: stop counting them twice.
      void record.current({ surahId, surahName }, counted).then(() =>
        setUnsavedSeconds((current) => Math.max(0, current - counted)),
      )
    }
    const onActivity = () => {
      lastActive = Date.now()
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') save()
      else onActivity()
    }

    const ticker = window.setInterval(() => {
      const active = document.visibilityState === 'visible' && Date.now() - lastActive < IDLE_MS
      setPaused(!active)
      if (!active) return
      seconds += 1
      setUnsavedSeconds((current) => current + 1)
    }, 1000)
    const saver = window.setInterval(save, SAVE_MS)
    window.addEventListener('scroll', onActivity, { passive: true })
    window.addEventListener('pointerdown', onActivity, { passive: true })
    window.addEventListener('keydown', onActivity)
    window.addEventListener('pagehide', save)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.clearInterval(ticker)
      window.clearInterval(saver)
      window.removeEventListener('scroll', onActivity)
      window.removeEventListener('pointerdown', onActivity)
      window.removeEventListener('keydown', onActivity)
      window.removeEventListener('pagehide', save)
      document.removeEventListener('visibilitychange', onVisibility)
      save()
    }
  }, [ready, surahId, surahName])

  // Same size as the pill, so the surah header does not shift when it appears.
  if (!ready) return <span className="inline-block h-8 w-28 rounded-full bg-card/60" aria-hidden />

  const total = savedSeconds + unsavedSeconds

  // A compact pill, shown inside the surah header.
  return (
    <span
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full bg-card/80 px-3 text-sm shadow-xs',
        paused ? 'text-muted-foreground' : 'text-foreground',
      )}
      title={paused ? 'Reading time (paused)' : 'Reading time'}
    >
      <Clock className={cn('size-3.5', paused ? 'text-muted-foreground' : 'text-primary')} aria-hidden />
      <span className="sr-only">Reading time{paused ? ', paused' : ''}: </span>
      {/* Ticks every second; screen readers get the rounded duration instead of a running clock. */}
      <span className="sr-only">{formatDuration(total)}</span>
      <span className="font-semibold tabular-nums" aria-hidden>
        {formatClock(total)}
      </span>
      {paused ? (
        <span className="text-xs" aria-hidden>
          · Paused
        </span>
      ) : null}
    </span>
  )
}
