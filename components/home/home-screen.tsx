'use client'

import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  ChevronRight,
  Clapperboard,
  Compass,
  Flame,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { LoadingState } from '@/components/common/loading-state'
import { StorageNotice } from '@/components/common/storage-notice'
import { StreakPill } from '@/components/progress/streak-card'
import { useAppData } from '@/components/providers/app-data-provider'
import { ButtonLink } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import {
  useNextName,
  useProgressSummary,
  useQuizStats,
  useReviewQueue,
  useStreak,
  useTodayActivity,
} from '@/hooks/use-derived-data'
import { useToday } from '@/hooks/use-today'
import { cn, pluralize } from '@/lib/utils'
import { AyahCard } from './ayah-card'
import { DailyNameCard } from './daily-name-card'
import { Onboarding } from './onboarding'

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

/**
 * Home screen following standard modern UI/UX design: clean hierarchy,
 * restrained typography, and serene Islamic aesthetics.
 */
export function HomeScreen() {
  const { ready, settings } = useAppData()

  if (ready && !settings.onboardingComplete) return <Onboarding />

  return (
    <>
      <header className="safe-top mx-auto max-w-2xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl px-4 md:px-8">
        <div className="flex items-end justify-between gap-3 pt-5 md:pt-8 pb-1">
          <div className="min-w-0">
            <TodayCaption />
            <h1 className="mt-0.5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Assalamu Alaikum
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
              Learn, remember and reflect upon the 99 Names of Allah
            </p>
          </div>
          <Link href="/progress/" aria-label="Streak, see progress" className="mb-1 shrink-0 rounded-full">
            <StreakPill />
          </Link>
        </div>
      </header>

      <main id="main" className="animate-rise pb-nav md:pb-12 mx-auto max-w-2xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl space-y-6 px-4 md:px-8 pt-4">
        <StorageNotice />
        {ready ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            <div className="space-y-6 lg:col-span-7">
              <TodayCard />
              <DailyNameCard />
              <AyahCard />
            </div>
            <div className="space-y-6 lg:col-span-5">
              <ProgressSummary />
              <ExploreList />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <LoadingState rows={1} />
            <LoadingState rows={2} />
          </div>
        )}
      </main>
    </>
  )
}

/** "Saturday, 7 November" above the title; empty until the client knows the date. */
function TodayCaption() {
  const today = useToday()
  let label = ''
  if (today) {
    const [year, month, day] = today.split('-').map(Number)
    label = DATE_FORMAT.format(new Date(year ?? 0, (month ?? 1) - 1, day ?? 1))
  }
  return (
    <p className="min-h-5 text-xs font-medium tracking-wide text-primary uppercase">{label}</p>
  )
}

function TodayCard() {
  const { settings } = useAppData()
  const todayActivity = useTodayActivity()
  const next = useNextName()
  const learnedToday = todayActivity?.learnedNames.length ?? 0
  const goal = settings.dailyGoal
  const goalMet = learnedToday >= goal
  const remaining = goal - learnedToday
  const progressPercent = Math.min(100, Math.round((learnedToday / goal) * 100))

  return (
    <section aria-labelledby="today-title">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <Target className="size-4" aria-hidden />
          </span>
          <h2 id="today-title" className="text-base font-semibold text-foreground">
            Daily Goal
          </h2>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums',
            goalMet ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground',
          )}
        >
          {goalMet ? 'Goal reached' : `${remaining} to go`}
        </span>
      </div>

      <article className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {learnedToday} <span className="text-sm font-normal text-muted-foreground">of {pluralize(goal, 'Name')} learned</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {goalMet
                ? 'Well done! Keep reviewing to maintain memory.'
                : `${remaining} more to achieve today's memorisation target.`}
            </p>
          </div>
          <span className="text-lg font-bold text-primary tabular-nums">
            {progressPercent}%
          </span>
        </div>

        <ProgressBar className="mt-4" value={learnedToday} max={goal} label="Daily goal" />

        <div className="mt-5">
          {next ? (
            <ButtonLink
              href="/learn/"
              size="lg"
              variant={goalMet ? 'secondary' : 'primary'}
              className="w-full rounded-xl font-medium group"
            >
              <span>{goalMet ? 'Learn Next Name' : 'Continue Memorising'}</span>
              <span className="opacity-80">· {next.transliteration}</span>
              <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-1" aria-hidden />
            </ButtonLink>
          ) : (
            <ButtonLink href="/review/" size="lg" variant="secondary" className="w-full rounded-xl font-medium group">
              <span>All 99 Learned · Review</span>
              <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-1" aria-hidden />
            </ButtonLink>
          )}
        </div>
      </article>
    </section>
  )
}

