'use client'

import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LinkPending } from '@/components/common/link-pending'
import { BanglaText } from '@/components/common/localized-text'
import { Skeleton } from '@/components/common/loading-state'
import { ButtonLink } from '@/components/ui/button'
import { pickRandomAyah, surahAyahsUrl, type SurahAyahs } from '@/lib/ayah'
import { toBanglaDigits } from '@/lib/surah-search'

interface ShownAyah {
  surah: Omit<SurahAyahs, 'ayahs'>
  ayah: SurahAyahs['ayahs'][number]
}

/** Clean, distraction-free Ayah card aligned perfectly with neighbouring cards. */
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
    <section aria-labelledby="ayah-title" className="flex flex-col">
      {/* Clean quiet header with fixed h-7 for vertical alignment */}
      <div className="mb-2 flex items-center justify-between px-1 h-7">
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
        <article className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-xs hover:border-primary/30 transition-all duration-200">
          {/* Top Surah info */}
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent tabular-nums">
              Surah {shown.surah.transliteration}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Ayah {toBanglaDigits(shown.ayah.number)}
            </span>
          </div>

          {/* Arabic Ayah & Bengali Translation */}
          <div className="my-auto py-3 flex flex-col items-center justify-center text-center">
            <p
              lang="ar"
              dir="rtl"
              className="font-quran text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] leading-[2.3] md:leading-[2.4] [word-spacing:0.25rem] md:[word-spacing:0.4rem] text-foreground select-none"
            >
              {shown.ayah.arabic}
            </p>
            <div className="mt-4 text-center max-w-2xl">
              <BanglaText className="block text-sm sm:text-base md:text-lg leading-relaxed md:leading-loose text-foreground/85 font-medium tracking-wide">
                “{shown.ayah.bangla}”
              </BanglaText>
            </div>
          </div>

          {/* Action Button */}
          <div>
            <ButtonLink
              href={`/surahs/${shown.surah.id}/`}
              prefetch={false}
              variant="outline"
              size="md"
              className="w-full rounded-2xl font-bold shadow-xs hover:bg-muted group flex items-center justify-between px-5 transition-all"
            >
              <span>Read Full Surah</span>
              <LinkPending>
                <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
              </LinkPending>
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
