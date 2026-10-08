'use client'

import { Shuffle } from 'lucide-react'
import { useRef, useSyncExternalStore } from 'react'
import { ArabicText, BanglaText } from '@/components/common/localized-text'
import { Skeleton } from '@/components/common/loading-state'
import { useAppData } from '@/components/providers/app-data-provider'
import { Button, ButtonLink } from '@/components/ui/button'
import { useSlideSwipe } from '@/hooks/use-slide-swipe'
import { pickRandomName } from '@/lib/daily-name'
import { allahNames } from '@/lib/storage/names'
import type { AllahName, ContentLanguage } from '@/lib/types'
import { cn, formatNumber } from '@/lib/utils'

const LAST_NAME_KEY = 'asma-last-daily-name'
/** Space between the card and its neighbours, in px (`gap-4`). */
const SLIDE_GAP = 16

interface Slides {
  previous?: AllahName
  current: AllahName
  next: AllahName
}

/**
 * Names shown on the card since this page load, and which one is showing.
 * The next random Name is picked ahead of time so it is already rendered
 * beside the card while swiping. A reload starts afresh with a new Name.
 */
const history: AllahName[] = []
let position = 0
let slides: Slides | null = null
const listeners = new Set<() => void>()

function remember(name: AllahName) {
  try {
    sessionStorage.setItem(LAST_NAME_KEY, String(name.id))
  } catch {}
}

function getSlides(): Slides {
  if (slides) return slides
  if (history.length === 0) {
    let previousId: number | undefined
    try {
      previousId = Number(sessionStorage.getItem(LAST_NAME_KEY)) || undefined
    } catch {}
    const name = pickRandomName(allahNames, previousId)
    history.push(name)
    remember(name)
  }
  const current = history[position]!
  if (position === history.length - 1) history.push(pickRandomName(allahNames, current.id))
  slides = { previous: history[position - 1], current, next: history[position + 1]! }
  return slides
}

function move(step: 1 | -1) {
  position += step
  slides = null
  remember(getSlides().current)
  listeners.forEach((listener) => listener())
}

/** Forward to the next Name: one seen before if we went back, else the one picked in advance. */
function showNext() {
  move(1)
}

function showPrevious() {
  if (position > 0) move(-1)
}

function canGoBack() {
  return position > 0
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** "Name of the Day" — a random Name on every page load; swipe the card for another. Fully offline. */
export function DailyNameCard() {
  // `null` during prerendering/hydration: pages are statically exported.
  const view = useSyncExternalStore(subscribe, getSlides, () => null)
  const { settings } = useAppData()
  const trackRef = useRef<HTMLDivElement>(null)
  const { handlers, slideNext } = useSlideSwipe(trackRef, {
    onNext: showNext,
    onPrevious: showPrevious,
    canGoBack,
    gap: SLIDE_GAP,
  })

  if (!view) return <Skeleton className="h-96 rounded-3xl" />

  return (
    <section aria-labelledby="daily-name-title">
      <div className="mb-3 flex items-end justify-between px-1">
        <h2 id="daily-name-title" className="text-[1.375rem] leading-tight font-bold tracking-tight">
          Name of the Day
        </h2>
        <span className="text-[0.9375rem] text-muted-foreground tabular-nums">
          {formatNumber(view.current.id)} of 99
        </span>
      </div>
      {/* Clips the neighbouring cards at the screen edges. */}
      <div className="-mx-4 overflow-x-clip px-4">
        <div ref={trackRef} className="relative touch-pan-y select-none" {...handlers}>
          <NameSlide name={view.current} language={settings.language} onShuffle={slideNext} />
          {/* Neighbours sit either side, already rendered, and match the current card's height. */}
          {view.previous ? (
            <NameSlide
              name={view.previous}
              language={settings.language}
              className="absolute inset-y-0 right-[calc(100%+1rem)] w-full"
            />
          ) : null}
          <NameSlide
            name={view.next}
            language={settings.language}
            className="absolute inset-y-0 left-[calc(100%+1rem)] w-full"
          />
        </div>
      </div>
    </section>
  )
}

/** One card. Without `onShuffle` it is a neighbour: hidden from assistive tech and not focusable. */
function NameSlide({
  name,
  language,
  onShuffle,
  className,
}: {
  name: AllahName
  language: ContentLanguage
  onShuffle?: () => void
  className?: string
}) {
  const neighbour = !onShuffle
  return (
    <div
      className={cn(
        'pattern-stars flex flex-col overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-primary-soft to-card px-6 pt-6 pb-5 text-center',
        className,
      )}
      aria-hidden={neighbour || undefined}
      inert={neighbour}
    >
      <div className="flex-1" aria-live={neighbour ? undefined : 'polite'}>
        <ArabicText className="block text-[3.75rem] leading-[1.75]">{name.arabic}</ArabicText>
        <p className="text-[1.375rem] font-bold tracking-tight">{name.transliteration}</p>
        {language !== 'bn' ? <p className="mt-0.5 text-[1.0625rem] text-muted-foreground">{name.englishName}</p> : null}
        {language !== 'en' ? (
          <BanglaText className="mt-0.5 block text-[1.0625rem] text-muted-foreground">{name.banglaMeaning}</BanglaText>
        ) : null}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <ButtonLink href={`/names/${name.id}/`} className="flex-1 rounded-xl">
          Learn More
        </ButtonLink>
        {/* Swiping left or right on the card does the same. */}
        <Button variant="secondary" size="icon" className="rounded-full" onClick={onShuffle} aria-label="Show another Name">
          <Shuffle className="size-5" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
