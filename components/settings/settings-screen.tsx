'use client'

import { BellRing, ChevronRight, Info, Lock, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useId, useState } from 'react'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { LoadingState } from '@/components/common/loading-state'
import { useAppData } from '@/components/providers/app-data-provider'
import { Card, SectionTitle } from '@/components/ui/card'
import { SegmentedControl } from '@/components/ui/segmented-control'
import type { ContentLanguage, ThemePreference } from '@/lib/types'
import { cn } from '@/lib/utils'

type DestructiveAction = 'progress' | 'quiz' | 'reading' | 'all'

const ACTION_LABELS: Record<DestructiveAction, string> = {
  progress: 'Reset learning progress',
  quiz: 'Reset quiz history',
  reading: 'Reset Quran reading',
  all: 'Clear all local data',
}

const CONFIRMATIONS: Record<DestructiveAction, { title: string; description: string; confirm: string }> = {
  progress: {
    title: 'Reset learning progress?',
    description: 'This clears learned Names, review data and your streak history on this device. Favorites and quiz history are kept. This cannot be undone.',
    confirm: 'Reset progress',
  },
  quiz: {
    title: 'Reset quiz history?',
    description: 'All quiz results and quiz-based review data will be deleted from this device. This cannot be undone.',
    confirm: 'Reset quizzes',
  },
  reading: {
    title: 'Reset Quran reading?',
    description: 'Your Quran reading time will be deleted from this device. This cannot be undone.',
    confirm: 'Reset reading',
  },
  all: {
    title: 'Clear all local data?',
    description: 'Progress, favorites, quiz history, streaks, Quran reading and settings will be permanently deleted from this device, and you will see the welcome screen again.',
    confirm: 'Clear everything',
  },
}

export function SettingsScreen() {
  const data = useAppData()
  const { ready, settings, updateSettings } = data
  const [pending, setPending] = useState<DestructiveAction | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const reminderId = useId()
  const timeId = useId()

  if (!ready) return <LoadingState rows={4} />

  const runDestructive = async (action: DestructiveAction) => {
    if (action === 'progress') await data.resetProgress()
    if (action === 'quiz') await data.resetQuizHistory()
    if (action === 'reading') await data.resetQuranReading()
    if (action === 'all') await data.clearAllData()
    setDone(action === 'all' ? 'All local data was cleared.' : `${CONFIRMATIONS[action].confirm} — done.`)
  }

  return (
    <div className="space-y-7">
      <section aria-labelledby="appearance" className="space-y-3">
        <SectionTitle id="appearance">Appearance</SectionTitle>
        <Card className="space-y-2 p-4">
          <p className="text-sm font-medium" id="theme-label">
            Theme
          </p>
          <SegmentedControl<ThemePreference>
            label="Theme"
            value={settings.theme}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
            onChange={(theme) => void updateSettings({ theme })}
          />
        </Card>
      </section>

      <section aria-labelledby="language" className="space-y-3">
        <SectionTitle id="language">Meanings language</SectionTitle>
        <Card className="space-y-2 p-4">
          <SegmentedControl<ContentLanguage>
            label="Meanings language"
            value={settings.language}
            options={[
              { value: 'en', label: 'English' },
              { value: 'bn', label: <span lang="bn" className="font-bangla">বাংলা</span>, ariaLabel: 'Bangla' },
              { value: 'both', label: 'Both' },
            ]}
            onChange={(language) => void updateSettings({ language })}
          />
          <p className="px-1 text-xs text-muted-foreground">Choose which meanings and explanations are shown with each Name.</p>
        </Card>
      </section>

      <section aria-labelledby="learning" className="space-y-3">
        <SectionTitle id="learning">Learning</SectionTitle>
        <Card className="divide-y divide-border">
          <div className="space-y-2 p-4">
            <p className="text-sm font-medium">Daily goal</p>
            <SegmentedControl<number>
              label="Daily goal (Names per day)"
              value={settings.dailyGoal}
              options={[1, 3, 5, 10].map((value) => ({ value, label: `${value}` }))}
              onChange={(dailyGoal) => void updateSettings({ dailyGoal })}
            />
            <p className="px-1 text-xs text-muted-foreground">Names to learn each day. Small and steady is best.</p>
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor={reminderId} className="flex items-center gap-3">
                <BellRing className="size-5 text-muted-foreground" aria-hidden />
                <span>
                  <span className="block text-sm font-medium">Daily reminder</span>
                  <span className="block text-xs text-muted-foreground">Notifications are coming in a future version.</span>
                </span>
              </label>
              <Switch
                id={reminderId}
                checked={settings.reminderEnabled}
                onChange={(reminderEnabled) => void updateSettings({ reminderEnabled })}
              />
            </div>
            {settings.reminderEnabled ? (
              <div className="flex items-center justify-between">
                <label htmlFor={timeId} className="text-sm text-muted-foreground">
                  Preferred time
                </label>
                <input
                  id={timeId}
                  type="time"
                  value={settings.reminderTime}
                  onChange={(event) => void updateSettings({ reminderTime: event.target.value })}
                  className="h-11 rounded-xl border border-border bg-card px-3 text-base"
                />
              </div>
            ) : null}
          </div>
        </Card>
      </section>

      <section aria-labelledby="data" className="space-y-3">
        <SectionTitle id="data">Your data</SectionTitle>
        <Card className="p-4">
          <p className="flex gap-3 text-sm text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
            Everything is stored only on this device using IndexedDB. Nothing is uploaded and there is no account or
            tracking.
          </p>
        </Card>
        <Card className="divide-y divide-border overflow-hidden">
          {(['progress', 'quiz', 'reading', 'all'] as const).map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => {
                setDone(null)
                setPending(action)
              }}
              className="flex min-h-14 w-full items-center gap-3 px-4 text-left text-sm font-medium text-danger hover:bg-danger-soft/50"
            >
              <Trash2 className="size-4" aria-hidden />
              {ACTION_LABELS[action]}
            </button>
          ))}
        </Card>
        {done ? (
          <p role="status" className="px-1 text-sm text-success">
            {done}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="about-section" className="space-y-3">
        <SectionTitle id="about-section">About</SectionTitle>
        <Card>
          <Link href="/about/" className="flex min-h-14 items-center gap-3 px-4 text-sm font-medium">
            <Info className="size-4 text-muted-foreground" aria-hidden />
            <span className="flex-1">About this app</span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </Link>
        </Card>
      </section>

      <ConfirmDialog
        open={pending !== null}
        title={pending ? CONFIRMATIONS[pending].title : ''}
        description={pending ? CONFIRMATIONS[pending].description : ''}
        confirmLabel={pending ? CONFIRMATIONS[pending].confirm : ''}
        onConfirm={() => (pending ? runDestructive(pending) : undefined)}
        onClose={() => setPending(null)}
      />
    </div>
  )
}

function Switch({ id, checked, onChange }: { id: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-8 w-13 shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-primary' : 'bg-muted-foreground/30',
      )}
    >
      <span
        className={cn(
          'absolute top-1 left-1 size-6 rounded-full bg-white shadow transition-transform duration-200',
          checked && 'translate-x-5',
        )}
      />
    </button>
  )
}
