import { AlertTriangle, Inbox, Lock, WifiOff } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'
import { Banner, Button } from './primitives'

/**
 * The five states every screen must define (00-README.md "Global state patterns").
 * Loading uses skeletons — never spinners on tables.
 */

export function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn('h-3 animate-pulse rounded bg-grey-200', className)} />
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading table">
      <div className="flex gap-3 border-b border-grey-200 pb-3">
        {Array.from({ length: cols }).map((_, index) => (
          <SkeletonLine key={index} className="flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-3 py-2">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <SkeletonLine
              key={colIndex}
              className={cn('flex-1', colIndex === 0 && 'max-w-32')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card space-y-3 p-4">
          <SkeletonLine className="w-24" />
          <SkeletonLine className="h-6 w-16" />
          <SkeletonLine className="w-20" />
        </div>
      ))}
    </div>
  )
}

/** Empty: icon, one-line explanation, primary action. Never a bare "No data". */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center gap-2 px-6 py-12 text-center', className)}>
      <span className="text-grey-300">{icon ?? <Inbox className="size-8" strokeWidth={1.5} />}</span>
      <h3 className="text-[14px] font-semibold text-navy-900">{title}</h3>
      <p className="max-w-md text-[13px] text-grey-600">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/** Error: what failed, what to do next, retry affordance. Never a bare code. */
export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center gap-2 px-6 py-12 text-center', className)}>
      <AlertTriangle className="size-8 text-red-600" strokeWidth={1.5} />
      <h3 className="text-[14px] font-semibold text-navy-900">This section could not load</h3>
      <p className="max-w-md text-[13px] text-grey-600">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-2" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

/**
 * Partial: some data loaded, some failed — common with UIDAI / DigiLocker /
 * e-HRMS. Show what loaded, flag what didn't, offer a manual fallback.
 */
export function PartialState({
  source,
  fallbackLabel = 'Enter manually',
  onFallback,
}: {
  source: string
  fallbackLabel?: string
  onFallback?: () => void
}) {
  return (
    <Banner
      tone="warning"
      icon={<WifiOff className="size-4" />}
      title={`${source} did not respond`}
      action={
        onFallback && (
          <Button variant="secondary" size="sm" onClick={onFallback}>
            {fallbackLabel}
          </Button>
        )
      }
    >
      The rest of this page loaded normally. Fields sourced from {source} are shown blank and can be
      filled in by hand — nothing is blocked.
    </Banner>
  )
}

/** Read-only: after a deadline or a signature. Disabled *with a reason*. */
export function ReadOnlyBanner({ reason }: { reason: string }) {
  return (
    <Banner tone="neutral" icon={<Lock className="size-4" />} title="This record is read-only">
      {reason}
    </Banner>
  )
}
