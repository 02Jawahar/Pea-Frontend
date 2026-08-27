import { CircleCheck, Download, Upload, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

import { Modal } from '@/components/common/Modal'
import { Banner, Button, Card, Field, Input, Select, Textarea } from '@/components/common/primitives'
import { useAuth } from '@/hooks/useAuth'
import { seed } from '@/mock/api'
import { cn } from '@/utils/cn'

type Resolution = 'Retry status query' | 'Mark settled' | 'Initiate refund'

const EXCEPTION_ROWS = [
  ['APP20240012345', 'TXN1234567890', 'Debited not credited', 750, '2024-05-12 11:25'],
  ['APP20240012352', 'TXN1234567897', 'Debited not credited', 750, '2024-05-13 09:41'],
  ['APP20240012359', 'PAYU884120', 'Credited not recorded', 750, '2024-05-14 16:02'],
  ['APP20240012366', 'PAYU884133', 'Amount mismatch', 700, '2024-05-15 10:18'],
  ['APP20240012373', 'TXN1234567911', 'Debited not credited', 750, '2024-05-16 12:55'],
]

/**
 * Ref. 29 — the Department reconciles payments against bank details from the
 * nodal bank or gateway, including exception handling, and settles against
 * electronic bank statement files where the nodal bank provides them.
 */
export default function PaymentReconciliation() {
  const { can } = useAuth()
  const [resolving, setResolving] = useState<(typeof EXCEPTION_ROWS)[number] | null>(null)
  const [resolution, setResolution] = useState<Resolution>('Retry status query')
  const [reason, setReason] = useState('')
  const [uploading, setUploading] = useState(false)

  const r = seed.reconciliation
  const matched = r.portalTransactions.count - r.unmatched.count

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Payment Reconciliation</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Reconciliation for {r.date} · portal, gateway and nodal bank statement
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={!can('reconciliation.view')}
            onClick={() => setUploading(true)}
          >
            <Upload className="size-4" />
            Upload bank statement
          </Button>
          <Button variant="secondary">
            <Download className="size-4" />
            Export reconciliation
          </Button>
        </div>
      </div>

      <Card title="Reconciliation summary" bodyClassName="p-0">
        <table className="w-full">
          <tbody>
            {[
              ['Portal transactions', r.portalTransactions.count, r.portalTransactions.amount, false],
              ['Gateway settled', r.gatewaySettled.count, r.gatewaySettled.amount, false],
              ['Bank statement', r.bankStatement.count, r.bankStatement.amount, false],
            ].map(([label, count, amount]) => (
              <tr key={String(label)} className="border-b border-grey-200">
                <th scope="row" className="px-4 py-2.5 text-left text-[13px] font-normal text-grey-700">
                  {String(label)}
                </th>
                <td className="px-4 py-2.5 text-right font-mono text-[13px] text-navy-900">
                  {Number(count).toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-[13px] text-navy-900">
                  ₹ {Number(amount).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
            <tr className="bg-red-050">
              <th scope="row" className="px-4 py-3 text-left text-[13px] font-semibold text-red-600">
                Unmatched
              </th>
              <td className="px-4 py-3 text-right font-mono text-[14px] font-semibold text-red-600">
                {r.unmatched.count}
              </td>
              <td className="px-4 py-3 text-right font-mono text-[14px] font-semibold text-red-600">
                ₹ {r.unmatched.amount.toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>
      </Card>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card title="Matched">
          <p className="flex items-center gap-2 text-[24px] font-semibold text-green-600">
            <CircleCheck className="size-6" />
            {matched.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[12px] text-grey-600">
            {((matched / r.portalTransactions.count) * 100).toFixed(2)}% of portal transactions
          </p>
        </Card>

        {r.exceptions.map((exception) => (
          <Card key={exception.type} title={exception.type}>
            <p className="text-[24px] font-semibold text-amber-500">{exception.count}</p>
            <p className="mt-1 text-[12px] text-grey-600">
              {exception.type === 'Debited not credited'
                ? 'Money left the candidate; the gateway has no record.'
                : exception.type === 'Credited not recorded'
                  ? 'The gateway settled; the portal did not record it.'
                  : 'Settled amount differs from the fee charged.'}
            </p>
          </Card>
        ))}
      </div>

      <Card title="Exception queue" bodyClassName="p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-grey-200 bg-grey-050">
              {['Application No.', 'Gateway reference', 'Exception', 'Amount', 'Attempted at', 'Action'].map(
                (header) => (
                  <th
                    key={header}
                    className="px-4 py-2 text-left text-[12px] font-semibold uppercase"
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {EXCEPTION_ROWS.map((row) => (
              <tr key={String(row[1])} className="border-b border-grey-200 last:border-b-0">
                <td className="data-cell font-mono text-[12px]">{row[0]}</td>
                <td className="data-cell font-mono text-[12px]">{row[1]}</td>
                <td className="data-cell">
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[11px] font-medium',
                      row[2] === 'Debited not credited'
                        ? 'bg-red-050 text-red-600'
                        : row[2] === 'Credited not recorded'
                          ? 'bg-amber-050 text-amber-500'
                          : 'bg-blue-050 text-blue-500',
                    )}
                  >
                    {row[2]}
                  </span>
                </td>
                <td className="data-cell text-right font-mono">₹ {row[3]}</td>
                <td className="data-cell text-grey-600">{row[4]}</td>
                <td className="data-cell">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!can('reconciliation.view')}
                    onClick={() => {
                      setResolving(row)
                      setResolution(
                        row[2] === 'Debited not credited' ? 'Retry status query' : 'Mark settled',
                      )
                      setReason('')
                    }}
                  >
                    Resolve
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Banner tone="info" title="Never let a candidate double-pay">
        Where money was debited but the outcome is unknown, the candidate sees a pending state and a
        “Check payment status” action that re-queries the gateway. Resolving here updates what they
        see immediately.
      </Banner>

      <Modal
        open={resolving !== null}
        onClose={() => setResolving(null)}
        title="Resolve exception"
        description={resolving ? `${resolving[0]} · ${resolving[1]}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setResolving(null)}>
              Cancel
            </Button>
            <Button disabled={!reason.trim()} onClick={() => setResolving(null)}>
              Apply resolution
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Resolution" required>
            <Select value={resolution} onChange={(event) => setResolution(event.target.value as Resolution)}>
              {(['Retry status query', 'Mark settled', 'Initiate refund'] as Resolution[]).map(
                (option) => (
                  <option key={option}>{option}</option>
                ),
              )}
            </Select>
          </Field>

          <Field label="Reason" required hint="Recorded against the transaction and the audit log.">
            <Textarea value={reason} onChange={(event) => setReason(event.target.value)} />
          </Field>

          {resolution === 'Initiate refund' && (
            <Banner tone="warning" icon={<TriangleAlert className="size-4" />}>
              A refund is credited to the source account and cannot be reversed. Confirm the bank
              statement shows no matching credit before choosing this.
            </Banner>
          )}
        </div>
      </Modal>

      <Modal
        open={uploading}
        onClose={() => setUploading(false)}
        title="Upload nodal bank statement"
        footer={
          <>
            <Button variant="secondary" onClick={() => setUploading(false)}>
              Cancel
            </Button>
            <Button onClick={() => setUploading(false)}>Upload &amp; auto-match</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field
            label="Statement file"
            required
            hint="Electronic bank statement file (MT940, CSV or the nodal bank's fixed-width format)."
          >
            <Input type="file" accept=".csv,.txt,.sta" className="py-1.5" />
          </Field>
          <Field label="Statement date" required>
            <Input type="date" defaultValue={r.date} />
          </Field>
          <Banner tone="info">
            Rows are auto-matched on gateway reference and amount. Anything that does not match drops
            into the exception queue for manual resolution.
          </Banner>
        </div>
      </Modal>
    </div>
  )
}
