# 99 Names of Allah — Learn, Remember & Reflect

An offline-first Progressive Web App for learning the 99 Names of Allah (Asma ul Husna), designed primarily for iPhone when added to the Home Screen.

- Arabic (with full diacritics), transliteration, English and Bangla meanings and short explanations for all 99 Names
- Guided learning flow, quizzes (5 types, 5/10/20 questions), daily streak, progress dashboard, favorites and spaced review
- Fully client-side: no backend, no account, no analytics. All data stays on the device in IndexedDB
- Works offline after the first visit (service worker precaches the entire app)

## Tech stack

Next.js 16 (App Router, static export) · React 19 · TypeScript (strict) · Tailwind CSS 4 · `idb` (IndexedDB) · lucide-react · Vitest

UI primitives (`components/ui`) follow the shadcn/ui style but are written locally to keep dependencies minimal.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server at http://localhost:3000 (service worker disabled) |
| `npm run build` | Static export to `out/`, then generates `out/sw.js` |
| `npm start` | Serves `out/` at http://localhost:3000 (`npm start -- --port 4173` for another port) |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest unit tests (data, streak, quiz, progress, review, IndexedDB storage) |
| `npm run icons` | Regenerates icons, favicon and iOS splash screens from SVG (needs `sharp`) |
| `npm run validate` | lint + typecheck + test + build |

Requires Node.js 20.9+.

## Project structure

```text
app/                    Routes (App Router). Every route is prerendered at build time.
  page.tsx              Home (onboarding on first launch)
  names/ names/[id]/    Explorer and detail pages (99 static pages)
  learn/                Guided learning flow (?id= optional)
  quiz/ quiz/result/    Quiz setup/session and results (?id=)
  progress/ favorites/ review/ settings/ more/ about/
  manifest.ts           Web App Manifest
components/             UI, grouped by feature (names, quiz, progress, home, …)
  providers/app-data-provider.tsx   Loads IndexedDB once and exposes data + actions
data/allah-names.ts     The 99 Names (single source of truth)
hooks/                  useToday, derived data hooks, swipe
lib/                    Pure domain logic (no React, no IndexedDB) — fully unit tested
  date.ts streak.ts quiz.ts progress.ts review.ts daily-name.ts
  storage/              The only code that touches IndexedDB
    db.ts names.ts progress.ts quiz.ts streak.ts favorites.ts settings.ts review.ts
scripts/                generate-sw.mjs, sw-template.js, serve.mjs, generate-icons.mjs
tests/                  Vitest tests
```

## Data storage (IndexedDB)

Database `asma-ul-husna`, version 1, opened only in `lib/storage/db.ts`:

| Store | Key | Contents |
| --- | --- | --- |
| `progress` | `nameId` | status (`not_started` / `learning` / `learned`), learnedAt, reviewCount, lastReviewedAt |
| `favorites` | `nameId` | createdAt |
| `quizResults` | `id` (index `by-completedAt`) | mode, scope, score, every answer |
| `dailyActivity` | `date` (local `YYYY-MM-DD`) | learnedNames, quizCompleted, quizzesCompleted, reviewedNames |
| `settings` | `id = "app"` | theme, language, daily goal, reminder preference, onboarding |
| `reviewItems` | `nameId` | correct/incorrect quiz counts and timestamps |

- Related writes are atomic: marking a Name learned updates `progress` and `dailyActivity` in one transaction; saving a quiz updates `quizResults`, `reviewItems` and `dailyActivity` together.
- Components never call IndexedDB directly. `AppDataProvider` loads everything once (the dataset is tiny), keeps it in React state and exposes actions such as `setStatus`, `toggleFavorite`, `saveQuiz`, `recordReview`.
- If IndexedDB is unavailable (e.g. blocked in some private modes) the app keeps working in memory and shows a notice.
- The app calls `navigator.storage.persist()` to reduce the chance of eviction.
- The theme preference is mirrored to `localStorage` (one string) only so it can be applied before first paint without a flash.

**Migrations:** bump `DB_VERSION` in `lib/storage/db.ts` and add an `if (oldVersion < N) { … }` block in `upgrade`.

### Streak rules

