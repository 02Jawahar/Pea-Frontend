import { Activity, CircleAlert, Fingerprint, RefreshCcw, Users, WifiOff } from 'lucide-react'
import { useState } from 'react'

import { DonutChart } from '@/components/charts'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, ProgressBar, Select } from '@/components/common/primitives'
import { SkeletonCards } from '@/components/common/states'
import { useAsync } from '@/hooks/useAsync'
import { api, seed } from '@/mock/api'
import { cn } from '@/utils/cn'

/**
 * Ref. 47, 48 — live monitoring during an exam window.
 *
 * Centre-wise attendance updates in real time, sync status is shown per centre
 * (which matters because captures may be taken offline), and exceptions land in
 * a queue rather than disappearing.
 */
export default function LiveMonitoring() {
  const { data: centres, isLoading } = useAsync(() => api.centres(), 'centres')
  const { data: attendance } = useAsync(() => api.attendance(), 'attendance')
  const [examId, setExamId] = useState('exm-1')

  if (isLoading) return <SkeletonCards />

  const list = (centres ?? []).filter((centre) => centre.status === 'Active')
  const records = attendance ?? []

  const allocated = list.reduce((sum, centre) => sum + centre.allocated, 0)
  const present = Math.round(allocated * 0.94)
  const unsynced = list.filter((_, index) => index % 5 === 3)
  const exceptions = records.filter(
    (record) => record.verdict === 'Mismatch' || record.method === 'Manually Entered',
  )

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Live Monitoring</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-grey-600">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-600 opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-green-600" />
            </span>
            Morning session in progress · updated {seed.DEMO_NOW}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            aria-label="Examination"
            className="w-auto"
            value={examId}
            onChange={(event) => setExamId(event.target.value)}
          >
            {seed.exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </Select>
          <Button variant="secondary">
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>
      </div>

      <KpiStrip>
        <KpiCard icon={<Users className="size-5" />} label="Allocated" value={allocated} tone="navy" />
        <KpiCard
          icon={<Fingerprint className="size-5" />}
          label="Present"
          value={present}
          subLabel={`${((present / allocated) * 100).toFixed(1)}% turnout`}
          tone="green"
        />
        <KpiCard
          icon={<CircleAlert className="size-5" />}
          label="Absent"
          value={allocated - present}
          tone="amber"
        />
        <KpiCard
          icon={<WifiOff className="size-5" />}
          label="Centres pending sync"
          value={unsynced.length}
          subLabel={`of ${list.length} active`}
          tone="red"
        />
        <KpiCard
          icon={<Activity className="size-5" />}
          label="Exceptions"
          value={exceptions.length}
          subLabel="mismatch or manual"
          tone="purple"
        />
      </KpiStrip>

      {unsynced.length > 0 && (
        <Banner
          tone="warning"
          icon={<WifiOff className="size-4" />}
          title={`${unsynced.length} centre${unsynced.length === 1 ? '' : 's'} have captures waiting to sync`}
        >
          {unsynced.map((centre) => centre.name.split(' — ')[0]).join(' · ')} — devices are holding
          records locally and will push them automatically when connectivity returns. No capture is
          lost.
        </Banner>
      )}

      <div className="grid flex-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Card title="Centre-wise attendance" bodyClassName="p-0" className="flex flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-grey-200 bg-grey-050">
                  {['Centre', 'District', 'Allocated', 'Present', 'Turnout', 'Sync'].map((header) => (
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
                {list.map((centre, index) => {
                  const centrePresent = Math.round(centre.allocated * (0.88 + (index % 7) * 0.018))
                  const pending = index % 5 === 3
                  return (
                    <tr key={centre.id} className="border-b border-grey-200 last:border-b-0">
                      <td className="data-cell">
                        <p className="clamp-1 font-medium">{centre.name}</p>
                        <p className="font-mono text-[11px] text-grey-600">{centre.centreCode}</p>
                      </td>
                      <td className="data-cell">{centre.district}</td>
                      <td className="data-cell text-right">{centre.allocated}</td>
                      <td className="data-cell text-right font-medium text-green-600">
                        {centrePresent}
                      </td>
                      <td className="data-cell min-w-32">
                        <ProgressBar
                          value={(centrePresent / centre.allocated) * 100}
                          showLabel
                          tone="green"
                        />
                      </td>
                      <td className="data-cell">
                        {pending ? (
                          <StatusPill status="Pending" />
                        ) : (
                          <span className="text-[12px] text-green-600">Synced</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="Turnout">
            <DonutChart
              data={[
                { name: 'Present', value: present, pct: Number(((present / allocated) * 100).toFixed(1)) },
                {
                  name: 'Absent',
                  value: allocated - present,
                  pct: Number((((allocated - present) / allocated) * 100).toFixed(1)),
                },
              ]}
              totalLabel="Allocated"
            />
          </Card>

          <Card title="Exception queue" bodyClassName="p-0" className="flex-1">
            <ul className="divide-y divide-grey-200">
              {exceptions.slice(0, 8).map((record) => (
                <li key={record.ref} className="flex items-center gap-3 px-4 py-2.5">
                  <span
                    className={cn(
                      'size-2 shrink-0 rounded-full',
                      record.verdict === 'Mismatch' ? 'bg-red-600' : 'bg-amber-500',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="clamp-1 text-[13px] font-medium text-navy-900">
                      {record.candidateName}
                    </p>
                    <p className="clamp-1 font-mono text-[11px] text-grey-600">
                      {record.ref} · {record.hallName}
                    </p>
                  </div>
                  <StatusPill
                    status={record.verdict === 'Mismatch' ? 'Mismatch' : 'Manually Entered'}
                  />
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Incident feed" bodyClassName="p-0" scrollBody>
            <ul className="divide-y divide-grey-200">
              {[
                ['09:41', 'Tab switch detected', 'Hall 3 · seat 14', 'warning'],
                ['09:36', 'Face absent for 40s', 'Hall 1 · seat 07', 'warning'],
                ['09:22', 'QR mismatch referred to supervisor', 'Karaikal — Centre 02', 'danger'],
                ['09:14', 'Hall 5 readiness confirmed', 'Puducherry — Centre 01', 'info'],
                ['09:02', 'Morning session opened at 12 centres', 'All centres', 'info'],
              ].map(([time, text, where, tone]) => (
                <li key={String(time)} className="flex gap-3 px-4 py-2.5">
                  <span className="w-12 shrink-0 text-[12px] text-grey-600">{time}</span>
                  <span
                    className={cn(
                      'mt-1.5 size-2 shrink-0 rounded-full',
                      { info: 'bg-blue-500', warning: 'bg-amber-500', danger: 'bg-red-600' }[
                        String(tone)
                      ],
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-navy-900">{text}</p>
                    <p className="clamp-1 text-[12px] text-grey-600">{where}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
