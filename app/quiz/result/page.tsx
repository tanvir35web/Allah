import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoadingState } from '@/components/common/loading-state'
import { PageShell } from '@/components/layout/page-shell'
import { QuizResultView } from '@/components/quiz/quiz-result'

export const metadata: Metadata = { title: 'Quiz result', robots: { index: false } }

export default function QuizResultPage() {
  return (
    <PageShell title="Result" variant="compact" backHref="/quiz/" backLabel="Quiz">
      <Suspense fallback={<LoadingState rows={3} />}>
        <QuizResultView />
      </Suspense>
    </PageShell>
  )
}
