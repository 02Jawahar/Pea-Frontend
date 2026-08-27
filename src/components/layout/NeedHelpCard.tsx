import { Headset } from 'lucide-react'

import { cn } from '@/utils/cn'

/**
 * "Every staff sidebar ends with a persistent Need Help? card" — 00-README.md.
 * The helpline details are the ones printed in the demo deck.
 */
export function NeedHelpCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg bg-blue-050 p-3', className)}>
      <p className="flex items-center gap-2 text-[13px] font-semibold text-navy-700">
        <Headset className="size-4" />
        Need Help?
      </p>
      <dl className="mt-2 space-y-1 text-[12px]">
        <Row label="Helpline" value="0413-XXXXXXX" />
        <Row label="Email" value="exam.support@pondi.gov.in" />
        <Row label="Timings" value="10:00 AM – 6:00 PM (Mon–Fri)" />
      </dl>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="shrink-0 text-grey-600">{label}:</dt>
      <dd className="min-w-0 break-words text-navy-900">{value}</dd>
    </div>
  )
}
