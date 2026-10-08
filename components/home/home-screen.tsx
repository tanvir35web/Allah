'use client'

import {
  BookOpenText,
  Check,
  ChevronRight,
  Clapperboard,
  RotateCcw,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { LoadingState } from '@/components/common/loading-state'
import { StorageNotice } from '@/components/common/storage-notice'
import { StreakPill } from '@/components/progress/streak-card'
import { useAppData } from '@/components/providers/app-data-provider'
import { ButtonLink } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
      <header className="safe-top mx-auto max-w-2xl px-4">
        <div className="flex items-end justify-between gap-3 pt-5">
          <div className="min-w-0">
            <TodayCaption />
            <h1 className="text-[2.125rem] leading-tight font-bold tracking-tight">Assalamu Alaikum</h1>
          </div>
          <Link href="/progress/" aria-label="Streak, see progress" className="mb-1 shrink-0 rounded-full">
            <StreakPill />
          </Link>
        </div>
      </header>

      <main id="main" className="animate-rise pb-nav mx-auto max-w-2xl space-y-8 px-4 pt-5">
        <StorageNotice />
        {ready ? <TodayCard /> : <LoadingState rows={1} />}
        <DailyNameCard />
       
        {ready ? (
          <>
            <ExploreList />
             <AyahCard />
            <ProgressSummary />
          </>
        ) : (
          <LoadingState rows={2} />
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
    <p className="min-h-5 text-[0.8125rem] font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
  )
}

function SectionHeader({ id, title, action }: { id: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-2 flex min-h-11 items-center justify-between px-1">
      <h2 id={id} className="text-[1.375rem] leading-tight font-bold tracking-tight">
        {title}
      </h2>
      {action}
    </div>
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
      <SectionHeader id="today-title" title="Today" />
      <Card className="p-5">
        <div className="flex items-center gap-5">
          {/* Status is given by the ring, the check icon and the title, never by colour alone. */}
          <ProgressRing
            value={Math.min(learnedToday, goal)}
            max={goal}
            size={88}
            stroke={9}
            label="Daily goal"
            valueText={goalMet ? `Goal reached, ${summary}` : summary}
            tone={goalMet ? 'success' : 'primary'}
          >
            {goalMet ? (
              <Check className="size-9 text-success" strokeWidth={2.75} aria-hidden />
            ) : (
              <span className="text-[1.75rem] leading-none font-bold tabular-nums" aria-hidden>
                {learnedToday}
                <span className="text-[0.9375rem] font-semibold text-muted-foreground">/{goal}</span>
              </span>
            )}
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <p className="text-[0.8125rem] font-semibold tracking-wide text-muted-foreground uppercase">Daily Goal</p>
            <p className="mt-0.5 text-[1.375rem] leading-tight font-bold tracking-tight">
              {goalMet ? 'Goal Reached' : `${pluralize(remaining, 'Name')} to Go`}
            </p>
            <p className="mt-1 text-[0.9375rem] text-muted-foreground">
              {goalMet ? `${pluralize(learnedToday, 'Name')} learned today. Alhamdulillah.` : summary}
            </p>
          </div>
        </div>
        {next ? (
          <ButtonLink
            href="/learn/"
            size="lg"
            variant={goalMet ? 'secondary' : 'primary'}
            className="mt-5 w-full rounded-xl"
          >
            {goalMet ? 'Keep Learning' : 'Continue Learning'}
            <span className="truncate font-normal opacity-80">· {next.transliteration}</span>
          </ButtonLink>
        ) : (
          <ButtonLink href="/review/" size="lg" variant="secondary" className="mt-5 w-full rounded-xl">
            All 99 Learned · Review
          </ButtonLink>
        )}
      </Card>
    </section>
  )
}

interface ExploreItem {
  href: string
  label: string
  icon: LucideIcon
  /** Icon tile colour, after the iOS system colours. */
  tint: string
  detail?: string
  badge?: number
}

/** An iOS inset grouped list: coloured icon tiles, inset separators, chevrons. */
function ExploreList() {
  const { favorites } = useAppData()
  const reviewQueue = useReviewQueue()
  const items: ExploreItem[] = [
    { href: '/quiz/', label: 'Quiz', icon: Sparkles, tint: 'bg-[#ff9500]', detail: 'Test yourself' },
    {
      href: '/review/',
      label: 'Review',
      icon: RotateCcw,
      tint: 'bg-[#007aff]',
      detail: reviewQueue.length ? undefined : 'All caught up',
      badge: reviewQueue.length || undefined,
    },
    {
      href: '/favorites/',
      label: 'Favorites',
      icon: Star,
      tint: 'bg-[#ffcc00]',
      detail: favorites.length ? String(favorites.length) : 'None yet',
    },
    { href: '/reels/', label: 'Reels', icon: Clapperboard, tint: 'bg-[#ff2d55]', detail: '99 Names' },
    { href: '/surahs/', label: 'Quran', icon: BookOpenText, tint: 'bg-[#34c759]', detail: '114' },
  ]

  return (
    <section aria-labelledby="explore-title">
      <SectionHeader id="explore-title" title="Explore" />
      <Card className="overflow-hidden">
        <ul className='py-2'>
          {items.map(({ href, label, icon: Icon, tint, detail, badge }, index) => (
            <li key={href}>
              <Link href={href} className="flex min-h-14 items-center gap-3 pl-4 transition-colors active:bg-muted">
                <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg text-white', tint)}>
                  <Icon className="size-[1.125rem]" strokeWidth={2.2} aria-hidden />
                </span>
                {/* The separator starts at the label, as in iOS lists. */}
                <span
                  className={cn(
                    'flex min-h-12 min-w-0 flex-1 items-center gap-2 pr-3',
                    index > 0 && 'border-t border-border',
                  )}
                >
                  <span className="flex-1 truncate text-[1.0625rem]">{label}</span>
                  {badge ? (
                    <span className="grid min-w-6 place-items-center rounded-full bg-[#ff3b30] px-1.5 text-sm font-semibold text-white tabular-nums">
                      {badge}
                      <span className="sr-only"> due</span>
                    </span>
                  ) : null}
                  {detail ? <span className="text-[1.0625rem] text-muted-foreground">{detail}</span> : null}
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground/60" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  )
}

function ProgressSummary() {
  const summary = useProgressSummary()
  const quiz = useQuizStats()
  const streak = useStreak()
  const stats = [
    { label: 'Quizzes', value: String(quiz.total) },
    { label: 'Accuracy', value: quiz.total ? `${quiz.accuracy}%` : '–' },
    { label: 'Streak', value: streak ? pluralize(streak.currentStreak, 'day') : '–' },
  ]
  return (
    <section aria-labelledby="your-progress">
      <SectionHeader
        id="your-progress"
        title="Progress"
        action={
          <Link href="/progress/" className="-mr-1 inline-flex min-h-11 items-center px-1 text-[1.0625rem] text-primary">
            See All
          </Link>
        }
      />
      <Card className="p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-[1.0625rem] font-semibold">
            {summary.learned} <span className="font-normal text-muted-foreground">of 99 Names learned</span>
          </p>
          <p className="text-[0.9375rem] font-semibold text-primary tabular-nums">{summary.percentage}%</p>
        </div>
        <ProgressBar className="mt-3" value={summary.learned} max={99} label="Names learned" />
        <dl className="mt-5 grid grid-cols-3 divide-x divide-border border-t border-border pt-4">
          {stats.map(({ label, value }) => (
            <div key={label} className="px-2 text-center first:pl-0 last:pr-0">
              <dt className="text-[0.8125rem] text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 text-xl font-bold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </section>
  )
}
