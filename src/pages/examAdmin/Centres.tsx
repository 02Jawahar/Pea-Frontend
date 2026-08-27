import { Accessibility, Lock, Map, MapPin, Plus, Table2 } from 'lucide-react'
import { useState } from 'react'

import { AuditTrailPanel } from '@/components/common/AuditTrailPanel'
import { DataTable, type Column } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Field, Input, ProgressBar, Select } from '@/components/common/primitives'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import type { Centre } from '@/types'
import { cn } from '@/utils/cn'

/**
 * Ref. 38–43 — exam centre master, mapping and allocation.
 *
 * The legacy reference field is mandatory, not optional: every new centre code
 * is mapped to the already-existing exam centre reference number so the data
 * migration reconciles (Ref. 38). Ref. 43 blocks a centre change inside 5 days
 * of the exam — the control is disabled with the reason visible, never hidden.
 */
export default function ExamCentres({ readOnly = false }: { readOnly?: boolean }) {
  const { data, isLoading } = useAsync(() => api.centres(), 'centres')
  const { can } = useAuth()
  const [view, setView] = useState<'table' | 'map'>('table')
  const [detail, setDetail] = useState<Centre | null>(null)
  const [allocating, setAllocating] = useState(false)

  const examDate = new Date('2024-05-25').getTime()
  const today = new Date(seed.DEMO_TODAY).getTime()
  const daysToExam = Math.round((examDate - today) / 86_400_000)
  const changeLocked = daysToExam < 5

  const columns: Column<Centre>[] = [
    {
      key: 'code',
      header: 'Centre Code',
      accessor: (row) => row.centreCode,
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-mono text-[12px] font-medium text-navy-700">{row.centreCode}</p>
          <p className="font-mono text-[11px] text-grey-600">legacy {row.legacyRef}</p>
        </div>
      ),
    },
    { key: 'name', header: 'Centre Name', accessor: (row) => row.name, sortable: true },
    { key: 'district', header: 'District', accessor: (row) => row.district, sortable: true },
    { key: 'contact', header: 'Contact', render: (row) => (
      <div className="text-[12px] text-grey-600">
        <p>{row.contact}</p>
        <p className="truncate">{row.email}</p>
      </div>
    ) },
    {
      key: 'rooms',
      header: 'Rooms',
      accessor: (row) => row.rooms,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'utilisation',
      header: 'Capacity / Allocated',
      className: 'min-w-40',
      render: (row) => (
        <div>
          <ProgressBar value={(row.allocated / row.capacity) * 100} showLabel tone="blue" />
          <p className="mt-0.5 text-[11px] text-grey-600">
            {row.allocated} of {row.capacity}
          </p>
        </div>
      ),
    },
    {
      key: 'accessible',
      header: 'Accessibility',
      render: (row) =>
        row.accessible ? (
          <span className="inline-flex items-center gap-1 text-[12px] text-green-600">
            <Accessibility className="size-3.5" />
            Accessible
          </span>
        ) : (
          <span className="text-[12px] text-grey-600">Not accessible</span>
        ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
    {
      key: 'action',
      header: '',
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => setDetail(row)}>
          Details
        </Button>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">{readOnly ? 'Eligible Exam Centres' : 'Exam Centres'}</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {readOnly
              ? 'Centres mapped to your department, read-only (Ref. 40).'
              : 'Centre master, department mapping and per-exam allocation.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-grey-300">
            <button
              type="button"
              onClick={() => setView('table')}
              aria-pressed={view === 'table'}
              className={cn(
                'flex items-center gap-1.5 rounded-l-md px-2.5 py-1.5 text-[13px]',
                view === 'table' ? 'bg-navy-700 text-white' : 'text-grey-700',
              )}
            >
              <Table2 className="size-3.5" />
              Table
            </button>
            <button
              type="button"
              onClick={() => setView('map')}
              aria-pressed={view === 'map'}
              className={cn(
                'flex items-center gap-1.5 rounded-r-md px-2.5 py-1.5 text-[13px]',
                view === 'map' ? 'bg-navy-700 text-white' : 'text-grey-700',
              )}
            >
              <Map className="size-3.5" />
              Map
            </button>
          </div>

          {!readOnly && can('centre.allocate') && (
            <Button variant="secondary" onClick={() => setAllocating(true)}>
              Allocate for an exam
            </Button>
          )}
          {!readOnly && can('centre.edit') && (
            <Button>
              <Plus className="size-4" />
              Add Centre
            </Button>
          )}
        </div>
      </div>

      {changeLocked && !readOnly && (
        <Banner tone="warning" icon={<Lock className="size-4" />} title="Centre changes are locked">
          Assistant Grade-II Examination 2024 is {daysToExam} day{daysToExam === 1 ? '' : 's'} away.
          Ref. 43 blocks a centre change inside 5 days of the exam — the control stays visible and
          disabled so the reason is clear.
        </Banner>
      )}

      {view === 'table' ? (
        <Card>
          <DataTable
            rows={data ?? []}
            columns={columns}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            searchPlaceholder="Search by centre name, code or legacy reference"
            searchFields={(row) => `${row.name} ${row.centreCode} ${row.legacyRef} ${row.district}`}
            filters={[
              {
                key: 'district',
                label: 'District',
                options: [...new Set((data ?? []).map((row) => row.district))],
                match: (row, value) => row.district === value,
              },
              {
                key: 'accessible',
                label: 'Accessibility',
                options: ['Accessible', 'Not accessible'],
                match: (row, value) => (value === 'Accessible' ? row.accessible : !row.accessible),
              },
            ]}
            emptyTitle="No centres match these filters"
            emptyDescription="Clear the district or accessibility filter."
          />
        </Card>
      ) : (
        <Card title="Centre locations">
          <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-grey-200 bg-blue-050">
            {(data ?? []).map((centre) => (
              <button
                key={centre.id}
                type="button"
                onClick={() => setDetail(centre)}
                aria-label={centre.name}
                className="absolute -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${((centre.lng - 79.79) / 0.3) * 90 + 5}%`,
                  top: `${((12.21 - centre.lat) / 0.3) * 90 + 5}%`,
                }}
              >
                <MapPin
                  className={cn(
                    'size-6 drop-shadow',
                    centre.status === 'Active' ? 'text-navy-700' : 'text-amber-500',
                  )}
                  fill="currentColor"
                  strokeWidth={1}
                />
              </button>
            ))}
            <p className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-[11px] text-grey-600">
              GIS positions from the centre master (lat / long captured per centre — Ref. 38)
            </p>
          </div>
        </Card>
      )}

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail?.name ?? ''}
        description={detail ? `${detail.centreCode} · legacy ${detail.legacyRef}` : undefined}
        size="lg"
      >
        {detail && (
          <div className="space-y-4">
            <dl className="grid gap-3 sm:grid-cols-2">
              <Row label="Address" value={detail.address} />
              <Row label="District" value={detail.district} />
              <Row label="Contact" value={detail.contact} />
              <Row label="Email" value={detail.email} />
              <Row label="GIS location" value={`${detail.lat.toFixed(5)}, ${detail.lng.toFixed(5)}`} />
              <Row label="Rooms" value={String(detail.rooms)} />
              <Row label="Seating capacity" value={String(detail.capacity)} />
              <Row label="Accessibility" value={detail.accessible ? 'Ramp, ground-floor halls' : 'Not accessible'} />
            </dl>

            <AuditTrailPanel
              title="Trail of changes (Ref. 39)"
              changes={[
                {
                  timestamp: '2024-04-22 15:31',
                  actor: 'Exam Officer',
                  field: 'Seating capacity',
                  from: '420',
                  to: String(detail.capacity),
                },
                {
                  timestamp: '2024-03-14 10:08',
                  actor: 'System Admin',
                  field: 'Legacy reference',
                  from: 'Not set',
                  to: detail.legacyRef,
                },
              ]}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={allocating}
        onClose={() => setAllocating(false)}
        title="Centre allocation"
        description="Ref. 42 — automated or manual, chosen up front."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAllocating(false)}>
              Cancel
            </Button>
            <Button disabled={changeLocked} onClick={() => setAllocating(false)}>
              Run allocation
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Examination" required>
              <Select defaultValue={seed.exams[0].name}>
                {seed.exams.map((exam) => (
                  <option key={exam.id}>{exam.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Mode" required>
              <Select defaultValue="Automated">
                <option>Automated</option>
                <option>Manual</option>
              </Select>
            </Field>
            <Field label="Expected number of candidates" required>
              <Input type="number" defaultValue={12458} />
            </Field>
            <Field label="Maximum candidates per room" required hint="A required constraint (Ref. 42).">
              <Input type="number" defaultValue={30} />
            </Field>
          </div>

          <Banner tone="info" title="Allocation accounts for">
            Persons with Disabilities · Visually Impaired Persons · region and language of
            candidates. Centre assignment also considers place of residence, type of post and
            physical state of candidate (Ref. 45).
          </Banner>

          {changeLocked && (
            <Banner tone="warning" title="Blocked — exam is inside the 5-day window">
              Allocation cannot be re-run this close to the exam date.
            </Banner>
          )}
        </div>
      </Modal>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] text-grey-600">{label}</dt>
      <dd className="text-[13px] font-medium text-navy-900">{value}</dd>
    </div>
  )
}
