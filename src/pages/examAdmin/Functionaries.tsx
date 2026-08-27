import { FileText, TriangleAlert, UserPlus, Wallet } from 'lucide-react'
import { useState } from 'react'

import { DataTable, type Column } from '@/components/common/DataTable'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Tabs } from '@/components/common/primitives'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import type { Functionary } from '@/types'

type TabId = 'staff' | 'honorarium'

/**
 * Ref. 44 — functionary management.
 *
 * A reserve list is explicitly required, so assignment carries a primary /
 * reserve distinction and the generated office order prints both. Conflict
 * detection catches the same person assigned to two centres in one session.
 */
export default function FunctionaryManagement() {
  const { data, isLoading } = useAsync(() => api.functionaries(), 'functionaries')
  const { can } = useAuth()
  const [tab, setTab] = useState<TabId>('staff')
  const [paying, setPaying] = useState(false)

  const list = data ?? []
  const primary = list.filter((item) => item.assignment === 'Primary')
  const reserve = list.filter((item) => item.assignment === 'Reserve')
  const unpaid = list.filter((item) => item.paymentStatus === 'Pending')
  const unpaidTotal = unpaid.reduce((sum, item) => sum + item.honorarium, 0)

  // Conflict: the same employee ID assigned to two centres for one session.
  const conflicts = list.filter(
    (item, index) => list.findIndex((other) => other.employeeId === item.employeeId) !== index,
  )

  const staffColumns: Column<Functionary>[] = [
    {
      key: 'employeeId',
      header: 'Employee ID',
      accessor: (row) => row.employeeId,
      sortable: true,
      render: (row) => <span className="font-mono text-[12px]">{row.employeeId}</span>,
    },
    { key: 'name', header: 'Name', accessor: (row) => row.name, sortable: true },
    { key: 'category', header: 'Category', accessor: (row) => row.category, sortable: true },
    { key: 'centre', header: 'Centre', accessor: (row) => row.centreName, className: 'max-w-64 truncate' },
    {
      key: 'assignment',
      header: 'Assignment',
      render: (row) => <StatusPill status={row.assignment} />,
    },
    { key: 'mobile', header: 'Mobile', accessor: (row) => row.mobile },
  ]

  const payColumns: Column<Functionary>[] = [
    { key: 'name', header: 'Name', accessor: (row) => row.name, sortable: true },
    { key: 'category', header: 'Category', accessor: (row) => row.category },
    { key: 'centre', header: 'Centre', accessor: (row) => row.centreName, className: 'max-w-56 truncate' },
    {
      key: 'rate',
      header: 'Rate',
      accessor: (row) => row.honorarium,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
      render: (row) => `₹ ${row.honorarium.toLocaleString('en-IN')}`,
    },
    {
      key: 'status',
      header: 'Payment status',
      render: (row) => <StatusPill status={row.paymentStatus} />,
    },
    {
      key: 'receipt',
      header: '',
      render: (row) =>
        row.paymentStatus === 'Paid' ? (
          <Button variant="ghost" size="sm">
            Receipt
          </Button>
        ) : (
          <span className="text-[12px] text-grey-600">—</span>
        ),
    },
  ]

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Invigilator Management</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Staff database for exam duty, assignment with a reserve list, office orders and
            honorarium payment.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={!can('functionary.assign')}>
            <FileText className="size-4" />
            Generate office order
          </Button>
          <Button disabled={!can('functionary.assign')}>
            <UserPlus className="size-4" />
            Assign to a centre
          </Button>
        </div>
      </div>

      {conflicts.length > 0 && (
        <Banner
          tone="danger"
          icon={<TriangleAlert className="size-4" />}
          title={`${conflicts.length} assignment conflict${conflicts.length === 1 ? '' : 's'}`}
        >
          {conflicts.map((item) => `${item.name} (${item.employeeId})`).join(' · ')} — assigned to
          more than one centre for the same session. Resolve before the office order is generated.
        </Banner>
      )}

      <KpiStrip>
        <KpiCard icon={<UserPlus className="size-5" />} label="Functionaries" value={list.length} tone="blue" />
        <KpiCard icon={<UserPlus className="size-5" />} label="Primary" value={primary.length} tone="green" />
        <KpiCard icon={<UserPlus className="size-5" />} label="Reserve" value={reserve.length} tone="purple" />
        <KpiCard
          icon={<Wallet className="size-5" />}
          label="Honorarium pending"
          value={`₹ ${unpaidTotal.toLocaleString('en-IN')}`}
          subLabel={`${unpaid.length} people`}
          tone="amber"
        />
      </KpiStrip>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'staff', label: 'Staff & assignment', count: list.length },
          { id: 'honorarium', label: 'Honorarium', count: unpaid.length },
        ]}
      />

      {tab === 'staff' ? (
        <Card>
          <DataTable
            rows={list}
            columns={staffColumns}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            searchPlaceholder="Search by name, Employee ID or centre"
            searchFields={(row) => `${row.name} ${row.employeeId} ${row.centreName} ${row.category}`}
            filters={[
              {
                key: 'category',
                label: 'Category',
                options: ['Centre Supervisor', 'Assistant Centre Supervisor', 'Zonal Officer', 'Invigilator'],
                match: (row, value) => row.category === value,
              },
              {
                key: 'assignment',
                label: 'Assignment',
                options: ['Primary', 'Reserve'],
                match: (row, value) => row.assignment === value,
              },
            ]}
            pageSize={10}
            emptyTitle="No functionaries assigned"
            emptyDescription="Assign staff to centres for this examination."
          />
        </Card>
      ) : (
        <Card
          title="Honorarium payment"
          action={
            <Button
              size="sm"
              disabled={!can('functionary.pay') || unpaid.length === 0}
              onClick={() => setPaying(true)}
            >
              <Wallet className="size-3.5" />
              Initiate bulk payment
            </Button>
          }
        >
          <Banner tone="info" className="mb-3">
            PEA pays functionaries through online modes of payment. Once initiated, each payment is
            reconciled against the bank confirmation file and its status is shown per person.
          </Banner>

          <DataTable
            rows={list}
            columns={payColumns}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            searchPlaceholder="Search by name or centre"
            searchFields={(row) => `${row.name} ${row.centreName}`}
            filters={[
              {
                key: 'status',
                label: 'Payment status',
                options: ['Paid', 'Pending'],
                match: (row, value) => row.paymentStatus === value,
              },
            ]}
            pageSize={10}
            emptyTitle="Nothing to pay"
            emptyDescription="All honorarium payments are settled."
          />
        </Card>
      )}

      <Modal
        open={paying}
        onClose={() => setPaying(false)}
        title="Initiate bulk honorarium payment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPaying(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={() => setPaying(false)}>
              Initiate payment
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <dl className="grid gap-3 sm:grid-cols-3">
            {[
              ['Recipients', String(unpaid.length)],
              ['Total amount', `₹ ${unpaidTotal.toLocaleString('en-IN')}`],
              ['Mode', 'NEFT'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-grey-050 px-3 py-2.5">
                <dt className="text-[12px] text-grey-600">{label}</dt>
                <dd className="text-[16px] font-semibold text-navy-900">{value}</dd>
              </div>
            ))}
          </dl>

          <Banner tone="info">
            Functionaries upload bills and vouchers for settlement of accounts and download their
            attendance / acquittance from their own portal (Ref. 50). Payment status and receipts
            appear there once the bank confirms.
          </Banner>
        </div>
      </Modal>
    </div>
  )
}
