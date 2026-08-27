import { Ban, Info, Plus } from 'lucide-react'
import { useState } from 'react'

import { AuditTrailPanel } from '@/components/common/AuditTrailPanel'
import { DataTable, type Column } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Field, Input, Select } from '@/components/common/primitives'
import { useAuth } from '@/hooks/useAuth'

interface MasterRow {
  id: string
  code: string
  name: string
  effectiveFrom: string
  active: boolean
  note?: string
}

interface MasterDef {
  id: string
  label: string
  addOnly?: boolean
  note?: string
  rows: MasterRow[]
}

const row = (
  id: string,
  code: string,
  name: string,
  effectiveFrom = '2023-04-01',
  active = true,
  note?: string,
): MasterRow => ({ id, code, name, effectiveFrom, active, note })

const MASTERS: MasterDef[] = [
  {
    id: 'department',
    label: 'Department master',
    rows: [
      row('d1', 'REV', 'Revenue Department'),
      row('d2', 'FIN', 'Finance Department'),
      row('d3', 'ITD', 'IT Department'),
      row('d4', 'HOM', 'Home Department'),
      row('d5', 'PWD', 'Public Works Dept.'),
      row('d6', 'EDU', 'Education Department'),
    ],
  },
  {
    id: 'office',
    label: 'Office master',
    addOnly: true,
    note: 'Add-only — offices are never edited or deleted, so historical workflow trails stay resolvable (Ref. 66).',
    rows: [
      row('o1', 'PEA-HQ', 'Puducherry Examining Authority'),
      row('o2', 'REV-HQ', 'Revenue Department — Head Office'),
      row('o3', 'REV-EST', 'Revenue Department — Establishment Section'),
      row('o4', 'FIN-HQ', 'Finance Department — Head Office'),
    ],
  },
  {
    id: 'qualification',
    label: 'Qualification master',
    rows: [
      row('q1', 'SSLC', 'Class X / SSLC'),
      row('q2', 'HSC', 'Class XII / HSC'),
      row('q3', 'UG', 'Bachelor’s degree'),
      row('q4', 'PG', 'Master’s degree'),
      row('q5', 'BED', 'B.Ed.'),
      row('q6', 'DIP', 'Diploma'),
      row('q7', 'TYPE', 'Typewriting — Higher grade', '2019-06-01', false, 'Superseded by skill master'),
    ],
  },
  {
    id: 'vertical',
    label: 'Vertical reservation categories',
    note: 'Deactivation is soft — historical reservation matrices keep the categories they were drawn with (Ref. 6).',
    rows: [
      row('v1', 'UR', 'Unreserved'),
      row('v2', 'MBC', 'Most Backward Class'),
      row('v3', 'OBC', 'Other Backward Class'),
      row('v4', 'EBC', 'Economically Backward Class'),
      row('v5', 'EWS', 'Economically Weaker Section', '2019-02-01'),
      row('v6', 'SC', 'Scheduled Caste'),
      row('v7', 'ST', 'Scheduled Tribe'),
      row('v8', 'BT', 'Backward Tribe'),
      row('v9', 'BCM', 'Backward Class Muslim'),
    ],
  },
  {
    id: 'horizontal',
    label: 'Horizontal reservation categories',
    rows: [
      row('h1', 'PWBD', 'Persons with Benchmark Disability'),
      row('h2', 'XSM', 'Ex-Service Men'),
      row('h3', 'MSP', 'Meritorious Sports Person'),
      row('h4', 'REG', 'Regional Preference'),
      row('h5', 'SSLC-L', 'Language studied in SSLC'),
    ],
  },
  {
    id: 'disability',
    label: 'Disability categories',
    rows: [
      row('y1', 'BL', 'Blind', '2023-04-01', true, 'Scribe + compensatory time automatic'),
      row('y2', 'LV', 'Low Vision', '2023-04-01', true, 'Scribe + compensatory time automatic'),
      row('y3', 'HH', 'Hard of Hearing'),
      row('y4', 'LOC', 'Locomotor'),
      row('y5', 'AUT', 'Autism'),
      row('y6', 'SLD', 'Specific Learning Disability'),
      row('y7', 'MI', 'Mental Illness'),
      row('y8', 'MD', 'Multiple Disabilities'),
    ],
  },
  {
    id: 'grievance',
    label: 'Grievance types',
    rows: [
      row('g1', 'GT1', 'Application correction'),
      row('g2', 'GT2', 'Fee payment issue'),
      row('g3', 'GT3', 'Admit card not generated'),
      row('g4', 'GT4', 'Document upload failure'),
      row('g5', 'GT5', 'Result discrepancy'),
      row('g6', 'GT6', 'Exam centre change request'),
    ],
  },
  {
    id: 'document',
    label: 'Document type master',
    note: 'Permitted formats and size caps are read by <DocumentUpload> for client-side validation.',
    rows: [
      row('t1', 'PHOTO', 'Passport photograph — JPG/PNG, 200 KB'),
      row('t2', 'SIGN', 'Signature — JPG/PNG, 100 KB'),
      row('t3', 'ID', 'Identity proof — PDF/JPG, 500 KB'),
      row('t4', 'QUAL', 'Qualification certificate — PDF, 1 MB'),
    ],
  },
  {
    id: 'fee',
    label: 'Fee master',
    rows: [
      row('f1', 'GEN', 'General / OBC / EWS — ₹750'),
      row('f2', 'SCST', 'SC / ST — ₹375'),
      row('f3', 'PWBD', 'PwBD — exempt'),
      row('f4', 'NIL', 'Fee waived for the post — payment step skipped'),
    ],
  },
  {
    id: 'language',
    label: 'Language master',
    rows: [
      row('l1', 'EN', 'English'),
      row('l2', 'TA', 'Tamil'),
      row('l3', 'ML', 'Malayalam'),
      row('l4', 'TE', 'Telugu'),
    ],
  },
]

