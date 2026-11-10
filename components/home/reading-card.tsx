'use client'

import { ArrowRight, BookOpenText } from 'lucide-react'
import Link from 'next/link'
import { useAppData } from '@/components/providers/app-data-provider'
import { ButtonLink } from '@/components/ui/button'
import { useToday } from '@/hooks/use-today'
import { formatDuration, summarizeReading } from '@/lib/reading'

/**
 * Quran reading at a glance: the surah read most recently, with a link back
 * into it, and reading time for today and the past week.
 */
export function ReadingCard() {
  const { surahReadings, readingDays } = useAppData()
  const today = useToday()
  const summary = summarizeReading(surahReadings, readingDays, today)
  const last = Object.values(surahReadings)
    .filter((reading) => reading.seconds > 0)
    .sort((a, b) => b.lastReadAt.localeCompare(a.lastReadAt))[0]

  const stats = [
    { label: 'Today', value: formatDuration(summary.todaySeconds) },
    { label: 'This week', value: formatDuration(summary.weekSeconds) },
    { label: 'Surahs read', value: String(summary.surahsRead) },
  ]

  return (
    <section aria-labelledby="reading-title" className="flex flex-col">
      <div className="mb-2 flex h-7 items-center justify-between px-1">
        <h2 id="reading-title" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Continue Reading
        </h2>
        <Link
          href="/surahs/"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          All Surahs →
        </Link>
      </div>

      <article className="relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-xs transition-all duration-200 hover:border-primary/30">
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
            <BookOpenText className="size-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            {last ? (
              <>
                <p className="text-xs font-medium text-muted-foreground">Last read · Surah {last.surahId}</p>
                <p className="truncate text-lg font-bold tracking-tight text-foreground">{last.surahName}</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold tracking-tight text-foreground">Begin your Quran reading</p>
                <p className="text-xs text-muted-foreground">Your reading time is tracked as you read.</p>
              </>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-3 divide-x divide-border/60 rounded-2xl bg-muted/40 py-3">
          {stats.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 px-2 text-center">
              <dt className="text-[0.6875rem] font-medium text-muted-foreground">{label}</dt>
              <dd className="text-sm font-bold text-foreground tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        <ButtonLink
          href={`/surahs/${last?.surahId ?? 1}/`}
          variant="outline"
          size="md"
          className="group flex w-full items-center justify-between rounded-2xl px-5 font-bold shadow-xs transition-all hover:bg-muted"
        >
          <span className="truncate">{last ? `Continue ${last.surahName}` : 'Start with Al-Fatihah'}</span>
          <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
        </ButtonLink>
      </article>
    </section>
  )
}
