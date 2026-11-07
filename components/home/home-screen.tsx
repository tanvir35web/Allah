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

/**
 * Modern Islamic Home screen designed with standard UI/UX principles:
 * clean hierarchy, balanced grid rhythm, and peaceful spiritual aesthetics.
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* Top Row: Hero Name of the Day (7 cols) + Daily Goal Tracker (5 cols) */}
            <div className="lg:col-span-7">
              <DailyNameCard />
            </div>
            <div className="lg:col-span-5">
              <LearningHubCard />
            </div>

            {/* Bottom Row: Ayah of the Day (7 cols) + Practice & Explore (5 cols) */}
            <div className="lg:col-span-7">
              <AyahCard />
            </div>
            <div className="lg:col-span-5">
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

/** "Saturday, 7 November" above the title; localized to user preference. */
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

/** Unified Learning Hub: Daily Target + Overall Memorisation + Key Metrics */
function LearningHubCard() {
  const { settings } = useAppData()
  const todayActivity = useTodayActivity()
  const next = useNextName()
  const summary = useProgressSummary()
  const quiz = useQuizStats()
  const streak = useStreak()
  const reviewQueue = useReviewQueue()

  const learnedToday = todayActivity?.learnedNames.length ?? 0
  const goal = settings.dailyGoal
  const goalMet = learnedToday >= goal
  const remaining = goal - learnedToday

  return (
    <section aria-labelledby="learning-hub-title">
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-amber-500" aria-hidden />
          <h2 id="learning-hub-title" className="text-sm font-bold tracking-tight uppercase text-foreground">
            Daily Goal & Progress
          </h2>
        </div>
        <Link
          href="/progress/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>Dashboard</span>
          <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>

      <article className="pattern-stars relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-primary-soft/20 p-6 shadow-xs transition-shadow hover:shadow-sm">
        {/* Top: Streak & Goal Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flame className="size-5 fill-amber-500/20 text-amber-500" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-bold text-foreground">
                {streak && streak.currentStreak > 0 ? `${pluralize(streak.currentStreak, 'Day')} Streak` : 'Daily Streak'}
              </p>
              <p className="text-[0.6875rem] text-muted-foreground">Keep up your momentum</p>
            </div>
          </div>

          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-bold tabular-nums border',
              goalMet
                ? 'bg-success/15 border-success/30 text-success'
                : 'bg-primary/10 border-primary/20 text-primary',
            )}
          >
            {goalMet ? '✓ Completed' : `${remaining} to go today`}
          </span>
        </div>

        {/* Middle: Progress Ring + Goal Stats */}
        <div className="my-5 flex items-center gap-5">
          <div className="relative shrink-0">
            <ProgressRing
              value={Math.min(learnedToday, goal)}
              max={goal}
              size={80}
              stroke={7.5}
              label="Daily goal"
              valueText={goalMet ? `Goal reached` : `${learnedToday} of ${goal}`}
              tone={goalMet ? 'success' : 'primary'}
            >
              {goalMet ? (
                <Check className="size-7 text-success" strokeWidth={3} aria-hidden />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-extrabold tabular-nums text-foreground leading-none" aria-hidden>
                    {learnedToday}
                  </span>
                  <span className="text-[0.6875rem] font-bold text-muted-foreground tabular-nums">
                    /{goal}
                  </span>
                </div>
              )}
            </ProgressRing>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Daily Target
            </p>
            <h3 className="mt-0.5 text-base font-bold text-foreground">
              {goalMet ? 'Daily goal reached! Alhamdulillah.' : `${learnedToday} of ${pluralize(goal, 'Name')} memorised.`}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Total {summary.learned} / 99 Names memorised ({summary.percentage}%)
            </p>

            {/* Total Progress Bar */}
            <div className="mt-2.5">
              <ProgressBar value={summary.learned} max={99} label="Total Names learned" />
            </div>
          </div>
        </div>

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-4 mb-4">
          <div className="rounded-xl border border-border/50 bg-background/60 dark:bg-muted/30 px-3 py-2 text-center">
            <span className="text-[0.6875rem] font-medium text-muted-foreground block">Memory Accuracy</span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {quiz.total ? `${quiz.accuracy}%` : '–'}
            </span>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/60 dark:bg-muted/30 px-3 py-2 text-center">
            <span className="text-[0.6875rem] font-medium text-muted-foreground block">Review Due</span>
            <span className={cn('text-sm font-bold tabular-nums', reviewQueue.length ? 'text-danger' : 'text-foreground')}>
              {reviewQueue.length ? `${reviewQueue.length} Names` : 'All Caught Up'}
            </span>
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div>
          {next ? (
            <ButtonLink
              href="/learn/"
              size="lg"
              variant="primary"
              className="w-full rounded-2xl font-bold shadow-xs hover:shadow-md group flex items-center justify-between px-5"
            >
              <span className="flex items-center gap-2">
                <span>{goalMet ? 'Continue Learning' : 'Memorise Next Name'}</span>
                <span className="text-xs font-normal opacity-80">· {next.transliteration}</span>
              </span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </ButtonLink>
          ) : (
            <ButtonLink
              href="/review/"
              size="lg"
              variant="secondary"
              className="w-full rounded-2xl font-bold shadow-xs group flex items-center justify-between px-5"
            >
              <span>All 99 Learned · Spaced Review</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </ButtonLink>
          )}
        </div>
      </article>
    </section>
  )
}

