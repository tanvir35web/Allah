import type { Metadata } from 'next'
import { PageShell } from '@/components/layout/page-shell'
import { SettingsScreen } from '@/components/settings/settings-screen'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <PageShell title="Settings" variant="compact" backHref="/more/" backLabel="More">
      <SettingsScreen />
    </PageShell>
  )
}
