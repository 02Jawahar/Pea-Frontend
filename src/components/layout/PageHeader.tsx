import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

/**
 * One page header for every screen: title, one-line subtitle and the page's
 * actions on the right. Using it everywhere is what makes the portals feel
 * like one product rather than forty separate pages.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-x-4 gap-y-2', className)}>
      <div className="min-w-0">
        <h1 className="page-title clamp-1">{title}</h1>
        {subtitle && <p className="clamp-2 mt-0.5 text-[13px] text-grey-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

/**
 * Page body wrapper. `min-h-full` plus `flex-col` means a short page still
 * reaches the bottom of the viewport instead of leaving a band of empty grey.
 */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex min-h-full flex-col gap-4', className)}>{children}</div>
}

/**
 * A grid row whose cards stretch to equal height and whose last card fills any
 * leftover width — the two things that stop a dashboard looking ragged.
 */
export function Row({
  children,
  cols = 3,
  className,
}: {
  children: ReactNode
  cols?: 2 | 3 | 4
  className?: string
}) {
  const template = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-2 xl:grid-cols-3',
    4: 'sm:grid-cols-2 xl:grid-cols-4',
  }[cols]

  return <div className={cn('grid items-stretch gap-4', template, className)}>{children}</div>
}

/**
 * The main + right-rail split used by most staff screens. The rail sticks so it
 * stays useful while a long table scrolls, and both columns stretch together.
 */
export function Split({
  main,
  rail,
  className,
}: {
  main: ReactNode
  rail: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid flex-1 items-start gap-4 xl:grid-cols-[minmax(0,2.1fr)_minmax(300px,1fr)]',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-4">{main}</div>
      <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-[76px]">{rail}</div>
    </div>
  )
}
