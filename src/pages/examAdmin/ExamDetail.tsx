import { ArrowLeft, Building2, CalendarDays, Grid3x3, IdCard, Monitor, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { DonutChart } from '@/components/charts'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Card, ProgressBar } from '@/components/common/primitives'
import { EmptyState, SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { api, seed } from '@/mock/api'
import { QuickActions, SummaryPanel } from './widgets'

export default function ExamDetail() {
  const { id = '' } = useParams()
  const { data, isLoading } = useAsync(() => api.exam(id), id)

  if (isLoading) return <SkeletonCards />
  if (!data) {
    return (
      <Card>
        <EmptyState title="Examination not found" description="Check the link and try again." />
      </Card>
    )
  }

  const centres = seed.centres.slice(0, data.centres > 12 ? 12 : data.centres)
  const allocated = centres.reduce((sum, centre) => sum + centre.allocated, 0)

  return (
    <div className="page">
      <Link
        to={ROUTES.EA_EXAMS}
        className="inline-flex items-center gap-1.5 text-[13px] text-navy-700 hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Manage Examinations
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[12px] text-grey-600">{data.examCode}</p>
          <h1 className="page-title">{data.name}</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {data.departmentName} · {data.examDate} · {data.mode} mode ·{' '}
            {data.durationMinutes} minutes · {data.totalMarks} marks
          </p>
        </div>
        <StatusPill status={data.status} size="md" />
      </div>

      <KpiStrip>
        <KpiCard icon={<Users className="size-5" />} label="Candidates" value={data.candidates} tone="blue" />
        <KpiCard icon={<Building2 className="size-5" />} label="Centres" value={data.centres} tone="green" />
        <KpiCard
          icon={<Grid3x3 className="size-5" />}
          label="Halls allocated"
          value={seed.halls.length * data.centres}
          tone="purple"
        />
        <KpiCard
          icon={<IdCard className="size-5" />}
          label="Admit cards released"
          value={Math.round(data.candidates * 0.97)}
          subLabel={`${((0.97) * 100).toFixed(0)}% of candidates`}
          tone="amber"
        />
        <KpiCard
          icon={<CalendarDays className="size-5" />}
          label="Sessions"
          value={data.sessions.length}
          subLabel={data.languages.join(' · ')}
          tone="navy"
        />
      </KpiStrip>

      <div className="grid flex-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="flex flex-col gap-4">
          <Card title="Sessions & shifts" bodyClassName="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  {['Session', 'Window', 'Centres', 'Candidates', 'Status'].map((header) => (
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
                {data.sessions.map((session) => (
                  <tr key={session.id} className="border-b border-grey-200 last:border-b-0">
                    <td className="data-cell font-medium">{session.label}</td>
                    <td className="data-cell">
                      {session.startTime} – {session.endTime}
                    </td>
                    <td className="data-cell text-right">{session.centres}</td>
                    <td className="data-cell text-right">
                      {session.candidates.toLocaleString('en-IN')}
                    </td>
                    <td className="data-cell">
                      <StatusPill status={session.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="Centre allocation" bodyClassName="p-0" className="flex-1">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-grey-200 bg-grey-050">
                    {['Centre', 'District', 'Rooms', 'Capacity', 'Allocated', 'Utilisation'].map(
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
                  {centres.map((centre) => (
                    <tr key={centre.id} className="border-b border-grey-200 last:border-b-0">
                      <td className="data-cell">
                        <p className="clamp-1 font-medium">{centre.name}</p>
                        <p className="font-mono text-[11px] text-grey-600">{centre.centreCode}</p>
                      </td>
                      <td className="data-cell">{centre.district}</td>
                      <td className="data-cell text-right">{centre.rooms}</td>
                      <td className="data-cell text-right">{centre.capacity}</td>
                      <td className="data-cell text-right font-medium">{centre.allocated}</td>
                      <td className="data-cell min-w-32">
                        <ProgressBar
                          value={(centre.allocated / centre.capacity) * 100}
                          showLabel
                          tone={centre.allocated / centre.capacity > 0.92 ? 'amber' : 'blue'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <SummaryPanel
            title="Examination"
            rows={[
              { label: 'Exam code', value: data.examCode },
              { label: 'Department', value: data.departmentName },
              { label: 'Exam date', value: data.examDate },
              { label: 'Mode', value: data.mode },
              { label: 'Duration', value: `${data.durationMinutes} minutes` },
              { label: 'Total marks', value: data.totalMarks },
              { label: 'Languages', value: data.languages.join(', ') },
              { label: 'Seats allocated', value: allocated.toLocaleString('en-IN') },
            ]}
          />

          <Card title="Paper languages">
            <DonutChart
              data={data.languages.map((language, index) => {
                const share = [46, 31, 14, 9][index] ?? 0
                return {
                  name: language,
                  value: Math.round((data.candidates * share) / 100),
                  pct: share,
                }
              })}
              totalLabel="Candidates"
            />
          </Card>

          <QuickActions
            actions={[
              { label: 'Hall & seating', icon: Grid3x3, to: ROUTES.EA_SEATING, permission: 'seating.view', tone: 'blue' },
              { label: 'Centres', icon: Building2, to: ROUTES.EA_CENTRES, permission: 'centre.view', tone: 'green' },
              { label: 'Invigilators', icon: Users, to: ROUTES.EA_FUNCTIONARIES, permission: 'functionary.view', tone: 'purple' },
              { label: 'Admit cards', icon: IdCard, to: ROUTES.EA_ADMIT_CARDS, permission: 'admitcard.view', tone: 'amber' },
              { label: 'Live monitoring', icon: Monitor, to: ROUTES.EA_LIVE, permission: 'monitoring.view', tone: 'red' },
              { label: 'Attendance', icon: CalendarDays, to: ROUTES.EA_ATTENDANCE, permission: 'attendance.view', tone: 'navy' },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