/** Quick Access: 4 high-impact practice cards + secondary shortcuts */
function ExploreList() {
  const { favorites } = useAppData()
  const reviewQueue = useReviewQueue()

  const items = [
    {
      href: '/reels/',
      title: '99 Names Reels',
      subtitle: 'Visual swipe cards',
      tag: 'Swipe',
      tagAlert: false,
      icon: Clapperboard,
      theme: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 group-hover:border-rose-500/40',
    },
    {
      href: '/surahs/',
      title: 'The Holy Quran',
      subtitle: '114 Surahs with Bangla',
      tag: 'Quran',
      tagAlert: false,
      icon: BookOpenText,
      theme: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 group-hover:border-emerald-500/40',
    },
    {
      href: '/quiz/',
      title: 'Memory Quiz',
      subtitle: 'Test your retention',
      tag: 'Test',
      tagAlert: false,
      icon: Sparkles,
      theme: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 group-hover:border-amber-500/40',
    },
    {
      href: '/review/',
      title: 'Smart Review',
      subtitle: reviewQueue.length ? `${reviewQueue.length} names due` : 'All caught up',
      tag: reviewQueue.length ? `${reviewQueue.length} Due` : 'Spaced',
      tagAlert: reviewQueue.length > 0,
      icon: RotateCcw,
      theme: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 group-hover:border-blue-500/40',
    },
  ]

  return (
    <section aria-labelledby="explore-title">
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden />
          <h2 id="explore-title" className="text-sm font-bold tracking-tight uppercase text-foreground">
            Explore & Practice
          </h2>
        </div>
        <span className="text-xs text-muted-foreground font-medium">Quick Access</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map(({ href, title, subtitle, tag, tagAlert, icon: Icon, theme }) => (
          <Link
            key={href}
            href={href}
            className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] shadow-xs overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className={cn('grid size-10 place-items-center rounded-xl transition-transform group-hover:scale-105', theme)}>
                <Icon className="size-5" strokeWidth={2} aria-hidden />
              </span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[0.6875rem] font-bold tabular-nums',
                  tagAlert
                    ? 'bg-danger/15 text-danger'
                    : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors',
                )}
              >
                {tag}
              </span>
            </div>

            <div className="mt-3.5">
              <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Secondary Quick Links (Favorites & Analytics) */}
      <div className="mt-3 flex items-center justify-between gap-2 px-1">
        <Link
          href="/favorites/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          <Star className="size-3.5 fill-accent/20 text-accent" />
          <span>Saved Favorites ({favorites.length})</span>
        </Link>
        <Link
          href="/progress/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          <BarChart3 className="size-3.5 text-primary" />
          <span>Full Analytics</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </section>
  )
}
