'use client'

import { ArrowRight, ChevronDown, ChevronUp, ChevronsDown, ListOrdered, Shuffle } from 'lucide-react'
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
 * On desktop, it is centered in a focused reel frame with arrow navigation.
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

  const scrollToCard = (i: number) => {
    if (!scroller.current) return
    const sections = scroller.current.querySelectorAll('section')
    sections[i]?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main
      id="main"
      ref={scroller}
      tabIndex={0}
      aria-label="Names, one per screen. Scroll or swipe up for the next."
      className="scrollbar-none fixed inset-0 md:left-64 snap-y snap-mandatory overflow-y-auto overscroll-contain focus:outline-none"
    >
      {order.map((name, index) => (
        <section
          key={name.id}
          aria-label={`${name.transliteration}, ${index + 1} of ${order.length}`}
          className="flex h-dvh snap-start snap-always flex-col items-center justify-center px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(var(--nav-height)+env(safe-area-inset-bottom)+0.75rem)] md:py-6"
        >
          <div className="relative flex h-full max-h-[840px] w-full max-w-lg items-center justify-center">
            <article className="pattern-stars relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-border bg-gradient-to-b from-primary-soft to-card shadow-lg">
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
                    Swipe or use arrows
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

            {/* Desktop floating navigation controls */}
            <div className="hidden lg:flex absolute -right-16 flex-col gap-3">
              <button
                type="button"
                onClick={() => scrollToCard(index - 1)}
                disabled={index === 0}
                aria-label="Previous Name"
                title="Previous Name (Up arrow)"
                className="grid size-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:bg-muted disabled:opacity-30 disabled:pointer-events-none active:scale-95"
              >
                <ChevronUp className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollToCard(index + 1)}
                disabled={index === order.length - 1}
                aria-label="Next Name"
                title="Next Name (Down arrow)"
                className="grid size-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:bg-muted disabled:opacity-30 disabled:pointer-events-none active:scale-95"
              >
                <ChevronDown className="size-5" />
              </button>
            </div>
          </div>
        </section>
      ))}
    </main>
  )
}
