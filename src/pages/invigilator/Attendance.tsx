import {
  BadgeCheck,
  Camera,
  Fingerprint,
  Keyboard,
  Mic,
  QrCode,
  RefreshCcw,
  ScanFace,
  TriangleAlert,
  WifiOff,
} from 'lucide-react'
import { useState } from 'react'

import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Field, ProgressBar, Select, Textarea } from '@/components/common/primitives'
import { SkeletonCards } from '@/components/common/states'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/mock/api'
import { cn } from '@/utils/cn'

/**
 * Ref. 47, 48 — attendance capture.
 *
 * Capture sequence: QR → photo → voice → fingerprint → Aadhaar face auth.
 * Each step is skippable with a logged reason, because a device failure must
 * not bar a candidate from the exam. Records taken on paper are entered
 * manually and flagged `Manually Entered` so the audit trail distinguishes them.
 */

const CAPTURE_STEPS = [
  { id: 'qr', label: 'Scan QR from admit card', icon: QrCode },
  { id: 'photo', label: 'Live photo of candidate', icon: Camera },
  { id: 'voice', label: 'Voice sample', icon: Mic },
  { id: 'fingerprint', label: 'Fingerprint', icon: Fingerprint },
  { id: 'face', label: 'Aadhaar face authentication', icon: ScanFace },
]

