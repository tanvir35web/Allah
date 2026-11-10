'use client'

import { ArrowDown, Bookmark, X } from 'lucide-react'
import { useCallback, useEffect, useState, type KeyboardEvent } from 'react'
import { BanglaText } from '@/components/common/localized-text'
import { useAppData } from '@/components/providers/app-data-provider'
import { SectionTitle } from '@/components/ui/card'
import type { ArabicSegment } from '@/lib/ayah'
import { toBanglaDigits } from '@/lib/surah-search'
import { cn } from '@/lib/utils'
import { AyahActions, useLongPress, type MenuPoint } from './ayah-actions'
import { RecitationBar, useRecitation } from './recitation-player'

const BISMILLAH_BN = 'শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।'

/** Clears the sticky page header when jumping to an ayah. */
const SCROLL_MARGIN = 'scroll-mt-28'

/** localStorage key: set once the long-press hint has been shown on this device. */
const LONG_PRESS_HINT_KEY = 'asma-hint-long-press'

/**
 * True on the first page view where the hint appears on this device, then
 * never again. A per-device convenience, so it lives in localStorage; if
 * storage is unavailable the hint simply shows each time. Starts false so
 * the prerendered page and first client render match.
 */
function useFirstTimeHint(key: string): boolean {
  const [show, setShow] = useState(false)
  useEffect(() => {
    try {
      if (localStorage.getItem(key)) return
      localStorage.setItem(key, '1')
    } catch {
      // Storage blocked: show the hint, nothing to remember it with.
    }
    // Reading localStorage only works after mount; this runs once per page view.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true)
  }, [key])
  return show
}

interface SurahTextProps {
  surahId: number
  surahName: string
  /** The Bismillah heading of every surah but Al-Fatihah and At-Tawbah (not an ayah). */
  bismillah: string | null
  /** Al-Fatihah's Bismillah, which is its ayah 1, shown on its own line. */
  heading: ArabicSegment | null
  segments: ArabicSegment[]
  ayahs: { number: number; bangla: string }[]
  /** Whether recitation audio is bundled for this surah. */
  audio: boolean
}

/**
 * The surah's Arabic and Bangla text. Long-press (or right-click) an Arabic
 * ayah for its menu: save it as the last read ayah, or play from it. A tap
 * plays the ayah where audio is bundled, and bookmarks it elsewhere. The
 * Bangla ayah number also toggles the bookmark.
 */