interface ExploreItem {
  href: string
  label: string
  icon: LucideIcon
  detail?: string
  badge?: number
}

/** Standard cohesive action tiles grid for explore & practice */
function ExploreList() {
  const { favorites } = useAppData()
  const reviewQueue = useReviewQueue()
  const summary = useProgressSummary()
  const items: ExploreItem[] = [
    {
      href: '/quiz/',
      label: 'Quiz',
      icon: Sparkles,
      detail: 'Test yourself',
    },
    {
      href: '/progress/',
      label: 'Progress',
      icon: BarChart3,
      detail: `${summary.learned}/99 learned`,
    },
    {
      href: '/reels/',
      label: 'Reels',
      icon: Clapperboard,
      detail: 'Swipe 99 Names',
    },
    {
      href: '/surahs/',
      label: 'Quran',
      icon: BookOpenText,
      detail: '114 Surahs',
    },
    {
      href: '/review/',
      label: 'Review',
      icon: RotateCcw,
      detail: reviewQueue.length ? 'Review due' : 'All caught up',
      badge: reviewQueue.length || undefined,
    },
    {
      href: '/favorites/',
      label: 'Favorites',
      icon: Star,
      detail: favorites.length ? `${favorites.length} saved` : 'Saved names',
      badge: favorites.length || undefined,
    },
  ]

  return (
    <section aria-labelledby="explore-title">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <Compass className="size-4" aria-hidden />
          </span>
          <h2 id="explore-title" className="text-base font-semibold text-foreground">
            Explore
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {items.map(({ href, label, icon: Icon, detail, badge }) => (
          <Link
            key={href}
            href={href}
            className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-3.5 transition-all duration-150 hover:border-primary/40 hover:bg-muted/30 active:scale-[0.99] shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-4.5" strokeWidth={2} aria-hidden />
              </span>
              {badge ? (
                <span className="rounded-full bg-primary-soft text-primary px-2 py-0.5 text-xs font-semibold tabular-nums">
                  {badge}
                </span>
              ) : (
                <ChevronRight className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden />
              )}
            </div>

            <div className="mt-3">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {label}
              </p>
              {detail ? (
                <p className="text-xs text-muted-foreground truncate mt-0.5">{detail}</p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ProgressSummary() {
  const summary = useProgressSummary()
  const quiz = useQuizStats()
  const streak = useStreak()
  const stats = [
    { label: 'Quizzes', value: String(quiz.total), icon: Sparkles },
    { label: 'Accuracy', value: quiz.total ? `${quiz.accuracy}%` : '–', icon: Trophy },
    { label: 'Streak', value: streak ? pluralize(streak.currentStreak, 'day') : '–', icon: Flame },
  ]
  return (
    <section aria-labelledby="your-progress">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="size-4" aria-hidden />
          </span>
          <h2 id="your-progress" className="text-base font-semibold text-foreground">
            Memorisation Overview
          </h2>
        </div>
        <Link
          href="/progress/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>See all</span>
          <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>

      <article className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {summary.learned} <span className="text-sm font-normal text-muted-foreground">/ 99 Names</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {summary.learning} learning · {summary.notStarted} remaining
            </p>
          </div>
          <span className="text-base font-bold text-primary tabular-nums">
            {summary.percentage}%
          </span>
        </div>

        <ProgressBar className="mt-3.5" value={summary.learned} max={99} label="Names learned" />

        <div className="mt-5 grid grid-cols-3 divide-x divide-border border-t border-border/60 pt-4 text-center">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="px-2">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Icon className="size-3.5" aria-hidden />
                <span className="text-xs font-medium">{label}</span>
              </div>
              <p className="mt-1 text-base sm:text-lg font-bold tabular-nums text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
