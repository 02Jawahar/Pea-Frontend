import { Building2, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

import { DataTable, type Column } from '@/components/common/DataTable'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Card } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { api, seed } from '@/mock/api'
import type { Requisition } from '@/types'
import { cn } from '@/utils/cn'

/**
 * Ref. 15 — Finance is a workflow participant with an inbox, not a full portal.
 *
 * A department may instead upload an existing file approval. Both paths end in
 * the same requisition state, so the inbox shows which path each one used.
 */
export default function FinanceInbox() {
  const { data, isLoading } = useAsync(() => api.requisitions(), 'requisitions')

  const all = data ?? []
  const pending = all.filter(
    (requisition) =>
      requisition.financeRoute === 'Route to Finance Department' &&
      requisition.financeStatus === 'Pending',
  )
  const concurred = all.filter((requisition) => requisition.financeStatus === 'Concurred')
  const uploaded = all.filter((requisition) => requisition.financeRoute === 'Upload existing approval')

  const columns: Column<Requisition>[] = [
    {
      key: 'no',
      header: 'Requisition No.',
      accessor: (row) => row.requisitionNo,
      sortable: true,
      render: (row) => (
        <Link
          to={ROUTES.FI_REQUEST(row.id)}
          className="font-mono text-[12px] font-medium text-navy-700 hover:underline"
        >
          {row.requisitionNo}
        </Link>
      ),
    },
    {
      key: 'dept',
      header: 'Department',
      accessor: (row) => row.departmentName,
      sortable: true,
      render: (row) => (
        // An inter-department task carries the originating department prominently.
        <span className="inline-flex items-center gap-1.5 font-medium text-navy-900">
          <Building2 className="size-3.5 text-navy-700" />
          {row.departmentName}
        </span>
      ),
    },
    {
      key: 'posts',
      header: 'Post(s)',
      render: (row) => row.posts.map((post) => `${post.postName} × ${post.count}`).join(', '),
    },
    {
      key: 'vacancies',
      header: 'Vacancies',
      accessor: (row) => row.totalPosts,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'pay',
      header: 'Pay level',
      render: (row) =>
        seed.posts.find((post) => post.id === row.posts[0]?.postId)?.payLevel ?? '—',
    },
    {
      key: 'implication',
      header: 'Financial implication',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (row) => (
        <span className="font-mono text-[12px]">
          ₹ {(row.totalPosts * 4_80_000).toLocaleString('en-IN')} / yr
        </span>
      ),
    },
    { key: 'on', header: 'Requested on', accessor: (row) => row.submittedOn, sortable: true },
    {
      key: 'age',
      header: 'Age',
      render: (row) => {
        const overdue = row.dueOn < seed.DEMO_TODAY
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[12px]',
              overdue ? 'font-medium text-red-600' : 'text-grey-600',
            )}
          >
            <Clock className="size-3.5" />
            {overdue ? `Overdue since ${row.dueOn}` : `Due ${row.dueOn}`}
          </span>
        )
      },
    },
    {
      key: 'status',
      header: 'Concurrence',
      render: (row) => (
        <StatusPill
          status={
            row.financeStatus === 'Concurred'
              ? 'Approved'
              : row.financeStatus === 'Pending'
                ? 'Pending'
                : row.financeStatus === 'Returned'
                  ? 'Sent Back for Clarification'
                  : 'Draft'
          }
        />
      ),
    },
  ]

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Concurrence Inbox</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Requests to concur on filling vacant posts through direct recruitment.
        </p>
      </div>

      <KpiStrip>
        <KpiCard
          icon={<Clock className="size-5" />}
          label="Pending concurrence"
          value={pending.length}
          tone="amber"
        />
        <KpiCard
          icon={<Building2 className="size-5" />}
          label="Concurred"
          value={concurred.length}
          tone="green"
        />
        <KpiCard
          icon={<Building2 className="size-5" />}
          label="Evidenced by uploaded approval"
          value={uploaded.length}
          subLabel="did not route through this inbox"
          tone="blue"
        />
      </KpiStrip>

      <Banner tone="info" title="Two paths, one end state">
        A department may route a requisition here, or upload an existing file approval from Finance
        or another government authority. Both terminate in the same requisition state; the
        requisition detail records which path was used.
      </Banner>

      <Card title="Requests">
        <DataTable
          rows={all.filter(
            (requisition) => requisition.financeRoute !== 'Not required',
          )}
          columns={columns}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          searchPlaceholder="Search by requisition number or department"
          searchFields={(row) => `${row.requisitionNo} ${row.departmentName}`}
          filters={[
            {
              key: 'status',
              label: 'Concurrence',
              options: ['Pending', 'Concurred', 'Returned'],
              match: (row, value) => row.financeStatus === value,
            },
            {
              key: 'path',
              label: 'Path',
              options: ['Route to Finance Department', 'Upload existing approval'],
              match: (row, value) => row.financeRoute === value,
            },
          ]}
          emptyTitle="Your inbox is empty"
          emptyDescription="Requests appear here when a department routes a requisition for concurrence."
        />
      </Card>
    </div>
  )
}
