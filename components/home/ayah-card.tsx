'use client'

import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BanglaText } from '@/components/common/localized-text'
import { Skeleton } from '@/components/common/loading-state'
import { ButtonLink } from '@/components/ui/button'
import { pickRandomAyah, surahAyahsUrl, type SurahAyahs } from '@/lib/ayah'
import { toBanglaDigits } from '@/lib/surah-search'

interface ShownAyah {
  surah: Omit<SurahAyahs, 'ayahs'>
  ayah: SurahAyahs['ayahs'][number]
}

/** Clean, distraction-free Ayah card for daily contemplation. */
export function AyahCard() {
  const [shown, setShown] = useState<ShownAyah | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const pick = pickRandomAyah()
    fetch(surahAyahsUrl(pick.surah), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<SurahAyahs>
      })
      .then(({ ayahs, ...surah }) => {
        const ayah = ayahs[pick.ayah - 1]
        if (!ayah) throw new Error(`No ayah ${pick.surah}:${pick.ayah}`)
        setShown({ surah, ayah })
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [])

  return (
    <section aria-labelledby="ayah-title">
      {/* Clean quiet header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 id="ayah-title" className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          Ayah of the Day
        </h2>
        {shown ? (
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            <BanglaText>
              {shown.surah.banglaName} · {toBanglaDigits(shown.surah.id)}:{toBanglaDigits(shown.ayah.number)}
            </BanglaText>
          </span>
        ) : null}
      </div>

      {shown ? (
        <article className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs hover:border-primary/30 transition-all duration-200">
          {/* Top Surah info */}
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent tabular-nums">
              Surah {shown.surah.transliteration}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Ayah {toBanglaDigits(shown.ayah.number)}
            </span>
          </div>

          {/* Arabic Ayah */}
          <div className="my-5 flex flex-col items-center justify-center text-center">
            <p lang="ar" dir="rtl" className="font-quran text-2xl sm:text-3xl leading-[2.2] text-foreground select-none">
              {shown.ayah.arabic}
            </p>
          </div>

          {/* Clean Bengali Translation */}
          <div className="my-2 text-center">
            <BanglaText className="block text-sm sm:text-base leading-relaxed text-foreground/85 font-medium">
              “{shown.ayah.bangla}”
            </BanglaText>
          </div>

          {/* Action */}
          <div className="mt-5 flex justify-center">
            <ButtonLink
              href={`/surahs/${shown.surah.id}/`}
              variant="outline"
              size="md"
              className="rounded-full px-5 text-xs sm:text-sm font-semibold group shadow-2xs hover:bg-accent hover:text-white hover:border-accent transition-all"
            >
              <span>Read Full Surah</span>
              <ArrowRight className="size-3.5 ml-1.5 transition-transform group-hover:translate-x-1" aria-hidden />
            </ButtonLink>
          </div>
        </article>
      ) : failed ? (
        <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
          The ayah could not be loaded offline yet.
        </div>
      ) : (
        <Skeleton className="h-56 rounded-3xl" />
      )}
    </section>
  )
}
