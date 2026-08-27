import { CircleCheck, CircleX, Clock, RefreshCcw, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Banner, Button, Select } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

/**
 * Full-screen instructions, no navigation away (Shell C).
 * Compensatory time is stated explicitly rather than buried (Ref. 9), and
 * Begin exam stays disabled until the invigilator releases the session.
 */

const SYSTEM_CHECKS = [
  { label: 'Secure browser lockdown active', pass: true, remedy: '' },
  { label: 'Network stability', pass: true, remedy: '' },
  { label: 'Screen resolution 1366×768 or higher', pass: true, remedy: '' },
  { label: 'Webcam detected', pass: true, remedy: '' },
  { label: 'Microphone detected', pass: false, remedy: 'Plug in a headset or call the invigilator.' },
  { label: 'Keyboard responding', pass: true, remedy: '' },
]

export default function ExamInstructions() {
  const navigate = useNavigate()
  const { candidate } = useAuth()
  const [declared, setDeclared] = useState(false)
  const [released, setReleased] = useState(false)
  const [checks, setChecks] = useState(SYSTEM_CHECKS)

  const compensatory = candidate?.isPwBD ?? false
  const failures = checks.filter((check) => !check.pass)

  return (
    <div className="min-h-screen bg-navy-900 py-6">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-lg bg-white p-6">
          <p className="text-[12px] tracking-[0.14em] text-grey-600 uppercase">
            Puducherry Examining Authority
          </p>
          <h1 className="mt-1 text-[22px] font-semibold text-navy-900">
            Assistant Grade-II Examination 2024
          </h1>

          <dl className="mt-4 grid gap-3 sm:grid-cols-4">
            <Stat label="Duration" value={compensatory ? '180 min' : '140 min'} />
            <Stat label="Questions" value="100" />
            <Stat label="Total marks" value="100" />
            <Stat label="Negative marking" value="0.25 per wrong" />
          </dl>

          {compensatory && (
            <Banner tone="info" className="mt-4" icon={<Clock className="size-4" />} title="Compensatory time applied">
              Your exam duration is <strong>180 minutes, including 40 minutes compensatory
              time</strong>. A scribe has been arranged and will operate the interface on your
              instruction; the scribe's ID is logged against this session.
            </Banner>
          )}

          <section className="mt-5">
            <h2 className="label-caps mb-2">Marking scheme</h2>
            <ul className="space-y-1 text-[13px] text-navy-900">
              <li>Each correct answer carries 1 mark.</li>
              <li>0.25 marks are deducted for each wrong answer. Unanswered questions carry no penalty.</li>
              <li>Section-wise qualifying marks apply; grace marks are applied per the notification.</li>
            </ul>
          </section>

          <section className="mt-5">
            <h2 className="label-caps mb-2">Prohibited items</h2>
            <p className="text-[13px] text-navy-900">
              Mobile phones, smart watches, calculators, books, notes and any electronic device.
              Possession of a prohibited item is treated as malpractice and is published against your
              candidature.
            </p>
          </section>

          <section className="mt-5">
            <h2 className="label-caps mb-2">Malpractice</h2>
            <p className="text-[13px] text-navy-900">
              Tab switching, absence from the camera and the presence of another face are detected
              and logged with a timestamp to the invigilator console. Confirmed malpractice is
              published after the examination and appears in your status trail with the ground and
              the appeal route.
            </p>
          </section>

          <section className="mt-5 rounded-md border border-grey-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="label-caps">System check</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setChecks(SYSTEM_CHECKS.map((check) => ({ ...check, pass: true })))}
              >
                <RefreshCcw className="size-3.5" />
                Retry check
              </Button>
            </div>

            <ul className="mt-3 space-y-1.5">
              {checks.map((check) => (
                <li key={check.label} className="flex items-start gap-2 text-[13px]">
                  {check.pass ? (
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-green-600" />
                  ) : (
                    <CircleX className="mt-0.5 size-4 shrink-0 text-red-600" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className={check.pass ? 'text-navy-900' : 'text-red-600'}>
                      {check.label}
                    </span>
                    {!check.pass && (
                      <span className="block text-[12px] text-grey-600">{check.remedy}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            {failures.length > 0 && (
              <Banner tone="danger" className="mt-3" icon={<ShieldAlert className="size-4" />}>
                You cannot begin until every check passes. Use Retry check, or call the invigilator.
              </Banner>
            )}
          </section>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-grey-200 pt-4">
            <Select aria-label="Question paper language" className="w-auto" defaultValue="English">
              {['English', 'Tamil', 'Malayalam', 'Telugu'].map((language) => (
                <option key={language}>{language}</option>
              ))}
            </Select>
            <p className="text-[12px] text-grey-600">
              Reflects the language you chose at application.
            </p>
          </div>

          <label className="mt-4 flex items-start gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={declared}
              className="mt-0.5"
              onChange={(event) => setDeclared(event.target.checked)}
            />
            <span>
              I have read the instructions, I am not carrying any prohibited item, and I understand
              that malpractice will result in my candidature being cancelled.
            </span>
          </label>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              disabled={!declared || failures.length > 0 || !released}
              onClick={() => navigate(ROUTES.EXAM_LIVE)}
              title={
                !released
                  ? 'The invigilator has not released this session yet.'
                  : failures.length > 0
                    ? 'All system checks must pass first.'
                    : undefined
              }
            >
              Begin exam
            </Button>
            <Button variant="secondary" size="lg">
              Call invigilator
            </Button>

            <span
              className={cn(
                'ml-auto text-[13px]',
                released ? 'text-green-600' : 'text-grey-600',
              )}
            >
              {released ? 'Session released by the invigilator' : 'Waiting for session release…'}
            </span>
            {!released && (
              <button
                type="button"
                onClick={() => setReleased(true)}
                className="text-[12px] text-grey-600 underline"
              >
                Simulate release
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-grey-050 px-3 py-2">
      <dt className="text-[12px] text-grey-600">{label}</dt>
      <dd className="text-[15px] font-semibold text-navy-900">{value}</dd>
    </div>
  )
}
