'use client'

import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { ProgressRing } from '@/components/ui/progress-bar'
import { useProgressSummary } from '@/hooks/use-derived-data'
import { cn } from '@/lib/utils'

/** Overall progress: a ring with the percentage, and learned / learning / remaining. */
export function ProgressCard({ className }: { className?: string }) {
  const summary = useProgressSummary()
  const parts = [
    { label: 'Learned', value: summary.learned, dot: 'bg-success' },
    { label: 'Learning', value: summary.learning, dot: 'bg-accent' },
    { label: 'Remaining', value: summary.notStarted, dot: 'bg-muted-foreground/40' },
  ]

  return (
    <Card className={cn('flex items-center gap-5 p-5', className)}>
      <ProgressRing
        value={summary.learned}
        max={summary.total}
        size={92}
        stroke={8}
        label="Names learned"
        valueText={`${summary.learned} of ${summary.total} Names learned`}
      >
        <span className="text-center leading-tight">
          <span className="block text-xl font-bold tabular-nums">{summary.percentage}%</span>
        </span>
      </ProgressRing>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-bold tabular-nums">
          {summary.learned}
          <span className="text-base font-medium text-muted-foreground"> / {summary.total}</span>
        </p>
        <p className="text-sm text-muted-foreground">Names learned</p>
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {parts.map(({ label, value, dot }) => (
            <li key={label} className="flex items-center gap-2">
              <span className={cn('size-2 rounded-full', dot)} aria-hidden />
              <span className="flex-1">{label}</span>
              <span className="font-semibold text-foreground tabular-nums">{value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

export function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
