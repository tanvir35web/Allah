'use client'

import { RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/**
 * Registers /sw.js in production builds and offers a gentle prompt when a
 * new version has been downloaded. The new worker only takes over after the
 * user agrees, so a session is never switched to new assets mid-way.
 */
export function ServiceWorkerRegistrar() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null)
  const updateRequested = useRef(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return

    let refreshing = false
    // Only reload when the user accepted an update. The very first install
    // also fires `controllerchange` (clients.claim) and must not reload.
    const onControllerChange = () => {
      if (refreshing || !updateRequested.current) return
      refreshing = true
      window.location.reload()
    }

    const track = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting && navigator.serviceWorker.controller) setWaiting(registration.waiting)
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing
        installing?.addEventListener('statechange', () => {
          // Only prompt for updates, not for the very first install.
          if (installing.state === 'installed' && navigator.serviceWorker.controller) setWaiting(installing)
        })
      })
    }

    let registration: ServiceWorkerRegistration | undefined
    // Check for updates when the app returns to the foreground.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void registration?.update().catch(() => undefined)
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    document.addEventListener('visibilitychange', onVisible)
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((result) => {
        registration = result
        track(result)
      })
      .catch((error: unknown) => console.warn('[sw] Registration failed', error))

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  if (!waiting) return null

  return (
    <div
      role="status"
      className="animate-rise fixed inset-x-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-card p-3 pl-4 shadow-lg bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom)+0.75rem)]"
    >
      <p className="flex-1 text-sm">A new version is ready.</p>
      <button
        type="button"
        onClick={() => {
          updateRequested.current = true
          waiting.postMessage({ type: 'SKIP_WAITING' })
        }}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
      >
        <RefreshCw className="size-4" aria-hidden />
        Update
      </button>
    </div>
  )
}
