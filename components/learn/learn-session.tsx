'use client'

import { Check, CircleCheck, CircleX, PartyPopper } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingState } from '@/components/common/loading-state'
import { ArabicText, BanglaText } from '@/components/common/localized-text'
import { StatusBadge } from '@/components/names/status-badge'
import { useAppData } from '@/components/providers/app-data-provider'
import { QuizOption, type OptionState } from '@/components/quiz/quiz-option'
import { Button, ButtonLink } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTodayActivity } from '@/hooks/use-derived-data'
import {
  countOutcomes,
  learnSessionSize,
  planLearnSession,
  recallQuestionType,
  type LearnOutcome,
} from '@/lib/learn-session'
import { getStatus } from '@/lib/progress'
import { createQuestion, optionFor, type QuizQuestion } from '@/lib/quiz'
import { allahNames, getNameById } from '@/lib/storage/names'
import type { AllahName, ContentLanguage } from '@/lib/types'
import { cn, formatNumber, pluralize } from '@/lib/utils'

const LETTERS = ['A', 'B', 'C', 'D']

const OUTCOME_LABELS: Record<LearnOutcome, string> = {
  learned: 'Learned',
  missed: 'Needs practice',
  skipped: 'Skipped',
}

/**
 * A learn session: the Names left for today's goal, in 1 → 99 order (or the
 * one Name asked for with `?id=`). Each Name is shown in full on one screen,
 * then a four-choice recall check decides whether it counts as learned.
 * A missed Name stays "learning", so it leads the next session and comes up
 * in review. The session ends with a summary.
 */
export function LearnSession() {
  const { ready, progress, settings } = useAppData()
  const todayActivity = useTodayActivity()
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedId = Number(searchParams.get('id'))
  const requested = Number.isInteger(requestedId) ? getNameById(requestedId) : undefined
  const [round, setRound] = useState(0)

  if (!ready) return <LoadingState rows={2} label="Preparing your session" />

  // Only the first value reaches the session: it keeps its own list from then on.
  const ids = requested
    ? [requested.id]
    : planLearnSession(
        allahNames,
        progress,
        learnSessionSize(settings.dailyGoal, todayActivity?.learnedNames.length ?? 0),
      )
  if (ids.length === 0) return <AllLearned />

  return (
    <Session
      key={`${requested?.id ?? 'goal'}-${round}`}
      initialIds={ids}
      onRestart={() => {
        // After a single requested Name, carry on with the normal goal session.
        if (requested) router.replace('/learn/')
        else setRound((value) => value + 1)
        window.scrollTo({ top: 0 })
      }}
    />
  )
}

function Session({ initialIds, onRestart }: { initialIds: number[]; onRestart: () => void }) {
  const { progress, settings, setStatus, recordReview } = useAppData()
  const [ids] = useState(initialIds)
  const [outcomes, setOutcomes] = useState<LearnOutcome[]>([])
  const [question, setQuestion] = useState<QuizQuestion | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const index = outcomes.length
  const name = getNameById(ids[index] ?? 0)
  if (!name) return <Summary ids={ids} outcomes={outcomes} onRestart={onRestart} />

  const finish = (outcome: LearnOutcome) => {
    setOutcomes((current) => [...current, outcome])
    setQuestion(null)
    setSelectedId(null)
    window.scrollTo({ top: 0 })
  }

  const startCheck = () => {
    setQuestion(createQuestion(recallQuestionType(settings.language), name, allahNames))
    window.scrollTo({ top: 0 })
  }

  const answer = (nameId: number) => {
    setSelectedId(nameId)
    const status = getStatus(progress, name.id)
    if (nameId === name.id) {
      if (status !== 'learned') void setStatus(name.id, 'learned')
    } else if (status === 'learned') {
      // Already learned before: bring it back into review sooner.
      void recordReview(name.id, false)
    } else {
      void setStatus(name.id, 'learning')
    }
  }

  return (
    <div className="space-y-5">
      <SessionProgress total={ids.length} outcomes={outcomes} />
      {question ? (
        <RecallCheck
          key={question.id}
          question={question}
          name={name}
          selectedId={selectedId}
          isLast={index === ids.length - 1}
          onSelect={answer}
          onContinue={() => finish(selectedId === name.id ? 'learned' : 'missed')}
        />
      ) : (
        <Study
          name={name}
          language={settings.language}
          onCheck={startCheck}
          onSkip={() => finish('skipped')}
        />
      )}
    </div>
  )
}

