import { Layers, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { BarProgressList, DonutChart } from '@/components/charts'
import { DataTable, type Column } from '@/components/common/DataTable'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Button, Card, ProgressBar } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { api, seed } from '@/mock/api'
import type { EvaluationBatch } from '@/types'
import { SummaryPanel } from '../examAdmin/widgets'

export default function EvaluationBatches() {
  const { data, isLoading } = useAsync(() => api.evaluationBatches(), 'evaluationBatches')

  const batches = data ?? []
  const totalScripts = batches.reduce((sum, batch) => sum + batch.totalScripts, 0)
  const completed = batches.reduce((sum, batch) => sum + batch.completed, 0)
  const pending = batches.reduce((sum, batch) => sum + batch.pending, 0)

  const columns: Column<EvaluationBatch>[] = [
    {
      key: 'batchId',
      header: 'Batch ID',
      accessor: (row) => row.batchId,
      sortable: true,
      render: (row) => <span className="font-mono text-[12px] font-medium text-purple-600">{row.batchId}</span>,
    },
    { key: 'name', header: 'Batch Name', accessor: (row) => row.name, sortable: true },
    { key: 'paper', header: 'Paper', accessor: (row) => row.paper },
    {
      key: 'total',
      header: 'Total',
      accessor: (row) => row.totalScripts,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'assigned',
      header: 'Assigned',
      accessor: (row) => row.assigned,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'completed',
      header: 'Completed',
      accessor: (row) => row.completed,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'pending',
      header: 'Pending',
      accessor: (row) => row.pending,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'progress',
      header: 'Progress',
      className: 'min-w-36',
      render: (row) => (
        <ProgressBar value={(row.completed / row.assigned) * 100} showLabel tone="purple" />
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
    {
      key: 'action',
      header: '',
      render: () => (
        <Link to={ROUTES.EV_SCRIPTS}>
          <Button variant="ghost" size="sm">
            Open
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="page">
      <div>
        <h1 className="page-title">My Batches</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Assistant Grade-II Examination 2024 · General Studies Paper I
        </p>
      </div>

      <KpiStrip>
        <KpiCard icon={<Layers className="size-5" />} label="Batches" value={batches.length} tone="purple" />
        <KpiCard icon={<Layers className="size-5" />} label="Scripts in batches" value={totalScripts} tone="blue" />
        <KpiCard icon={<UserCheck className="size-5" />} label="Completed" value={completed} tone="green" />
        <KpiCard icon={<Layers className="size-5" />} label="Pending" value={pending} tone="amber" />
        <KpiCard
          icon={<Layers className="size-5" />}
          label="Not started"
          value={batches.filter((batch) => batch.status === 'Not Started').length}
          subLabel="batches"
          tone="navy"
        />
      </KpiStrip>

      <div className="grid flex-1 items-start gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(300px,1fr)]">
        <Card title="Evaluation batches" className="flex-1">
          <DataTable
            rows={batches}
            columns={columns}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            searchPlaceholder="Search by batch ID or name"
            searchFields={(row) => `${row.batchId} ${row.name}`}
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: ['Not Started', 'In Progress', 'Completed'],
                match: (row, value) => row.status === value,
              },
            ]}
            pageSize={10}
            emptyTitle="No batches assigned"
            emptyDescription="Batches appear here once the Evaluation Admin allocates them to you."
          />
        </Card>

        <div className="flex flex-col gap-4">
          <SummaryPanel
            title="Allocation"
            rows={[
              { label: 'Exam', value: 'Assistant Grade-II 2024' },
              { label: 'Paper', value: 'General Studies - Paper I' },
              { label: 'Evaluation type', value: 'Multiple Evaluators' },
              { label: 'Total evaluators', value: '128' },
              { label: 'Start date', value: '10-May-2024' },
              { label: 'Last date', value: '25-May-2024' },
            ]}
          />

          <Card title="Batch progress">
            <BarProgressList
              items={batches.slice(0, 5).map((batch) => ({
                name: batch.name.split(' - ')[0],
                pct: Math.round((batch.completed / batch.assigned) * 100),
              }))}
            />
          </Card>

          <Card title="Status breakup">
            <DonutChart data={seed.evaluationStatusBreakup} totalLabel="Scripts" />
          </Card>
        </div>
      </div>
    </div>
  )
}
