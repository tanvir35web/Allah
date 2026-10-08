'use client'

import { LoadingState } from '@/components/common/loading-state'
import { NameProgress } from '@/components/names/name-progress'
import { useAppData } from '@/components/providers/app-data-provider'
import { Card, SectionTitle } from '@/components/ui/card'
import { useProgressSummary, useQuizStats, useStreak } from '@/hooks/use-derived-data'
import { pluralize } from '@/lib/utils'
import { ProgressCard, StatTile } from './progress-card'
import { QuranReadingCard } from './quran-reading-card'
import { StreakCard } from './streak-card'

export function ProgressDashboard() {
  const { ready } = useAppData()
  const summary = useProgressSummary()
  const quiz = useQuizStats()
  const streak = useStreak()

  if (!ready) return <LoadingState rows={4} />

  return (
    <div className="space-y-6">
      <ProgressCard />
      <StreakCard />
      <QuranReadingCard />

      <section aria-labelledby="stats-title" className="space-y-3">
        <SectionTitle id="stats-title">Statistics</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Names learned" value={summary.learned} />
          <StatTile label="In progress" value={summary.learning} />
          <StatTile label="Remaining" value={summary.notStarted} />
          <StatTile label="Quizzes taken" value={quiz.total} />
          <StatTile label="Quiz accuracy" value={quiz.total ? `${quiz.accuracy}%` : '–'} />
          <StatTile label="Current streak" value={streak ? pluralize(streak.currentStreak, 'day') : '–'} />
          <StatTile label="Longest streak" value={streak ? pluralize(streak.longestStreak, 'day') : '–'} />
          <StatTile label="Learning days" value={streak ? streak.totalLearningDays : '–'} />
        </div>
      </section>

      <section aria-labelledby="map-title" className="space-y-3">
        <SectionTitle id="map-title">All 99 Names</SectionTitle>
        <Card className="p-4">
          <NameProgress />
        </Card>
      </section>
    </div>
  )
}
