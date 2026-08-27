import { EyeOff, Search } from 'lucide-react'
import { useState } from 'react'

import { OtpModal } from '@/components/common/OtpModal'
import { StatusPill } from '@/components/common/StatusPill'
import { WorkflowTrail } from '@/components/common/WorkflowTrail'
import { Banner, Button, Card, Field, Input } from '@/components/common/primitives'
import { seed } from '@/mock/api'
import type { Application } from '@/types'

/**
 * Ref. 36 — public status lookup: Application Number + OTP to the registered
 * mobile. Returns status only, never personal data.
 */
export default function TrackApplication() {
  const [applicationNo, setApplicationNo] = useState('')
  const [otpOpen, setOtpOpen] = useState(false)
  const [result, setResult] = useState<Application | null>(null)
  const [error, setError] = useState<string | null>(null)

  function lookup() {
    const match = seed.applications.find(
      (application) => application.applicationNo === applicationNo.trim(),
    )
    if (!match) {
      setError('No application matches that number.')
      return
    }
    setError(null)
    setOtpOpen(true)
  }

  return (
    <div className="page mx-auto w-full max-w-3xl">
      <div>
        <h1 className="page-title">Track your application</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          No login needed. Enter your Application Number and confirm the OTP sent to your registered
          mobile number.
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Application Number" required className="min-w-64 flex-1">
            <Input
              value={applicationNo}
              onChange={(event) => {
                setApplicationNo(event.target.value)
                setError(null)
              }}
              onKeyDown={(event) => event.key === 'Enter' && lookup()}
              placeholder={seed.applications[0].applicationNo}
              className="font-mono"
            />
          </Field>
          <Button onClick={lookup}>
            <Search className="size-4" />
            Send OTP
          </Button>
        </div>

        {error && (
          <p className="mt-2 text-[13px] text-red-600" role="alert">
            {error}
          </p>
        )}

        <Banner tone="info" className="mt-3">
          Demo — try <span className="font-mono">{seed.applications[0].applicationNo}</span> with OTP{' '}
          <span className="font-mono">123456</span>.
        </Banner>
      </Card>

      {result && (
        <>
          <Card
            title="Application status"
            action={<StatusPill status={result.status} size="md" />}
          >
            <dl className="grid gap-3 sm:grid-cols-3">
              <Row label="Application Number" value={result.applicationNo} mono />
              <Row label="Post applied for" value={result.postName} />
              <Row label="Department" value={result.departmentName} />
              <Row label="Submitted on" value={result.submittedOn ?? '—'} />
              <Row label="Fee" value={result.feePaid ? 'Paid' : 'Pending'} />
              <Row label="Current stage" value={result.status} />
            </dl>
          </Card>

          <Card title="Status trail">
            <WorkflowTrail steps={result.trail} />
          </Card>

          <Banner tone="neutral" icon={<EyeOff className="size-4" />} title="Status only">
            Public tracking never returns personal data — no name, no address, no documents. Sign in
            to the Candidate Portal to see the full application.
          </Banner>
        </>
      )}

      <OtpModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onVerified={() => {
          setResult(
            seed.applications.find(
              (application) => application.applicationNo === applicationNo.trim(),
            ) ?? null,
          )
          setOtpOpen(false)
        }}
        destination="registered mobile"
        purpose="application tracking"
      />
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[12px] text-grey-600">{label}</dt>
      <dd className={`text-[13px] font-medium text-navy-900 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}
