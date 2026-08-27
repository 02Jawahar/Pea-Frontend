import type { AnyStatus } from '@/types'
import { cn } from '@/utils/cn'

/**
 * Status pill vocabulary from 00-README.md. The strings are fixed — "these
 * appear across portals and must not drift" — so the map is exhaustive and
 * anything unrecognised falls back to neutral grey rather than being invented.
 */
const TONES: Record<string, string> = {
  // Neutral / draft
  Draft: 'bg-grey-100 text-grey-700 ring-grey-200',
  'Not Started': 'bg-grey-100 text-grey-700 ring-grey-200',
  'Not Relevant': 'bg-grey-100 text-grey-700 ring-grey-200',
  Vacant: 'bg-grey-100 text-grey-700 ring-grey-200',

  // Informational / in-flight
  Submitted: 'bg-blue-050 text-blue-500 ring-blue-100',
  'Under Review': 'bg-blue-050 text-blue-500 ring-blue-100',
  'Under Scrutiny': 'bg-blue-050 text-blue-500 ring-blue-100',
  Scheduled: 'bg-green-050 text-green-600 ring-green-100',
  Upcoming: 'bg-blue-050 text-blue-500 ring-blue-100',
  Open: 'bg-blue-050 text-blue-500 ring-blue-100',
  'Re-opened': 'bg-purple-050 text-purple-600 ring-purple-100',
  'Under Moderation': 'bg-purple-050 text-purple-600 ring-purple-100',
  'Re-evaluation': 'bg-purple-050 text-purple-600 ring-purple-100',
  Reserve: 'bg-purple-050 text-purple-600 ring-purple-100',

  // Attention
  'Fee Pending': 'bg-amber-050 text-amber-500 ring-amber-100',
  Pending: 'bg-amber-050 text-amber-500 ring-amber-100',
  'In Progress': 'bg-amber-050 text-amber-500 ring-amber-100',
  'Sent Back for Clarification': 'bg-amber-050 text-amber-500 ring-amber-100',
  'Waiting List': 'bg-amber-050 text-amber-500 ring-amber-100',
  Degraded: 'bg-amber-050 text-amber-500 ring-amber-100',
  Locked: 'bg-amber-050 text-amber-500 ring-amber-100',
  'Manually Entered': 'bg-amber-050 text-amber-500 ring-amber-100',
  Ongoing: 'bg-amber-050 text-amber-500 ring-amber-100',

  // Positive
  Approved: 'bg-green-050 text-green-600 ring-green-100',
  Published: 'bg-green-050 text-green-600 ring-green-100',
  Shortlisted: 'bg-green-050 text-green-600 ring-green-100',
  Completed: 'bg-green-050 text-green-600 ring-green-100',
  Qualified: 'bg-green-050 text-green-600 ring-green-100',
  Selected: 'bg-green-050 text-green-600 ring-green-100',
  Closed: 'bg-green-050 text-green-600 ring-green-100',
  Accepted: 'bg-green-050 text-green-600 ring-green-100',
  Healthy: 'bg-green-050 text-green-600 ring-green-100',
  Active: 'bg-green-050 text-green-600 ring-green-100',
  Paid: 'bg-green-050 text-green-600 ring-green-100',
  Verified: 'bg-green-050 text-green-600 ring-green-100',
  Primary: 'bg-green-050 text-green-600 ring-green-100',

  // Negative
  Rejected: 'bg-red-050 text-red-600 ring-red-100',
  Cancelled: 'bg-red-050 text-red-600 ring-red-100',
  Withdrawn: 'bg-red-050 text-red-600 ring-red-100',
  'Not Qualified': 'bg-red-050 text-red-600 ring-red-100',
  Down: 'bg-red-050 text-red-600 ring-red-100',
  Mismatch: 'bg-red-050 text-red-600 ring-red-100',
}

interface StatusPillProps {
  status: AnyStatus | string
  className?: string
  size?: 'sm' | 'md'
}

export function StatusPill({ status, className, size = 'sm' }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium ring-1 ring-inset whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[12px]' : 'px-2.5 py-1 text-[13px]',
        TONES[status] ?? 'bg-grey-100 text-grey-700 ring-grey-200',
        className,
      )}
    >
      {status}
    </span>
  )
}
