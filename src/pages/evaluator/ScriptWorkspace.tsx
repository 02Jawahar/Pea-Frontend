import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Save,
  TriangleAlert,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Textarea } from '@/components/common/primitives'
import { EmptyState, SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import { cn } from '@/utils/cn'

/**
 * On-screen evaluation workspace (Ref. 53, 54).
 * Auto-save on every entry; submit locks the script. Unusual patterns — all-max,
 * all-zero, a large deviation from the batch mean — warn before submit, but the
 * warning is advisory, not blocking.
 */
export default function ScriptWorkspace() {
  const { id = '' } = useParams()
  const { data, isLoading, reload } = useAsync(() => api.script(id), id)
  const { can } = useAuth()
  const navigate = useNavigate()
  const [marks, setMarks] = useState<Record<number, string>>({})
  const [page, setPage] = useState(1)
  const [remarks, setRemarks] = useState('')
  const [saved, setSaved] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (isLoading) return <SkeletonCards />
  if (!data) {
    return (
      <Card>
        <EmptyState title="Script not found" description="Check the script ID and try again." />
      </Card>
    )
  }

  const readOnly = data.status === 'Completed' || !can('evaluation.score')
  const current = data.questions.map((question) => ({
    ...question,
    awarded:
      marks[question.qNo] !== undefined
        ? marks[question.qNo] === ''
          ? null
          : Number(marks[question.qNo])
        : question.awarded,
  }))

  const total = current.reduce((sum, question) => sum + (question.awarded ?? 0), 0)
  const maxTotal = current.reduce((sum, question) => sum + question.max, 0)
  const answered = current.filter((question) => question.awarded !== null).length

  const batchMean = 67.48
  const warnings: string[] = []
  if (answered === current.length) {
    if (total === maxTotal) warnings.push('Every question has been awarded full marks.')
    if (total === 0) warnings.push('Every question has been awarded zero.')
    const scaled = (total / maxTotal) * 100
    if (Math.abs(scaled - batchMean) > 25)
      warnings.push(
        `This script is ${Math.abs(scaled - batchMean).toFixed(1)} marks from the batch mean of ${batchMean}.`,
      )
  }

  async function save(submit: boolean) {
    setBusy(true)
    await api.saveScriptMarks(id, current, submit)
    setBusy(false)
    setSaved(submit ? 'Submitted and locked' : 'Saved')
    reload()
    if (submit) window.setTimeout(() => navigate(ROUTES.EV_SCRIPTS), 900)
  }

  return (
    <div className="page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={ROUTES.EV_SCRIPTS}
          className="inline-flex items-center gap-1.5 text-[13px] text-navy-700 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Answer scripts
        </Link>
        <div className="flex items-center gap-2">
          {saved && <span className="text-[12px] text-green-600">{saved}</span>}
          <StatusPill status={data.status} />
        </div>
      </div>

      <div>
        <h1 className="page-title font-mono">{data.scriptId}</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Roll number {data.rollNo}
          {can('evaluation.moderate')
            ? ` · ${data.candidateName}`
            : ' · candidate identity masked during evaluation'}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card
          title={`Answer script — page ${page} of ${data.pages}`}
          action={
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" aria-label="Zoom in">
                <ZoomIn className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" aria-label="Zoom out">
                <ZoomOut className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" aria-label="Rotate">
                <RotateCw className="size-4" />
              </Button>
            </div>
          }
          footer={
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((value) => value - 1)}
              >
                <ChevronLeft className="size-4" />
                Previous page
              </Button>
              <span className="text-[12px] text-grey-600">
                pages 1..{data.pages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === data.pages}
                onClick={() => setPage((value) => value + 1)}
              >
                Next page
                <ChevronRight className="size-4" />
              </Button>
            </div>
          }
        >
          <div className="flex aspect-[3/4] items-center justify-center rounded-md border border-dashed border-grey-300 bg-grey-050">
            <div className="text-center">
              <p className="text-[13px] font-medium text-grey-700">
                Scanned answer script, page {page}
              </p>
              <p className="mt-1 text-[12px] text-grey-600">
                Zoom, rotate and annotate tools operate on this canvas.
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card
            title="Marks entry"
            action={
              <span className="text-[12px] text-grey-600">
                {answered} of {current.length} answered
              </span>
            }
          >
            <ul className="space-y-2">
              {current.map((question) => (
                <li key={question.qNo} className="flex items-center gap-3">
                  <span className="w-8 shrink-0 text-[13px] font-medium text-navy-900">
                    Q{question.qNo}
                  </span>
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    max={question.max}
                    readOnly={readOnly}
                    value={marks[question.qNo] ?? question.awarded ?? ''}
                    aria-label={`Marks for question ${question.qNo}, out of ${question.max}`}
                    onChange={(event) => {
                      setMarks((previous) => ({ ...previous, [question.qNo]: event.target.value }))
                      setSaved('Saving…')
                    }}
                    className={cn(
                      'w-20 rounded-md border border-grey-300 px-2 py-1.5 text-center text-[13px]',
                      readOnly && 'bg-grey-100',
                      (question.awarded ?? 0) > question.max && 'border-red-600',
                    )}
                  />
                  <span className="text-[13px] text-grey-600">/ {question.max}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-grey-200 pt-3">
              <span className="text-[13px] font-medium text-navy-900">Total</span>
              {/* Ref. 51 — marks are captured at 4 decimal places throughout. */}
              <span className="font-mono text-[18px] font-semibold text-navy-900">
                {total.toFixed(4)} / {maxTotal}
              </span>
            </div>
          </Card>

          {warnings.length > 0 && (
            <Banner
              tone="warning"
              icon={<TriangleAlert className="size-4" />}
              title="Check before you submit"
            >
              <ul className="mt-1 list-inside list-disc">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
              <p className="mt-1">This is advisory — you can still submit.</p>
            </Banner>
          )}

          <Card title="Reference">
            <div className="space-y-2">
              {['Model answer', 'Marking scheme', 'Question paper'].map((item) => (
                <details key={item} className="rounded-md border border-grey-200">
                  <summary className="cursor-pointer px-3 py-2 text-[13px] font-medium text-navy-900">
                    {item}
                  </summary>
                  <p className="border-t border-grey-200 px-3 py-2 text-[12px] text-grey-600">
                    The {item.toLowerCase()} for General Studies Paper I opens here without leaving
                    the script.
                  </p>
                </details>
              ))}
            </div>
          </Card>

          <Card title="Remarks">
            <Textarea
              value={remarks}
              readOnly={readOnly}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Optional — visible to the moderator"
            />
            <div className="mt-3 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                disabled={readOnly}
                isLoading={busy}
                onClick={() => save(false)}
              >
                <Save className="size-4" />
                Save
              </Button>
              <Button
                variant="success"
                className="flex-1"
                disabled={readOnly || answered < current.length}
                isLoading={busy}
                onClick={() => save(true)}
                title={
                  answered < current.length
                    ? 'Award marks for every question before submitting.'
                    : undefined
                }
              >
                Submit &amp; lock
              </Button>
            </div>
            {readOnly && (
              <p className="mt-2 text-[12px] text-grey-600">
                This script is locked. Changes are only possible through re-evaluation, which creates
                a new version rather than overwriting this one (Ref. 54).
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
