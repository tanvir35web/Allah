import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageShell } from '@/components/layout/page-shell'
import { SurahReader } from '@/components/surahs/surah-reader'
import { getAdjacentSurahs, getSurahById, surahs } from '@/lib/surahs'

// Every surah is prerendered at build time; unknown ids are a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return surahs.map((surah) => ({ id: String(surah.id) }))
}

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const surah = getSurahById(Number((await params).id))
  if (!surah) return {}
  const title = `Surah ${surah.transliteration} (${surah.banglaName})`
  return {
    title,
    description: `${surah.transliteration} — ${surah.englishMeaning}. আরবি ও বাংলা অর্থসহ।`,
    openGraph: { title },
  }
}

export default async function SurahPage({ params }: Props) {
  const id = Number((await params).id)
  const surah = getSurahById(id)
  if (!surah) notFound()

  return (
    <PageShell title={surah.transliteration} variant="compact" backHref="/surahs/" backLabel="Surahs">
      <SurahReader surah={surah} {...getAdjacentSurahs(id)} />
    </PageShell>
  )
}
