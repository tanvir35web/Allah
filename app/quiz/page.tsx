import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoadingState } from '@/components/common/loading-state'
import { PageShell } from '@/components/layout/page-shell'
import { QuizScreen } from '@/components/quiz/quiz-screen'

export const metadata: Metadata = {
  title: 'Quiz',
  description: 'Practise the 99 Names of Allah with short quizzes on meanings, Arabic script and Bangla.',
}

export default function QuizPage() {
  return (
    <PageShell title="Quiz" subtitle="Short, gentle practice. Five questions is enough.">
      <Suspense fallback={<LoadingState rows={3} />}>
        <QuizScreen />
      </Suspense>
    </PageShell>
  )
}
