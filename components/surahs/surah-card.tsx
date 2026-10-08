import { Landmark, MoonStar } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'
import { BanglaText } from '@/components/common/localized-text'
import { revelationLabel, toBanglaDigits, type SurahSummary } from '@/lib/surah-search'
import type { ContentLanguage } from '@/lib/types'
import { cn, formatNumber } from '@/lib/utils'

/** The card shows the name alone, like a Name card; the reader keeps the full "سُورَةُ …" title. */
const SURAH_PREFIX = /^سُورَةُ /

interface SurahCardProps {
  surah: SurahSummary
  language: ContentLanguage
}

/** One surah in the list, laid out like a Name card. Memoised: the list re-renders on every keystroke. */
export const SurahCard = memo(function SurahCard({ surah, language }: SurahCardProps) {
  const showEn = language !== 'bn'
  const showBn = language !== 'en'
  const meccan = surah.revelation === 'meccan'
  const RevelationIcon = meccan ? MoonStar : Landmark
  return (
    <Link
      href={`/surahs/${surah.id}/`}
      className="group flex h-full flex-col rounded-3xl border border-border bg-card p-4 transition-[transform,box-shadow,border-color] duration-200 hover:border-primary/30 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-xs font-semibold text-primary tabular-nums">
          {formatNumber(surah.id)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{surah.transliteration}</p>
          {showEn ? <p className="text-sm text-muted-foreground">{surah.englishMeaning}</p> : null}
          {showBn ? (
            <BanglaText className="block text-sm text-muted-foreground">
              {surah.banglaName} · {surah.banglaMeaning}
            </BanglaText>
          ) : null}
        </div>
        <span lang="ar" dir="rtl" className="shrink-0 font-quran text-[1.85rem] leading-[1.6] text-arabic">
          {surah.arabicName.replace(SURAH_PREFIX, '')}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
            meccan ? 'bg-accent-soft text-accent' : 'bg-success-soft text-success',
          )}
        >
          <RevelationIcon className="size-3.5" strokeWidth={2.2} aria-hidden />
          <BanglaText>{revelationLabel(surah)}</BanglaText>
        </span>
        <BanglaText className="text-xs text-muted-foreground">{toBanglaDigits(surah.ayahCount)} আয়াত</BanglaText>
      </div>
    </Link>
  )
})
