import {
  Activity,
  AlertTriangle,
  CircleCheck,
  KeyRound,
  Plug,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { api, seed } from '@/mock/api'
import { ROLES } from '@/rbac/roles'
import { cn } from '@/utils/cn'

export default function AdminDashboard() {
  const { data: integrations } = useAsync(() => api.integrations(), 'integrations')
  const list = integrations ?? []
  const healthy = list.filter((integration) => integration.status === 'Healthy').length
  const failedLogins = seed.auditEvents.filter(
    (event) => event.action === 'Failed login attempt',
  ).length
  const criticalHolders = seed.staffUsers.filter((user) =>
    user.roleIds.some((id) => ROLES[id].critical),
  )

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Users, roles, integrations, security and SLA exposure
        </p>
      </div>

      <KpiStrip>
        <KpiCard
          icon={<Users className="size-5" />}
          label="Active Users"
          value={seed.staffUsers.filter((user) => user.isActive).length}
          subLabel="of"
          subValue={seed.staffUsers.length}
          tone="blue"
        />
        <KpiCard icon={<KeyRound className="size-5" />} label="Pending Role Requests" value={3} tone="amber" />
        <KpiCard
          icon={<Plug className="size-5" />}
          label="Integration Health"
          value={`${healthy} of ${list.length}`}
          subLabel="healthy"
          tone={healthy === list.length ? 'green' : 'amber'}
        />
        <KpiCard icon={<ShieldAlert className="size-5" />} label="Open Critical Alerts" value={1} tone="red" />
        <KpiCard icon={<Activity className="size-5" />} label="Failed Logins (24h)" value={failedLogins} tone="amber" />
        <KpiCard icon={<CircleCheck className="size-5" />} label="Pending Feature Releases" value={2} tone="purple" />
      </KpiStrip>

      {/* Volume-I §10 — SLA exposure is commercial risk, not just a metric. */}
      <Card
        title="SLA counters (Volume-I §10)"
        action={
          <span className="text-[12px] text-grey-600">Measured quarterly · penalties accrue live</span>
        }
        bodyClassName="p-0"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-grey-200 bg-grey-050">
              {['Measure', 'Current', 'Target', 'Exposure'].map((header) => (
                <th key={header} className="px-4 py-2 text-left text-[12px] font-semibold uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {seed.slaCounters.map((counter) => (
              <tr key={counter.label} className="border-b border-grey-200 last:border-b-0">
                <td className="data-cell">{counter.label}</td>
                <td
                  className={cn(
                    'data-cell font-medium',
                    counter.breach ? 'text-red-600' : 'text-green-600',
                  )}
                >
                  {counter.value}
                </td>
                <td className="data-cell text-grey-600">{counter.target}</td>
                <td className="data-cell">
                  <span className={cn('text-[12px]', counter.breach ? 'text-red-600' : 'text-grey-600')}>
                    {counter.breach && <AlertTriangle className="mr-1 inline size-3.5" />}
                    {counter.note}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="grid flex-1 items-stretch gap-4 xl:grid-cols-3">
        <Card
          title="Integration status"
          footer={
            <Link
              to={ROUTES.AD_INTEGRATIONS}
              className="text-[13px] font-medium text-navy-700 hover:underline"
            >
              Open integration console →
            </Link>
          }
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-grey-200">
            {list.slice(0, 6).map((integration) => (
              <li key={integration.key} className="flex items-center gap-3 px-4 py-2.5">
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    integration.status === 'Healthy'
                      ? 'bg-green-600'
                      : integration.status === 'Degraded'
                        ? 'bg-amber-500'
                        : 'bg-red-600',
                  )}
                />
                <span className="min-w-0 flex-1 truncate text-[13px] text-navy-900">
                  {integration.name}
                </span>
                <StatusPill status={integration.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Recent security events"
          footer={
            <Link to={ROUTES.AD_AUDIT} className="text-[13px] font-medium text-navy-700 hover:underline">
              Open audit log →
            </Link>
          }
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-grey-200">
            {seed.auditEvents
              .filter((event) => event.anomaly)
              .slice(0, 6)
              .map((event) => (
                <li key={event.id} className="px-4 py-2.5">
                  <p className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-medium text-navy-900">{event.action}</span>
                    <time className="text-[12px] text-grey-600">{event.timestamp}</time>
                  </p>
                  <p className="text-[12px] text-grey-600">
                    {event.actor} · {event.module} · {event.ip}
                  </p>
                </li>
              ))}
          </ul>
        </Card>

        <Card
          title="Users holding critical roles"
          footer={
            <Link to={ROUTES.AD_ROLES} className="text-[13px] font-medium text-navy-700 hover:underline">
              Open role monitoring →
            </Link>
          }
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-grey-200">
            {criticalHolders.slice(0, 6).map((user) => (
              <li key={user.id} className="flex items-center gap-3 px-4 py-2.5">
                <ShieldCheck className="size-4 shrink-0 text-amber-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-navy-900">{user.name}</p>
                  <p className="truncate text-[12px] text-grey-600">
                    {user.roleIds.map((id) => ROLES[id].name).join(', ')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Banner tone="info" title="Scheduled maintenance">
        System maintenance is scheduled on 22-May-2024 from 11:00 PM to 2:00 AM. Candidate-facing
        screens will show a maintenance banner from 10:30 PM.
        <Button variant="secondary" size="sm" className="mt-2">
          Edit maintenance window
        </Button>
      </Banner>
    </div>
  )
}
