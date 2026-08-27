import { Check } from 'lucide-react'

import { cn } from '@/utils/cn'

export interface Step {
  id: string
  label: string
}

/**
 * `<StepperWizard>` — numbered horizontal stepper with completed / active /
 * pending states. Used by registration (6 steps), merit generation (5 steps)
 * and notification approval.
 */
export function StepperWizard({
  steps,
  current,
  onStepClick,
  className,
}: {
  steps: Step[]
  current: number
  onStepClick?: (index: number) => void
  className?: string
}) {
  return (
    <ol className={cn('flex items-start overflow-x-auto pb-1', className)}>
      {steps.map((step, index) => {
        const done = index < current
        const active = index === current
        const clickable = Boolean(onStepClick) && index <= current

        return (
          <li key={step.id} className="flex min-w-0 flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <span
                className={cn(
                  'h-0.5 flex-1',
                  index === 0 ? 'bg-transparent' : done || active ? 'bg-green-600' : 'bg-grey-200',
                )}
              />
              <button
                type="button"
                disabled={!clickable}
                onClick={clickable ? () => onStepClick?.(index) : undefined}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold transition-colors',
                  done && 'bg-green-600 text-white',
                  active && 'bg-navy-700 text-white ring-4 ring-navy-700/15',
                  !done && !active && 'bg-grey-200 text-grey-600',
                  clickable && 'cursor-pointer',
                )}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : index + 1}
              </button>
              <span
                className={cn(
                  'h-0.5 flex-1',
                  index === steps.length - 1
                    ? 'bg-transparent'
                    : done
                      ? 'bg-green-600'
                      : 'bg-grey-200',
                )}
              />
            </div>
            <span
              className={cn(
                'mt-2 px-1 text-center text-[12px] leading-tight',
                active ? 'font-semibold text-navy-700' : done ? 'text-navy-900' : 'text-grey-600',
              )}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
