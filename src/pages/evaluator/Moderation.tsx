import { ArrowRightLeft, RefreshCcw, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

import { DataTable, type Column } from '@/components/common/DataTable'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Field, Select, Tabs, Textarea } from '@/components/common/primitives'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

type TabId = 'moderation' | 'reevaluation' | 'performance'

interface ModerationRow {
  id: string
  scriptId: string
  rollNo: string
  evaluator: string
  original: number
  moderator: number | null
  status: 'Pending' | 'Accepted' | 'Revised'
}

const SAMPLE: ModerationRow[] = [
  ['AGR2/GS/I/2024/0002456', '1023456', 'Evaluator 01', 68.5, 68.5, 'Accepted'],
  ['AGR2/GS/I/2024/0002461', '1023461', 'Evaluator 01', 74.0, 69.5, 'Revised'],
  ['AGR2/GS/I/2024/0002478', '1023478', 'Evaluator 07', 55.25, null, 'Pending'],
  ['AGR2/GS/I/2024/0002490', '1023490', 'Evaluator 07', 81.75, 81.75, 'Accepted'],
  ['AGR2/GS/I/2024/0002502', '1023502', 'Evaluator 12', 39.5, 47.0, 'Revised'],
  ['AGR2/GS/I/2024/0002518', '1023518', 'Evaluator 12', 62.0, null, 'Pending'],
  ['AGR2/GS/I/2024/0002533', '1023533', 'Evaluator 19', 71.25, 71.25, 'Accepted'],
  ['AGR2/GS/I/2024/0002547', '1023547', 'Evaluator 19', 58.75, null, 'Pending'],
].map(([scriptId, rollNo, evaluator, original, moderator, status], index) => ({
  id: `mod-${index + 1}`,
  scriptId: String(scriptId),
  rollNo: String(rollNo),
  evaluator: String(evaluator),
  original: Number(original),
  moderator: moderator === null ? null : Number(moderator),
  status: status as ModerationRow['status'],
}))

const REEVALUATION = [
  ['AGR2/GS/I/2024/0002612', '1023612', 'Candidate requested', 'Evaluator 01 → Evaluator 22', 61.5, 64.0, 'Higher marks stand'],
  ['AGR2/GS/I/2024/0002655', '1023655', 'Candidate requested', 'Evaluator 07 → Evaluator 30', 48.0, 47.5, 'Higher marks stand'],
  ['AGR2/GS/I/2024/0002698', '1023698', 'PEA initiated', 'Evaluator 12 → Evaluator 41', 39.5, 58.0, 'Third evaluation — variance > 15'],
  ['AGR2/GS/I/2024/0002731', '1023731', 'Candidate requested', 'Evaluator 19 → Evaluator 08', 72.25, 72.25, 'Unchanged'],
  ['AGR2/GS/I/2024/0002766', '1023766', 'PEA initiated', 'Evaluator 22 → Evaluator 03', 55.0, 60.5, 'Higher marks stand'],
]

const PERFORMANCE = [
  ['Evaluator 01', 130, 67.48, 0.0, 4, 6.2],
  ['Evaluator 07', 118, 71.02, 3.54, 11, 5.4],
  ['Evaluator 12', 96, 58.31, -9.17, 18, 8.9],
  ['Evaluator 19', 142, 66.90, -0.58, 3, 5.1],
  ['Evaluator 22', 108, 69.44, 1.96, 7, 6.8],
]

/**
 * Flow 6 — moderation and re-evaluation.
 *
 * Moderation puts the original marks beside the moderator's with the deviation
 * highlighted; the per-evaluator deviation summary feeds Performance Reports.
 * Re-evaluation is blind and versioned, and a large variance triggers a third
 * evaluation rather than an average.
 */
