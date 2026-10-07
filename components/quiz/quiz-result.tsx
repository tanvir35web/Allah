'use client'

import { CircleCheck, CircleX, House, ListChecks, RotateCcw, SearchX } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingState } from '@/components/common/loading-state'
import { ArabicText } from '@/components/common/localized-text'
import { useAppData } from '@/components/providers/app-data-provider'
import { Button, ButtonLink } from '@/components/ui/button'
import { Card, SectionTitle } from '@/components/ui/card'
import { ProgressRing } from '@/components/ui/progress-bar'
import { optionFor, QUIZ_MODE_LABELS, scoreQuiz } from '@/lib/quiz'
import { getNameById } from '@/lib/storage/names'
import type { QuizAnswer, QuizResult as QuizResultData } from '@/lib/types'
import { formatRelativeDay } from '@/lib/utils'

function headline(percentage: number): string {
  if (percentage === 100) return 'MashaAllah, a perfect score'
  if (percentage >= 80) return 'Excellent work'
  if (percentage >= 50) return 'Good progress'
  return 'Every attempt helps you remember'
}

export function QuizResultView() {
  const { ready, quizResults } = useAppData()
  const id = useSearchParams().get('id')

  if (!ready) return <LoadingState rows={3} />
  const result = quizResults.find((entry) => entry.id === id)
  if (!result) {
    return (
      <EmptyState
        icon={SearchX}
        title="Result not found"
        description="This quiz result isn’t on this device. It may have been cleared."
        action={<ButtonLink href="/quiz/">Take a quiz</ButtonLink>}
      />
    )
  }
  return <ResultDetails result={result} />
}

function ResultDetails({ result }: { result: QuizResultData }) {
  const [showMistakes, setShowMistakes] = useState(false)
  const score = scoreQuiz(result.answers)
  const mistakes = result.answers.filter((answer) => !answer.isCorrect)
  const retryHref = `/quiz/?mode=${result.mode}&count=${result.total}&scope=${result.scope}&start=1`

  return (
    <div className="space-y-5">
      <Card className="pattern-stars overflow-hidden p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {QUIZ_MODE_LABELS[result.mode].title} · {formatRelativeDay(result.completedAt)}
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">
          Quiz complete <span aria-hidden>🎉</span>
        </h2>
        <div className="mt-5 flex justify-center">
          <ProgressRing value={score.correct} max={score.total} size={132} stroke={10} label="Score">
            <span>
              <span className="block text-3xl font-bold tabular-nums">
                {score.correct}/{score.total}
              </span>
              <span className="block text-sm text-muted-foreground tabular-nums">{score.percentage}%</span>
            </span>
          </ProgressRing>
        </div>
        <p className="mt-4 font-medium">{headline(score.percentage)}</p>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-2xl bg-success-soft p-3">
            <dt className="flex items-center gap-1.5 text-xs text-success">
              <CircleCheck className="size-4" aria-hidden /> Correct
            </dt>
            <dd className="mt-1 text-xl font-bold tabular-nums">{score.correct}</dd>
          </div>
          <div className="rounded-2xl bg-danger-soft p-3">
            <dt className="flex items-center gap-1.5 text-xs text-danger">
              <CircleX className="size-4" aria-hidden /> Wrong
            </dt>
            <dd className="mt-1 text-xl font-bold tabular-nums">{score.wrong}</dd>
          </div>
        </dl>
      </Card>

      <div className="grid gap-3">
        <ButtonLink href={retryHref} size="lg">
          <RotateCcw className="size-5" aria-hidden />
          Try again
        </ButtonLink>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => setShowMistakes((value) => !value)}
            disabled={mistakes.length === 0}
            aria-expanded={showMistakes}
            aria-controls="mistakes"
          >
            <ListChecks className="size-4" aria-hidden />
            {mistakes.length === 0 ? 'No mistakes' : showMistakes ? 'Hide mistakes' : 'Review mistakes'}
          </Button>
          <ButtonLink href="/" variant="outline">
            <House className="size-4" aria-hidden />
            Back home
          </ButtonLink>
        </div>
      </div>

      {showMistakes && mistakes.length > 0 ? (
        <section id="mistakes" aria-labelledby="mistakes-title" className="animate-rise space-y-3">
          <SectionTitle id="mistakes-title">Mistakes to review</SectionTitle>
          <ul className="space-y-3">
            {mistakes.map((answer, index) => (
              <MistakeItem key={`${answer.nameId}-${index}`} answer={answer} />
            ))}
          </ul>
          <p className="px-1 text-xs text-muted-foreground">These Names have been added to your review list.</p>
        </section>
      ) : null}
    </div>
  )
}

function MistakeItem({ answer }: { answer: QuizAnswer }) {
  const name = getNameById(answer.nameId)
  const chosen = getNameById(answer.selectedNameId)
  if (!name) return null
  const correctLabel = optionFor(answer.questionType, name).label
  const chosenLabel = chosen ? optionFor(answer.questionType, chosen).label : '—'
  const isArabic = answer.questionType === 'name-to-arabic'

  return (
    <li>
      <Link href={`/names/${name.id}/`} className="block rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold">{name.transliteration}</p>
            <p className="text-sm text-muted-foreground">{name.englishName}</p>
          </div>
          <ArabicText className="text-2xl leading-[1.6]">{name.arabic}</ArabicText>
        </div>
        <div className="mt-3 space-y-1 text-sm">
          <p className="flex items-center gap-2 text-danger">
            <CircleX className="size-4 shrink-0" aria-hidden />
            <span className="sr-only">Your answer:</span>
            {isArabic ? <ArabicText className="text-lg">{chosenLabel}</ArabicText> : chosenLabel}
          </p>
          <p className="flex items-center gap-2 text-success">
            <CircleCheck className="size-4 shrink-0" aria-hidden />
            <span className="sr-only">Correct answer:</span>
            {isArabic ? <ArabicText className="text-lg">{correctLabel}</ArabicText> : correctLabel}
          </p>
        </div>
      </Link>
    </li>
  )
}
