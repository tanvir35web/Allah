'use client'

import { ChevronRight, History, Play, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { LoadingState } from '@/components/common/loading-state'
import { useAppData } from '@/components/providers/app-data-provider'
import { Button } from '@/components/ui/button'
import { Card, SectionTitle } from '@/components/ui/card'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { answerQuestion, generateQuiz, QUIZ_LENGTHS, QUIZ_MODE_LABELS, scoreQuiz, type QuizQuestion } from '@/lib/quiz'
import { createId } from '@/lib/random'
import { allahNames } from '@/lib/storage/names'
import type { QuizAnswer, QuizMode, QuizScope } from '@/lib/types'
import { cn, formatRelativeDay } from '@/lib/utils'
import { QuizCard } from './quiz-card'
import { QuizProgress } from './quiz-progress'

const MODES: QuizMode[] = ['mixed', 'meaning', 'arabic-to-name', 'name-to-arabic', 'bangla']

interface QuizConfig {
  mode: QuizMode
  count: number
  scope: QuizScope
}

function parseConfig(params: URLSearchParams): QuizConfig & { autoStart: boolean } {
  const mode = MODES.find((value) => value === params.get('mode')) ?? 'mixed'
  const countParam = Number(params.get('count'))
  const count = QUIZ_LENGTHS.find((value) => value === countParam) ?? 10
  const scope: QuizScope = params.get('scope') === 'learned' ? 'learned' : 'all'
  return { mode, count, scope, autoStart: params.get('start') === '1' }
}

export function QuizScreen() {
  const searchParams = useSearchParams()
  const initial = useMemo(() => parseConfig(searchParams), [searchParams])
  const { ready } = useAppData()
  const [config, setConfig] = useState<QuizConfig>(initial)
  const [session, setSession] = useState<{ key: string; config: QuizConfig } | null>(null)
  const [autoStartUsed, setAutoStartUsed] = useState(false)

  if (!ready) return <LoadingState rows={3} />

  // "Try again" links arrive with ?start=1 and begin immediately.
  const active = session ?? (initial.autoStart && !autoStartUsed ? { key: 'auto', config: initial } : null)

  if (active) {
    return (
      <QuizSession
        key={active.key}
        config={active.config}
        onExit={() => {
          setSession(null)
          setAutoStartUsed(true)
          setConfig(active.config)
        }}
      />
    )
  }

  return (
    <QuizSetup
      config={config}
      onChange={setConfig}
      onStart={() => setSession({ key: createId(), config })}
    />
  )
}

function QuizSetup({
  config,
  onChange,
  onStart,
}: {
  config: QuizConfig
  onChange: (config: QuizConfig) => void
  onStart: () => void
}) {
  const { progress, quizResults } = useAppData()
  const studiedCount = Object.values(progress).filter((entry) => entry.status !== 'not_started').length

  return (
    <div className="space-y-6">
      <section aria-labelledby="quiz-type" className="space-y-3">
        <SectionTitle id="quiz-type">Quiz type</SectionTitle>
        <div role="radiogroup" aria-labelledby="quiz-type" className="grid grid-cols-2 gap-3">
          {MODES.map((mode) => {
            const selected = config.mode === mode
            const { title, description } = QUIZ_MODE_LABELS[mode]
            return (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ ...config, mode })}
                className={cn(
                  'flex min-h-24 flex-col justify-between rounded-3xl border-2 p-4 text-left transition-colors',
                  mode === 'mixed' && 'col-span-2 min-h-20',
                  selected ? 'border-primary bg-primary-soft' : 'border-border bg-card hover:border-primary/30',
                )}
              >
                <span className="font-semibold" lang={mode === 'bangla' ? 'bn' : undefined}>
                  {title}
                </span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="quiz-length" className="space-y-3">
        <SectionTitle id="quiz-length">Questions</SectionTitle>
        <SegmentedControl<number>
          label="Number of questions"
          value={config.count}
          options={QUIZ_LENGTHS.map((value) => ({ value, label: String(value) }))}
          onChange={(count) => onChange({ ...config, count })}
        />
      </section>

      <section aria-labelledby="quiz-scope" className="space-y-3">
        <SectionTitle id="quiz-scope">Names to include</SectionTitle>
        <SegmentedControl<QuizScope>
          label="Names to include"
          value={studiedCount === 0 ? 'all' : config.scope}
          options={[
            { value: 'all', label: 'All 99' },
            { value: 'learned', label: `My Names (${studiedCount})` },
          ]}
          onChange={(scope) => onChange({ ...config, scope: studiedCount === 0 ? 'all' : scope })}
        />
        {studiedCount === 0 ? (
          <p className="px-1 text-xs text-muted-foreground">Start learning to quiz yourself on your own Names.</p>
        ) : null}
      </section>

      <Button size="lg" className="w-full" onClick={onStart}>
        <Play className="size-5" aria-hidden />
        Start quiz
      </Button>

      <section aria-labelledby="quiz-history" className="space-y-3">
        <SectionTitle id="quiz-history">Recent quizzes</SectionTitle>
        {quizResults.length === 0 ? (
          <Card className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
            <History className="size-5 shrink-0" aria-hidden />
            Your quiz history will appear here.
          </Card>
        ) : (
          <ul className="space-y-2">
            {quizResults.slice(0, 5).map((result) => {
              const percentage = scoreQuiz(result.answers).percentage
              return (
                <li key={result.id}>
                  <Link
                    href={`/quiz/result/?id=${result.id}`}
                    className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <span
                      className={cn(
                        'grid size-11 place-items-center rounded-xl text-sm font-bold tabular-nums',
                        percentage >= 80 ? 'bg-success-soft text-success' : percentage >= 50 ? 'bg-accent-soft text-accent' : 'bg-danger-soft text-danger',
                      )}
                    >
                      {percentage}%
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{QUIZ_MODE_LABELS[result.mode].title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {result.correct}/{result.total} · {formatRelativeDay(result.completedAt)}
                      </span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function QuizSession({ config, onExit }: { config: QuizConfig; onExit: () => void }) {
  const router = useRouter()
  const { progress, settings, saveQuiz } = useAppData()
  const [startedAt] = useState(() => new Date().toISOString())
  const [questions] = useState<QuizQuestion[]>(() => {
    const pool =
      config.scope === 'learned'
        ? allahNames.filter((name) => (progress[name.id]?.status ?? 'not_started') !== 'not_started')
        : allahNames
    return generateQuiz({ mode: config.mode, count: config.count, pool, allNames: allahNames })
  })
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [saving, setSaving] = useState(false)

  const question = questions[index]
  const current = answers[index]
  if (!question) return null

  const finish = async (finalAnswers: QuizAnswer[]) => {
    setSaving(true)
    const score = scoreQuiz(finalAnswers)
    const id = createId()
    await saveQuiz({
      id,
      mode: config.mode,
      scope: config.scope,
      total: score.total,
      correct: score.correct,
      startedAt,
      completedAt: new Date().toISOString(),
      answers: finalAnswers,
    })
    router.push(`/quiz/result/?id=${id}`)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <QuizProgress current={index + 1} total={questions.length} correct={answers.filter((a) => a.isCorrect).length} />
        </div>
        <Button variant="ghost" size="icon" onClick={onExit} aria-label="End quiz without saving">
          <X className="size-5" aria-hidden />
        </Button>
      </div>
      <QuizCard
        key={question.id}
        question={question}
        selectedId={current?.selectedNameId ?? null}
        isLast={index === questions.length - 1}
        language={settings.language}
        onSelect={(nameId) => {
          if (current) return
          setAnswers((previous) => [...previous, answerQuestion(question, nameId)])
        }}
        onNext={() => {
          if (saving) return
          if (index < questions.length - 1) {
            setIndex(index + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          } else {
            void finish(answers)
          }
        }}
      />
    </div>
  )
}
