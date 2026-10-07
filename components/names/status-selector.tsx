'use client'

import { useAppData } from '@/components/providers/app-data-provider'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { getStatus } from '@/lib/progress'
import type { LearningStatus } from '@/lib/types'
import { STATUS_LABELS } from './status-badge'

const OPTIONS = (['not_started', 'learning', 'learned'] as const).map((value) => ({
  value,
  label: STATUS_LABELS[value],
}))

export function StatusSelector({ nameId }: { nameId: number }) {
  const { progress, setStatus } = useAppData()
  const status = getStatus(progress, nameId)
  return (
    <SegmentedControl<LearningStatus>
      label="Learning status"
      value={status}
      options={OPTIONS}
      onChange={(next) => void setStatus(nameId, next)}
    />
  )
}
