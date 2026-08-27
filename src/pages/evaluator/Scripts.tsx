import { Link } from 'react-router-dom'

import { DataTable, type Column } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import type { AnswerScript } from '@/types'

export default function AnswerScripts() {
  const { data, isLoading } = useAsync(() => api.scripts(), 'scripts')
  const { can } = useAuth()
  const blind = !can('evaluation.moderate')

  const columns: Column<AnswerScript>[] = [
    {
      key: 'scriptId',
      header: 'Script ID',
      accessor: (row) => row.scriptId,
      sortable: true,
      render: (row) => (
        <Link
          to={ROUTES.EV_SCRIPT(row.id)}
          className="font-mono text-[12px] font-medium text-purple-600 hover:underline"
        >
          {row.scriptId}
        </Link>
      ),
    },
    {
      key: 'candidate',
      header: 'Candidate',
      render: (row) =>
        blind ? (
          <span className="text-grey-600" title="Masked to keep marking blind">
            •••••••• (masked)
          </span>
        ) : (
          row.candidateName
        ),
    },
    { key: 'roll', header: 'Roll Number', accessor: (row) => row.rollNo, sortable: true },
    {
      key: 'marks',
      header: 'Marks Awarded',
      accessor: (row) => row.marksAwarded ?? -1,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
      render: (row) =>
        row.marksAwarded === null ? (
          <span className="text-grey-600">–</span>
        ) : (
          <span className="font-mono">{row.marksAwarded.toFixed(4)} / 100</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusPill status={row.status === 'Completed' ? 'Completed' : 'Pending'} />,
    },
    { key: 'updated', header: 'Last Updated On', render: (row) => row.lastUpdated ?? '–' },
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <Link to={ROUTES.EV_SCRIPT(row.id)}>
          <Button variant="ghost" size="sm">
            {row.status === 'Completed' ? 'View' : 'Evaluate'}
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Answer Scripts</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Scripts assigned to you across your batches.
        </p>
      </div>

      {blind && (
        <Banner tone="info" title="Blind evaluation is on">
          Candidate names are masked while you mark. Identity is revealed in moderation and audit
          views, which your role does not include — the reveal is a role-gated toggle, so either
          policy can be satisfied without a rewrite.
        </Banner>
      )}

      <Card>
        <DataTable
          rows={data ?? []}
          columns={columns}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          searchPlaceholder="Search by Script ID or Roll Number"
          searchFields={(row) => `${row.scriptId} ${row.rollNo}`}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: ['Completed', 'In Progress'],
              match: (row, value) => row.status === value,
            },
          ]}
          pageSize={12}
          emptyTitle="No scripts assigned"
          emptyDescription="Scripts appear here once the Evaluation Admin allocates a batch to you."
        />
      </Card>
    </div>
  )
}
