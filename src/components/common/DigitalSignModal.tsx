import { BadgeCheck, KeyRound, ShieldCheck, Usb } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/utils/cn'
import { Modal } from './Modal'
import { Banner, Button, Spinner } from './primitives'

/**
 * The nine digital-signature checkpoints in 00-README.md all route through this
 * one modal: DSC token vs Aadhaar e-Sign, certificate detail, sign confirmation
 * and a signed-artefact receipt. For e-Sign the public key returned by the
 * platform is captured and displayed (Ref. 12).
 */

export interface SignatureReceipt {
  method: 'DSC Token' | 'Aadhaar e-Sign'
  signedBy: string
  certificateSerial: string
  signedAt: string
  publicKey?: string
  artefact: string
}

type Phase = 'choose' | 'signing' | 'done'

interface DigitalSignModalProps {
  open: boolean
  onClose: () => void
  onSigned: (receipt: SignatureReceipt) => void
  /** What is being signed, e.g. "Requisition REQ/REV/2024/0007". */
  artefact: string
  signerName: string
  /** The checkpoint number + Ref., shown so the user knows why a signature is required. */
  checkpoint: string
}

/**
 * The body holds all the state and is mounted only while the dialog is open,
 * so re-opening starts from a clean choose-method step without a reset effect.
 */
export function DigitalSignModal(props: DigitalSignModalProps) {
  if (!props.open) return null
  return <SignBody {...props} />
}

function SignBody({ open, onClose, onSigned, artefact, signerName, checkpoint }: DigitalSignModalProps) {
  const [method, setMethod] = useState<SignatureReceipt['method']>('DSC Token')
  const [phase, setPhase] = useState<Phase>('choose')
  const [receipt, setReceipt] = useState<SignatureReceipt | null>(null)

  function sign() {
    setPhase('signing')
    window.setTimeout(() => {
      const next: SignatureReceipt = {
        method,
        signedBy: signerName,
        certificateSerial:
          method === 'DSC Token' ? '4F:22:9A:C1:80:3E:77:D5' : 'ESIGN-UIDAI-2024-88213',
        signedAt: '20-May-2024 12:41:07 IST',
        publicKey:
          method === 'Aadhaar e-Sign'
            ? 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7Vx…q2QIDAQAB'
            : undefined,
        artefact,
      }
      setReceipt(next)
      setPhase('done')
    }, 1100)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Digital signature required"
      description={checkpoint}
      footer={
        phase === 'done' ? (
          <Button
            variant="success"
            onClick={() => {
              if (receipt) onSigned(receipt)
              onClose()
            }}
          >
            Continue
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={sign} isLoading={phase === 'signing'}>
              {phase === 'signing' ? 'Signing…' : 'Sign now'}
            </Button>
          </>
        )
      }
    >
      {phase === 'done' && receipt ? (
        <div className="space-y-3">
          <Banner tone="success" icon={<BadgeCheck className="size-4" />} title="Signature applied">
            The signed artefact has been stored with its certificate details.
          </Banner>
          <dl className="divide-y divide-grey-200 rounded-md border border-grey-200">
            <Row label="Artefact" value={receipt.artefact} />
            <Row label="Method" value={receipt.method} />
            <Row label="Signed by" value={receipt.signedBy} />
            <Row label="Certificate serial" value={receipt.certificateSerial} mono />
            <Row label="Signed at" value={receipt.signedAt} />
            {receipt.publicKey && <Row label="Public key stored" value={receipt.publicKey} mono />}
          </dl>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[13px] text-grey-600">
            Signing <span className="font-medium text-navy-900">{artefact}</span> as{' '}
            <span className="font-medium text-navy-900">{signerName}</span>.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <MethodOption
              icon={<Usb className="size-4" />}
              label="DSC Token"
              detail="Class 3 certificate on a cryptographic USB token."
              selected={method === 'DSC Token'}
              onSelect={() => setMethod('DSC Token')}
            />
            <MethodOption
              icon={<KeyRound className="size-4" />}
              label="Aadhaar e-Sign"
              detail="OTP to the Aadhaar-registered mobile. Public key is captured."
              selected={method === 'Aadhaar e-Sign'}
              onSelect={() => setMethod('Aadhaar e-Sign')}
            />
          </div>

          {phase === 'signing' && (
            <p className="flex items-center gap-2 text-[13px] text-grey-600">
              <Spinner /> Contacting the signing service…
            </p>
          )}

          <Banner tone="info" icon={<ShieldCheck className="size-4" />}>
            The signed record is stored encrypted; the certificate and timestamp become part of the
            workflow trail.
          </Banner>
        </div>
      )}
    </Modal>
  )
}

function MethodOption({
  icon,
  label,
  detail,
  selected,
  onSelect,
}: {
  icon: React.ReactNode
  label: string
  detail: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'rounded-md border p-3 text-left transition-colors',
        selected ? 'border-navy-700 bg-blue-050' : 'border-grey-200 hover:bg-grey-050',
      )}
    >
      <span className="flex items-center gap-2 text-[13px] font-semibold text-navy-900">
        {icon}
        {label}
      </span>
      <span className="mt-1 block text-[12px] text-grey-600">{detail}</span>
    </button>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2 px-3 py-2">
      <dt className="w-40 shrink-0 text-[12px] text-grey-600">{label}</dt>
      <dd
        className={cn('min-w-0 flex-1 text-[13px] break-all text-navy-900', mono && 'font-mono text-[12px]')}
      >
        {value}
      </dd>
    </div>
  )
}
