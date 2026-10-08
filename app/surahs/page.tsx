import type { Metadata } from 'next'
import { PageShell } from '@/components/layout/page-shell'
import { SurahList } from '@/components/surahs/surah-list'

export const metadata: Metadata = {
  title: 'Surahs',
  description: 'Read 24 surahs of the Qur’an in Arabic with the full Bangla meaning.',
}

export default function SurahsPage() {
  return (
    <PageShell title="Surahs" variant="compact" backHref="/more/" backLabel="More">
      <p className="mt-2 mb-4 px-1 text-sm text-muted-foreground">
        Al-Fatihah, Al-Kahf, Ya-Sin, Ar-Rahman, Al-Mulk and the last 19 surahs. Each shows the full Arabic first, then the full Bangla meaning.
      </p>
      <SurahList />
    </PageShell>
  )
}
