'use client'

import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { ArabicText, BanglaText } from '@/components/common/localized-text'
import { Skeleton } from '@/components/common/loading-state'
import { useAppData } from '@/components/providers/app-data-provider'
import { Button, ButtonLink } from '@/components/ui/button'
import { pickRandomName } from '@/lib/daily-name'
import { allahNames } from '@/lib/storage/names'
import type { AllahName, ContentLanguage } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

const LAST_NAME_KEY = 'asma-last-daily-name'
/** Space between cards, in px (`gap-4`). */
const SLIDE_GAP = 16

interface Carousel {
  names: readonly AllahName[]
  position: number
}

/**
 * Names shown on the card since this page load, and which one is showing.
 * There is always one random Name ahead of the current one, already rendered,
 * so swiping never reveals an empty space. A reload starts afresh.
 */
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

/** Called as the track scrolls: the card nearest the start edge is the current one. */
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

/**
 * "Name of the Day": a random Name on every page load, in a native
 * scroll-snap carousel. The browser does the dragging, momentum and snapping
 * itself, off the main thread, so it feels like a system pager. Swipe or use
 * the arrows for another Name. Fully offline.
 */
export function DailyNameCard() {
  // `null` during prerendering/hydration: pages are statically exported.
  const carousel = useSyncExternalStore(subscribe, getCarousel, () => null)
  const { settings } = useAppData()
  const trackRef = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const mounted = carousel !== null

  /** Distance between the starts of two neighbouring cards. */
  const stride = () => {
    const first = trackRef.current?.firstElementChild
    return first instanceof HTMLElement ? first.offsetWidth + SLIDE_GAP : 0
  }

  // Coming back to Home: show the Name that was showing, without animating to it.
  useLayoutEffect(() => {
    const track = trackRef.current
    if (mounted && track) track.scrollLeft = position * stride()
  }, [mounted])

  if (!carousel) return <Skeleton className="h-96 rounded-3xl" />

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

  // A WAI-ARIA carousel: the controls sit outside the cards, and every swipe
  // has a button equivalent (WCAG 2.5.1).
  return (
    <section aria-labelledby="daily-name-title" aria-roledescription="carousel">
      <div className="mb-3 flex min-h-11 items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <h2 id="daily-name-title" className="text-[1.375rem] leading-tight font-bold tracking-tight">
            Name of the Day
          </h2>
        </div>
        <div className="-mr-1 flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-full border-border/80 bg-card hover:bg-muted"
            onClick={() => goTo(carousel.position - 1)}
            disabled={carousel.position === 0}
            aria-label="Previous Name"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-full border-border/80 bg-card hover:bg-muted"
            onClick={() => goTo(carousel.position + 1)}
            aria-label="Next Name"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {name.transliteration}, {name.englishName}
      </p>
      {/*
        Bleeds to the screen edges so neighbours slide in from there; scroll
        padding keeps the snapped card aligned with the page gutter. Cards
        stretch to the tallest, so the height never jumps.
      */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="scrollbar-none -mx-4 md:mx-0 flex snap-x snap-mandatory scroll-px-4 md:scroll-px-0 gap-4 overflow-x-auto overscroll-x-contain px-4 md:px-0"
      >
        {carousel.names.map((slideName, index) => (
          <NameSlide
            // Index, not Name id: the same Name may come up twice.
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

/** One card. Cards other than the current one are hidden from assistive tech and not focusable. */
function NameSlide({ name, language, current }: { name: AllahName; language: ContentLanguage; current: boolean }) {
  return (
    <article
      className="pattern-stars relative flex w-full shrink-0 snap-start snap-always flex-col overflow-hidden rounded-[2.25rem] border border-border/80 bg-gradient-to-b from-primary-soft/40 via-card to-card p-6 md:p-8 text-center shadow-[0_2px_12px_rgb(0_0_0/0.04)] transition-all hover:shadow-md"
      aria-roledescription="slide"
      aria-label={`${name.transliteration}, Name ${name.id} of 99`}
      aria-hidden={!current || undefined}
      inert={!current}
    >
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary tabular-nums">
          Name {formatNumber(name.id)} of 99
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-4">
        {/* Subtle decorative halo medallion behind Arabic calligraphy */}
        <div className="relative mx-auto my-2 flex size-36 md:size-44 items-center justify-center rounded-full bg-gradient-to-b from-primary/10 via-primary-soft/30 to-transparent ring-1 ring-primary/20 shadow-inner">
          <ArabicText className="block text-[3.75rem] md:text-[4.25rem] leading-none text-arabic">
            {name.arabic}
          </ArabicText>
        </div>

        <h3 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {name.transliteration}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 text-sm md:text-base text-muted-foreground">
          {language !== 'bn' ? <span>{name.englishName}</span> : null}
          {language === 'both' ? <span className="opacity-40" aria-hidden>·</span> : null}
          {language !== 'en' ? (
            <BanglaText className="block font-medium">{name.banglaMeaning}</BanglaText>
          ) : null}
        </div>

        <p className="mt-3 max-w-md text-xs md:text-sm text-muted-foreground/80 line-clamp-2">
          {language === 'bn' ? name.shortExplanationBn : name.shortExplanationEn}
        </p>
      </div>

      <ButtonLink
        href={`/names/${name.id}/`}
        size="lg"
        className="mt-3 w-full rounded-2xl shadow-xs group"
        aria-label={`Learn more about ${name.transliteration}`}
      >
        <span>Learn More</span>
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
      </ButtonLink>
    </article>
  )
}
