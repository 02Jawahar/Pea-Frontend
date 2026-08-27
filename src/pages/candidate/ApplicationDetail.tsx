import { AlertTriangle, ArrowLeft, Download, Ban, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { WorkflowTrail } from '@/components/common/WorkflowTrail'
import { Banner, Button, Card } from '@/components/common/primitives'
import { EmptyState, ErrorState, SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { api, seed } from '@/mock/api'
import type { Application } from '@/types'
import { cn } from '@/utils/cn'

/**
 * Withdraw (Ref. 31) and Cancel (Ref. 32) are two different things and must not
 * be merged into one button. After the last date both disappear — replaced by a
 * disabled control with a reason tooltip.
 */
export default function CandidateApplicationDetail() {
  const { id = '' } = useParams()
  const { data, isLoading, error, reload } = useAsync(() => api.application(id), id)
  const [action, setAction] = useState<'withdraw' | 'cancel' | null>(null)
  const [busy, setBusy] = useState(false)

  if (isLoading) return <SkeletonCards />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!data) {
    return (
      <Card>
        <EmptyState
          title="Application not found"
          description="This application number does not belong to your account."
          action={
            <Link to={ROUTES.CANDIDATE_APPLICATIONS}>
              <Button variant="secondary">Back to my applications</Button>
            </Link>
          }
        />
      </Card>
    )
  }

  const lastDate = '2024-05-20'
  const windowOpen = seed.DEMO_TODAY <= lastDate
  const terminal = ['Withdrawn', 'Cancelled', 'Rejected'].includes(data.status)
  const canAct = windowOpen && !terminal

  async function confirm() {
    if (!action) return
    setBusy(true)
    await (action === 'withdraw' ? api.withdrawApplication(id) : api.cancelApplication(id))
    setBusy(false)
    setAction(null)
    reload()
  }

  return (
    <div className="page">
      <Link
        to={ROUTES.CANDIDATE_APPLICATIONS}
        className="inline-flex items-center gap-1.5 text-[13px] text-navy-700 hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        My Applications
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">{data.postName}</h1>
          <p className="mt-0.5 font-mono text-[13px] text-grey-600">{data.applicationNo}</p>
        </div>
        <StatusPill status={data.status} size="md" />
      </div>

      {data.courtCase && (
        <Banner tone="warning" title="Admitted under court direction">
          This application bypassed scrutiny under a court direction. Your admit card is issued
          directly; the bypass is recorded in the status trail below.
        </Banner>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card title="Application Summary" bodyClassName="p-0">
            <dl className="grid gap-x-6 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              <Row label="Candidate" value={data.candidateName} />
              <Row label="Post Applied For" value={data.postName} />
              <Row label="Department" value={data.departmentName} />
              <Row label="Category" value={data.category} />
              <Row label="Question Paper Language" value={data.paperLanguage} />
              <Row label="Exam Centre Preference" value={data.centrePreference} />
              <Row label="Submitted On" value={data.submittedOn ?? 'Not submitted'} />
              <Row
                label="Fee"
                value={data.feePaid ? `Paid — ₹${data.feeAmount}` : `Pending — ₹${data.feeAmount}`}
              />
            </dl>
          </Card>

          <Card title="Status Trail">
            <WorkflowTrail steps={data.trail} />
          </Card>

          <PaymentAttempts application={data} />

          {data.scrutinyRemarks && (
            <Banner tone="danger" title="Scrutiny remarks">
              {data.scrutinyRemarks}
            </Banner>
          )}
        </div>

        <div className="space-y-4">
          <Card title="Actions">
            {terminal ? (
              <Banner tone="neutral">
                This application is {data.status.toLowerCase()}. No further action is available.
              </Banner>
            ) : !windowOpen ? (
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  disabled
                  className="w-full"
                  title={`The last date for submission was ${lastDate}. Withdrawal and cancellation close with it.`}
                >
                  <Undo2 className="size-4" />
                  Withdraw Application
                </Button>
                <Button
                  variant="secondary"
                  disabled
                  className="w-full"
                  title={`The last date for submission was ${lastDate}.`}
                >
                  <Ban className="size-4" />
                  Cancel Application
                </Button>
                <p className="text-[12px] text-grey-600">
                  Both actions closed on {lastDate}, the last date of application submission.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={!canAct}
                    onClick={() => setAction('withdraw')}
                  >
                    <Undo2 className="size-4" />
                    Withdraw Application
                  </Button>
                  <p className="mt-1 text-[12px] text-grey-600">
                    You may re-submit before the last date. Your fee is retained and linked to the
                    new reference.
                  </p>
                </div>

                <div className="border-t border-grey-200 pt-3">
                  <Button
                    variant="danger"
                    className="w-full"
                    disabled={!canAct}
                    onClick={() => setAction('cancel')}
                  >
                    <Ban className="size-4" />
                    Cancel Application
                  </Button>
                  <p className="mt-1 text-[12px] text-grey-600">
                    Cancellation is final — you cannot re-submit for this post. Refund follows the
                    configured refund rule.
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card title="Downloads">
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start">
                <Download className="size-4" />
                Application form (PDF)
              </Button>
              {data.feePaid && (
                <Button variant="secondary" className="w-full justify-start">
                  <Download className="size-4" />
                  Fee receipt (PDF)
                </Button>
              )}
              {data.status === 'Shortlisted' && (
                <Link to={ROUTES.CANDIDATE_ADMIT_CARD}>
                  <Button variant="success" className="w-full justify-start">
                    <Download className="size-4" />
                    Admit card
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={action !== null}
        onClose={() => setAction(null)}
        title={action === 'withdraw' ? 'Withdraw this application?' : 'Cancel this application?'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAction(null)}>
              Keep application
            </Button>
            <Button
              variant={action === 'cancel' ? 'danger' : 'primary'}
              isLoading={busy}
              onClick={confirm}
            >
              {action === 'withdraw' ? 'Withdraw' : 'Cancel application'}
            </Button>
          </>
        }
      >
        {action === 'withdraw' ? (
          <div className="space-y-3 text-[13px]">
            <p>
              Your application will be marked <strong>Withdrawn</strong>. You may submit a fresh
              application for this post until <strong>{lastDate}</strong>.
            </p>
            <Banner tone="info">
              Your fee of ₹{data.feeAmount} is retained and will be linked to the newest application
              reference. Re-submission requires preview and a digital signature again.
            </Banner>
          </div>
        ) : (
          <div className="space-y-3 text-[13px]">
            <p>
              Your application will be marked <strong>Cancelled</strong>. You will{' '}
              <strong>not</strong> be able to submit again for this post.
            </p>
            <Banner tone="warning" icon={<AlertTriangle className="size-4" />} title="Refund rule RF-02 applies">
              Cancellation before the last date refunds the application fee less a ₹50 processing
              charge, credited to the source account within 7 working days.
            </Banner>
          </div>
        )}
      </Modal>
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

/** Ref. 29 — all unsuccessful attempts must be listed to the candidate. */
function PaymentAttempts({ application }: { application: Application }) {
  return (
    <Card title="Payment Attempts" bodyClassName="p-0">
      <table className="w-full">
        <thead>
          <tr className="border-b border-grey-200 bg-grey-050">
            <th className="px-4 py-2 text-left text-[12px] font-semibold uppercase">Timestamp</th>
            <th className="px-4 py-2 text-left text-[12px] font-semibold uppercase">Mode</th>
            <th className="px-4 py-2 text-left text-[12px] font-semibold uppercase">
              Gateway Reference
            </th>
            <th className="px-4 py-2 text-left text-[12px] font-semibold uppercase">Status</th>
            <th className="px-4 py-2 text-right text-[12px] font-semibold uppercase">Amount</th>
          </tr>
        </thead>
        <tbody>
          {application.paymentAttempts.map((attempt) => (
            <tr key={attempt.gatewayRef} className="border-b border-grey-200 last:border-b-0">
              <td className="data-cell">{attempt.timestamp}</td>
              <td className="data-cell">{attempt.mode}</td>
              <td className="data-cell font-mono text-[12px]">{attempt.gatewayRef}</td>
              <td className="data-cell">
                <span
                  className={cn(
                    'font-medium',
                    attempt.status === 'Success'
                      ? 'text-green-600'
                      : attempt.status === 'Pending'
                        ? 'text-amber-500'
                        : 'text-red-600',
                  )}
                >
                  {attempt.status}
                </span>
              </td>
              <td className="data-cell text-right">₹{attempt.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
