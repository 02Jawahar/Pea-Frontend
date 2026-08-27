import { BadgeCheck, Circle } from 'lucide-react'

import type { WorkflowStep } from '@/types'
import { cn } from '@/utils/cn'
import { EmptyState } from './states'

/**
 * `<WorkflowTrail>` — vertical timeline: office, action, actor, timestamp,
 * remarks, signature badge. Mapping is on offices, not users (Ref. 66), so the
 * office is the primary line and the actor is secondary.
 */
export function WorkflowTrail({ steps }: { steps: WorkflowStep[] }) {
  if (steps.length === 0) {
    return (
      <EmptyState
        title="No workflow activity yet"
        description="Actions appear here once the record is submitted into the approval workflow."
      />
    )
  }

  return (
    <ol className="relative space-y-0">
      {steps.map((step, index) => {
        const last = index === steps.length - 1
        return (
          <li key={`${step.office}-${step.timestamp}-${index}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'mt-1 flex size-5 items-center justify-center rounded-full',
                  step.signed ? 'bg-green-600 text-white' : 'bg-grey-200 text-grey-600',
                )}
              >
                {step.signed ? (
                  <BadgeCheck className="size-3" strokeWidth={2.5} />
                ) : (
                  <Circle className="size-2 fill-current" />
                )}
              </span>
              {!last && <span className="w-px flex-1 bg-grey-200" />}
            </div>

            <div className={cn('min-w-0 flex-1', last ? 'pb-0' : 'pb-5')}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-[13px] font-semibold text-navy-900">{step.office}</p>
                <time className="text-[12px] text-grey-600">{step.timestamp}</time>
              </div>
              <p className="text-[13px] text-navy-900">{step.action}</p>
              <p className="text-[12px] text-grey-600">
                {step.actor}
                {step.signed && <span className="ml-1.5 text-green-600">· digitally signed</span>}
              </p>
              {step.remarks && (
                <p className="mt-1 rounded-md bg-grey-050 px-2.5 py-1.5 text-[12px] text-grey-700">
                  “{step.remarks}”
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
