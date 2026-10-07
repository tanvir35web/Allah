'use client'

import { ArrowRight, BookmarkPlus, Check, PartyPopper, SkipForward } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingState } from '@/components/common/loading-state'
import { ArabicText, BanglaText } from '@/components/common/localized-text'
import { StatusBadge } from '@/components/names/status-badge'
import { useAppData } from '@/components/providers/app-data-provider'
import { Button, ButtonLink } from '@/components/ui/button'
import { getStatus, nextNameToLearn } from '@/lib/progress'
import { allahNames, getNameById } from '@/lib/storage/names'
import { cn, formatNumber, pluralize } from '@/lib/utils'

const STEPS = ['Arabic', 'Pronunciation', 'Meaning', 'Reflection'] as const
const LAST_STEP = STEPS.length - 1

/**
 * Guided, one-Name-at-a-time learning: reveal the Arabic, then its
 * pronunciation, meaning and a short explanation, then mark it.
 */
export function LearnSession() {
  const { ready, progress } = useAppData()
  const searchParams = useSearchParams()
  const requestedId = Number(searchParams.get('id'))
  const requested = Number.isInteger(requestedId) ? getNameById(requestedId) : undefined

  // The starting Name is chosen once, when data is ready.
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [learnedCount, setLearnedCount] = useState(0)
  const startId = requested?.id ?? (ready ? (nextNameToLearn(allahNames, progress)?.id ?? 0) : null)
  const activeId = currentId ?? startId

  if (!ready || activeId === null) return <LoadingState rows={2} label="Preparing your next Name" />
  if (activeId === 0) return <AllLearned />

  return (
    <>
      <LearnCard
        key={activeId}
        nameId={activeId}
        onLearned={() => setLearnedCount((count) => count + 1)}
        onNext={(id) => {
          setCurrentId(id)
          window.scrollTo({ top: 0 })
        }}
      />
      {learnedCount > 0 ? (
        <p className="mt-3 text-center text-xs text-muted-foreground" role="status">
          {pluralize(learnedCount, 'Name')} learned this session
        </p>
      ) : null}
    </>
  )
}

interface LearnCardProps {
  nameId: number
  onNext: (id: number) => void
  onLearned: () => void
}

function LearnCard({ nameId, onNext, onLearned }: LearnCardProps) {
  const router = useRouter()
  const { progress, settings, setStatus } = useAppData()
  const [step, setStep] = useState(0)
  const [remembered, setRemembered] = useState(false)
  const name = getNameById(nameId)
  if (!name) return null

  const status = getStatus(progress, name.id)
  const showEn = settings.language !== 'bn'
  const showBn = settings.language !== 'en'

  const advance = (markLearned: boolean) => {
    // The current Name is always excluded, so its pending status doesn't matter.
    const next = nextNameToLearn(allahNames, progress, name.id)
    if (markLearned && status !== 'learned') {
      onLearned()
      void setStatus(name.id, 'learned')
    }
    if (next) onNext(next.id)
    else router.push('/progress/')
  }

  const rememberThis = () => {
    setRemembered(true)
    if (status === 'not_started') void setStatus(name.id, 'learning')
  }

  return (
    <div className="flex min-h-[calc(100dvh-14rem)] flex-col">
      <ol className="mb-5 grid grid-cols-4 gap-2" aria-label="Learning steps">
        {STEPS.map((label, index) => (
          <li key={label}>
            <span
              className={cn(
                'block h-1.5 rounded-full transition-colors duration-300',
                index <= step ? 'bg-primary' : 'bg-muted',
              )}
            />
            <span className={cn('mt-1.5 block text-[0.6875rem]', index === step ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
              {label}
            </span>
          </li>
        ))}
      </ol>

      <section
        aria-live="polite"
        className="pattern-stars flex-1 rounded-[2rem] border border-border bg-gradient-to-b from-primary-soft to-card px-6 py-8 text-center"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary tabular-nums">{formatNumber(name.id)} / 99</span>
          <StatusBadge status={status} />
        </div>

        <ArabicText className="mt-4 block text-[4.5rem] leading-[1.7]">{name.arabic}</ArabicText>

        {step >= 1 ? (
          <div className="animate-rise">
            <h2 className="text-2xl font-bold tracking-tight">{name.transliteration}</h2>
            {showBn ? <BanglaText className="block text-sm text-muted-foreground">{name.banglaName}</BanglaText> : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Take a moment with the Arabic.</p>
        )}

        {step >= 2 ? (
          <div className="animate-rise mt-5 space-y-1">
            {showEn ? <p className="text-lg font-semibold">{name.englishName}</p> : null}
            {showEn ? <p className="text-sm text-muted-foreground">{name.englishMeaning}</p> : null}
            {showBn ? <BanglaText className="block text-lg font-semibold">{name.banglaMeaning}</BanglaText> : null}
          </div>
        ) : null}

        {step >= 3 ? (
          <div className="animate-rise mt-6 space-y-3 rounded-2xl bg-card/80 p-4 text-left text-[0.95rem] leading-relaxed">
            {showEn ? <p>{name.shortExplanationEn}</p> : null}
            {showBn ? <BanglaText className="block">{name.shortExplanationBn}</BanglaText> : null}
          </div>
        ) : null}
      </section>

      <div className="mt-5 space-y-3">
        {step < LAST_STEP ? (
          <Button size="lg" className="w-full" onClick={() => setStep((value) => value + 1)}>
            Show {STEPS[step + 1]?.toLowerCase()}
            <ArrowRight className="size-5" aria-hidden />
          </Button>
        ) : (
          <>
            <Button size="lg" className="w-full" onClick={() => advance(true)}>
              <Check className="size-5" aria-hidden />
              {status === 'learned' ? 'Next Name' : 'Mark as learned & continue'}
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={rememberThis} disabled={remembered || status !== 'not_started'}>
                <BookmarkPlus className="size-4" aria-hidden />
                {remembered || status !== 'not_started' ? 'In your review' : 'Remember this'}
              </Button>
              <Button variant="outline" onClick={() => advance(false)}>
                <SkipForward className="size-4" aria-hidden />
                Skip for now
              </Button>
            </div>
          </>
        )}
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
