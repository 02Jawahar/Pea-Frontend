import { Lock, LockOpen, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

import { DataTable, type Column } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, ProgressBar } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import type { Ticket } from '@/types'
import { cn } from '@/utils/cn'
import { decodeTicketNo } from '@/utils/format'

/**
 * Ref. 83 — ticket queue with priority assignment and hard locking.
 *
 * "A ticket selected by one user is assigned to that user; other users can view
 * the ticket details but cannot handle the grievance." Two agents must never be
 * able to act on one ticket, so the lock is enforced in the UI and the store.
 */
export default function TicketQueue() {
  const { data, isLoading, reload } = useAsync(() => api.tickets(), 'tickets')
  const { staff, can } = useAuth()
  const agent = staff?.name ?? ''

  const rows = data ?? []
  const breaching = rows.filter(
    (ticket) => ticket.ageHours > ticket.slaHours && !['Closed', 'Cancelled'].includes(ticket.status),
  )

  async function toggleLock(ticket: Ticket) {
    if (ticket.lockedBy === agent) await api.releaseTicket(ticket.id)
    else if (!ticket.lockedBy) await api.lockTicket(ticket.id, agent)
    reload()
  }

  const columns: Column<Ticket>[] = [
    {
      key: 'no',
      header: 'Ticket No.',
      accessor: (row) => row.ticketNo,
      sortable: true,
      render: (row) => (
        <Link
          to={ROUTES.HD_TICKET(row.id)}
          className="font-mono text-[12px] font-medium text-navy-700 hover:underline"
          title={decodeTicketNo(row.ticketNo)}
        >
          {row.ticketNo}
        </Link>
      ),
    },
    {
      key: 'by',
      header: 'Submitted by',
      render: (row) => (
        <div>
          <p className="font-medium">{row.submittedByName}</p>
          <p className="text-[12px] text-grey-600">{row.submittedByType}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Type', accessor: (row) => row.type },
    { key: 'subject', header: 'Subject', accessor: (row) => row.subject, className: 'max-w-64 truncate' },
    { key: 'on', header: 'Submitted On', accessor: (row) => row.submittedOn, sortable: true },
    {
      key: 'priority',
      header: 'Priority',
      accessor: (row) => ['Low', 'Medium', 'High', 'Urgent'].indexOf(row.priority),
      sortable: true,
      render: (row) => (
        <span
          className={cn(
            'rounded px-1.5 py-0.5 text-[12px] font-medium',
            {
              Low: 'bg-grey-100 text-grey-700',
              Medium: 'bg-blue-050 text-blue-500',
              High: 'bg-amber-050 text-amber-500',
              Urgent: 'bg-red-050 text-red-600',
            }[row.priority],
          )}
        >
          {row.priority}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
    {
      key: 'sla',
      header: 'Age against SLA',
      className: 'min-w-40',
      render: (row) => {
        const pct = (row.ageHours / row.slaHours) * 100
        const breach = pct > 100
        return (
          <div>
            <ProgressBar value={Math.min(100, pct)} tone={breach ? 'amber' : 'green'} />
            <p className={cn('mt-0.5 text-[11px]', breach ? 'text-red-600' : 'text-grey-600')}>
              {row.ageHours}h of {row.slaHours}h {breach && '· breaching'}
            </p>
          </div>
        )
      },
    },
    {
      key: 'lock',
      header: 'Assignment',
      render: (row) => {
        const mine = row.lockedBy === agent
        const lockedByOther = Boolean(row.lockedBy) && !mine

        if (lockedByOther) {
          return (
            <span className="inline-flex items-center gap-1 rounded bg-amber-050 px-1.5 py-0.5 text-[12px] font-medium text-amber-500">
              <Lock className="size-3" />
              Locked by {row.lockedBy}
            </span>
          )
        }

        return (
          <Button
            variant={mine ? 'secondary' : 'primary'}
            size="sm"
            disabled={!can('ticket.handle')}
            onClick={() => toggleLock(row)}
          >
            {mine ? (
              <>
                <LockOpen className="size-3.5" />
                Release
              </>
            ) : (
              <>
                <Lock className="size-3.5" />
                Take ticket
              </>
            )}
          </Button>
        )
      },
    },
  ]

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Ticket Queue</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          {rows.length} tickets · {breaching.length} breaching SLA
        </p>
      </div>

      {breaching.length > 0 && (
        <Banner
          tone="warning"
          icon={<TriangleAlert className="size-4" />}
          title={`${breaching.length} ticket${breaching.length === 1 ? '' : 's'} past their SLA threshold`}
        >
          Urgent tickets carry a 6-hour SLA, High 24 hours, Medium 48 and Low 72. Escalation follows
          the matrix configured in the Admin Portal.
        </Banner>
      )}

      <Banner tone="info" title="Tickets lock to one agent">
        Taking a ticket assigns it to you. Other agents can open and read it but cannot act on it
        until you release it — a supervisor can force-release if you are unavailable.
      </Banner>

      <Card>
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          searchPlaceholder="Search by ticket number, subject or submitter"
          searchFields={(row) => `${row.ticketNo} ${row.subject} ${row.submittedByName} ${row.type}`}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                'Open',
                'In Progress',
                'Sent Back for Clarification',
                'Closed',
                'Not Relevant',
                'Cancelled',
                'Re-opened',
              ],
              match: (row, value) => row.status === value,
            },
            {
              key: 'priority',
              label: 'Priority',
              options: ['Low', 'Medium', 'High', 'Urgent'],
              match: (row, value) => row.priority === value,
            },
            {
              key: 'assignment',
              label: 'Assignment',
              options: ['Assigned to me', 'Unassigned', 'Locked by others'],
              match: (row, value) =>
                value === 'Assigned to me'
                  ? row.lockedBy === agent
                  : value === 'Unassigned'
                    ? !row.lockedBy
                    : Boolean(row.lockedBy) && row.lockedBy !== agent,
            },
          ]}
          pageSize={10}
          emptyTitle="No tickets match these filters"
          emptyDescription="Clear the status or priority filter to see the whole queue."
        />
      </Card>
    </div>
  )
}
