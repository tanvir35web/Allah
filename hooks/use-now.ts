'use client'

import { useSyncExternalStore } from 'react'

function subscribeMinute(callback: () => void) {
  // Tick on the next minute boundary, then every minute after, and when the app returns.
  let interval: number | undefined
  const timeout = window.setTimeout(() => {
    callback()
    interval = window.setInterval(callback, 60_000)
  }, 60_000 - (Date.now() % 60_000))
  document.addEventListener('visibilitychange', callback)
  return () => {
    window.clearTimeout(timeout)
    window.clearInterval(interval)
    document.removeEventListener('visibilitychange', callback)
  }
}

const currentMinute = () => Math.floor(Date.now() / 60_000) * 60_000

/**
 * The current time, updated every minute; `null` while prerendering, so a
 * statically exported page never shows the build-time clock.
 */
export function useNow(): Date | null {
  const minute = useSyncExternalStore(subscribeMinute, currentMinute, () => null)
  return minute === null ? null : new Date(minute)
}
