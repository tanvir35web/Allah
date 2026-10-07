'use client'

import { BookOpen, Check, CheckCheck, Eye, RotateCcw, Undo2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingState } from '@/components/common/loading-state'
import { ArabicText, BanglaText } from '@/components/common/localized-text'
import { useAppData } from '@/components/providers/app-data-provider'
import { Button, ButtonLink } from '@/components/ui/button'
import { Card, SectionTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { useReviewQueue } from '@/hooks/use-derived-data'
import { REVIEW_REASON_LABELS, type ReviewRecommendation } from '@/lib/review'
import { getNameById } from '@/lib/storage/names'
import { cn, formatNumber, pluralize } from '@/lib/utils'

const reasonStyles = {
  mistakes: 'bg-danger-soft text-danger',
  recent: 'bg-primary-soft text-primary',
  due: 'bg-accent-soft text-accent',
}

export function ReviewScreen() {
  const { ready, progress } = useAppData()
  const queue = useReviewQueue()
  // Snapshot the queue when a session starts, so it doesn't shift mid-review.
  const [session, setSession] = useState<ReviewRecommendation[] | null>(null)

  if (!ready) return <LoadingState rows={3} />
  if (session) return <ReviewSession items={session} onDone={() => setSession(null)} />

  const hasStudied = Object.keys(progress).length > 0
  if (queue.length === 0) {
    return hasStudied ? (
      <EmptyState
        icon={CheckCheck}
        title="All caught up"
        description="No Names need review right now. Come back tomorrow, or practise with a quiz."
        action={<ButtonLink href="/quiz/">Take a quiz</ButtonLink>}
      />
    ) : (
      <EmptyState
        icon={BookOpen}
        title="Nothing to review yet"
        description="Names you learn, and any you miss in quizzes, will appear here for gentle review."
        action={<ButtonLink href="/learn/">Start learning</ButtonLink>}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card className="pattern-stars overflow-hidden p-6">
        <h2 className="text-lg font-semibold">Today’s review</h2>
        <p className="mt-1 text-muted-foreground">
          You have {pluralize(queue.length, 'Name')} to review.
        </p>
        <Button size="lg" className="mt-5 w-full" onClick={() => setSession(queue)}>
          <RotateCcw className="size-5" aria-hidden />
          Start review
        </Button>
      </Card>

      <section aria-labelledby="queue-title" className="space-y-3">
        <SectionTitle id="queue-title">Up next</SectionTitle>
        <ul className="space-y-2">
          {queue.map((item) => {
            const name = getNameById(item.nameId)
            if (!name) return null
            return (
              <li key={item.nameId}>
                <Link
                  href={`/names/${name.id}/`}
                  className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-2"
                >
                  <span className="w-7 text-xs font-semibold text-muted-foreground tabular-nums">{formatNumber(name.id)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{name.transliteration}</span>
                    <span className={cn('mt-0.5 inline-block rounded-full px-2 py-0.5 text-[0.6875rem] font-medium', reasonStyles[item.reason])}>
                      {REVIEW_REASON_LABELS[item.reason]}
                    </span>
                  </span>
                  <ArabicText className="text-2xl leading-[1.6]">{name.arabic}</ArabicText>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

function ReviewSession({ items, onDone }: { items: ReviewRecommendation[]; onDone: () => void }) {
  const { recordReview, settings } = useAppData()
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [remembered, setRemembered] = useState(0)

  if (index >= items.length) {
    return (
      <EmptyState
        icon={Check}
        title="Review complete"
        description={`You remembered ${remembered} of ${items.length}. Names you need to practise will come back sooner.`}
        action={
          <div className="flex gap-3">
            <Button onClick={onDone}>Done</Button>
            <ButtonLink href="/quiz/" variant="outline">
              Take a quiz
            </ButtonLink>
          </div>
        }
      />
    )
  }

  const item = items[index]
  const name = item ? getNameById(item.nameId) : undefined
  if (!item || !name) return null

  const answer = (didRemember: boolean) => {
    void recordReview(name.id, didRemember)
    if (didRemember) setRemembered((count) => count + 1)
    setRevealed(false)
    setIndex((value) => value + 1)
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-semibold tabular-nums">
            {index + 1} <span className="text-muted-foreground">/ {items.length}</span>
          </span>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', reasonStyles[item.reason])}>
            {REVIEW_REASON_LABELS[item.reason]}
          </span>
        </div>
        <ProgressBar value={index} max={items.length} label="Review progress" />
      </div>

      <section
        key={name.id}
        aria-live="polite"
        className="animate-rise pattern-stars rounded-[2rem] border border-border bg-gradient-to-b from-primary-soft to-card px-6 py-10 text-center"
      >
        <ArabicText className="block text-[4.5rem] leading-[1.7]">{name.arabic}</ArabicText>
        {revealed ? (
          <div className="animate-rise mt-2 space-y-1">
            <h2 className="text-2xl font-bold">{name.transliteration}</h2>
            {settings.language !== 'bn' ? <p className="text-lg">{name.englishName}</p> : null}
            {settings.language !== 'en' ? <BanglaText className="block text-lg">{name.banglaMeaning}</BanglaText> : null}
            <p className="pt-3 text-sm leading-relaxed text-muted-foreground">
              {settings.language === 'bn' ? <BanglaText>{name.shortExplanationBn}</BanglaText> : name.shortExplanationEn}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Do you remember its name and meaning?</p>
        )}
      </section>

      {revealed ? (
        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" variant="outline" onClick={() => answer(false)}>
            <Undo2 className="size-5" aria-hidden />
            Need practice
          </Button>
          <Button size="lg" onClick={() => answer(true)}>
            <Check className="size-5" aria-hidden />I remembered
          </Button>
        </div>
      ) : (
        <Button size="lg" className="w-full" onClick={() => setRevealed(true)}>
          <Eye className="size-5" aria-hidden />
          Show answer
        </Button>
      )}
    </div>
  )
}
