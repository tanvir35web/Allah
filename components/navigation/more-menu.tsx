'use client'

import { BarChart3, Flame, Info, RotateCcw, Settings, Sparkles, Star } from 'lucide-react'
import Link from 'next/link'
import { useAppData } from '@/components/providers/app-data-provider'
import { ListGroup, ListRow, RowBadge } from '@/components/ui/list-group'
import { ProgressRing } from '@/components/ui/progress-bar'
import { useProgressSummary, useReviewQueue, useStreak } from '@/hooks/use-derived-data'
import { pluralize } from '@/lib/utils'

/** At-a-glance numbers, each linking to where it comes from. */
function Summary() {
  const summary = useProgressSummary()
  const streak = useStreak()
  const reviewQueue = useReviewQueue()
  const tile =
    'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-center transition-colors hover:bg-muted/50'

  return (
    <div className="grid grid-cols-3 divide-x divide-border/60 rounded-3xl border border-border/70 bg-card p-1.5 shadow-xs">
      <Link href="/progress/" className={tile}>
        <ProgressRing value={summary.learned} max={summary.total} size={40} stroke={4} label="Names learned">
          <span className="text-[0.6875rem] font-bold tabular-nums">{summary.percentage}%</span>
        </ProgressRing>
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">{summary.learned}</span>/{summary.total} learned
        </span>
      </Link>
      <Link href="/progress/" className={tile}>
        <span
          className={
            streak?.todayActive
              ? 'grid size-10 place-items-center rounded-full bg-accent-soft text-accent'
              : 'grid size-10 place-items-center rounded-full bg-muted text-muted-foreground'
          }
        >
          <Flame className="size-5" aria-hidden />
        </span>
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">{streak?.currentStreak ?? 0}</span>{' '}
          {streak?.currentStreak === 1 ? 'day' : 'days'} streak
        </span>
      </Link>
      <Link href="/review/" className={tile}>
        <span className="grid size-10 place-items-center rounded-full bg-primary-soft text-primary">
          <RotateCcw className="size-5" aria-hidden />
        </span>
        <span className="text-xs text-muted-foreground">
          {reviewQueue.length ? (
            <>
              <span className="font-semibold text-foreground tabular-nums">{reviewQueue.length}</span> to review
            </>
          ) : (
            'All reviewed'
          )}
        </span>
      </Link>
    </div>
  )
}

export function MoreMenu() {
  const { ready, favorites, quizResults } = useAppData()
  const reviewQueue = useReviewQueue()

  return (
    <div className="space-y-6">
      {ready ? <Summary /> : <div className="h-[6.5rem] rounded-3xl bg-card/60" aria-hidden />}

      <ListGroup title="Practice">
        <ListRow
          href="/quiz/"
          icon={Sparkles}
          tone="accent"
          title="Quiz"
          description={quizResults.length ? `${pluralize(quizResults.length, 'quiz', 'quizzes')} taken` : 'Short quizzes on meanings and Arabic'}
        />
        <ListRow
          href="/review/"
          icon={RotateCcw}
          title="Review"
          description="Keep learned Names fresh"
          trailing={reviewQueue.length ? <RowBadge>{reviewQueue.length}</RowBadge> : null}
        />
      </ListGroup>

      <ListGroup title="Your journey">
        <ListRow href="/progress/" icon={BarChart3} tone="success" title="Progress" description="Names, streaks and Quran reading" />
        <ListRow
          href="/favorites/"
          icon={Star}
          tone="accent"
          title="Favorites"
          description="Names you have saved"
          trailing={favorites.length ? <RowBadge tone="accent">{favorites.length}</RowBadge> : null}
        />
      </ListGroup>

      <ListGroup title="App">
        <ListRow href="/settings/" icon={Settings} tone="muted" title="Settings" description="Theme, language, goal and data" />
        <ListRow href="/about/" icon={Info} tone="muted" title="About" description="Sources and privacy" />
      </ListGroup>
    </div>
  )
}
