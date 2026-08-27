import { FileText, Gavel } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Field, Select, Tabs, Textarea } from '@/components/common/primitives'
import { SkeletonCards } from '@/components/common/states'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import type { Objection } from '@/types'

type TabId = 'All' | 'Pending' | 'Accepted' | 'Rejected'

type Outcome = 'Key unchanged' | 'Key corrected' | 'Question dropped' | 'Full marks to all'

/**
 * §2.4.4 — objection handling, per demo slide 3.
 *
 * Decisions are grouped by question: every objection on Q.15 resolves together,
 * never one at a time. The objection count per question drives review priority.
 */
export default function ObjectionHandling() {
  const { data, isLoading } = useAsync(() => api.objections(), 'objections')
  const { data: key } = useAsync(() => api.answerKey(), 'answerKey')
  const { can } = useAuth()
  const [tab, setTab] = useState<TabId>('All')
  const [adjudicating, setAdjudicating] = useState<number | null>(null)
  const [outcome, setOutcome] = useState<Outcome>('Key unchanged')
  const [opinion, setOpinion] = useState('')

  const objections = useMemo(() => data ?? [], [data])

  const byQuestion = useMemo(() => {
    const map = new Map<number, Objection[]>()
    for (const objection of objections) {
      map.set(objection.qNo, [...(map.get(objection.qNo) ?? []), objection])
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length)
  }, [objections])

  if (isLoading) return <SkeletonCards />

  const counts = {
    All: objections.length,
    Pending: objections.filter((objection) => objection.status === 'Pending').length,
    Accepted: objections.filter((objection) => objection.status === 'Accepted').length,
    Rejected: objections.filter((objection) => objection.status === 'Rejected').length,
  }

  const visible =
    tab === 'All' ? byQuestion : byQuestion.filter(([, list]) => list.some((item) => item.status === tab))

  const questionKey = key?.find((entry) => entry.qNo === adjudicating)
  const questionObjections = objections.filter((objection) => objection.qNo === adjudicating)

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Objection Handling</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Objections Received ({counts.All}) · grouped by question, highest volume first
        </p>
      </div>

      <Banner tone="info" title="Decisions resolve a whole question at once">
        Every objection raised against a question is adjudicated together. Outcomes are: key
        unchanged, key corrected, question dropped with marks redistributed, or full marks to all.
      </Banner>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'All', label: 'All', count: counts.All },
          { id: 'Pending', label: 'Pending', count: counts.Pending },
          { id: 'Accepted', label: 'Accepted', count: counts.Accepted },
          { id: 'Rejected', label: 'Rejected', count: counts.Rejected },
        ]}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        {visible.map(([qNo, list]) => {
          const pending = list.filter((objection) => objection.status === 'Pending').length
          return (
            <Card key={qNo}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[15px] font-semibold text-navy-900">Q. No. {qNo}</p>
                  <p className="text-[12px] text-grey-600">
                    Provisional key: option{' '}
                    <span className="font-mono font-medium text-navy-900">
                      {key?.find((entry) => entry.qNo === qNo)?.correctOption ?? '—'}
                    </span>{' '}
                    · {list.length} objection{list.length === 1 ? '' : 's'}
                    {pending > 0 && ` · ${pending} pending`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={pending > 0 ? 'primary' : 'secondary'}
                  disabled={!can('objection.adjudicate')}
                  onClick={() => {
                    setAdjudicating(qNo)
                    setOutcome('Key unchanged')
                    setOpinion('')
                  }}
                >
                  <Gavel className="size-3.5" />
                  {pending > 0 ? 'Adjudicate' : 'Review'}
                </Button>
              </div>

              <ul className="mt-3 space-y-2 border-t border-grey-200 pt-3">
                {list.slice(0, 3).map((objection) => (
                  <li key={objection.id} className="flex gap-2.5">
                    <FileText className="mt-0.5 size-3.5 shrink-0 text-grey-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-navy-900">{objection.text}</p>
                      <p className="font-mono text-[11px] text-grey-600">
                        {objection.applicationNo}
                      </p>
                    </div>
                    <StatusPill status={objection.status} />
                  </li>
                ))}
                {list.length > 3 && (
                  <li className="text-[12px] text-grey-600">
                    + {list.length - 3} more objection{list.length - 3 === 1 ? '' : 's'}
                  </li>
                )}
              </ul>
            </Card>
          )
        })}
      </div>

      <Modal
        open={adjudicating !== null}
        onClose={() => setAdjudicating(null)}
        title={`Adjudicate Q. No. ${adjudicating}`}
        description={`${questionObjections.length} objection(s) resolve together`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdjudicating(null)}>
              Cancel
            </Button>
            <Button disabled={!opinion.trim()} onClick={() => setAdjudicating(null)}>
              Record decision
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-md border border-grey-200 p-3">
            <p className="text-[12px] text-grey-600">Provisional key answer</p>
            <p className="font-mono text-[20px] font-semibold text-navy-900">
              Option {questionKey?.correctOption}
            </p>
          </div>

          <div>
            <p className="label-caps mb-2">Grounds raised</p>
            <ul className="divide-y divide-grey-200 rounded-md border border-grey-200">
              {questionObjections.map((objection) => (
                <li key={objection.id} className="px-3 py-2.5">
                  <p className="text-[13px] text-navy-900">{objection.text}</p>
                  <p className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-grey-600">
                    {objection.applicationNo}
                    <span className="font-sans">· supporting document attached</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <Field label="Subject expert opinion" required>
            <Textarea
              value={opinion}
              onChange={(event) => setOpinion(event.target.value)}
              placeholder="Record the expert view that supports this outcome."
            />
          </Field>

          <Field label="Outcome" required>
            <Select value={outcome} onChange={(event) => setOutcome(event.target.value as Outcome)}>
              {(['Key unchanged', 'Key corrected', 'Question dropped', 'Full marks to all'] as Outcome[]).map(
                (option) => (
                  <option key={option}>{option}</option>
                ),
              )}
            </Select>
          </Field>

          {outcome !== 'Key unchanged' && (
            <Banner tone="warning" title="Re-scoring impact">
              Publishing the final key with this change will re-score{' '}
              <strong>12,458 candidates</strong>.{' '}
              {outcome === 'Question dropped'
                ? 'Marks for this question are redistributed across the remaining questions.'
                : outcome === 'Full marks to all'
                  ? 'Every candidate who attempted the paper receives full marks for this question.'
                  : 'Candidates who chose the corrected option gain marks.'}
            </Banner>
          )}
        </div>
      </Modal>
    </div>
  )
}
