import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card } from '@/components/common/primitives'
import { useAuth } from '@/hooks/useAuth'
import { seed } from '@/mock/api'
import type { Permission } from '@/rbac/permissions'
import { cn } from '@/utils/cn'

const TILE_TONES = {
  blue: 'bg-blue-050 text-blue-500',
  green: 'bg-green-050 text-green-600',
  amber: 'bg-amber-050 text-amber-500',
  purple: 'bg-purple-050 text-purple-600',
  red: 'bg-red-050 text-red-600',
  navy: 'bg-grey-100 text-navy-700',
} as const

export interface QuickAction {
  label: string
  icon: LucideIcon
  to: string
  permission?: Permission
  tone?: keyof typeof TILE_TONES
}

/**
 * Quick Actions grid.
 *
 * 03-department-portal.md Flow 7: "Role-gate the Quick Actions grid — a
 * Department Officer should not see Create New Exam. Render only the actions
 * the user's role permits, and keep the tile grid balanced when some are hidden."
 */
export function QuickActions({ actions, title = 'Quick Actions' }: { actions: QuickAction[]; title?: string }) {
  const { can } = useAuth()
  const visible = actions.filter((action) => can(action.permission))

  if (visible.length === 0) return null

  return (
    <Card title={title}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {visible.map((action) => (
          <Link
            key={action.to + action.label}
            to={action.to}
            className="flex flex-col items-center gap-2 rounded-md border border-grey-200 px-2 py-3 text-center transition-colors hover:bg-grey-050"
          >
            <span
              className={cn(
                'flex size-9 items-center justify-center rounded-lg',
                TILE_TONES[action.tone ?? 'blue'],
              )}
            >
              <action.icon className="size-4" strokeWidth={1.75} />
            </span>
            <span className="text-[12px] leading-tight font-medium text-navy-900">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </Card>
  )
}

export function ActivityFeed({ title = 'Latest Activities' }: { title?: string }) {
  return (
    <Card title={title} bodyClassName="p-0">
      <ul className="divide-y divide-grey-200">
        {seed.activities.map((activity) => (
          <li key={activity.id} className="flex gap-3 px-4 py-3">
            <span
              className={cn(
                'mt-1 size-2 shrink-0 rounded-full',
                {
                  info: 'bg-blue-500',
                  success: 'bg-green-600',
                  warning: 'bg-amber-500',
                }[activity.tone],
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-navy-900">{activity.text}</p>
              <p className="text-[12px] text-grey-600">By {activity.actor}</p>
            </div>
            <time className="shrink-0 text-[12px] text-grey-600">{activity.timestamp}</time>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function AlertFeed({ title = 'Notifications' }: { title?: string }) {
  return (
    <Card
      title={title}
      action={<span className="text-[12px] text-grey-600">View All</span>}
      bodyClassName="p-0"
    >
      <ul className="divide-y divide-grey-200">
        {seed.alerts.map((alert) => (
          <li key={alert.id} className="flex gap-3 px-4 py-3">
            <span
              className={cn(
                'mt-1 size-2 shrink-0 rounded-full',
                {
                  info: 'bg-blue-500',
                  success: 'bg-green-600',
                  warning: 'bg-amber-500',
                  danger: 'bg-red-600',
                }[alert.tone],
              )}
            />
            <p className="min-w-0 flex-1 text-[13px] text-navy-900">{alert.text}</p>
            <time className="shrink-0 text-[12px] text-grey-600">{alert.timestamp}</time>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/** Key-value summary panel used in several right rails. */
export function SummaryPanel({
  title,
  rows,
  footer,
}: {
  title: string
  rows: { label: string; value: React.ReactNode }[]
  footer?: React.ReactNode
}) {
  return (
    <Card title={title} bodyClassName="p-0" footer={footer}>
      <table className="w-full">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-grey-200 last:border-b-0">
              <th
                scope="row"
                className="px-4 py-2 text-left text-[13px] font-normal text-grey-600"
              >
                {row.label}
              </th>
              <td className="px-4 py-2 text-right text-[13px] font-medium text-navy-900">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
