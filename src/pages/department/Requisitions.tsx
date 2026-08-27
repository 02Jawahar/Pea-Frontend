import { AlertTriangle, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { DataTable, type Column } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { Button, Card } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import type { Requisition } from '@/types'
import { cn } from '@/utils/cn'

/**
 * Ref. 13 — a department sees requisitions *initiated, verified, approved* and
 * separately those *in the process of* initiating, verifying and approval.
 * That's six buckets, not three: two rows of status cards.
 *
 * PEA sees the same component across all departments (scope prop).
 */
export default function DepartmentRequisitions({ scope = 'department' }: { scope?: 'department' | 'pea' }) {
  const { data, isLoading } = useAsync(() => api.requisitions(), 'requisitions')
  const { staff, can } = useAuth()

  const all = data ?? []
  const rows =
    scope === 'pea' || !staff?.departmentId
      ? all
      : all.filter((requisition) => requisition.departmentId === staff.departmentId)

  const completed = [
    { label: 'Initiated', stage: 'Initiated' as const },
    { label: 'Verified', stage: 'Verified' as const },
    { label: 'Approved', stage: 'Approved' as const },
  ]
  const inProgress = [
    { label: 'Initiating', stage: 'Initiating' as const },
    { label: 'Verifying', stage: 'Verifying' as const },
    { label: 'Approving', stage: 'Approving' as const },
  ]

  const columns: Column<Requisition>[] = [
    {
      key: 'no',
      header: 'Requisition No.',
      accessor: (row) => row.requisitionNo,
      sortable: true,
      render: (row) => (
        <Link
          to={ROUTES.DEPT_REQUISITION(row.id)}
          className="font-mono text-[12px] font-medium text-navy-700 hover:underline"
        >
          {row.requisitionNo}
        </Link>
      ),
    },
    ...(scope === 'pea'
      ? [{ key: 'dept', header: 'Department', accessor: (row: Requisition) => row.departmentName }]
      : []),
    {
      key: 'posts',
      header: 'Posts',
      render: (row) => (
        <div>
          {row.posts.map((post) => (
            <p key={post.postId}>
              {post.postName} <span className="text-grey-600">× {post.count}</span>
            </p>
          ))}
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Vacancies',
      accessor: (row) => row.totalPosts,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    { key: 'nodal', header: 'Nodal Officer', accessor: (row) => row.nodalOfficer },
    {
      key: 'finance',
      header: 'Finance',
      render: (row) => (
        <span
          className={cn(
            'text-[12px]',
            row.financeStatus === 'Concurred'
              ? 'text-green-600'
              : row.financeStatus === 'Pending'
                ? 'text-amber-500'
                : 'text-grey-600',
          )}
        >
          {row.financeStatus}
        </span>
      ),
    },
    { key: 'submitted', header: 'Submitted', accessor: (row) => row.submittedOn, sortable: true },
    {
      key: 'due',
      header: 'Alert threshold',
      render: (row) => {
        // Ref. 14 — configurable alert timelines; overdue rows get a treatment.
        const overdue = row.dueOn < seed.DEMO_TODAY && row.status !== 'Approved'
        return overdue ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-red-600">
            <AlertTriangle className="size-3.5" />
            Overdue since {row.dueOn}
          </span>
        ) : (
          <span className="text-[12px] text-grey-600">Due {row.dueOn}</span>
        )
      },
    },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
  ]

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">
            {scope === 'pea' ? 'Incoming Requisitions' : 'My Requisitions'}
          </h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {scope === 'pea'
              ? 'Combined view across all departments (Ref. 13).'
              : 'Requisitions raised by your department, with their position in the approval workflow.'}
          </p>
        </div>
        {can('requisition.create') && (
          <Link to={ROUTES.DEPT_REQUISITION_NEW}>
            <Button>
              <Plus className="size-4" />
              Create Requisition
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <p className="label-caps mb-2">Completed stages</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {completed.map((bucket) => (
              <Bucket
                key={bucket.stage}
                label={bucket.label}
                count={rows.filter((row) => row.stage === bucket.stage).length}
                tone="green"
              />
            ))}
          </div>
        </div>

        <div>
          <p className="label-caps mb-2">In progress</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {inProgress.map((bucket) => (
              <Bucket
                key={bucket.stage}
                label={bucket.label}
                count={rows.filter((row) => row.stage === bucket.stage).length}
                tone="amber"
              />
            ))}
          </div>
        </div>
      </div>

      <Card>
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          searchPlaceholder="Search by requisition number or post"
          searchFields={(row) =>
            `${row.requisitionNo} ${row.departmentName} ${row.posts.map((post) => post.postName).join(' ')}`
          }
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Cancelled'],
              match: (row, value) => row.status === value,
            },
            {
              key: 'finance',
              label: 'Finance',
              options: ['Concurred', 'Pending', 'Returned', 'Not applicable'],
              match: (row, value) => row.financeStatus === value,
            },
          ]}
          emptyTitle="No requisitions yet"
          emptyDescription="Create a requisition to start a recruitment cycle for a post in your department."
          emptyAction={
            can('requisition.create') && (
              <Link to={ROUTES.DEPT_REQUISITION_NEW}>
                <Button>Create Requisition</Button>
              </Link>
            )
          }
        />
      </Card>
    </div>
  )
}

function Bucket({
  label,
  count,
  tone,
}: {
  label: string
  count: number
  tone: 'green' | 'amber'
}) {
  return (
    <div className="card flex items-center justify-between px-4 py-3">
      <span className="text-[13px] text-grey-600">{label}</span>
      <span
        className={cn(
          'text-[20px] font-semibold',
          tone === 'green' ? 'text-green-600' : 'text-amber-500',
        )}
      >
        {count}
      </span>
    </div>
  )
}
