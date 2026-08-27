import { useEffect, useRef, useState } from 'react'

import { Modal } from './Modal'
import { Banner, Button } from './primitives'

/**
 * `<OtpModal>` — 6-digit, 30s resend cooldown, masked destination,
 * 3-attempt lockout. Any 6 digits are accepted in the demo; `123456` is shown
 * as the hint so the flow is walkable.
 */
interface OtpModalProps {
  open: boolean
  onClose: () => void
  onVerified: () => void
  destination: string
  purpose: string
}

/** Mounted only while open, so each attempt starts from a clean six blanks. */
export function OtpModal(props: OtpModalProps) {
  if (!props.open) return null
  return <OtpBody {...props} />
}

function OtpBody({ open, onClose, onVerified, destination, purpose }: OtpModalProps) {
  const [digits, setDigits] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [cooldown, setCooldown] = useState(30)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (cooldown === 0) return
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  const lockedOut = attempts >= 3

  function verify() {
    if (digits.length !== 6) {
      setError('Enter all 6 digits.')
      return
    }
    if (digits !== '123456') {
      const next = attempts + 1
      setAttempts(next)
      setError(
        next >= 3
          ? 'Three incorrect attempts. This OTP is locked — request a new one.'
          : `Incorrect OTP. ${3 - next} attempt${3 - next === 1 ? '' : 's'} remaining.`,
      )
      return
    }
    onVerified()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Verify with OTP"
      description={`A 6-digit code was sent to ${maskDestination(destination)} for ${purpose}.`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={verify} disabled={lockedOut}>
            Verify
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <input
          ref={inputRef}
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={digits}
          disabled={lockedOut}
          aria-label="6-digit OTP"
          onChange={(event) => {
            setDigits(event.target.value.replace(/\D/g, '').slice(0, 6))
            setError(null)
          }}
          className="field-input text-center text-[24px] tracking-[0.5em]"
          placeholder="——————"
        />

        {error && (
          <p className="text-[13px] text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between text-[13px]">
          <span className="text-grey-600">
            {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Did not receive the code?'}
          </span>
          <button
            type="button"
            disabled={cooldown > 0}
            onClick={() => {
              setCooldown(30)
              setAttempts(0)
              setError(null)
            }}
            className="font-medium text-navy-700 disabled:text-grey-600"
          >
            Resend OTP
          </button>
        </div>

        <Banner tone="info">Demo environment — use OTP 123456.</Banner>
      </div>
    </Modal>
  )
}

function maskDestination(value: string) {
  if (value.includes('@')) {
    const [user, domain] = value.split('@')
    return `${user.slice(0, 2)}${'•'.repeat(Math.max(2, user.length - 2))}@${domain}`
  }
  return `${'•'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`
}
