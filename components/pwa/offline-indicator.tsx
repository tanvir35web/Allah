'use client'

import { WifiOff } from 'lucide-react'
import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

/** A calm notice when offline. Everything keeps working; this is informational. */
export function OfflineIndicator() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  )
  if (online) return null
  return (
    <div
      role="status"
      className="animate-rise pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4 bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom)+0.75rem)]"
    >
      <p className="flex items-center gap-2 rounded-full border border-border bg-card/95 px-3.5 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">
        <WifiOff className="size-3.5" aria-hidden />
        Offline — everything still works
      </p>
    </div>
  )
}
