'use client'

import { ArrowRight, BookOpenText, Check, ChevronRight, RotateCcw, Sparkles, Star } from 'lucide-react'
import Link from 'next/link'
import { ArabicText } from '@/components/common/localized-text'
import { LoadingState } from '@/components/common/loading-state'
import { StorageNotice } from '@/components/common/storage-notice'
import { StatTile } from '@/components/progress/progress-card'
import { StreakPill } from '@/components/progress/streak-card'
import { useAppData } from '@/components/providers/app-data-provider'
import { ButtonLink } from '@/components/ui/button'
import { Card, SectionTitle } from '@/components/ui/card'
import { ProgressBar, ProgressRing } from '@/components/ui/progress-bar'
import {
  useNextName,
  useProgressSummary,
  useQuizStats,
  useReviewQueue,
  useStreak,
  useTodayActivity,
} from '@/hooks/use-derived-data'
import { pluralize } from '@/lib/utils'
import { DailyNameCard } from './daily-name-card'
import { Onboarding } from './onboarding'

export function HomeScreen() {
  const { ready, settings } = useAppData()

  if (ready && !settings.onboardingComplete) return <Onboarding />

  return (
    <>
      <header className="safe-top mx-auto max-w-2xl px-4">
        <div className="flex items-center justify-between pt-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Assalamu Alaikum <span aria-hidden>🌙</span>
            </p>
            <ArabicText className="inline-block text-lg leading-[1.8] text-muted-foreground" aria-hidden>
              السَّلَامُ عَلَيْكُمْ
            </ArabicText>
          </div>
          <StreakPill />
        </div>
        <h1 className="mt-3 text-[1.75rem] leading-tight font-bold tracking-tight text-balance">
          Learn the 99 Names of Allah
        </h1>
      </header>

      <main id="main" className="animate-rise pb-nav mx-auto max-w-2xl space-y-6 px-4 pt-5">
        <StorageNotice />
        {ready ? <TodayCard /> : <LoadingState rows={1} />}
        <DailyNameCard />
        {ready ? (
          <>
            <QuickActions />
            <ProgressSummary />
          </>
        ) : (
          <LoadingState rows={2} />
        )}
      </main>
    </>
  )
}

function TodayCard() {
  const { settings } = useAppData()
  const todayActivity = useTodayActivity()
  const next = useNextName()
  const learnedToday = todayActivity?.learnedNames.length ?? 0
  const goal = settings.dailyGoal
  const goalMet = learnedToday >= goal

  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <ProgressRing value={Math.min(learnedToday, goal)} max={goal} label="Today’s goal">
          {goalMet ? (
            <Check className="size-6 text-primary" strokeWidth={2.5} aria-hidden />
          ) : (
            <span className="text-sm font-semibold tabular-nums">
              {learnedToday}/{goal}
            </span>
          )}
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Today’s progress</h2>
          <p className="text-sm text-muted-foreground">
            {goalMet
              ? `Goal reached — ${pluralize(learnedToday, 'Name')} learned today.`
              : `${pluralize(learnedToday, 'Name')} of ${goal} learned today.`}
          </p>
        </div>
      </div>
      {next ? (
        <ButtonLink href="/learn/" size="lg" className="mt-5 w-full justify-between">
          <span className="flex min-w-0 items-center gap-2">
            Continue learning
            <span className="truncate text-sm font-normal opacity-80">· {next.transliteration}</span>
          </span>
          <ArrowRight className="size-5" aria-hidden />
        </ButtonLink>
      ) : (
        <ButtonLink href="/review/" size="lg" variant="secondary" className="mt-5 w-full">
          All 99 learned — keep reviewing
        </ButtonLink>
      )}
    </Card>
  )
}

function QuickActions() {
  const { favorites } = useAppData()
  const reviewQueue = useReviewQueue()
  const actions = [
    { href: '/quiz/', label: 'Quiz', hint: 'Test yourself', icon: Sparkles, badge: undefined },
    {
      href: '/review/',
      label: 'Review',
      hint: reviewQueue.length > 0 ? `${reviewQueue.length} due` : 'All caught up',
      icon: RotateCcw,
      badge: reviewQueue.length || undefined,
    },
    {
      href: '/favorites/',
      label: 'Favorites',
      hint: favorites.length > 0 ? pluralize(favorites.length, 'Name') : 'None yet',
      icon: Star,
      badge: undefined,
    },
  ]
  return (
    <section aria-labelledby="quick-actions" className="space-y-3">
      <SectionTitle id="quick-actions">Quick actions</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        {actions.map(({ href, label, hint, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className="relative flex min-h-28 flex-col justify-between rounded-3xl border border-border bg-card p-4 transition-transform active:scale-[0.98]"
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block font-semibold">{label}</span>
              <span className="block text-xs text-muted-foreground">{hint}</span>
            </span>
            {badge ? (
              <span
                className="absolute top-3 right-3 grid min-w-6 place-items-center rounded-full bg-accent px-1.5 text-xs font-semibold text-white tabular-nums dark:text-background"
                aria-hidden
              >
                {badge}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
      <Link
        href="/surahs/"
        className="flex min-h-16 items-center gap-4 rounded-3xl border border-border bg-card p-4 transition-transform active:scale-[0.98]"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
          <BookOpenText className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">Surahs</span>
          <span className="block text-xs text-muted-foreground">
            All 114 surahs with Arabic and Bangla meaning
          </span>
        </span>
        <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
      </Link>
    </section>
  )
}

function ProgressSummary() {
  const summary = useProgressSummary()
  const quiz = useQuizStats()
  const streak = useStreak()
  return (
    <section aria-labelledby="your-progress" className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionTitle id="your-progress">Your progress</SectionTitle>
        <Link href="/progress/" className="inline-flex min-h-11 items-center px-1 text-sm font-medium text-primary">
          See all
        </Link>
      </div>
      <Card className="p-5">
        <div className="flex items-baseline justify-between">
          <p className="font-semibold">
            {summary.learned} <span className="text-muted-foreground">/ 99 Names</span>
          </p>
          <p className="text-sm font-semibold text-primary tabular-nums">{summary.percentage}%</p>
        </div>
        <ProgressBar className="mt-3" value={summary.learned} max={99} label="Names learned" />
      </Card>
      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Quizzes" value={quiz.total} />
        <StatTile label="Accuracy" value={quiz.total ? `${quiz.accuracy}%` : '–'} />
        <StatTile label="Streak" value={streak ? pluralize(streak.currentStreak, 'day') : '–'} />
      </div>
    </section>
  )
}
