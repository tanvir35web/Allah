'use client'

import { ArrowRight, Moon, Shuffle } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { ArabicText, BanglaText } from '@/components/common/localized-text'
import { Skeleton } from '@/components/common/loading-state'
import { useAppData } from '@/components/providers/app-data-provider'
import { Button, ButtonLink } from '@/components/ui/button'
import { useSwipe } from '@/hooks/use-swipe'
import { pickRandomName } from '@/lib/daily-name'
import { allahNames } from '@/lib/storage/names'
import type { AllahName } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

const LAST_NAME_KEY = 'asma-last-daily-name'

/**
 * Names shown on the card since this page load, and which one is showing.
 * A reload starts afresh with a new Name.
 */
const history: AllahName[] = []
let position = 0
const listeners = new Set<() => void>()

function remember(name: AllahName) {
  try {
    sessionStorage.setItem(LAST_NAME_KEY, String(name.id))
  } catch {}
}

function getCurrentName(): AllahName {
  if (history.length === 0) {
    let previousId: number | undefined
    try {
      previousId = Number(sessionStorage.getItem(LAST_NAME_KEY)) || undefined
    } catch {}
    const name = pickRandomName(allahNames, previousId)
    history.push(name)
    remember(name)
  }
  return history[position]!
}

/** Forward to the next Name: one seen before if we went back, else a new random one. */
function showNext() {
  if (position === history.length - 1) history.push(pickRandomName(allahNames, getCurrentName().id))
  position += 1
  remember(getCurrentName())
  listeners.forEach((listener) => listener())
}

function showPrevious() {
  if (position === 0) return
  position -= 1
  remember(getCurrentName())
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** "Name of the Day" — a random Name on every page load; swipe for another. Fully offline. */
export function DailyNameCard() {
  // `null` during prerendering/hydration: pages are statically exported.
  const name = useSyncExternalStore(subscribe, getCurrentName, () => null)
  const { settings } = useAppData()
  const swipe = useSwipe({ onSwipeLeft: showNext, onSwipeRight: showPrevious })

  if (!name) return <Skeleton className="h-80 rounded-[2rem]" />

  return (
    <section
      aria-labelledby="daily-name-title"
      className="pattern-stars relative touch-pan-y overflow-hidden rounded-[2rem] border border-border bg-gradient-to-b from-primary-soft to-card p-6 text-center select-none"
      {...swipe}
    >
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <h2 id="daily-name-title" className="inline-flex items-center gap-1.5 tracking-[0.12em] uppercase">
          <Moon className="size-3.5" aria-hidden />
          Name of the Day
        </h2>
        <span className="tabular-nums">{formatNumber(name.id)} / 99</span>
      </div>
      <div key={name.id} className="animate-fade" aria-live="polite">
        <ArabicText className="mt-4 block text-[3.75rem] leading-[1.75]">{name.arabic}</ArabicText>
        <p className="text-xl font-semibold">{name.transliteration}</p>
        {settings.language !== 'bn' ? <p className="mt-1 text-muted-foreground">{name.englishName}</p> : null}
        {settings.language !== 'en' ? (
          <BanglaText className="mt-0.5 block text-muted-foreground">{name.banglaMeaning}</BanglaText>
        ) : null}
      </div>
      <div className="mt-5 flex items-center justify-center gap-2">
        <ButtonLink href={`/names/${name.id}/`} variant="outline">
          Learn more
          <ArrowRight className="size-4" aria-hidden />
        </ButtonLink>
        <Button variant="outline" onClick={showNext}>
          <Shuffle className="size-4" aria-hidden />
          Next
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Swipe left for a new Name, right to go back</p>
    </section>
  )
}
