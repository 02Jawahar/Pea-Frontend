import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Database,
  FileText,
  Filter,
  Gauge,
  Grid3x3,
  IdCard,
  Monitor,
  Settings2,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react'

import { BarProgressList, DonutChart, TrendChart } from '@/components/charts'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Button, Card, Select } from '@/components/common/primitives'
import { SkeletonTable } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import { AlertFeed, QuickActions } from '../examAdmin/widgets'

/** Department Dashboard — demo slide 9 reproduced, with the Quick Actions role-gated. */
export default function DepartmentDashboard() {
  const { data: exams, isLoading } = useAsync(() => api.exams(), 'exams')
  const { staff } = useAuth()
  const s = seed.stats
  const department = seed.departments.find((item) => item.id === staff?.departmentId)

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Department Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Real-time overview of examinations and activities
            {department && ` · ${department.name}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select aria-label="Date" className="w-auto" defaultValue="20-May-2024">
            <option>20-May-2024</option>
            <option>19-May-2024</option>
            <option>18-May-2024</option>
          </Select>
          <Select aria-label="Department" className="w-auto" defaultValue={department?.name ?? 'All Departments'}>
            <option>All Departments</option>
            {seed.departments.map((item) => (
              <option key={item.id}>{item.name}</option>
            ))}
          </Select>
          <Button>
            <Filter className="size-4" />
            Filter
          </Button>
        </div>
      </div>

      <KpiStrip>
        <KpiCard
          icon={<FileText className="size-5" />}
          label="Total Examinations"
          value={s.totalExaminations}
          subLabel="Active 8 · Completed 6 · Upcoming"
          subValue={10}
          tone="blue"
        />
        <KpiCard
          icon={<Users className="size-5" />}
          label="Total Candidates"
          value={s.registeredCandidates}
          subLabel="Registered"
          subValue={s.registeredCandidates}
          tone="green"
        />
        <KpiCard
          icon={<ClipboardList className="size-5" />}
          label="Applications Received"
          value={s.registeredCandidates}
          subLabel="Today"
          subValue={s.candidatesToday}
          tone="purple"
        />
        <KpiCard
          icon={<CalendarDays className="size-5" />}
          label="Exams in Progress"
          value={3}
          subLabel="Candidates"
          subValue={15326}
          tone="amber"
        />
        <KpiCard
          icon={<ShieldCheck className="size-5" />}
          label="Results Declared"
          value={s.resultsDeclared}
          subLabel="This Month"
          tone="green"
        />
        <KpiCard
          icon={<Gauge className="size-5" />}
          label="Avg. Evaluation Progress"
          value={`${s.evaluationProgressPct}%`}
          subLabel={`${s.scriptsEvaluated.toLocaleString('en-IN')} / ${s.totalScripts.toLocaleString('en-IN')} Scripts`}
          tone="blue"
        />
      </KpiStrip>

      <div className="grid items-stretch gap-4 xl:grid-cols-3">
        <Card
          title="Examination Status Overview"
          footer={
            <a href={ROUTES.DEPT_REPORTS} className="text-[13px] font-medium text-navy-700 hover:underline">
              View All Examinations →
            </a>
          }
        >
          <DonutChart
            data={seed.examStatusDistribution.map((slice) => ({
              ...slice,
              name: { Scheduled: 'Active', 'In Progress': 'Upcoming', Completed: 'Completed', Cancelled: 'Cancelled' }[slice.name] ?? slice.name,
            }))}
            totalLabel="Total"
            valueFormatter={(value) => String(value)}
          />
        </Card>

        <Card title="Recent Examinations" bodyClassName="p-0" className="xl:col-span-1">
          {isLoading ? (
            <div className="p-4">
              <SkeletonTable rows={5} cols={4} />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  <th className="px-4 py-2 text-left text-[12px] font-semibold uppercase">Exam</th>
                  <th className="px-4 py-2 text-left text-[12px] font-semibold uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-[12px] font-semibold uppercase">Status</th>
                  <th className="px-4 py-2 text-right text-[12px] font-semibold uppercase">
                    Candidates
                  </th>
                </tr>
              </thead>
              <tbody>
                {(exams ?? []).slice(0, 5).map((exam) => (
                  <tr key={exam.id} className="border-b border-grey-200 last:border-b-0">
                    <td className="data-cell">
                      <p className="font-medium">{exam.name}</p>
                      <p className="text-[12px] text-grey-600">{exam.departmentName}</p>
                    </td>
                    <td className="data-cell whitespace-nowrap">{exam.examDate}</td>
                    <td className="data-cell">
                      <StatusPill status={exam.status} />
                    </td>
                    <td className="data-cell text-right">
                      {exam.candidates.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <AlertFeed title="Important Notifications" />
      </div>

      <div className="grid flex-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Application Receipt Trend">
          <TrendChart
            data={seed.applicationTrend}
            xKey="day"
            series={[{ key: 'applications', label: 'Applications', color: '#1A56A8' }]}
            height={190}
          />
        </Card>

        <Card title="Evaluation Progress Overview">
          <BarProgressList items={seed.batchProgress} />
        </Card>

        <Card title="Candidate Category Distribution">
          <DonutChart data={seed.categoryDistribution} totalLabel="Total" />
        </Card>

        <QuickActions
          actions={[
            { label: 'Create Requisition', icon: FileText, to: ROUTES.DEPT_REQUISITION_NEW, permission: 'requisition.create', tone: 'blue' },
            { label: 'Post Master', icon: Database, to: ROUTES.DEPT_POSTS, permission: 'post.view', tone: 'green' },
            { label: 'Reservation Matrix', icon: Grid3x3, to: ROUTES.DEPT_MATRIX, permission: 'reservation.view', tone: 'purple' },
            { label: 'Application Scrutiny', icon: ClipboardCheck, to: ROUTES.DEPT_SCRUTINY, permission: 'scrutiny.view', tone: 'amber' },
            { label: 'Generate Reports', icon: BarChart3, to: ROUTES.DEPT_REPORTS, permission: 'report.view', tone: 'red' },
            { label: 'Exam Centres', icon: IdCard, to: ROUTES.DEPT_CENTRES, permission: 'centre.view', tone: 'navy' },
            // Exam-admin scope: hidden from a Department Officer by the permission gate.
            { label: 'Create New Exam', icon: CalendarDays, to: ROUTES.EA_EXAMS, permission: 'exam.create', tone: 'blue' },
            { label: 'Live Monitoring', icon: Monitor, to: ROUTES.EA_LIVE, permission: 'monitoring.view', tone: 'green' },
            { label: 'Evaluation Dashboard', icon: TrendingUp, to: ROUTES.EV_DASHBOARD, permission: 'evaluation.view', tone: 'purple' },
            { label: 'User Management', icon: Users, to: ROUTES.AD_USERS, permission: 'user.view', tone: 'amber' },
            { label: 'Department Settings', icon: Settings2, to: ROUTES.AD_MASTERS, permission: 'master.edit', tone: 'navy' },
            { label: 'Audit Logs', icon: ShieldCheck, to: ROUTES.AD_AUDIT, permission: 'audit.view', tone: 'red' },
          ]}
        />
      </div>
    </div>
  )
}