/** "Name 2 of 3" over one segment per Name, coloured by how it went. */
function SessionProgress({ total, outcomes }: { total: number; outcomes: LearnOutcome[] }) {
  const current = Math.min(outcomes.length + 1, total)
  return (
    <div>
      <p className="px-1 text-[0.9375rem] text-muted-foreground tabular-nums" aria-live="polite">
        Name {current} of {total}
      </p>
      <ol className="mt-2 flex gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, index) => {
          const outcome = outcomes[index]
          return (
            <li
              key={index}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-300',
                outcome === 'learned'
                  ? 'bg-primary'
                  : outcome === 'missed'
                    ? 'bg-danger'
                    : outcome === 'skipped'
                      ? 'bg-muted-foreground/40'
                      : index === outcomes.length
                        ? 'bg-primary/35'
                        : 'bg-muted',
              )}
            />
          )
        })}
      </ol>
    </div>
  )
}

/** Everything about the Name on one screen. */
function Study({
  name,
  language,
  onCheck,
  onSkip,
}: {
  name: AllahName
  language: ContentLanguage
  onCheck: () => void
  onSkip: () => void
}) {
  const { progress } = useAppData()
  const showEn = language !== 'bn'
  const showBn = language !== 'en'

  return (
    <div className="animate-rise">
      <article className="pattern-stars rounded-3xl border border-border bg-gradient-to-b from-primary-soft to-card px-6 pt-5 pb-6 text-center">
        <div className="flex items-center justify-between">
          <span className="text-[0.9375rem] text-muted-foreground tabular-nums">{formatNumber(name.id)} of 99</span>
          <StatusBadge status={getStatus(progress, name.id)} />
        </div>
        <ArabicText className="mt-2 block text-[4.5rem] leading-[1.7]">{name.arabic}</ArabicText>
        <h2 className="text-[1.75rem] leading-tight font-bold tracking-tight">{name.transliteration}</h2>
        {showBn ? (
          <BanglaText className="mt-0.5 block text-[1.0625rem] text-muted-foreground">{name.banglaName}</BanglaText>
        ) : null}

        <div className="mt-5 space-y-0.5">
          {showEn ? <p className="text-[1.0625rem] font-semibold">{name.englishName}</p> : null}
          {showEn ? <p className="text-[0.9375rem] text-muted-foreground">{name.englishMeaning}</p> : null}
          {showBn ? <BanglaText className="block text-[1.0625rem] font-semibold">{name.banglaMeaning}</BanglaText> : null}
        </div>

        <div className="mt-5 space-y-3 border-t border-border pt-5 text-left text-[0.9375rem] leading-relaxed">
          {showEn ? <p>{name.shortExplanationEn}</p> : null}
          {showBn ? <BanglaText className="block">{name.shortExplanationBn}</BanglaText> : null}
        </div>
      </article>

      <Button size="lg" className="mt-5 w-full rounded-xl" onClick={onCheck}>
        Check Myself
      </Button>
      <Button variant="ghost" className="mt-2 w-full rounded-xl text-muted-foreground" onClick={onSkip}>
        Skip for Now
      </Button>
    </div>
  )
}

