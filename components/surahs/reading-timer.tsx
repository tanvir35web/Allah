'use client'

import { Clock } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAppData } from '@/components/providers/app-data-provider'
import { Card } from '@/components/ui/card'
import { formatClock, formatDuration } from '@/lib/reading'

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

  if (!ready) return <div className="h-[3.75rem]" aria-hidden />

  const total = savedSeconds + unsavedSeconds

  return (
    <Card className="flex items-center gap-3 px-4 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <Clock className="size-5" aria-hidden />
      </span>
      <p className="min-w-0 flex-1 text-[0.9375rem] text-muted-foreground">
        Reading time
        {paused ? <span> · Paused</span> : null}
      </p>
      {/* Ticks every second; screen readers get the rounded duration instead of a running clock. */}
      <p className="text-[1.25rem] font-bold">
        <span className="sr-only">{formatDuration(total)}</span>
        <span className="tabular-nums" aria-hidden>
          {formatClock(total)}
        </span>
      </p>
    </Card>
  )
}
