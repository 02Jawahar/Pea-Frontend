import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Contrast,
  Flag,
  Save,
  Timer,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Modal } from '@/components/common/Modal'
import { Banner, Button } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

/**
 * Shell C — locked kiosk. No header nav, no sidebar, no browser-chrome
 * affordances. Timer, question palette and candidate strip only.
 *
 * CBT mode (§2.4.3). Auto-save on every selection; warnings at 15 and 5 minutes;
 * auto-submit at zero. Proctoring incidents surface as a non-punitive toast, not
 * a modal that costs exam time.
 */

const SECTIONS = [
  { id: 'gs', label: 'General Studies', count: 60 },
  { id: 'p2', label: 'Paper-II', count: 40 },
]

const TOTAL_QUESTIONS = SECTIONS.reduce((sum, section) => sum + section.count, 0)

type Mark = { answer?: 'A' | 'B' | 'C' | 'D'; marked?: boolean }

export default function ExamLive() {
  const navigate = useNavigate()
  const { candidate } = useAuth()

  // 180 minutes including 40 minutes compensatory time where entitled.
  const compensatory = candidate?.isPwBD ?? false
  const durationSeconds = (compensatory ? 180 : 140) * 60

  const [remaining, setRemaining] = useState(durationSeconds)
  const [current, setCurrent] = useState(1)
  const [marks, setMarks] = useState<Record<number, Mark>>({})
  const [section, setSection] = useState('gs')
  const [fontScale, setFontScale] = useState(1)
  const [highContrast, setHighContrast] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [])

  // Auto-submit at zero.
  useEffect(() => {
    if (remaining === 0) navigate(ROUTES.EXAM_SUBMITTED, { replace: true })
  }, [remaining, navigate])

  // Non-punitive proctoring warning, per the spec.
  useEffect(() => {
    const onBlur = () => setToast('Please remain in front of the camera. This has been logged.')
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const counts = useMemo(() => {
    const values = Object.values(marks)
    const answered = values.filter((mark) => mark.answer && !mark.marked).length
    const markedOnly = values.filter((mark) => !mark.answer && mark.marked).length
    const answeredAndMarked = values.filter((mark) => mark.answer && mark.marked).length
    return {
      answered,
      markedOnly,
      answeredAndMarked,
      notAnswered: TOTAL_QUESTIONS - answered - markedOnly - answeredAndMarked,
      totalAnswered: answered + answeredAndMarked,
    }
  }, [marks])

  const warningTone = remaining <= 300 ? 'danger' : remaining <= 900 ? 'warning' : null

  function choose(option: 'A' | 'B' | 'C' | 'D') {
    setMarks((previous) => ({ ...previous, [current]: { ...previous[current], answer: option } }))
    setSaved(false)
    window.setTimeout(() => setSaved(true), 400)
  }

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col',
        highContrast ? 'bg-white text-black' : 'bg-grey-050',
      )}
      style={{ fontSize: `${fontScale}rem` }}
    >
      {/* Candidate strip — no navigation away from here. */}
      <header className="flex flex-wrap items-center gap-3 border-b border-grey-200 bg-navy-900 px-4 py-2.5 text-white">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-[12px] font-semibold">
          {candidate?.initials ?? 'CN'}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="text-[13px] font-medium">{candidate?.name ?? 'Candidate'}</p>
          <p className="font-mono text-[11px] text-white/70">APP20240012345</p>
        </div>

        <p className="mx-auto hidden text-[14px] font-semibold sm:block">
          Assistant Grade-II Examination 2024
        </p>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFontScale((value) => Math.max(0.9, value - 0.1))}
              aria-label="Decrease text size"
              className="rounded px-1.5 py-1 text-[12px] hover:bg-white/10"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontScale((value) => Math.min(1.4, value + 0.1))}
              aria-label="Increase text size"
              className="rounded px-1.5 py-1 text-[15px] hover:bg-white/10"
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setHighContrast((value) => !value)}
              aria-pressed={highContrast}
              aria-label="Toggle high contrast"
              className="rounded p-1.5 hover:bg-white/10"
            >
              <Contrast className="size-4" />
            </button>
          </div>

          <span
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[16px] font-semibold tabular-nums',
              warningTone === 'danger'
                ? 'bg-red-600'
                : warningTone === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-white/15',
            )}
            aria-live="polite"
          >
            <Timer className="size-4" />
            {formatClock(remaining)}
          </span>

          <select
            aria-label="Question paper language"
            defaultValue="EN"
            className="rounded-md border-0 bg-white/15 py-1 pr-6 pl-2 text-[13px] text-white"
          >
            {['EN', 'TA', 'ML', 'TE'].map((code) => (
              <option key={code} className="text-navy-900">
                {code}
              </option>
            ))}
          </select>
        </div>
      </header>

      {compensatory && (
        <div className="bg-blue-050 px-4 py-2 text-[13px] text-navy-700">
          Your exam duration is 180 minutes, including 40 minutes compensatory time. Scribe mode is
          active — the scribe ID is logged against this session.
        </div>
      )}

      {warningTone && (
        <Banner
          tone={warningTone}
          className="rounded-none"
          icon={<AlertTriangle className="size-4" />}
          title={
            warningTone === 'danger'
              ? '5 minutes remaining'
              : '15 minutes remaining'
          }
        >
          The exam submits automatically when the timer reaches zero. Anything you have selected is
          already saved.
        </Banner>
      )}

      <div className="flex flex-1 flex-col lg:flex-row">
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[13px] text-grey-600">
                Section: <span className="font-medium text-navy-900">
                  {SECTIONS.find((item) => item.id === section)?.label}
                </span>
              </p>
              <p className="text-[13px] text-grey-600">
                Q {current} of {TOTAL_QUESTIONS}
              </p>
            </div>

            <div className={cn('mt-3 rounded-lg border p-5', highContrast ? 'border-black bg-white' : 'card')}>
              <p className="text-[15px] leading-relaxed text-navy-900">
                Question {current}. Which of the following is the constitutional provision under
                which the Union Territory of Puducherry has a Legislative Assembly?
              </p>

              <fieldset className="mt-5 space-y-2">
                <legend className="sr-only">Answer options</legend>
                {(['A', 'B', 'C', 'D'] as const).map((option) => (
                  <label
                    key={option}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-[14px]',
                      marks[current]?.answer === option
                        ? 'border-navy-700 bg-blue-050'
                        : 'border-grey-200 hover:bg-grey-050',
                    )}
                  >
                    <input
                      type="radio"
                      name={`q${current}`}
                      checked={marks[current]?.answer === option}
                      onChange={() => choose(option)}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium">{option}.</span> Article{' '}
                      {239 + (['A', 'B', 'C', 'D'].indexOf(option) || 0)} of the Constitution
                    </span>
                  </label>
                ))}
              </fieldset>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-grey-200 pt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setMarks((previous) => ({
                      ...previous,
                      [current]: { ...previous[current], answer: undefined },
                    }))
                  }
                >
                  Clear
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setMarks((previous) => ({
                      ...previous,
                      [current]: { ...previous[current], marked: true },
                    }))
                    setCurrent((value) => Math.min(TOTAL_QUESTIONS, value + 1))
                  }}
                >
                  <Flag className="size-3.5" />
                  Mark for review &amp; next
                </Button>

                <span className="ml-auto flex items-center gap-1.5 text-[12px] text-grey-600">
                  {saved ? (
                    <>
                      <Check className="size-3.5 text-green-600" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5" />
                      Saving…
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                disabled={current === 1}
                onClick={() => setCurrent((value) => value - 1)}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <Button
                disabled={current === TOTAL_QUESTIONS}
                onClick={() => setCurrent((value) => value + 1)}
              >
                Save &amp; next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </main>

        <aside className="w-full shrink-0 border-t border-grey-200 bg-white p-4 lg:w-72 lg:border-t-0 lg:border-l">
          <p className="label-caps mb-3">Question palette</p>

          <ul className="mb-4 space-y-1.5 text-[12px]">
            <PaletteLegend className="bg-green-600 text-white" label="Answered" value={counts.answered} />
            <PaletteLegend className="bg-white border border-grey-300" label="Not answered" value={counts.notAnswered} />
            <PaletteLegend className="bg-purple-600 text-white" label="Marked" value={counts.markedOnly} />
            <PaletteLegend className="bg-purple-600 text-white ring-2 ring-green-600" label="Answered + marked" value={counts.answeredAndMarked} />
          </ul>

          <div className="grid grid-cols-6 gap-1.5">
            {Array.from({ length: TOTAL_QUESTIONS }, (_, index) => index + 1).map((number) => {
              const mark = marks[number]
              return (
                <button
                  key={number}
                  type="button"
                  onClick={() => setCurrent(number)}
                  aria-label={`Question ${number}`}
                  aria-current={current === number}
                  className={cn(
                    'flex size-8 items-center justify-center rounded text-[12px] font-medium',
                    mark?.answer && mark.marked
                      ? 'bg-purple-600 text-white ring-2 ring-green-600'
                      : mark?.answer
                        ? 'bg-green-600 text-white'
                        : mark?.marked
                          ? 'bg-purple-600 text-white'
                          : 'border border-grey-300 bg-white text-navy-900',
                    current === number && 'ring-2 ring-navy-700 ring-offset-1',
                  )}
                >
                  {number}
                </button>
              )
            })}
          </div>

          <div className="mt-4 border-t border-grey-200 pt-3">
            <p className="label-caps mb-2">Sections</p>
            <div className="flex gap-2">
              {SECTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={cn(
                    'flex-1 rounded-md border px-2 py-1.5 text-[12px] font-medium',
                    section === item.id
                      ? 'border-navy-700 bg-blue-050 text-navy-700'
                      : 'border-grey-200 text-grey-700',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <Button variant="danger" className="mt-4 w-full" onClick={() => setConfirming(true)}>
            Submit exam
          </Button>
        </aside>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-md bg-navy-900/90 px-4 py-2.5 text-[13px] text-white shadow-lg"
        >
          {toast}
        </div>
      )}

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Submit your exam?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Go back
            </Button>
            <Button variant="danger" onClick={() => navigate(ROUTES.EXAM_SUBMITTED)}>
              Submit finally
            </Button>
          </>
        }
      >
        <dl className="space-y-2 text-[13px]">
          <Summary label="Answered" value={counts.totalAnswered} />
          <Summary label="Not answered" value={counts.notAnswered} />
          <Summary label="Marked for review" value={counts.markedOnly + counts.answeredAndMarked} />
          <Summary label="Time remaining" value={formatClock(remaining)} />
        </dl>
        <Banner tone="warning" className="mt-3">
          Once submitted you cannot return to the paper.
        </Banner>
      </Modal>
    </div>
  )
}

function PaletteLegend({
  className,
  label,
  value,
}: {
  className: string
  label: string
  value: number
}) {
  return (
    <li className="flex items-center gap-2">
      <span className={cn('flex size-4 shrink-0 rounded', className)} />
      <span className="flex-1 text-grey-700">{label}</span>
      <span className="font-medium text-navy-900">{value}</span>
    </li>
  )
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-grey-600">{label}</dt>
      <dd className="font-medium text-navy-900">{value}</dd>
    </div>
  )
}

function formatClock(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return [hours, minutes, secs].map((part) => String(part).padStart(2, '0')).join(':')
}