/** Four choices; a right answer marks the Name learned. */
function RecallCheck({
  question,
  name,
  selectedId,
  isLast,
  onSelect,
  onContinue,
}: {
  question: QuizQuestion
  name: AllahName
  selectedId: number | null
  isLast: boolean
  onSelect: (nameId: number) => void
  onContinue: () => void
}) {
  const answered = selectedId !== null
  const correct = selectedId === question.nameId
  const continueRef = useRef<HTMLButtonElement>(null)

  // Move focus to "Continue" after answering so keyboard and screen-reader users can go on.
  useEffect(() => {
    if (answered) continueRef.current?.focus({ preventScroll: true })
  }, [answered])

  const stateFor = (optionId: number): OptionState => {
    if (!answered) return 'idle'
    if (optionId === question.nameId) return 'correct'
    if (optionId === selectedId) return 'incorrect'
    return 'dimmed'
  }

  return (
    <div className="animate-rise space-y-5">
      <section className="rounded-3xl border border-border bg-card px-5 py-6 text-center">
        <h2 className="text-[0.9375rem] text-muted-foreground">
          <span aria-hidden>{question.instruction}</span>
          <span className="sr-only">{question.prompt}</span>
        </h2>
        <p className="mt-2" aria-hidden>
          {question.subjectKind === 'bangla' ? (
            <BanglaText className="text-[1.75rem] font-semibold">“{question.subject}”</BanglaText>
          ) : (
            <span className="text-[1.75rem] font-bold tracking-tight">{question.subject}</span>
          )}
        </p>
      </section>

      <div className="space-y-3" role="group" aria-label="Answer options">
        {question.options.map((option, index) => (
          <QuizOption
            key={option.nameId}
            option={option}
            letter={LETTERS[index] ?? String(index + 1)}
            state={stateFor(option.nameId)}
            disabled={answered}
            onSelect={() => onSelect(option.nameId)}
          />
        ))}
      </div>

      {answered ? (
        <div
          role="status"
          className={cn(
            'animate-rise rounded-3xl border p-4',
            correct ? 'border-success/30 bg-success-soft' : 'border-danger/30 bg-danger-soft',
          )}
        >
          <p className={cn('flex items-center gap-2 font-semibold', correct ? 'text-success' : 'text-danger')}>
            {correct ? <CircleCheck className="size-5" aria-hidden /> : <CircleX className="size-5" aria-hidden />}
            {correct ? `${name.transliteration} learned` : 'Not yet'}
          </p>
          {!correct ? (
            <p className="mt-1 text-[0.9375rem]">
              The answer is <strong>{optionFor(question.type, name).label}</strong>. It stays in your list and
              comes up in review.
            </p>
          ) : null}
        </div>
      ) : null}

      {answered ? (
        <Button ref={continueRef} size="lg" className="w-full rounded-xl" onClick={onContinue}>
          {isLast ? 'See Summary' : 'Next Name'}
        </Button>
      ) : null}
    </div>
  )
}

function Summary({ ids, outcomes, onRestart }: { ids: number[]; outcomes: LearnOutcome[]; onRestart: () => void }) {
  const counts = countOutcomes(outcomes)

  return (
    <div className="animate-rise space-y-6">
      <div className="pt-2 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
          <Check className="size-7" strokeWidth={2.5} aria-hidden />
        </span>
        <h2 className="mt-4 text-[1.75rem] leading-tight font-bold tracking-tight">Session Complete</h2>
        <p className="mt-1 text-[1.0625rem] text-muted-foreground" role="status">
          {counts.learned > 0 ? `${pluralize(counts.learned, 'Name')} learned` : 'No new Names learned this time'}
          {counts.missed > 0 ? `, ${counts.missed} to practise` : ''}
        </p>
      </div>

      <Card className="overflow-hidden">
        <ul className="py-1">
          {ids.map((id, index) => {
            const name = getNameById(id)
            const outcome = outcomes[index]
            if (!name || !outcome) return null
            return (
              <li key={id} className="flex min-h-14 items-center gap-3 pl-4">
                <span className="w-7 shrink-0 text-[0.9375rem] text-muted-foreground tabular-nums">
                  {formatNumber(id)}
                </span>
                <span
                  className={cn(
                    'flex min-h-14 min-w-0 flex-1 items-center gap-2 pr-4',
                    index > 0 && 'border-t border-border',
                  )}
                >
                  <span className="flex-1 truncate text-[1.0625rem]">{name.transliteration}</span>
                  <span
                    className={cn(
                      'text-[0.9375rem]',
                      outcome === 'learned' ? 'text-success' : outcome === 'missed' ? 'text-danger' : 'text-muted-foreground',
                    )}
                  >
                    {OUTCOME_LABELS[outcome]}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </Card>

      <div className="space-y-3">
        <ButtonLink href="/" size="lg" className="w-full rounded-xl">
          Done
        </ButtonLink>
        <Button variant="secondary" size="lg" className="w-full rounded-xl" onClick={onRestart}>
          Learn More
        </Button>
      </div>
    </div>
  )
}

function AllLearned() {
  return (
    <EmptyState
      icon={PartyPopper}
      title="All 99 Names learned"
      description="Alhamdulillah. Keep them close with regular review and quizzes."
      action={
        <div className="flex gap-3">
          <ButtonLink href="/review/">Review</ButtonLink>
          <ButtonLink href="/quiz/" variant="outline">
            Take a quiz
          </ButtonLink>
        </div>
      }
    />
  )
}
