import { RotateCcw, SlidersHorizontal, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

import { TrendChart } from '@/components/charts'
import { Modal } from '@/components/common/Modal'
import { Banner, Button, Card, Field, Select } from '@/components/common/primitives'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

type Method = 'Linear Normalization' | 'Percentile' | 'Equi-percentile'

const SESSIONS = [
  { label: 'Session 1 (Morning)', mean: 50.21, sd: 10.35, candidates: 6245 },
  { label: 'Session 2 (Evening)', mean: 48.76, sd: 9.84, candidates: 6213 },
]

/**
 * Normalization is not in the RFP text — it is in the demo deck (slide 3,
 * evaluator step 3). Built as configurable and skippable, versioned, and
 * reversible right up until merit generation.
 */
export default function Normalization() {
  const { can } = useAuth()
  const [method, setMethod] = useState<Method>('Linear Normalization')
  const [applied, setApplied] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [skipped, setSkipped] = useState(false)

  const distribution = Array.from({ length: 11 }, (_, index) => {
    const mark = index * 10
    const before = Math.round(1200 * Math.exp(-(((mark - 50) / 22) ** 2)))
    const after = Math.round(1200 * Math.exp(-(((mark - 49.5) / 20) ** 2)))
    return { mark: `${mark}`, before, after: applied ? after : before }
  })

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Normalization</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Assistant Grade-II Examination 2024 · two sessions across 12,458 candidates
          </p>
        </div>
        {!applied && !skipped && (
          <Button variant="secondary" onClick={() => setSkipped(true)}>
            Skip normalization for this exam
          </Button>
        )}
      </div>

      {skipped ? (
        <Banner
          tone="neutral"
          title="Normalization explicitly skipped"
          action={
            <Button variant="secondary" size="sm" onClick={() => setSkipped(false)}>
              Undo
            </Button>
          }
        >
          Raw marks will feed merit generation. The skip is recorded so the evaluation completion
          checklist can show it as an explicit decision rather than an omission.
        </Banner>
      ) : applied ? (
        <Banner
          tone="success"
          title="Normalization applied — version 1"
          action={
            <Button variant="secondary" size="sm" onClick={() => setApplied(false)}>
              <RotateCcw className="size-3.5" />
              Revert
            </Button>
          }
        >
          Reversible until merit generation starts. After that, reverting requires the merit list to
          be regenerated.
        </Banner>
      ) : (
        <Banner tone="warning" icon={<TriangleAlert className="size-4" />} title="Confirm the formula with PEA">
          The RFP does not mandate a normalization formula. Getting this wrong is litigable — confirm
          the method and its parameters in writing before the first live run.
        </Banner>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Card title="Method & session statistics">
          <div className="space-y-4">
            <Field label="Normalization Method" required>
              <Select
                value={method}
                disabled={applied || skipped}
                onChange={(event) => setMethod(event.target.value as Method)}
              >
                {(['Linear Normalization', 'Percentile', 'Equi-percentile'] as Method[]).map(
                  (option) => (
                    <option key={option}>{option}</option>
                  ),
                )}
              </Select>
            </Field>

            {SESSIONS.map((session) => (
              <div key={session.label} className="rounded-md border border-grey-200 p-3">
                <p className="text-[13px] font-semibold text-navy-900">{session.label}</p>
                <dl className="mt-2 grid grid-cols-3 gap-2">
                  <Stat label="Mean" value={session.mean.toFixed(2)} />
                  <Stat label="SD" value={session.sd.toFixed(2)} />
                  <Stat label="Candidates" value={session.candidates.toLocaleString('en-IN')} />
                </dl>
              </div>
            ))}

            <Button
              className="w-full"
              disabled={!can('normalization.apply') || applied || skipped}
              onClick={() => setConfirming(true)}
            >
              <SlidersHorizontal className="size-4" />
              Apply Normalization
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Distribution — before and after">
            <TrendChart
              data={distribution}
              xKey="mark"
              series={[
                { key: 'before', label: 'Before', color: '#5A6B85' },
                { key: 'after', label: 'After', color: '#6B3FA0' },
              ]}
              height={240}
            />
          </Card>

          <Card title="Impact summary">
            <dl className="grid gap-3 sm:grid-cols-3">
              <Impact label="Candidates whose rank moved" value={applied ? '4,182' : '—'} />
              <Impact
                label="Crossing the qualifying threshold"
                value={applied ? '+312' : '—'}
                tone="success"
              />
              <Impact
                label="Falling below the threshold"
                value={applied ? '−287' : '—'}
                tone="danger"
              />
            </dl>
            <p className="mt-3 text-[12px] text-grey-600">
              {applied
                ? 'Every figure above is recomputed on each run and stored against this version.'
                : 'Apply normalization to see the rank movement and threshold crossings.'}
            </p>
          </Card>
        </div>
      </div>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Apply normalization?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setApplied(true)
                setConfirming(false)
              }}
            >
              Apply and version
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-[13px]">
          <p>
            Method: <strong>{method}</strong> across 2 sessions and 12,458 candidates.
          </p>
          <Banner tone="info">
            This run is versioned and reversible until merit generation begins. Marks are carried at
            4 decimal places throughout — no rounding is applied at this stage.
          </Banner>
        </div>
      </Modal>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] text-grey-600">{label}</dt>
      <dd className="font-mono text-[14px] font-semibold text-navy-900">{value}</dd>
    </div>
  )
}

function Impact({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'success' | 'danger'
}) {
  return (
    <div className="rounded-md bg-grey-050 px-3 py-2.5">
      <dt className="text-[12px] text-grey-600">{label}</dt>
      <dd
        className={cn(
          'text-[18px] font-semibold',
          tone === 'success' ? 'text-green-600' : tone === 'danger' ? 'text-red-600' : 'text-navy-900',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
