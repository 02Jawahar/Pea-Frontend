import { Download, FileText, IdCard, Receipt, Upload, Wallet } from 'lucide-react'
import { useState } from 'react'

import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Field, Input, Select } from '@/components/common/primitives'
import { SkeletonCards } from '@/components/common/states'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import { cn } from '@/utils/cn'
import { SummaryPanel } from '../examAdmin/widgets'

type BillStatus = 'Submitted' | 'Under Verification' | 'Approved' | 'Paid'

const BILLS: { id: string; category: string; amount: number; submitted: string; status: BillStatus }[] = [
  { id: 'b1', category: 'Travel — Karaikal to Puducherry', amount: 840, submitted: '2024-05-18', status: 'Paid' },
  { id: 'b2', category: 'Refreshments for hall staff', amount: 1250, submitted: '2024-05-19', status: 'Approved' },
  { id: 'b3', category: 'Stationery and seal supplies', amount: 460, submitted: '2024-05-20', status: 'Under Verification' },
  { id: 'b4', category: 'Local conveyance', amount: 320, submitted: '2024-05-20', status: 'Submitted' },
]

/**
 * Ref. 44, 50 — office order, ID card, attendance / acquittance download,
 * bill and voucher upload, and honorarium status.
 */
export default function InvigilatorDocuments() {
  const { data, isLoading } = useAsync(() => api.functionaries(), 'functionaries')
  const { staff } = useAuth()
  const [uploading, setUploading] = useState(false)

  if (isLoading) return <SkeletonCards />

  const me = (data ?? [])[0]
  const claimed = BILLS.reduce((sum, bill) => sum + bill.amount, 0)
  const paid = BILLS.filter((bill) => bill.status === 'Paid').reduce((sum, bill) => sum + bill.amount, 0)

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Orders &amp; Honorarium</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {staff?.name} · {staff?.designation} · {me?.centreName}
          </p>
        </div>
        <Button onClick={() => setUploading(true)}>
          <Upload className="size-4" />
          Upload bill / voucher
        </Button>
      </div>

      <KpiStrip>
        <KpiCard
          icon={<Wallet className="size-5" />}
          label="Honorarium"
          value={`₹ ${(me?.honorarium ?? 0).toLocaleString('en-IN')}`}
          subLabel={me?.paymentStatus === 'Paid' ? 'Credited' : 'Pending'}
          tone={me?.paymentStatus === 'Paid' ? 'green' : 'amber'}
        />
        <KpiCard
          icon={<Receipt className="size-5" />}
          label="Bills claimed"
          value={`₹ ${claimed.toLocaleString('en-IN')}`}
          subLabel={`${BILLS.length} claims`}
          tone="blue"
        />
        <KpiCard
          icon={<Receipt className="size-5" />}
          label="Settled"
          value={`₹ ${paid.toLocaleString('en-IN')}`}
          tone="green"
        />
        <KpiCard
          icon={<Receipt className="size-5" />}
          label="Awaiting settlement"
          value={`₹ ${(claimed - paid).toLocaleString('en-IN')}`}
          tone="amber"
        />
        <KpiCard
          icon={<IdCard className="size-5" />}
          label="Assignment"
          value={me?.assignment ?? 'Primary'}
          subLabel={me?.category}
          tone="purple"
        />
      </KpiStrip>

      <div className="grid flex-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="flex flex-col gap-4">
          <Card title="Downloads">
            <ul className="grid gap-2 sm:grid-cols-2">
              {[
                ['Office order (including reserve list)', FileText, 'Assignment order for this examination'],
                ['ID card', IdCard, 'Photo, designation, centre, exam and validity with QR'],
                ['Attendance sheet', FileText, 'Hall-wise seat list for the session'],
                ['Acquittance register', FileText, 'For signature at honorarium disbursement'],
              ].map(([label, Icon, detail]) => {
                const IconComponent = Icon as typeof FileText
                return (
                  <li
                    key={String(label)}
                    className="flex items-start gap-3 rounded-md border border-grey-200 px-3 py-2.5"
                  >
                    <IconComponent className="mt-0.5 size-4 shrink-0 text-navy-700" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-navy-900">{String(label)}</p>
                      <p className="clamp-2 text-[12px] text-grey-600">{String(detail)}</p>
                    </div>
                    <Button variant="ghost" size="sm" aria-label={`Download ${label}`}>
                      <Download className="size-4" />
                    </Button>
                  </li>
                )
              })}
            </ul>
          </Card>

          <Card title="Bills & vouchers" bodyClassName="p-0" className="flex-1">
            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  {['Category', 'Amount', 'Submitted', 'Status', 'Receipt'].map((header) => (
                    <th key={header} className="px-4 py-2 text-left text-[12px] font-semibold uppercase">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BILLS.map((bill) => (
                  <tr key={bill.id} className="border-b border-grey-200 last:border-b-0">
                    <td className="data-cell">{bill.category}</td>
                    <td className="data-cell text-right font-mono">
                      ₹ {bill.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="data-cell text-grey-600">{bill.submitted}</td>
                    <td className="data-cell">
                      <StatusPill
                        status={
                          bill.status === 'Paid'
                            ? 'Paid'
                            : bill.status === 'Approved'
                              ? 'Approved'
                              : bill.status === 'Under Verification'
                                ? 'Under Review'
                                : 'Submitted'
                        }
                      />
                    </td>
                    <td className="data-cell">
                      {bill.status === 'Paid' ? (
                        <Button variant="ghost" size="sm">
                          <Download className="size-4" />
                        </Button>
                      ) : (
                        <span className="text-[12px] text-grey-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-grey-200 px-4 py-3">
              <p className="text-[12px] text-grey-600">
                Settlement flow: <span className="font-medium text-navy-900">Submitted</span> →
                Under Verification → Approved → Paid. Each step is visible to you as it happens.
              </p>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <SummaryPanel
            title="Honorarium"
            rows={[
              { label: 'Category', value: me?.category ?? '—' },
              { label: 'Assignment', value: me?.assignment ?? '—' },
              { label: 'Rate', value: `₹ ${(me?.honorarium ?? 0).toLocaleString('en-IN')}` },
              { label: 'Payment mode', value: 'NEFT' },
              {
                label: 'Status',
                value: (
                  <span className={cn(me?.paymentStatus === 'Paid' ? 'text-green-600' : 'text-amber-500')}>
                    {me?.paymentStatus}
                  </span>
                ),
              },
              { label: 'Transaction reference', value: me?.paymentStatus === 'Paid' ? 'NEFT2405200011' : '—' },
              { label: 'Credited on', value: me?.paymentStatus === 'Paid' ? '2024-05-20' : '—' },
            ]}
            footer={
              me?.paymentStatus === 'Paid' ? (
                <Button variant="secondary" size="sm">
                  <Download className="size-3.5" />
                  Download receipt
                </Button>
              ) : (
                <span className="text-[12px] text-grey-600">
                  Receipt becomes available once the bank confirms the credit.
                </span>
              )
            }
          />

          <Banner tone="info" title="Answer sheet handover">
            The count of sheets handed over must equal the count of candidates present. Any variance
            is flagged prominently on the Centre Dashboard before handover is accepted.
          </Banner>
        </div>
      </div>

      <Modal
        open={uploading}
        onClose={() => setUploading(false)}
        title="Upload bill or voucher"
        footer={
          <>
            <Button variant="secondary" onClick={() => setUploading(false)}>
              Cancel
            </Button>
            <Button onClick={() => setUploading(false)}>Submit claim</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Category" required>
              <Select defaultValue="">
                <option value="">-- Select --</option>
                {['Travel', 'Local conveyance', 'Refreshments', 'Stationery', 'Other'].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            </Field>
            <Field label="Amount (₹)" required>
              <Input type="number" placeholder="0" />
            </Field>
          </div>
          <Field label="Supporting document" required hint="PDF or JPG, max 2 MB.">
            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" className="py-1.5" />
          </Field>
          <Banner tone="info">
            Claims are verified against the office order for this examination before approval.
          </Banner>
        </div>
      </Modal>
    </div>
  )
}
