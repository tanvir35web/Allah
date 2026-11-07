'use client'

import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  Check,
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

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

/**
 * Home, laid out like an iOS summary screen (Health, Fitness): a date caption
 * over a large title, a featured card, then titled sections with an inset
 * grouped list for navigation.
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
            <h1 className="text-[2.125rem] md:text-[2.625rem] leading-tight font-extrabold tracking-tight text-foreground">
              Assalamu Alaikum
            </h1>
            <p className="mt-0.5 text-xs md:text-sm text-muted-foreground">
              Reflect upon the beautiful names of Allah today.
            </p>
          </div>
          <Link href="/progress/" aria-label="Streak, see progress" className="mb-1 shrink-0 rounded-full">
            <StreakPill />
          </Link>
        </div>
      </header>

      <main id="main" className="animate-rise pb-nav md:pb-12 mx-auto max-w-2xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl space-y-8 px-4 md:px-8 pt-5">
        <StorageNotice />
        {ready ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            <div className="space-y-8 lg:col-span-7">
              <TodayCard />
              <DailyNameCard />
              <AyahCard />
            </div>
            <div className="space-y-8 lg:col-span-5">
              <ProgressSummary />
              <ExploreList />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <LoadingState rows={1} />
            <LoadingState rows={2} />
          </div>
        )}
      </main>
    </>
  )
}

/** "WEDNESDAY, 8 OCTOBER" above the title; empty until the client knows the date. */
function TodayCaption() {
  const today = useToday()
  let label = ''
  if (today) {
    const [year, month, day] = today.split('-').map(Number)
    label = DATE_FORMAT.format(new Date(year ?? 0, (month ?? 1) - 1, day ?? 1))
  }
  return (
    <p className="min-h-5 text-[0.8125rem] font-semibold tracking-wider text-primary uppercase">{label}</p>
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
  const summary = `${learnedToday} of ${pluralize(goal, 'Name')} learned today`

  return (
    <section aria-labelledby="today-title">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <Target className="size-4" aria-hidden />
          </span>
          <h2 id="today-title" className="text-[1.375rem] leading-tight font-bold tracking-tight">
            Today’s Goal
          </h2>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums',
            goalMet ? 'bg-success/15 text-success' : 'bg-primary/10 text-primary',
          )}
        >
          {goalMet ? 'Completed' : `${remaining} to go`}
        </span>
      </div>

      <article className="pattern-stars relative overflow-hidden rounded-[2.25rem] border border-border/80 bg-gradient-to-br from-card via-card to-primary-soft/30 p-6 md:p-7 shadow-[0_2px_12px_rgb(0_0_0/0.04)] transition-all hover:shadow-md">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <ProgressRing
              value={Math.min(learnedToday, goal)}
              max={goal}
              size={92}
              stroke={9}
              label="Daily goal"
              valueText={goalMet ? `Goal reached, ${summary}` : summary}
              tone={goalMet ? 'success' : 'primary'}
            >
              {goalMet ? (
                <Check className="size-9 text-success" strokeWidth={3} aria-hidden />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-[1.75rem] leading-none font-bold tabular-nums" aria-hidden>
                    {learnedToday}
                  </span>
                  <span className="text-[0.75rem] font-semibold text-muted-foreground tabular-nums">
                    /{goal}
                  </span>
                </div>
              )}
            </ProgressRing>
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Memorisation
            </span>
            <h3 className="mt-0.5 text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {goalMet ? 'Daily Goal Reached!' : `${pluralize(remaining, 'Name')} to Learn`}
            </h3>
            <p className="mt-1 text-xs md:text-sm text-muted-foreground leading-relaxed">
              {goalMet
                ? `${pluralize(learnedToday, 'Name')} memorised today. Alhamdulillah!`
                : `${summary}. Keep going!`}
            </p>
          </div>
        </div>

        {next ? (
          <ButtonLink
            href="/learn/"
            size="lg"
            variant={goalMet ? 'secondary' : 'primary'}
            className="mt-5 w-full rounded-2xl group shadow-xs hover:shadow-sm"
          >
            <span>{goalMet ? 'Keep Learning Next' : 'Continue Learning'}</span>
            <span className="truncate opacity-80">· {next.transliteration}</span>
            <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-1" aria-hidden />
          </ButtonLink>
        ) : (
          <ButtonLink href="/review/" size="lg" variant="secondary" className="mt-5 w-full rounded-2xl group shadow-xs">
            <span>All 99 Learned · Review</span>
            <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-1" aria-hidden />
          </ButtonLink>
        )}
      </article>
    </section>
  )
}

