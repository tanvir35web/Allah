'use client'

import { Wifi, WifiOff } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { Card } from '@/components/ui/card'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

/** Connection status for the More page. Everything works offline; this is informational. */
export function ConnectionStatus() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  )
  const Icon = online ? Wifi : WifiOff
  return (
    <Card role="status" className="mt-4 flex min-h-16 items-center gap-4 px-4 py-3">
      <span className="grid size-10 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{online ? 'Online' : 'Offline'}</span>
        <span className="block text-xs text-muted-foreground">
          {online ? 'The app also works without internet' : 'Everything still works'}
        </span>
      </span>
    </Card>
  )
}
