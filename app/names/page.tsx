import type { Metadata } from 'next'
import { PageShell } from '@/components/layout/page-shell'
import { NameList } from '@/components/names/name-list'

export const metadata: Metadata = {
  title: 'All 99 Names',
  description: 'Browse, search and filter all 99 Names of Allah with Arabic, transliteration, English and Bangla meanings.',
}

export default function NamesPage() {
  return (
    <PageShell title="The 99 Names" subtitle="Al-Asmaʾ al-Husna — the Most Beautiful Names">
      <NameList />
    </PageShell>
  )
}
