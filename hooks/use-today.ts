'use client'

import { useSyncExternalStore } from 'react'
import { toDateKey } from '@/lib/date'

function subscribe(callback: () => void) {
  // Re-check when the app returns to the foreground and once a minute,
  // so the daily name and streak roll over at local midnight.
  const interval = window.setInterval(callback, 60_000)
  document.addEventListener('visibilitychange', callback)
  return () => {
    window.clearInterval(interval)
    document.removeEventListener('visibilitychange', callback)
  }
}

/**
 * Today's local date key, or `null` during prerendering/hydration.
 * Pages are statically exported, so the build-time date must never be shown.
 */
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, () => toDateKey(), () => null)
}
