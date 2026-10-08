'use client'

import { ArrowRight, ChevronsDown, ListOrdered, Shuffle } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { ArabicText, BanglaText } from '@/components/common/localized-text'
import { FavoriteButton } from '@/components/names/favorite-button'
import { useAppData } from '@/components/providers/app-data-provider'
import { shuffle } from '@/lib/random'
import { allahNames } from '@/lib/storage/names'
import { formatNumber } from '@/lib/utils'

/**
 * Full-screen cards, one Name each. Swiping up or down snaps to the next or
 * previous card with native CSS scroll snapping, so it feels like the
 * platform on iOS and works with the keyboard and a mouse wheel too.
 */
export function NameReels() {
  const { settings } = useAppData()
  const showEn = settings.language !== 'bn'
  const showBn = settings.language !== 'en'
  const [order, setOrder] = useState(allahNames)
  const [shuffled, setShuffled] = useState(false)
  const scroller = useRef<HTMLElement>(null)

  const toggleOrder = () => {
    setOrder(shuffled ? allahNames : shuffle(allahNames))
    setShuffled((value) => !value)
    scroller.current?.scrollTo({ top: 0 })
  }

  return (
    <main
      id="main"
      ref={scroller}
      tabIndex={0}
      aria-label="Names, one per screen. Scroll or swipe up for the next."
      className="scrollbar-none fixed inset-0 snap-y snap-mandatory overflow-y-auto overscroll-contain focus:outline-none"
    >
      {order.map((name, index) => (
        <section
          key={name.id}
          aria-label={`${name.transliteration}, ${index + 1} of ${order.length}`}
          className="flex h-dvh snap-start snap-always flex-col px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(var(--nav-height)+env(safe-area-inset-bottom)+0.75rem)]"
        >
          <article className="pattern-stars relative flex flex-1 flex-col overflow-hidden rounded-[2rem] border border-border bg-gradient-to-b from-primary-soft to-card">
            <header className="relative z-10 flex items-center justify-between px-5 pt-4">
              <span className="rounded-full bg-card/80 px-3 py-1 text-xs font-semibold text-primary tabular-nums">
                {formatNumber(name.id)} / {allahNames.length}
              </span>
              <button
                type="button"
                onClick={toggleOrder}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {shuffled ? <ListOrdered className="size-4" aria-hidden /> : <Shuffle className="size-4" aria-hidden />}
                {shuffled ? 'In order' : 'Shuffle'}
              </button>
            </header>

            <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
              <ArabicText className="block text-[4.5rem] leading-[1.5]">{name.arabic}</ArabicText>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">{name.transliteration}</h2>
              {showEn ? <p className="mt-1 text-lg text-muted-foreground">{name.englishName}</p> : null}
              {showBn ? (
                <BanglaText className="mt-1 block text-lg">
                  {name.banglaName} · {name.banglaMeaning}
                </BanglaText>
              ) : null}
              <div className="mt-6 max-w-sm space-y-2 text-[0.95rem] leading-relaxed text-muted-foreground">
                {showEn ? <p>{name.shortExplanationEn}</p> : null}
                {showBn ? <BanglaText className="block">{name.shortExplanationBn}</BanglaText> : null}
              </div>
            </div>

            <footer className="relative z-10 flex items-end justify-between gap-3 px-5 pb-5">
              {index === 0 ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <ChevronsDown className="size-4 animate-bounce" aria-hidden />
                  Swipe up for the next Name
                </span>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-1 rounded-2xl bg-card/80 p-1">
                <FavoriteButton nameId={name.id} label={name.transliteration} />
                <Link
                  href={`/names/${name.id}/`}
                  aria-label={`Open ${name.transliteration}`}
                  className="grid size-11 place-items-center rounded-2xl text-muted-foreground hover:text-foreground"
                >
                  <ArrowRight className="size-5" aria-hidden />
                </Link>
              </div>
            </footer>
          </article>
        </section>
      ))}
    </main>
  )
}
