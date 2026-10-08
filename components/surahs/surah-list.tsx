import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { BanglaText } from '@/components/common/localized-text'
import { revelationLabel, surahs, toBanglaDigits } from '@/lib/surahs'

export function SurahList() {
  return (
    <ul className="grid gap-3">
      {surahs.map((surah) => (
        <li key={surah.id}>
          <Link
            href={`/surahs/${surah.id}/`}
            className="group flex items-center gap-3 rounded-3xl border border-border bg-card p-4 transition-[transform,box-shadow,border-color] duration-200 hover:border-primary/30 hover:shadow-md active:scale-[0.99]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-xs font-semibold text-primary tabular-nums">
              {surah.id}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{surah.transliteration}</span>
              <BanglaText className="block text-sm text-muted-foreground">
                {surah.banglaName} · {surah.banglaMeaning}
              </BanglaText>
              <BanglaText className="block text-xs text-muted-foreground">
                {toBanglaDigits(surah.ayahs.length)} আয়াত · {revelationLabel(surah)}
              </BanglaText>
            </span>
            <span lang="ar" dir="rtl" className="shrink-0 font-quran text-xl leading-[1.8] text-arabic">
              {surah.arabicName}
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  )
}
