'use client'

import { ArrowRight, BookOpenText } from 'lucide-react'
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

/** A random ayah of the Qur'an with its Bangla meaning, new on every page load. */
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
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <BookOpenText className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
          <h2 id="ayah-title" className="text-sm font-bold tracking-tight uppercase text-foreground">
            Ayah of the Day
          </h2>
        </div>
        {shown ? (
          <span className="text-xs font-semibold text-primary tabular-nums">
            <BanglaText>
              {shown.surah.banglaName} · {toBanglaDigits(shown.surah.id)}:{toBanglaDigits(shown.ayah.number)}
            </BanglaText>
          </span>
        ) : null}
      </div>

      {shown ? (
        <article className="pattern-stars relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-accent-soft/20 p-6 sm:p-7 shadow-xs transition-shadow hover:shadow-sm">
          {/* Top Header */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-bold text-accent tabular-nums">
              Surah {shown.surah.transliteration} ({shown.surah.banglaName})
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Ayah {toBanglaDigits(shown.ayah.number)}
            </span>
          </div>

          {/* Arabic Ayah */}
          <div className="my-5 flex flex-col items-center justify-center text-center">
            <p lang="ar" dir="rtl" className="font-quran text-2xl sm:text-3xl leading-[2.3] text-foreground select-none">
              {shown.ayah.arabic}
            </p>
          </div>

          {/* Bengali Translation */}
          <div className="rounded-2xl border border-border/50 bg-background/60 dark:bg-muted/30 p-4 text-center">
            <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-accent mb-1.5">
              বাংলা অনুবাদ · Meaning
            </p>
            <BanglaText className="block text-sm sm:text-base leading-relaxed text-foreground/90 font-medium">
              “{shown.ayah.bangla}”
            </BanglaText>
          </div>

          {/* Footer Action */}
          <div className="mt-5 flex items-center justify-center">
            <ButtonLink
              href={`/surahs/${shown.surah.id}/`}
              variant="outline"
              size="md"
              className="rounded-full px-6 font-semibold text-xs sm:text-sm group hover:bg-muted shadow-2xs"
            >
              <span>Read Full Surah</span>
              <ArrowRight className="size-3.5 ml-1.5 transition-transform group-hover:translate-x-1" aria-hidden />
            </ButtonLink>
          </div>
        </article>
      ) : failed ? (
        <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
          The ayah could not be loaded. It will appear once the app has finished downloading for offline use.
        </div>
      ) : (
        <Skeleton className="h-56 rounded-3xl" />
      )}
    </section>
  )
}
