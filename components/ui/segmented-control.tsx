'use client'

import { useId, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

export interface SegmentOption<T extends string | number> {
  value: T
  label: React.ReactNode
  /** Accessible name when the label is not plain text. */
  ariaLabel?: string
}

interface SegmentedControlProps<T extends string | number> {
  label: string
  value: T
  options: SegmentOption<T>[]
  onChange: (value: T) => void
  className?: string
}

/** An accessible radio group styled like an iOS segmented control. */
export function SegmentedControl<T extends string | number>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const id = useId()

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = options.findIndex((option) => option.value === value)
    const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
    if (!delta) return
    event.preventDefault()
    const next = options[(index + delta + options.length) % options.length]
    if (next) {
      onChange(next.value)
      document.getElementById(`${id}-${String(next.value)}`)?.focus()
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('flex gap-1 rounded-2xl bg-muted p-1', className)}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={String(option.value)}
            id={`${id}-${String(option.value)}`}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.ariaLabel}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'min-h-10 flex-1 rounded-xl px-3 text-sm font-medium transition-colors duration-150',
              selected ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
