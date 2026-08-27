import {
  BarChart3,
  CalendarClock,
  Download,
  FileSpreadsheet,
  Filter,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { DonutChart, TrendChart } from '@/components/charts'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { Button, Card, Input, Select, Tabs } from '@/components/common/primitives'
import { seed } from '@/mock/api'
import { cn } from '@/utils/cn'

type TabId = 'requisition' | 'application' | 'selection'

/** Ref. 70–73 — the department report catalogue, each with table, chart and export. */
const CATALOGUE: Record<TabId, { ref: string; reports: string[] }> = {
  requisition: {
    ref: 'Ref. 70',
    reports: [
      'Department-wise requisitions',
      'Post-wise requisitions',
      'Recruitment duration',
      'Processing time per workflow stage',
      'Region and question paper language opted by candidates',
      'Exam centre-wise pass percentage',
    ],
  },
  application: {
    ref: 'Ref. 71',
    reports: [
      'Location-wise applications',
      'Education qualification profiling',
      'Post-wise applications',
      'Application submission ratio for posts',
      'Time taken for application submission',
      'Withdrawal report',
      'Cancellation report',
    ],
  },
  selection: {
    ref: 'Ref. 73',
    reports: [
      'Location-wise selection',
      'Education qualification-wise selection',
      'Age-wise selection',
      'Post-wise selection',
      'Department-wise selection',
      'Region-wise selection',
      'Reservation category-wise selection',
      'Local candidate selection',
    ],
  },
}

const PROCESSING_TIME = [
  ['Initiation → verification', 3.2, 5],
  ['Verification → approval', 4.8, 7],
  ['Approval → Finance concurrence', 6.1, 7],
  ['Finance → PEA acceptance', 2.4, 5],
  ['PEA acceptance → notification', 9.7, 14],
]

const LOCATION_SPLIT = [
  { name: 'Puducherry', value: 7420, pct: 59.6 },
  { name: 'Karaikal', value: 2810, pct: 22.6 },
  { name: 'Mahe', value: 1180, pct: 9.5 },
  { name: 'Yanam', value: 1048, pct: 8.4 },
]

const QUALIFICATION_SPLIT = [
  { name: 'Graduate', value: 6890, pct: 55.3 },
  { name: 'Post Graduate', value: 3120, pct: 25.0 },
  { name: 'Diploma', value: 1580, pct: 12.7 },
  { name: 'Class XII', value: 868, pct: 7.0 },
]

export default function DepartmentReports() {
  const [tab, setTab] = useState<TabId>('requisition')
  const group = CATALOGUE[tab]

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Department Reports</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Every report has an on-screen table and chart, exports to PDF and Excel, and can be
            scheduled for recurring delivery.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input type="date" defaultValue="2024-04-01" className="w-auto" aria-label="From date" />
          <span className="text-grey-600">→</span>
          <Input type="date" defaultValue="2024-05-20" className="w-auto" aria-label="To date" />
          <Select className="w-auto" aria-label="Post" defaultValue="All posts">
            <option>All posts</option>
            {seed.posts.map((post) => (
              <option key={post.id}>{post.name}</option>
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
          icon={<BarChart3 className="size-5" />}
          label="Requisitions raised"
          value={seed.requisitions.length}
          subLabel="this recruitment year"
          tone="blue"
        />
        <KpiCard
          icon={<Users className="size-5" />}
          label="Applications received"
          value={seed.stats.totalApplications}
          tone="green"
        />
        <KpiCard
          icon={<BarChart3 className="size-5" />}
          label="Withdrawals"
          value={412}
          subLabel="3.3% of applications"
          tone="amber"
        />
        <KpiCard
          icon={<BarChart3 className="size-5" />}
          label="Cancellations"
          value={188}
          subLabel="1.5% of applications"
          tone="red"
        />
        <KpiCard
          icon={<CalendarClock className="size-5" />}
          label="Avg. recruitment duration"
          value="147 days"
          subLabel="notification to appointment"
          tone="purple"
        />
      </KpiStrip>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'requisition', label: 'Requisition reports', count: CATALOGUE.requisition.reports.length },
          { id: 'application', label: 'Application reports', count: CATALOGUE.application.reports.length },
          { id: 'selection', label: 'Selection reports', count: CATALOGUE.selection.reports.length },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Application receipt trend" className="xl:col-span-2">
          <TrendChart
            data={seed.applicationTrend}
            xKey="day"
            series={[{ key: 'applications', label: 'Applications', color: '#1A56A8' }]}
            height={200}
          />
        </Card>

        <Card title={tab === 'selection' ? 'Selection by category' : 'Applications by location'}>
          <DonutChart
            data={tab === 'selection' ? seed.meritCategoryDistribution : LOCATION_SPLIT}
            totalLabel="Total"
          />
        </Card>
      </div>

      <div className="grid flex-1 items-start gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card
          title={`${tab[0].toUpperCase()}${tab.slice(1)} report catalogue`}
          action={<span className="text-[12px] text-grey-600">{group.ref}</span>}
          bodyClassName="p-0"
          className="flex-1"
        >
          <ul className="divide-y divide-grey-200">
            {group.reports.map((report) => (
              <li key={report} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                <span className="min-w-0 flex-1 text-[13px] text-navy-900">{report}</span>
                <div className="flex shrink-0 gap-1">
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                  <Button variant="ghost" size="sm" aria-label={`${report} as PDF`}>
                    <Download className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" aria-label={`${report} as Excel`}>
                    <FileSpreadsheet className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" aria-label={`Schedule ${report}`}>
                    <CalendarClock className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-4">
          {tab === 'requisition' && (
            <Card title="Processing time per stage" bodyClassName="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-grey-200 bg-grey-050">
                    {['Stage', 'Average', 'Threshold'].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-2 text-left text-[12px] font-semibold uppercase"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PROCESSING_TIME.map(([stage, average, threshold]) => (
                    <tr key={String(stage)} className="border-b border-grey-200 last:border-b-0">
                      <td className="data-cell">{stage}</td>
                      <td className="data-cell text-right">
                        <span
                          className={cn(
                            'font-mono font-medium',
                            Number(average) > Number(threshold) ? 'text-red-600' : 'text-green-600',
                          )}
                        >
                          {Number(average).toFixed(1)} d
                        </span>
                      </td>
                      <td className="data-cell text-right font-mono text-grey-600">
                        {threshold} d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {tab === 'application' && (
            <Card title="Education qualification profiling">
              <DonutChart data={QUALIFICATION_SPLIT} totalLabel="Applicants" />
            </Card>
          )}

          {tab === 'selection' && (
            <Card title="Local candidate selection" bodyClassName="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-grey-200 bg-grey-050">
                    {['Region', 'Selected', 'Local', 'Share'].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-2 text-left text-[12px] font-semibold uppercase"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Puducherry', 74, 68],
                    ['Karaikal', 28, 26],
                    ['Mahe', 12, 10],
                    ['Yanam', 11, 9],
                  ].map(([region, selected, local]) => (
                    <tr key={String(region)} className="border-b border-grey-200 last:border-b-0">
                      <td className="data-cell font-medium">{region}</td>
                      <td className="data-cell text-right font-mono">{selected}</td>
                      <td className="data-cell text-right font-mono">{local}</td>
                      <td className="data-cell text-right font-mono text-grey-600">
                        {((Number(local) / Number(selected)) * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          <Card title="Scheduled deliveries" bodyClassName="p-0">
            <ul className="divide-y divide-grey-200">
              {[
                ['Weekly application summary', 'Every Monday 08:00', 'Excel'],
                ['Monthly requisition status', '1st of the month 09:00', 'PDF'],
                ['Selection report on publication', 'On event', 'PDF'],
              ].map(([name, when, format]) => (
                <li key={String(name)} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="clamp-1 text-[13px] font-medium text-navy-900">{name}</p>
                    <p className="text-[12px] text-grey-600">{when}</p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold',
                      format === 'PDF' ? 'bg-red-050 text-red-600' : 'bg-green-050 text-green-600',
                    )}
                  >
                    {format}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
