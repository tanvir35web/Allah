'use client'

import { useEffect, useState } from 'react'
import { BanglaText } from '@/components/common/localized-text'
import { Skeleton } from '@/components/common/loading-state'
import { ButtonLink } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <h2 id="ayah-title" className="text-[1.375rem] leading-tight font-bold tracking-tight">
          Ayah of the Day
        </h2>
        {shown ? (
          <BanglaText className="truncate text-[0.9375rem] text-muted-foreground">
            {shown.surah.banglaName} · {toBanglaDigits(shown.surah.id)}:{toBanglaDigits(shown.ayah.number)}
          </BanglaText>
        ) : null}
      </div>
      {shown ? (
        <Card className="p-5">
          <p lang="ar" dir="rtl" className="font-quran text-[1.75rem] leading-[2.2] text-arabic">
            {shown.ayah.arabic}
          </p>
          <BanglaText className="mt-4 block border-t border-border pt-4 text-[1.0625rem] leading-relaxed">
            {shown.ayah.bangla}
          </BanglaText>
          <ButtonLink href={`/surahs/${shown.surah.id}/`} variant="secondary" className="mt-5 w-full rounded-xl">
            Read Surah {shown.surah.transliteration}
          </ButtonLink>
        </Card>
      ) : failed ? (
        <Card className="p-5 text-[0.9375rem] text-muted-foreground">
          The ayah could not be loaded. It will appear once the app has finished downloading for offline use.
        </Card>
      ) : (
        <Skeleton className="h-64 rounded-3xl" />
      )}
    </section>
  )
}
