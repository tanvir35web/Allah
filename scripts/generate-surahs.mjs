/**
 * One-off generator for `data/surahs.ts`. Run manually with
 * `node scripts/generate-surahs.mjs`; the build never touches the network.
 *
 * Sources:
 *   - Arabic: IndoPak script text from the DigitalKhatt project
 *     (https://github.com/DigitalKhatt/digitalkhatt.org, MIT), pinned to the
 *     commit below. It is laid out as mushaf lines and already contains the
 *     ayah-end numbers, waqf signs and ruku marks, so each surah is kept as one
 *     continuous string. It pairs with the DigitalKhatt IndoPak font in
 *     `app/fonts/`.
 *   - Bangla: Al Quran Cloud API (https://alquran.cloud/api), edition
 *     `bn.bengali` (translation by Muhiuddin Khan).
 */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'

const root = path.resolve(import.meta.dirname, '..')
const target = path.join(root, 'data', 'surahs.ts')

const DIGITALKHATT_COMMIT = '4213fab9892774f74f7164c70a70dd84a14f0215'
const INDOPAK_URL = `https://raw.githubusercontent.com/DigitalKhatt/digitalkhatt.org/${DIGITALKHATT_COMMIT}/ClientApp/src/app/services/quran_text_indopak_15.ts`

/** Al-Fatihah, Al-Kahf, Ya-Sin, Ar-Rahman, Al-Mulk and the last 19 surahs (Al-Alaq to An-Nas). */
const SURAHS = [
  { id: 1, transliteration: 'Al-Fatihah', banglaName: 'আল-ফাতিহা', banglaMeaning: 'সূচনা' },
  { id: 18, transliteration: 'Al-Kahf', banglaName: 'আল-কাহফ', banglaMeaning: 'গুহা' },
  { id: 36, transliteration: 'Ya-Sin', banglaName: 'ইয়াসীন', banglaMeaning: 'ইয়া ও সীন বর্ণ' },
  { id: 55, transliteration: 'Ar-Rahman', banglaName: 'আর-রহমান', banglaMeaning: 'পরম করুণাময়' },
  { id: 67, transliteration: 'Al-Mulk', banglaName: 'আল-মুলক', banglaMeaning: 'সার্বভৌমত্ব' },
  { id: 96, transliteration: 'Al-Alaq', banglaName: 'আল-আলাক', banglaMeaning: 'জমাট রক্ত' },
  { id: 97, transliteration: 'Al-Qadr', banglaName: 'আল-কদর', banglaMeaning: 'মহিমান্বিত রাত' },
  { id: 98, transliteration: 'Al-Bayyinah', banglaName: 'আল-বাইয়্যিনাহ', banglaMeaning: 'সুস্পষ্ট প্রমাণ' },
  { id: 99, transliteration: 'Az-Zalzalah', banglaName: 'আয-যিলযাল', banglaMeaning: 'ভূমিকম্প' },
  { id: 100, transliteration: 'Al-Adiyat', banglaName: 'আল-আদিয়াত', banglaMeaning: 'অভিযানকারী অশ্বসমূহ' },
  { id: 101, transliteration: 'Al-Qariah', banglaName: 'আল-কারিআহ', banglaMeaning: 'মহাপ্রলয়' },
  { id: 102, transliteration: 'At-Takathur', banglaName: 'আত-তাকাসুর', banglaMeaning: 'প্রাচুর্যের প্রতিযোগিতা' },
  { id: 103, transliteration: 'Al-Asr', banglaName: 'আল-আসর', banglaMeaning: 'সময়' },
  { id: 104, transliteration: 'Al-Humazah', banglaName: 'আল-হুমাযাহ', banglaMeaning: 'পরনিন্দাকারী' },
  { id: 105, transliteration: 'Al-Fil', banglaName: 'আল-ফীল', banglaMeaning: 'হাতি' },
  { id: 106, transliteration: 'Quraysh', banglaName: 'কুরাইশ', banglaMeaning: 'কুরাইশ গোত্র' },
  { id: 107, transliteration: "Al-Ma'un", banglaName: 'আল-মাউন', banglaMeaning: 'ছোটখাটো সাহায্য' },
  { id: 108, transliteration: 'Al-Kawthar', banglaName: 'আল-কাওসার', banglaMeaning: 'প্রাচুর্য' },
  { id: 109, transliteration: 'Al-Kafirun', banglaName: 'আল-কাফিরূন', banglaMeaning: 'অবিশ্বাসীগণ' },
  { id: 110, transliteration: 'An-Nasr', banglaName: 'আন-নাসর', banglaMeaning: 'সাহায্য' },
  { id: 111, transliteration: 'Al-Masad', banglaName: 'আল-মাসাদ', banglaMeaning: 'খেজুর আঁশের রশি' },
  { id: 112, transliteration: 'Al-Ikhlas', banglaName: 'আল-ইখলাস', banglaMeaning: 'একনিষ্ঠতা' },
  { id: 113, transliteration: 'Al-Falaq', banglaName: 'আল-ফালাক', banglaMeaning: 'প্রভাত' },
  { id: 114, transliteration: 'An-Nas', banglaName: 'আন-নাস', banglaMeaning: 'মানবজাতি' },
]