export default function InvigilatorAttendance() {
  const { data, isLoading, reload } = useAsync(() => api.attendance(), 'attendance')
  const [hallId, setHallId] = useState('hall-3')
  const [capturing, setCapturing] = useState(false)
  const [step, setStep] = useState(0)
  const [skipped, setSkipped] = useState<Record<string, string>>({})
  const [skipping, setSkipping] = useState<string | null>(null)
  const [skipReason, setSkipReason] = useState('')
  const [verdict, setVerdict] = useState<'Verified' | 'Mismatch' | null>(null)
  const [manualOpen, setManualOpen] = useState(false)

  if (isLoading) return <SkeletonCards />

  const records = (data ?? []).filter((record) => record.hallId === hallId)
  const present = records.filter((record) => record.verdict !== 'Absent').length
  const pendingSync = records.filter((record) => record.capturedAt && !record.synced).length

  function completeCapture() {
    setVerdict(Object.keys(skipped).length > 1 ? 'Mismatch' : 'Verified')
  }

  function reset() {
    setCapturing(false)
    setStep(0)
    setSkipped({})
    setVerdict(null)
    reload()
  }

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Attendance Capture</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Present {present} of {records.length} · driven from the invigilator device at the door
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            aria-label="Select hall"
            className="w-auto"
            value={hallId}
            onChange={(event) => setHallId(event.target.value)}
          >
            {['hall-1', 'hall-2', 'hall-3', 'hall-4', 'hall-5'].map((id, index) => (
              <option key={id} value={id}>
                Hall {index + 1}
              </option>
            ))}
          </Select>
          <Button variant="secondary" onClick={() => setManualOpen(true)}>
            <Keyboard className="size-4" />
            Manual entry
          </Button>
          <Button
            onClick={() => {
              setCapturing(true)
              setStep(0)
              setSkipped({})
              setVerdict(null)
            }}
          >
            <QrCode className="size-4" />
            Scan QR
          </Button>
        </div>
      </div>

      <Banner
        tone={pendingSync > 0 ? 'warning' : 'success'}
        icon={pendingSync > 0 ? <WifiOff className="size-4" /> : <RefreshCcw className="size-4" />}
        title={pendingSync > 0 ? `${pendingSync} records pending sync` : 'All records synced'}
        action={
          <Button variant="secondary" size="sm">
            <RefreshCcw className="size-3.5" />
            Sync now
          </Button>
        }
      >
        Captures are written locally first and pushed when connectivity returns. If the same
        candidate is captured twice — for instance on two devices — the conflict is raised to the
        Centre Supervisor rather than silently resolved.
      </Banner>

      <Card title={`Hall ${hallId.slice(-1)} — capture log`} bodyClassName="p-0">
        <div className="border-b border-grey-200 px-4 py-3">
          <ProgressBar value={(present / Math.max(1, records.length)) * 100} showLabel tone="green" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-grey-200 bg-grey-050">
              {['Roll No.', 'Candidate', 'Seat', 'Captured', 'Method', 'Verdict', 'Sync'].map(
                (header) => (
                  <th key={header} className="px-4 py-2 text-left text-[12px] font-semibold uppercase">
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.ref} className="border-b border-grey-200 last:border-b-0">
                <td className="data-cell font-mono text-[12px]">{record.rollNo}</td>
                <td className="data-cell">{record.candidateName}</td>
                <td className="data-cell">{record.seatSeq}</td>
                <td className="data-cell">{record.capturedAt ?? '—'}</td>
                <td className="data-cell">
                  {record.method === 'Manually Entered' ? (
                    <StatusPill status="Manually Entered" />
                  ) : (
                    <span className="text-[12px] text-grey-600">{record.method ?? '—'}</span>
                  )}
                </td>
                <td className="data-cell">
                  <span
                    className={cn(
                      'text-[13px] font-medium',
                      record.verdict === 'Verified'
                        ? 'text-green-600'
                        : record.verdict === 'Mismatch'
                          ? 'text-red-600'
                          : 'text-grey-600',
                    )}
                  >
                    {record.verdict}
                  </span>
                </td>
                <td className="data-cell">
                  {record.capturedAt ? (
                    record.synced ? (
                      <span className="text-[12px] text-green-600">Synced</span>
                    ) : (
                      <span className="text-[12px] text-amber-500">Pending</span>
                    )
                  ) : (
                    <span className="text-[12px] text-grey-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Capture sequence */}
      <Modal
        open={capturing}
        onClose={reset}
        title={verdict ? 'Verification result' : 'Capture attendance'}
        description={verdict ? undefined : `Step ${step + 1} of ${CAPTURE_STEPS.length}`}
        footer={
          verdict ? (
            <Button variant={verdict === 'Verified' ? 'success' : 'danger'} onClick={reset}>
              {verdict === 'Verified' ? 'Next candidate' : 'Refer to Centre Supervisor'}
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setSkipping(CAPTURE_STEPS[step].id)}>
                Skip this step
              </Button>
              <Button
                onClick={() => {
                  if (step === CAPTURE_STEPS.length - 1) completeCapture()
                  else setStep((value) => value + 1)
                }}
              >
                Capture &amp; continue
              </Button>
            </>
          )
        }
      >
        {verdict ? (
          <div
            className={cn(
              'flex flex-col items-center gap-3 rounded-md py-8 text-center',
              verdict === 'Verified' ? 'bg-green-050' : 'bg-red-050',
            )}
          >
            {verdict === 'Verified' ? (
              <BadgeCheck className="size-14 text-green-600" strokeWidth={1.5} />
            ) : (
              <TriangleAlert className="size-14 text-red-600" strokeWidth={1.5} />
            )}
            <p
              className={cn(
                'text-[24px] font-semibold',
                verdict === 'Verified' ? 'text-green-600' : 'text-red-600',
              )}
            >
              {verdict}
            </p>
            <p className="text-[13px] text-navy-900">Ramesh Kumar · APP20240012345 · Seat 14</p>
            {verdict === 'Mismatch' && (
              <p className="max-w-sm text-[13px] text-red-600">
                Fingerprint and Aadhaar face authentication both failed. Refer the candidate to the
                Centre Supervisor — do not turn them away.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <ol className="space-y-2">
              {CAPTURE_STEPS.map((captureStep, index) => {
                const Icon = captureStep.icon
                const done = index < step
                const wasSkipped = Boolean(skipped[captureStep.id])
                return (
                  <li
                    key={captureStep.id}
                    className={cn(
                      'flex items-start gap-3 rounded-md border px-3 py-2.5',
                      index === step
                        ? 'border-navy-700 bg-blue-050'
                        : 'border-grey-200',
                    )}
                  >
                    <Icon
                      className={cn(
                        'mt-0.5 size-4 shrink-0',
                        wasSkipped
                          ? 'text-amber-500'
                          : done
                            ? 'text-green-600'
                            : index === step
                              ? 'text-navy-700'
                              : 'text-grey-600',
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-navy-900">{captureStep.label}</p>
                      {wasSkipped && (
                        <p className="text-[12px] text-amber-500">Skipped — {skipped[captureStep.id]}</p>
                      )}
                    </div>
                    {done && !wasSkipped && (
                      <span className="text-[12px] text-green-600">Captured</span>
                    )}
                  </li>
                )
              })}
            </ol>

            <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-grey-300 bg-grey-050">
              <p className="text-[13px] text-grey-600">
                {CAPTURE_STEPS[step].label} — device viewfinder
              </p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={skipping !== null}
        onClose={() => setSkipping(null)}
        title="Skip this capture step?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSkipping(null)}>
              Back
            </Button>
            <Button
              disabled={!skipReason.trim()}
              onClick={() => {
                setSkipped((previous) => ({ ...previous, [skipping!]: skipReason.trim() }))
                setSkipping(null)
                setSkipReason('')
                if (step === CAPTURE_STEPS.length - 1) completeCapture()
                else setStep((value) => value + 1)
              }}
            >
              Skip with reason
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Banner tone="info">
            A device failure must never bar a candidate from the exam. The skip is logged with your
            reason against the capture record.
          </Banner>
          <Field label="Reason" required>
            <Textarea
              value={skipReason}
              onChange={(event) => setSkipReason(event.target.value)}
              placeholder="e.g. Fingerprint scanner not reading — candidate has a hand injury"
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        title="Manual attendance entry"
        description="Ref. 48 — where attendance was taken on paper."
        footer={
          <>
            <Button variant="secondary" onClick={() => setManualOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setManualOpen(false)}>Record as Manually Entered</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Banner tone="warning">
            Records entered this way are flagged <strong>Manually Entered</strong> so the audit trail
            distinguishes them from biometric captures.
          </Banner>
          <Field label="Seat numbers present" hint="Comma-separated, from the paper seat list.">
            <Textarea placeholder="01, 02, 05, 07, 09, 11…" />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
