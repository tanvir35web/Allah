'use client'

import { LoadingState } from '@/components/common/loading-state'
import { NameProgress } from '@/components/names/name-progress'
import { useAppData } from '@/components/providers/app-data-provider'
import { Card, SectionTitle } from '@/components/ui/card'
import { useQuizStats, useStreak } from '@/hooks/use-derived-data'
import { pluralize } from '@/lib/utils'
import { ProgressCard, StatTile } from './progress-card'
import { QuranReadingCard } from './quran-reading-card'
import { StreakCard } from './streak-card'

/**
 * Progress at a glance. Each number appears once: learned / learning /
 * remaining in the ring card, the current streak in the streak card, and the
 * rest in the tiles.
 */
export function ProgressDashboard() {
  const { ready } = useAppData()
  const quiz = useQuizStats()
  const streak = useStreak()

  if (!ready) return <LoadingState rows={4} />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProgressCard />
        <StreakCard />
      </div>

      <QuranReadingCard />

      <section aria-labelledby="stats-title" className="space-y-2">
        <SectionTitle id="stats-title">More numbers</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Quizzes taken" value={quiz.total} />
          <StatTile label="Quiz accuracy" value={quiz.total ? `${quiz.accuracy}%` : '–'} />
          <StatTile label="Longest streak" value={streak ? pluralize(streak.longestStreak, 'day') : '–'} />
          <StatTile label="Learning days" value={streak ? streak.totalLearningDays : '–'} />
        </div>
      </section>

      <section aria-labelledby="map-title" className="space-y-2">
        <SectionTitle id="map-title">All 99 Names</SectionTitle>
        <Card className="p-4 md:p-5">
          <NameProgress />
        </Card>
      </section>

      <p className="text-center text-xs text-muted-foreground">Stored privately on this device.</p>
    </div>
  )
}
