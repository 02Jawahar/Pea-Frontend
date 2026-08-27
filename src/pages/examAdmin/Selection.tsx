import { Download, FileSignature, Megaphone, Undo2 } from 'lucide-react'
import { useState } from 'react'

import { DigitalSignModal } from '@/components/common/DigitalSignModal'
import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card } from '@/components/common/primitives'
import { SkeletonCards } from '@/components/common/states'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import { cn } from '@/utils/cn'
import { SummaryPanel } from './widgets'

/**
 * Ref. 59, 60, 62 — selection list.
 *
 * Generation is disabled until the merit list is approved and signed. Reverting
 * to merit is a named action whose confirmation spells out the consequence: the
 * merit list must be verified and approved again before the selection list can
 * be regenerated.
 */
export default function SelectionList() {
  const { data, isLoading } = useAsync(() => api.selectionLists(), 'selectionLists')
  const { data: meritLists } = useAsync(() => api.meritLists(), 'meritLists')
  const { staff, can } = useAuth()
  const [reverting, setReverting] = useState(false)
  const [signOpen, setSignOpen] = useState(false)
  const [published, setPublished] = useState(false)
  const [reverted, setReverted] = useState(false)

  if (isLoading) return <SkeletonCards />

  const selection = (data ?? [])[0]
  const merit = (meritLists ?? []).find((list) => list.id === selection?.meritListId)
  const meritApproved = Boolean(merit?.approved) && !reverted

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Selection List</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">{selection?.examName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={!can('selection.generate') || reverted}
            onClick={() => setReverting(true)}
          >
            <Undo2 className="size-4" />
            Revert to merit
          </Button>
          <Button
            variant="success"
            disabled={!can('selection.publish') || !meritApproved || published}
            onClick={() => setSignOpen(true)}
            title={
              !meritApproved
                ? 'The merit list must be verified, approved and signed before the selection list can be published.'
                : undefined
            }
          >
            <Megaphone className="size-4" />
            {published ? 'Published' : 'Sign & Publish'}
          </Button>
        </div>
      </div>

      {!meritApproved && (
        <Banner tone="warning" title="Merit approval is required first">
          The Selection List is generated on verification and approval of the Merit List (Ref. 59).
          Until that approval is digitally signed, generation and publication stay disabled — the
          controls remain visible so the reason is legible.
        </Banner>
      )}

      {published && (
        <Banner tone="success" title="Selection List published">
          Candidates can view and download it from their portal. The issue stamp appears both on the
          portal and on the downloaded PDF (Ref. 62).
        </Banner>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card title="Selection summary">
            <dl className="grid gap-3 sm:grid-cols-4">
              <Stat label="Total Vacancies" value={selection?.totalVacancies ?? 0} />
              <Stat label="Selected Candidates" value={selection?.selected ?? 0} tone="green" />
              <Stat label="Waiting List" value={selection?.waitingList ?? 0} tone="amber" />
              <Stat
                label="Approval Status"
                value={reverted ? 'Reverted' : (selection?.approvalStatus ?? 'Pending')}
              />
            </dl>
          </Card>

          <Card title="Selected candidates" bodyClassName="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  {['Rank', 'Roll Number', 'Candidate Name', 'Category', 'Normalized Marks', 'Status'].map(
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
                {seed.meritEntries.map((entry, index) => (
                  <tr key={entry.rollNo} className="border-b border-grey-200 last:border-b-0">
                    <td className="data-cell font-semibold">{entry.rank}</td>
                    <td className="data-cell font-mono text-[12px]">{entry.rollNo}</td>
                    <td className="data-cell">{entry.candidateName}</td>
                    <td className="data-cell">{entry.category}</td>
                    <td className="data-cell font-mono">{entry.normalizedMarks.toFixed(4)}</td>
                    <td className="data-cell">
                      <StatusPill status={index < 8 ? 'Selected' : 'Waiting List'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="Wait list">
            <p className="text-[13px] text-grey-600">
              The wait list expires on <strong>10-Sep-2025</strong>, one of the thirteen schedule
              dates in the notification. Candidates see their position, its movement and the expiry
              countdown in their own portal.
            </p>
          </Card>
        </div>

        <div className="space-y-4">
          <SummaryPanel
            title="Publication"
            rows={[
              { label: 'Merit list', value: merit?.examName ?? '—' },
              { label: 'Merit version', value: `v${merit?.version ?? 1}` },
              {
                label: 'Merit approval',
                value: meritApproved ? 'Signed' : 'Not signed',
              },
              { label: 'Issued at', value: published ? selection?.issuedAt ?? '—' : 'Not issued' },
              { label: 'Signed by', value: merit?.signedBy ?? 'Not signed' },
            ]}
          />

          <Card title="Downloads">
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start" disabled={!published}>
                <Download className="size-4" />
                Selection List (PDF, watermarked)
              </Button>
              <Button variant="secondary" className="w-full justify-start" disabled={!published}>
                <FileSignature className="size-4" />
                Generate Appointment Orders
              </Button>
            </div>
            <p className="mt-2 text-[12px] text-grey-600">
              Downloads carry the issuing officer's ID as a watermark and are logged.
            </p>
          </Card>
        </div>
      </div>

      <Modal
        open={reverting}
        onClose={() => setReverting(false)}
        title="Revert the selection list to merit?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReverting(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setReverted(true)
                setPublished(false)
                setReverting(false)
              }}
            >
              Revert to merit
            </Button>
          </>
        }
      >
        <Banner tone="warning" title="What happens next">
          The selection list is withdrawn and the merit list returns for correction. Before the
          selection list can be regenerated, the merit list must be{' '}
          <strong>verified and approved again</strong>, including a fresh digital signature by the
          competent official.
        </Banner>
      </Modal>

      <DigitalSignModal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        onSigned={() => setPublished(true)}
        signerName={staff?.name ?? 'Officer'}
        artefact={`Selection List — ${selection?.examName}`}
        checkpoint="Checkpoint 9 of 9 — Selection List approval (Ref. 59)"
      />
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone?: 'green' | 'amber'
}) {
  return (
    <div className="rounded-md border border-grey-200 px-3 py-2.5">
      <dt className="text-[12px] text-grey-600">{label}</dt>
      <dd
        className={cn(
          'text-[20px] font-semibold',
          tone === 'green' ? 'text-green-600' : tone === 'amber' ? 'text-amber-500' : 'text-navy-900',
        )}
      >
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </dd>
    </div>
  )
}
