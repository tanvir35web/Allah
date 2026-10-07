import { Star } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'
import { ArabicText, BanglaText } from '@/components/common/localized-text'
import type { AllahName, ContentLanguage, LearningStatus } from '@/lib/types'
import { cn, formatNumber } from '@/lib/utils'
import { StatusBadge } from './status-badge'

interface NameCardProps {
  name: AllahName
  status: LearningStatus
  favorite: boolean
  language: ContentLanguage
}

/** One Name in the explorer list. Memoised: the list re-renders on every keystroke. */
export const NameCard = memo(function NameCard({ name, status, favorite, language }: NameCardProps) {
  const showEn = language !== 'bn'
  const showBn = language !== 'en'
  return (
    <Link
      href={`/names/${name.id}/`}
      className="group flex h-full flex-col rounded-3xl border border-border bg-card p-4 transition-[transform,box-shadow,border-color] duration-200 hover:border-primary/30 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-xs font-semibold text-primary tabular-nums">
          {formatNumber(name.id)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{name.transliteration}</p>
          {showEn ? <p className="text-sm text-muted-foreground">{name.englishName}</p> : null}
          {showBn ? (
            <BanglaText className="block text-sm text-muted-foreground">{name.banglaMeaning}</BanglaText>
          ) : null}
        </div>
        <ArabicText className="shrink-0 text-[1.85rem] leading-[1.6]">{name.arabic}</ArabicText>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <StatusBadge status={status} />
        <Star
          className={cn('size-4', favorite ? 'fill-accent text-accent' : 'text-transparent')}
          aria-label={favorite ? 'Favorite' : undefined}
          aria-hidden={!favorite}
        />
      </div>
    </Link>
  )
})
