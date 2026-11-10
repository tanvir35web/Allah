import type { Metadata } from 'next'
import { PageShell } from '@/components/layout/page-shell'
import { ProgressDashboard } from '@/components/progress/progress-dashboard'

export const metadata: Metadata = { title: 'Progress' }

export default function ProgressPage() {
  return (
    <PageShell title="Progress" variant="compact" backHref="/more/" backLabel="More" maxWidth="medium">
      <ProgressDashboard />
    </PageShell>
  )
}
