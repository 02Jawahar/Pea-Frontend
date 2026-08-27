import { ArrowRight, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'

import { DataTable, type Column } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import type { Application } from '@/types'
import { decodeApplicationNo } from '@/utils/format'

/** Ref. 35 — the candidate's own list, with a status pill against each Application Number. */
export default function CandidateApplications() {
  const { candidate } = useAuth()
  const { data, isLoading } = useAsync(() => api.applicationsFor(candidate!.id), candidate?.id)

  const columns: Column<Application>[] = [
    {
      key: 'no',
      header: 'Application No.',
      accessor: (row) => row.applicationNo,
      sortable: true,
      render: (row) => (
        <Link
          to={ROUTES.CANDIDATE_APPLICATION(row.id)}
          className="font-mono text-[12px] font-medium text-navy-700 hover:underline"
          title={decodeApplicationNo(row.applicationNo)}
        >
          {row.applicationNo}
        </Link>
      ),
    },
    { key: 'post', header: 'Post', accessor: (row) => row.postName, sortable: true },
    { key: 'dept', header: 'Department', accessor: (row) => row.departmentName },
    { key: 'submitted', header: 'Submitted On', render: (row) => row.submittedOn ?? '—' },
    {
      key: 'fee',
      header: 'Fee',
      render: (row) =>
        row.feePaid ? (
          <span className="text-green-600">Paid ₹{row.feeAmount}</span>
        ) : row.status === 'Draft' ? (
          <span className="text-grey-600">—</span>
        ) : (
          <Link to={ROUTES.CANDIDATE_PAY(row.id)}>
            <Button size="sm" variant="secondary">
              <Wallet className="size-3.5" />
              Pay ₹{row.feeAmount}
            </Button>
          </Link>
        ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
    {
      key: 'action',
      header: '',
      render: (row) => (
        <Link
          to={ROUTES.CANDIDATE_APPLICATION(row.id)}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-navy-700 hover:underline"
        >
          View
          <ArrowRight className="size-3.5" />
        </Link>
      ),
    },
  ]

  return (
    <div className="page">
      <div>
        <h1 className="page-title">My Applications</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Each post you apply to gets its own Application Number, all sharing your Registration
          Number {candidate?.registrationNo}.
        </p>
      </div>

      <Banner tone="info" title="What the Application Number encodes">
        <span className="font-mono">[DEPT][POST][YYYYMMDD][TESTTYPE][SERIES][SEQ]</span> — department,
        post and submission date are derivable from it, and the last digits carry the test type and
        question paper series. Hover any number to see it decoded.
      </Banner>

      <Card>
        <DataTable
          rows={data ?? []}
          columns={columns}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          searchPlaceholder="Search by Application Number or post"
          searchFields={(row) => `${row.applicationNo} ${row.postName} ${row.departmentName}`}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                'Draft',
                'Fee Pending',
                'Submitted',
                'Under Scrutiny',
                'Shortlisted',
                'Rejected',
                'Withdrawn',
                'Cancelled',
              ],
              match: (row, value) => row.status === value,
            },
          ]}
          emptyTitle="You have not applied to any post yet"
          emptyDescription="Browse open examinations and apply — your profile pre-fills most of the form."
          emptyAction={
            <Link to={ROUTES.CANDIDATE_EXAMINATIONS}>
              <Button>Browse open examinations</Button>
            </Link>
          }
        />
      </Card>
    </div>
  )
}

