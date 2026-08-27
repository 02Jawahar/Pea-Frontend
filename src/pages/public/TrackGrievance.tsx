import { EyeOff, MessageSquare, Search } from 'lucide-react'
import { useState } from 'react'

import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Field, Input } from '@/components/common/primitives'
import { seed } from '@/mock/api'
import type { Ticket } from '@/types'
import { decodeTicketNo } from '@/utils/format'

/**
 * Ref. 88 — public grievance tracking with ticket number and date of
 * submission, no login. Returns status and history only, never personal data.
 */
export default function TrackGrievance() {
  const [ticketNo, setTicketNo] = useState('')
  const [date, setDate] = useState('')
  const [result, setResult] = useState<Ticket | null>(null)
  const [error, setError] = useState<string | null>(null)

  function lookup() {
    const match = seed.tickets.find((ticket) => ticket.ticketNo === ticketNo.trim())
    if (!match) {
      setError('No ticket matches that number.')
      setResult(null)
      return
    }
    if (date && !match.submittedOn.startsWith(date)) {
      setError('The date of submission does not match this ticket number.')
      setResult(null)
      return
    }
    setError(null)
    setResult(match)
  }

  const sample = seed.tickets[0]

  return (
    <div className="page mx-auto w-full max-w-3xl">
      <div>
        <h1 className="page-title">Track a grievance</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Enter the ticket number and the date you submitted it. No login required.
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Ticket Number" required className="min-w-56 flex-1">
            <Input
              value={ticketNo}
              onChange={(event) => {
                setTicketNo(event.target.value)
                setError(null)
              }}
              onKeyDown={(event) => event.key === 'Enter' && lookup()}
              placeholder={sample.ticketNo}
              className="font-mono"
            />
          </Field>
          <Field label="Date of submission" className="w-48">
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </Field>
          <Button onClick={lookup}>
            <Search className="size-4" />
            Track
          </Button>
        </div>

        {error && (
          <p className="mt-2 text-[13px] text-red-600" role="alert">
            {error}
          </p>
        )}

        <Banner tone="info" className="mt-3">
          Demo — try <span className="font-mono">{sample.ticketNo}</span>.
        </Banner>
      </Card>

      {result && (
        <>
          <Card title="Ticket status" action={<StatusPill status={result.status} size="md" />}>
            <dl className="grid gap-3 sm:grid-cols-3">
              <Row label="Ticket Number" value={result.ticketNo} mono />
              <Row label="Type" value={result.type} />
              <Row label="Submitted on" value={result.submittedOn} />
              <Row label="Priority" value={result.priority} />
              <Row label="Re-opened" value={`${result.reopenCount} time(s)`} />
              <Row
                label="Confirmed by user"
                value={result.confirmationAt ?? 'Not confirmed'}
              />
            </dl>

            <div className="mt-4 rounded-md border border-grey-200 p-3">
              <p className="mb-1 text-[12px] font-semibold text-navy-900">
                What the ticket number means
              </p>
              <p className="font-mono text-[12px] text-grey-600">
                {decodeTicketNo(result.ticketNo)}
              </p>
            </div>
          </Card>

          <Card title="History" bodyClassName="p-0">
            <ol className="divide-y divide-grey-200">
              {result.thread
                .filter((message) => !message.internal)
                .map((message, index) => (
                  <li key={index} className="flex gap-3 px-4 py-3">
                    <MessageSquare className="mt-0.5 size-4 shrink-0 text-grey-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-navy-900">{message.body}</p>
                      <p className="text-[12px] text-grey-600">
                        {message.role} · {message.timestamp}
                      </p>
                    </div>
                  </li>
                ))}
            </ol>
          </Card>

          <Banner tone="neutral" icon={<EyeOff className="size-4" />} title="Status and history only">
            Public tracking never returns personal data. Internal notes recorded by the helpdesk are
            not shown here.
          </Banner>
        </>
      )}
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