export function SurahText({ surahId, surahName, bismillah, heading, segments, ayahs, audio }: SurahTextProps) {
  const { ready, surahReadings, setBookmark } = useAppData()
  const bookmark = ready ? surahReadings[surahId]?.bookmarkAyah : undefined
  const recitation = useRecitation(surahId, surahName, ayahs.length, audio)
  const reciting = recitation.ayah
  // The ayah whose long-press menu is open.
  const [menu, setMenu] = useState<{ ayah: number; point: MenuPoint } | null>(null)
  const menuAyah = menu?.ayah ?? null
  const longPress = useLongPress((ayah, point) => setMenu({ ayah, point }))
  const closeMenu = useCallback(() => setMenu(null), [])
  const showHint = useFirstTimeHint(LONG_PRESS_HINT_KEY)

  // Keep the ayah being recited in view.
  useEffect(() => {
    if (reciting === null || !recitation.playing) return
    const target = document.getElementById(reciting === 0 ? 'surah-bismillah' : `ayah-${reciting}`)
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [reciting, recitation.playing])

  const toggle = (ayah: number) => {
    void setBookmark({ surahId, surahName }, ayah === bookmark ? null : ayah)
  }
  /**
   * Tapping an Arabic ayah: with audio, plays from that ayah (or pauses /
   * resumes the one playing); without audio, bookmarks it. With audio, the
   * Bangla ayah number still bookmarks.
   */
  const tapAyah = (ayah: number) => {
    if (!audio) return toggle(ayah)
    if (ayah === reciting) return recitation.playing ? recitation.pause() : recitation.play()
    recitation.play(ayah)
  }
  const onKey = (event: KeyboardEvent, ayah: number) => {
    // The keyboard's "menu" key, or Shift+F10, opens the same menu as a long press.
    if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
      event.preventDefault()
      // No pointer here: open beside the ayah itself.
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      setMenu({ ayah, point: { x: rect.left + rect.width / 2, y: rect.bottom } })
      return
    }
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    tapAyah(ayah)
  }
  const jumpTo = (ayah: number) => {
    document.getElementById(`ayah-${ayah}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /** The first Arabic segment of an ayah carries its `#ayah-N` anchor. */
  const anchored = new Set<number>()
  const arabicAyah = (segment: ArabicSegment, key: number | string) => {
    const marked = segment.ayah === bookmark
    const playing = segment.ayah === reciting
    const id = anchored.has(segment.ayah) ? undefined : `ayah-${segment.ayah}`
    anchored.add(segment.ayah)
    return (
      <span
        key={key}
        id={id}
        role="button"
        tabIndex={0}
        aria-pressed={audio ? playing && recitation.playing : marked}
        aria-label={
          audio
            ? playing && recitation.playing
              ? `Pause ayah ${segment.ayah}`
              : `Play ayah ${segment.ayah}${marked ? ' (bookmarked)' : ''}`
            : marked
              ? `Ayah ${segment.ayah}, bookmarked. Tap to remove.`
              : `Bookmark ayah ${segment.ayah}`
        }
        aria-haspopup="dialog"
        title={audio ? 'Tap to play · hold for more' : 'Tap to bookmark · hold for more'}
        {...longPress.handlers(segment.ayah)}
        onClick={() => {
          // The click that ends a long press only opens the menu.
          if (longPress.consumeClick()) return
          tapAyah(segment.ayah)
        }}
        onKeyDown={(event) => onKey(event, segment.ayah)}
        className={cn(
          SCROLL_MARGIN,
          // No padding: highlights are drawn with box-shadow (see globals.css), so
          // they never reflow the justified lines. No text selection or iOS
          // callout, so holding an ayah opens our menu instead.
          'cursor-pointer rounded-lg box-decoration-clone transition-[background-color,box-shadow] select-none [-webkit-touch-callout:none] focus-visible:outline-2 focus-visible:outline-primary',
          playing
            ? 'ayah-highlight-playing text-foreground'
            : marked
              ? 'ayah-highlight-bookmark text-primary'
              : menuAyah === segment.ayah
                ? 'ayah-highlight-pressed'
                : 'hover:bg-muted/60',
        )}
      >
        {segment.text}
      </span>
    )
  }

  return (
    <>
      {/* Always rendered at the same height, so bookmarking an ayah never
          shifts the text below it. */}
      {bookmark ? (
        // Balanced: a 40px icon tile on the left, two 40px controls on the right, equal padding all round.
        <div className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary-soft p-2">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Bookmark className="size-4 fill-current" aria-hidden />
          </span>
          <p className="min-w-0 flex-1 leading-tight">
            <span className="block text-[0.6875rem] font-bold tracking-wider text-primary/80 uppercase">Last read</span>
            <span className="block truncate text-[0.9375rem] font-semibold text-foreground">Ayah {bookmark}</span>
          </p>
          <button
            type="button"
            onClick={() => jumpTo(bookmark)}
            className="group inline-flex h-10 items-center gap-1.5 rounded-xl bg-card px-3.5 text-sm font-semibold text-primary shadow-xs ring-1 ring-primary/20 transition-colors hover:bg-card/80"
          >
            Continue
            <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => void setBookmark({ surahId, surahName }, null)}
            aria-label="Remove bookmark"
            title="Remove bookmark"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-muted-foreground shadow-xs ring-1 ring-primary/20 transition-colors hover:text-danger"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : showHint ? (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-2 pl-4">
          <Bookmark className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            Long-press any ayah to save where you stopped
          </p>
          {/* Matches the height of the Continue button. */}
          <span className="min-h-10" aria-hidden />
        </div>
      ) : null}

      <section className="space-y-3" aria-labelledby="surah-arabic">
        <SectionTitle id="surah-arabic">Arabic</SectionTitle>
        {/* No text selection or iOS callout anywhere in the Arabic: on iPhone a
            press inside a selectable paragraph starts a selection (and cancels
            our long press), even if the ayah itself is not selectable. */}
        <div className="select-none [-webkit-touch-callout:none]">
          {heading || bismillah ? (
            <span
              id={heading ? undefined : 'surah-bismillah'}
              lang="ar"
              dir="rtl"
              className={cn(
                // Side padding only from md: on a phone it would push this
                // unwrapped line past the screen edge.
                'mb-3 block max-w-full rounded-xl whitespace-nowrap transition-colors md:px-3',
                !heading && reciting === 0 && 'bg-accent-soft ring-1 ring-accent/25',
              )}
            >
              <span className="block text-center font-quran text-[clamp(1.25rem,5.8vw,2rem)] md:text-[2.5rem] leading-[2.2] md:leading-[2.35] [word-spacing:0.25rem] md:[word-spacing:0.4rem] text-arabic">
                {heading ? arabicAyah(heading, 'heading') : bismillah}
              </span>
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
          {/* Padding is always applied (not only when highlighted), so marking
              an ayah changes colour only, never the row height. */}
          <ol className="-mx-2 space-y-0">
            {ayahs.map((ayah) => {
              const marked = ayah.number === bookmark
              const playing = ayah.number === reciting
              return (
                <li
                  key={ayah.number}
                  id={`ayah-${ayah.number}-bn`}
                  className={cn(
                    SCROLL_MARGIN,
                    'flex gap-3.5 rounded-2xl px-2 py-2 transition-colors',
                    marked && 'bg-primary-soft ring-1 ring-primary/30',
                    playing && 'bg-accent-soft ring-1 ring-accent/25',
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

      <AyahActions
        ayah={menuAyah}
        point={menu?.point ?? null}
        bookmarked={menuAyah !== null && menuAyah === bookmark}
        canPlay={audio}
        onSave={() => menuAyah !== null && void setBookmark({ surahId, surahName }, menuAyah)}
        onRemove={() => void setBookmark({ surahId, surahName }, null)}
        onPlay={() => menuAyah !== null && recitation.play(menuAyah)}
        onClose={closeMenu}
      />

      {/* Last, so it sticks to the bottom of the screen throughout the surah. */}
      {audio ? <RecitationBar recitation={recitation} ayahCount={ayahs.length} bookmark={bookmark} /> : null}
    </>
  )
}
