import { CheckCircle2, Inbox, RotateCcw, Timer, TriangleAlert, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { DonutChart, TrendChart } from '@/components/charts'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Button, Card, ProgressBar } from '@/components/common/primitives'
import { SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import { cn } from '@/utils/cn'

const VOLUME_TREND = [
  { day: '14-May', raised: 42, resolved: 38 },
  { day: '15-May', raised: 55, resolved: 47 },
  { day: '16-May', raised: 61, resolved: 58 },
  { day: '17-May', raised: 88, resolved: 64 },
  { day: '18-May', raised: 73, resolved: 71 },
  { day: '19-May', raised: 58, resolved: 62 },
  { day: '20-May', raised: 49, resolved: 51 },
]

const SLA_BY_PRIORITY = [
  ['Urgent', 6, 4.2, 96],
  ['High', 24, 18.4, 92],
  ['Medium', 48, 31.7, 88],
  ['Low', 72, 44.1, 94],
]

export default function HelpdeskDashboard() {
  const { data, isLoading } = useAsync(() => api.tickets(), 'tickets')
  const { staff } = useAuth()

  if (isLoading) return <SkeletonCards />

  const tickets = data ?? []
  const agent = staff?.name ?? ''
  const open = tickets.filter((ticket) => !['Closed', 'Cancelled', 'Not Relevant'].includes(ticket.status))
  const mine = tickets.filter((ticket) => ticket.lockedBy === agent)
  const breaching = open.filter((ticket) => ticket.ageHours > ticket.slaHours)
  const reopened = tickets.filter((ticket) => ticket.reopenCount > 0)
  const resolvedToday = tickets.filter((ticket) => ticket.status === 'Closed')

  const byType = [...new Set(tickets.map((ticket) => ticket.type))].map((type) => {
    const count = tickets.filter((ticket) => ticket.type === type).length
    return { name: type, value: count, pct: Number(((count / tickets.length) * 100).toFixed(1)) }
  })

  const byStatus = (['Open', 'In Progress', 'Sent Back for Clarification', 'Closed', 'Re-opened', 'Not Relevant'] as const)
    .map((status) => {
      const count = tickets.filter((ticket) => ticket.status === status).length
      return { name: status, value: count, pct: Number(((count / tickets.length) * 100).toFixed(1)) }
    })
    .filter((slice) => slice.value > 0)

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Helpdesk Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {open.length} open · {breaching.length} breaching SLA · {mine.length} assigned to you
          </p>
        </div>
        <Link to={ROUTES.HD_QUEUE}>
          <Button>
            <Inbox className="size-4" />
            Open ticket queue
          </Button>
        </Link>
      </div>

      <KpiStrip>
        <KpiCard icon={<Inbox className="size-5" />} label="Open tickets" value={open.length} tone="blue" />
        <KpiCard icon={<UserCheck className="size-5" />} label="Assigned to me" value={mine.length} tone="purple" />
        <KpiCard icon={<TriangleAlert className="size-5" />} label="Breaching SLA" value={breaching.length} tone="red" />
        <KpiCard icon={<CheckCircle2 className="size-5" />} label="Resolved" value={resolvedToday.length} subLabel="closed tickets" tone="green" />
        <KpiCard icon={<RotateCcw className="size-5" />} label="Re-opened" value={reopened.length} subLabel="same ticket number continues" tone="amber" />
        <KpiCard icon={<Timer className="size-5" />} label="Avg. resolution" value="26.4 h" subLabel="across all priorities" tone="navy" />
      </KpiStrip>

      <div className="grid flex-1 items-start gap-4 xl:grid-cols-3">
        <Card title="Tickets by type">
          <DonutChart data={byType} totalLabel="Tickets" valueFormatter={(value) => String(value)} />
        </Card>

        <Card title="Tickets by status">
          <DonutChart data={byStatus} totalLabel="Tickets" valueFormatter={(value) => String(value)} />
        </Card>

        <Card title="Volume trend">
          <TrendChart
            data={VOLUME_TREND}
            xKey="day"
            series={[
              { key: 'raised', label: 'Raised', color: '#1A56A8' },
              { key: 'resolved', label: 'Resolved', color: '#1B7A3D' },
            ]}
            height={200}
          />
        </Card>

        <Card title="Resolution time against SLA" className="xl:col-span-2" bodyClassName="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey-200 bg-grey-050">
                {['Priority', 'SLA', 'Average resolution', 'Within SLA', 'Compliance'].map((header) => (
                  <th key={header} className="px-4 py-2 text-left text-[12px] font-semibold uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLA_BY_PRIORITY.map(([priority, sla, average, compliance]) => (
                <tr key={String(priority)} className="border-b border-grey-200 last:border-b-0">
                  <td className="data-cell">
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[12px] font-medium',
                        {
                          Urgent: 'bg-red-050 text-red-600',
                          High: 'bg-amber-050 text-amber-500',
                          Medium: 'bg-blue-050 text-blue-500',
                          Low: 'bg-grey-100 text-grey-700',
                        }[String(priority)],
                      )}
                    >
                      {priority}
                    </span>
                  </td>
                  <td className="data-cell">{sla} hours</td>
                  <td className="data-cell font-mono">{Number(average).toFixed(1)} h</td>
                  <td className="data-cell font-mono">{compliance}%</td>
                  <td className="data-cell min-w-36">
                    <ProgressBar
                      value={Number(compliance)}
                      showLabel
                      tone={Number(compliance) >= 90 ? 'green' : 'amber'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card
          title="Breaching SLA"
          bodyClassName="p-0"
          footer={
            <Link to={ROUTES.HD_QUEUE} className="font-medium text-navy-700 hover:underline">
              Open the queue →
            </Link>
          }
        >
          <ul className="divide-y divide-grey-200">
            {breaching.slice(0, 6).map((ticket) => (
              <li key={ticket.id}>
                <Link
                  to={ROUTES.HD_TICKET(ticket.id)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-grey-050"
                >
                  <div className="min-w-0 flex-1">
                    <p className="clamp-1 text-[13px] font-medium text-navy-900">{ticket.subject}</p>
                    <p className="font-mono text-[11px] text-grey-600">{ticket.ticketNo}</p>
                  </div>
                  <span className="shrink-0 text-[12px] font-medium text-red-600">
                    {ticket.ageHours}h / {ticket.slaHours}h
                  </span>
                  <StatusPill status={ticket.status} />
                </Link>
              </li>
            ))}
            {breaching.length === 0 && (
              <li className="px-4 py-6 text-center text-[13px] text-grey-600">
                No tickets are past their SLA threshold.
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  )
}
