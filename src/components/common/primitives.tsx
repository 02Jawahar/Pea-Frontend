import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

import { cn } from '@/utils/cn'

/* ------------------------------ Spinner ------------------------------ */

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('size-4 animate-spin text-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z"
      />
    </svg>
  )
}

/* ------------------------------ Button ------------------------------- */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'purple'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-navy-700 text-white hover:bg-navy-800',
  success: 'bg-green-600 text-white hover:bg-green-600/90',
  secondary: 'bg-white text-navy-900 ring-1 ring-inset ring-grey-300 hover:bg-grey-050',
  ghost: 'text-navy-700 hover:bg-grey-100',
  danger: 'bg-red-600 text-white hover:bg-red-600/90',
  purple: 'bg-purple-600 text-white hover:bg-purple-600/90',
}

const SIZES: Record<Size, string> = {
  sm: 'px-2.5 py-1.5 text-[13px] gap-1.5',
  md: 'px-3.5 py-2 text-[13px] gap-2',
  lg: 'px-4 py-2.5 text-[14px] gap-2',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md font-medium whitespace-nowrap',
        'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-45',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  )
}

/* ------------------------------- Card -------------------------------- */

export function Card({
  title,
  action,
  children,
  className,
  bodyClassName,
  footer,
  /** Caps the body height and scrolls inside the card instead of stretching the page. */
  scrollBody,
}: {
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  footer?: ReactNode
  scrollBody?: boolean
}) {
  return (
    <section className={cn('card flex flex-col', className)}>
      {(title || action) && (
        <header className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-grey-200 px-4 py-2.5">
          {typeof title === 'string' ? (
            <h2 className="clamp-1 text-[12px] font-semibold tracking-[0.05em] text-navy-700 uppercase">
              {title}
            </h2>
          ) : (
            title
          )}
          {action}
        </header>
      )}
      <div
        className={cn(
          'min-w-0 flex-1 p-4',
          scrollBody && 'max-h-80 overflow-y-auto',
          bodyClassName,
        )}
      >
        {children}
      </div>
      {footer && (
        <footer className="border-t border-grey-200 px-4 py-2.5 text-[13px]">{footer}</footer>
      )}
    </section>
  )
}

/* ------------------------------ Fields ------------------------------- */

interface FieldWrapProps {
  label?: ReactNode
  required?: boolean
  hint?: ReactNode
  error?: string
  className?: string
  children: ReactNode
  htmlFor?: string
}

export function Field({
  label,
  required,
  hint,
  error,
  className,
  children,
  htmlFor,
}: FieldWrapProps) {
  return (
    <div className={className}>
      {label && (
        <label className="field-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-red-600">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-[12px] text-grey-600">{hint}</p>}
      {error && (
        <p className="mt-1 text-[12px] text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('field-input', className)} {...props} />
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select className={cn('field-input pr-8', className)} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('field-input min-h-20 resize-y', className)} {...props} />
}

/* ------------------------------ Banner ------------------------------- */

const BANNER_TONES = {
  info: 'bg-blue-050 text-navy-700 ring-blue-100',
  success: 'bg-green-050 text-green-600 ring-green-100',
  warning: 'bg-amber-050 text-amber-500 ring-amber-100',
  danger: 'bg-red-050 text-red-600 ring-red-100',
  neutral: 'bg-grey-100 text-grey-700 ring-grey-200',
} as const

export function Banner({
  tone = 'info',
  icon,
  title,
  children,
  className,
  action,
}: {
  tone?: keyof typeof BANNER_TONES
  icon?: ReactNode
  title?: ReactNode
  children?: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md px-4 py-3 text-[13px] ring-1 ring-inset',
        BANNER_TONES[tone],
        className,
      )}
    >
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5')}>{children}</div>}
      </div>
      {action}
    </div>
  )
}

/* ------------------------------ Progress ----------------------------- */

export function ProgressBar({
  value,
  className,
  tone = 'navy',
  showLabel = false,
}: {
  value: number
  className?: string
  tone?: 'navy' | 'green' | 'amber' | 'purple' | 'blue'
  showLabel?: boolean
}) {
  const fill = {
    navy: 'bg-navy-700',
    green: 'bg-green-600',
    amber: 'bg-amber-500',
    purple: 'bg-purple-600',
    blue: 'bg-blue-500',
  }[tone]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-grey-200"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full rounded-full transition-[width]', fill)}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-9 shrink-0 text-right text-[12px] text-grey-600">
          {Math.round(value)}%
        </span>
      )}
    </div>
  )
}

/* ------------------------------- Tabs -------------------------------- */

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: T; label: string; count?: number }[]
  active: T
  onChange: (id: T) => void
  className?: string
}) {
  return (
    <div className={cn('flex gap-1 border-b border-grey-200 overflow-x-auto', className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            '-mb-px border-b-2 px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors',
            active === tab.id
              ? 'border-navy-700 text-navy-700'
              : 'border-transparent text-grey-600 hover:text-navy-900',
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-grey-600">({tab.count.toLocaleString('en-IN')})</span>
          )}
        </button>
      ))}
    </div>
  )
}
