'use client'

import { Card } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { useProgressSummary } from '@/hooks/use-derived-data'
import { cn } from '@/lib/utils'

/** Overall "23 / 99 Names learned" card. */
export function ProgressCard({ className }: { className?: string }) {
  const summary = useProgressSummary()
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Names learned</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">
            {summary.learned}
            <span className="text-lg font-medium text-muted-foreground"> / {summary.total}</span>
          </p>
        </div>
        <p className="text-2xl font-semibold text-primary tabular-nums">{summary.percentage}%</p>
      </div>
      <ProgressBar className="mt-4" value={summary.learned} max={summary.total} label="Names learned" />
      <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-success" aria-hidden /> {summary.learned} learned
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent" aria-hidden /> {summary.learning} learning
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/40" aria-hidden /> {summary.notStarted} remaining
        </span>
      </div>
    </Card>
  )
}

export function StatTile({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
