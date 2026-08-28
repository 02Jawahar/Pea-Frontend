import puducherryEmblem from '@/assets/puducherry-emblem.png'
import { cn } from '@/utils/cn'

export function Emblem({ className }: { className?: string }) {
  return (
    <img
      src={puducherryEmblem}
      alt=""
      aria-hidden="true"
      className={cn('h-10 w-auto shrink-0 object-contain brightness-0 invert', className)}
    />
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
