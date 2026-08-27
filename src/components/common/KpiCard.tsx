import { TrendingDown, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

const TONES = {
  blue: 'bg-blue-050 text-blue-500',
  green: 'bg-green-050 text-green-600',
  amber: 'bg-amber-050 text-amber-500',
  purple: 'bg-purple-050 text-purple-600',
  red: 'bg-red-050 text-red-600',
  navy: 'bg-grey-100 text-navy-700',
} as const

export interface KpiCardProps {
  icon: ReactNode
  label: string
  value: string | number
  /** Sub-line under the value: "Active Exams 8", "Today 1,248". */
  subLabel?: string
  subValue?: string | number
  tone?: keyof typeof TONES
  /** Month-on-month delta, as shown on the Reports & Analytics screen. */
  delta?: { value: string; direction: 'up' | 'down'; note?: string }
  className?: string
}

/**
 * `<KpiCard>` — icon, label, big value, sub-line with delta.
 *
 * Fixed internal rhythm and truncation on every text node, so a long label or a
 * seven-figure value can never widen the card past its grid cell.
 */
export function KpiCard({
  icon,
  label,
  value,
  subLabel,
  subValue,
  tone = 'blue',
  delta,
  className,
}: KpiCardProps) {
  return (
    <article className={cn('card card-interactive flex min-w-0 items-start gap-3 p-4', className)}>
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg',
          TONES[tone],
        )}
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="clamp-1 text-[12px] text-grey-600" title={label}>
          {label}
        </p>
        <p className="clamp-1 mt-0.5 text-[22px] leading-tight font-semibold tracking-[-0.01em] text-navy-900">
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </p>

        {(subLabel || delta) && (
          <p className="clamp-1 mt-1 flex items-center gap-1 text-[12px] text-grey-600">
            {delta ? (
              <>
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center gap-0.5 font-medium',
                    delta.direction === 'up' ? 'text-green-600' : 'text-red-600',
                  )}
                >
                  {delta.direction === 'up' ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {delta.value}
                </span>
                {delta.note && <span className="clamp-1">{delta.note}</span>}
              </>
            ) : (
              <>
                <span className="clamp-1">{subLabel}</span>
                {subValue !== undefined && (
                  <span className="shrink-0 font-medium text-navy-900">
                    {typeof subValue === 'number' ? subValue.toLocaleString('en-IN') : subValue}
                  </span>
                )}
              </>
            )}
          </p>
        )}
      </div>
    </article>
  )
}

/**
 * KPI strips are 4–6 cards. `auto-fit` with a sensible minimum means the row
 * always fills the width — five cards spread across five columns rather than
 * leaving a gap at the end.
 */
export function KpiStrip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 items-stretch gap-3 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fit,minmax(190px,1fr))]',
        className,
      )}
    >
      {children}
    </div>
  )
}
