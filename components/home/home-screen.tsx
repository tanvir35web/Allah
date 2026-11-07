'use client'

import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  Check,
  Clapperboard,
  Flame,
  RotateCcw,
  Sparkles,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import { LoadingState } from '@/components/common/loading-state'
import { StorageNotice } from '@/components/common/storage-notice'
import { StreakPill } from '@/components/progress/streak-card'
import { useAppData } from '@/components/providers/app-data-provider'
import { ButtonLink } from '@/components/ui/button'
import { ProgressBar, ProgressRing } from '@/components/ui/progress-bar'
import {
  useNextName,
  useProgressSummary,
  useReviewQueue,
  useStreak,
  useTodayActivity,
} from '@/hooks/use-derived-data'
import { useToday } from '@/hooks/use-today'
import { cn, pluralize } from '@/lib/utils'
import { AyahCard } from './ayah-card'
import { DailyNameCard } from './daily-name-card'
import { Onboarding } from './onboarding'

/**
 * Clean, distraction-free Islamic home screen.
 * Optimized for pixel-perfect visual alignment and spacious, balanced typography.
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
            <h1 className="mt-0.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
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

      <main id="main" className="animate-rise pb-nav md:pb-12 mx-auto max-w-2xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl px-4 md:px-8 pt-4">
        <StorageNotice />
        {ready ? (
          <div className="space-y-6">
            {/* Top Row: Daily Name Hero (7 cols) + Daily Goal (5 cols) - Equal Height & Baseline */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-7 flex flex-col">
                <DailyNameCard />
              </div>
              <div className="lg:col-span-5 flex flex-col">
                <LearningHubCard />
              </div>
            </div>

            {/* Bottom Row: Ayah of the Day (7 cols) + Quick Access (5 cols) - Equal Height & Baseline */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-7 flex flex-col">
                <AyahCard />
              </div>
              <div className="lg:col-span-5 flex flex-col">
                <ExploreList />
              </div>
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

function TodayCaption() {
  const today = useToday()
  const { settings } = useAppData()
  let label = ''
  if (today) {
    const [year, month, day] = today.split('-').map(Number)
    const formatter = new Intl.DateTimeFormat(settings.language === 'bn' ? 'bn-BD' : undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    label = formatter.format(new Date(year ?? 0, (month ?? 1) - 1, day ?? 1))
  }
  return (
    <p className="min-h-5 text-xs font-semibold tracking-wider text-primary uppercase">{label}</p>
  )
}

/** Clean, focused Daily Goal card aligned visually with the Name of the Day card. */
function LearningHubCard() {
  const { settings } = useAppData()
  const todayActivity = useTodayActivity()
  const next = useNextName()
  const summary = useProgressSummary()
  const streak = useStreak()

  const learnedToday = todayActivity?.learnedNames.length ?? 0
  const goal = settings.dailyGoal
  const goalMet = learnedToday >= goal
  const remaining = goal - learnedToday

  return (
    <section aria-labelledby="learning-hub-title" className="flex flex-col h-full">
      {/* Header height h-7 exactly matches Name of the Day header */}
      <div className="mb-2 flex items-center justify-between px-1 h-7">
        <h2 id="learning-hub-title" className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          Daily Goal
        </h2>
        <Link
          href="/progress/"
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Dashboard →
        </Link>
      </div>

      <article className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-xs hover:border-primary/30 transition-all duration-200">
        {/* Streak & Status matching height of Name card's top bar */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Flame className="size-3.5 fill-amber-500/20 text-amber-500" aria-hidden />
            <span>
              {streak && streak.currentStreak > 0 ? `${pluralize(streak.currentStreak, 'Day')} Streak` : 'Daily Habit'}
            </span>
          </div>

          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums',
              goalMet ? 'bg-success/15 text-success' : 'bg-primary/10 text-primary',
            )}
          >
            {goalMet ? '✓ Completed' : `${remaining} to go`}
          </span>
        </div>

        {/* Progress Ring + Goal Summary */}
        <div className="my-auto py-3 flex items-center gap-4">
          <div className="shrink-0">
            <ProgressRing
              value={Math.min(learnedToday, goal)}
              max={goal}
              size={72}
              stroke={6.5}
              label="Daily goal"
              valueText={goalMet ? 'Goal reached' : `${learnedToday} of ${goal}`}
              tone={goalMet ? 'success' : 'primary'}
            >
              {goalMet ? (
                <Check className="size-6 text-success" strokeWidth={3} aria-hidden />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-base font-extrabold tabular-nums text-foreground leading-none" aria-hidden>
                    {learnedToday}
                  </span>
                  <span className="text-[0.625rem] font-bold text-muted-foreground tabular-nums">
                    /{goal}
                  </span>
                </div>
              )}
            </ProgressRing>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-foreground">
              {goalMet ? 'Daily goal reached!' : `${learnedToday} of ${pluralize(goal, 'Name')} memorised`}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {summary.learned} of 99 Names memorised ({summary.percentage}%)
            </p>

            <div className="mt-2.5">
              <ProgressBar value={summary.learned} max={99} label="Total Names learned" />
            </div>
          </div>
        </div>

        {/* Action Button - height, border radius, and bottom alignment match Name card */}
        <div>
          {next ? (
            <ButtonLink
              href="/learn/"
              size="md"
              variant="primary"
              className="w-full rounded-2xl font-bold shadow-xs hover:shadow-sm group flex items-center justify-between px-5 transition-all"
            >
              <span className="truncate">
                {goalMet ? 'Continue Learning' : 'Memorise Next Name'}
                <span className="ml-1 text-xs font-normal opacity-80">· {next.transliteration}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
            </ButtonLink>
          ) : (
            <ButtonLink
              href="/review/"
              size="md"
              variant="secondary"
              className="w-full rounded-2xl font-bold shadow-xs group flex items-center justify-between px-5 transition-all"
            >
              <span>All 99 Learned · Review</span>
              <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
            </ButtonLink>
          )}
        </div>
      </article>
    </section>
  )
}

/** Clean, modern 2x2 action cards with matching height to AyahCard. */
function ExploreList() {
  const { favorites } = useAppData()
  const reviewQueue = useReviewQueue()

  const items = [
    {
      href: '/reels/',
      title: 'Reels',
      icon: Clapperboard,
      color: 'text-rose-500 bg-rose-500/10 group-hover:bg-rose-500/15',
    },
    {
      href: '/surahs/',
      title: 'The Quran',
      icon: BookOpenText,
      color: 'text-emerald-500 bg-emerald-500/10 group-hover:bg-emerald-500/15',
    },
    {
      href: '/quiz/',
      title: 'Quiz',
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-500/10 group-hover:bg-amber-500/15',
    },
    {
      href: '/review/',
      title: 'Review',
      badge: reviewQueue.length ? `${reviewQueue.length}` : undefined,
      icon: RotateCcw,
      color: 'text-blue-500 bg-blue-500/10 group-hover:bg-blue-500/15',
    },
  ]

  return (
    <section aria-labelledby="explore-title" className="flex flex-col h-full">
      <div className="mb-2 flex items-center justify-between px-1 h-7">
        <h2 id="explore-title" className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          Quick Access
        </h2>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="grid grid-cols-2 gap-3 flex-1">
          {items.map(({ href, title, badge, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs hover:border-primary/40 active:scale-[0.99]"
            >
              <span className={cn('grid size-10 place-items-center rounded-xl transition-transform group-hover:scale-105 shrink-0', color)}>
                <Icon className="size-5" strokeWidth={2} aria-hidden />
              </span>

              <div className="min-w-0 flex-1">
                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors block truncate">
                  {title}
                </span>
              </div>

              {badge ? (
                <span className="rounded-full bg-danger/15 text-danger px-2 py-0.5 text-xs font-bold tabular-nums shrink-0">
                  {badge}
                </span>
              ) : null}
            </Link>
          ))}
        </div>

        {/* Subtle secondary links */}
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <Link
            href="/favorites/"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors py-1"
          >
            <Star className="size-3.5 fill-accent/20 text-accent" />
            <span>Favorites ({favorites.length})</span>
          </Link>
          <Link
            href="/progress/"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors py-1"
          >
            <BarChart3 className="size-3.5 text-primary" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
