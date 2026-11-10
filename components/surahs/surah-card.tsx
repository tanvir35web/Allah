import { Bookmark, Check } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'
import { LinkPending } from '@/components/common/link-pending'
import { BanglaText } from '@/components/common/localized-text'
import { revelationLabel, toBanglaDigits, type SurahSummary } from '@/lib/surah-search'
import type { ContentLanguage } from '@/lib/types'
import { cn, formatNumber } from '@/lib/utils'

/** The card shows the name alone, like a Name card; the reader keeps the full "سُورَةُ …" title. */
const SURAH_PREFIX = /^سُورَةُ /

interface SurahCardProps {
  surah: SurahSummary
  language: ContentLanguage
  /** The ayah bookmarked in this surah, if any. */
  bookmarkAyah?: number
  /** Whether any reading time has been recorded for this surah. */
  read?: boolean
}

/** The surah number inside an eight-pointed star (Rub el Hizb). */
function StarNumber({ id }: { id: number }) {
  return (
    <span className="relative grid size-12 shrink-0 place-items-center text-primary">
      <svg viewBox="0 0 48 48" className="absolute inset-0 size-full" aria-hidden>
        <g className="fill-primary-soft stroke-primary/35" strokeWidth="1.5" strokeLinejoin="round">
          <rect x="10" y="10" width="28" height="28" rx="3" />
          <rect x="10" y="10" width="28" height="28" rx="3" transform="rotate(45 24 24)" />
        </g>
      </svg>
      <span className="relative text-xs font-bold tabular-nums">
        <LinkPending className="size-3.5">{formatNumber(id)}</LinkPending>
      </span>
    </span>
  )
}

/** One surah in the list. Memoised: the list re-renders on every keystroke. */
export const SurahCard = memo(function SurahCard({ surah, language, bookmarkAyah, read }: SurahCardProps) {
  const showEn = language !== 'bn'
  const showBn = language !== 'en'
  const meccan = surah.revelation === 'meccan'
  return (
    // No prefetch: each surah's page data is up to ~400 KB, and prefetching
    // every card that scrolls into view queues the tapped surah behind them.
    <Link
      href={`/surahs/${surah.id}/${bookmarkAyah ? `#ayah-${bookmarkAyah}` : ''}`}
      prefetch={false}
      className={cn(
        'group flex h-full flex-col gap-2.5 rounded-3xl border bg-card p-4 shadow-xs transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md active:scale-[0.99]',
        bookmarkAyah ? 'border-primary/40' : 'border-border/70',
      )}
    >
      {/* Row 1: number, names, Arabic name. */}
      <div className="flex items-center gap-3">
        <StarNumber id={surah.id} />

        <div className="min-w-0 flex-1">
          <p className="truncate font-bold tracking-tight text-foreground">{surah.transliteration}</p>
          {showEn ? <p className="truncate text-sm text-muted-foreground">{surah.englishMeaning}</p> : null}
          {showBn ? (
            <BanglaText className="block truncate text-sm text-muted-foreground">
              {surah.banglaName} · {surah.banglaMeaning}
            </BanglaText>
          ) : null}
        </div>

        <span
          lang="ar"
          dir="rtl"
          className="shrink-0 font-quran text-[1.5rem] leading-[1.6] whitespace-nowrap text-arabic transition-colors group-hover:text-primary sm:text-[1.75rem]"
        >
          {surah.arabicName.replace(SURAH_PREFIX, '')}
        </span>
      </div>

      {/* Row 2: tags, full width under the names (star 3rem + gap 0.75rem). */}
      <div className="flex flex-wrap items-center gap-1.5 pl-15 text-[0.7rem] font-medium">
        <span
          className={cn(
            'rounded-full px-2 py-0.5',
            meccan ? 'bg-accent-soft text-accent' : 'bg-success-soft text-success',
          )}
        >
          <BanglaText>{revelationLabel(surah)}</BanglaText>
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
          <BanglaText>{toBanglaDigits(surah.ayahCount)} আয়াত</BanglaText>
        </span>
        {bookmarkAyah ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-primary-foreground">
            <Bookmark className="size-3 fill-current" aria-hidden />
            Ayah {bookmarkAyah}
          </span>
        ) : read ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-primary">
            <Check className="size-3" strokeWidth={3} aria-hidden />
            Read
          </span>
        ) : null}
      </div>
    </Link>
  )
})
