import { CircleCheck, CircleX, FileWarning, Send, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Field, Input, Select, Tabs, Textarea } from '@/components/common/primitives'
import { SkeletonCards } from '@/components/common/states'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/mock/api'
import { cn } from '@/utils/cn'

type TabId = 'key' | 'raised' | 'outcome'

interface Draft {
  qNo: number
  type: string
  reason: string
}

const OBJECTION_TYPES = [
  'More than one option is correct',
  'No option is correct',
  'Question is out of syllabus',
  'Question is ambiguous',
  'Translation changes the meaning',
]

/**
 * §2.4.4 — the candidate side of the answer key challenge.
 *
 * Provisional key beside the candidate's own responses, objections raised per
 * question into a cart, one submission, then a read-only outcome view.
 */
export default function AnswerKeyChallenge() {
  const { data, isLoading } = useAsync(() => api.answerKey(), 'answerKey')
  const [tab, setTab] = useState<TabId>('key')
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [raising, setRaising] = useState<number | null>(null)
  const [type, setType] = useState('')
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isLoading) return <SkeletonCards />

  const key = (data ?? []).slice(0, 24)
  // The candidate's own responses — deterministic so the demo is stable.
  const responses = key.map((entry, index) =>
    index % 4 === 0 ? null : (['A', 'B', 'C', 'D'] as const)[(entry.qNo + index) % 4],
  )

  const correct = key.filter((entry, index) => responses[index] === entry.correctOption).length
  const wrong = key.filter(
    (entry, index) => responses[index] !== null && responses[index] !== entry.correctOption,
  ).length
  const unattempted = responses.filter((response) => response === null).length

  const OUTCOMES = [
    [23, 'More than one option is correct', 'Accepted', 'Option B accepted alongside the published key. Marks awarded for both.'],
    [47, 'Question is ambiguous', 'Accepted', 'Question dropped. Marks redistributed across the remaining questions.'],
    [15, 'Question is out of syllabus', 'Rejected', 'The topic appears in unit 4 of the published syllabus.'],
  ]

  function addToCart() {
    if (!type) {
      setError('Select an objection type.')
      return
    }
    if (!reason.trim()) {
      setError('State your ground for the objection.')
      return
    }
    setDrafts((previous) => [...previous, { qNo: raising!, type, reason: reason.trim() }])
    setRaising(null)
    setType('')
    setReason('')
    setError(null)
  }

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Answer Key Challenge</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Assistant Grade-II Examination 2024 · General Studies Paper I · Series A · objection window
          closes 27-May-2024
        </p>
      </div>

      <KpiStrip>
        <KpiCard icon={<CircleCheck className="size-5" />} label="Correct" value={correct} tone="green" />
        <KpiCard icon={<CircleX className="size-5" />} label="Incorrect" value={wrong} tone="red" />
        <KpiCard icon={<FileWarning className="size-5" />} label="Unattempted" value={unattempted} tone="amber" />
        <KpiCard
          icon={<ShoppingCart className="size-5" />}
          label="Objections in cart"
          value={drafts.length}
          subLabel={submitted ? 'submitted' : 'not yet submitted'}
          tone="purple"
        />
        <KpiCard
          icon={<CircleCheck className="size-5" />}
          label="Provisional score"
          value={`${(correct - wrong * 0.25).toFixed(2)} / ${key.length}`}
          subLabel="0.25 negative marking"
          tone="blue"
        />
      </KpiStrip>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'key', label: 'Key vs my responses', count: key.length },
          { id: 'raised', label: 'My objections', count: drafts.length },
          { id: 'outcome', label: 'Outcomes', count: OUTCOMES.length },
        ]}
      />

      {tab === 'key' && (
        <div className="grid flex-1 items-start gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(300px,1fr)]">
          <Card title="Provisional answer key" bodyClassName="p-0" className="flex-1">
            <div className="max-h-[32rem] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-grey-200 bg-grey-050">
                    {['Q. No.', 'Key', 'My response', 'Result', ''].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-2 text-left text-[12px] font-semibold uppercase"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {key.map((entry, index) => {
                    const response = responses[index]
                    const isCorrect = response === entry.correctOption
                    const objected = drafts.some((draft) => draft.qNo === entry.qNo)
                    return (
                      <tr
                        key={entry.qNo}
                        className={cn(
                          'border-b border-grey-200 last:border-b-0',
                          objected && 'bg-purple-050',
                        )}
                      >
                        <td className="data-cell font-medium">{entry.qNo}</td>
                        <td className="data-cell">
                          <span className="inline-flex size-6 items-center justify-center rounded bg-grey-100 font-mono text-[12px] font-semibold">
                            {entry.correctOption}
                          </span>
                        </td>
                        <td className="data-cell">
                          {response ? (
                            <span
                              className={cn(
                                'inline-flex size-6 items-center justify-center rounded font-mono text-[12px] font-semibold',
                                isCorrect ? 'bg-green-050 text-green-600' : 'bg-red-050 text-red-600',
                              )}
                            >
                              {response}
                            </span>
                          ) : (
                            <span className="text-[12px] text-grey-600">Not attempted</span>
                          )}
                        </td>
                        <td className="data-cell">
                          {response === null ? (
                            <span className="text-[12px] text-grey-600">—</span>
                          ) : isCorrect ? (
                            <span className="text-[12px] font-medium text-green-600">+1.00</span>
                          ) : (
                            <span className="text-[12px] font-medium text-red-600">−0.25</span>
                          )}
                        </td>
                        <td className="data-cell">
                          {objected ? (
                            <span className="text-[12px] font-medium text-purple-600">In cart</span>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={submitted}
                              onClick={() => {
                                setRaising(entry.qNo)
                                setType('')
                                setReason('')
                                setError(null)
                              }}
                            >
                              Raise objection
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <Card title="Objection cart" bodyClassName="p-0">
              {drafts.length === 0 ? (
                <p className="px-4 py-6 text-center text-[13px] text-grey-600">
                  No objections added yet. Raise one against any question, then submit them all
                  together.
                </p>
              ) : (
                <ul className="divide-y divide-grey-200">
                  {drafts.map((draft) => (
                    <li key={draft.qNo} className="px-4 py-2.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[13px] font-medium text-navy-900">Q. {draft.qNo}</p>
                        {!submitted && (
                          <button
                            type="button"
                            onClick={() =>
                              setDrafts((previous) => previous.filter((item) => item.qNo !== draft.qNo))
                            }
                            className="text-[12px] text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="clamp-2 text-[12px] text-grey-600">{draft.type}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Submit">
              {submitted ? (
                <Banner tone="success" title="Objections submitted">
                  {drafts.length} objection{drafts.length === 1 ? '' : 's'} recorded. Outcomes appear
                  under the Outcomes tab once the window closes.
                </Banner>
              ) : (
                <>
                  <dl className="space-y-2">
                    <Row label="Objections" value={String(drafts.length)} />
                    <Row label="Fee per objection" value="₹ 100" />
                    <Row
                      label="Total payable"
                      value={`₹ ${(drafts.length * 100).toLocaleString('en-IN')}`}
                    />
                  </dl>
                  <Banner tone="info" className="mt-3">
                    The fee is refunded for every objection that is accepted.
                  </Banner>
                  <Button
                    className="mt-3 w-full"
                    disabled={drafts.length === 0}
                    onClick={() => setSubmitted(true)}
                  >
                    <Send className="size-4" />
                    Submit {drafts.length} objection{drafts.length === 1 ? '' : 's'}
                  </Button>
                </>
              )}
            </Card>
          </div>
        </div>
      )}

      {tab === 'raised' && (
        <Card title="My objections" bodyClassName="p-0" className="flex-1">
          {drafts.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-grey-600">
              You have not raised any objection yet.
            </p>
          ) : (
            <ul className="divide-y divide-grey-200">
              {drafts.map((draft) => (
                <li key={draft.qNo} className="px-4 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[13px] font-semibold text-navy-900">Q. No. {draft.qNo}</p>
                    <StatusPill status={submitted ? 'Submitted' : 'Draft'} />
                  </div>
                  <p className="text-[13px] text-navy-900">{draft.type}</p>
                  <p className="mt-1 text-[12px] text-grey-600">{draft.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'outcome' && (
        <Card title="Outcomes from the previous objection window" bodyClassName="p-0" className="flex-1">
          <Banner tone="neutral" className="m-4 mb-0">
            Read-only. The final answer key has been published and revised marks are reflected in
            your result.
          </Banner>
          <ul className="mt-4 divide-y divide-grey-200 border-t border-grey-200">
            {OUTCOMES.map(([qNo, type, status, remarks]) => (
              <li key={String(qNo)} className="px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[13px] font-semibold text-navy-900">Q. No. {qNo}</p>
                  <StatusPill status={status === 'Accepted' ? 'Accepted' : 'Rejected'} />
                </div>
                <p className="text-[13px] text-navy-900">{type}</p>
                <p className="mt-1 text-[12px] text-grey-600">
                  <span className="font-medium text-navy-900">PEA remarks: </span>
                  {remarks}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal
        open={raising !== null}
        onClose={() => setRaising(null)}
        title={`Raise an objection — Q. No. ${raising}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRaising(null)}>
              Cancel
            </Button>
            <Button onClick={addToCart}>Add to cart</Button>
          </>
        }
      >
        <div className="space-y-3">
          {error && <Banner tone="danger">{error}</Banner>}

          <Field label="Objection type" required>
            <Select
              value={type}
              onChange={(event) => {
                setType(event.target.value)
                setError(null)
              }}
            >
              <option value="">-- Select --</option>
              {OBJECTION_TYPES.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </Select>
          </Field>

          <Field
            label="Your ground"
            required
            hint="Up to 500 characters. Be specific — cite the source that supports your position."
          >
            <Textarea
              value={reason}
              maxLength={500}
              onChange={(event) => {
                setReason(event.target.value)
                setError(null)
              }}
            />
          </Field>

          <Field label="Supporting document" hint="Optional. PDF or JPG, max 500 KB.">
            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" className="py-1.5" />
          </Field>
        </div>
      </Modal>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[12px] text-grey-600">{label}</dt>
      <dd className="text-[13px] font-medium text-navy-900">{value}</dd>
    </div>
  )
}
