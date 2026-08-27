import {
  BarChart3,
  CalendarClock,
  Database,
  Download,
  FileDown,
  FileSpreadsheet,
  Filter,
  Settings2,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { BarProgressList, ComboChart, DonutChart, TrendChart } from '@/components/charts'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { Button, Card, Input, Select, Tabs } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { seed } from '@/mock/api'
import { cn } from '@/utils/cn'
import { QuickActions } from './widgets'

type TabId = 'overview' | 'examination' | 'evaluation' | 'candidate' | 'custom'

/** Reports & Analytics — demo slide 10 reproduced, with the Ref. 70–73 catalogue. */
export default function ExamAdminReports() {
  const [tab, setTab] = useState<TabId>('overview')
  const s = seed.stats

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Reports &amp; Analytics</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Insights and intelligence for data-driven decision making
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input type="date" defaultValue="2024-05-01" className="w-auto" aria-label="From date" />
          <span className="text-grey-600">→</span>
          <Input type="date" defaultValue="2024-05-20" className="w-auto" aria-label="To date" />
          <Select className="w-auto" aria-label="Department" defaultValue="All Departments">
            <option>All Departments</option>
            {seed.departments.map((department) => (
              <option key={department.id}>{department.name}</option>
            ))}
          </Select>
          <Button>
            <Filter className="size-4" />
            Filter
          </Button>
          <Button variant="secondary">
            <Download className="size-4" />
            Export
          </Button>
          <Button variant="secondary">
            <CalendarClock className="size-4" />
            Schedule Report
          </Button>
        </div>
      </div>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'examination', label: 'Examination Reports' },
          { id: 'evaluation', label: 'Evaluation Reports' },
          { id: 'candidate', label: 'Candidate Reports' },
          { id: 'custom', label: 'Custom Reports' },
        ]}
      />

      {tab === 'overview' && (
        <>
          <KpiStrip>
            <KpiCard
              icon={<Database className="size-5" />}
              label="Total Examinations"
              value={s.totalExaminations}
              tone="purple"
              delta={{ value: '9.1%', direction: 'up', note: 'vs Last Month' }}
            />
            <KpiCard
              icon={<Users className="size-5" />}
              label="Total Candidates"
              value={s.registeredCandidates}
              tone="green"
              delta={{ value: '12.4%', direction: 'up', note: 'vs Last Month' }}
            />
            <KpiCard
              icon={<CalendarClock className="size-5" />}
              label="Exams Conducted"
              value={s.examsConducted}
              tone="blue"
              delta={{ value: '8.7%', direction: 'up', note: 'vs Last Month' }}
            />
            <KpiCard
              icon={<BarChart3 className="size-5" />}
              label="Results Declared"
              value={s.resultsDeclared}
              tone="amber"
              delta={{ value: '50.0%', direction: 'up', note: 'vs Last Month' }}
            />
            <KpiCard
              icon={<FileSpreadsheet className="size-5" />}
              label="Avg. Evaluation Progress"
              value={`${s.evaluationProgressPct}%`}
              tone="green"
              delta={{ value: '7.8%', direction: 'up', note: 'vs Last Month' }}
            />
            <KpiCard
              icon={<FileDown className="size-5" />}
              label="Reports Generated"
              value={s.reportsGenerated}
              tone="blue"
              delta={{ value: '15.6%', direction: 'up', note: 'vs Last Month' }}
            />
          </KpiStrip>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card title="Examination Trend">
              <TrendChart
                data={seed.applicationTrend}
                xKey="day"
                series={[
                  { key: 'conducted', label: 'Exams Conducted', color: '#1A56A8' },
                  { key: 'planned', label: 'Exams Planned', color: '#1B7A3D' },
                  { key: 'declared', label: 'Results Declared', color: '#6B3FA0' },
                ]}
              />
            </Card>

            <Card title="Candidate Category Distribution">
              <DonutChart data={seed.categoryDistribution} totalLabel="Total" />
            </Card>

            <Card title="Evaluation Progress Overview">
              <BarProgressList items={seed.batchProgress} />
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card title="Exam Status Summary">
              <DonutChart
                data={seed.examStatusDistribution}
                totalLabel="Total"
                valueFormatter={(value) => String(value)}
              />
            </Card>

            <Card title="Top Examinations by Candidates" bodyClassName="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-grey-200 bg-grey-050">
                    {['Examination Name', 'Department', 'Candidates'].map((header) => (
                      <th
                        key={header}
                        className={cn(
                          'px-4 py-2 text-left text-[12px] font-semibold uppercase',
                          header === 'Candidates' && 'text-right',
                        )}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...seed.exams]
                    .sort((a, b) => b.candidates - a.candidates)
                    .slice(0, 5)
                    .map((exam) => (
                      <tr key={exam.id} className="border-b border-grey-200 last:border-b-0">
                        <td className="data-cell">{exam.name}</td>
                        <td className="data-cell text-grey-600">{exam.departmentName}</td>
                        <td className="data-cell text-right">
                          {exam.candidates.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </Card>

            <Card title="Report Generation Summary">
              <ComboChart
                data={seed.reportGenerationTrend}
                xKey="day"
                barKey="generated"
                barLabel="Reports Generated"
                lineKey="downloaded"
                lineLabel="Reports Downloaded"
              />
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card title="Recently Generated Reports" bodyClassName="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-grey-200 bg-grey-050">
                    {['Report Name', 'Report Type', 'Generated By', 'Generated On', 'Format', 'Action'].map(
                      (header) => (
                        <th
                          key={header}
                          className="px-4 py-2 text-left text-[12px] font-semibold uppercase"
                        >
                          {header}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {seed.generatedReports.map((report) => (
                    <tr key={report.name} className="border-b border-grey-200 last:border-b-0">
                      <td className="data-cell">{report.name}</td>
                      <td className="data-cell text-grey-600">{report.type}</td>
                      <td className="data-cell text-grey-600">{report.by}</td>
                      <td className="data-cell text-grey-600">{report.on}</td>
                      <td className="data-cell">
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.5 text-[11px] font-semibold',
                            report.format === 'PDF'
                              ? 'bg-red-050 text-red-600'
                              : 'bg-green-050 text-green-600',
                          )}
                        >
                          {report.format}
                        </span>
                      </td>
                      <td className="data-cell">
                        <Button variant="ghost" size="sm">
                          <Download className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <QuickActions
              actions={[
                { label: 'Generate MIS Report', icon: BarChart3, to: ROUTES.EA_REPORTS, permission: 'report.view', tone: 'blue' },
                { label: 'Custom Report Builder', icon: Settings2, to: ROUTES.EA_REPORTS, permission: 'report.schedule', tone: 'green' },
                { label: 'Data Export', icon: FileDown, to: ROUTES.EA_REPORTS, permission: 'report.export', tone: 'purple' },
                { label: 'Schedule Report', icon: CalendarClock, to: ROUTES.EA_REPORTS, permission: 'report.schedule', tone: 'amber' },
                { label: 'Saved Reports', icon: Database, to: ROUTES.EA_REPORTS, permission: 'report.view', tone: 'navy' },
                { label: 'Request a new report', icon: FileSpreadsheet, to: ROUTES.EA_REPORTS, permission: 'report.request', tone: 'red' },
              ]}
            />
          </div>
        </>
      )}

      {tab !== 'overview' && <ReportCatalogue tab={tab} />}
    </div>
  )
}

/** The Ref. 70–73 report catalogue, grouped by the tab it belongs to. */
const CATALOGUE: Record<Exclude<TabId, 'overview'>, { ref: string; reports: string[] }> = {
  examination: {
    ref: 'Ref. 72',
    reports: [
      'Attendance report',
      'Exam Inspection report',
      'OMR / Answer sheet collection report',
      'Centre-wise utilisation',
      'Session-wise candidate turnout',
      'Malpractice report',
    ],
  },
  evaluation: {
    ref: 'Ref. 72, §2.4.4',
    reports: [
      'Batch progress',
      'Script status breakup',
      'Turnaround time per evaluator',
      'Exceptions log',
      'OMR read-failure rate',
      'Moderation revision rate',
      'Deviation from batch mean',
    ],
  },
  candidate: {
    ref: 'Ref. 71, 73',
    reports: [
      'Location-wise applications',
      'Education qualification profiling',
      'Post-wise applications',
      'Application submission ratio for posts',
      'Time taken for application submission',
      'Withdrawal report',
      'Cancellation report',
      'Age-wise selection',
      'Reservation category-wise selection',
      'Local candidate selection',
    ],
  },
  custom: {
    ref: 'Ref. 65',
    reports: [
      'Build a report from any module with your own columns and filters',
      'Save it for reuse and share it with your office',
      'Schedule recurring delivery by email',
      'Submit a requirement for a new standard report to the Super Admin',
    ],
  },
}

function ReportCatalogue({ tab }: { tab: Exclude<TabId, 'overview'> }) {
  const group = CATALOGUE[tab]

  return (
    <Card
      title={`${tab[0].toUpperCase()}${tab.slice(1)} reports`}
      action={<span className="text-[12px] text-grey-600">{group.ref}</span>}
      bodyClassName="p-0"
    >
      <ul className="divide-y divide-grey-200">
        {group.reports.map((report) => (
          <li key={report} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="min-w-0 flex-1 text-[13px] text-navy-900">{report}</span>
            <div className="flex gap-1">
              <Button variant="secondary" size="sm">
                View
              </Button>
              <Button variant="ghost" size="sm">
                <FileDown className="size-3.5" />
                PDF
              </Button>
              <Button variant="ghost" size="sm">
                <FileSpreadsheet className="size-3.5" />
                Excel
              </Button>
              <Button variant="ghost" size="sm">
                <CalendarClock className="size-3.5" />
                Schedule
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
