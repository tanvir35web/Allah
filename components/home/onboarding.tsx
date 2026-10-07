'use client'

import { BookOpenText, CalendarCheck, Sparkles } from 'lucide-react'
import { ArabicText } from '@/components/common/localized-text'
import { useAppData } from '@/components/providers/app-data-provider'
import { Button } from '@/components/ui/button'

const POINTS = [
  { icon: BookOpenText, text: 'Discover their meanings in English and Bangla.' },
  { icon: CalendarCheck, text: 'Build a gentle daily learning habit.' },
  { icon: Sparkles, text: 'Test your knowledge with short quizzes.' },
]

/** First-launch welcome. No account; completion is stored locally. */
export function Onboarding() {
  const { updateSettings } = useAppData()

  return (
    <main
      id="main"
      className="safe-top pattern-stars fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background"
      aria-labelledby="onboarding-title"
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-16 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <div className="animate-rise flex flex-1 flex-col justify-center text-center">
          <ArabicText className="block text-6xl leading-[1.7]">الْأَسْمَاءُ الْحُسْنَىٰ</ArabicText>
          <p className="mt-2 text-sm tracking-[0.2em] text-muted-foreground uppercase">Asma ul Husna</p>
          <h1 id="onboarding-title" className="mt-8 text-3xl font-bold tracking-tight text-balance">
            Learn the 99 Names of Allah
          </h1>
          <ul className="mx-auto mt-8 space-y-4 text-left">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-[0.95rem]">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="animate-rise mt-10 [animation-delay:120ms]">
          <Button size="lg" className="w-full" onClick={() => void updateSettings({ onboardingComplete: true })}>
            Start Learning
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            No account needed. Your progress stays private on this device.
          </p>
        </div>
      </div>
    </main>
  )
}
