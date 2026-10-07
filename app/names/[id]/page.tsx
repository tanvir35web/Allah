import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageShell } from '@/components/layout/page-shell'
import { NameDetails } from '@/components/names/name-details'
import { allahNames, getNameById } from '@/lib/storage/names'

// Every Name is prerendered at build time; unknown ids are a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return allahNames.map((name) => ({ id: String(name.id) }))
}

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = getNameById(Number((await params).id))
  if (!name) return {}
  const title = `${name.transliteration} (${name.arabic}) — ${name.englishName}`
  return {
    title,
    description: `${name.englishMeaning}. ${name.shortExplanationEn} বাংলা: ${name.banglaMeaning}.`,
    openGraph: { title },
  }
}

export default async function NamePage({ params }: Props) {
  const id = Number((await params).id)
  const name = getNameById(id)
  if (!name) notFound()

  return (
    <PageShell title={name.transliteration} variant="compact" backHref="/names/" backLabel="Names">
      <NameDetails name={name} previous={getNameById(id - 1)} next={getNameById(id + 1)} />
    </PageShell>
  )
}
