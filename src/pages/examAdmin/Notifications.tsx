import { FileText, Layers, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { DataTable, type Column } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import type { PublicNotification } from '@/types'
import { cn } from '@/utils/cn'

/** Ref. 19–23 — draft, approve, NAPS gate, publish. */
export default function ExamAdminNotifications() {
  const { data, isLoading } = useAsync(() => api.notifications(), 'notifications')
  const { can } = useAuth()

  const columns: Column<PublicNotification>[] = [
    {
      key: 'no',
      header: 'Notification No.',
      accessor: (row) => row.notificationNo,
      sortable: true,
      render: (row) => (
        <Link
          to={ROUTES.EA_NOTIFICATION_PUBLISH(row.id)}
          className="font-mono text-[12px] font-medium text-navy-700 hover:underline"
        >
          {row.notificationNo}
        </Link>
      ),
    },
    { key: 'title', header: 'Title', accessor: (row) => row.title, className: 'max-w-80' },
    {
      key: 'depts',
      header: 'Departments',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5">
          {row.departmentNames.length > 1 && (
            <Layers className="size-3.5 text-purple-600" aria-label="Consolidated notification" />
          )}
          {row.departmentNames.join(', ')}
        </span>
      ),
    },
    {
      key: 'vacancies',
      header: 'Vacancies',
      accessor: (row) => row.totalVacancies,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    { key: 'published', header: 'Published on', render: (row) => row.publishedOn ?? '—' },
    { key: 'last', header: 'Last date', accessor: (row) => row.lastDate },
    {
      key: 'naps',
      header: 'NAPS gate',
      render: (row) => {
        const failures = row.napsChecks.filter((check) => !check.passed).length
        return failures === 0 ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-green-600">
            <ShieldCheck className="size-3.5" />
            All checks pass
          </span>
        ) : (
          <span className="text-[12px] font-medium text-red-600">
            {failures} check{failures === 1 ? '' : 's'} failing
          </span>
        )
      },
    },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
    {
      key: 'action',
      header: '',
      render: (row) => (
        <Link to={ROUTES.EA_NOTIFICATION_PUBLISH(row.id)}>
          <Button variant="ghost" size="sm" disabled={!can('notification.publish')}>
            {row.status === 'Published' ? 'View gate' : 'Open publish gate'}
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Draft generation, workflow approval, the NAPS gate and publication.
          </p>
        </div>
        {can('notification.draft') && (
          <div className="flex gap-2">
            <Button variant="secondary">
              <Layers className="size-4" />
              Generate combined notification
            </Button>
            <Button>
              <FileText className="size-4" />
              New draft
            </Button>
          </div>
        )}
      </div>

      <Banner tone="info" title="Consolidation and templates">
        Multiple approved requisitions across departments can be merged into one common draft, with
        per-department sections in the merged preview. Vacancy tables, criteria and the reservation
        matrix are data-bound regions in the editor — they pull from the requisition and are edited
        at source, not typed over.
      </Banner>

      <Card>
        <DataTable
          rows={data ?? []}
          columns={columns}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          searchPlaceholder="Search by notification number or title"
          searchFields={(row) => `${row.notificationNo} ${row.title} ${row.departmentNames.join(' ')}`}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: ['Draft', 'Under Review', 'Approved', 'Published', 'Cancelled'],
              match: (row, value) => row.status === value,
            },
          ]}
          emptyTitle="No notifications yet"
          emptyDescription="Generate a draft from an approved requisition to begin."
        />
      </Card>

      <Card title="Approval sequence">
        <ol className="space-y-2">
          {[
            ['Requisition review', 'Four-point compliance check against RR rules, qualification criteria, vacancy matrix and competent-official approval (Ref. 18).'],
            ['Draft notification', 'Generated from department data, with data-bound regions locked and free text for general instructions (Ref. 19).'],
            ['Workflow approval', 'Each level digitally signed. For e-Sign, the public key issued by the platform is captured (Ref. 20).'],
            ['Pre-flight validation', 'Cross-module checks run before final approval; the final notification cannot be generated until they pass (Ref. 21).'],
            ['NAPS gate', 'Three verifications and three validations, all pass required, blocking publish (Ref. 23).'],
            ['Publish & schedule', 'Notification and all 13 recruitment dates go live on the public portal (Ref. 22).'],
          ].map(([label, detail], index) => (
            <li key={String(label)} className="flex gap-3">
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold',
                  'bg-blue-050 text-navy-700',
                )}
              >
                {index + 1}
              </span>
              <div>
                <p className="text-[13px] font-medium text-navy-900">{String(label)}</p>
                <p className="text-[12px] text-grey-600">{String(detail)}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  )
}
