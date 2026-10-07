import type { Metadata } from 'next'
import { PageShell } from '@/components/layout/page-shell'
import { ReviewScreen } from '@/components/review/review-screen'

export const metadata: Metadata = { title: 'Review' }

export default function ReviewPage() {
  return (
    <PageShell title="Review" variant="compact" backHref="/more/" backLabel="More">
      <ReviewScreen />
    </PageShell>
  )
}
