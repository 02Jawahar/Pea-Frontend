import {
  Building2,
  CalendarCheck2,
  CalendarDays,
  ClipboardCheck,
  FileText,
  IdCard,
  MapPin,
  Monitor,
  Plus,
  Upload,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { DonutChart } from '@/components/charts'
import { DataTable, type Column } from '@/components/common/DataTable'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Button, Card } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import type { Exam } from '@/types'
import { cn } from '@/utils/cn'
import { ActivityFeed, AlertFeed, QuickActions } from './widgets'

/** Exam Administration dashboard — demo slide 6 is the reference. */
export default function ExamAdminDashboard() {
  const { data: exams, isLoading } = useAsync(() => api.exams(), 'exams')
  const { staff, can } = useAuth()
  const s = seed.stats

  const columns: Column<Exam>[] = [
    {
      key: 'code',
      header: 'Exam Code',
      accessor: (row) => row.examCode,
      sortable: true,
      render: (row) => (
        <Link
          to={ROUTES.EA_EXAM(row.id)}
          className="font-mono text-[12px] font-medium text-navy-700 hover:underline"
        >
          {row.examCode}
        </Link>
      ),
    },
    { key: 'name', header: 'Exam Name', accessor: (row) => row.name, sortable: true },
    { key: 'dept', header: 'Department', accessor: (row) => row.departmentName },
    { key: 'date', header: 'Exam Date', accessor: (row) => row.examDate, sortable: true },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
    {
      key: 'candidates',
      header: 'Candidates',
      accessor: (row) => row.candidates,
      sortable: true,
      render: (row) => row.candidates.toLocaleString('en-IN'),
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'centres',
      header: 'Centers',
      accessor: (row) => row.centres,
      className: 'text-right',
      headerClassName: 'text-right',
    },
  ]

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Exam Administration</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Signed in as {staff?.name} · {staff?.designation}
          </p>
        </div>
        {can('exam.create') && (
          <Link to={ROUTES.EA_EXAMS}>
            <Button>
              <Plus className="size-4" />
              Create New Exam
            </Button>
          </Link>
        )}
      </div>

      <KpiStrip>
        <KpiCard
          icon={<FileText className="size-5" />}
          label="Total Examinations"
          value={s.totalExaminations}
          subLabel="Active Exams"
          subValue={s.activeExams}
          tone="blue"
        />
        <KpiCard
          icon={<CalendarDays className="size-5" />}
          label="Scheduled Exams"
          value={s.scheduledExams}
          subLabel="Upcoming"
          subValue={s.upcomingExams}
          tone="green"
        />
        <KpiCard
          icon={<Users className="size-5" />}
          label="Registered Candidates"
          value={s.registeredCandidates}
          subLabel="Today"
          subValue={s.candidatesToday}
          tone="purple"
        />
        <KpiCard
          icon={<Building2 className="size-5" />}
          label="Active Centers"
          value={s.activeCentres}
          subLabel="Active Today"
          subValue={s.activeCentresToday}
          tone="amber"
        />
        <KpiCard
          icon={<CalendarCheck2 className="size-5" />}
          label="Exams Completed"
          value={s.completedExams}
          subLabel="Results Declared"
          subValue={s.resultsDeclared}
          tone="green"
        />
      </KpiStrip>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(320px,1fr)]">
        <Card
          className="flex flex-col"
          title="Examinations List"
          action={
            can('exam.create') && (
              <Link to={ROUTES.EA_EXAMS}>
                <Button size="sm">
                  <Plus className="size-3.5" />
                  Create New Exam
                </Button>
              </Link>
            )
          }
        >
          <DataTable
            rows={exams ?? []}
            columns={columns}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            searchPlaceholder="Search by Exam Name / Code"
            searchFields={(row) => `${row.name} ${row.examCode} ${row.departmentName}`}
            filters={[
              {
                key: 'status',
                label: 'Select Status',
                options: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
                match: (row, value) => row.status === value,
              },
              {
                key: 'dept',
                label: 'Select Department',
                options: seed.departments.map((department) => department.name),
                match: (row, value) => row.departmentName === value,
              },
            ]}
            pageSize={5}
            emptyTitle="No examinations match these filters"
            emptyDescription="Clear the search or status filter, or create a new examination."
          />
        </Card>

        <div className="space-y-4">
          <Card
            title="Today's Exam Schedule"
            action={<span className="text-[12px] text-grey-600">20-May-2024</span>}
            bodyClassName="p-0"
            footer={
              <Link
                to={ROUTES.EA_EXAMS}
                className="text-[13px] font-medium text-navy-700 hover:underline"
              >
                View Full Schedule →
              </Link>
            }
          >
            <ul className="divide-y divide-grey-200">
              {(exams ?? []).slice(0, 3).flatMap((exam) =>
                exam.sessions.slice(0, 1).map((session) => (
                  <li key={`${exam.id}-${session.id}`} className="flex gap-3 px-4 py-3">
                    <div className="w-16 shrink-0 text-[12px] font-medium text-navy-900">
                      {session.startTime}
                    </div>
                    <span
                      className={cn(
                        'mt-1.5 size-2 shrink-0 rounded-full',
                        session.status === 'Ongoing' ? 'bg-green-600' : 'bg-blue-500',
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-navy-900">{exam.name}</p>
                      <p className="text-[12px] text-grey-600">
                        {session.label} ({session.startTime} – {session.endTime})
                      </p>
                      <p className="text-[12px] text-grey-600">
                        {session.centres} Centers · {session.candidates.toLocaleString('en-IN')}{' '}
                        Candidates
                      </p>
                    </div>
                    <StatusPill status={session.status} />
                  </li>
                )),
              )}
            </ul>
          </Card>

          <QuickActions
            actions={[
              { label: 'Create New Exam', icon: Plus, to: ROUTES.EA_EXAMS, permission: 'exam.create', tone: 'blue' },
              { label: 'Manage Centers', icon: MapPin, to: ROUTES.EA_CENTRES, permission: 'centre.view', tone: 'green' },
              { label: 'Upload Question Paper', icon: Upload, to: ROUTES.EA_PAPERS, permission: 'paper.manage', tone: 'purple' },
              { label: 'Hall Management', icon: Building2, to: ROUTES.EA_SEATING, permission: 'seating.view', tone: 'amber' },
              { label: 'Assign Invigilators', icon: Users, to: ROUTES.EA_FUNCTIONARIES, permission: 'functionary.assign', tone: 'blue' },
              { label: 'Generate Admit Cards', icon: IdCard, to: ROUTES.EA_ADMIT_CARDS, permission: 'admitcard.generate', tone: 'red' },
              { label: 'Live Monitoring', icon: Monitor, to: ROUTES.EA_LIVE, permission: 'monitoring.view', tone: 'green' },
              { label: 'Review Requisitions', icon: ClipboardCheck, to: ROUTES.EA_REQUISITIONS, permission: 'requisition.view', tone: 'navy' },
            ]}
          />

          <AlertFeed />
        </div>
      </div>

      <div className="grid flex-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
        <Card title="Exam Progress Overview">
          <DonutChart
            data={seed.examStatusDistribution}
            totalLabel="Total Exams"
            valueFormatter={(value) => String(value)}
          />
        </Card>

        <ActivityFeed />
      </div>
    </div>
  )
}
