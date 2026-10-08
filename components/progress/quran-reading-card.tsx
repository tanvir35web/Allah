'use client'

import { Card, SectionTitle } from '@/components/ui/card'
import { useReadingSummary } from '@/hooks/use-derived-data'
import { formatDuration } from '@/lib/reading'

/** Time spent reading the Qur'an: today, this week and in total. */
export function QuranReadingCard() {
  const summary = useReadingSummary()
  const stats = [
    { label: 'Today', value: formatDuration(summary.todaySeconds) },
    { label: 'Last 7 days', value: formatDuration(summary.weekSeconds) },
    { label: 'Total', value: formatDuration(summary.totalSeconds) },
  ]

  return (
    <section aria-labelledby="quran-reading-title" className="space-y-3">
      <SectionTitle id="quran-reading-title">Quran Reading Time</SectionTitle>
      <Card className="p-5">
        <dl className="grid grid-cols-3 divide-x divide-border">
          {stats.map(({ label, value }) => (
            <div key={label} className="px-2 text-center first:pl-0 last:pr-0">
              <dt className="text-[0.8125rem] text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 text-lg font-bold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </section>
  )
}
