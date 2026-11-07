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
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <BookOpenText className="size-4" aria-hidden />
          </span>
          <h2 id="ayah-title" className="text-base font-semibold text-foreground">
            Ayah of the Day
          </h2>
        </div>
        {shown ? (
          <span className="text-xs font-medium text-muted-foreground">
            <BanglaText className="truncate">
              {shown.surah.banglaName} · {toBanglaDigits(shown.surah.id)}:{toBanglaDigits(shown.ayah.number)}
            </BanglaText>
          </span>
        ) : null}
      </div>

      {shown ? (
        <article className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-sm">
          <p lang="ar" dir="rtl" className="font-quran text-xl sm:text-2xl leading-[2.2] text-foreground/90 text-right my-2">
            {shown.ayah.arabic}
          </p>

          <div className="mt-4 pt-4 border-t border-border/60">
            <BanglaText className="block text-sm sm:text-base leading-relaxed text-muted-foreground font-medium">
              {shown.ayah.bangla}
            </BanglaText>
          </div>

          <div className="mt-5 flex justify-end">
            <ButtonLink
              href={`/surahs/${shown.surah.id}/`}
              variant="outline"
              size="md"
              className="rounded-xl group font-medium text-xs sm:text-sm"
            >
              <span>Read Surah {shown.surah.transliteration}</span>
              <ArrowRight className="size-3.5 ml-1 transition-transform group-hover:translate-x-1" aria-hidden />
            </ButtonLink>
          </div>
        </article>
      ) : failed ? (
        <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          The ayah could not be loaded. It will appear once the app has finished downloading for offline use.
        </div>
      ) : (
        <Skeleton className="h-48 rounded-2xl" />
      )}
    </section>
  )
}
