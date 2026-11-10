'use client'

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ArabicText, BanglaText } from '@/components/common/localized-text'
import { useAppData } from '@/components/providers/app-data-provider'
import { useSwipe } from '@/hooks/use-swipe'
import { getStatus } from '@/lib/progress'
import { TOTAL_NAMES } from '@/lib/storage/names'
import type { AllahName } from '@/lib/types'
import { formatDate, formatNumber, pluralize } from '@/lib/utils'
import { FavoriteButton } from './favorite-button'
import { StatusSelector } from './status-selector'

interface NameDetailsProps {
  name: AllahName
  previous?: AllahName
  next?: AllahName
}

const label = 'text-xs font-bold tracking-wider text-muted-foreground uppercase'

/**
 * One Name, kept minimal: the Arabic hero (sticky beside the details on wider
 * screens), its meaning, the learning status, and the neighbouring Names.
 * Swipe or use the arrow keys to move between Names.
 */
export function NameDetails({ name, previous, next }: NameDetailsProps) {
  const router = useRouter()
  const { progress, settings } = useAppData()
  const status = getStatus(progress, name.id)
  const record = progress[name.id]
  const showEn = settings.language !== 'bn'
  const showBn = settings.language !== 'en'

  const goPrevious = () => previous && router.push(`/names/${previous.id}/`)
  const goNext = () => next && router.push(`/names/${next.id}/`)
  const swipe = useSwipe({ onSwipeLeft: goNext, onSwipeRight: goPrevious })

  // Arrow keys move between names on desktop.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, [role="radiogroup"]')) return
      if (event.key === 'ArrowRight' && next) router.push(`/names/${next.id}/`)
      if (event.key === 'ArrowLeft' && previous) router.push(`/names/${previous.id}/`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router, next, previous])

  const meta = [
    record?.learnedAt && status === 'learned' ? `Learned ${formatDate(record.learnedAt)}` : null,
    record && record.reviewCount > 0 ? `Reviewed ${pluralize(record.reviewCount, 'time')}` : null,
  ].filter(Boolean)

  return (
    <article
      {...swipe}
      aria-labelledby="name-title"
      className="grid items-start gap-4 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-6"
    >
      {/* Hero */}
      <section className="pattern-stars relative flex flex-col overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-b from-primary-soft to-card px-6 pt-5 pb-6 text-center md:sticky md:top-[calc(env(safe-area-inset-top)+4.5rem)] md:min-h-[28rem]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary tabular-nums">
            {formatNumber(name.id)} / {TOTAL_NAMES}
          </span>
          <FavoriteButton nameId={name.id} label={name.transliteration} className="-mr-2" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-3">
          <ArabicText className="block text-[4.5rem] leading-[1.7] text-primary sm:text-[5.5rem] md:text-[6rem]">
            {name.arabic}
          </ArabicText>
          <h2 id="name-title" className="text-2xl font-bold tracking-tight md:text-3xl">
            {name.transliteration}
          </h2>
          {showBn ? <BanglaText className="mt-0.5 block text-sm text-muted-foreground">{name.banglaName}</BanglaText> : null}
          <div className="mt-4 space-y-0.5">
            {showEn ? <p className="text-lg font-semibold">{name.englishName}</p> : null}
            {showBn ? <BanglaText className="block text-lg">{name.banglaMeaning}</BanglaText> : null}
          </div>
        </div>

        {/* Position in the 99 */}
        <div
          className="mx-auto h-1 w-24 overflow-hidden rounded-full bg-card/80"
          role="progressbar"
          aria-label="Position in the 99 Names"
          aria-valuemin={1}
          aria-valuemax={TOTAL_NAMES}
          aria-valuenow={name.id}
        >
          <div className="h-full rounded-full bg-primary/70" style={{ width: `${(name.id / TOTAL_NAMES) * 100}%` }} />
        </div>
      </section>

      <div className="space-y-4">
        {/* Meaning */}
        {showEn || showBn ? (
          <section className="space-y-4 rounded-3xl border border-border/70 bg-card p-5 md:p-6">
            <h3 className={label}>Meaning</h3>
            {showEn ? (
              <div>
                <p className="font-semibold">{name.englishMeaning}</p>
                <p className="mt-1 leading-relaxed text-muted-foreground">{name.shortExplanationEn}</p>
              </div>
            ) : null}
            {showEn && showBn ? <div className="h-px bg-border/60" /> : null}
            {showBn ? (
              <div lang="bn">
                <BanglaText className="block font-semibold">{name.banglaMeaning}</BanglaText>
                <BanglaText className="mt-1 block leading-relaxed text-muted-foreground">
                  {name.shortExplanationBn}
                </BanglaText>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Progress: the status control is the only way to set it */}
        <section className="space-y-3 rounded-3xl border border-border/70 bg-card p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className={label}>Progress</h3>
            <Link
              href={`/learn/?id=${name.id}`}
              className="group inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              Study
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
          <StatusSelector nameId={name.id} />
          {meta.length ? <p className="text-xs text-muted-foreground">{meta.join(' · ')}</p> : null}
        </section>

        {/* Previous / next */}
        <nav
          aria-label="Previous and next name"
          className="grid grid-cols-2 divide-x divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-card"
        >
          {previous ? (
            <Link
              href={`/names/${previous.id}/`}
              className="group flex min-h-14 items-center gap-1.5 px-3 transition-colors hover:bg-muted/50"
            >
              <ChevronLeft className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0">
                <span className="block text-[0.6875rem] text-muted-foreground tabular-nums">{formatNumber(previous.id)}</span>
                <span className="block truncate text-sm font-semibold">{previous.transliteration}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/names/${next.id}/`}
              className="group flex min-h-14 items-center justify-end gap-1.5 px-3 text-right transition-colors hover:bg-muted/50"
            >
              <span className="min-w-0">
                <span className="block text-[0.6875rem] text-muted-foreground tabular-nums">{formatNumber(next.id)}</span>
                <span className="block truncate text-sm font-semibold">{next.transliteration}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </article>
  )
}
