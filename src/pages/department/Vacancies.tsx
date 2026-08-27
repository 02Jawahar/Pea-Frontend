import { Building2, Plus, RefreshCcw, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

import { DonutChart } from '@/components/charts'
import { DataTable, type Column } from '@/components/common/DataTable'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import type { Vacancy } from '@/types'

/** Ref. 2 — vacant position entry, with the two-way e-HRMS sync state visible. */
export default function DepartmentVacancies() {
  const { data, isLoading } = useAsync(() => api.vacancies(), 'vacancies')
  const { staff, can } = useAuth()

  const all = data ?? []
  const rows = staff?.departmentId
    ? all.filter((vacancy) => vacancy.departmentId === staff.departmentId)
    : all

  const total = rows.reduce((sum, vacancy) => sum + vacancy.noOfPosts, 0)
  const published = rows.filter((vacancy) => vacancy.status === 'Published')
  const drafts = rows.filter((vacancy) => vacancy.status === 'Draft')
  const ehrms = seed.integrations.find((integration) => integration.key === 'ehrms')!

  const columns: Column<Vacancy>[] = [
    {
      key: 'id',
      header: 'Vacancy ID',
      accessor: (row) => row.vacancyId,
      sortable: true,
      render: (row) => <span className="font-mono text-[12px] font-medium">{row.vacancyId}</span>,
    },
    { key: 'post', header: 'Post Name', accessor: (row) => row.postName, sortable: true },
    { key: 'dept', header: 'Department', accessor: (row) => row.departmentName },
    {
      key: 'posts',
      header: 'No. of Posts',
      accessor: (row) => row.noOfPosts,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    { key: 'created', header: 'Created', accessor: (row) => row.createdAt, sortable: true },
    { key: 'last', header: 'Last date', accessor: (row) => row.lastDate },
    {
      key: 'sync',
      header: 'e-HRMS',
      render: (row) => {
        const post = seed.posts.find((item) => item.id === row.postId)
        return post?.syncedFromEhrms ? (
          <span className="text-[12px] text-green-600">Synced · {post.syncedAt}</span>
        ) : (
          <span className="text-[12px] text-amber-500">Manual — pending confirmation</span>
        )
      },
    },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
  ]

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Vacant Positions</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {total} vacancies across {rows.length} entries. Figures push back to e-HRMS / PaySoft
            once confirmed.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <RefreshCcw className="size-4" />
            Push to e-HRMS
          </Button>
          {can('vacancy.edit') && (
            <Button>
              <Plus className="size-4" />
              Enter vacancy
            </Button>
          )}
        </div>
      </div>

      {ehrms.status === 'Down' && (
        <Banner
          tone="warning"
          icon={<TriangleAlert className="size-4" />}
          title="e-HRMS / PaySoft is not responding"
        >
          {ehrms.retryQueue} vacancy records are queued for push-back and will retry automatically.
          Where e-HRMS has not been updated you may enter vacancies here directly — the record is
          flagged <strong>Manual entry — pending e-HRMS confirmation</strong> until the sync
          succeeds (Ref. 2).
        </Banner>
      )}

      <KpiStrip>
        <KpiCard icon={<Building2 className="size-5" />} label="Vacancy entries" value={rows.length} tone="blue" />
        <KpiCard icon={<Building2 className="size-5" />} label="Total vacancies" value={total} tone="green" />
        <KpiCard icon={<Building2 className="size-5" />} label="Published" value={published.length} tone="purple" />
        <KpiCard icon={<Building2 className="size-5" />} label="Draft" value={drafts.length} tone="amber" />
        <KpiCard
          icon={<RefreshCcw className="size-5" />}
          label="Awaiting e-HRMS confirmation"
          value={rows.filter((row) => !seed.posts.find((post) => post.id === row.postId)?.syncedFromEhrms).length}
          tone="red"
        />
      </KpiStrip>

      <div className="grid flex-1 items-start gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(300px,1fr)]">
        <Card title="Vacancies" className="flex-1">
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            searchPlaceholder="Search by vacancy ID or post"
            searchFields={(row) => `${row.vacancyId} ${row.postName} ${row.departmentName}`}
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Published'],
                match: (row, value) => row.status === value,
              },
            ]}
            pageSize={10}
            emptyTitle="No vacancies recorded"
            emptyDescription="Enter a vacancy manually, or wait for the e-HRMS sync to populate it."
          />
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="Vacancies by status">
            <DonutChart
              data={[
                { name: 'Published', value: published.length, pct: Math.round((published.length / rows.length) * 100) },
                { name: 'Draft', value: drafts.length, pct: Math.round((drafts.length / rows.length) * 100) },
                {
                  name: 'Under review',
                  value: rows.filter((row) => row.status === 'Under Review').length,
                  pct: Math.round((rows.filter((row) => row.status === 'Under Review').length / rows.length) * 100),
                },
                {
                  name: 'Approved',
                  value: rows.filter((row) => row.status === 'Approved').length,
                  pct: Math.round((rows.filter((row) => row.status === 'Approved').length / rows.length) * 100),
                },
              ].filter((slice) => slice.value > 0)}
              totalLabel="Entries"
              valueFormatter={(value) => String(value)}
            />
          </Card>

          <Card title="Strength against sanction" bodyClassName="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  {['Post', 'Sanctioned', 'Available'].map((header) => (
                    <th key={header} className="px-4 py-2 text-left text-[12px] font-semibold uppercase">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seed.posts
                  .filter((post) => !staff?.departmentId || post.departmentId === staff.departmentId)
                  .map((post) => (
                    <tr key={post.id} className="border-b border-grey-200 last:border-b-0">
                      <td className="data-cell">
                        <p className="clamp-1 font-medium">{post.name}</p>
                      </td>
                      <td className="data-cell text-right font-mono">{post.sanctionedStrength}</td>
                      <td className="data-cell text-right font-mono font-medium text-navy-700">
                        {post.availableStrength}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Card>

          <Card title="Next step">
            <p className="text-[13px] text-grey-600">
              Approved vacancies feed a requisition, which carries them into the PEA notification
              pipeline.
            </p>
            <Link to={ROUTES.DEPT_REQUISITION_NEW}>
              <Button className="mt-3 w-full" disabled={!can('requisition.create')}>
                Create a requisition
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
