import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-muted', className)} aria-hidden />
}

/** Placeholder shown while local data is read from IndexedDB (usually a few ms). */
export function LoadingState({ rows = 3, label = 'Loading' }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-24 w-full rounded-3xl" />
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  )
}
