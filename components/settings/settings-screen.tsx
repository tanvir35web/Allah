'use client'

import {
  BellRing,
  BookOpenText,
  Check,
  CircleCheck,
  GraduationCap,
  Info,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { LoadingState } from '@/components/common/loading-state'
import { BanglaText } from '@/components/common/localized-text'
import { useAppData } from '@/components/providers/app-data-provider'
import { SectionTitle } from '@/components/ui/card'
import { ListGroup, ListRow, RowBadge } from '@/components/ui/list-group'
import { useProgressSummary, useReadingSummary } from '@/hooks/use-derived-data'
import { allahNames } from '@/lib/storage/names'
import type { ContentLanguage, ThemePreference } from '@/lib/types'
import { cn, pluralize } from '@/lib/utils'

type DestructiveAction = 'progress' | 'quiz' | 'reading' | 'all'

const ACTIONS: Record<
  DestructiveAction,
  { label: string; description: string; title: string; confirmText: string; confirm: string }
> = {
  progress: {
    label: 'Reset learning progress',
    description: 'Learned Names, review and streaks',
    title: 'Reset learning progress?',
    confirmText:
      'This clears learned Names, review data and your streak history on this device. Favorites and quiz history are kept. This cannot be undone.',
    confirm: 'Reset progress',
  },
  quiz: {
    label: 'Reset quiz history',
    description: 'All quiz results',
    title: 'Reset quiz history?',
    confirmText: 'All quiz results and quiz-based review data will be deleted from this device. This cannot be undone.',
    confirm: 'Reset quizzes',
  },
  reading: {
    label: 'Reset Quran reading',
    description: 'Reading time and bookmarks',
    title: 'Reset Quran reading?',
    confirmText: 'Your Quran reading time and ayah bookmarks will be deleted from this device. This cannot be undone.',
    confirm: 'Reset reading',
  },
  all: {
    label: 'Clear all data',
    description: 'Everything, including settings',
    title: 'Clear all local data?',
    confirmText:
      'Progress, favorites, quiz history, streaks, Quran reading and settings will be permanently deleted from this device, and you will see the welcome screen again.',
    confirm: 'Clear everything',
  },
}

/** A selectable card in a radio group (theme, meanings language). */
function ChoiceCard({
  selected,
  onSelect,
  label,
  children,
  className,
}: {
  selected: boolean
  onSelect: () => void
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onSelect}
      className={cn(
        'relative flex flex-col gap-2 rounded-2xl border p-2.5 text-left transition-[border-color,background-color,box-shadow]',
        selected ? 'border-primary/60 bg-primary-soft ring-1 ring-primary/30' : 'border-border/70 bg-card hover:border-primary/30',
        className,
      )}
    >
      {children}
      <span
        className={cn(
          'absolute top-2 right-2 grid size-5 place-items-center rounded-full border transition-colors',
          selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card',
        )}
        aria-hidden
      >
        {selected ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
    </button>
  )
}

/** Each theme's own colours (from globals.css), so a preview shows that theme, not the current one. */
const PREVIEW = {
  light: { background: '#f6f3ec', card: '#fffdf8', border: '#e2dccf', primary: '#17605b', foreground: '#17201f' },
  dark: { background: '#0b1517', card: '#111e21', border: '#213337', primary: '#74c6b8', foreground: '#e9e5dc' },
} as const

/** A miniature of the app in a theme. */
function ThemePreview({ theme }: { theme: ThemePreference }) {
  const c = PREVIEW[theme]
  return (
    <span
      className="block h-16 overflow-hidden rounded-xl border p-2"
      style={{ background: c.background, borderColor: c.border }}
      aria-hidden
    >
      <span className="block h-2 w-10 rounded-full" style={{ background: c.primary }} />
      <span className="mt-1.5 block h-8 rounded-lg border p-1.5" style={{ background: c.card, borderColor: c.border }}>
        <span className="block h-1.5 w-3/4 rounded-full" style={{ background: c.foreground, opacity: 0.7 }} />
        <span className="mt-1 block h-1.5 w-1/2 rounded-full" style={{ background: c.foreground, opacity: 0.35 }} />
      </span>
    </span>
  )
}

export function SettingsScreen() {
  const data = useAppData()
  const { ready, settings, updateSettings, favorites, quizResults } = data
  const summary = useProgressSummary()
  const reading = useReadingSummary()
  const [pending, setPending] = useState<DestructiveAction | null>(null)
  const [done, setDone] = useState<string | null>(null)

  if (!ready) return <LoadingState rows={4} />

  const runDestructive = async (action: DestructiveAction) => {
    if (action === 'progress') await data.resetProgress()
    if (action === 'quiz') await data.resetQuizHistory()
    if (action === 'reading') await data.resetQuranReading()
    if (action === 'all') await data.clearAllData()
    setDone(action === 'all' ? 'All local data was cleared.' : `${ACTIONS[action].confirm}: done.`)
  }

  // A live example of what each language choice shows, using the first Name.
  const example = allahNames[0]
  const remaining = summary.total - summary.learned
  const daysToFinish = Math.ceil(remaining / settings.dailyGoal)

  return (
    <div className="space-y-7">
      <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
        <CircleCheck className="size-3.5 text-success" aria-hidden />
        Changes are saved automatically on this device.
      </p>

      {/* Theme */}
      <section aria-labelledby="theme-title" className="space-y-2">
        <SectionTitle id="theme-title">Theme</SectionTitle>
        <div role="radiogroup" aria-labelledby="theme-title" className="grid grid-cols-2 gap-3">
          {(['light', 'dark'] as const).map((theme) => (
            <ChoiceCard
              key={theme}
              label={theme === 'light' ? 'Light theme' : 'Dark theme'}
              selected={settings.theme === theme}
              onSelect={() => void updateSettings({ theme })}
            >
              <ThemePreview theme={theme} />
              <span className="px-0.5 text-sm font-semibold">{theme === 'light' ? 'Light' : 'Dark'}</span>
            </ChoiceCard>
          ))}
        </div>
      </section>

      {/* Meanings language */}
      <section aria-labelledby="language-title" className="space-y-2">
        <SectionTitle id="language-title">Meanings</SectionTitle>
        <div role="radiogroup" aria-labelledby="language-title" className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {(
            [
              { value: 'en', title: 'English', label: 'English meanings' },
              { value: 'bn', title: 'বাংলা', label: 'Bangla meanings' },
              { value: 'both', title: 'Both', label: 'English and Bangla meanings' },
            ] as const
          ).map(({ value, title, label }) => (
            <ChoiceCard
              key={value}
              label={label}
              selected={settings.language === value}
              onSelect={() => void updateSettings({ language: value as ContentLanguage })}
              className="px-3.5 py-3"
            >
              <span className={cn('pr-7 text-sm font-semibold', value === 'bn' && 'font-bangla')}>{title}</span>
              {example ? (
                <span className="text-xs leading-snug text-muted-foreground">
                  {value !== 'bn' ? <span className="block">{example.englishName}</span> : null}
                  {value !== 'en' ? <BanglaText className="block">{example.banglaMeaning}</BanglaText> : null}
                </span>
              ) : null}
            </ChoiceCard>
          ))}
        </div>
      </section>

      {/* Daily goal */}
      <section aria-labelledby="goal-title" className="space-y-2">
        <SectionTitle id="goal-title">Daily goal</SectionTitle>
        <div className="space-y-3 rounded-3xl border border-border/70 bg-card p-4 shadow-xs">
          <div role="radiogroup" aria-labelledby="goal-title" className="grid grid-cols-4 gap-2">
            {[1, 3, 5, 10].map((goal) => {
              const selected = settings.dailyGoal === goal
              return (
                <button
                  key={goal}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${pluralize(goal, 'Name')} a day`}
                  onClick={() => void updateSettings({ dailyGoal: goal })}
                  className={cn(
                    'flex min-h-16 flex-col items-center justify-center rounded-2xl border transition-colors',
                    selected
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border/70 bg-background hover:border-primary/30',
                  )}
                >
                  <span className="text-xl font-bold tabular-nums">{goal}</span>
                  <span className={cn('text-[0.6875rem]', selected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                    a day
                  </span>
                </button>
              )
            })}
          </div>
          <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-muted-foreground">
            <GraduationCap className="mt-px size-3.5 shrink-0 text-primary" aria-hidden />
            {remaining === 0
              ? 'All 99 Names learned. Your goal now guides review.'
              : `At ${pluralize(settings.dailyGoal, 'Name')} a day, the remaining ${remaining} take about ${pluralize(daysToFinish, 'day')}. Small and steady is best.`}
          </p>
        </div>
      </section>

      {/* Reminder: honest about not being available yet, rather than a switch that does nothing. */}
      <ListGroup title="Notifications">
        <ListRow
          icon={BellRing}
          tone="muted"
          title="Daily reminder"
          description="A gentle nudge to learn each day"
          trailing={<RowBadge tone="muted">Soon</RowBadge>}
        />
      </ListGroup>

      {/* What is stored */}
      <ListGroup title="On this device">
        <ListRow
          icon={ShieldCheck}
          tone="success"
          title="Private and offline"
          description="Stored only here. No account, no upload, no tracking."
        />
        <ListRow icon={GraduationCap} title="Names learned" trailing={<RowBadge>{summary.learned}</RowBadge>} />
        <ListRow icon={Star} tone="accent" title="Favorites" trailing={<RowBadge tone="accent">{favorites.length}</RowBadge>} />
        <ListRow icon={Sparkles} tone="accent" title="Quizzes taken" trailing={<RowBadge tone="accent">{quizResults.length}</RowBadge>} />
        <ListRow icon={BookOpenText} title="Surahs read" trailing={<RowBadge>{reading.surahsRead}</RowBadge>} />
      </ListGroup>

      {/* Danger zone */}
      <section aria-labelledby="danger-title" className="space-y-2">
        <SectionTitle id="danger-title" className="text-danger/80">
          Danger zone
        </SectionTitle>
        <div className="divide-y divide-danger/15 overflow-hidden rounded-3xl border border-danger/25 bg-card shadow-xs">
          {(['progress', 'quiz', 'reading'] as const).map((action) => (
            <ListRow
              key={action}
              icon={RotateCcw}
              destructive
              title={ACTIONS[action].label}
              description={ACTIONS[action].description}
              onClick={() => {
                setDone(null)
                setPending(action)
              }}
            />
          ))}
          <ListRow
            icon={Trash2}
            destructive
            title={ACTIONS.all.label}
            description={ACTIONS.all.description}
            className="bg-danger-soft/30"
            onClick={() => {
              setDone(null)
              setPending('all')
            }}
          />
        </div>
        {done ? (
          <p role="status" className="flex items-center gap-2 px-1 text-sm text-success">
            <CircleCheck className="size-4" aria-hidden />
            {done}
          </p>
        ) : null}
      </section>

      <ListGroup>
        <ListRow href="/about/" icon={Info} tone="muted" title="About this app" description="Sources and privacy" />
      </ListGroup>

      <ConfirmDialog
        open={pending !== null}
        title={pending ? ACTIONS[pending].title : ''}
        description={pending ? ACTIONS[pending].confirmText : ''}
        confirmLabel={pending ? ACTIONS[pending].confirm : ''}
        onConfirm={() => (pending ? runDestructive(pending) : undefined)}
        onClose={() => setPending(null)}
      />
    </div>
  )
}
