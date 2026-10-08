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

/** All 114 surahs, in Qur'an order. */
const SURAHS = [
  { id: 1, transliteration: 'Al-Fatihah', banglaName: 'আল-ফাতিহা', banglaMeaning: 'সূচনা' },
  { id: 2, transliteration: 'Al-Baqarah', banglaName: 'আল-বাকারা', banglaMeaning: 'গাভী' },
  { id: 3, transliteration: 'Al-Imran', banglaName: 'আলে-ইমরান', banglaMeaning: 'ইমরানের পরিবার' },
  { id: 4, transliteration: 'An-Nisa', banglaName: 'আন-নিসা', banglaMeaning: 'নারী' },
  { id: 5, transliteration: "Al-Ma'idah", banglaName: 'আল-মায়িদা', banglaMeaning: 'খাদ্য পরিবেশিত দস্তরখান' },
  { id: 6, transliteration: "Al-An'am", banglaName: 'আল-আনআম', banglaMeaning: 'গবাদি পশু' },
  { id: 7, transliteration: "Al-A'raf", banglaName: 'আল-আরাফ', banglaMeaning: 'উঁচু স্থানসমূহ' },
  { id: 8, transliteration: 'Al-Anfal', banglaName: 'আল-আনফাল', banglaMeaning: 'যুদ্ধলব্ধ সম্পদ' },
  { id: 9, transliteration: 'At-Tawbah', banglaName: 'আত-তাওবা', banglaMeaning: 'অনুশোচনা' },
  { id: 10, transliteration: 'Yunus', banglaName: 'ইউনুস', banglaMeaning: 'নবী ইউনুস' },
  { id: 11, transliteration: 'Hud', banglaName: 'হুদ', banglaMeaning: 'নবী হুদ' },
  { id: 12, transliteration: 'Yusuf', banglaName: 'ইউসুফ', banglaMeaning: 'নবী ইউসুফ' },
  { id: 13, transliteration: "Ar-Ra'd", banglaName: 'আর-রাদ', banglaMeaning: 'বজ্রধ্বনি' },
  { id: 14, transliteration: 'Ibrahim', banglaName: 'ইবরাহীম', banglaMeaning: 'নবী ইবরাহীম' },
  { id: 15, transliteration: 'Al-Hijr', banglaName: 'আল-হিজর', banglaMeaning: 'পাথুরে উপত্যকা' },
  { id: 16, transliteration: 'An-Nahl', banglaName: 'আন-নাহল', banglaMeaning: 'মৌমাছি' },
  { id: 17, transliteration: "Al-Isra'", banglaName: 'বনী ইসরাঈল', banglaMeaning: 'রাত্রিকালীন ভ্রমণ' },
  { id: 18, transliteration: 'Al-Kahf', banglaName: 'আল-কাহফ', banglaMeaning: 'গুহা' },
  { id: 19, transliteration: 'Maryam', banglaName: 'মারইয়াম', banglaMeaning: 'মারইয়াম' },
  { id: 20, transliteration: 'Ta-Ha', banglaName: 'ত্বা-হা', banglaMeaning: 'ত্বা ও হা বর্ণ' },
  { id: 21, transliteration: "Al-Anbiya'", banglaName: 'আল-আম্বিয়া', banglaMeaning: 'নবীগণ' },
  { id: 22, transliteration: 'Al-Hajj', banglaName: 'আল-হাজ্জ', banglaMeaning: 'হজ্জ' },
  { id: 23, transliteration: "Al-Mu'minun", banglaName: 'আল-মুমিনূন', banglaMeaning: 'মুমিনগণ' },
  { id: 24, transliteration: 'An-Nur', banglaName: 'আন-নূর', banglaMeaning: 'আলো' },
  { id: 25, transliteration: 'Al-Furqan', banglaName: 'আল-ফুরকান', banglaMeaning: 'সত্য-মিথ্যার পার্থক্যকারী' },
  { id: 26, transliteration: "Ash-Shu'ara'", banglaName: 'আশ-শুআরা', banglaMeaning: 'কবিগণ' },
  { id: 27, transliteration: 'An-Naml', banglaName: 'আন-নামল', banglaMeaning: 'পিপীলিকা' },
  { id: 28, transliteration: 'Al-Qasas', banglaName: 'আল-কাসাস', banglaMeaning: 'কাহিনী' },
  { id: 29, transliteration: "Al-'Ankabut", banglaName: 'আল-আনকাবূত', banglaMeaning: 'মাকড়সা' },
  { id: 30, transliteration: 'Ar-Rum', banglaName: 'আর-রূম', banglaMeaning: 'রোমান জাতি' },
  { id: 31, transliteration: 'Luqman', banglaName: 'লুকমান', banglaMeaning: 'জ্ঞানী লুকমান' },
  { id: 32, transliteration: 'As-Sajdah', banglaName: 'আস-সাজদা', banglaMeaning: 'সিজদা' },
  { id: 33, transliteration: 'Al-Ahzab', banglaName: 'আল-আহযাব', banglaMeaning: 'সম্মিলিত বাহিনী' },
  { id: 34, transliteration: "Saba'", banglaName: 'সাবা', banglaMeaning: 'সাবা জাতি' },
  { id: 35, transliteration: 'Fatir', banglaName: 'ফাতির', banglaMeaning: 'সৃষ্টিকর্তা' },
  { id: 36, transliteration: 'Ya-Sin', banglaName: 'ইয়াসীন', banglaMeaning: 'ইয়া ও সীন বর্ণ' },
  { id: 37, transliteration: 'As-Saffat', banglaName: 'আস-সাফফাত', banglaMeaning: 'সারিবদ্ধভাবে দণ্ডায়মান' },
  { id: 38, transliteration: 'Sad', banglaName: 'সোয়াদ', banglaMeaning: 'সোয়াদ বর্ণ' },
  { id: 39, transliteration: 'Az-Zumar', banglaName: 'আয-যুমার', banglaMeaning: 'দলসমূহ' },
  { id: 40, transliteration: 'Ghafir', banglaName: 'গাফির', banglaMeaning: 'ক্ষমাশীল' },
  { id: 41, transliteration: 'Fussilat', banglaName: 'ফুসসিলাত', banglaMeaning: 'বিশদভাবে বর্ণিত' },
  { id: 42, transliteration: 'Ash-Shura', banglaName: 'আশ-শূরা', banglaMeaning: 'পরামর্শ' },
  { id: 43, transliteration: 'Az-Zukhruf', banglaName: 'আয-যুখরুফ', banglaMeaning: 'স্বর্ণালংকার' },
  { id: 44, transliteration: 'Ad-Dukhan', banglaName: 'আদ-দুখান', banglaMeaning: 'ধোঁয়া' },
  { id: 45, transliteration: 'Al-Jathiyah', banglaName: 'আল-জাসিয়া', banglaMeaning: 'নতজানু' },
  { id: 46, transliteration: 'Al-Ahqaf', banglaName: 'আল-আহকাফ', banglaMeaning: 'বালুর পাহাড়' },
  { id: 47, transliteration: 'Muhammad', banglaName: 'মুহাম্মাদ', banglaMeaning: 'নবী মুহাম্মাদ' },
  { id: 48, transliteration: 'Al-Fath', banglaName: 'আল-ফাতহ', banglaMeaning: 'বিজয়' },
  { id: 49, transliteration: 'Al-Hujurat', banglaName: 'আল-হুজুরাত', banglaMeaning: 'কক্ষসমূহ' },
  { id: 50, transliteration: 'Qaf', banglaName: 'কাফ', banglaMeaning: 'কাফ বর্ণ' },
  { id: 51, transliteration: 'Adh-Dhariyat', banglaName: 'আয-যারিয়াত', banglaMeaning: 'বিক্ষেপকারী বাতাস' },
  { id: 52, transliteration: 'At-Tur', banglaName: 'আত-তূর', banglaMeaning: 'তূর পাহাড়' },
  { id: 53, transliteration: 'An-Najm', banglaName: 'আন-নাজম', banglaMeaning: 'নক্ষত্র' },
  { id: 54, transliteration: 'Al-Qamar', banglaName: 'আল-কামার', banglaMeaning: 'চাঁদ' },
  { id: 55, transliteration: 'Ar-Rahman', banglaName: 'আর-রহমান', banglaMeaning: 'পরম করুণাময়' },
  { id: 56, transliteration: "Al-Waqi'ah", banglaName: 'আল-ওয়াকিয়া', banglaMeaning: 'অবশ্যম্ভাবী ঘটনা' },
  { id: 57, transliteration: 'Al-Hadid', banglaName: 'আল-হাদীদ', banglaMeaning: 'লোহা' },
  { id: 58, transliteration: 'Al-Mujadilah', banglaName: 'আল-মুজাদালা', banglaMeaning: 'বিতর্ককারিণী' },
  { id: 59, transliteration: 'Al-Hashr', banglaName: 'আল-হাশর', banglaMeaning: 'সমাবেশ' },
  { id: 60, transliteration: 'Al-Mumtahanah', banglaName: 'আল-মুমতাহিনা', banglaMeaning: 'পরীক্ষিতা নারী' },
  { id: 61, transliteration: 'As-Saff', banglaName: 'আস-সাফ', banglaMeaning: 'সারি' },
  { id: 62, transliteration: "Al-Jumu'ah", banglaName: 'আল-জুমুআ', banglaMeaning: 'জুমুআর দিন' },
  { id: 63, transliteration: 'Al-Munafiqun', banglaName: 'আল-মুনাফিকূন', banglaMeaning: 'মুনাফিকগণ' },
  { id: 64, transliteration: 'At-Taghabun', banglaName: 'আত-তাগাবুন', banglaMeaning: 'লাভ-ক্ষতির দিন' },
  { id: 65, transliteration: 'At-Talaq', banglaName: 'আত-তালাক', banglaMeaning: 'তালাক' },
  { id: 66, transliteration: 'At-Tahrim', banglaName: 'আত-তাহরীম', banglaMeaning: 'নিষিদ্ধকরণ' },
  { id: 67, transliteration: 'Al-Mulk', banglaName: 'আল-মুলক', banglaMeaning: 'সার্বভৌমত্ব' },
  { id: 68, transliteration: 'Al-Qalam', banglaName: 'আল-কলম', banglaMeaning: 'কলম' },
  { id: 69, transliteration: 'Al-Haqqah', banglaName: 'আল-হাক্কাহ', banglaMeaning: 'অবশ্যম্ভাবী সত্য' },
  { id: 70, transliteration: "Al-Ma'arij", banglaName: 'আল-মাআরিজ', banglaMeaning: 'ঊর্ধ্বারোহণের সোপান' },
  { id: 71, transliteration: 'Nuh', banglaName: 'নূহ', banglaMeaning: 'নবী নূহ' },
  { id: 72, transliteration: 'Al-Jinn', banglaName: 'আল-জিন', banglaMeaning: 'জিন জাতি' },
  { id: 73, transliteration: 'Al-Muzzammil', banglaName: 'আল-মুযযাম্মিল', banglaMeaning: 'বস্ত্রাবৃত' },
  { id: 74, transliteration: 'Al-Muddaththir', banglaName: 'আল-মুদ্দাসসির', banglaMeaning: 'চাদরাবৃত' },
  { id: 75, transliteration: 'Al-Qiyamah', banglaName: 'আল-কিয়ামাহ', banglaMeaning: 'কিয়ামত' },
  { id: 76, transliteration: 'Al-Insan', banglaName: 'আল-ইনসান', banglaMeaning: 'মানুষ' },
  { id: 77, transliteration: 'Al-Mursalat', banglaName: 'আল-মুরসালাত', banglaMeaning: 'প্রেরিত বাতাস' },
  { id: 78, transliteration: "An-Naba'", banglaName: 'আন-নাবা', banglaMeaning: 'মহাসংবাদ' },
  { id: 79, transliteration: "An-Nazi'at", banglaName: 'আন-নাযিআত', banglaMeaning: 'প্রাণ হরণকারী ফেরেশতা' },
  { id: 80, transliteration: "'Abasa", banglaName: 'আবাসা', banglaMeaning: 'ভ্রূকুটি করলেন' },
  { id: 81, transliteration: 'At-Takwir', banglaName: 'আত-তাকভীর', banglaMeaning: 'গুটিয়ে নেওয়া' },
  { id: 82, transliteration: 'Al-Infitar', banglaName: 'আল-ইনফিতার', banglaMeaning: 'বিদীর্ণ হওয়া' },
  { id: 83, transliteration: 'Al-Mutaffifin', banglaName: 'আল-মুতাফফিফীন', banglaMeaning: 'মাপে কম দানকারী' },
  { id: 84, transliteration: 'Al-Inshiqaq', banglaName: 'আল-ইনশিকাক', banglaMeaning: 'খণ্ড-বিখণ্ড হওয়া' },
  { id: 85, transliteration: 'Al-Buruj', banglaName: 'আল-বুরূজ', banglaMeaning: 'নক্ষত্রপুঞ্জ' },
  { id: 86, transliteration: 'At-Tariq', banglaName: 'আত-তারিক', banglaMeaning: 'রাতের আগন্তুক' },
  { id: 87, transliteration: "Al-A'la", banglaName: 'আল-আলা', banglaMeaning: 'সর্বোচ্চ' },
  { id: 88, transliteration: 'Al-Ghashiyah', banglaName: 'আল-গাশিয়াহ', banglaMeaning: 'আচ্ছন্নকারী' },
  { id: 89, transliteration: 'Al-Fajr', banglaName: 'আল-ফাজর', banglaMeaning: 'ভোর' },
  { id: 90, transliteration: 'Al-Balad', banglaName: 'আল-বালাদ', banglaMeaning: 'নগর' },
  { id: 91, transliteration: 'Ash-Shams', banglaName: 'আশ-শামস', banglaMeaning: 'সূর্য' },
  { id: 92, transliteration: 'Al-Layl', banglaName: 'আল-লাইল', banglaMeaning: 'রাত' },
  { id: 93, transliteration: 'Ad-Duha', banglaName: 'আদ-দুহা', banglaMeaning: 'পূর্বাহ্ন' },
  { id: 94, transliteration: 'Ash-Sharh', banglaName: 'আশ-শারহ', banglaMeaning: 'বক্ষ প্রশস্তকরণ' },
  { id: 95, transliteration: 'At-Tin', banglaName: 'আত-তীন', banglaMeaning: 'ডুমুর' },
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

/** At-Tawbah is the only surah without a Bismillah. */
const NO_BISMILLAH = 9

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
  // Every surah except At-Tawbah opens with the Bismillah line. Al-Fatihah
  // keeps it in its text; the others show it as a separate heading.
  const hasBismillah = meta.id !== NO_BISMILLAH
  if (BISMILLAH_LINE.test(lines[0]) !== hasBismillah) {
    throw new Error(`Surah ${meta.id}: expected ${hasBismillah ? 'a' : 'no'} Bismillah line`)
  }
  if (hasBismillah) bismillah = lines[0].replace(/ ۝$/, '')
  const arabic = (meta.id === 1 || !hasBismillah ? lines : lines.slice(1)).join(' ')
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
 * All 114 surahs for reading, in Qur'an order.
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
