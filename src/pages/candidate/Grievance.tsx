import { RotateCcw, Ban, MessageSquare } from 'lucide-react'
import { useState } from 'react'

import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Textarea } from '@/components/common/primitives'
import { EmptyState, SkeletonCards } from '@/components/common/states'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import type { Ticket, TicketStatus } from '@/types'
import { decodeTicketNo } from '@/utils/format'

/**
 * Ref. 85–87 — the candidate's own tickets.
 * Re-open keeps the same ticket number; only the submitter can cancel (Ref. 86);
 * the date and time of the user's confirmation is recorded (Ref. 87).
 */
export default function CandidateGrievance() {
  const { candidate } = useAuth()
  const { data, isLoading, reload } = useAsync(() => api.tickets(), 'tickets')
  const [acting, setActing] = useState<{ ticket: Ticket; action: TicketStatus } | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  if (isLoading || !candidate) return <SkeletonCards />

  const mine = (data ?? []).filter((ticket) => ticket.submittedById === candidate.id)

  if (mine.length === 0) {
    return (
      <Card>
        <EmptyState
          title="You have not raised any grievance"
          description="Use the Raise a Grievance button in the corner of any screen — it is available on every page, signed in or not."
        />
      </Card>
    )
  }

  async function act() {
    if (!acting) return
    setBusy(true)
    await api.setTicketStatus(acting.ticket.id, acting.action, note || '—', candidate!.name)
    setBusy(false)
    setActing(null)
    setNote('')
    reload()
  }

  return (
    <div className="page">
      <div>
        <h1 className="page-title">My Grievances</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Track any ticket publicly at /grievance/track with the ticket number and date of
          submission — no login needed.
        </p>
      </div>

      <div className="space-y-3">
        {mine.map((ticket) => (
          <Card key={ticket.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="font-mono text-[12px] text-grey-600"
                  title={decodeTicketNo(ticket.ticketNo)}
                >
                  {ticket.ticketNo}
                </p>
                <h2 className="text-[15px] font-semibold text-navy-900">{ticket.subject}</h2>
                <p className="text-[12px] text-grey-600">
                  {ticket.type} · raised {ticket.submittedOn} · priority {ticket.priority}
                  {ticket.reopenCount > 0 && ` · re-opened ${ticket.reopenCount}×`}
                </p>
              </div>
              <StatusPill status={ticket.status} />
            </div>

            <ol className="mt-4 space-y-3 border-t border-grey-200 pt-3">
              {ticket.thread
                .filter((message) => !message.internal)
                .map((message, index) => (
                  <li key={index} className="flex gap-3">
                    <MessageSquare className="mt-0.5 size-4 shrink-0 text-grey-600" />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-[13px] font-medium text-navy-900">
                          {message.author}
                        </span>
                        <span className="text-[12px] text-grey-600">{message.role}</span>
                        <span className="ml-auto text-[12px] text-grey-600">
                          {message.timestamp}
                        </span>
                      </p>
                      <p className="text-[13px] text-navy-900">{message.body}</p>
                    </div>
                  </li>
                ))}
            </ol>

            {ticket.confirmationAt && (
              <Banner tone="success" className="mt-3">
                You confirmed the resolution on {ticket.confirmationAt}.
              </Banner>
            )}

            <div className="mt-4 flex flex-wrap gap-2 border-t border-grey-200 pt-3">
              {ticket.status === 'Closed' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActing({ ticket, action: 'Re-opened' })}
                >
                  <RotateCcw className="size-3.5" />
                  Re-open this ticket
                </Button>
              )}
              {!['Closed', 'Cancelled'].includes(ticket.status) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => setActing({ ticket, action: 'Cancelled' })}
                >
                  <Ban className="size-3.5" />
                  Cancel ticket
                </Button>
              )}
              {ticket.status === 'In Progress' && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => setActing({ ticket, action: 'Closed' })}
                >
                  Confirm resolution
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={acting !== null}
        onClose={() => setActing(null)}
        title={
          acting?.action === 'Re-opened'
            ? 'Re-open this ticket?'
            : acting?.action === 'Cancelled'
              ? 'Cancel this ticket?'
              : 'Confirm the resolution?'
        }
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setActing(null)}>
              Back
            </Button>
            <Button
              variant={acting?.action === 'Cancelled' ? 'danger' : 'primary'}
              isLoading={busy}
              onClick={act}
            >
              Confirm
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {acting?.action === 'Re-opened' && (
            <Banner tone="info">
              The same ticket number <span className="font-mono">{acting.ticket.ticketNo}</span>{' '}
              continues — a new one is not issued. The full history, including this re-open, stays
              visible to you and to the helpdesk.
            </Banner>
          )}
          {acting?.action === 'Closed' && (
            <Banner tone="info">
              The date and time of your confirmation is recorded against the ticket.
            </Banner>
          )}
          {acting?.action === 'Cancelled' && (
            <Banner tone="warning">
              Only you can cancel a ticket you raised — a helpdesk agent cannot do this on your
              behalf.
            </Banner>
          )}

          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a note (optional)"
          />
        </div>
      </Modal>
    </div>
  )
}

