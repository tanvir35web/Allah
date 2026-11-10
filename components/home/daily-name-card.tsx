'use client'

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { ArabicText } from '@/components/common/localized-text'
import { Skeleton } from '@/components/common/loading-state'
import { FavoriteButton } from '@/components/names/favorite-button'
import { useAppData } from '@/components/providers/app-data-provider'
import { ButtonLink } from '@/components/ui/button'
import { pickRandomName } from '@/lib/daily-name'
import { allahNames } from '@/lib/storage/names'
import type { AllahName } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

const LAST_NAME_KEY = 'asma-last-daily-name'
const SLIDE_GAP = 16

interface Carousel {
  names: readonly AllahName[]
  position: number
}

const history: AllahName[] = []
let position = 0
let snapshot: Carousel | null = null
const listeners = new Set<() => void>()

function remember(name: AllahName) {
  try {
    sessionStorage.setItem(LAST_NAME_KEY, String(name.id))
  } catch {}
}

function getCarousel(): Carousel {
  if (snapshot) return snapshot
  if (history.length === 0) {
    let previousId: number | undefined
    try {
      previousId = Number(sessionStorage.getItem(LAST_NAME_KEY)) || undefined
    } catch {}
    const name = pickRandomName(allahNames, previousId)
    history.push(name)
    remember(name)
  }
  if (position === history.length - 1) history.push(pickRandomName(allahNames, history[position]!.id))
  snapshot = { names: [...history], position }
  return snapshot
}

function setPosition(index: number) {
  const next = Math.max(0, Math.min(index, history.length - 1))
  if (next === position) return
  position = next
  snapshot = null
  remember(getCarousel().names[position]!)
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Clean, minimalist Daily Name hero card aligned perfectly with neighbouring cards. */
export function DailyNameCard() {
  const carousel = useSyncExternalStore(subscribe, getCarousel, () => null)
  const { settings } = useAppData()
  const trackRef = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const mounted = carousel !== null

  const stride = () => {
    const first = trackRef.current?.firstElementChild
    return first instanceof HTMLElement ? first.offsetWidth + SLIDE_GAP : 0
  }

  useLayoutEffect(() => {
    const track = trackRef.current
    if (mounted && track) track.scrollLeft = position * stride()
  }, [mounted])

  if (!carousel) return <Skeleton className="h-80 rounded-3xl" />

  const name = carousel.names[carousel.position]!

  const onScroll = () => {
    if (frame.current) return
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      const track = trackRef.current
      const step = stride()
      if (track && step > 0) setPosition(Math.round(track.scrollLeft / step))
    })
  }

  const goTo = (index: number) => {
    trackRef.current?.scrollTo({ left: index * stride(), behavior: reducedMotion() ? 'instant' : 'smooth' })
  }

  return (
    <section aria-labelledby="daily-name-title" aria-roledescription="carousel" className="flex flex-col">
      {/* Clean header with fixed h-7 height for pixel-perfect vertical alignment */}
      <div className="mb-2 flex items-center justify-between px-1 h-7">
        <h2 id="daily-name-title" className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          Name of the Day
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => goTo(carousel.position - 1)}
            disabled={carousel.position === 0}
            aria-label="Previous Name"
            className="inline-flex size-7 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => goTo(carousel.position + 1)}
            aria-label="Next Name"
            className="inline-flex size-7 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {name.transliteration}, {name.englishName}
      </p>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="scrollbar-none -mx-4 md:mx-0 flex flex-1 snap-x snap-mandatory scroll-px-4 md:scroll-px-0 gap-4 overflow-x-auto overscroll-x-contain px-4 md:px-0"
      >
        {carousel.names.map((slideName, index) => (
          <NameSlide
            key={index}
            name={slideName}
            language={settings.language}
            current={index === carousel.position}
          />
        ))}
      </div>
    </section>
  )
}

function NameSlide({ name, language, current }: { name: AllahName; language: string; current: boolean }) {
  const showBn = language === 'bn'

  return (
    <article
      className="relative flex w-full h-full shrink-0 snap-start snap-always flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-xs hover:border-primary/30 transition-all duration-200"
      aria-roledescription="slide"
      aria-label={`${name.transliteration}, Name ${name.id} of 99`}
      aria-hidden={!current || undefined}
      inert={!current}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary tabular-nums">
          #{formatNumber(name.id)} of 99
        </span>
        <FavoriteButton
          nameId={name.id}
          label={name.transliteration}
          className="size-7 min-h-0 rounded-full"
        />
      </div>

      {/* Center Calligraphy & Meaning */}
      <div className="my-auto py-3 flex flex-col items-center justify-center text-center">
        <ArabicText className="block text-5xl sm:text-6xl font-arabic text-primary leading-tight select-none">
          {name.arabic}
        </ArabicText>

        <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
          {name.transliteration}
        </h3>

        <p className="mt-1 text-sm sm:text-base font-medium text-muted-foreground">
          {showBn ? `${name.banglaName} · ${name.banglaMeaning}` : `${name.englishName} · ${name.banglaMeaning}`}
        </p>
      </div>

      {/* Full-width action button matching LearningHubCard */}
      <div>
        <ButtonLink
          href={`/names/${name.id}/`}
          size="md"
          variant="outline"
          className="w-full rounded-2xl font-bold shadow-xs hover:bg-muted group flex items-center justify-between px-5 transition-all"
          aria-label={`Explore details for ${name.transliteration}`}
        >
          <span>Explore Details</span>
          <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
        </ButtonLink>
      </div>
    </article>
  )
}
