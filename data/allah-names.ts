import type { AllahName } from '@/lib/types'

/**
 * The 99 Beautiful Names of Allah (al-Asmāʾ al-Ḥusnā), in the order of the
 * widely circulated list narrated in Jāmiʿ at-Tirmidhī (no. 3507).
 *
 * Meanings are short, conventional renderings. No English or Bangla word
 * can fully capture the meaning of a Divine Name, so the explanations are
 * deliberately brief and avoid speculative claims.
 *
 * To update the data, edit this file only. `tests/data.test.ts` verifies
 * that there are exactly 99 entries with unique ids and required fields.
 */
export const allahNames: AllahName[] = [
  {
    id: 1,
    arabic: 'الرَّحْمَٰنُ',
    transliteration: 'Ar-Rahman',
    banglaName: 'আর-রহমান',
    englishName: 'The Most Gracious',
    englishMeaning: 'The Entirely Merciful, whose mercy embraces all creation',
    banglaMeaning: 'পরম করুণাময়',
    shortExplanationEn:
      'His mercy is vast and reaches every creature in this world, believer and non-believer alike.',
    shortExplanationBn:
      'তাঁর করুণা অসীম; এই দুনিয়ায় তা সকল সৃষ্টির প্রতি প্রসারিত।',
  },
  {
    id: 2,
    arabic: 'الرَّحِيمُ',
    transliteration: 'Ar-Rahim',
    banglaName: 'আর-রহীম',
    englishName: 'The Most Merciful',
    englishMeaning: 'The Especially Merciful, who continually shows mercy',
    banglaMeaning: 'অতি দয়ালু',
    shortExplanationEn:
      'He shows lasting, special mercy to those who believe and turn to Him.',
    shortExplanationBn:
      'যারা ঈমান আনে ও তাঁর দিকে ফিরে আসে, তিনি তাদের প্রতি বিশেষ ও স্থায়ী দয়া করেন।',
  },
  {
    id: 3,
    arabic: 'الْمَلِكُ',
    transliteration: 'Al-Malik',
    banglaName: 'আল-মালিক',
    englishName: 'The King',
    englishMeaning: 'The Sovereign, the absolute Ruler of all',
    banglaMeaning: 'সর্বময় অধিপতি',
    shortExplanationEn:
      'He is the true King. Everything belongs to Him and is under His authority.',
    shortExplanationBn:
      'তিনিই প্রকৃত বাদশাহ; সবকিছু তাঁরই মালিকানা ও কর্তৃত্বের অধীন।',
  },
  {
    id: 4,
    arabic: 'الْقُدُّوسُ',
    transliteration: 'Al-Quddus',
    banglaName: 'আল-কুদ্দুস',
    englishName: 'The Most Holy',
    englishMeaning: 'The Pure, free from every imperfection',
    banglaMeaning: 'মহা পবিত্র',
    shortExplanationEn:
      'He is perfectly pure and far above any fault, flaw or deficiency.',
    shortExplanationBn:
      'তিনি সম্পূর্ণ পবিত্র; সকল দোষ-ত্রুটি ও অপূর্ণতা থেকে মুক্ত।',
  },
  {
    id: 5,
    arabic: 'السَّلَامُ',
    transliteration: 'As-Salam',
    banglaName: 'আস-সালাম',
    englishName: 'The Source of Peace',
    englishMeaning: 'The Flawless, the Giver of peace and safety',
    banglaMeaning: 'শান্তির উৎস',
    shortExplanationEn:
      'He is free from all defects, and true peace and safety come from Him.',
    shortExplanationBn:
      'তিনি সকল ত্রুটি থেকে মুক্ত; প্রকৃত শান্তি ও নিরাপত্তা তাঁর কাছ থেকেই আসে।',
  },
  {
    id: 6,
    arabic: 'الْمُؤْمِنُ',
    transliteration: "Al-Mu'min",
    banglaName: 'আল-মু’মিন',
    englishName: 'The Giver of Security',
    englishMeaning: 'The Granter of faith and safety, the Affirmer of truth',
    banglaMeaning: 'নিরাপত্তা দানকারী',
    shortExplanationEn:
      'He grants security and tranquillity to His servants and confirms the truth of His promise.',
    shortExplanationBn:
      'তিনি বান্দাদের নিরাপত্তা ও প্রশান্তি দান করেন এবং তাঁর প্রতিশ্রুতিকে সত্য প্রমাণ করেন।',
  },
  {
    id: 7,
    arabic: 'الْمُهَيْمِنُ',
    transliteration: 'Al-Muhaymin',
    banglaName: 'আল-মুহাইমিন',
    englishName: 'The Guardian',
    englishMeaning: 'The Overseer who watches over and protects all',
    banglaMeaning: 'তত্ত্বাবধায়ক',
    shortExplanationEn:
      'He watches over all of creation, preserving it and witnessing everything it does.',
    shortExplanationBn:
      'তিনি সমগ্র সৃষ্টির তত্ত্বাবধান করেন, রক্ষা করেন এবং সবকিছুর সাক্ষী থাকেন।',
  },
  {
    id: 8,
    arabic: 'الْعَزِيزُ',
    transliteration: 'Al-Aziz',
    banglaName: 'আল-আযীয',
    englishName: 'The Almighty',
    englishMeaning: 'The Mighty, the Invincible, never overcome',
    banglaMeaning: 'মহা পরাক্রমশালী',
    shortExplanationEn:
      'His might is complete. Nothing can overpower Him or stand against His will.',
    shortExplanationBn:
      'তাঁর শক্তি পরিপূর্ণ; কেউ তাঁকে পরাজিত করতে বা তাঁর ইচ্ছার বিরুদ্ধে দাঁড়াতে পারে না।',
  },
  {
    id: 9,
    arabic: 'الْجَبَّارُ',
    transliteration: 'Al-Jabbar',
    banglaName: 'আল-জাব্বার',
    englishName: 'The Compeller',
    englishMeaning: 'The Restorer, whose will prevails over all',
    banglaMeaning: 'প্রবল প্রতাপশালী',
    shortExplanationEn:
      'His will is always carried out, and He mends what is broken, including broken hearts.',
    shortExplanationBn:
      'তাঁর ইচ্ছা সর্বদা কার্যকর হয়; তিনি ভাঙাকে জোড়া দেন, ভগ্ন হৃদয়কেও।',
  },
  {
    id: 10,
    arabic: 'الْمُتَكَبِّرُ',
    transliteration: 'Al-Mutakabbir',
    banglaName: 'আল-মুতাকাব্বির',
    englishName: 'The Supreme in Greatness',
    englishMeaning: 'The One to whom all true greatness belongs',
    banglaMeaning: 'শ্রেষ্ঠত্বের অধিকারী',
    shortExplanationEn:
      'True greatness and pride belong to Him alone; He is above all of creation.',
    shortExplanationBn:
      'প্রকৃত বড়ত্ব ও শ্রেষ্ঠত্ব কেবল তাঁরই; তিনি সমগ্র সৃষ্টির ঊর্ধ্বে।',
  },
  {
    id: 11,
    arabic: 'الْخَالِقُ',
    transliteration: 'Al-Khaliq',
    banglaName: 'আল-খালিক',
    englishName: 'The Creator',
    englishMeaning: 'The One who brings everything into being',
    banglaMeaning: 'সৃষ্টিকর্তা',
    shortExplanationEn:
      'He creates everything from nothing and determines the measure of all things.',
    shortExplanationBn:
      'তিনি শূন্য থেকে সবকিছু সৃষ্টি করেন এবং প্রত্যেকটির পরিমাপ নির্ধারণ করেন।',
  },
  {
    id: 12,
    arabic: 'الْبَارِئُ',
    transliteration: "Al-Bari'",
    banglaName: 'আল-বারি',
    englishName: 'The Maker',
    englishMeaning: 'The Evolver, who makes creation free of disproportion',
    banglaMeaning: 'উদ্ভাবনকর্তা',
    shortExplanationEn:
      'He brings His creation into existence in perfect harmony and balance.',
    shortExplanationBn:
      'তিনি সৃষ্টিকে পূর্ণ সামঞ্জস্য ও ভারসাম্যের সাথে অস্তিত্বে আনেন।',
  },
  {
    id: 13,
    arabic: 'الْمُصَوِّرُ',
    transliteration: 'Al-Musawwir',
    banglaName: 'আল-মুসাওয়ির',
    englishName: 'The Fashioner',
    englishMeaning: 'The Shaper, who gives each creation its form',
    banglaMeaning: 'আকৃতিদানকারী',
    shortExplanationEn:
      'He gives every creature its unique shape and appearance.',
    shortExplanationBn:
      'তিনি প্রত্যেক সৃষ্টিকে তার অনন্য আকৃতি ও রূপ দান করেন।',
  },
  {
    id: 14,
    arabic: 'الْغَفَّارُ',
    transliteration: 'Al-Ghaffar',
    banglaName: 'আল-গাফফার',
    englishName: 'The Ever-Forgiving',
    englishMeaning: 'The One who forgives again and again',
    banglaMeaning: 'বারবার ক্ষমাকারী',
    shortExplanationEn:
      'He forgives sins repeatedly, however often His servant returns to Him.',
    shortExplanationBn:
      'বান্দা যতবারই তাঁর দিকে ফিরে আসে, তিনি ততবারই গুনাহ ক্ষমা করেন।',
  },
  {
    id: 15,
    arabic: 'الْقَهَّارُ',
    transliteration: 'Al-Qahhar',
    banglaName: 'আল-কাহহার',
    englishName: 'The Subduer',
    englishMeaning: 'The All-Prevailing, who has power over all',
    banglaMeaning: 'সর্বজয়ী',
    shortExplanationEn:
      'Everything submits to His power; nothing in creation can escape His control.',
    shortExplanationBn:
      'সবকিছু তাঁর ক্ষমতার কাছে নত; কোনো কিছুই তাঁর নিয়ন্ত্রণের বাইরে নয়।',
  },
  {
    id: 16,
    arabic: 'الْوَهَّابُ',
    transliteration: 'Al-Wahhab',
    banglaName: 'আল-ওয়াহহাব',
    englishName: 'The Bestower',
    englishMeaning: 'The Giver of gifts, freely and without measure',
    banglaMeaning: 'মহান দাতা',
    shortExplanationEn:
      'He gives generously and continually, without expecting anything in return.',
    shortExplanationBn:
      'তিনি কোনো প্রতিদানের আশা ছাড়াই অবিরাম ও উদারভাবে দান করেন।',
  },
  {
    id: 17,
    arabic: 'الرَّزَّاقُ',
    transliteration: 'Ar-Razzaq',
    banglaName: 'আর-রাযযাক',
    englishName: 'The Provider',
    englishMeaning: 'The Sustainer who provides for every creature',
    banglaMeaning: 'রিযিকদাতা',
    shortExplanationEn:
      'He provides sustenance for every living being, for body and soul.',
    shortExplanationBn:
      'তিনি প্রতিটি প্রাণীর দেহ ও আত্মার রিযিকের ব্যবস্থা করেন।',
  },
  {
    id: 18,
    arabic: 'الْفَتَّاحُ',
    transliteration: 'Al-Fattah',
    banglaName: 'আল-ফাত্তাহ',
    englishName: 'The Opener',
    englishMeaning: 'The Granter of victory, the Judge who opens the way',
    banglaMeaning: 'উন্মুক্তকারী',
    shortExplanationEn:
      'He opens the doors of mercy and provision, and judges with truth between people.',
    shortExplanationBn:
      'তিনি রহমত ও রিযিকের দরজা খুলে দেন এবং মানুষের মাঝে সত্যের সাথে ফয়সালা করেন।',
  },
  {
    id: 19,
    arabic: 'الْعَلِيمُ',
    transliteration: 'Al-Alim',
    banglaName: 'আল-আলীম',
    englishName: 'The All-Knowing',
    englishMeaning: 'The One whose knowledge encompasses everything',
    banglaMeaning: 'সর্বজ্ঞ',
    shortExplanationEn:
      'He knows everything: the past, the present, the future, the seen and the unseen.',
    shortExplanationBn:
      'তিনি অতীত, বর্তমান, ভবিষ্যৎ, প্রকাশ্য ও গোপন সবকিছু জানেন।',
  },
  {
    id: 20,
    arabic: 'الْقَابِضُ',
    transliteration: 'Al-Qabid',
    banglaName: 'আল-কাবিদ',
    englishName: 'The Constrictor',
    englishMeaning: 'The Withholder, who restricts by His wisdom',
    banglaMeaning: 'সংকোচনকারী',
    shortExplanationEn:
      'By His wisdom He withholds or restricts provision and ease as He wills.',
    shortExplanationBn:
      'তিনি নিজ প্রজ্ঞা অনুযায়ী যাকে ইচ্ছা রিযিক ও স্বাচ্ছন্দ্য সংকুচিত করেন।',
  },
  {
    id: 21,
    arabic: 'الْبَاسِطُ',
    transliteration: 'Al-Basit',
    banglaName: 'আল-বাসিত',
    englishName: 'The Expander',
    englishMeaning: 'The Extender, who gives abundantly',
    banglaMeaning: 'প্রশস্তকারী',
    shortExplanationEn:
      'He expands provision, mercy and ease for whomever He wills.',
    shortExplanationBn:
      'তিনি যাকে ইচ্ছা রিযিক, রহমত ও স্বাচ্ছন্দ্য প্রশস্ত করে দেন।',
  },
  {
    id: 22,
    arabic: 'الْخَافِضُ',
    transliteration: 'Al-Khafid',
    banglaName: 'আল-খাফিদ',
    englishName: 'The Abaser',
    englishMeaning: 'The One who lowers whom He wills',
    banglaMeaning: 'অবনতকারী',
    shortExplanationEn:
      'He lowers the arrogant and the oppressor, according to His justice.',
    shortExplanationBn:
      'তিনি তাঁর ন্যায়বিচার অনুযায়ী অহংকারী ও জালিমকে নিচু করেন।',
  },
  {
    id: 23,
    arabic: 'الرَّافِعُ',
    transliteration: "Ar-Rafi'",
    banglaName: 'আর-রাফি',
    englishName: 'The Exalter',
    englishMeaning: 'The One who raises whom He wills',
    banglaMeaning: 'উন্নীতকারী',
    shortExplanationEn:
      'He raises the rank of whomever He wills, especially through faith and knowledge.',
    shortExplanationBn:
      'তিনি যাকে ইচ্ছা মর্যাদায় উন্নীত করেন, বিশেষত ঈমান ও জ্ঞানের মাধ্যমে।',
  },
  {
    id: 24,
    arabic: 'الْمُعِزُّ',
    transliteration: "Al-Mu'izz",
    banglaName: 'আল-মু’ইয',
    englishName: 'The Giver of Honour',
    englishMeaning: 'The Bestower of honour and strength',
    banglaMeaning: 'সম্মানদাতা',
    shortExplanationEn:
      'All true honour comes from Him, and He grants it to whom He wills.',
    shortExplanationBn:
      'সকল প্রকৃত সম্মান তাঁরই কাছ থেকে আসে; তিনি যাকে ইচ্ছা সম্মান দান করেন।',
  },
  {
    id: 25,
    arabic: 'الْمُذِلُّ',
    transliteration: 'Al-Mudhill',
    banglaName: 'আল-মুযিল্ল',
    englishName: 'The Giver of Dishonour',
    englishMeaning: 'The Humiliator, who abases whom He wills',
    banglaMeaning: 'অপমানদাতা',
    shortExplanationEn:
      'He takes honour away from whom He wills, always with justice and wisdom.',
    shortExplanationBn:
      'তিনি ন্যায় ও প্রজ্ঞার সাথে যাকে ইচ্ছা সম্মান থেকে বঞ্চিত করেন।',
  },
  {
    id: 26,
    arabic: 'السَّمِيعُ',
    transliteration: "As-Sami'",
    banglaName: 'আস-সামী',
    englishName: 'The All-Hearing',
    englishMeaning: 'The One who hears every sound and every prayer',
    banglaMeaning: 'সর্বশ্রোতা',
    shortExplanationEn:
      'He hears everything, even a silent prayer whispered in the heart.',
    shortExplanationBn:
      'তিনি সবকিছু শোনেন, এমনকি অন্তরের নীরব দোয়াও।',
  },
  {
    id: 27,
    arabic: 'الْبَصِيرُ',
    transliteration: 'Al-Basir',
    banglaName: 'আল-বাসীর',
    englishName: 'The All-Seeing',
    englishMeaning: 'The One who sees all things, seen and hidden',
    banglaMeaning: 'সর্বদ্রষ্টা',
    shortExplanationEn:
      'Nothing is hidden from His sight, however small or concealed.',
    shortExplanationBn:
      'যত ক্ষুদ্র বা গোপনই হোক, কোনো কিছুই তাঁর দৃষ্টির আড়ালে নয়।',
  },
  {
    id: 28,
    arabic: 'الْحَكَمُ',
    transliteration: 'Al-Hakam',
    banglaName: 'আল-হাকাম',
    englishName: 'The Judge',
    englishMeaning: 'The Arbiter whose judgement is final',
    banglaMeaning: 'মহা বিচারক',
    shortExplanationEn:
      'He judges between His creation with truth, and His judgement is final.',
    shortExplanationBn:
      'তিনি সত্যের সাথে সৃষ্টির মাঝে ফয়সালা করেন; তাঁর বিচারই চূড়ান্ত।',
  },
  {
    id: 29,
    arabic: 'الْعَدْلُ',
    transliteration: "Al-'Adl",
    banglaName: 'আল-আদল',
    englishName: 'The Utterly Just',
    englishMeaning: 'The Embodiment of justice, never unjust',
    banglaMeaning: 'ন্যায়পরায়ণ',
    shortExplanationEn:
      'He is perfectly just and never wrongs anyone, even by the weight of an atom.',
    shortExplanationBn:
      'তিনি পূর্ণ ন্যায়পরায়ণ; তিনি কারও প্রতি অণু পরিমাণও অবিচার করেন না।',
  },
  {
    id: 30,
    arabic: 'اللَّطِيفُ',
    transliteration: 'Al-Latif',
    banglaName: 'আল-লাতীফ',
    englishName: 'The Subtle One',
    englishMeaning: 'The Most Gentle, aware of the finest details',
    banglaMeaning: 'সূক্ষ্মদর্শী',
    shortExplanationEn:
      'He knows the finest details and is gentle with His servants in ways they may not notice.',
    shortExplanationBn:
      'তিনি সূক্ষ্মতম বিষয়ও জানেন এবং বান্দাদের প্রতি এমনভাবে কোমল যা তারা অনেক সময় টেরও পায় না।',
  },
  {
    id: 31,
    arabic: 'الْخَبِيرُ',
    transliteration: 'Al-Khabir',
    banglaName: 'আল-খাবীর',
    englishName: 'The All-Aware',
    englishMeaning: 'The One aware of the inner reality of all things',
    banglaMeaning: 'সম্যক অবগত',
    shortExplanationEn:
      'He is fully aware of the inner reality of everything, including what hearts conceal.',
    shortExplanationBn:
      'তিনি সবকিছুর ভেতরের বাস্তবতা সম্পর্কে অবগত, অন্তরে যা গোপন থাকে তাও।',
  },
  {
    id: 32,
    arabic: 'الْحَلِيمُ',
    transliteration: 'Al-Halim',
    banglaName: 'আল-হালীম',
    englishName: 'The Forbearing',
    englishMeaning: 'The Clement, who does not hasten punishment',
    banglaMeaning: 'সহনশীল',
    shortExplanationEn:
      'He is patient with those who err and gives them time to repent.',
    shortExplanationBn:
      'তিনি ভুলকারীদের প্রতি সহনশীল এবং তাদের তওবা করার সুযোগ দেন।',
  },
  {
    id: 33,
    arabic: 'الْعَظِيمُ',
    transliteration: "Al-'Azim",
    banglaName: 'আল-আযীম',
    englishName: 'The Magnificent',
    englishMeaning: 'The Supreme, infinite in greatness',
    banglaMeaning: 'সুমহান',
    shortExplanationEn:
      'His greatness is beyond the limits of human imagination.',
    shortExplanationBn:
      'তাঁর মহত্ত্ব মানুষের কল্পনার সীমার বাইরে।',
  },
  {
    id: 34,
    arabic: 'الْغَفُورُ',
    transliteration: 'Al-Ghafur',
    banglaName: 'আল-গাফূর',
    englishName: 'The All-Forgiving',
    englishMeaning: 'The One whose forgiveness is complete',
    banglaMeaning: 'ক্ষমাশীল',
    shortExplanationEn:
      'He forgives sins completely, covering them and pardoning the one who repents.',
    shortExplanationBn:
      'তিনি গুনাহ সম্পূর্ণরূপে ক্ষমা করেন এবং তওবাকারীর দোষ ঢেকে রাখেন।',
  },
  {
    id: 35,
    arabic: 'الشَّكُورُ',
    transliteration: 'Ash-Shakur',
    banglaName: 'আশ-শাকূর',
    englishName: 'The Most Appreciative',
    englishMeaning: 'The Rewarder, who multiplies the reward of good deeds',
    banglaMeaning: 'গুণগ্রাহী',
    shortExplanationEn:
      'He appreciates even small good deeds and rewards them generously.',
    shortExplanationBn:
      'তিনি ছোট ভালো কাজেরও মূল্যায়ন করেন এবং উদারভাবে প্রতিদান দেন।',
  },
  {
    id: 36,
    arabic: 'الْعَلِيُّ',
    transliteration: 'Al-Aliyy',
    banglaName: 'আল-আলিয়্যু',
    englishName: 'The Most High',
    englishMeaning: 'The Exalted, above all in rank and power',
    banglaMeaning: 'সমুন্নত',
    shortExplanationEn:
      'He is above all things in His essence, His status and His power.',
    shortExplanationBn:
      'তিনি সত্তা, মর্যাদা ও ক্ষমতায় সবকিছুর ঊর্ধ্বে।',
  },
  {
    id: 37,
    arabic: 'الْكَبِيرُ',
    transliteration: 'Al-Kabir',
    banglaName: 'আল-কাবীর',
    englishName: 'The Most Great',
    englishMeaning: 'The Grand, greater than everything',
    banglaMeaning: 'সর্ববৃহৎ',
    shortExplanationEn:
      'He is greater than everything; this is the meaning of "Allahu Akbar".',
    shortExplanationBn:
      'তিনি সবকিছুর চেয়ে বড়; “আল্লাহু আকবার” এই অর্থই বহন করে।',
  },
  {
    id: 38,
    arabic: 'الْحَفِيظُ',
    transliteration: 'Al-Hafiz',
    banglaName: 'আল-হাফীয',
    englishName: 'The Preserver',
    englishMeaning: 'The Protector who guards and records all things',
    banglaMeaning: 'সংরক্ষণকারী',
    shortExplanationEn:
      'He protects His creation and preserves every deed; nothing is lost with Him.',
    shortExplanationBn:
      'তিনি সৃষ্টিকে রক্ষা করেন এবং প্রতিটি আমল সংরক্ষণ করেন; তাঁর কাছে কিছুই হারায় না।',
  },
  {
    id: 39,
    arabic: 'الْمُقِيتُ',
    transliteration: 'Al-Muqit',
    banglaName: 'আল-মুকীত',
    englishName: 'The Nourisher',
    englishMeaning: 'The Sustainer who gives every creature its nourishment',
    banglaMeaning: 'খাদ্য ও শক্তির জোগানদাতা',
    shortExplanationEn:
      'He gives every creature the nourishment and strength it needs to live.',
    shortExplanationBn:
      'তিনি প্রত্যেক সৃষ্টিকে বেঁচে থাকার প্রয়োজনীয় খাদ্য ও শক্তি দান করেন।',
  },
  {
    id: 40,
    arabic: 'الْحَسِيبُ',
    transliteration: 'Al-Hasib',
    banglaName: 'আল-হাসীব',
    englishName: 'The Reckoner',
    englishMeaning: 'The One who takes account, and who is sufficient',
    banglaMeaning: 'হিসাব গ্রহণকারী',
    shortExplanationEn:
      'He will take account of every deed, and He is enough for those who rely on Him.',
    shortExplanationBn:
      'তিনি প্রতিটি কাজের হিসাব নেবেন; আর যে তাঁর উপর ভরসা করে, তার জন্য তিনিই যথেষ্ট।',
  },
  {
    id: 41,
    arabic: 'الْجَلِيلُ',
    transliteration: 'Al-Jalil',
    banglaName: 'আল-জালীল',
    englishName: 'The Majestic',
    englishMeaning: 'The Sublime, possessor of majesty and splendour',
    banglaMeaning: 'মহামহিম',
    shortExplanationEn:
      'He possesses perfect majesty in His attributes and actions.',
    shortExplanationBn:
      'তাঁর গুণাবলি ও কার্যাবলিতে পূর্ণ মহিমা বিদ্যমান।',
  },
  {
    id: 42,
    arabic: 'الْكَرِيمُ',
    transliteration: 'Al-Karim',
    banglaName: 'আল-কারীম',
    englishName: 'The Most Generous',
    englishMeaning: 'The Bountiful, noble and abundant in giving',
    banglaMeaning: 'পরম উদার',
    shortExplanationEn:
      'He gives abundantly, even to those who do not ask, and forgives with nobility.',
    shortExplanationBn:
      'যারা চায় না তাদেরও তিনি প্রচুর দান করেন এবং মহানুভবতার সাথে ক্ষমা করেন।',
  },
  {
    id: 43,
    arabic: 'الرَّقِيبُ',
    transliteration: 'Ar-Raqib',
    banglaName: 'আর-রাকীব',
    englishName: 'The Watchful',
    englishMeaning: 'The Ever-Observing, who never ceases to watch',
    banglaMeaning: 'সদা পর্যবেক্ষণকারী',
    shortExplanationEn:
      'He constantly watches over every soul and every action.',
    shortExplanationBn:
      'তিনি প্রতিটি প্রাণ ও প্রতিটি কাজ সর্বক্ষণ পর্যবেক্ষণ করেন।',
  },
  {
    id: 44,
    arabic: 'الْمُجِيبُ',
    transliteration: 'Al-Mujib',
    banglaName: 'আল-মুজীব',
    englishName: 'The Responsive',
    englishMeaning: 'The One who answers prayers',
    banglaMeaning: 'দোয়া কবুলকারী',
    shortExplanationEn:
      'He is near and responds to the call of the one who sincerely calls upon Him.',
    shortExplanationBn:
      'তিনি নিকটবর্তী; যে আন্তরিকভাবে তাঁকে ডাকে, তিনি তার ডাকে সাড়া দেন।',
  },
  {
    id: 45,
    arabic: 'الْوَاسِعُ',
    transliteration: "Al-Wasi'",
    banglaName: 'আল-ওয়াসি',
    englishName: 'The All-Encompassing',
    englishMeaning: 'The Vast, boundless in knowledge and mercy',
    banglaMeaning: 'সর্বব্যাপী',
    shortExplanationEn:
      'His knowledge, mercy and generosity have no limits.',
    shortExplanationBn:
      'তাঁর জ্ঞান, রহমত ও দানশীলতার কোনো সীমা নেই।',
  },
  {
    id: 46,
    arabic: 'الْحَكِيمُ',
    transliteration: 'Al-Hakim',
    banglaName: 'আল-হাকীম',
    englishName: 'The All-Wise',
    englishMeaning: 'The One perfect in wisdom',
    banglaMeaning: 'প্রজ্ঞাময়',
    shortExplanationEn:
      'Everything He creates, commands and decrees is full of wisdom.',
    shortExplanationBn:
      'তাঁর প্রতিটি সৃষ্টি, আদেশ ও ফয়সালা প্রজ্ঞায় পরিপূর্ণ।',
  },
  {
    id: 47,
    arabic: 'الْوَدُودُ',
    transliteration: 'Al-Wadud',
    banglaName: 'আল-ওয়াদূদ',
    englishName: 'The Most Loving',
    englishMeaning: 'The Affectionate, who loves His righteous servants',
    banglaMeaning: 'প্রেমময়',
    shortExplanationEn:
      'He loves those who obey Him and makes them beloved to others.',
    shortExplanationBn:
      'যারা তাঁর আনুগত্য করে, তিনি তাদের ভালোবাসেন এবং অন্যদের কাছেও প্রিয় করে তোলেন।',
  },
  {
    id: 48,
    arabic: 'الْمَجِيدُ',
    transliteration: 'Al-Majid',
    banglaName: 'আল-মাজীদ',
    englishName: 'The Most Glorious',
    englishMeaning: 'The All-Glorious, vast in honour and generosity',
    banglaMeaning: 'গৌরবময়',
    shortExplanationEn:
      'He is glorious in His attributes and abundant in His goodness.',
    shortExplanationBn:
      'তিনি তাঁর গুণাবলিতে গৌরবময় এবং কল্যাণে প্রাচুর্যময়।',
  },
  {
    id: 49,
    arabic: 'الْبَاعِثُ',
    transliteration: "Al-Ba'ith",
    banglaName: 'আল-বা’ইস',
    englishName: 'The Resurrector',
    englishMeaning: 'The One who raises the dead to life',
    banglaMeaning: 'পুনরুত্থানকারী',
    shortExplanationEn:
      'He will raise all people from their graves on the Day of Judgement.',
    shortExplanationBn:
      'কিয়ামতের দিন তিনি সকল মানুষকে কবর থেকে পুনরুত্থিত করবেন।',
  },
  {
    id: 50,
    arabic: 'الشَّهِيدُ',
    transliteration: 'Ash-Shahid',
    banglaName: 'আশ-শাহীদ',
    englishName: 'The Witness',
    englishMeaning: 'The One present everywhere, witnessing all',
    banglaMeaning: 'প্রত্যক্ষ সাক্ষী',
    shortExplanationEn:
      'He witnesses everything that happens; nothing is absent from Him.',
    shortExplanationBn:
      'যা কিছু ঘটে, তিনি সবকিছুর সাক্ষী; কোনো কিছুই তাঁর অগোচরে নয়।',
  },
  {
    id: 51,
    arabic: 'الْحَقُّ',
    transliteration: 'Al-Haqq',
    banglaName: 'আল-হাক্ক',
    englishName: 'The Truth',
    englishMeaning: 'The Real, whose existence is certain',
    banglaMeaning: 'পরম সত্য',
    shortExplanationEn:
      'He is the ultimate Reality; His words, promise and judgement are true.',
    shortExplanationBn:
      'তিনিই চূড়ান্ত সত্য; তাঁর বাণী, প্রতিশ্রুতি ও বিচার সত্য।',
  },
  {
    id: 52,
    arabic: 'الْوَكِيلُ',
    transliteration: 'Al-Wakil',
    banglaName: 'আল-ওয়াকীল',
    englishName: 'The Trustee',
    englishMeaning: 'The Disposer of affairs, on whom one relies',
    banglaMeaning: 'কর্মবিধায়ক',
    shortExplanationEn:
      'He manages all affairs, and He is the best One to rely upon.',
    shortExplanationBn:
      'তিনি সকল বিষয়ের ব্যবস্থাপক; ভরসা করার জন্য তিনিই সর্বোত্তম।',
  },
  {
    id: 53,
    arabic: 'الْقَوِيُّ',
    transliteration: 'Al-Qawiyy',
    banglaName: 'আল-কাউইয়্যু',
    englishName: 'The All-Strong',
    englishMeaning: 'The Possessor of complete strength',
    banglaMeaning: 'মহাশক্তিমান',
    shortExplanationEn:
      'His strength is perfect; He never tires and nothing is difficult for Him.',
    shortExplanationBn:
      'তাঁর শক্তি পরিপূর্ণ; তিনি কখনো ক্লান্ত হন না এবং কোনো কিছুই তাঁর জন্য কঠিন নয়।',
  },
  {
    id: 54,
    arabic: 'الْمَتِينُ',
    transliteration: 'Al-Matin',
    banglaName: 'আল-মাতীন',
    englishName: 'The Firm',
    englishMeaning: 'The Steadfast, whose strength never weakens',
    banglaMeaning: 'সুদৃঢ়',
    shortExplanationEn:
      'His power is firm and unshakeable; it never diminishes.',
    shortExplanationBn:
      'তাঁর ক্ষমতা সুদৃঢ় ও অটল; তা কখনো হ্রাস পায় না।',
  },
  {
    id: 55,
    arabic: 'الْوَلِيُّ',
    transliteration: 'Al-Waliyy',
    banglaName: 'আল-ওয়ালিয়্যু',
    englishName: 'The Protecting Friend',
    englishMeaning: 'The Ally and Helper of the believers',
    banglaMeaning: 'অভিভাবক বন্ধু',
    shortExplanationEn:
      'He is the close Friend and Helper of the believers, guiding them from darkness to light.',
    shortExplanationBn:
      'তিনি মুমিনদের নিকটতম বন্ধু ও সাহায্যকারী; তাদের অন্ধকার থেকে আলোর দিকে নিয়ে যান।',
  },
  {
    id: 56,
    arabic: 'الْحَمِيدُ',
    transliteration: 'Al-Hamid',
    banglaName: 'আল-হামীদ',
    englishName: 'The Praiseworthy',
    englishMeaning: 'The One worthy of all praise',
    banglaMeaning: 'প্রশংসিত',
    shortExplanationEn:
      'All praise belongs to Him in every situation, for He is perfect in every way.',
    shortExplanationBn:
      'সকল অবস্থায় সমস্ত প্রশংসা তাঁরই, কারণ তিনি সর্বদিক থেকে পরিপূর্ণ।',
  },
  {
    id: 57,
    arabic: 'الْمُحْصِي',
    transliteration: 'Al-Muhsi',
    banglaName: 'আল-মুহসী',
    englishName: 'The All-Enumerating',
    englishMeaning: 'The Counter, who knows the number of all things',
    banglaMeaning: 'গণনাকারী',
    shortExplanationEn:
      'He knows the exact count of everything, from raindrops to every deed.',
    shortExplanationBn:
      'বৃষ্টির ফোঁটা থেকে প্রতিটি আমল পর্যন্ত, তিনি সবকিছুর সঠিক সংখ্যা জানেন।',
  },
  {
    id: 58,
    arabic: 'الْمُبْدِئُ',
    transliteration: "Al-Mubdi'",
    banglaName: 'আল-মুবদি',
    englishName: 'The Initiator',
    englishMeaning: 'The Originator, who begins creation',
    banglaMeaning: 'প্রথম সূচনাকারী',
    shortExplanationEn:
      'He began creation for the first time, without any prior example.',
    shortExplanationBn:
      'তিনি কোনো পূর্ব দৃষ্টান্ত ছাড়াই প্রথমবার সৃষ্টির সূচনা করেছেন।',
  },
  {
    id: 59,
    arabic: 'الْمُعِيدُ',
    transliteration: "Al-Mu'id",
    banglaName: 'আল-মু’ঈদ',
    englishName: 'The Restorer',
    englishMeaning: 'The Reproducer, who brings creation back',
    banglaMeaning: 'পুনঃসৃষ্টিকারী',
    shortExplanationEn:
      'Just as He created the first time, He will bring creation back again.',
    shortExplanationBn:
      'যেভাবে তিনি প্রথমবার সৃষ্টি করেছেন, সেভাবেই তিনি আবার সৃষ্টি করবেন।',
  },
  {
    id: 60,
    arabic: 'الْمُحْيِي',
    transliteration: 'Al-Muhyi',
    banglaName: 'আল-মুহয়ী',
    englishName: 'The Giver of Life',
    englishMeaning: 'The One who gives life',
    banglaMeaning: 'জীবনদাতা',
    shortExplanationEn:
      'He gives life to everything living, and revives the earth after it is barren.',
    shortExplanationBn:
      'তিনি প্রতিটি প্রাণীকে জীবন দেন এবং মৃত ভূমিকে আবার সজীব করেন।',
  },
  {
    id: 61,
    arabic: 'الْمُمِيتُ',
    transliteration: 'Al-Mumit',
    banglaName: 'আল-মুমীত',
    englishName: 'The Bringer of Death',
    englishMeaning: 'The One who causes death',
    banglaMeaning: 'মৃত্যুদাতা',
    shortExplanationEn:
      'He decrees the end of every life at its appointed time.',
    shortExplanationBn:
      'তিনি নির্ধারিত সময়ে প্রতিটি জীবনের সমাপ্তি ঘটান।',
  },
  {
    id: 62,
    arabic: 'الْحَيُّ',
    transliteration: 'Al-Hayy',
    banglaName: 'আল-হাইয়্যু',
    englishName: 'The Ever-Living',
    englishMeaning: 'The One whose life is perfect and eternal',
    banglaMeaning: 'চিরঞ্জীব',
    shortExplanationEn:
      'His life has no beginning and no end, and He is never touched by death.',
    shortExplanationBn:
      'তাঁর জীবনের কোনো শুরু বা শেষ নেই; মৃত্যু তাঁকে স্পর্শ করে না।',
  },
  {
    id: 63,
    arabic: 'الْقَيُّومُ',
    transliteration: 'Al-Qayyum',
    banglaName: 'আল-কাইয়্যুম',
    englishName: 'The Self-Subsisting',
    englishMeaning: 'The Sustainer of all existence',
    banglaMeaning: 'সবকিছুর ধারক',
    shortExplanationEn:
      'He needs nothing, while everything depends on Him to exist and continue.',
    shortExplanationBn:
      'তাঁর কোনো কিছুর প্রয়োজন নেই, অথচ সবকিছুর অস্তিত্ব ও স্থায়িত্ব তাঁর উপর নির্ভরশীল।',
  },
  {
    id: 64,
    arabic: 'الْوَاجِدُ',
    transliteration: 'Al-Wajid',
    banglaName: 'আল-ওয়াজিদ',
    englishName: 'The Perceiver',
    englishMeaning: 'The Finder, who lacks nothing',
    banglaMeaning: 'অভাবহীন প্রাপক',
    shortExplanationEn:
      'He finds whatever He wills and is never in need of anything.',
    shortExplanationBn:
      'তিনি যা ইচ্ছা পান এবং কখনো কোনো কিছুর মুখাপেক্ষী নন।',
  },
  {
    id: 65,
    arabic: 'الْمَاجِدُ',
    transliteration: 'Al-Maajid',
    banglaName: 'আল-মাজিদ',
    englishName: 'The Illustrious',
    englishMeaning: 'The Noble, perfect in glory',
    banglaMeaning: 'মহিমান্বিত',
    shortExplanationEn:
      'He is noble and glorious, and His generosity is complete.',
    shortExplanationBn:
      'তিনি মহিমান্বিত ও সম্মানিত; তাঁর দানশীলতা পরিপূর্ণ।',
  },
  {
    id: 66,
    arabic: 'الْوَاحِدُ',
    transliteration: 'Al-Wahid',
    banglaName: 'আল-ওয়াহিদ',
    englishName: 'The One',
    englishMeaning: 'The Single, without partner',
    banglaMeaning: 'এক',
    shortExplanationEn:
      'He is One, with no partner in His lordship, His worship or His attributes.',
    shortExplanationBn:
      'তিনি এক; তাঁর প্রভুত্ব, ইবাদত ও গুণাবলিতে কোনো শরিক নেই।',
  },
  {
    id: 67,
    arabic: 'الْأَحَدُ',
    transliteration: 'Al-Ahad',
    banglaName: 'আল-আহাদ',
    englishName: 'The Unique',
    englishMeaning: 'The Only One, indivisible and incomparable',
    banglaMeaning: 'অদ্বিতীয়',
    shortExplanationEn:
      'He is unique; there is nothing like Him, as stated in Surah Al-Ikhlas.',
    shortExplanationBn:
      'তিনি অদ্বিতীয়; তাঁর মতো কিছুই নেই, যেমন সূরা আল-ইখলাসে বলা হয়েছে।',
  },
  {
    id: 68,
    arabic: 'الصَّمَدُ',
    transliteration: 'As-Samad',
    banglaName: 'আস-সামাদ',
    englishName: 'The Eternal Refuge',
    englishMeaning: 'The Self-Sufficient, on whom all depend',
    banglaMeaning: 'সকলের নির্ভরস্থল',
    shortExplanationEn:
      'All of creation turns to Him in need, while He needs no one.',
    shortExplanationBn:
      'সমগ্র সৃষ্টি প্রয়োজনে তাঁর দিকেই ফিরে যায়, অথচ তিনি কারও মুখাপেক্ষী নন।',
  },
  {
    id: 69,
    arabic: 'الْقَادِرُ',
    transliteration: 'Al-Qadir',
    banglaName: 'আল-কাদির',
    englishName: 'The All-Capable',
    englishMeaning: 'The Able, who has power over all things',
    banglaMeaning: 'সর্বক্ষমতাবান',
    shortExplanationEn:
      'He is able to do anything He wills; nothing is beyond His power.',
    shortExplanationBn:
      'তিনি যা ইচ্ছা তা করতে সক্ষম; কোনো কিছুই তাঁর ক্ষমতার বাইরে নয়।',
  },
  {
    id: 70,
    arabic: 'الْمُقْتَدِرُ',
    transliteration: 'Al-Muqtadir',
    banglaName: 'আল-মুকতাদির',
    englishName: 'The Omnipotent',
    englishMeaning: 'The Determiner, perfect in power',
    banglaMeaning: 'পূর্ণ ক্ষমতার অধিকারী',
    shortExplanationEn:
      'His power is complete and He carries out His decree exactly as He wills.',
    shortExplanationBn:
      'তাঁর ক্ষমতা পরিপূর্ণ; তিনি নিজ ইচ্ছামতো তাঁর ফয়সালা বাস্তবায়ন করেন।',
  },
  {
    id: 71,
    arabic: 'الْمُقَدِّمُ',
    transliteration: 'Al-Muqaddim',
    banglaName: 'আল-মুকাদ্দিম',
    englishName: 'The Expediter',
    englishMeaning: 'The One who brings forward',
    banglaMeaning: 'অগ্রবর্তীকারী',
    shortExplanationEn:
      'He brings forward whatever and whomever He wills, according to His wisdom.',
    shortExplanationBn:
      'তিনি নিজ প্রজ্ঞা অনুযায়ী যা ও যাকে ইচ্ছা এগিয়ে দেন।',
  },
  {
    id: 72,
    arabic: 'الْمُؤَخِّرُ',
    transliteration: "Al-Mu'akhkhir",
    banglaName: 'আল-মুআখখির',
    englishName: 'The Delayer',
    englishMeaning: 'The One who puts back',
    banglaMeaning: 'পশ্চাদবর্তীকারী',
    shortExplanationEn:
      'He delays whatever and whomever He wills, and every delay has wisdom.',
    shortExplanationBn:
      'তিনি যা ও যাকে ইচ্ছা পিছিয়ে দেন; প্রতিটি বিলম্বেই রয়েছে প্রজ্ঞা।',
  },
  {
    id: 73,
    arabic: 'الْأَوَّلُ',
    transliteration: 'Al-Awwal',
    banglaName: 'আল-আউয়াল',
    englishName: 'The First',
    englishMeaning: 'The One before whom there is nothing',
    banglaMeaning: 'অনাদি',
    shortExplanationEn:
      'He existed before everything; there was nothing before Him.',
    shortExplanationBn:
      'তিনি সবকিছুর আগে থেকে আছেন; তাঁর আগে কিছুই ছিল না।',
  },
  {
    id: 74,
    arabic: 'الْآخِرُ',
    transliteration: 'Al-Akhir',
    banglaName: 'আল-আখির',
    englishName: 'The Last',
    englishMeaning: 'The One after whom there is nothing',
    banglaMeaning: 'অনন্ত',
    shortExplanationEn:
      'He remains after everything else has ended; there is nothing after Him.',
    shortExplanationBn:
      'সবকিছু শেষ হয়ে গেলেও তিনি থাকবেন; তাঁর পরে কিছুই নেই।',
  },
  {
    id: 75,
    arabic: 'الظَّاهِرُ',
    transliteration: 'Az-Zahir',
    banglaName: 'আয-যাহির',
    englishName: 'The Manifest',
    englishMeaning: 'The Evident, above whom there is nothing',
    banglaMeaning: 'প্রকাশ্য',
    shortExplanationEn:
      'His existence is evident through His signs, and He is above all things.',
    shortExplanationBn:
      'তাঁর নিদর্শনের মাধ্যমে তাঁর অস্তিত্ব সুস্পষ্ট; তিনি সবকিছুর ঊর্ধ্বে।',
  },
  {
    id: 76,
    arabic: 'الْبَاطِنُ',
    transliteration: 'Al-Batin',
    banglaName: 'আল-বাতিন',
    englishName: 'The Hidden',
    englishMeaning: 'The Inner, nearer than anything',
    banglaMeaning: 'অপ্রকাশ্য',
    shortExplanationEn:
      'He cannot be seen in this world, yet He is closer to us than anything.',
    shortExplanationBn:
      'এই দুনিয়ায় তাঁকে দেখা যায় না, তবুও তিনি আমাদের সবচেয়ে নিকটে।',
  },
  {
    id: 77,
    arabic: 'الْوَالِي',
    transliteration: 'Al-Wali',
    banglaName: 'আল-ওয়ালী',
    englishName: 'The Governor',
    englishMeaning: 'The Patron who manages all affairs',
    banglaMeaning: 'সর্বকর্তৃত্বকারী',
    shortExplanationEn:
      'He governs and manages every affair of the universe.',
    shortExplanationBn:
      'তিনি মহাবিশ্বের প্রতিটি বিষয় পরিচালনা ও নিয়ন্ত্রণ করেন।',
  },
  {
    id: 78,
    arabic: 'الْمُتَعَالِي',
    transliteration: "Al-Muta'ali",
    banglaName: 'আল-মুতা’আলী',
    englishName: 'The Self-Exalted',
    englishMeaning: 'The Most Exalted, far above all creation',
    banglaMeaning: 'সর্বোচ্চ মর্যাদাবান',
    shortExplanationEn:
      'He is exalted far above any likeness to His creation and any imperfection.',
    shortExplanationBn:
      'তিনি সৃষ্টির সাদৃশ্য ও সকল অপূর্ণতা থেকে বহু ঊর্ধ্বে।',
  },
  {
    id: 79,
    arabic: 'الْبَرُّ',
    transliteration: 'Al-Barr',
    banglaName: 'আল-বার্র',
    englishName: 'The Source of All Goodness',
    englishMeaning: 'The Kind and Beneficent',
    banglaMeaning: 'পরম কল্যাণময়',
    shortExplanationEn:
      'His kindness and goodness to His creation are constant and abundant.',
    shortExplanationBn:
      'সৃষ্টির প্রতি তাঁর অনুগ্রহ ও কল্যাণ অবিরাম ও প্রচুর।',
  },
  {
    id: 80,
    arabic: 'التَّوَّابُ',
    transliteration: 'At-Tawwab',
    banglaName: 'আত-তাওয়াব',
    englishName: 'The Acceptor of Repentance',
    englishMeaning: 'The One who constantly turns to His servants in mercy',
    banglaMeaning: 'তওবা কবুলকারী',
    shortExplanationEn:
      'He guides His servants to repent and accepts their repentance again and again.',
    shortExplanationBn:
      'তিনি বান্দাদের তওবার তাওফিক দেন এবং বারবার তাদের তওবা কবুল করেন।',
  },
  {
    id: 81,
    arabic: 'الْمُنْتَقِمُ',
    transliteration: 'Al-Muntaqim',
    banglaName: 'আল-মুনতাকিম',
    englishName: 'The Avenger',
    englishMeaning: 'The Just Requiter of wrongdoers',
    banglaMeaning: 'ন্যায্য প্রতিফলদাতা',
    shortExplanationEn:
      'He justly requites persistent wrongdoers who refuse to turn back.',
    shortExplanationBn:
      'যে জালিমরা অন্যায়ে অটল থাকে, তিনি তাদের ন্যায্য প্রতিফল দেন।',
  },
  {
    id: 82,
    arabic: 'الْعَفُوُّ',
    transliteration: "Al-'Afuww",
    banglaName: 'আল-আফুউ',
    englishName: 'The Pardoner',
    englishMeaning: 'The One who erases sins',
    banglaMeaning: 'মার্জনাকারী',
    shortExplanationEn:
      'He does not only forgive sins, He wipes them away completely.',
    shortExplanationBn:
      'তিনি শুধু গুনাহ ক্ষমাই করেন না, তা সম্পূর্ণ মুছে দেন।',
  },
  {
    id: 83,
    arabic: 'الرَّءُوفُ',
    transliteration: "Ar-Ra'uf",
    banglaName: 'আর-রাউফ',
    englishName: 'The Most Kind',
    englishMeaning: 'The Compassionate, full of tender kindness',
    banglaMeaning: 'পরম স্নেহশীল',
    shortExplanationEn:
      'His compassion is tender and deep, sparing His servants from hardship.',
    shortExplanationBn:
      'তাঁর স্নেহ কোমল ও গভীর; তিনি বান্দাদের কষ্ট থেকে রক্ষা করেন।',
  },
  {
    id: 84,
    arabic: 'مَالِكُ الْمُلْكِ',
    transliteration: 'Malik-ul-Mulk',
    banglaName: 'মালিকুল মুলক',
    englishName: 'Owner of All Sovereignty',
    englishMeaning: 'The Master of the Kingdom',
    banglaMeaning: 'সার্বভৌমত্বের মালিক',
    shortExplanationEn:
      'He gives authority to whom He wills and takes it from whom He wills.',
    shortExplanationBn:
      'তিনি যাকে ইচ্ছা ক্ষমতা দান করেন এবং যার কাছ থেকে ইচ্ছা তা কেড়ে নেন।',
  },
  {
    id: 85,
    arabic: 'ذُو الْجَلَالِ وَالْإِكْرَامِ',
    transliteration: 'Dhul-Jalali wal-Ikram',
    banglaName: 'যুল-জালালি ওয়াল-ইকরাম',
    englishName: 'Lord of Majesty and Generosity',
    englishMeaning: 'The Possessor of Majesty and Honour',
    banglaMeaning: 'মহিমা ও মহানুভবতার অধিকারী',
    shortExplanationEn:
      'He alone deserves to be revered for His majesty and is generous beyond measure.',
    shortExplanationBn:
      'মহিমার কারণে একমাত্র তিনিই সম্মানের যোগ্য, এবং তাঁর দানশীলতা অপরিমেয়।',
  },
  {
    id: 86,
    arabic: 'الْمُقْسِطُ',
    transliteration: 'Al-Muqsit',
    banglaName: 'আল-মুকসিত',
    englishName: 'The Equitable',
    englishMeaning: 'The One who establishes fairness',
    banglaMeaning: 'সুবিচারক',
    shortExplanationEn:
      'He acts with complete fairness and loves those who are fair.',
    shortExplanationBn:
      'তিনি পূর্ণ ন্যায্যতার সাথে কাজ করেন এবং ন্যায়পরায়ণদের ভালোবাসেন।',
  },
  {
    id: 87,
    arabic: 'الْجَامِعُ',
    transliteration: "Al-Jami'",
    banglaName: 'আল-জামি',
    englishName: 'The Gatherer',
    englishMeaning: 'The One who brings together',
    banglaMeaning: 'একত্রকারী',
    shortExplanationEn:
      'He will gather all people on a Day about which there is no doubt.',
    shortExplanationBn:
      'তিনি সকল মানুষকে এমন এক দিনে একত্র করবেন, যাতে কোনো সন্দেহ নেই।',
  },
  {
    id: 88,
    arabic: 'الْغَنِيُّ',
    transliteration: 'Al-Ghaniyy',
    banglaName: 'আল-গানিয়্যু',
    englishName: 'The Self-Sufficient',
    englishMeaning: 'The Rich, free of all need',
    banglaMeaning: 'অমুখাপেক্ষী',
    shortExplanationEn:
      'He is free of all needs, while all of creation is in need of Him.',
    shortExplanationBn:
      'তিনি সকল প্রয়োজন থেকে মুক্ত, অথচ সমগ্র সৃষ্টি তাঁর মুখাপেক্ষী।',
  },
  {
    id: 89,
    arabic: 'الْمُغْنِي',
    transliteration: 'Al-Mughni',
    banglaName: 'আল-মুগনী',
    englishName: 'The Enricher',
    englishMeaning: 'The One who frees from need',
    banglaMeaning: 'অভাবমোচনকারী',
    shortExplanationEn:
      'He enriches whom He wills and frees them from depending on others.',
    shortExplanationBn:
      'তিনি যাকে ইচ্ছা সমৃদ্ধ করেন এবং অন্যের মুখাপেক্ষিতা থেকে মুক্ত রাখেন।',
  },
  {
    id: 90,
    arabic: 'الْمَانِعُ',
    transliteration: "Al-Mani'",
    banglaName: 'আল-মানি',
    englishName: 'The Preventer',
    englishMeaning: 'The Withholder, the Defender against harm',
    banglaMeaning: 'প্রতিরোধকারী',
    shortExplanationEn:
      'He withholds what He wills by His wisdom and protects His servants from harm.',
    shortExplanationBn:
      'তিনি প্রজ্ঞার সাথে যা ইচ্ছা আটকে রাখেন এবং বান্দাদের ক্ষতি থেকে রক্ষা করেন।',
  },
  {
    id: 91,
    arabic: 'الضَّارُّ',
    transliteration: 'Ad-Darr',
    banglaName: 'আদ-দার্র',
    englishName: 'The Distresser',
    englishMeaning: 'The One who allows harm, by His wisdom',
    banglaMeaning: 'ক্ষতির নিয়ন্ত্রক',
    shortExplanationEn:
      'No harm can reach anyone except by His permission and with His wisdom.',
    shortExplanationBn:
      'তাঁর অনুমতি ও প্রজ্ঞা ছাড়া কোনো ক্ষতিই কারও কাছে পৌঁছাতে পারে না।',
  },
  {
    id: 92,
    arabic: 'النَّافِعُ',
    transliteration: "An-Nafi'",
    banglaName: 'আন-নাফি',
    englishName: 'The Giver of Benefit',
    englishMeaning: 'The Propitious, source of all good',
    banglaMeaning: 'উপকারকারী',
    shortExplanationEn:
      'Every benefit that reaches anyone comes only from Him.',
    shortExplanationBn:
      'যে কেউ যে উপকারই পায়, তা কেবল তাঁর কাছ থেকেই আসে।',
  },
  {
    id: 93,
    arabic: 'النُّورُ',
    transliteration: 'An-Nur',
    banglaName: 'আন-নূর',
    englishName: 'The Light',
    englishMeaning: 'The Illuminator of the heavens and the earth',
    banglaMeaning: 'জ্যোতি',
    shortExplanationEn:
      'He is the Light of the heavens and the earth, and He guides hearts with His light.',
    shortExplanationBn:
      'তিনি আসমান ও জমিনের নূর; তিনি তাঁর নূর দিয়ে অন্তরকে পথ দেখান।',
  },
  {
    id: 94,
    arabic: 'الْهَادِي',
    transliteration: 'Al-Hadi',
    banglaName: 'আল-হাদী',
    englishName: 'The Guide',
    englishMeaning: 'The One who guides to what is beneficial',
    banglaMeaning: 'পথপ্রদর্শক',
    shortExplanationEn:
      'He guides His creation to what benefits them, and guides hearts to faith.',
    shortExplanationBn:
      'তিনি সৃষ্টিকে কল্যাণের পথ দেখান এবং অন্তরকে ঈমানের দিকে পরিচালিত করেন।',
  },
  {
    id: 95,
    arabic: 'الْبَدِيعُ',
    transliteration: "Al-Badi'",
    banglaName: 'আল-বাদী',
    englishName: 'The Incomparable Originator',
    englishMeaning: 'The Inventor of the heavens and the earth',
    banglaMeaning: 'অনুপম স্রষ্টা',
    shortExplanationEn:
      'He created the heavens and the earth in a wondrous way, with no previous model.',
    shortExplanationBn:
      'তিনি কোনো পূর্ব নমুনা ছাড়াই বিস্ময়করভাবে আসমান ও জমিন সৃষ্টি করেছেন।',
  },
  {
    id: 96,
    arabic: 'الْبَاقِي',
    transliteration: 'Al-Baqi',
    banglaName: 'আল-বাকী',
    englishName: 'The Everlasting',
    englishMeaning: 'The Enduring, who never perishes',
    banglaMeaning: 'চিরস্থায়ী',
    shortExplanationEn:
      'Everything on earth will perish; only He remains forever.',
    shortExplanationBn:
      'পৃথিবীর সবকিছু ধ্বংস হয়ে যাবে; কেবল তিনিই চিরকাল থাকবেন।',
  },
  {
    id: 97,
    arabic: 'الْوَارِثُ',
    transliteration: 'Al-Warith',
    banglaName: 'আল-ওয়ারিস',
    englishName: 'The Inheritor',
    englishMeaning: 'The One to whom everything returns',
    banglaMeaning: 'সবকিছুর উত্তরাধিকারী',
    shortExplanationEn:
      'When all creation passes away, everything returns to Him alone.',
    shortExplanationBn:
      'সমগ্র সৃষ্টি বিলীন হলে সবকিছু কেবল তাঁর কাছেই ফিরে যাবে।',
  },
  {
    id: 98,
    arabic: 'الرَّشِيدُ',
    transliteration: 'Ar-Rashid',
    banglaName: 'আর-রাশীদ',
    englishName: 'The Rightly Guiding',
    englishMeaning: 'The Guide to the right path, perfect in judgement',
    banglaMeaning: 'সঠিক পথের দিশারী',
    shortExplanationEn:
      'All His decisions are right and wise, and He leads to the right path.',
    shortExplanationBn:
      'তাঁর সকল সিদ্ধান্ত সঠিক ও প্রজ্ঞাপূর্ণ; তিনি সঠিক পথে পরিচালিত করেন।',
  },
  {
    id: 99,
    arabic: 'الصَّبُورُ',
    transliteration: 'As-Sabur',
    banglaName: 'আস-সাবূর',
    englishName: 'The Most Patient',
    englishMeaning: 'The One who is never hasty',
    banglaMeaning: 'পরম ধৈর্যশীল',
    shortExplanationEn:
      'He is patient and does not rush to punish, giving people time to return to Him.',
    shortExplanationBn:
      'তিনি ধৈর্যশীল; শাস্তি দিতে তাড়াহুড়া করেন না, মানুষকে ফিরে আসার সময় দেন।',
  },
]

export const TOTAL_NAMES = allahNames.length

const namesById = new Map(allahNames.map((name) => [name.id, name]))

export function getNameById(id: number): AllahName | undefined {
  return namesById.get(id)
}
