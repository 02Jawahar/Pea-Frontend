import { Download, Fingerprint, Keyboard } from 'lucide-react'
import { useState } from 'react'

import { DataTable, type Column } from '@/components/common/DataTable'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Select } from '@/components/common/primitives'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/mock/api'
import type { AttendanceRecord } from '@/types'
import { cn } from '@/utils/cn'

/** Ref. 47, 48 — the attendance sheet, with manual entries visibly distinguished. */
export default function ExamAdminAttendance() {
  const { data, isLoading } = useAsync(() => api.attendance(), 'attendance')
  const [hall, setHall] = useState('')

  const rows = (data ?? []).filter((record) => !hall || record.hallName === hall)
  const halls = [...new Set((data ?? []).map((record) => record.hallName))]

  const present = rows.filter((record) => record.verdict !== 'Absent').length
  const manual = rows.filter((record) => record.method === 'Manually Entered').length
  const mismatch = rows.filter((record) => record.verdict === 'Mismatch').length

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'roll',
      header: 'Roll No.',
      accessor: (row) => row.rollNo,
      sortable: true,
      render: (row) => <span className="font-mono text-[12px]">{row.rollNo}</span>,
    },
    { key: 'name', header: 'Candidate', accessor: (row) => row.candidateName, sortable: true },
    {
      key: 'ref',
      header: 'Application reference',
      accessor: (row) => row.ref,
      render: (row) => <span className="font-mono text-[12px]">{row.ref}</span>,
    },
    { key: 'hall', header: 'Hall', accessor: (row) => row.hallName, sortable: true },
    {
      key: 'seat',
      header: 'Seat',
      accessor: (row) => row.seatSeq,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    { key: 'time', header: 'Captured at', render: (row) => row.capturedAt ?? '—' },
    {
      key: 'method',
      header: 'Method',
      render: (row) =>
        row.method === 'Manually Entered' ? (
          <StatusPill status="Manually Entered" />
        ) : row.method ? (
          <span className="text-[12px] text-grey-600">Biometric</span>
        ) : (
          <span className="text-[12px] text-grey-600">—</span>
        ),
    },
    {
      key: 'verdict',
      header: 'Verdict',
      render: (row) => (
        <span
          className={cn(
            'text-[13px] font-medium',
            row.verdict === 'Verified'
              ? 'text-green-600'
              : row.verdict === 'Mismatch'
                ? 'text-red-600'
                : 'text-grey-600',
          )}
        >
          {row.verdict}
        </span>
      ),
    },
    {
      key: 'sync',
      header: 'Sync',
      render: (row) =>
        !row.capturedAt ? (
          <span className="text-[12px] text-grey-600">—</span>
        ) : row.synced ? (
          <span className="text-[12px] text-green-600">Synced</span>
        ) : (
          <span className="text-[12px] text-amber-500">Pending</span>
        ),
    },
  ]

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Attendance Sheet</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Assistant Grade-II Examination 2024 · Morning Session · Puducherry — Centre 01
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            aria-label="Hall"
            className="w-auto"
            value={hall}
            onChange={(event) => setHall(event.target.value)}
          >
            <option value="">All halls</option>
            {halls.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
          <Button variant="secondary">
            <Download className="size-4" />
            Download sheet
          </Button>
        </div>
      </div>

      <KpiStrip>
        <KpiCard icon={<Fingerprint className="size-5" />} label="Records" value={rows.length} tone="navy" />
        <KpiCard icon={<Fingerprint className="size-5" />} label="Present" value={present} tone="green" />
        <KpiCard
          icon={<Fingerprint className="size-5" />}
          label="Absent"
          value={rows.length - present}
          tone="amber"
        />
        <KpiCard icon={<Keyboard className="size-5" />} label="Manually entered" value={manual} tone="purple" />
        <KpiCard icon={<Fingerprint className="size-5" />} label="Mismatch" value={mismatch} tone="red" />
      </KpiStrip>

      {manual > 0 && (
        <Banner tone="info" icon={<Keyboard className="size-4" />} title="Manual entries are flagged">
          {manual} record{manual === 1 ? ' was' : 's were'} entered against the paper seat list rather
          than captured biometrically. The audit trail keeps them distinguishable (Ref. 48).
        </Banner>
      )}

      <Card className="flex-1">
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(row) => row.ref}
          isLoading={isLoading}
          searchPlaceholder="Search by roll number, name or reference"
          searchFields={(row) => `${row.rollNo} ${row.candidateName} ${row.ref}`}
          filters={[
            {
              key: 'verdict',
              label: 'Verdict',
              options: ['Verified', 'Mismatch', 'Absent'],
              match: (row, value) => row.verdict === value,
            },
            {
              key: 'method',
              label: 'Method',
              options: ['Biometric', 'Manually Entered'],
              match: (row, value) => row.method === value,
            },
          ]}
          pageSize={12}
          emptyTitle="No attendance records"
          emptyDescription="Records appear as invigilators capture candidates at the hall door."
        />
      </Card>
    </div>
  )
}