A day counts only when the user learns at least one Name, completes a quiz, or reviews a Name — opening the app is not enough. Days use the device's local calendar date; arithmetic uses UTC day numbers so DST changes never break a streak. If yesterday was active and today is not yet, the streak stays alive until the day ends.

### Review rules

A Name is recommended when it was missed in a quiz after its last review, or when its interval has elapsed since it was last reviewed/learned. Intervals grow with successful reviews: 1, 2, 4, 7, 15, 30 days. "Need practice" resets the interval.

## PWA and offline

- `npm run build` runs `next build` (static export, `trailingSlash: true`) and then `scripts/generate-sw.mjs`, which:
  1. flattens Next.js segment-prefetch files into the names the client router requests,
  2. lists every file in `out/` (HTML, RSC payloads, JS, CSS, self-hosted fonts, icons, the Names data),
  3. writes `out/sw.js` with that precache list and a content-hash version.
- The service worker precaches the whole app on install, serves precached files first, falls back to the network, and keeps a runtime copy of anything else. Offline navigations to any route (including Names never opened) work.
- New deployments produce a new version. The new worker waits, and the app shows an "Update" prompt; tapping it activates the update and reloads.
- The service worker is only registered in production builds. Fonts use `next/font` and are self-hosted.
- iOS metadata: `apple-mobile-web-app-capable`, `black-translucent` status bar, apple-touch-icon, light/dark launch images for current iPhones, `viewport-fit=cover` with safe-area padding.

### Testing the PWA locally

```bash
npm run build
npm start            # http://localhost:3000
```

In Chrome DevTools → Application: check Manifest, Service Workers and Cache Storage (`precache-…`). Then switch Network to **Offline** and reload or navigate — everything should still work. Service workers require HTTPS except on `localhost`.

### Installing on iPhone

1. Deploy `out/` to any HTTPS static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3 + CloudFront…). For a quick test from your computer, use an HTTPS tunnel such as `cloudflared tunnel --url http://localhost:3000`.
2. Open the URL in **Safari** on the iPhone.
3. Tap **Share → Add to Home Screen → Add**.
4. Launch from the Home Screen icon. The app opens full screen (standalone) and works offline after the first launch.

On Vercel, `vercel.json` sets the framework to "Other", runs `npm run build` and serves `out/`. With the default Next.js preset Vercel ignores `out/`, so `/sw.js` returns 404 and the app does not work offline. After deploying, check that `/sw.js` loads.

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://names.example.com`) at build time so Open Graph URLs are absolute.

Note: on iOS, Home Screen apps have their own storage, separate from Safari. Deleting the Home Screen app deletes its local progress.

## Updating the Names data

All content lives in `data/allah-names.ts`. Each entry has:

```ts
interface AllahName {
  id: number                // 1–99, order of the list
  arabic: string            // with diacritics
  transliteration: string
  banglaName: string        // transliteration in Bangla script
  englishName: string       // short rendering, used as the quiz answer
  englishMeaning: string    // fuller gloss
  banglaMeaning: string
  shortExplanationEn: string
  shortExplanationBn: string
}
```

Edit the file and run `npm run test`. `tests/data.test.ts` checks there are exactly 99 entries, ids 1–99, every field is present, the scripts are correct, and that `arabic`, `transliteration`, `englishName` and `banglaMeaning` are unique (quiz answers must be unambiguous). Rebuild to ship; the service worker version changes automatically.

The order follows the commonly circulated list from Jāmiʿ at-Tirmidhī (3507). Meanings are short conventional renderings; please have them reviewed by a qualified person if you change them.

## Privacy

No personal data is collected. There is no analytics, tracking or third-party request at runtime. All learning data stays on the device.

## Known limitations

- Daily reminders are a stored preference only; notifications are not implemented yet (iOS supports Web Push for Home Screen apps from iOS 16.4, which would require a push server).
- UI labels are in English; the language setting controls which meanings/explanations are shown (English, Bangla or both).
- No audio pronunciation and no cross-device sync (both would need extra assets or a backend).
- The full offline precache is about 27 MB uncompressed, mostly the 114 surah pages and the 99 Name pages. Surah RSC payloads (`/surahs/<id>/*.txt`) are not precached because they repeat the surah text; offline, navigation falls back to the precached HTML.
