import { LifeBuoy } from 'lucide-react'
import { useState } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { seed } from '@/mock/api'
import { Modal } from './Modal'
import { Banner, Button, Field, Input, Select, Textarea } from './primitives'

const GRIEVANCE_TYPES = [
  'Application correction',
  'Fee payment issue',
  'Admit card not generated',
  'Document upload failure',
  'Result discrepancy',
  'Exam centre change request',
  'Other',
]

/**
 * Ref. 79 makes the grievance link visible and accessible on **every** screen,
 * so this is a floating launcher mounted in the app shell — not a sidebar item
 * that scrolls away.
 */
export function GrievanceLauncher() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [relatedApp, setRelatedApp] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ticketNo, setTicketNo] = useState<string | null>(null)
  const [duplicate, setDuplicate] = useState<string | null>(null)
  const { candidate } = useAuth()

  const myApplications = candidate
    ? seed.applications.filter((application) => application.candidateId === candidate.id)
    : []

  function submit() {
    const next: Record<string, string> = {}
    if (!type) next.type = 'Select the type of grievance.'
    if (!subject.trim()) next.subject = 'Enter a subject.'
    if (!description.trim()) next.description = 'Describe the grievance.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    // Duplicate detection: same type on the same day warns rather than blocks.
    const existing = seed.tickets.find(
      (ticket) => ticket.type === type && ticket.submittedOn.startsWith(seed.DEMO_TODAY),
    )
    if (existing && !duplicate) {
      setDuplicate(existing.ticketNo)
      return
    }

    // Ref. 82 — DDMMYY + HHMMSS + type digit + sequence.
    const typeDigit = String(GRIEVANCE_TYPES.indexOf(type) + 1)
    setTicketNo(`200524124107${typeDigit}${String(seed.tickets.length + 1).padStart(3, '0')}`)
  }

  function reset() {
    setOpen(false)
    window.setTimeout(() => {
      setTicketNo(null)
      setDuplicate(null)
      setType('')
      setSubject('')
      setDescription('')
      setRelatedApp('')
      setErrors({})
    }, 200)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="no-print fixed right-5 bottom-5 z-40 flex items-center gap-2 rounded-full bg-navy-700 px-4 py-3 text-[13px] font-medium text-white shadow-lg transition-colors hover:bg-navy-800"
      >
        <LifeBuoy className="size-4" />
        <span className="hidden sm:inline">Raise a Grievance</span>
      </button>

      <Modal
        open={open}
        onClose={reset}
        title={ticketNo ? 'Grievance registered' : 'Raise a grievance'}
        description={
          ticketNo
            ? undefined
            : 'Available on every screen, signed in or not (Ref. 79). Attachments are validated before upload.'
        }
        footer={
          ticketNo ? (
            <Button variant="success" onClick={reset}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={reset}>
                Cancel
              </Button>
              <Button onClick={submit}>{duplicate ? 'Submit anyway' : 'Submit grievance'}</Button>
            </>
          )
        }
      >
        {ticketNo ? (
          <div className="space-y-3">
            <Banner tone="success" title="Your ticket number">
              <p className="mt-1 font-mono text-[18px] tracking-wide text-navy-900">{ticketNo}</p>
            </Banner>
            <div className="rounded-md border border-grey-200 p-3 text-[12px] text-grey-600">
              <p className="mb-1 font-semibold text-navy-900">What the number means</p>
              <p className="font-mono">
                200524 · 124107 · {ticketNo.slice(12, 13)} · {ticketNo.slice(13)}
              </p>
              <p className="mt-1">
                date 20 May 2024 · time 12:41:07 · type of grievance · sequence number
              </p>
            </div>
            <p className="text-[13px] text-grey-600">
              Track it any time at <span className="font-medium">/grievance/track</span> using the
              ticket number and the date of submission — no login required.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {duplicate && (
              <Banner tone="warning" title="A similar grievance already exists today">
                Ticket <span className="font-mono">{duplicate}</span> was raised for the same type
                today. View that ticket instead, or submit anyway if this is a different issue.
              </Banner>
            )}

            <Field label="Type of grievance" required error={errors.type}>
              <Select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="">-- Select --</option>
                {GRIEVANCE_TYPES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
            </Field>

            <Field label="Subject" required error={errors.subject}>
              <Input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="One line summarising the issue"
              />
            </Field>

            <Field label="Description" required error={errors.description}>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe what happened, with dates and reference numbers."
              />
            </Field>

            {myApplications.length > 0 && (
              <Field
                label="Related application"
                hint="Optional — links the ticket to one of your applications."
              >
                <Select value={relatedApp} onChange={(event) => setRelatedApp(event.target.value)}>
                  <option value="">-- Not related to an application --</option>
                  {myApplications.map((application) => (
                    <option key={application.id} value={application.applicationNo}>
                      {application.applicationNo} — {application.postName}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            <Field
              label="Supporting document"
              hint="Text or image, PDF / JPG / PNG, max 500 KB. Validated before upload."
            >
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png" className="py-1.5" />
            </Field>
          </div>
        )}
      </Modal>
    </>
  )
}
