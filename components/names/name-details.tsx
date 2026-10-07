'use client'

import { Check, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ArabicText, BanglaText } from '@/components/common/localized-text'
import { useAppData } from '@/components/providers/app-data-provider'
import { Button, ButtonLink } from '@/components/ui/button'
import { Card, SectionTitle } from '@/components/ui/card'
import { useSwipe } from '@/hooks/use-swipe'
import { getStatus } from '@/lib/progress'
import type { AllahName } from '@/lib/types'
import { cn, formatNumber } from '@/lib/utils'
import { FavoriteButton } from './favorite-button'
import { StatusSelector } from './status-selector'

interface NameDetailsProps {
  name: AllahName
  previous?: AllahName
  next?: AllahName
}

export function NameDetails({ name, previous, next }: NameDetailsProps) {
  const router = useRouter()
  const { progress, settings, setStatus } = useAppData()
  const status = getStatus(progress, name.id)
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

  return (
    <article {...swipe} className="space-y-5" aria-labelledby="name-title">
      <section className="pattern-stars overflow-hidden rounded-[2rem] border border-border bg-gradient-to-b from-primary-soft to-card px-6 pt-6 pb-8 text-center">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-card/80 px-3 py-1 text-xs font-semibold text-primary tabular-nums">
            {formatNumber(name.id)} / 99
          </span>
          <FavoriteButton nameId={name.id} label={name.transliteration} className="-mr-2" />
        </div>
        <ArabicText className="mt-2 block text-[4.5rem] leading-[1.7] sm:text-[5.5rem]">{name.arabic}</ArabicText>
        <h2 id="name-title" className="text-2xl font-bold tracking-tight">
          {name.transliteration}
        </h2>
        {showBn ? <BanglaText className="mt-0.5 block text-sm text-muted-foreground">{name.banglaName}</BanglaText> : null}
        {showEn ? <p className="mt-3 text-lg font-medium">{name.englishName}</p> : null}
        {showBn ? <BanglaText className="block text-lg font-medium">{name.banglaMeaning}</BanglaText> : null}
      </section>

      {showEn ? (
        <Card className="p-5">
          <SectionTitle>English</SectionTitle>
          <p className="mt-2 font-medium">{name.englishMeaning}</p>
          <p className="mt-2 leading-relaxed text-muted-foreground">{name.shortExplanationEn}</p>
        </Card>
      ) : null}

      {showBn ? (
        <Card className="p-5" lang="bn">
          <SectionTitle className="font-bangla tracking-normal normal-case">বাংলা</SectionTitle>
          <BanglaText className="mt-2 block font-medium">{name.banglaMeaning}</BanglaText>
          <BanglaText className="mt-1 block leading-relaxed text-muted-foreground">{name.shortExplanationBn}</BanglaText>
        </Card>
      ) : null}

      <Card className="space-y-4 p-5">
        <SectionTitle>Your progress</SectionTitle>
        <StatusSelector nameId={name.id} />
        <Button
          size="lg"
          variant={status === 'learned' ? 'secondary' : 'primary'}
          className="w-full"
          onClick={() => void setStatus(name.id, status === 'learned' ? 'learning' : 'learned')}
        >
          <Check className={cn('size-5', status === 'learned' && 'animate-pop')} aria-hidden />
          {status === 'learned' ? 'Learned' : 'Mark as learned'}
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <FavoriteButton nameId={name.id} label={name.transliteration} variant="full" />
          <ButtonLink href={`/learn/?id=${name.id}`} variant="outline">
            <GraduationCap className="size-4" aria-hidden />
            Study steps
          </ButtonLink>
        </div>
      </Card>

      <nav aria-label="Previous and next name" className="grid grid-cols-2 gap-3">
        {previous ? (
          <Link
            href={`/names/${previous.id}/`}
            className="flex min-h-16 items-center gap-2 rounded-2xl border border-border bg-card px-3 active:scale-[0.99]"
          >
            <ChevronLeft className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Previous</span>
              <span className="block truncate text-sm font-medium">{previous.transliteration}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/names/${next.id}/`}
            className="flex min-h-16 items-center justify-end gap-2 rounded-2xl border border-border bg-card px-3 text-right active:scale-[0.99]"
          >
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Next</span>
              <span className="block truncate text-sm font-medium">{next.transliteration}</span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        ) : null}
      </nav>
      <p className="text-center text-xs text-muted-foreground">Swipe left or right to move between Names</p>
    </article>
  )
}