interface ExploreItem {
  href: string
  label: string
  icon: LucideIcon
  /** Icon tile colour or gradient */
  tint: string
  accentBg: string
  detail?: string
  badge?: number
}

/** Action tiles grid for primary practice and exploration */
function ExploreList() {
  const { favorites } = useAppData()
  const reviewQueue = useReviewQueue()
  const summary = useProgressSummary()
  const items: ExploreItem[] = [
    {
      href: '/quiz/',
      label: 'Quiz',
      icon: Sparkles,
      tint: 'bg-gradient-to-br from-amber-400 to-amber-600',
      accentBg: 'hover:border-amber-500/40',
      detail: 'Test yourself',
    },
    {
      href: '/progress/',
      label: 'Progress',
      icon: BarChart3,
      tint: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
      accentBg: 'hover:border-indigo-500/40',
      detail: `${summary.learned}/99 learned`,
    },
    {
      href: '/reels/',
      label: 'Reels',
      icon: Clapperboard,
      tint: 'bg-gradient-to-br from-rose-400 to-rose-600',
      accentBg: 'hover:border-rose-500/40',
      detail: 'Swipe 99 Names',
    },
    {
      href: '/surahs/',
      label: 'Quran',
      icon: BookOpenText,
      tint: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
      accentBg: 'hover:border-emerald-500/40',
      detail: 'All 114 Surahs',
    },
    {
      href: '/review/',
      label: 'Review',
      icon: RotateCcw,
      tint: 'bg-gradient-to-br from-blue-400 to-blue-600',
      accentBg: 'hover:border-blue-500/40',
      detail: reviewQueue.length ? undefined : 'All caught up',
      badge: reviewQueue.length || undefined,
    },
    {
      href: '/favorites/',
      label: 'Favorites',
      icon: Star,
      tint: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      accentBg: 'hover:border-yellow-500/40',
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
          <h2 id="explore-title" className="text-[1.375rem] leading-tight font-bold tracking-tight">
            Explore & Practice
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-3.5">
        {items.map(({ href, label, icon: Icon, tint, accentBg, detail, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'group relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-border/80 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]',
              accentBg,
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className={cn('grid size-11 place-items-center rounded-2xl text-white shadow-xs transition-transform group-hover:scale-105', tint)}>
                <Icon className="size-5" strokeWidth={2.2} aria-hidden />
              </span>
              {badge ? (
                <span className="grid min-w-5 place-items-center rounded-full bg-danger px-1.5 py-0.5 text-xs font-bold text-white tabular-nums shadow-xs">
                  {badge}
                </span>
              ) : (
                <ChevronRight className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden />
              )}
            </div>

            <div className="mt-3.5">
              <p className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {label}
              </p>
              {detail ? (
                <p className="mt-0.5 text-xs text-muted-foreground truncate">{detail}</p>
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
    { label: 'Quizzes', value: String(quiz.total), icon: Sparkles, color: 'text-amber-500' },
    { label: 'Accuracy', value: quiz.total ? `${quiz.accuracy}%` : '–', icon: Trophy, color: 'text-emerald-500' },
    { label: 'Streak', value: streak ? pluralize(streak.currentStreak, 'day') : '–', icon: Flame, color: 'text-orange-500' },
  ]
  return (
    <section aria-labelledby="your-progress">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="size-4" aria-hidden />
          </span>
          <h2 id="your-progress" className="text-[1.375rem] leading-tight font-bold tracking-tight">
            Your Progress
          </h2>
        </div>
        <Link
          href="/progress/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          <span>Dashboard</span>
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      <article className="pattern-stars relative overflow-hidden rounded-[2.25rem] border border-border/80 bg-gradient-to-br from-card via-card to-primary-soft/20 p-6 md:p-7 shadow-[0_2px_12px_rgb(0_0_0/0.04)] transition-all hover:shadow-md">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-foreground tabular-nums">
              {summary.learned}{' '}
              <span className="text-base font-normal text-muted-foreground">/ 99 Names</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {summary.learning} in progress · {summary.notStarted} remaining
            </p>
          </div>
          <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary tabular-nums">
            {summary.percentage}%
          </span>
        </div>

        <ProgressBar className="mt-4" value={summary.learned} max={99} label="Names learned" />

        <div className="mt-5 grid grid-cols-3 gap-2.5 pt-4 border-t border-border/70">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl bg-muted/40 p-3 text-center border border-border/50">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Icon className={cn('size-3.5', color)} aria-hidden />
                <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
              </div>
              <p className="text-lg md:text-xl font-bold tabular-nums text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
