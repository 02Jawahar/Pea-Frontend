import { CheckCircle2, Download, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, ProgressBar } from '@/components/common/primitives'
import { EmptyState, SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { api, seed } from '@/mock/api'

/**
 * Ref. 61, 62 — result card, scorecard and Selection List download.
 * Ref. 62 requires the date and time of issue to appear both on the portal and
 * on the downloaded document, so it is a visible issue stamp, not a footer note.
 */
export default function CandidateResults() {
  const { data, isLoading } = useAsync(() => api.results(), 'results')

  if (isLoading) return <SkeletonCards />

  const results = data ?? []
  if (results.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No results declared yet"
          description="Results appear here once marks are notified for an exam you sat. You will be alerted by SMS and email."
        />
      </Card>
    )
  }

  const selection = seed.selectionLists[0]

  return (
    <div className="page mx-auto w-full max-w-4xl">
      <h1 className="page-title">Results &amp; Scorecard</h1>

      {results.map((result) => (
        <Card key={result.applicationNo}>
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-green-050">
              <CheckCircle2 className="size-9 text-green-600" strokeWidth={1.5} />
            </span>
            <StatusPill status={result.status} size="md" />
            <p className="text-[13px] text-grey-600">{result.examName}</p>
            <p className="text-[12px] text-grey-600">
              Application <span className="font-mono">{result.applicationNo}</span>
            </p>

            <div className="w-full max-w-md">
              <p className="text-[12px] text-grey-600">Marks Obtained</p>
              <p className="text-[30px] leading-tight font-semibold text-navy-900">
                {result.marksObtained.toFixed(2)}{' '}
                <span className="text-[18px] text-grey-600">/ {result.totalMarks}</span>
              </p>
              <ProgressBar
                value={(result.marksObtained / result.totalMarks) * 100}
                tone="green"
                className="mt-2"
              />
              <p className="mt-1 text-[12px] text-grey-600">
                Qualifying mark {result.qualifyingMark} · Category rank {result.rank}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Button variant="success">
                <FileText className="size-4" />
                View Score Card
              </Button>
              <Link to={ROUTES.CANDIDATE_ANSWER_KEY}>
                <Button variant="secondary">Answer key &amp; objections</Button>
              </Link>
            </div>
          </div>
        </Card>
      ))}

      <Card title="Selection List">
        <div className="space-y-3">
          <dl className="grid gap-3 sm:grid-cols-4">
            <Stat label="Total Vacancies" value={selection.totalVacancies} />
            <Stat label="Selected Candidates" value={selection.selected} />
            <Stat label="Waiting List" value={selection.waitingList} />
            <Stat label="Approval Status" value={selection.approvalStatus} />
          </dl>

          {/* Ref. 62 — visible issue stamp, on screen and on the PDF. */}
          <Banner tone="neutral" title="Issued">
            This Selection List was issued on{' '}
            <strong>{selection.issuedAt}</strong>. The same date and time is printed on the
            downloaded document.
          </Banner>

          <Button variant="secondary">
            <Download className="size-4" />
            Download Selection List (PDF)
          </Button>
        </div>
      </Card>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-grey-200 px-3 py-2.5">
      <dt className="text-[12px] text-grey-600">{label}</dt>
      <dd className="text-[18px] font-semibold text-navy-900">{value}</dd>
    </div>
  )
}
