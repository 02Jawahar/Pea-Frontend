import { useState } from 'react'

import { cn } from '@/utils/cn'
import { Button, Textarea } from './primitives'

export type ApprovalAction = 'Approve' | 'Send Back' | 'Reject'

/**
 * `<ApprovalBar>` — sticky footer with Approve / Send Back / Reject and
 * mandatory remarks on anything other than Approve.
 */
export function ApprovalBar({
  onAct,
  disabled,
  disabledReason,
  approveLabel = 'Approve & Sign',
  busy = false,
}: {
  onAct: (action: ApprovalAction, remarks: string) => void
  disabled?: boolean
  disabledReason?: string
  approveLabel?: string
  busy?: boolean
}) {
  const [pending, setPending] = useState<ApprovalAction | null>(null)
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState<string | null>(null)

  function choose(action: ApprovalAction) {
    if (action === 'Approve') {
      onAct('Approve', remarks)
      return
    }
    setPending(action)
    setError(null)
  }

  function confirm() {
    if (!remarks.trim()) {
      setError(`Remarks are mandatory when you ${pending?.toLowerCase()} a record.`)
      return
    }
    onAct(pending!, remarks.trim())
    setPending(null)
    setRemarks('')
  }

  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-4 border-t border-grey-200 bg-white px-4 py-3 sm:-mx-6 sm:px-6">
      {pending && (
        <div className="mb-3">
          <Textarea
            autoFocus
            value={remarks}
            onChange={(event) => {
              setRemarks(event.target.value)
              setError(null)
            }}
            placeholder={`Reason for ${pending.toLowerCase()} — this is recorded in the workflow trail and shown to the originating office.`}
            className={cn(error && 'border-red-600')}
          />
          {error && (
            <p className="mt-1 text-[12px] text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-grey-600">
          {disabled
            ? disabledReason
            : 'Every approval is digitally signed and recorded against your office (Ref. 12).'}
        </p>

        <div className="flex items-center gap-2">
          {pending ? (
            <>
              <Button variant="secondary" onClick={() => setPending(null)}>
                Cancel
              </Button>
              <Button
                variant={pending === 'Reject' ? 'danger' : 'primary'}
                onClick={confirm}
                isLoading={busy}
              >
                Confirm {pending}
              </Button>
            </>
          ) : (
            <>
              <Button variant="danger" disabled={disabled} onClick={() => choose('Reject')}>
                Reject
              </Button>
              <Button variant="secondary" disabled={disabled} onClick={() => choose('Send Back')}>
                Send Back
              </Button>
              <Button
                variant="success"
                disabled={disabled}
                isLoading={busy}
                onClick={() => choose('Approve')}
              >
                {approveLabel}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
