import { ArrowLeft, FileText } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { DigitalSignModal } from '@/components/common/DigitalSignModal'
import { StatusPill } from '@/components/common/StatusPill'
import { WorkflowTrail } from '@/components/common/WorkflowTrail'
import { Banner, Button, Card, Field, Textarea } from '@/components/common/primitives'
import { EmptyState, SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import { cn } from '@/utils/cn'
import { SummaryPanel } from '../examAdmin/widgets'

type Decision = 'Concur' | 'Concur with conditions' | 'Return for clarification'

const DECISIONS: Decision[] = ['Concur', 'Concur with conditions', 'Return for clarification']

/** Ref. 15 — each action carries mandatory remarks and a digital signature. */
export default function FinanceRequestDetail() {
  const { id = '' } = useParams()
  const { data, isLoading, reload } = useAsync(() => api.requisition(id), id)
  const { staff } = useAuth()
  const [decision, setDecision] = useState<Decision | null>(null)
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [signOpen, setSignOpen] = useState(false)
  const [done, setDone] = useState(false)

  if (isLoading) return <SkeletonCards />
  if (!data) {
    return (
      <Card>
        <EmptyState title="Request not found" description="Check the link and try again." />
      </Card>
    )
  }

  const post = seed.posts.find((item) => item.id === data.posts[0]?.postId)
  const annualCost = data.totalPosts * 4_80_000

  function submit() {
    if (!decision) {
      setError('Select a decision.')
      return
    }
    if (!remarks.trim()) {
      setError('Remarks are mandatory on every decision.')
      return
    }
    setError(null)
    setSignOpen(true)
  }

  return (
    <div className="page">
      <Link
        to={ROUTES.FI_INBOX}
        className="inline-flex items-center gap-1.5 text-[13px] text-navy-700 hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Concurrence inbox
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[12px] text-grey-600">{data.requisitionNo}</p>
          <h1 className="page-title">{data.departmentName}</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {data.posts.map((item) => `${item.postName} × ${item.count}`).join(', ')}
          </p>
        </div>
        <StatusPill status={done ? 'Approved' : data.status} size="md" />
      </div>

      {done && (
        <Banner tone="success" title="Concurrence recorded and signed">
          The requisition returns to {data.departmentName} with your decision and remarks attached.
        </Banner>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card title="Requisition summary" bodyClassName="p-0">
            <dl className="grid gap-x-6 gap-y-3 p-4 sm:grid-cols-3">
              <Row label="Department" value={data.departmentName} />
              <Row label="Nodal Officer" value={data.nodalOfficer} />
              <Row label="Submitted on" value={data.submittedOn} />
              <Row label="Post" value={post?.name ?? '—'} />
              <Row label="Classification" value={post?.classification ?? '—'} />
              <Row label="Pay level" value={post?.payLevel ?? '—'} />
              <Row label="Sanctioned strength" value={String(post?.sanctionedStrength ?? '—')} />
              <Row label="Available strength" value={String(post?.availableStrength ?? '—')} />
              <Row label="Vacancies requested" value={String(data.totalPosts)} />
            </dl>
          </Card>

          <Card title="Estimated financial implication">
            <dl className="grid gap-3 sm:grid-cols-3">
              <Stat label="Per post (annual)" value="₹ 4,80,000" />
              <Stat label="Posts" value={String(data.totalPosts)} />
              <Stat label="Total (annual)" value={`₹ ${annualCost.toLocaleString('en-IN')}`} emphasis />
            </dl>
            <p className="mt-3 text-[12px] text-grey-600">
              Computed from the pay level in the post master. Allowances and employer contributions
              are estimated at the standard departmental rate.
            </p>
          </Card>

          <Card title="Supporting documents">
            <ul className="space-y-2">
              {['Requisition (signed PDF)', 'Recruitment Rules extract', 'Reservation matrix', 'Departmental checklist'].map(
                (document) => (
                  <li
                    key={document}
                    className="flex items-center gap-2 rounded-md border border-grey-200 px-3 py-2 text-[13px]"
                  >
                    <FileText className="size-4 shrink-0 text-grey-600" />
                    <span className="min-w-0 flex-1 truncate">{document}</span>
                    <Button variant="ghost" size="sm">
                      Preview
                    </Button>
                  </li>
                ),
              )}
            </ul>
          </Card>

          {!done && (
            <Card title="Decision">
              <div className="space-y-3">
                {error && <Banner tone="danger">{error}</Banner>}

                <div className="grid gap-2 sm:grid-cols-3">
                  {DECISIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setDecision(option)
                        setError(null)
                      }}
                      aria-pressed={decision === option}
                      className={cn(
                        'rounded-md border px-3 py-2.5 text-left text-[13px] font-medium transition-colors',
                        decision === option
                          ? option === 'Return for clarification'
                            ? 'border-amber-500 bg-amber-050 text-amber-500'
                            : 'border-green-600 bg-green-050 text-green-600'
                          : 'border-grey-200 text-navy-900 hover:bg-grey-050',
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <Field label="Remarks" required hint="Recorded in the workflow trail and shown to the department.">
                  <Textarea
                    value={remarks}
                    onChange={(event) => {
                      setRemarks(event.target.value)
                      setError(null)
                    }}
                    placeholder={
                      decision === 'Concur with conditions'
                        ? 'State the conditions attached to this concurrence.'
                        : decision === 'Return for clarification'
                          ? 'State what the department must clarify.'
                          : 'Note the provision against which concurrence is given.'
                    }
                  />
                </Field>

                <Button onClick={submit}>Sign &amp; record decision</Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <SummaryPanel
            title="Request"
            rows={[
              { label: 'Requisition No.', value: data.requisitionNo },
              { label: 'Route', value: data.financeRoute },
              { label: 'Current status', value: done ? 'Concurred' : data.financeStatus },
              { label: 'Due on', value: data.dueOn },
              { label: 'Signed by (department)', value: data.signedBy ?? 'Not signed' },
            ]}
          />

          <Card title="Workflow trail">
            <WorkflowTrail steps={data.trail} />
          </Card>
        </div>
      </div>

      <DigitalSignModal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        signerName={staff?.name ?? 'Officer'}
        artefact={`Finance concurrence — ${data.requisitionNo} (${decision})`}
        checkpoint="Inter-department workflow — concurrence for direct recruitment (Ref. 15)"
        onSigned={() => {
          setDone(true)
          reload()
        }}
      />
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

function Stat({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={cn('rounded-md px-3 py-2.5', emphasis ? 'bg-navy-900 text-white' : 'bg-grey-050')}>
      <dt className={cn('text-[12px]', emphasis ? 'text-white/70' : 'text-grey-600')}>{label}</dt>
      <dd className="text-[18px] font-semibold">{value}</dd>
    </div>
  )
}
