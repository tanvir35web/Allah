'use client'

import { ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'
import { ArabicText } from '@/components/common/localized-text'
import { useAppData } from '@/components/providers/app-data-provider'
import { ButtonLink } from '@/components/ui/button'
import { allahNames } from '@/lib/storage/names'
import type { AllahName } from '@/lib/types'

/** How many favourite Names the home card shows before "View all". */
const SHOWN = 4

/** The Names the user has starred, so they can return to them from home. */
export function FavoritesCard() {
  const { favorites } = useAppData()
  // Most recently starred first.
  const names = [...favorites]
    .reverse()
    .map((id) => allahNames.find((name) => name.id === id))
    .filter((name): name is AllahName => Boolean(name))
  const shown = names.slice(0, SHOWN)

  return (
    <section aria-labelledby="favorites-title" className="flex flex-col">
      <div className="mb-2 flex h-7 items-center justify-between px-1">
        <h2 id="favorites-title" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Favorite Names
        </h2>
        {names.length ? (
          <Link
            href="/favorites/"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all ({names.length}) →
          </Link>
        ) : null}
      </div>

      <article className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-xs transition-all duration-200 hover:border-primary/30">
        {shown.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {shown.map((name) => (
              <li key={name.id}>
                <Link
                  href={`/names/${name.id}/`}
                  className="group flex h-full flex-col items-center gap-1 rounded-2xl border border-border/60 bg-muted/30 px-3 py-4 text-center transition-colors hover:border-primary/40 hover:bg-primary-soft"
                >
                  <ArabicText className="block text-3xl leading-[1.6] text-primary transition-transform group-hover:scale-105">
                    {name.arabic}
                  </ArabicText>
                  <span className="block w-full truncate text-sm font-bold text-foreground">{name.transliteration}</span>
                  <span className="block w-full truncate text-xs text-muted-foreground">{name.englishName}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2 text-center sm:flex-row sm:text-left">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/10 text-accent">
              <Star className="size-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold tracking-tight text-foreground">No favorites yet</p>
              <p className="text-xs text-muted-foreground">
                Tap the star on any Name to keep it here for quick reflection.
              </p>
            </div>
            <ButtonLink
              href="/names/"
              variant="outline"
              size="md"
              className="group flex shrink-0 items-center gap-2 rounded-2xl px-5 font-bold shadow-xs hover:bg-muted"
            >
              <span>Browse Names</span>
              <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
            </ButtonLink>
          </div>
        )}
      </article>
    </section>
  )
}