const SURAH_HEADER = /^سُورَةُ /
/** Four words starting with "بِسْمِ", then an unnumbered ayah-end sign. */
const BISMILLAH_LINE = /^بِسْمِ \S+ \S+ \S+ ۝$/
/** Ayah-end sign plus number. Al-Fatihah's disputed ayah end uses U+202E instead of U+06DD. */
const AYAH_END = /[۝‮][٠-٩]+/g

/** The 114 surahs as `{ name, lines }`, flattened from mushaf pages. */
async function fetchIndopak() {
  const response = await fetch(INDOPAK_URL)
  if (!response.ok) throw new Error(`IndoPak text: HTTP ${response.status}`)
  const source = (await response.text()).replace(/export \{ quranText \};?/, '')
  const pages = vm.runInNewContext(`${source}; quranText`)
  const surahs = []
  for (const line of pages.flat()) {
    if (SURAH_HEADER.test(line)) surahs.push({ name: line, lines: [] })
    else surahs.at(-1).lines.push(line)
  }
  if (surahs.length !== 114) throw new Error(`IndoPak text: expected 114 surahs, got ${surahs.length}`)
  return surahs
}

async function fetchBangla(id) {
  const response = await fetch(`https://api.alquran.cloud/v1/surah/${id}/bn.bengali`)
  if (!response.ok) throw new Error(`Surah ${id}: HTTP ${response.status}`)
  const { data } = await response.json()
  if (data.ayahs.length !== data.numberOfAyahs) throw new Error(`Surah ${id}: ayah count mismatch`)
  return data
}

const indopak = await fetchIndopak()
let bismillah = ''
const entries = []
for (const meta of SURAHS) {
  const bangla = await fetchBangla(meta.id)
  const { name, lines } = indopak[meta.id - 1]
  // Every surah here opens with the Bismillah line. Al-Fatihah keeps it in its
  // text; the others show it as a separate heading.
  if (!BISMILLAH_LINE.test(lines[0])) throw new Error(`Surah ${meta.id}: expected Bismillah line`)
  bismillah = lines[0].replace(/ ۝$/, '')
  const arabic = (meta.id === 1 ? lines : lines.slice(1)).join(' ')
  const marks = arabic.match(AYAH_END)?.length ?? 0
  if (marks !== bangla.numberOfAyahs) {
    throw new Error(`Surah ${meta.id}: ${marks} ayah marks in Arabic, ${bangla.numberOfAyahs} Bangla ayahs`)
  }
  entries.push({
    ...meta,
    arabicName: name,
    englishMeaning: bangla.englishNameTranslation,
    revelation: bangla.revelationType === 'Meccan' ? 'meccan' : 'medinan',
    arabic,
    ayahs: bangla.ayahs.map((ayah) => ({ number: ayah.numberInSurah, bangla: ayah.text.replace(/﻿/g, '').trim() })),
  })
}

const header = `import type { Surah } from '@/lib/types'

/**
 * Surahs for reading, in Qur'an order: Al-Fatihah, Al-Kahf, Ya-Sin, Ar-Rahman, Al-Mulk and the last 19
 * surahs (Al-Alaq to An-Nas).
 *
 * Arabic: IndoPak script from DigitalKhatt, one continuous string per surah
 * with ayah numbers and waqf signs embedded; render it with the IndoPak font.
 * Bangla: translation by Muhiuddin Khan, via the Al Quran Cloud API.
 * Generated by \`scripts/generate-surahs.mjs\`; do not edit the text by hand.
 */
export const bismillah = ${JSON.stringify(bismillah)}

export const surahs: Surah[] = `

await writeFile(target, `${header}${JSON.stringify(entries, null, 2)}\n`)
console.log(`Wrote ${entries.length} surahs to ${path.relative(root, target)}`)
