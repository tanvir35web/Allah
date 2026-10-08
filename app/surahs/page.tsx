import type { Metadata } from 'next'
import { PageShell } from '@/components/layout/page-shell'
import { SurahList } from '@/components/surahs/surah-list'
import { toSurahSummary } from '@/lib/surah-search'
import { surahs } from '@/lib/surahs'

export const metadata: Metadata = {
  title: 'Surahs',
  description: 'Read all 114 surahs of the Qur’an in Arabic with the full Bangla meaning.',
}

export default function SurahsPage() {
  return (
    <PageShell title="The 114 Surahs" subtitle="Full Arabic text first, then the full Bangla meaning">
      {/* Only the list fields reach the client, not the surah text. */}
      <SurahList surahs={surahs.map(toSurahSummary)} />
    </PageShell>
  )
}
