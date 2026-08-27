import { cn } from '@/utils/cn'

/**
 * State emblem placeholder. Drawn inline so the app stays self-contained —
 * swap for the official artwork before UAT.
 */
export function Emblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 56" className={cn('size-9', className)} aria-hidden="true">
      <g fill="currentColor">
        <circle cx="24" cy="12" r="5" />
        <path d="M13 20h22l-3 5H16z" />
        <path d="M10 27h28l-4 12H14z" opacity="0.85" />
        <path d="M17 41h14l-2 6H19z" opacity="0.7" />
        <rect x="7" y="49" width="34" height="2.5" rx="1.25" />
      </g>
    </svg>
  )
}

export function GovBrand({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Emblem className="text-white/90" />
      <div className="leading-tight">
        <p className="text-[15px] font-semibold tracking-wide text-white">
          GOVERNMENT OF PUDUCHERRY
        </p>
        <p className="text-[11px] text-white/75">
          {subtitle ?? 'Department of Personnel & Administrative Reforms'}
        </p>
        <p className="text-[11px] font-semibold tracking-wide text-amber-500">E-EXAM SOFTWARE</p>
      </div>
    </div>
  )
}
