import { Building2, ChevronRight, Info, Plus, ShieldAlert, Users } from 'lucide-react'
import { useState } from 'react'

import { DataTable, type Column } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { Banner, Button, Card, Field, Select, Tabs } from '@/components/common/primitives'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import type { Office } from '@/types'
import { cn } from '@/utils/cn'

type TabId = 'tree' | 'table'

/**
 * Ref. 66, 67 — office hierarchy.
 *
 * The defining constraint: mapping is performed on **offices, not individual
 * users**. The office master is add-only — there is deliberately no delete
 * affordance anywhere on this screen, and the note below says why.
 *
 * Removing an office from a workflow is blocked while tasks are pending with
 * the user mapped to it; the blocking dialog lists those tasks rather than
 * showing a generic error.
 */
export default function OfficeHierarchy() {
  const { data, isLoading } = useAsync(() => api.offices(), 'offices')
  const { can } = useAuth()
  const [tab, setTab] = useState<TabId>('tree')
  const [removing, setRemoving] = useState<Office | null>(null)

  const offices = data ?? []
  const roots = offices.filter((office) => office.parentId === null)

  const columns: Column<Office>[] = [
    {
      key: 'name',
      header: 'Office',
      accessor: (row) => row.name,
      sortable: true,
      render: (row) => (
        <span className="flex items-center gap-2" style={{ paddingLeft: row.level * 14 }}>
          <Building2 className="size-3.5 shrink-0 text-grey-600" />
          <span className="font-medium text-navy-900">{row.name}</span>
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) =>
        seed.departments.find((department) => department.id === row.departmentId)?.name ?? 'PEA',
    },
    {
      key: 'parent',
      header: 'Reports to',
      render: (row) => offices.find((office) => office.id === row.parentId)?.name ?? '—',
    },
    {
      key: 'users',
      header: 'Users mapped',
      accessor: (row) => row.mappedUsers,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'pending',
      header: 'Pending tasks',
      accessor: (row) => row.pendingTasks,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
      render: (row) =>
        row.pendingTasks > 0 ? (
          <span className="font-medium text-amber-500">{row.pendingTasks}</span>
        ) : (
          <span className="text-grey-600">0</span>
        ),
    },
    {
      key: 'action',
      header: '',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={!can('hierarchy.edit') || row.parentId === null}
          onClick={() => setRemoving(row)}
        >
          Remove from workflow
        </Button>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Office Hierarchy</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {offices.length} offices · workflow position is inherited from the office, never assigned
            to a person.
          </p>
        </div>
        {can('hierarchy.edit') && (
          <Button>
            <Plus className="size-4" />
            Add office
          </Button>
        )}
      </div>

      <Banner tone="info" icon={<Info className="size-4" />} title="Offices are add-only by design">
        The office master is maintained without options to edit or delete records (Ref. 66). New
        offices can be added; existing ones are never destroyed, because historical workflow trails
        must stay resolvable. That is why there is no delete control anywhere on this screen — only
        “remove from workflow”, which leaves the office record intact.
      </Banner>

      <Banner tone="neutral" icon={<Users className="size-4" />} title="Assign to an office, never to a person">
        A user inherits their workflow position from the office they are mapped to. The UI must never
        present “assign task to person” — every task list, approval bar and inbox in this application
        addresses an office.
      </Banner>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'tree', label: 'Tree' },
          { id: 'table', label: 'Flat table', count: offices.length },
        ]}
      />

      {tab === 'tree' ? (
        <Card>
          <ul className="space-y-1">
            {roots.map((root) => (
              <OfficeNode key={root.id} office={root} offices={offices} depth={0} />
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <DataTable
            rows={offices}
            columns={columns}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            searchPlaceholder="Search offices"
            searchFields={(row) => row.name}
            pageSize={15}
            emptyTitle="No offices"
            emptyDescription="Add the first office to build the hierarchy."
          />
        </Card>
      )}

      <Card title="Inter-departmental mapping">
        <p className="text-[13px] text-grey-600">
          Offices of one department are mapped to offices of another so an inter-departmental
          workflow — a Finance concurrence request, for instance — reaches the right inbox.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
          <Field label="From office">
            <Select defaultValue={offices[1]?.id}>
              {offices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end pb-2">
            <ChevronRight className="size-5 text-grey-600" />
          </div>
          <Field label="To office">
            <Select defaultValue={offices[3]?.id}>
              {offices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end">
            <Button disabled={!can('hierarchy.edit')}>Map</Button>
          </div>
        </div>
      </Card>

      <Modal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title={removing ? `Remove ${removing.name} from the workflow?` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={(removing?.pendingTasks ?? 0) > 0}
              onClick={() => setRemoving(null)}
              title={
                (removing?.pendingTasks ?? 0) > 0
                  ? 'Removal is blocked while tasks are pending with this office.'
                  : undefined
              }
            >
              Remove from workflow
            </Button>
          </>
        }
      >
        {removing && (
          <div className="space-y-3">
            {removing.pendingTasks > 0 ? (
              <>
                <Banner
                  tone="danger"
                  icon={<ShieldAlert className="size-4" />}
                  title={`Blocked — ${removing.pendingTasks} task${removing.pendingTasks === 1 ? '' : 's'} pending with this office`}
                >
                  Ref. 67 requires the system to verify pending tasks and block removal until they
                  are completed. Complete or reassign each task below, then try again.
                </Banner>

                <ul className="divide-y divide-grey-200 rounded-md border border-grey-200">
                  {Array.from({ length: removing.pendingTasks }, (_, index) => (
                    <li key={index} className="flex items-center gap-3 px-3 py-2.5">
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium text-navy-900">
                          {['Requisition approval', 'Application scrutiny', 'Shortlisting sign-off', 'Finance concurrence', 'Notification approval'][index % 5]}
                        </span>
                        <span className="block font-mono text-[11px] text-grey-600">
                          REQ/REV/2024/000{index + 1}
                        </span>
                      </span>
                      <Button variant="ghost" size="sm">
                        Open
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Banner tone="info">
                No tasks are pending with this office. Removing it from the workflow leaves the
                office record itself intact — historical trails continue to resolve.
              </Banner>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function OfficeNode({
  office,
  offices,
  depth,
}: {
  office: Office
  offices: Office[]
  depth: number
}) {
  const children = offices.filter((item) => item.parentId === office.id)

  return (
    <li>
      <div
        className={cn(
          'flex flex-wrap items-center gap-3 rounded-md border border-grey-200 px-3 py-2.5',
          depth === 0 && 'bg-blue-050',
        )}
        style={{ marginLeft: depth * 20 }}
      >
        <Building2 className="size-4 shrink-0 text-navy-700" />
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-medium text-navy-900">{office.name}</span>
          <span className="block text-[12px] text-grey-600">
            {office.mappedUsers} user{office.mappedUsers === 1 ? '' : 's'} mapped
          </span>
        </span>
        {office.pendingTasks > 0 && (
          <span className="rounded bg-amber-050 px-1.5 py-0.5 text-[11px] font-medium text-amber-500">
            {office.pendingTasks} pending
          </span>
        )}
      </div>

      {children.length > 0 && (
        <ul className="mt-1 space-y-1">
          {children.map((child) => (
            <OfficeNode key={child.id} office={child} offices={offices} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}
