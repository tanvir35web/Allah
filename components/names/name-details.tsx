'use client'

import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { ArabicText, BanglaText } from '@/components/common/localized-text'
import { useAppData } from '@/components/providers/app-data-provider'
import { Button, ButtonLink } from '@/components/ui/button'
import { useSwipe } from '@/hooks/use-swipe'
import { getStatus } from '@/lib/progress'
import { TOTAL_NAMES } from '@/lib/storage/names'
import type { AllahName } from '@/lib/types'
import { cn, formatDate, formatNumber, pluralize } from '@/lib/utils'
import { FavoriteButton } from './favorite-button'
import { StatusBadge } from './status-badge'
import { StatusSelector } from './status-selector'

interface NameDetailsProps {
  name: AllahName
  previous?: AllahName
  next?: AllahName
}

/** Section heading inside a detail card, matching the home cards. */
function CardLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-xs font-bold tracking-wider text-muted-foreground uppercase', className)}>{children}</h3>
}

/**
 * One Name: a large Arabic hero (sticky beside the details on wider screens),
 * its meaning in English and Bangla, the reader's progress, and the Names on
 * either side. Swipe or use the arrow keys to move between Names.
 */
export function NameDetails({ name, previous, next }: NameDetailsProps) {
  const router = useRouter()
  const { progress, settings, setStatus } = useAppData()
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

  const heroArrow =
    'grid size-10 place-items-center rounded-full border border-border/70 bg-card/80 text-muted-foreground shadow-xs transition hover:text-foreground hover:border-primary/30 active:scale-95'

  return (
    <article
      {...swipe}
      aria-labelledby="name-title"
      className="grid items-start gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-6"
    >
      {/* Hero */}
      <section className="pattern-stars relative flex flex-col overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-b from-primary-soft to-card px-6 pt-5 pb-6 text-center shadow-xs md:sticky md:top-[calc(env(safe-area-inset-top)+4.5rem)] md:min-h-[30rem]">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-card/80 px-3 py-1 text-xs font-semibold text-primary tabular-nums">
            {formatNumber(name.id)} / {TOTAL_NAMES}
          </span>
          <FavoriteButton nameId={name.id} label={name.transliteration} className="-mr-2" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <ArabicText className="block text-[4.5rem] leading-[1.7] text-primary sm:text-[5.5rem] md:text-[6rem]">
            {name.arabic}
          </ArabicText>
          <h2 id="name-title" className="text-2xl font-bold tracking-tight md:text-3xl">
            {name.transliteration}
          </h2>
          {showBn ? <BanglaText className="mt-0.5 block text-sm text-muted-foreground">{name.banglaName}</BanglaText> : null}

          {/* Small ornament between the name and its meaning */}
          <span className="my-4 flex items-center gap-2 text-primary/50" aria-hidden>
            <span className="h-px w-10 bg-current" />
            <span className="size-1.5 rotate-45 bg-current" />
            <span className="h-px w-10 bg-current" />
          </span>

          {showEn ? <p className="text-lg font-semibold md:text-xl">{name.englishName}</p> : null}
          {showBn ? <BanglaText className="block text-lg font-medium md:text-xl">{name.banglaMeaning}</BanglaText> : null}
        </div>

        {/* Position in the 99, with previous / next */}
        <div className="flex items-center gap-3">
          {previous ? (
            <Link href={`/names/${previous.id}/`} aria-label={`Previous: ${previous.transliteration}`} className={heroArrow}>
              <ArrowLeft className="size-4" aria-hidden />
            </Link>
          ) : (
            <span className="size-10" />
          )}
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-card/80"
            role="progressbar"
            aria-label="Position in the 99 Names"
            aria-valuemin={1}
            aria-valuemax={TOTAL_NAMES}
            aria-valuenow={name.id}
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${(name.id / TOTAL_NAMES) * 100}%` }} />
          </div>
          {next ? (
            <Link href={`/names/${next.id}/`} aria-label={`Next: ${next.transliteration}`} className={heroArrow}>
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <span className="size-10" />
          )}
        </div>
      </section>

      <div className="space-y-5">
        {/* Meaning */}
        {showEn || showBn ? (
          <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs">
            <CardLabel>Meaning</CardLabel>
            <div className="mt-4 space-y-5">
              {showEn ? (
                <div className="flex gap-3">
                  <span className="mt-0.5 h-fit shrink-0 rounded-md bg-primary-soft px-1.5 py-0.5 text-[0.65rem] font-bold text-primary">
                    EN
                  </span>
                  <div>
                    <p className="font-semibold">{name.englishMeaning}</p>
                    <p className="mt-1.5 leading-relaxed text-muted-foreground">{name.shortExplanationEn}</p>
                  </div>
                </div>
              ) : null}
              {showEn && showBn ? <div className="h-px bg-border/60" /> : null}
              {showBn ? (
                <div className="flex gap-3" lang="bn">
                  <span className="mt-0.5 h-fit shrink-0 rounded-md bg-accent-soft px-1.5 py-0.5 font-bangla text-[0.7rem] font-bold text-accent">
                    বাংলা
                  </span>
                  <div>
                    <BanglaText className="block font-semibold">{name.banglaMeaning}</BanglaText>
                    <BanglaText className="mt-1 block leading-relaxed text-muted-foreground">
                      {name.shortExplanationBn}
                    </BanglaText>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Progress */}
        <section className="space-y-4 rounded-3xl border border-border/70 bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <CardLabel>Your progress</CardLabel>
            <StatusBadge status={status} />
          </div>
          <StatusSelector nameId={name.id} />
          <Button
            size="lg"
            variant={status === 'learned' ? 'secondary' : 'primary'}
            className="w-full rounded-2xl"
            onClick={() => void setStatus(name.id, status === 'learned' ? 'learning' : 'learned')}
          >
            <Check className={cn('size-5', status === 'learned' && 'animate-pop')} aria-hidden />
            {status === 'learned' ? 'Learned' : 'Mark as learned'}
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <FavoriteButton nameId={name.id} label={name.transliteration} variant="full" />
            <ButtonLink href={`/learn/?id=${name.id}`} variant="outline" className="rounded-2xl">
              <GraduationCap className="size-4" aria-hidden />
              Study steps
            </ButtonLink>
          </div>
          {record && (record.learnedAt || record.reviewCount > 0) ? (
            <p className="text-xs text-muted-foreground">
              {record.learnedAt && status === 'learned' ? `Learned on ${formatDate(record.learnedAt)}` : null}
              {record.learnedAt && status === 'learned' && record.reviewCount > 0 ? ' · ' : null}
              {record.reviewCount > 0 ? `Reviewed ${pluralize(record.reviewCount, 'time')}` : null}
            </p>
          ) : null}
        </section>

        {/* Neighbouring Names */}
        <nav aria-label="Previous and next name" className="grid grid-cols-2 gap-3">
          {previous ? (
            <Link
              href={`/names/${previous.id}/`}
              className="group flex min-h-20 items-center gap-2 rounded-3xl border border-border/70 bg-card px-3 shadow-xs transition hover:border-primary/30 active:scale-[0.99]"
            >
              <ChevronLeft className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted-foreground">Previous · {formatNumber(previous.id)}</span>
                <span className="block truncate text-sm font-semibold">{previous.transliteration}</span>
              </span>
              <ArabicText className="hidden shrink-0 text-2xl leading-none text-primary/80 sm:block">
                {previous.arabic}
              </ArabicText>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/names/${next.id}/`}
              className="group flex min-h-20 items-center justify-end gap-2 rounded-3xl border border-border/70 bg-card px-3 text-right shadow-xs transition hover:border-primary/30 active:scale-[0.99]"
            >
              <ArabicText className="hidden shrink-0 text-2xl leading-none text-primary/80 sm:block">
                {next.arabic}
              </ArabicText>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted-foreground">Next · {formatNumber(next.id)}</span>
                <span className="block truncate text-sm font-semibold">{next.transliteration}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          ) : null}
        </nav>
        <p className="text-center text-xs text-muted-foreground">
          <span className="md:hidden">Swipe left or right to move between Names</span>
          <span className="hidden md:inline">Use the ← → keys to move between Names</span>
        </p>
      </div>
    </article>
  )
}
