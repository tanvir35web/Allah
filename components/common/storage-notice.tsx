'use client'

import { DatabaseZap } from 'lucide-react'
import { useAppData } from '@/components/providers/app-data-provider'

/** Explains when progress cannot be saved (e.g. IndexedDB blocked in private mode). */
export function StorageNotice() {
  const { ready, storageAvailable } = useAppData()
  if (!ready || storageAvailable) return null
  return (
    <div role="alert" className="mb-4 flex gap-3 rounded-2xl border border-accent/30 bg-accent-soft p-4 text-sm">
      <DatabaseZap className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
      <p>
        <strong className="font-semibold">Progress can’t be saved on this device.</strong>{' '}
        <span className="text-muted-foreground">
          Local storage is unavailable (private browsing may block it). You can keep learning, but progress will be
          lost when the app closes.
        </span>
      </p>
    </div>
  )
}
