import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  label: string
  className?: string
  tone?: 'primary' | 'accent' | 'success'
}

const tones = { primary: 'bg-primary', accent: 'bg-accent', success: 'bg-success' }

export function ProgressBar({ value, max = 100, label, className, tone = 'primary' }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-700 ease-out', tones[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

interface ProgressRingProps {
  value: number
  max: number
  size?: number
  stroke?: number
  label: string
  /** What screen readers say for the value, e.g. "2 of 3 Names learned today". */
  valueText?: string
  tone?: 'primary' | 'success'
  children?: React.ReactNode
}

export function ProgressRing({
  value,
  max,
  size = 72,
  stroke = 6,
  label,
  valueText,
  tone = 'primary',
  children,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = max > 0 ? Math.min(1, value / max) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className={cn('transition-[stroke-dashoffset,stroke] duration-700 ease-out', tone === 'success' ? 'stroke-success' : 'stroke-primary')}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}
