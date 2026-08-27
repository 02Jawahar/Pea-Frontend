import { ArrowLeft, BadgeCheck, Download, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Banner, Button, Card } from '@/components/common/primitives'
import { EmptyState, SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/mock/api'
import type { PaymentAttempt } from '@/types'
import { cn } from '@/utils/cn'

const MODES: PaymentAttempt['mode'][] = ['Net Banking', 'Debit / Credit Card', 'UPI', 'Wallet']

/** Ref. 29 — fee payment, with every attempt listed and a status re-query path. */
export default function CandidatePayment() {
  const { id = '' } = useParams()
  const { data, isLoading, reload } = useAsync(() => api.application(id), id)
  const [mode, setMode] = useState<PaymentAttempt['mode']>('Net Banking')
  const [phase, setPhase] = useState<'choose' | 'paying' | 'unknown' | 'done'>('choose')
  const navigate = useNavigate()

  if (isLoading) return <SkeletonCards />
  if (!data) {
    return (
      <Card>
        <EmptyState title="Application not found" description="Check the link and try again." />
      </Card>
    )
  }

  // Fee can be disabled entirely per post — then this step is skipped, not shown as ₹0.
  if (data.feeAmount === 0) {
    return (
      <Card>
        <EmptyState
          title="No fee is payable for this post"
          description="The fee has been waived for this recruitment. Continue to submit your application."
          action={
            <Link to={ROUTES.CANDIDATE_APPLICATION(id)}>
              <Button>Back to application</Button>
            </Link>
          }
        />
      </Card>
    )
  }

  async function pay() {
    setPhase('paying')
    await api.payFee(id, mode)
    setPhase('done')
    reload()
  }

  const successAttempt = data.paymentAttempts.find((attempt) => attempt.status === 'Success')

  return (
    <div className="page mx-auto w-full max-w-4xl">
      <Link
        to={ROUTES.CANDIDATE_APPLICATION(id)}
        className="inline-flex items-center gap-1.5 text-[13px] text-navy-700 hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Back to application
      </Link>

      <h1 className="page-title">Fee Payment</h1>

      {(phase === 'done' || data.feePaid) && successAttempt ? (
        <Card>
          <div className="space-y-4">
            <Banner tone="success" icon={<BadgeCheck className="size-4" />} title="Payment Successful">
              Your application fee has been paid successfully.
            </Banner>

            <dl className="divide-y divide-grey-200 rounded-md border border-grey-200">
              <Receipt label="Application ID" value={data.applicationNo} mono />
              <Receipt label="Amount Paid" value={`₹ ${successAttempt.amount.toFixed(2)}`} />
              <Receipt label="Payment Mode" value={successAttempt.mode} />
              <Receipt label="Transaction ID" value={successAttempt.gatewayRef} mono />
              <Receipt label="Payment Date" value={successAttempt.timestamp} />
            </dl>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary">
                <Download className="size-4" />
                Download Receipt
              </Button>
              <Button onClick={() => navigate(ROUTES.CANDIDATE_APPLICATION(id))}>
                Continue to application
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Card title="Payment">
            <div className="space-y-4">
              <dl className="grid gap-3 sm:grid-cols-2">
                <Receipt label="Application ID" value={data.applicationNo} mono flat />
                <Receipt label="Amount Payable" value={`₹ ${data.feeAmount.toFixed(2)}`} flat />
              </dl>

              <fieldset>
                <legend className="field-label">Payment Options</legend>
                <div className="space-y-2">
                  {MODES.map((option) => (
                    <label
                      key={option}
                      className={cn(
                        'flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-[13px]',
                        mode === option ? 'border-navy-700 bg-blue-050' : 'border-grey-200',
                      )}
                    >
                      <input
                        type="radio"
                        name="mode"
                        checked={mode === option}
                        onChange={() => setMode(option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              {phase === 'unknown' && (
                <Banner tone="warning" title="We're confirming this payment with your bank">
                  <p>This usually takes a few minutes. Do not pay again — use the button below to
                  re-query the gateway.</p>
                  <Button variant="secondary" size="sm" className="mt-2" onClick={pay}>
                    <RefreshCcw className="size-3.5" />
                    Check payment status
                  </Button>
                </Banner>
              )}

              <div className="flex flex-wrap gap-2">
                <Button className="flex-1" isLoading={phase === 'paying'} onClick={pay}>
                  Pay Now
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setPhase('unknown')}
                  title="Simulate money debited but the gateway status not yet known"
                >
                  Simulate a pending outcome
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Previous Attempts" bodyClassName="p-0">
            <ul className="divide-y divide-grey-200">
              {data.paymentAttempts.map((attempt) => (
                <li key={attempt.gatewayRef} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-medium text-navy-900">{attempt.mode}</span>
                    <span
                      className={cn(
                        'text-[12px] font-medium',
                        attempt.status === 'Success' ? 'text-green-600' : 'text-red-600',
                      )}
                    >
                      {attempt.status}
                    </span>
                  </div>
                  <p className="font-mono text-[12px] text-grey-600">{attempt.gatewayRef}</p>
                  <p className="text-[12px] text-grey-600">{attempt.timestamp}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  )
}

function Receipt({
  label,
  value,
  mono,
  flat,
}: {
  label: string
  value: string
  mono?: boolean
  flat?: boolean
}) {
  if (flat) {
    return (
      <div>
        <dt className="text-[12px] text-grey-600">{label}</dt>
        <dd className={cn('text-[15px] font-semibold text-navy-900', mono && 'font-mono text-[13px]')}>
          {value}
        </dd>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
      <dt className="text-[13px] text-grey-600">{label}</dt>
      <dd className={cn('text-[13px] font-medium text-navy-900', mono && 'font-mono text-[12px]')}>
        {value}
      </dd>
    </div>
  )
}
