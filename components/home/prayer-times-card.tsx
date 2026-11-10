'use client'

import { MapPin, Moon, Sunrise, Sunset } from 'lucide-react'
import { Skeleton } from '@/components/common/loading-state'
import { useAppData } from '@/components/providers/app-data-provider'
import { useNow } from '@/hooks/use-now'
import { currentPrayer, DHAKA, nextPrayer, prayerTimes } from '@/lib/prayer-times'
import { cn } from '@/lib/utils'

/** "4:52 AM" in Dhaka time, whatever the device's time zone. */
const timeFormat = new Intl.DateTimeFormat('en-US', { timeZone: DHAKA.timeZone, hour: 'numeric', minute: '2-digit' })

/** "1h 24m", "35m". */
function untilLabel(ms: number): string {
  const minutes = Math.max(0, Math.ceil(ms / 60_000))
  const hours = Math.floor(minutes / 60)
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`
}

/** Today's prayer times in Dhaka, with the next prayer and a countdown. */
export function PrayerTimesCard() {
  const now = useNow()

  return (
    <section aria-labelledby="prayer-title" className="flex flex-col">
      <div className="mb-2 flex h-7 items-center justify-between px-1">
        <h2 id="prayer-title" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Prayer Times
        </h2>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <MapPin className="size-3.5" aria-hidden />
          {DHAKA.name}
        </span>
      </div>
      {now ? <PrayerBody now={now} /> : <Skeleton className="h-96 rounded-3xl" />}
    </section>
  )
}

function PrayerBody({ now }: { now: Date }) {
  const { settings } = useAppData()
  const showEn = settings.language !== 'bn'
  const showBn = settings.language !== 'en'
  const times = prayerTimes(now)
  const next = nextPrayer(now)
  const current = currentPrayer(now)
  const fajr = times.find((p) => p.key === 'fajr')
  const maghrib = times.find((p) => p.key === 'maghrib')

  return (
    <article className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-xs transition-colors hover:border-primary/30">
      {/* Next prayer */}
      <div className="pattern-stars bg-gradient-to-br from-primary-soft to-card px-5 pt-5 pb-4">
        <p className="text-xs font-semibold text-primary">Next prayer</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-2xl font-bold tracking-tight">
              {showEn ? next.en : <span lang="bn">{next.bn}</span>}
              {showEn && showBn ? (
                <span lang="bn" className="ml-2 text-base font-medium text-muted-foreground">
                  {next.bn}
                </span>
              ) : null}
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">{timeFormat.format(next.time)}</p>
          </div>
          <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground tabular-nums">
            in {untilLabel(next.time.getTime() - now.getTime())}
          </span>
        </div>
      </div>

      {/* Today's timetable */}
      <ol className="divide-y divide-border/50 px-2 py-1">
        {times.map((prayer) => {
          const isNext = prayer.key === next.key && prayer.time.getTime() === next.time.getTime()
          // Before Fajr it is still last night's Isha; today's Isha row is tonight's, so not "Now".
          const isCurrent = prayer.key === current && prayer.time <= now
          const passed = prayer.time <= now && !isCurrent
          return (
            <li
              key={prayer.key}
              aria-current={isCurrent ? 'time' : undefined}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm',
                isNext && 'bg-primary-soft',
                passed && 'text-muted-foreground',
              )}
            >
              {prayer.key === 'sunrise' ? (
                <Sunrise className="size-4 shrink-0 text-accent" aria-hidden />
              ) : (
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    isCurrent ? 'bg-success' : isNext ? 'bg-primary' : 'bg-border',
                  )}
                  aria-hidden
                />
              )}
              <span className={cn('flex-1', prayer.isPrayer ? 'font-semibold' : 'text-muted-foreground')}>
                {showEn ? prayer.en : <span lang="bn">{prayer.bn}</span>}
                {showEn && showBn ? (
                  <span lang="bn" className="ml-1.5 text-xs font-normal text-muted-foreground">
                    {prayer.bn}
                  </span>
                ) : null}
                {isCurrent ? (
                  <span className="ml-2 rounded-full bg-success-soft px-1.5 py-0.5 text-[0.625rem] font-bold text-success">
                    Now
                  </span>
                ) : null}
              </span>
              <span className={cn('font-semibold tabular-nums', isNext && 'text-primary')}>
                {timeFormat.format(prayer.time)}
              </span>
            </li>
          )
        })}
      </ol>

      {/* Sehri and iftar: when the fast begins (Fajr) and ends (Maghrib) */}
      {fajr && maghrib ? (
        <div className="grid grid-cols-2 divide-x divide-border/60 border-t border-border/60 text-center">
          <div className="px-3 py-3">
            <p className="flex items-center justify-center gap-1.5 text-[0.6875rem] text-muted-foreground">
              <Moon className="size-3.5" aria-hidden />
              Sehri ends
            </p>
            <p className="mt-0.5 text-sm font-bold tabular-nums">{timeFormat.format(fajr.time)}</p>
          </div>
          <div className="px-3 py-3">
            <p className="flex items-center justify-center gap-1.5 text-[0.6875rem] text-muted-foreground">
              <Sunset className="size-3.5" aria-hidden />
              Iftar
            </p>
            <p className="mt-0.5 text-sm font-bold tabular-nums">{timeFormat.format(maghrib.time)}</p>
          </div>
        </div>
      ) : null}
    </article>
  )
}
