'use client'

import { useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

/** A small status pill. Everything works offline, so this is only informational. */
export function ConnectionStatus({ className }: { className?: string }) {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  )
  return (
    <p
      role="status"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs text-muted-foreground',
        className,
      )}
    >
      <span className={cn('size-2 rounded-full', online ? 'bg-success' : 'bg-accent')} aria-hidden />
      {online ? 'Online · works offline too' : 'Offline · everything still works'}
    </p>
  )
}
