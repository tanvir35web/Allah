import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoadingState } from '@/components/common/loading-state'
import { PageShell } from '@/components/layout/page-shell'
import { LearnSession } from '@/components/learn/learn-session'

export const metadata: Metadata = {
  title: 'Learn',
  description: 'Learn the 99 Names of Allah one at a time.',
}

export default function LearnPage() {
  return (
    <PageShell title="Learn" variant="compact" backHref="/" backLabel="Home">
      {/* useSearchParams needs a Suspense boundary in a static export. */}
      <Suspense fallback={<LoadingState rows={2} />}>
        <LearnSession />
      </Suspense>
    </PageShell>
  )
}
