import { FIRST_AYAH_SURAH, splitArabicAyahs, type SurahAyahs } from '@/lib/ayah'
import { getSurahById, surahs } from '@/lib/surahs'

/**
 * `/quran/{id}.json`: one surah's ayahs, Arabic and Bangla side by side, for
 * the home "Ayah" card. Written as static files at build time, so the
 * service worker precaches them with the rest of the app.
 */
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return surahs.filter((surah) => surah.id >= FIRST_AYAH_SURAH).map((surah) => ({ file: `${surah.id}.json` }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const surah = getSurahById(Number(file.replace(/\.json$/, '')))
  if (!surah || surah.id < FIRST_AYAH_SURAH) return new Response('Not found', { status: 404 })
  const arabic = splitArabicAyahs(surah.arabic)
  const body: SurahAyahs = {
    id: surah.id,
    transliteration: surah.transliteration,
    banglaName: surah.banglaName,
    ayahs: surah.ayahs.map((ayah, index) => ({ number: ayah.number, arabic: arabic[index] ?? '', bangla: ayah.bangla })),
  }
  return Response.json(body)
}
