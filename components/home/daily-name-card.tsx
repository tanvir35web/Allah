'use client'

import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { ArabicText, BanglaText } from '@/components/common/localized-text'
import { Skeleton } from '@/components/common/loading-state'
import { FavoriteButton } from '@/components/names/favorite-button'
import { useAppData } from '@/components/providers/app-data-provider'
import { ButtonLink } from '@/components/ui/button'
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

  return (
    <section aria-labelledby="daily-name-title" aria-roledescription="carousel">
      {/* Header with clear category branding and smooth pagination controls */}
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden />
          <h2 id="daily-name-title" className="text-sm font-bold tracking-tight uppercase text-foreground">
            Featured Name of the Day
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => goTo(carousel.position - 1)}
            disabled={carousel.position === 0}
            aria-label="Previous Name"
            className="inline-flex size-8 items-center justify-center rounded-full border border-border/80 bg-card text-foreground hover:bg-muted shadow-2xs disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => goTo(carousel.position + 1)}
            aria-label="Next Name"
            className="inline-flex size-8 items-center justify-center rounded-full border border-border/80 bg-card text-foreground hover:bg-muted shadow-2xs transition-colors"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {name.transliteration}, {name.englishName}
      </p>

      {/*
        Bleeds to screen edges on mobile so neighbours peek and slide naturally;
        contained strictly within desktop column layout.
      */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="scrollbar-none -mx-4 md:mx-0 flex snap-x snap-mandatory scroll-px-4 md:scroll-px-0 gap-4 overflow-x-auto overscroll-x-contain px-4 md:px-0"
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

/** One card. Cards other than the current one are hidden from assistive tech and not focusable. */
function NameSlide({ name, language, current }: { name: AllahName; language: ContentLanguage; current: boolean }) {
  const showEn = language !== 'bn'
  const showBn = language !== 'en'

  return (
    <article
      className="pattern-stars relative flex w-full shrink-0 snap-start snap-always flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-primary-soft/20 p-6 sm:p-7 shadow-xs transition-shadow hover:shadow-sm"
      aria-roledescription="slide"
      aria-label={`${name.transliteration}, Name ${name.id} of 99`}
      aria-hidden={!current || undefined}
      inert={!current}
    >
      {/* Top Header inside card */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary tabular-nums">
          <Sparkles className="size-3" aria-hidden />
          Name {formatNumber(name.id)} of 99
        </span>
        <div className="flex items-center -mr-1">
          <FavoriteButton
            nameId={name.id}
            label={name.transliteration}
            className="size-8 min-h-0 rounded-full"
          />
        </div>
      </div>

      {/* Main Arabic & Transliteration */}
      <div className="my-5 flex flex-col items-center justify-center text-center">
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 mx-auto size-28 rounded-full bg-primary/10 blur-xl pointer-events-none" />
          <ArabicText className="relative block text-5xl sm:text-6xl font-arabic text-primary leading-[1.3] select-none drop-shadow-xs">
            {name.arabic}
          </ArabicText>
        </div>

        <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {name.transliteration}
        </h3>

        <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-sm sm:text-base">
          {showBn ? (
            <BanglaText className="font-bold text-foreground">
              {name.banglaName}
            </BanglaText>
          ) : null}
          {showBn && showEn ? <span className="text-muted-foreground/40">·</span> : null}
          {showEn ? (
            <span className="text-muted-foreground font-medium">
              {name.englishName}
            </span>
          ) : null}
        </div>

        <div className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
          {name.banglaMeaning}
        </div>

        {/* Short Wisdom / Reflection Snippet */}
        {(name.shortExplanationBn || name.shortExplanationEn) ? (
          <div className="mt-4 max-w-lg rounded-2xl border border-border/50 bg-background/60 dark:bg-muted/30 px-4 py-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed text-center">
            <p className="line-clamp-2">
              {language === 'bn' ? name.shortExplanationBn : name.shortExplanationEn}
            </p>
          </div>
        ) : null}
      </div>

      {/* Action CTA */}
      <div className="mt-2 flex items-center justify-center">
        <ButtonLink
          href={`/names/${name.id}/`}
          size="md"
          variant="primary"
          className="rounded-full px-6 font-semibold shadow-xs hover:shadow-md group"
          aria-label={`Learn more about ${name.transliteration}`}
        >
          <span>Explore Name Details</span>
          <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" aria-hidden />
        </ButtonLink>
      </div>
    </article>
  )
}
