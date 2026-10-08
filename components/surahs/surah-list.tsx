'use client'

import { ArrowDown01, ArrowUp10, Search, SearchX, X } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { EmptyState } from '@/components/common/empty-state'
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
  const { settings } = useAppData()
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

  return (
    <div>
      <div className="sticky top-[env(safe-area-inset-top)] z-20 -mx-4 space-y-3 bg-background/90 px-4 pt-2 pb-3 backdrop-blur-xl">
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
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filter surahs">
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
        <ul className="grid gap-3 md:grid-cols-2">
          {visible.map((surah) => (
            <li key={surah.id}>
              <SurahCard surah={surah} language={settings.language} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
