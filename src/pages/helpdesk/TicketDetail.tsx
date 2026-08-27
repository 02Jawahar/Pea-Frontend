import { ArrowLeft, Ban, Lock, MessageSquare, Send, ShieldCheck, StickyNote } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Field, Select, Textarea } from '@/components/common/primitives'
import { EmptyState, SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import type { Priority, TicketStatus } from '@/types'
import { cn } from '@/utils/cn'
import { decodeTicketNo } from '@/utils/format'
import { SummaryPanel } from '../examAdmin/widgets'

const AGENT_STATUSES: TicketStatus[] = [
  'In Progress',
  'Sent Back for Clarification',
  'Closed',
  'Not Relevant',
]

export default function TicketDetail() {
  const { id = '' } = useParams()
  const { data, isLoading, reload } = useAsync(() => api.ticket(id), id)
  const { staff, can } = useAuth()
  const [reply, setReply] = useState('')
  const [internal, setInternal] = useState(false)
  const [busy, setBusy] = useState(false)
  const agent = staff?.name ?? ''

  if (isLoading) return <SkeletonCards />
  if (!data) {
    return (
      <Card>
        <EmptyState title="Ticket not found" description="Check the ticket number and try again." />
      </Card>
    )
  }

  const mine = data.lockedBy === agent
  const lockedByOther = Boolean(data.lockedBy) && !mine
  const canHandle = can('ticket.handle') && mine

  async function setStatus(status: TicketStatus) {
    setBusy(true)
    await api.setTicketStatus(id, status, reply || `Status changed to ${status}.`, agent)
    setBusy(false)
    setReply('')
    reload()
  }

  return (
    <div className="page">
      <Link
        to={ROUTES.HD_QUEUE}
        className="inline-flex items-center gap-1.5 text-[13px] text-navy-700 hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Ticket queue
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[12px] text-grey-600" title={decodeTicketNo(data.ticketNo)}>
            {data.ticketNo}
          </p>
          <h1 className="page-title">{data.subject}</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {data.type} · raised by {data.submittedByName} ({data.submittedByType}) on{' '}
            {data.submittedOn}
          </p>
        </div>
        <StatusPill status={data.status} size="md" />
      </div>

      {lockedByOther && (
        <Banner tone="warning" icon={<Lock className="size-4" />} title={`Locked by ${data.lockedBy}`}>
          You can read this ticket but cannot act on it. A supervisor can force-release the lock if
          {' '}{data.lockedBy} is unavailable.
          {can('ticket.forcerelease') && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={async () => {
                await api.releaseTicket(id)
                reload()
              }}
            >
              Force-release lock
            </Button>
          )}
        </Banner>
      )}

      {!data.lockedBy && can('ticket.handle') && (
        <Banner tone="info" title="Take this ticket to act on it">
          Selecting a ticket assigns it to you and locks out other agents.
          <Button
            size="sm"
            className="mt-2"
            onClick={async () => {
              await api.lockTicket(id, agent)
              reload()
            }}
          >
            <Lock className="size-3.5" />
            Take ticket
          </Button>
        </Banner>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card title="Grievance details">
            <p className="text-[13px] text-navy-900">{data.description}</p>
            {data.relatedApplicationNo && (
              <p className="mt-2 text-[12px] text-grey-600">
                Related application:{' '}
                <span className="font-mono text-navy-900">{data.relatedApplicationNo}</span>
              </p>
            )}
          </Card>

          <Card title="Conversation" bodyClassName="p-0">
            <ol className="divide-y divide-grey-200">
              {data.thread.map((message, index) => (
                <li
                  key={index}
                  className={cn('flex gap-3 px-4 py-3', message.internal && 'bg-amber-050')}
                >
                  {message.internal ? (
                    <StickyNote className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  ) : (
                    <MessageSquare className="mt-0.5 size-4 shrink-0 text-grey-600" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-[13px] font-medium text-navy-900">{message.author}</span>
                      <span className="text-[12px] text-grey-600">{message.role}</span>
                      {message.internal && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500 uppercase">
                          Internal note
                        </span>
                      )}
                      <span className="ml-auto text-[12px] text-grey-600">{message.timestamp}</span>
                    </p>
                    <p className="text-[13px] text-navy-900">{message.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="border-t border-grey-200 p-4">
              <Textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                disabled={!canHandle}
                placeholder={
                  canHandle
                    ? internal
                      ? 'Internal note — not visible to the submitter'
                      : 'Reply to the submitter'
                    : 'Take the ticket to reply'
                }
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    checked={internal}
                    disabled={!canHandle}
                    onChange={(event) => setInternal(event.target.checked)}
                  />
                  Internal note (not visible to the submitter)
                </label>
                <Button disabled={!canHandle || !reply.trim()} isLoading={busy} onClick={() => setStatus(data.status)}>
                  <Send className="size-3.5" />
                  Send
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Action">
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Priority" hint="Helpdesk verifies the nature of the grievance and sets priority (Ref. 83).">
                  <Select
                    value={data.priority}
                    disabled={!canHandle}
                    onChange={async (event) => {
                      await api.setTicketPriority(id, event.target.value as Priority)
                      reload()
                    }}
                  >
                    {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Assign to official"
                  hint="Assigned officials can send the task back to helpdesk with comments (Ref. 84)."
                >
                  <Select disabled={!canHandle || !can('ticket.assign')} defaultValue="">
                    <option value="">-- Suggested: Revenue Department — Establishment --</option>
                    {seed.staffUsers
                      .filter((user) => user.isActive)
                      .map((user) => (
                        <option key={user.id}>{user.name} — {user.designation}</option>
                      ))}
                  </Select>
                </Field>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-grey-200 pt-3">
                {AGENT_STATUSES.map((status) => (
                  <Button
                    key={status}
                    variant={status === 'Closed' ? 'success' : 'secondary'}
                    size="sm"
                    disabled={!canHandle}
                    isLoading={busy}
                    onClick={() => setStatus(status)}
                  >
                    {status}
                  </Button>
                ))}

                {/* Ref. 86 — only the submitter can cancel. Make it visibly impossible here. */}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  title="Only the candidate or staff member who submitted this ticket can cancel it (Ref. 86)."
                >
                  <Ban className="size-3.5" />
                  Cancel ticket
                </Button>
              </div>

              <Button
                variant="secondary"
                size="sm"
                disabled={!canHandle}
                onClick={() => setStatus('In Progress')}
              >
                <ShieldCheck className="size-3.5" />
                Seek confirmation from the user
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <SummaryPanel
            title="Ticket"
            rows={[
              { label: 'Priority', value: data.priority },
              { label: 'SLA', value: `${data.slaHours} hours` },
              { label: 'Age', value: `${data.ageHours} hours` },
              { label: 'Assigned to', value: data.assignedTo ?? 'Unassigned' },
              { label: 'Locked by', value: data.lockedBy ?? 'Not locked' },
              { label: 'Re-opened', value: `${data.reopenCount} time(s)` },
              {
                label: 'User confirmation',
                value: data.confirmationAt ?? 'Not confirmed',
              },
            ]}
          />

          <Card title="Submitter context">
            <p className="text-[13px] text-grey-600">
              Application status and exam details only. Profile data — sports, work history, bank
              details — is candidate-only and is not shown here (Ref. 25).
            </p>
            <dl className="mt-3 space-y-2">
              <Row label="Name" value={data.submittedByName} />
              <Row label="Type" value={data.submittedByType} />
              <Row label="Related application" value={data.relatedApplicationNo ?? '—'} />
              <Row label="Application status" value="Under Scrutiny" />
            </dl>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[12px] text-grey-600">{label}</dt>
      <dd className="text-right text-[13px] font-medium text-navy-900">{value}</dd>
    </div>
  )
}
