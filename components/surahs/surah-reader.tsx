import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { LinkPending } from '@/components/common/link-pending'
import { BanglaText } from '@/components/common/localized-text'
import { surahArabicSegments } from '@/lib/ayah'
import { bismillah, revelationLabel, toBanglaDigits } from '@/lib/surahs'
import type { Surah } from '@/lib/types'
import { ReadingTimer } from './reading-timer'
import { SurahText } from './surah-text'

interface SurahReaderProps {
  surah: Surah
  previous?: Surah
  next?: Surah
}

/** The whole surah in Arabic first, then the whole Bangla meaning. */
export function SurahReader({ surah, previous, next }: SurahReaderProps) {
  // Al-Fatihah counts the Bismillah as its first ayah; At-Tawbah has none.
  const showBismillah = surah.id !== 1 && surah.id !== 9
  // Each ayah is its own tappable segment, so it can be bookmarked.
  const arabic = surahArabicSegments(surah.id, surah.arabic, bismillah)

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
        <div className="mt-4 flex justify-center">
          <ReadingTimer surahId={surah.id} surahName={surah.transliteration} />
        </div>
      </section>

      <SurahText
        surahId={surah.id}
        surahName={surah.transliteration}
        bismillah={showBismillah ? bismillah : null}
        heading={arabic.heading}
        segments={arabic.body}
        ayahs={surah.ayahs.map(({ number, bangla }) => ({ number, bangla }))}
      />

      <nav aria-label="Surah navigation" className="grid grid-cols-2 gap-3">
        {previous ? (
          <Link
            href={`/surahs/${previous.id}/`}
            prefetch={false}
            className="flex min-h-14 items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 hover:bg-muted/50"
          >
            <LinkPending className="text-muted-foreground">
              <ChevronLeft className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </LinkPending>
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
            prefetch={false}
            className="flex min-h-14 items-center justify-end gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-right hover:bg-muted/50"
          >
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Next</span>
              <span className="block truncate text-sm font-medium">{next.transliteration}</span>
            </span>
            <LinkPending className="text-muted-foreground">
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </LinkPending>
          </Link>
        ) : null}
      </nav>
    </article>
  )
}
