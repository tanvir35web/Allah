'use client'

import { Flame } from 'lucide-react'
import { useMemo } from 'react'
import { useAppData } from '@/components/providers/app-data-provider'
import { Card } from '@/components/ui/card'
import { useStreak } from '@/hooks/use-derived-data'
import { useToday } from '@/hooks/use-today'
import { dayNumber } from '@/lib/date'
import { recentDays } from '@/lib/streak'
import { cn, pluralize } from '@/lib/utils'

const WEEKDAY = new Intl.DateTimeFormat(undefined, { weekday: 'narrow', timeZone: 'UTC' })

/** Compact streak pill for headers. */
export function StreakPill() {
  const streak = useStreak()
  const count = streak?.currentStreak ?? 0
  return (
    <span
      className={cn(
        'inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold tabular-nums transition-colors',
        streak?.todayActive ? 'bg-accent-soft text-accent' : 'bg-muted text-muted-foreground',
      )}
      aria-label={`${pluralize(count, 'day')} streak`}
    >
      <Flame key={count} className={cn('size-4', streak?.todayActive && 'animate-pop fill-accent/30')} aria-hidden />
      {streak ? count : '–'}
    </span>
  )
}

/** Streak card with the last seven days. */
export function StreakCard({ className }: { className?: string }) {
  const { activities } = useAppData()
  const streak = useStreak()
  const today = useToday()
  const week = useMemo(() => (today ? recentDays(activities, today, 7) : []), [activities, today])

  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'grid size-14 shrink-0 place-items-center rounded-2xl',
            streak?.todayActive ? 'bg-accent-soft text-accent' : 'bg-muted text-muted-foreground',
          )}
        >
          <Flame className="size-7" strokeWidth={1.8} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold tabular-nums">
            {streak ? pluralize(streak.currentStreak, 'day') : '–'}
          </p>
          <p className="text-sm text-muted-foreground">
            {!streak
              ? 'Current streak'
              : streak.todayActive
                ? 'Today counts. See you tomorrow.'
                : streak.currentStreak > 0
                  ? 'Learn one Name or take a quiz to keep it going.'
                  : 'Learn one Name or take a quiz to start a streak.'}
          </p>
        </div>
      </div>
      {week.length > 0 ? (
        <ol className="mt-5 grid grid-cols-7 gap-1.5" aria-label="Last 7 days">
          {week.map(({ date, active }) => {
            const isToday = date === today
            const weekday = WEEKDAY.format(new Date(dayNumber(date) * 86_400_000))
            return (
              <li key={date} className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'grid size-8 place-items-center rounded-full text-xs transition-colors',
                    active ? 'bg-accent text-white dark:text-background' : 'bg-muted text-muted-foreground',
                    isToday && !active && 'ring-2 ring-accent/40',
                  )}
                  aria-label={`${date}${isToday ? ' (today)' : ''}: ${active ? 'active' : 'no activity'}`}
                >
                  {active ? <Flame className="size-3.5" aria-hidden /> : null}
                </span>
                <span className={cn('text-[0.6875rem] text-muted-foreground', isToday && 'font-semibold text-foreground')} aria-hidden>
                  {weekday}
                </span>
              </li>
            )
          })}
        </ol>
      ) : null}
    </Card>
  )
}
