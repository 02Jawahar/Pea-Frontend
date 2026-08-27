import { History } from 'lucide-react'

import { cn } from '@/utils/cn'

export interface AuditChange {
  timestamp: string
  actor: string
  field: string
  from: string
  to: string
}

/**
 * `<AuditTrailPanel>` — read-only change log, rendered wherever the RFP says
 * "the system shall maintain a trail of changes" (Ref. 39, 41, 57, 67).
 */
export function AuditTrailPanel({
  changes,
  title = 'Trail of changes',
  className,
}: {
  changes: AuditChange[]
  title?: string
  className?: string
}) {
  return (
    <div className={cn('card', className)}>
      <header className="flex items-center gap-2 border-b border-grey-200 px-4 py-3">
        <History className="size-4 text-grey-600" />
        <h2 className="text-[13px] font-semibold tracking-[0.03em] text-navy-700 uppercase">
          {title}
        </h2>
        <span className="ml-auto text-[12px] text-grey-600">Read-only</span>
      </header>

      {changes.length === 0 ? (
        <p className="px-4 py-6 text-center text-[13px] text-grey-600">
          No changes recorded since this record was created.
        </p>
      ) : (
        <ul className="divide-y divide-grey-200">
          {changes.map((change, index) => (
            <li key={index} className="px-4 py-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[13px] font-medium text-navy-900">{change.field}</p>
                <time className="text-[12px] text-grey-600">{change.timestamp}</time>
              </div>
              <p className="text-[12px] text-grey-600">
                <span className="line-through">{change.from}</span>
                <span className="mx-1.5">→</span>
                <span className="font-medium text-navy-900">{change.to}</span>
              </p>
              <p className="text-[12px] text-grey-600">by {change.actor}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
