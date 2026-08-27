import { ArrowLeft, Download, History, ShieldAlert } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { DonutChart } from '@/components/charts'
import { DataTable, type Column } from '@/components/common/DataTable'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card } from '@/components/common/primitives'
import { EmptyState, SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import type { MeritEntry } from '@/types'
import { cn } from '@/utils/cn'
import { SummaryPanel } from './widgets'

export default function MeritListDetail() {
  const { id = '' } = useParams()
  const { data, isLoading } = useAsync(() => api.meritList(id), id)
  const { staff } = useAuth()

  if (isLoading) return <SkeletonCards />
  if (!data) {
    return (
      <Card>
        <EmptyState title="Merit list not found" description="Check the link and try again." />
      </Card>
    )
  }

  const columns: Column<MeritEntry>[] = [
    {
      key: 'rank',
      header: 'Rank',
      accessor: (row) => row.rank,
      sortable: true,
      className: 'font-semibold',
    },
    {
      key: 'roll',
      header: 'Roll Number',
      accessor: (row) => row.rollNo,
      sortable: true,
      render: (row) => <span className="font-mono text-[12px]">{row.rollNo}</span>,
    },
    { key: 'name', header: 'Candidate Name', accessor: (row) => row.candidateName, sortable: true },
    { key: 'category', header: 'Category', accessor: (row) => row.category, sortable: true },
    {
      key: 'total',
      header: 'Total Marks',
      accessor: (row) => row.totalMarks,
      sortable: true,
      className: 'text-right font-mono',
      headerClassName: 'text-right',
      render: (row) => row.totalMarks.toFixed(2),
    },
    {
      key: 'normalized',
      header: 'Normalized Marks',
      accessor: (row) => row.normalizedMarks,
      sortable: true,
      className: 'text-right font-mono',
      headerClassName: 'text-right',
      // Ref. 51 — 4 decimal places, never rounded for display.
      render: (row) => row.normalizedMarks.toFixed(4),
    },
    {
      key: 'tie',
      header: 'Tie-Breaker',
      render: (row) =>
        row.tieBreakerApplied ? (
          <span className="font-medium text-amber-500">Applied</span>
        ) : (
          <span className="text-grey-600">No</span>
        ),
    },
  ]

  return (
    <div className="page">
      <Link
        to={ROUTES.EA_MERIT}
        className="inline-flex items-center gap-1.5 text-[13px] text-navy-700 hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Merit Dashboard
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="page-title">{data.examName}</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {data.post} · version {data.version} · generated {data.generatedOn}
          </p>
        </div>
        <StatusPill status={data.status} size="md" />
      </div>

      <Banner tone="danger" icon={<ShieldAlert className="size-4" />} title="Confidential — not for public display">
        This view is logged against {staff?.employeeId}. Downloads carry your ID as a watermark
        (Ref. 56).
      </Banner>

      <KpiStrip>
        <KpiCard icon={<History className="size-5" />} label="Appeared" value={data.appeared} tone="blue" />
        <KpiCard icon={<History className="size-5" />} label="Considered for merit" value={data.considered} tone="purple" />
        <KpiCard icon={<History className="size-5" />} label="Merit list size" value={data.size} tone="green" />
        <KpiCard
          icon={<History className="size-5" />}
          label="Tie-breakers applied"
          value={data.entries.filter((entry) => entry.tieBreakerApplied).length}
          subLabel="in the top 10"
          tone="amber"
        />
        <KpiCard
          icon={<History className="size-5" />}
          label="Version"
          value={`v${data.version}`}
          subLabel={data.version > 1 ? `${data.version - 1} superseded, retained` : 'first generation'}
          tone="navy"
        />
      </KpiStrip>

      <div className="grid flex-1 items-start gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(300px,1fr)]">
        <Card
          title="Merit list"
          action={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <History className="size-3.5" />
                Compare with v{Math.max(1, data.version - 1)}
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="size-3.5" />
                Download
              </Button>
            </div>
          }
          className="flex-1"
        >
          <DataTable
            rows={data.entries}
            columns={columns}
            rowKey={(row) => row.rollNo}
            searchPlaceholder="Search by roll number or candidate"
            searchFields={(row) => `${row.rollNo} ${row.candidateName}`}
            filters={[
              {
                key: 'category',
                label: 'Category',
                options: ['General', 'OBC', 'SC', 'ST', 'EWS'],
                match: (row, value) => row.category === value,
              },
              {
                key: 'tie',
                label: 'Tie-breaker',
                options: ['Applied', 'Not applied'],
                match: (row, value) =>
                  value === 'Applied' ? row.tieBreakerApplied : !row.tieBreakerApplied,
              },
            ]}
            pageSize={10}
            emptyTitle="No entries"
            emptyDescription="This merit list has no entries yet."
          />
        </Card>

        <div className="flex flex-col gap-4">
          <SummaryPanel
            title="Merit summary"
            rows={[
              { label: 'Examination', value: data.examName },
              { label: 'Post / category', value: data.post },
              { label: 'Generated on', value: data.generatedOn },
              { label: 'Generated by', value: data.generatedBy },
              { label: 'Approved', value: data.approved ? 'Yes' : 'No' },
              { label: 'Signed by', value: data.signedBy ?? 'Not signed' },
            ]}
          />

          <Card title="Category distribution">
            <DonutChart
              data={seed.meritCategoryDistribution}
              totalLabel="Total"
              valueFormatter={(value) => String(value)}
            />
          </Card>

          <Card title="Rank movement vs previous version">
            <ul className="space-y-2">
              {[
                ['Ranks unchanged', 442, 'grey'],
                ['Moved up', 31, 'green'],
                ['Moved down', 27, 'amber'],
                ['New to the list', 0, 'blue'],
              ].map(([label, count, tone]) => (
                <li key={String(label)} className="flex items-center gap-2 text-[13px]">
                  <span
                    className={cn(
                      'size-2 shrink-0 rounded-full',
                      { grey: 'bg-grey-300', green: 'bg-green-600', amber: 'bg-amber-500', blue: 'bg-blue-500' }[
                        String(tone)
                      ],
                    )}
                  />
                  <span className="min-w-0 flex-1 text-navy-900">{label}</span>
                  <span className="font-medium text-navy-900">{count}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] text-grey-600">
              Version {data.version - 1} is retained in full and stays comparable.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