/**
 * One consistent CRUD shell for every master: search, add, edit, deactivate
 * (never hard-delete), effective dates and an audit trail.
 */
export default function MasterData() {
  const { can } = useAuth()
  const [masterId, setMasterId] = useState(MASTERS[0].id)
  const [adding, setAdding] = useState(false)
  const [deactivating, setDeactivating] = useState<MasterRow | null>(null)

  const master = MASTERS.find((item) => item.id === masterId)!
  const editable = can('master.edit')

  const columns: Column<MasterRow>[] = [
    {
      key: 'code',
      header: 'Code',
      accessor: (item) => item.code,
      sortable: true,
      render: (item) => <span className="font-mono text-[12px]">{item.code}</span>,
    },
    { key: 'name', header: 'Name', accessor: (item) => item.name, sortable: true },
    { key: 'effective', header: 'Effective from', accessor: (item) => item.effectiveFrom, sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusPill status={item.active ? 'Active' : 'Cancelled'} />,
    },
    { key: 'note', header: 'Note', render: (item) => <span className="text-grey-600">{item.note ?? '—'}</span> },
    {
      key: 'action',
      header: '',
      render: (item) => (
        <div className="flex gap-1">
          {!master.addOnly && (
            <Button variant="ghost" size="sm" disabled={!editable}>
              Edit
            </Button>
          )}
          {item.active && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600"
              disabled={!editable || master.addOnly}
              onClick={() => setDeactivating(item)}
              title={
                master.addOnly
                  ? 'Office records are add-only — they cannot be edited or removed.'
                  : undefined
              }
            >
              <Ban className="size-3.5" />
              Deactivate
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Master Data</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {MASTERS.length} masters. Every module reads from these — nothing is hard-deleted.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            aria-label="Select master"
            className="w-auto min-w-56"
            value={masterId}
            onChange={(event) => setMasterId(event.target.value)}
          >
            {MASTERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </Select>
          {editable && (
            <Button onClick={() => setAdding(true)}>
              <Plus className="size-4" />
              Add entry
            </Button>
          )}
        </div>
      </div>

      {master.note && (
        <Banner tone={master.addOnly ? 'warning' : 'info'} icon={<Info className="size-4" />}>
          {master.note}
        </Banner>
      )}

      <Card title={master.label}>
        <DataTable
          rows={master.rows}
          columns={columns}
          rowKey={(item) => item.id}
          searchPlaceholder="Search entries"
          searchFields={(item) => `${item.code} ${item.name}`}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: ['Active', 'Deactivated'],
              match: (item, value) => (value === 'Active' ? item.active : !item.active),
            },
          ]}
          pageSize={12}
          emptyTitle="No entries"
          emptyDescription="Add the first entry to this master."
        />
      </Card>

      <AuditTrailPanel
        title={`Trail of changes — ${master.label}`}
        changes={[
          {
            timestamp: '2024-05-02 14:18',
            actor: 'Admin User',
            field: 'EWS — effective from',
            from: '2019-01-01',
            to: '2019-02-01',
          },
          {
            timestamp: '2023-11-20 10:02',
            actor: 'System Admin',
            field: 'Typewriting — Higher grade',
            from: 'Active',
            to: 'Deactivated',
          },
        ]}
      />

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title={`Add to ${master.label}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={() => setAdding(false)}>Add entry</Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Code" required>
            <Input placeholder="Short unique code" className="font-mono" />
          </Field>
          <Field label="Effective from" required>
            <Input type="date" defaultValue="2024-05-20" />
          </Field>
          <Field label="Name" required className="sm:col-span-2">
            <Input placeholder="Display name" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={deactivating !== null}
        onClose={() => setDeactivating(null)}
        title={deactivating ? `Deactivate ${deactivating.name}?` : ''}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeactivating(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setDeactivating(null)}>
              Deactivate
            </Button>
          </>
        }
      >
        <Banner tone="info" title="Soft deactivation">
          The entry stops appearing in new forms but stays attached to every record that already
          uses it. Historical reservation matrices, applications and notifications continue to
          render exactly as they were drawn.
        </Banner>
      </Modal>
    </div>
  )
}
