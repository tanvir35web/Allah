'use client'

import { Bookmark, BookmarkX } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { BanglaText } from '@/components/common/localized-text'
import { useAppData } from '@/components/providers/app-data-provider'
import { SectionTitle } from '@/components/ui/card'
import type { ArabicSegment } from '@/lib/ayah'
import { toBanglaDigits } from '@/lib/surah-search'
import { cn } from '@/lib/utils'

const BISMILLAH_BN = 'শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।'

/** Clears the sticky page header when jumping to an ayah. */
const SCROLL_MARGIN = 'scroll-mt-28'

interface SurahTextProps {
  surahId: number
  surahName: string
  /** The Bismillah heading of every surah but Al-Fatihah and At-Tawbah (not an ayah). */
  bismillah: string | null
  /** Al-Fatihah's Bismillah, which is its ayah 1, shown on its own line. */
  heading: ArabicSegment | null
  segments: ArabicSegment[]
  ayahs: { number: number; bangla: string }[]
}

/**
 * The surah's Arabic and Bangla text. Tapping an ayah (in either) bookmarks
 * it, so the reader can continue from there next time; tapping it again
 * removes the bookmark.
 */
export function SurahText({ surahId, surahName, bismillah, heading, segments, ayahs }: SurahTextProps) {
  const { ready, surahReadings, setBookmark } = useAppData()
  const bookmark = ready ? surahReadings[surahId]?.bookmarkAyah : undefined

  const toggle = (ayah: number) => {
    void setBookmark({ surahId, surahName }, ayah === bookmark ? null : ayah)
  }
  const onKey = (event: KeyboardEvent, ayah: number) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    toggle(ayah)
  }
  const jumpTo = (ayah: number) => {
    document.getElementById(`ayah-${ayah}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /** The first Arabic segment of an ayah carries its `#ayah-N` anchor. */
  const anchored = new Set<number>()
  const arabicAyah = (segment: ArabicSegment, key: number | string) => {
    const marked = segment.ayah === bookmark
    const id = anchored.has(segment.ayah) ? undefined : `ayah-${segment.ayah}`
    anchored.add(segment.ayah)
    return (
      <span
        key={key}
        id={id}
        role="button"
        tabIndex={0}
        aria-pressed={marked}
        aria-label={marked ? `Ayah ${segment.ayah}, bookmarked. Tap to remove.` : `Bookmark ayah ${segment.ayah}`}
        onClick={() => toggle(segment.ayah)}
        onKeyDown={(event) => onKey(event, segment.ayah)}
        className={cn(
          SCROLL_MARGIN,
          'cursor-pointer rounded-xl box-decoration-clone transition-colors focus-visible:outline-2 focus-visible:outline-primary',
          marked ? 'bg-primary-soft text-primary ring-1 ring-primary/30' : 'hover:bg-muted/60',
        )}
      >
        {marked ? <Bookmark className="mx-1 inline size-[0.55em] fill-current align-middle" aria-hidden /> : null}
        {segment.text}
      </span>
    )
  }

  return (
    <>
      {bookmark ? (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary-soft p-2 pl-4">
          <Bookmark className="size-4 shrink-0 fill-current text-primary" aria-hidden />
          <p className="min-w-0 flex-1 text-sm font-medium text-primary">Bookmarked at Ayah {bookmark}</p>
          <button
            type="button"
            onClick={() => jumpTo(bookmark)}
            className="inline-flex min-h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-xs hover:opacity-90"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={() => void setBookmark({ surahId, surahName }, null)}
            aria-label="Remove bookmark"
            title="Remove bookmark"
            className="grid size-10 place-items-center rounded-xl text-primary hover:bg-card/60"
          >
            <BookmarkX className="size-4" aria-hidden />
          </button>
        </div>
      ) : ready ? (
        <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
          <Bookmark className="size-3.5 shrink-0" aria-hidden />
          Tap any ayah to bookmark where you stop, and continue from there next time.
        </p>
      ) : null}

      <section className="space-y-3" aria-labelledby="surah-arabic">
        <SectionTitle id="surah-arabic">Arabic</SectionTitle>
        <div>
          {heading || bismillah ? (
            <span
              lang="ar"
              dir="rtl"
              className="mb-3 block whitespace-nowrap text-center font-quran text-[clamp(1.4rem,6.5vw,2rem)] md:text-[2.5rem] leading-[2.2] md:leading-[2.35] [word-spacing:0.25rem] md:[word-spacing:0.4rem] text-arabic"
            >
              {heading ? arabicAyah(heading, 'heading') : bismillah}
            </span>
          ) : null}
          {/* IndoPak mushaf style: one continuous block, with the ayah numbers,
              waqf signs and ruku marks drawn by the font from the text itself.
              Each ayah is an inline span so lines still wrap and justify. */}
          <p
            lang="ar"
            dir="rtl"
            className="font-quran text-justify text-[1.9rem] md:text-[2.35rem] lg:text-[2.6rem] leading-[2.4] md:leading-[2.5] [word-spacing:0.25rem] md:[word-spacing:0.4rem] text-arabic"
          >
            {segments.map((segment, index) => (
              <span key={index}>
                {index > 0 ? ' ' : null}
                {arabicAyah(segment, index)}
              </span>
            ))}
          </p>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="surah-bangla">
        <SectionTitle id="surah-bangla" className="font-bangla tracking-normal normal-case">
          বাংলা অর্থ
        </SectionTitle>
        <div lang="bn">
          {bismillah ? (
            <BanglaText className="mb-4 block text-center font-medium md:text-lg">{BISMILLAH_BN}</BanglaText>
          ) : null}
          <ol className="space-y-4">
            {ayahs.map((ayah) => {
              const marked = ayah.number === bookmark
              return (
                <li
                  key={ayah.number}
                  id={`ayah-${ayah.number}-bn`}
                  className={cn(
                    SCROLL_MARGIN,
                    'flex gap-3.5 rounded-2xl transition-colors',
                    marked && '-mx-2 bg-primary-soft px-2 py-2 ring-1 ring-primary/30',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggle(ayah.number)}
                    aria-pressed={marked}
                    aria-label={marked ? `Ayah ${ayah.number}, bookmarked. Remove bookmark.` : `Bookmark ayah ${ayah.number}`}
                    title={marked ? 'Remove bookmark' : 'Bookmark this ayah'}
                    className={cn(
                      'mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg font-bangla text-xs font-semibold transition-colors md:size-8 md:text-sm',
                      marked ? 'bg-primary text-primary-foreground' : 'bg-primary-soft text-primary hover:bg-primary/20',
                    )}
                  >
                    {marked ? <Bookmark className="size-3.5 fill-current" aria-hidden /> : toBanglaDigits(ayah.number)}
                  </button>
                  <BanglaText className="block text-[1.05rem] md:text-[1.2rem] leading-relaxed md:leading-loose tracking-wide">
                    {ayah.bangla}
                  </BanglaText>
                </li>
              )
            })}
          </ol>
        </div>
        <BanglaText className="block px-1 text-xs text-muted-foreground">অনুবাদ: মুহিউদ্দীন খান</BanglaText>
      </section>
    </>
  )
}
