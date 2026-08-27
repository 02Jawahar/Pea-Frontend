import {
  BarChart3,
  CheckCircle2,
  FileCheck2,
  FileText,
  PieChart,
  RefreshCcw,
  Star,
  Timer,
  UserCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { DonutChart } from '@/components/charts'
import { DataTable, type Column } from '@/components/common/DataTable'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, ProgressBar } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import type { AnswerScript, EvaluationBatch } from '@/types'
import { SummaryPanel } from '../examAdmin/widgets'

/** Evaluation Dashboard — demo slide 7. */
export default function EvaluatorDashboard() {
  const { data: batches, isLoading } = useAsync(() => api.evaluationBatches(), 'evaluationBatches')
  const { data: scripts, isLoading: scriptsLoading } = useAsync(() => api.scripts(), 'scripts')
  const { staff, can } = useAuth()
  const s = seed.stats

  const completedScripts = (scripts ?? []).filter((script) => script.status === 'Completed').length
  const pendingScripts = (scripts ?? []).length - completedScripts

  const batchColumns: Column<EvaluationBatch>[] = [
    {
      key: 'id',
      header: 'Batch ID',
      accessor: (row) => row.batchId,
      sortable: true,
      render: (row) => (
        <Link to={ROUTES.EV_BATCHES} className="font-mono text-[12px] text-purple-600 hover:underline">
          {row.batchId}
        </Link>
      ),
    },
    { key: 'name', header: 'Batch Name', accessor: (row) => row.name },
    { key: 'total', header: 'Total', accessor: (row) => row.totalScripts, className: 'text-right', headerClassName: 'text-right' },
    { key: 'assigned', header: 'Assigned', accessor: (row) => row.assigned, className: 'text-right', headerClassName: 'text-right' },
    { key: 'completed', header: 'Completed', accessor: (row) => row.completed, className: 'text-right', headerClassName: 'text-right' },
    { key: 'pending', header: 'Pending', accessor: (row) => row.pending, className: 'text-right', headerClassName: 'text-right' },
    {
      key: 'progress',
      header: 'Progress',
      className: 'min-w-36',
      render: (row) => (
        <ProgressBar
          value={(row.completed / row.assigned) * 100}
          tone="purple"
          showLabel
        />
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
  ]

  const scriptColumns: Column<AnswerScript>[] = [
    {
      key: 'scriptId',
      header: 'Script ID',
      accessor: (row) => row.scriptId,
      sortable: true,
      render: (row) => (
        <Link
          to={ROUTES.EV_SCRIPT(row.id)}
          className="font-mono text-[12px] text-purple-600 hover:underline"
        >
          {row.scriptId}
        </Link>
      ),
    },
    // Anonymity: the spec flags candidate names on scripts as a fairness risk and
    // recommends masking. The reveal is role-gated so either policy is satisfiable.
    {
      key: 'candidate',
      header: 'Candidate Name',
      render: (row) =>
        can('evaluation.moderate') ? (
          row.candidateName
        ) : (
          <span className="text-grey-600" title="Masked during evaluation to keep marking blind">
            •••••••• (masked)
          </span>
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
          // Ref. 51 mandates 4-decimal capture; do not round for display.
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
        <h1 className="page-title">Evaluation Dashboard</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Evaluate Answer Scripts, Award Marks and Finalize Results · {staff?.name} (
          {staff?.employeeId})
        </p>
      </div>

      <KpiStrip>
        <KpiCard
          icon={<FileText className="size-5" />}
          label="Total Answer Scripts"
          value={s.totalScripts}
          subLabel="All Papers"
          tone="blue"
        />
        <KpiCard
          icon={<UserCheck className="size-5" />}
          label="Scripts Assigned to You"
          value={250}
          subLabel={`Pending ${pendingScripts} | Completed ${completedScripts}`}
          tone="green"
        />
        <KpiCard
          icon={<CheckCircle2 className="size-5" />}
          label="Scripts Evaluated"
          value={completedScripts}
          subLabel="Today"
          subValue={24}
          tone="amber"
        />
        <KpiCard
          icon={<BarChart3 className="size-5" />}
          label="Average Marks Awarded"
          value={`${s.averageMarks} / 100`}
          tone="purple"
        />
        <KpiCard
          icon={<PieChart className="size-5" />}
          label="Evaluation Progress"
          value={`${s.evaluationProgressPct}%`}
          subLabel={`${s.scriptsEvaluated.toLocaleString('en-IN')} / ${s.totalScripts.toLocaleString('en-IN')} Scripts`}
          tone="green"
        />
      </KpiStrip>

      <div className="grid flex-1 items-start gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(320px,1fr)]">
        <div className="space-y-4">
          <Card title="My Evaluation Batches">
            <DataTable
              rows={batches ?? []}
              columns={batchColumns}
              rowKey={(row) => row.id}
              isLoading={isLoading}
              searchPlaceholder="Search batches"
              searchFields={(row) => `${row.batchId} ${row.name}`}
              filters={[
                {
                  key: 'paper',
                  label: 'Paper / Subject',
                  options: ['General Studies - Paper I'],
                  match: (row, value) => row.paper === value,
                },
                {
                  key: 'status',
                  label: 'Status',
                  options: ['Not Started', 'In Progress', 'Completed'],
                  match: (row, value) => row.status === value,
                },
              ]}
              pageSize={5}
              emptyTitle="No batches assigned"
              emptyDescription="Batches appear here once the Evaluation Admin assigns them to you."
            />
          </Card>

          <Card title="My Assigned Scripts">
            <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MiniKpi icon={<Timer className="size-4" />} label="Pending Scripts" value={pendingScripts} tone="amber" />
              <MiniKpi icon={<CheckCircle2 className="size-4" />} label="Completed Scripts" value={completedScripts} tone="green" />
              <MiniKpi icon={<Star className="size-4" />} label="Average Marks Given" value={`${s.averageMarks} / 100`} tone="blue" />
              <MiniKpi icon={<RefreshCcw className="size-4" />} label="Re-Evaluation" value={5} tone="purple" />
            </div>

            <DataTable
              rows={scripts ?? []}
              columns={scriptColumns}
              rowKey={(row) => row.id}
              isLoading={scriptsLoading}
              searchPlaceholder="Search by Script ID or Roll Number"
              searchFields={(row) => `${row.scriptId} ${row.rollNo} ${row.candidateName}`}
              pageSize={5}
              emptyTitle="No scripts assigned"
              emptyDescription="Scripts appear here once a batch is allocated to you."
            />
          </Card>
        </div>

        <div className="space-y-4">
          <SummaryPanel
            title="Evaluation Summary"
            rows={[
              { label: 'Exam Name', value: 'Assistant Grade-II Examination 2024' },
              { label: 'Paper / Subject', value: 'General Studies - Paper I' },
              { label: 'Total Marks', value: '100' },
              { label: 'Evaluation Type', value: 'Multiple Evaluators' },
              { label: 'Total Scripts', value: s.totalScripts.toLocaleString('en-IN') },
              { label: 'Total Evaluators', value: '128' },
              { label: 'Evaluation Start Date', value: '10-May-2024' },
              { label: 'Last Date of Evaluation', value: '25-May-2024' },
            ]}
          />

          <Card title="Evaluation Status Breakup">
            <DonutChart data={seed.evaluationStatusBreakup} totalLabel="Total" />
          </Card>

          <Card title="Important Links">
            <ul className="grid grid-cols-2 gap-2">
              {[
                'Evaluation Guidelines',
                'Question Paper',
                'Marking Scheme',
                'Model Answers',
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#top"
                    className="flex items-center gap-2 rounded-md border border-grey-200 px-2.5 py-2 text-[12px] font-medium text-navy-900 hover:bg-grey-050"
                  >
                    <FileCheck2 className="size-3.5 shrink-0 text-purple-600" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </Card>

          {!can('evaluation.moderate') && (
            <Banner tone="info" title="Blind evaluation is on">
              Candidate names are masked while you mark. Identity is revealed only in moderation and
              audit views, which your role does not include.
            </Banner>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniKpi({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  tone: 'amber' | 'green' | 'blue' | 'purple'
}) {
  const tones = {
    amber: 'bg-amber-050 text-amber-500',
    green: 'bg-green-050 text-green-600',
    blue: 'bg-blue-050 text-blue-500',
    purple: 'bg-purple-050 text-purple-600',
  }
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-grey-200 px-3 py-2.5">
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12px] text-grey-600">{label}</p>
        <p className="text-[15px] font-semibold text-navy-900">
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </p>
      </div>
    </div>
  )
}
