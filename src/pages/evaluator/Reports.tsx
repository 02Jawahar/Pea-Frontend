import { BarChart3, CalendarClock, Download, FileSpreadsheet, Timer, Users } from 'lucide-react'
import { useState } from 'react'

import { BarProgressList, DonutChart, TrendChart } from '@/components/charts'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { Button, Card, Tabs } from '@/components/common/primitives'
import { seed } from '@/mock/api'
import { cn } from '@/utils/cn'

type TabId = 'evaluation' | 'performance'

const TURNAROUND = [
  { day: '14-May', scripts: 1820, minutes: 7.2 },
  { day: '15-May', scripts: 2410, minutes: 6.8 },
  { day: '16-May', scripts: 3180, minutes: 6.4 },
  { day: '17-May', scripts: 4020, minutes: 6.1 },
  { day: '18-May', scripts: 3640, minutes: 6.3 },
  { day: '19-May', scripts: 3120, minutes: 6.6 },
  { day: '20-May', scripts: 2890, minutes: 6.5 },
]

const EXCEPTIONS = [
  ['Non-readable OMR', 37, 'Image-reading tool', 33],
  ['Roll number unreadable', 6, 'Two-person verification', 6],
  ['Unmatched import row', 12, 'Manual mapping', 12],
  ['Duplicate script scanned', 3, 'Supervisor review', 2],
]

const PERFORMANCE = [
  ['Evaluator 01', 130, 67.48, 0.0, 4, 6.2],
  ['Evaluator 07', 118, 71.02, 3.54, 11, 5.4],
  ['Evaluator 12', 96, 58.31, -9.17, 18, 8.9],
  ['Evaluator 19', 142, 66.9, -0.58, 3, 5.1],
  ['Evaluator 22', 108, 69.44, 1.96, 7, 6.8],
  ['Evaluator 30', 121, 68.12, 0.64, 5, 6.0],
]

export default function EvaluationReports() {
  const [tab, setTab] = useState<TabId>('evaluation')

  const readFailureRate = (37 / seed.stats.totalScripts) * 100

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Evaluation Reports</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Assistant Grade-II Examination 2024 · General Studies Paper I
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Download className="size-4" />
            Export PDF
          </Button>
          <Button variant="secondary">
            <FileSpreadsheet className="size-4" />
            Export Excel
          </Button>
          <Button variant="secondary">
            <CalendarClock className="size-4" />
            Schedule
          </Button>
        </div>
      </div>

      <KpiStrip>
        <KpiCard
          icon={<BarChart3 className="size-5" />}
          label="Scripts evaluated"
          value={seed.stats.scriptsEvaluated}
          subLabel={`of ${seed.stats.totalScripts.toLocaleString('en-IN')}`}
          tone="purple"
        />
        <KpiCard
          icon={<BarChart3 className="size-5" />}
          label="Progress"
          value={`${seed.stats.evaluationProgressPct}%`}
          tone="green"
        />
        <KpiCard icon={<Timer className="size-5" />} label="Average per script" value="6.5 min" tone="blue" />
        <KpiCard
          icon={<BarChart3 className="size-5" />}
          label="OMR read-failure rate"
          value={`${readFailureRate.toFixed(3)}%`}
          subLabel="37 sheets"
          tone="amber"
        />
        <KpiCard icon={<Users className="size-5" />} label="Active evaluators" value={128} tone="navy" />
      </KpiStrip>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'evaluation', label: 'Evaluation reports' },
          { id: 'performance', label: 'Performance reports', count: PERFORMANCE.length },
        ]}
      />

      {tab === 'evaluation' ? (
        <div className="grid flex-1 items-start gap-4 xl:grid-cols-3">
          <Card title="Batch progress">
            <BarProgressList items={seed.batchProgress} />
          </Card>

          <Card title="Script status breakup">
            <DonutChart data={seed.evaluationStatusBreakup} totalLabel="Scripts" />
          </Card>

          <Card title="Turnaround time">
            <TrendChart
              data={TURNAROUND}
              xKey="day"
              series={[{ key: 'minutes', label: 'Minutes per script', color: '#6B3FA0' }]}
              height={190}
            />
          </Card>

          <Card title="Scripts evaluated per day" className="xl:col-span-2">
            <TrendChart
              data={TURNAROUND}
              xKey="day"
              series={[{ key: 'scripts', label: 'Scripts evaluated', color: '#1B7A3D' }]}
              height={210}
            />
          </Card>

          <Card title="Exceptions log" bodyClassName="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  {['Exception', 'Raised', 'Route', 'Resolved'].map((header) => (
                    <th key={header} className="px-4 py-2 text-left text-[12px] font-semibold uppercase">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EXCEPTIONS.map((row) => (
                  <tr key={String(row[0])} className="border-b border-grey-200 last:border-b-0">
                    <td className="data-cell font-medium">{row[0]}</td>
                    <td className="data-cell text-right font-mono">{row[1]}</td>
                    <td className="data-cell text-grey-600">{row[2]}</td>
                    <td className="data-cell text-right">
                      <span
                        className={cn(
                          'font-mono font-medium',
                          row[3] === row[1] ? 'text-green-600' : 'text-amber-500',
                        )}
                      >
                        {row[3]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      ) : (
        <Card title="Per-evaluator performance" bodyClassName="p-0" className="flex-1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey-200 bg-grey-050">
                {['Evaluator', 'Scripts completed', 'Average marks awarded', 'Deviation from batch mean', 'Moderation revision rate', 'Minutes per script'].map(
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
              {PERFORMANCE.map((row) => (
                <tr key={String(row[0])} className="border-b border-grey-200 last:border-b-0">
                  <td className="data-cell font-medium">{row[0]}</td>
                  <td className="data-cell text-right font-mono">{row[1]}</td>
                  <td className="data-cell text-right font-mono">{Number(row[2]).toFixed(2)}</td>
                  <td className="data-cell text-right">
                    <span
                      className={cn(
                        'font-mono font-medium',
                        Math.abs(Number(row[3])) > 5
                          ? 'text-red-600'
                          : Math.abs(Number(row[3])) > 2
                            ? 'text-amber-500'
                            : 'text-grey-700',
                      )}
                    >
                      {Number(row[3]) > 0 ? '+' : ''}
                      {Number(row[3]).toFixed(2)}
                    </span>
                  </td>
                  <td className="data-cell text-right font-mono">
                    {((Number(row[4]) / Number(row[1])) * 100).toFixed(1)}%
                  </td>
                  <td className="data-cell text-right font-mono">{Number(row[5]).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
