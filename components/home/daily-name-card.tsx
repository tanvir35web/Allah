'use client'

import { ArrowRight, Moon } from 'lucide-react'
import { ArabicText, BanglaText } from '@/components/common/localized-text'
import { Skeleton } from '@/components/common/loading-state'
import { useAppData } from '@/components/providers/app-data-provider'
import { ButtonLink } from '@/components/ui/button'
import { useToday } from '@/hooks/use-today'
import { getDailyName } from '@/lib/daily-name'
import { allahNames } from '@/lib/storage/names'
import { formatNumber } from '@/lib/utils'

/** "Name of the Day" — deterministic per local date, fully offline. */
export function DailyNameCard() {
  const today = useToday()
  const { settings } = useAppData()

  if (!today) return <Skeleton className="h-80 rounded-[2rem]" />

  const name = getDailyName(allahNames, today)
  return (
    <section
      aria-labelledby="daily-name-title"
      className="pattern-stars relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-b from-primary-soft to-card p-6 text-center"
    >
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <h2 id="daily-name-title" className="inline-flex items-center gap-1.5 tracking-[0.12em] uppercase">
          <Moon className="size-3.5" aria-hidden />
          Name of the Day
        </h2>
        <span className="tabular-nums">{formatNumber(name.id)} / 99</span>
      </div>
      <ArabicText className="mt-4 block text-[3.75rem] leading-[1.75]">{name.arabic}</ArabicText>
      <p className="text-xl font-semibold">{name.transliteration}</p>
      {settings.language !== 'bn' ? <p className="mt-1 text-muted-foreground">{name.englishName}</p> : null}
      {settings.language !== 'en' ? (
        <BanglaText className="mt-0.5 block text-muted-foreground">{name.banglaMeaning}</BanglaText>
      ) : null}
      <ButtonLink href={`/names/${name.id}/`} variant="outline" className="mt-5">
        Learn more
        <ArrowRight className="size-4" aria-hidden />
      </ButtonLink>
    </section>
  )
}
