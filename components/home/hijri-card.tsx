'use client'

import { CalendarDays, Clock } from 'lucide-react'
import { Skeleton } from '@/components/common/loading-state'
import { useAppData } from '@/components/providers/app-data-provider'
import { useNow } from '@/hooks/use-now'
import { daysInHijriMonth, formatHijri, toHijri, upcomingIslamicDays } from '@/lib/hijri'
import { toBanglaDigits } from '@/lib/surah-search'
import { cn } from '@/lib/utils'

function daysAwayLabel(days: number): string {
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `in ${days} days`
}

/** Today's Hijri date, the time, progress through the month and the next Islamic days. */
export function HijriCard() {
  const now = useNow()
  const { settings } = useAppData()
  const showEn = settings.language !== 'bn'
  const showBn = settings.language !== 'en'

  return (
    <section aria-labelledby="hijri-title" className="flex flex-col">
      <div className="mb-2 flex h-7 items-center px-1">
        <h2 id="hijri-title" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Hijri Calendar
        </h2>
      </div>

      {now ? <HijriBody now={now} showEn={showEn} showBn={showBn} /> : <Skeleton className="h-72 rounded-3xl" />}
    </section>
  )
}

function HijriBody({ now, showEn, showBn }: { now: Date; showEn: boolean; showBn: boolean }) {
  const hijri = toHijri(now)
  const monthLength = daysInHijriMonth(now)
  const upcoming = upcomingIslamicDays(now, 3)
  const isFriday = now.getDay() === 5
  const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(now)
  const gregorian = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(now)

  return (
    <article className="pattern-stars relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-primary-soft to-card p-6 shadow-xs transition-all duration-200 hover:border-primary/30">
      {/* Two halves side by side from md: today on the left, coming up on the right. */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
        <div>
          {/* Date and time */}
          {/* Umm al-Qura dates are calculated; local moon sighting can differ by a day. */}
          <div className="min-w-0" title="Umm al-Qura calendar. Local dates may differ by a day with the moon sighting.">
            <p lang="ar" dir="rtl" className="text-left text-2xl leading-[1.6] text-primary">
              {formatHijri(now, 'ar')}
            </p>
            {showEn ? <p className="text-lg font-bold tracking-tight text-foreground">{formatHijri(now, 'en')}</p> : null}
            {showBn ? (
              <p lang="bn" className="text-sm font-medium text-foreground/85">
                {formatHijri(now, 'bn')}
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card/80 px-2.5 py-1 text-foreground tabular-nums">
              <Clock className="size-3.5 text-primary" aria-hidden />
              <time dateTime={now.toISOString()}>{time}</time>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card/80 px-2.5 py-1 text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden />
              {gregorian}
            </span>
            {isFriday ? (
              <span className="rounded-full bg-accent-soft px-2.5 py-1 font-bold text-accent">Jumu&apos;ah</span>
            ) : null}
          </div>

          {/* Progress through the month */}
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Day {hijri.day} of {monthLength}
              </span>
              <span>{monthLength - hijri.day === 0 ? 'Last day of the month' : `${monthLength - hijri.day} days left`}</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-card/80"
              role="progressbar"
              aria-label="Progress through the Hijri month"
              aria-valuemin={1}
              aria-valuemax={monthLength}
              aria-valuenow={hijri.day}
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${(hijri.day / monthLength) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Upcoming days */}
        <div>
          <h3 className="mb-2 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">Coming up</h3>
          <ul className="divide-y divide-border/50 rounded-2xl bg-card/70">
            {upcoming.map((day) => (
              <li key={day.key} className="flex items-center gap-3 px-3.5 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{showEn ? day.en : day.bn}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {showEn && showBn ? <span lang="bn">{day.bn} · </span> : null}
                    {new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(day.date)}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums',
                    day.daysAway <= 1 ? 'bg-primary text-primary-foreground' : 'bg-primary-soft text-primary',
                  )}
                >
                  {showEn ? daysAwayLabel(day.daysAway) : `${toBanglaDigits(day.daysAway)} দিন`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </article>
  )
}
