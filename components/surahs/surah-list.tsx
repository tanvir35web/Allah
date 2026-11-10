'use client'

import { ArrowDown01, ArrowRight, ArrowUp10, Bookmark, BookOpenText, Search, SearchX, X } from 'lucide-react'
import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import { EmptyState } from '@/components/common/empty-state'
import { LinkPending } from '@/components/common/link-pending'
import { useAppData } from '@/components/providers/app-data-provider'
import { Button } from '@/components/ui/button'
import { matchesSurahQuery, type SurahSummary } from '@/lib/surah-search'
import { cn } from '@/lib/utils'
import { SurahCard } from './surah-card'

type Filter = 'all' | 'meccan' | 'medinan'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'meccan', label: 'Meccan' },
  { value: 'medinan', label: 'Medinan' },
]

interface SurahListProps {
  surahs: readonly SurahSummary[]
}

export function SurahList({ surahs }: SurahListProps) {
  const { settings, surahReadings } = useAppData()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [descending, setDescending] = useState(false)
  const deferredQuery = useDeferredValue(query)

  const visible = useMemo(() => {
    const filtered = surahs.filter(
      (surah) => matchesSurahQuery(surah, deferredQuery) && (filter === 'all' || surah.revelation === filter),
    )
    return descending ? [...filtered].reverse() : filtered
  }, [surahs, deferredQuery, filter, descending])

  const counts: Record<Filter, number> = {
    all: surahs.length,
    meccan: surahs.filter((surah) => surah.revelation === 'meccan').length,
    medinan: surahs.filter((surah) => surah.revelation === 'medinan').length,
  }
  // The surah read or bookmarked most recently, to continue from.
  const last = Object.values(surahReadings)
    .filter((reading) => reading.seconds > 0 || reading.bookmarkAyah)
    .sort((a, b) => b.lastReadAt.localeCompare(a.lastReadAt))[0]
  const lastSurah = last ? surahs.find((surah) => surah.id === last.surahId) : undefined

  return (
    <div>
      {lastSurah && last ? (
        <Link
          href={`/surahs/${lastSurah.id}/${last.bookmarkAyah ? `#ayah-${last.bookmarkAyah}` : ''}`}
          prefetch={false}
          className="pattern-stars group relative mb-5 flex items-center gap-3 overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary-soft to-card p-4 shadow-xs transition-[border-color,box-shadow] hover:border-primary/45 hover:shadow-md sm:gap-4 sm:p-5 md:p-6"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm sm:size-12">
            {last.bookmarkAyah ? (
              <Bookmark className="size-5 fill-current" aria-hidden />
            ) : (
              <BookOpenText className="size-5" aria-hidden />
            )}
          </span>
          <div className="relative min-w-0 flex-1">
            <p className="text-xs font-bold tracking-wider text-primary uppercase">Continue reading</p>
            <p className="truncate text-base font-bold tracking-tight sm:text-lg md:text-xl">
              {lastSurah.transliteration}
              <span className="hidden font-medium text-muted-foreground sm:inline"> · Surah {lastSurah.id}</span>
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {last.bookmarkAyah
                ? `Bookmarked at Ayah ${last.bookmarkAyah} of ${lastSurah.ayahCount}`
                : `${lastSurah.ayahCount} ayahs · ${lastSurah.englishMeaning}`}
            </p>
          </div>
          <span
            lang="ar"
            dir="rtl"
            className="relative hidden shrink-0 font-quran text-4xl leading-[1.6] text-arabic sm:block"
          >
            {lastSurah.arabicName}
          </span>
          <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-card text-primary shadow-xs transition-transform group-hover:translate-x-0.5 sm:size-10">
            <LinkPending>
              <ArrowRight className="size-4" aria-hidden />
            </LinkPending>
          </span>
        </Link>
      ) : null}

      <div className="sticky top-[env(safe-area-inset-top)] z-20 -mx-4 md:mx-0 space-y-3 bg-background/90 px-4 md:px-0 pt-2 pb-3 backdrop-blur-xl md:rounded-2xl">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Search surahs</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search surah, meaning or number"
              className="h-11 w-full rounded-2xl border border-border bg-card pr-10 pl-10 text-base placeholder:text-muted-foreground/70 focus:border-primary/40 focus:outline-none focus-visible:outline-2"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-muted-foreground"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </label>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDescending((value) => !value)}
            aria-label={descending ? 'Sort by number, ascending' : 'Sort by number, descending'}
            title="Sort by number"
          >
            {descending ? <ArrowUp10 className="size-5" aria-hidden /> : <ArrowDown01 className="size-5" aria-hidden />}
          </Button>
        </div>
        <div className="scrollbar-none -mx-4 md:mx-0 flex gap-2 overflow-x-auto px-4 md:px-0" role="group" aria-label="Filter surahs">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                'min-h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors',
                filter === option.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
              <span
                className={cn(
                  'ml-1.5 rounded-full px-1.5 text-xs tabular-nums',
                  filter === option.value ? 'bg-primary-foreground/20' : 'bg-muted',
                )}
              >
                {counts[option.value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {visible.length} surahs shown
      </p>

      {visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No surahs found"
          description={query ? `Nothing matches “${query}”.` : 'No surahs match this filter.'}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('')
                setFilter('all')
              }}
            >
              Show all surahs
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {visible.map((surah) => {
            const reading = surahReadings[surah.id]
            return (
              <li key={surah.id} className="min-w-0">
                <SurahCard
                  surah={surah}
                  language={settings.language}
                  bookmarkAyah={reading?.bookmarkAyah}
                  read={(reading?.seconds ?? 0) > 0}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
