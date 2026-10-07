'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'
import { useAppData } from '@/components/providers/app-data-provider'
import { getStatus } from '@/lib/progress'
import { allahNames } from '@/lib/storage/names'
import { cn, formatNumber } from '@/lib/utils'
import { STATUS_LABELS } from './status-badge'

const cellStyles = {
  learned: 'bg-success text-white dark:text-background',
  learning: 'bg-accent-soft text-accent ring-1 ring-accent/40 ring-inset',
  not_started: 'bg-muted text-muted-foreground',
}

/** Visual 1–99 map; each cell links to its Name. */
export function NameProgress() {
  const { progress } = useAppData()
  return (
    <div>
      <ol className="grid grid-cols-8 gap-1.5 sm:grid-cols-11" aria-label="Progress for each of the 99 Names">
        {allahNames.map((name) => {
          const status = getStatus(progress, name.id)
          return (
            <li key={name.id}>
              <Link
                href={`/names/${name.id}/`}
                aria-label={`${name.id}. ${name.transliteration}: ${STATUS_LABELS[status]}`}
                className={cn(
                  'grid aspect-square place-items-center rounded-xl text-xs font-semibold tabular-nums transition-transform active:scale-95',
                  cellStyles[status],
                )}
              >
                {status === 'learned' ? <Check className="size-4" strokeWidth={2.6} aria-hidden /> : formatNumber(name.id)}
              </Link>
            </li>
          )
        })}
      </ol>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground" aria-hidden>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-success" /> Learned
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-accent-soft ring-1 ring-accent/40" /> Learning
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-muted" /> Not started
        </span>
      </div>
    </div>
  )
}