export default function Moderation() {
  const { can } = useAuth()
  const [tab, setTab] = useState<TabId>('moderation')
  const [reviewing, setReviewing] = useState<ModerationRow | null>(null)
  const [remarks, setRemarks] = useState('')

  const pending = SAMPLE.filter((row) => row.status === 'Pending').length
  const revised = SAMPLE.filter((row) => row.status === 'Revised').length

  const columns: Column<ModerationRow>[] = [
    {
      key: 'script',
      header: 'Script ID',
      accessor: (row) => row.scriptId,
      sortable: true,
      render: (row) => <span className="font-mono text-[12px]">{row.scriptId}</span>,
    },
    { key: 'roll', header: 'Roll No.', accessor: (row) => row.rollNo },
    { key: 'evaluator', header: 'Evaluator', accessor: (row) => row.evaluator, sortable: true },
    {
      key: 'original',
      header: 'Original',
      accessor: (row) => row.original,
      sortable: true,
      className: 'text-right font-mono',
      headerClassName: 'text-right',
      render: (row) => row.original.toFixed(4),
    },
    {
      key: 'moderator',
      header: 'Moderator',
      accessor: (row) => row.moderator ?? -1,
      className: 'text-right font-mono',
      headerClassName: 'text-right',
      render: (row) => (row.moderator === null ? '—' : row.moderator.toFixed(4)),
    },
    {
      key: 'deviation',
      header: 'Deviation',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (row) => {
        if (row.moderator === null) return <span className="text-grey-600">—</span>
        const delta = row.moderator - row.original
        if (delta === 0) return <span className="text-grey-600">0.00</span>
        return (
          <span
            className={cn(
              'font-mono font-medium',
              Math.abs(delta) > 5 ? 'text-red-600' : 'text-amber-500',
            )}
          >
            {delta > 0 ? '+' : ''}
            {delta.toFixed(2)}
          </span>
        )
      },
    },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status === 'Revised' ? 'Re-evaluation' : row.status === 'Accepted' ? 'Completed' : 'Pending'} /> },
    {
      key: 'action',
      header: '',
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          disabled={!can('evaluation.moderate')}
          onClick={() => {
            setReviewing(row)
            setRemarks('')
          }}
        >
          {row.status === 'Pending' ? 'Moderate' : 'View'}
        </Button>
      ),
    },
  ]

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Review &amp; Moderation</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          A 5% sample of evaluated scripts, plus the re-evaluation queue and per-evaluator deviation.
        </p>
      </div>

      <KpiStrip>
        <KpiCard icon={<ArrowRightLeft className="size-5" />} label="Sample size" value={SAMPLE.length} tone="purple" />
        <KpiCard icon={<ArrowRightLeft className="size-5" />} label="Pending moderation" value={pending} tone="amber" />
        <KpiCard icon={<ArrowRightLeft className="size-5" />} label="Revised" value={revised} tone="red" />
        <KpiCard
          icon={<RefreshCcw className="size-5" />}
          label="Re-evaluation queue"
          value={REEVALUATION.length}
          tone="blue"
        />
        <KpiCard
          icon={<TriangleAlert className="size-5" />}
          label="Evaluators over deviation threshold"
          value={1}
          subLabel="Evaluator 12 · −9.17"
          tone="navy"
        />
      </KpiStrip>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'moderation', label: 'Moderation sample', count: SAMPLE.length },
          { id: 'reevaluation', label: 'Re-evaluation', count: REEVALUATION.length },
          { id: 'performance', label: 'Per-evaluator deviation', count: PERFORMANCE.length },
        ]}
      />

      {tab === 'moderation' && (
        <Card className="flex-1">
          <DataTable
            rows={SAMPLE}
            columns={columns}
            rowKey={(row) => row.id}
            searchPlaceholder="Search by script ID, roll number or evaluator"
            searchFields={(row) => `${row.scriptId} ${row.rollNo} ${row.evaluator}`}
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: ['Pending', 'Accepted', 'Revised'],
                match: (row, value) => row.status === value,
              },
            ]}
            pageSize={10}
            emptyTitle="Nothing to moderate"
            emptyDescription="The moderation sample is drawn once a batch completes."
          />
        </Card>
      )}

      {tab === 'reevaluation' && (
        <Card title="Re-evaluation queue" bodyClassName="p-0" className="flex-1">
          <Banner tone="info" className="m-4 mb-0">
            Re-evaluation is blind: the second evaluator sees neither the candidate's identity nor
            the first evaluator's marks. Where the variance exceeds 15 marks a third evaluation is
            triggered rather than averaging the two.
          </Banner>
          <table className="mt-4 w-full">
            <thead>
              <tr className="border-y border-grey-200 bg-grey-050">
                {['Script ID', 'Roll No.', 'Trigger', 'Assignment', 'First', 'Second', 'Rule applied'].map(
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
              {REEVALUATION.map((row) => (
                <tr key={String(row[0])} className="border-b border-grey-200 last:border-b-0">
                  <td className="data-cell font-mono text-[12px]">{row[0]}</td>
                  <td className="data-cell font-mono text-[12px]">{row[1]}</td>
                  <td className="data-cell">{row[2]}</td>
                  <td className="data-cell text-grey-600">{row[3]}</td>
                  <td className="data-cell text-right font-mono">{Number(row[4]).toFixed(4)}</td>
                  <td className="data-cell text-right font-mono">{Number(row[5]).toFixed(4)}</td>
                  <td className="data-cell">
                    <span
                      className={cn(
                        'text-[12px]',
                        String(row[6]).startsWith('Third') ? 'font-medium text-red-600' : 'text-grey-600',
                      )}
                    >
                      {row[6]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'performance' && (
        <Card title="Per-evaluator deviation" bodyClassName="p-0" className="flex-1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey-200 bg-grey-050">
                {['Evaluator', 'Scripts completed', 'Average marks', 'Deviation from batch mean', 'Moderation revisions', 'Minutes per script'].map(
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
              {PERFORMANCE.map((row) => (
                <tr key={String(row[0])} className="border-b border-grey-200 last:border-b-0">
                  <td className="data-cell font-medium">{row[0]}</td>
                  <td className="data-cell text-right font-mono">{row[1]}</td>
                  <td className="data-cell text-right font-mono">{Number(row[2]).toFixed(2)}</td>
                  <td className="data-cell text-right">
                    <span
                      className={cn(
                        'font-mono font-medium',
                        Math.abs(Number(row[3])) > 5
                          ? 'text-red-600'
                          : Math.abs(Number(row[3])) > 2
                            ? 'text-amber-500'
                            : 'text-grey-700',
                      )}
                    >
                      {Number(row[3]) > 0 ? '+' : ''}
                      {Number(row[3]).toFixed(2)}
                    </span>
                  </td>
                  <td className="data-cell text-right font-mono">{row[4]}</td>
                  <td className="data-cell text-right font-mono">{Number(row[5]).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 py-3 text-[12px] text-grey-600">
            Evaluator 12 marks 9.17 below the batch mean with 18 moderation revisions — flagged for
            a full sample review before their batches are accepted.
          </p>
        </Card>
      )}

      <Modal
        open={reviewing !== null}
        onClose={() => setReviewing(null)}
        title={reviewing ? `Moderate ${reviewing.scriptId}` : ''}
        description={reviewing ? `${reviewing.evaluator} · roll ${reviewing.rollNo}` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReviewing(null)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => setReviewing(null)}>
              Accept original
            </Button>
            <Button disabled={!remarks.trim()} onClick={() => setReviewing(null)}>
              Revise marks
            </Button>
          </>
        }
      >
        {reviewing && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-grey-200 p-3">
                <p className="text-[12px] text-grey-600">Original evaluator</p>
                <p className="font-mono text-[24px] font-semibold text-navy-900">
                  {reviewing.original.toFixed(4)}
                </p>
                <p className="text-[12px] text-grey-600">{reviewing.evaluator}</p>
              </div>
              <div className="rounded-md border border-purple-100 bg-purple-050 p-3">
                <p className="text-[12px] text-grey-600">Your marks</p>
                <Field label="">
                  <input
                    type="number"
                    step={0.25}
                    defaultValue={reviewing.moderator ?? reviewing.original}
                    className="field-input font-mono text-[20px]"
                    aria-label="Moderator marks"
                  />
                </Field>
              </div>
            </div>

            <Field label="Moderator remarks" required>
              <Textarea
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Why the original marks are being revised — visible to the evaluator and in the audit trail."
              />
            </Field>

            <Field label="Feed into">
              <Select defaultValue="Performance report for this evaluator">
                <option>Performance report for this evaluator</option>
                <option>Performance report and a full sample review</option>
              </Select>
            </Field>
          </div>
        )}
      </Modal>
    </div>
  )
}
