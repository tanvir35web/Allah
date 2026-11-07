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
          <span className="grid size-7 place-items-center rounded-lg bg-accent/15 text-accent">
            <BookOpenText className="size-4" aria-hidden />
          </span>
          <h2 id="ayah-title" className="text-[1.375rem] leading-tight font-bold tracking-tight">
            Ayah of the Day
          </h2>
        </div>
        {shown ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft/50 border border-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent tabular-nums">
            <BanglaText className="truncate">
              {shown.surah.banglaName} · {toBanglaDigits(shown.surah.id)}:{toBanglaDigits(shown.ayah.number)}
            </BanglaText>
          </span>
        ) : null}
      </div>

      {shown ? (
        <article className="pattern-stars relative overflow-hidden rounded-[2.25rem] border border-border/80 bg-gradient-to-br from-card via-card to-accent-soft/20 p-6 md:p-7 shadow-[0_2px_12px_rgb(0_0_0/0.04)] transition-all hover:shadow-md">
          <p lang="ar" dir="rtl" className="font-quran text-2xl md:text-[1.85rem] leading-[2.3] text-arabic text-center py-2 px-1">
            {shown.ayah.arabic}
          </p>

          <div className="mt-4 rounded-2xl border-l-4 border-accent/70 bg-muted/40 p-4 md:p-5 backdrop-blur-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1.5">অনুবাদ</p>
            <BanglaText className="block text-[1.0625rem] leading-relaxed text-foreground/90 font-medium">
              {shown.ayah.bangla}
            </BanglaText>
          </div>

          <ButtonLink
            href={`/surahs/${shown.surah.id}/`}
            variant="secondary"
            className="mt-5 w-full rounded-2xl group shadow-xs hover:border-primary/40"
          >
            <span>Read Surah {shown.surah.transliteration}</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </ButtonLink>
        </article>
      ) : failed ? (
        <div className="rounded-[2.25rem] border border-border bg-card p-6 text-sm text-muted-foreground">
          The ayah could not be loaded. It will appear once the app has finished downloading for offline use.
        </div>
      ) : (
        <Skeleton className="h-64 rounded-[2.25rem]" />
      )}
    </section>
  )
}
