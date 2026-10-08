'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
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
      <div className="mb-2 flex min-h-11 items-center justify-between gap-3 px-1">
        <h2 id="daily-name-title" className="text-[1.375rem] leading-tight font-bold tracking-tight">
          Name of the Day
        </h2>
        <div className="-mr-1 flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full"
            onClick={() => goTo(carousel.position - 1)}
            disabled={carousel.position === 0}
            aria-label="Previous Name"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full"
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
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4"
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
      className="pattern-stars flex w-full shrink-0 snap-start snap-always flex-col rounded-3xl border border-border bg-gradient-to-b from-primary-soft to-card px-6 pt-5 pb-6 text-center"
      aria-roledescription="slide"
      aria-label={`${name.transliteration}, Name ${name.id} of 99`}
      aria-hidden={!current || undefined}
      inert={!current}
    >
      <p className="text-[0.8125rem] font-semibold tracking-wide text-primary uppercase tabular-nums">
        Name {formatNumber(name.id)} of 99
      </p>
      <div className="flex flex-1 flex-col justify-center py-2">
        <ArabicText className="block text-[3.75rem] leading-[1.75]">{name.arabic}</ArabicText>
        <p className="text-[1.5rem] leading-tight font-bold tracking-tight">{name.transliteration}</p>
        {language !== 'bn' ? <p className="mt-1 text-[1.0625rem] text-muted-foreground">{name.englishName}</p> : null}
        {language !== 'en' ? (
          <BanglaText className="mt-0.5 block text-[1.0625rem] text-muted-foreground">{name.banglaMeaning}</BanglaText>
        ) : null}
      </div>
      <ButtonLink
        href={`/names/${name.id}/`}
        size="lg"
        className="mt-4 w-full rounded-xl"
        aria-label={`Learn more about ${name.transliteration}`}
      >
        Learn More
      </ButtonLink>
    </article>
  )
}
