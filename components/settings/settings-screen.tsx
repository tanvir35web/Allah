'use client'

import { BellRing, Clock, Languages, Lock, Palette, Target, Trash2, type LucideIcon } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { LoadingState } from '@/components/common/loading-state'
import { useAppData } from '@/components/providers/app-data-provider'
import { ListGroup, ListRow } from '@/components/ui/list-group'
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
    <div className="space-y-6">
      <ListGroup title="Appearance">
        <SettingBlock icon={Palette} title="Theme">
          <SegmentedControl<ThemePreference>
            label="Theme"
            value={settings.theme}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            onChange={(theme) => void updateSettings({ theme })}
          />
        </SettingBlock>
        <SettingBlock icon={Languages} title="Meanings" description="Which meanings and explanations are shown">
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
        </SettingBlock>
      </ListGroup>

      <ListGroup title="Learning">
        <SettingBlock icon={Target} title="Daily goal" description="Names to learn each day. Small and steady is best.">
          <SegmentedControl<number>
            label="Daily goal (Names per day)"
            value={settings.dailyGoal}
            options={[1, 3, 5, 10].map((value) => ({ value, label: `${value}` }))}
            onChange={(dailyGoal) => void updateSettings({ dailyGoal })}
          />
        </SettingBlock>
        <ListRow
          icon={BellRing}
          tone="muted"
          title={<label htmlFor={reminderId}>Daily reminder</label>}
          description="Notifications are coming in a future version"
          trailing={
            <Switch
              id={reminderId}
              checked={settings.reminderEnabled}
              onChange={(reminderEnabled) => void updateSettings({ reminderEnabled })}
            />
          }
        />
        {settings.reminderEnabled ? (
          <ListRow
            icon={Clock}
            tone="muted"
            title={<label htmlFor={timeId}>Preferred time</label>}
            trailing={
              <input
                id={timeId}
                type="time"
                value={settings.reminderTime}
                onChange={(event) => void updateSettings({ reminderTime: event.target.value })}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
              />
            }
          />
        ) : null}
      </ListGroup>

      <ListGroup title="Your data">
        <ListRow
          icon={Lock}
          tone="success"
          title="Private to this device"
          description="Stored only here (IndexedDB). No account, no upload, no tracking."
        />
        {(['progress', 'quiz', 'reading', 'all'] as const).map((action) => (
          <ListRow
            key={action}
            icon={Trash2}
            destructive
            title={ACTION_LABELS[action]}
            onClick={() => {
              setDone(null)
              setPending(action)
            }}
          />
        ))}
      </ListGroup>
      {done ? (
        <p role="status" className="-mt-3 px-1 text-sm text-success">
          {done}
        </p>
      ) : null}

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

/** A setting whose control (a segmented control) sits full width under its title. */
function SettingBlock({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-3 px-4 py-3.5">
      <div className="flex items-center gap-3.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-[1.125rem]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.9375rem] font-semibold">{title}</span>
          {description ? <span className="block text-xs leading-snug text-muted-foreground">{description}</span> : null}
        </span>
      </div>
      {children}
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
