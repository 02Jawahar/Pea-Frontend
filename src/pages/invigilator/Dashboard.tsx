import {
  CircleSlash,
  Fingerprint,
  RefreshCcw,
  TriangleAlert,
  UserCheck,
  Users,
  WifiOff,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, ProgressBar } from '@/components/common/primitives'
import { SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import { cn } from '@/utils/cn'

/**
 * Ref. 44 — "login to the officials of each Exam Centre with a dashboard
 * indicating the number of candidates taking test in each Exam Hall."
 *
 * Sync state is a first-class UI element, never a hidden background process
 * (Ref. 47): pending count and last successful sync are always on screen.
 */
export default function InvigilatorDashboard() {
  const { data: halls, isLoading } = useAsync(() => api.halls(), 'halls')
  const { data: attendance } = useAsync(() => api.attendance(), 'attendance')
  const { staff } = useAuth()

  if (isLoading) return <SkeletonCards />

  const list = halls ?? []
  const records = attendance ?? []
  const allocated = list.reduce((sum, hall) => sum + hall.allocated, 0)
  const present = list.reduce((sum, hall) => sum + hall.present, 0)
  const pendingSync = records.filter((record) => record.capturedAt && !record.synced).length
  const exceptions = records.filter(
    (record) => record.verdict === 'Mismatch' || record.method === 'Manually Entered',
  )

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Centre Dashboard</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          {list[0]?.centreName} · {staff?.name} ({staff?.designation})
        </p>
      </div>

      {/* Sync badge — visible, inspectable state. Never silently drop a capture. */}
      <Banner
        tone={pendingSync > 0 ? 'warning' : 'success'}
        icon={pendingSync > 0 ? <WifiOff className="size-4" /> : <RefreshCcw className="size-4" />}
        title={pendingSync > 0 ? `${pendingSync} records pending sync` : 'Synced'}
        action={
          <Button variant="secondary" size="sm">
            <RefreshCcw className="size-3.5" />
            Sync now
          </Button>
        }
      >
        Last successful sync 09:14 AM. Captures taken offline are held locally and transfer
        automatically when connectivity returns — they survive an app kill and a device restart.
      </Banner>

      <KpiStrip>
        <KpiCard icon={<Users className="size-5" />} label="Halls" value={list.length} tone="blue" />
        <KpiCard icon={<UserCheck className="size-5" />} label="Allocated" value={allocated} tone="navy" />
        <KpiCard
          icon={<Fingerprint className="size-5" />}
          label="Present"
          value={present}
          subLabel="of"
          subValue={allocated}
          tone="green"
        />
        <KpiCard
          icon={<CircleSlash className="size-5" />}
          label="Absent"
          value={allocated - present}
          tone="amber"
        />
        <KpiCard
          icon={<TriangleAlert className="size-5" />}
          label="Exceptions"
          value={exceptions.length}
          subLabel="mismatch or manual"
          tone="red"
        />
      </KpiStrip>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card
          title="Hall-wise candidate count"
          action={
            <Link to={ROUTES.IN_ATTENDANCE}>
              <Button size="sm">
                <Fingerprint className="size-3.5" />
                Capture attendance
              </Button>
            </Link>
          }
          bodyClassName="p-0"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey-200 bg-grey-050">
                {['Hall', 'Language', 'Capacity', 'Allocated', 'Present', 'Progress', 'Sync'].map(
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
              {list.map((hall) => {
                const hallPending = records.filter(
                  (record) => record.hallId === hall.id && record.capturedAt && !record.synced,
                ).length
                return (
                  <tr key={hall.id} className="border-b border-grey-200 last:border-b-0">
                    <td className="data-cell font-medium">{hall.name}</td>
                    <td className="data-cell">{hall.language}</td>
                    <td className="data-cell">{hall.capacity}</td>
                    <td className="data-cell">{hall.allocated}</td>
                    <td className="data-cell font-medium text-green-600">{hall.present}</td>
                    <td className="data-cell min-w-32">
                      <ProgressBar
                        value={(hall.present / hall.allocated) * 100}
                        showLabel
                        tone="green"
                      />
                    </td>
                    <td className="data-cell">
                      {hallPending > 0 ? (
                        <span className="text-[12px] text-amber-500">{hallPending} pending</span>
                      ) : (
                        <span className="text-[12px] text-green-600">Synced</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>

        <div className="space-y-4">
          <Card title="Exception queue" bodyClassName="p-0">
            <ul className="divide-y divide-grey-200">
              {exceptions.map((record) => (
                <li key={record.ref} className="flex items-center gap-3 px-4 py-2.5">
                  <span
                    className={cn(
                      'size-2 shrink-0 rounded-full',
                      record.verdict === 'Mismatch' ? 'bg-red-600' : 'bg-amber-500',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-navy-900">
                      {record.candidateName}
                    </p>
                    <p className="font-mono text-[11px] text-grey-600">
                      {record.ref} · {record.hallName} seat {record.seatSeq}
                    </p>
                  </div>
                  <StatusPill status={record.verdict === 'Mismatch' ? 'Mismatch' : 'Manually Entered'} />
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Today's schedule" bodyClassName="p-0">
            <ul className="divide-y divide-grey-200">
              {[
                ['08:30 AM', 'Reporting time', 'Gates open'],
                ['09:00 AM', 'Morning session begins', 'Assistant Grade-II'],
                ['12:00 PM', 'Morning session ends', 'Sheet collection'],
                ['02:00 PM', 'Afternoon session begins', 'Assistant Grade-II'],
              ].map(([time, label, detail]) => (
                <li key={time} className="flex gap-3 px-4 py-2.5">
                  <span className="w-20 shrink-0 text-[12px] font-medium text-navy-900">{time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-navy-900">{label}</p>
                    <p className="text-[12px] text-grey-600">{detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Answer sheet handover">
            <p className="text-[13px] text-grey-600">
              The count of sheets must equal the count present. A variance is the most common
              exam-day integrity issue, so it is flagged prominently before handover is accepted.
            </p>
            <dl className="mt-3 space-y-2">
              <Row label="Candidates present" value={String(present)} />
              <Row label="Sheets collected" value={String(present - 1)} />
              <Row label="Variance" value="1 sheet short" tone="danger" />
            </dl>
            <Button variant="secondary" className="mt-3 w-full">
              Record handover
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'danger' }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[12px] text-grey-600">{label}</dt>
      <dd
        className={cn(
          'text-[13px] font-medium',
          tone === 'danger' ? 'text-red-600' : 'text-navy-900',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
