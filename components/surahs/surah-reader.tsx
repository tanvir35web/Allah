import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { BanglaText } from '@/components/common/localized-text'
import { SectionTitle } from '@/components/ui/card'
import { bismillah, revelationLabel, toBanglaDigits } from '@/lib/surahs'
import type { Surah } from '@/lib/types'

const BISMILLAH_BN = 'শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।'

interface SurahReaderProps {
  surah: Surah
  previous?: Surah
  next?: Surah
}

/** The whole surah in Arabic first, then the whole Bangla meaning. */
export function SurahReader({ surah, previous, next }: SurahReaderProps) {
  // Al-Fatihah counts the Bismillah as its first ayah.
  const showBismillah = surah.id !== 1

  return (
    <article className="space-y-5" aria-labelledby="surah-title">
      <section className="pattern-stars overflow-hidden rounded-[2rem] border border-border bg-gradient-to-b from-primary-soft to-card px-6 pt-6 pb-8 text-center">
        <span className="rounded-full bg-card/80 px-3 py-1 text-xs font-semibold text-primary tabular-nums">
          Surah {surah.id}
        </span>
        <span lang="ar" dir="rtl" className="mt-3 block font-quran text-4xl leading-[1.8] text-arabic">{surah.arabicName}</span>
        <h2 id="surah-title" className="text-2xl font-bold tracking-tight">
          {surah.transliteration}
        </h2>
        <BanglaText className="mt-0.5 block">
          {surah.banglaName} · {surah.banglaMeaning}
        </BanglaText>
        <BanglaText className="mt-1 block text-sm text-muted-foreground">
          {toBanglaDigits(surah.ayahs.length)} আয়াত · {revelationLabel(surah)}
        </BanglaText>
      </section>

      <section className="space-y-3" aria-labelledby="surah-arabic">
        <SectionTitle id="surah-arabic">Arabic</SectionTitle>
        <div>
          {showBismillah ? (
            <span lang="ar" dir="rtl" className="mb-2 block text-center font-quran text-[1.9rem] leading-[2.2] text-arabic">{bismillah}</span>
          ) : null}
          {/* IndoPak mushaf style: one continuous block, with the ayah numbers,
              waqf signs and ruku marks drawn by the font from the text itself. */}
          <p lang="ar" dir="rtl" className="font-quran text-justify text-[1.9rem] leading-[2.4] text-arabic">
            {surah.arabic}
          </p>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="surah-bangla">
        <SectionTitle id="surah-bangla" className="font-bangla tracking-normal normal-case">
          বাংলা অর্থ
        </SectionTitle>
        <div lang="bn">
          {showBismillah ? (
            <BanglaText className="mb-4 block text-center font-medium">{BISMILLAH_BN}</BanglaText>
          ) : null}
          <ol className="space-y-3">
            {surah.ayahs.map((ayah) => (
              <li key={ayah.number} className="flex gap-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-primary-soft font-bangla text-xs font-semibold text-primary">
                  {toBanglaDigits(ayah.number)}
                </span>
                <BanglaText className="block text-[1.05rem] leading-relaxed">{ayah.bangla}</BanglaText>
              </li>
            ))}
          </ol>
        </div>
        <BanglaText className="block px-1 text-xs text-muted-foreground">অনুবাদ: মুহিউদ্দীন খান</BanglaText>
      </section>

      <nav aria-label="Surah navigation" className="grid grid-cols-2 gap-3">
        {previous ? (
          <Link
            href={`/surahs/${previous.id}/`}
            className="flex min-h-14 items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 hover:bg-muted/50"
          >
            <ChevronLeft className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Previous</span>
              <span className="block truncate text-sm font-medium">{previous.transliteration}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/surahs/${next.id}/`}
            className="flex min-h-14 items-center justify-end gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-right hover:bg-muted/50"
          >
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Next</span>
              <span className="block truncate text-sm font-medium">{next.transliteration}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        ) : null}
      </nav>
    </article>
  )
}
