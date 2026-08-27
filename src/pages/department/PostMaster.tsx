import { Building2, Plus, RefreshCcw, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

import { AuditTrailPanel } from '@/components/common/AuditTrailPanel'
import { DataTable, type Column } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Field, Input, Select } from '@/components/common/primitives'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import type { Post } from '@/types'
import { cn } from '@/utils/cn'

/**
 * Ref. 1, 2, 3 — post master with the e-HRMS / PaySoft two-way sync.
 *
 * The recruitment split must total 100%: it is validated live with a running
 * total rather than failing on submit.
 */
export default function PostMaster() {
  const { data, isLoading } = useAsync(() => api.posts(), 'posts')
  const { staff, can } = useAuth()
  const [editing, setEditing] = useState<Post | null>(null)
  const [split, setSplit] = useState({ direct: 0, promotion: 0, ldce: 0 })
  const [manualOverride, setManualOverride] = useState(false)

  const rows = staff?.departmentId
    ? (data ?? []).filter((post) => post.departmentId === staff.departmentId)
    : (data ?? [])

  const columns: Column<Post>[] = [
    { key: 'code', header: 'Post Code', accessor: (row) => row.code, sortable: true, render: (row) => <span className="font-mono text-[12px]">{row.code}</span> },
    { key: 'name', header: 'Name of Post', accessor: (row) => row.name, sortable: true },
    { key: 'class', header: 'Classification', accessor: (row) => row.classification },
    { key: 'pay', header: 'Pay Level', accessor: (row) => row.payLevel },
    { key: 'age', header: 'Age Limit', accessor: (row) => row.ageLimit },
    {
      key: 'split',
      header: 'DR / Promotion / LDCE',
      render: (row) => (
        <span className="font-mono text-[12px]">
          {row.splitDirect} / {row.splitPromotion} / {row.splitLdce}
        </span>
      ),
    },
    {
      key: 'sanctioned',
      header: 'Sanctioned',
      accessor: (row) => row.sanctionedStrength,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'available',
      header: 'Available',
      accessor: (row) => row.availableStrength,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'sync',
      header: 'e-HRMS',
      render: (row) =>
        row.syncedFromEhrms ? (
          <span className="text-[12px] text-green-600">Synced · {row.syncedAt}</span>
        ) : (
          <span className="text-[12px] text-amber-500">Manual entry — pending confirmation</span>
        ),
    },
    {
      key: 'action',
      header: '',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={!can('post.edit')}
          onClick={() => {
            setEditing(row)
            setSplit({ direct: row.splitDirect, promotion: row.splitPromotion, ldce: row.splitLdce })
            setManualOverride(!row.syncedFromEhrms)
          }}
        >
          Edit
        </Button>
      ),
    },
  ]

  const splitTotal = split.direct + split.promotion + split.ldce
  const ehrms = seed.integrations.find((integration) => integration.key === 'ehrms')!

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Post Master</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Every post in your department, with its recruitment split and sanctioned strength.
          </p>
        </div>
        {can('post.edit') && (
          <Button>
            <Plus className="size-4" />
            Add Post
          </Button>
        )}
      </div>

      {ehrms.status === 'Down' && (
        <Banner
          tone="warning"
          icon={<TriangleAlert className="size-4" />}
          title="e-HRMS / PaySoft is not responding"
          action={
            <Button variant="secondary" size="sm">
              <RefreshCcw className="size-3.5" />
              Retry sync
            </Button>
          }
        >
          {ehrms.retryQueue} vacancy records are queued for push-back to e-HRMS. Sanctioned and
          available strength shown below are from the last successful sync at {ehrms.lastSuccess}.
          Where e-HRMS has not been updated, enter vacancies manually — the record is flagged until
          e-HRMS confirms it (Ref. 2).
        </Banner>
      )}

      <Card>
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          searchPlaceholder="Search by post name or code"
          searchFields={(row) => `${row.name} ${row.code}`}
          filters={[
            {
              key: 'class',
              label: 'Classification',
              options: ['Group A', 'Group B', 'Group C'],
              match: (row, value) => row.classification === value,
            },
          ]}
          emptyTitle="No posts recorded"
          emptyDescription="Add the first post for your department, or wait for the e-HRMS sync to populate it."
        />
      </Card>

      {/* Ref. 3 — prior notification status blocks careless re-notification. */}
      <Card title="Previous notification status">
        <table className="w-full">
          <thead>
            <tr className="border-b border-grey-200 bg-grey-050">
              {['Post', 'Notification date', 'Vacancies', 'Outcome', 'Current stage'].map((header) => (
                <th key={header} className="px-4 py-2 text-left text-[12px] font-semibold uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Assistant Grade II', '15-Apr-2024', '25', 'Under recruitment', 'Evaluation'],
              ['Assistant Grade II', '02-Feb-2022', '18', 'Completed', 'Appointment orders issued'],
              ['Junior Assistant', '11-Nov-2023', '30', 'Cancelled', 'Cancelled at NAPS gate'],
            ].map((row) => (
              <tr key={row.join()} className="border-b border-grey-200 last:border-b-0">
                <td className="data-cell font-medium">{row[0]}</td>
                <td className="data-cell">{row[1]}</td>
                <td className="data-cell">{row[2]}</td>
                <td className="data-cell">
                  <StatusPill
                    status={
                      row[3] === 'Completed' ? 'Completed' : row[3] === 'Cancelled' ? 'Cancelled' : 'In Progress'
                    }
                  />
                </td>
                <td className="data-cell text-grey-600">{row[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[12px] text-grey-600">
          A post already under recruitment should not be re-notified. Check this panel before
          raising a fresh requisition.
        </p>
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Edit — ${editing.name}` : ''}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button disabled={splitTotal !== 100} onClick={() => setEditing(null)}>
              Save post
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name of Post" required>
                <Input defaultValue={editing.name} />
              </Field>
              <Field label="Post Code" hint="Auto-generated, unique per department.">
                <Input value={editing.code} readOnly className="bg-grey-100 font-mono" />
              </Field>
              <Field label="Date of Notification in Recruitment Rules" required>
                <Input type="date" defaultValue="2019-03-12" />
              </Field>
              <Field label="Classification" required>
                <Select defaultValue={editing.classification}>
                  {['Group A', 'Group B', 'Group C'].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Pay Level" required>
                <Input defaultValue={editing.payLevel} />
              </Field>
              <Field label="Age Limit (direct recruitment)" required>
                <Input defaultValue={editing.ageLimit} />
              </Field>
            </div>

            <div className="rounded-md border border-grey-200 p-3">
              <p className="mb-1 text-[13px] font-semibold text-navy-900">
                Recruitment percentage split
              </p>
              <p className="mb-3 text-[12px] text-grey-600">
                Direct Recruitment / Promotion / LDCE-Deputation-Absorption must total 100%.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ['Direct Recruitment', 'direct'],
                    ['Promotion', 'promotion'],
                    ['LDCE / Deputation / Absorption', 'ldce'],
                  ] as const
                ).map(([label, key]) => (
                  <Field key={key} label={label}>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={split[key]}
                      onChange={(event) =>
                        setSplit((previous) => ({ ...previous, [key]: Number(event.target.value) }))
                      }
                    />
                  </Field>
                ))}
              </div>
              <p
                className={cn(
                  'mt-2 text-[13px] font-medium',
                  splitTotal === 100 ? 'text-green-600' : 'text-red-600',
                )}
              >
                Running total: {splitTotal}%{' '}
                {splitTotal !== 100 && `— adjust by ${100 - splitTotal > 0 ? '+' : ''}${100 - splitTotal}`}
              </p>
            </div>

            <div className="rounded-md border border-grey-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-navy-900">
                  <Building2 className="size-4 text-grey-600" />
                  Strength (e-HRMS / PaySoft)
                </p>
                <label className="flex items-center gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    checked={manualOverride}
                    onChange={(event) => setManualOverride(event.target.checked)}
                  />
                  Enter manually
                </label>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field
                  label="Sanctioned strength"
                  hint={
                    manualOverride
                      ? 'Flagged as “Manual entry — pending e-HRMS confirmation”.'
                      : `Synced from e-HRMS · ${editing.syncedAt}`
                  }
                >
                  <Input
                    defaultValue={editing.sanctionedStrength}
                    readOnly={!manualOverride}
                    className={cn(!manualOverride && 'bg-grey-100')}
                  />
                </Field>
                <Field label="Available strength">
                  <Input
                    defaultValue={editing.availableStrength}
                    readOnly={!manualOverride}
                    className={cn(!manualOverride && 'bg-grey-100')}
                  />
                </Field>
              </div>
            </div>

            <AuditTrailPanel
              changes={[
                {
                  timestamp: '2024-05-18 09:12',
                  actor: 'e-HRMS sync',
                  field: 'Available strength',
                  from: '22',
                  to: String(editing.availableStrength),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
