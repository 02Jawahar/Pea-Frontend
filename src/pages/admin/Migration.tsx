import { CircleCheck, Database, Download, Play, ShieldAlert } from 'lucide-react'
import { useState } from 'react'

import { StepperWizard } from '@/components/common/StepperWizard'
import { Banner, Button, Card, ProgressBar } from '@/components/common/primitives'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

const STAGES = [
  { id: 'metadata', label: 'Metadata' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'import', label: 'Import' },
  { id: 'integration', label: 'Integration' },
  { id: 'reports', label: 'Reports' },
]

/**
 * Ref. 74–78 — a one-time workstream with an operator console.
 *
 * Every stage produces documentation the RFP requires for audit: the cleaning
 * trail (Ref. 76), the staged-schema separation (Ref. 77), and the per-table
 * integration results (Ref. 78).
 */
export default function DataMigration() {
  const { can } = useAuth()
  const [stage, setStage] = useState(1)

  const readOnly = !can('migration.run')

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Data Migration</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Legacy PEA database → e-Exam 2.0. Five sequential stages, each producing an audit artefact.
        </p>
      </div>

      <Card>
        <StepperWizard steps={STAGES} current={stage} onStepClick={setStage} />
      </Card>

      {stage === 0 && (
        <Card title="Stage 1 — Metadata consolidation (Ref. 74, 75)">
          <div className="space-y-3">
            <p className="text-[13px] text-grey-600">
              Study the existing structure, consolidate the extracted metadata with data constraints
              and validations, then create the target tables from the consolidated metadata.
            </p>
            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  {['Source table', 'Columns', 'Constraints', 'Validations', 'Rows', 'Mapped to'].map(
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
                {[
                  ['CAND_MASTER', 42, 6, 11, '248,301', 'pea_candidate'],
                  ['APPL_DETAIL', 38, 9, 14, '412,880', 'pea_application'],
                  ['EXAM_CENTRE', 17, 3, 4, '312', 'pea_centre'],
                  ['MARKS_OMR', 12, 4, 7, '1,104,220', 'pea_marks'],
                  ['SELECT_LIST', 15, 5, 6, '18,441', 'pea_selection'],
                ].map((row) => (
                  <tr key={String(row[0])} className="border-b border-grey-200 last:border-b-0">
                    <td className="data-cell font-mono text-[12px]">{row[0]}</td>
                    <td className="data-cell">{row[1]}</td>
                    <td className="data-cell">{row[2]}</td>
                    <td className="data-cell">{row[3]}</td>
                    <td className="data-cell text-right font-mono text-[12px]">{row[4]}</td>
                    <td className="data-cell font-mono text-[12px] text-navy-700">{row[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" disabled={readOnly}>
                Review generated DDL
              </Button>
              <Button disabled={readOnly}>
                <Play className="size-4" />
                Create target schema
              </Button>
            </div>
          </div>
        </Card>
      )}

      {stage === 1 && (
        <Card title="Stage 2 — Data cleaning (Ref. 76)">
          <div className="space-y-3">
            <Banner tone="info" title="Every step is documented">
              Cleaning uses tools that save a trail of the activity, and the results of each stage
              are saved for audit. The stage report below is generated automatically and retained.
            </Banner>

            <p className="text-[13px] font-medium text-navy-900">
              Table: <span className="font-mono">candidate_master</span> · Rows: 248,301
            </p>

            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  {['Criterion', 'Rows affected', 'Detail', 'Rule'].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-2 text-left text-[12px] font-semibold uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Improper data format', '4,182', 'dob (2,940) · mobile (1,242)', 'Normalise to ISO-8601 / 10-digit'],
                  ['Blank data records', '317', 'name, dob or category blank', 'Quarantine for manual review'],
                  ['Incomplete data', '1,058', 'address without PIN code', 'Derive PIN from district where unique'],
                  ['Repetitive data', '486', 'duplicate aadhaar + dob', 'Dedupe on aadhaar+dob, keep latest'],
                ].map((row) => (
                  <tr key={String(row[0])} className="border-b border-grey-200 last:border-b-0">
                    <td className="data-cell font-medium">{row[0]}</td>
                    <td className="data-cell text-right font-mono">{row[1]}</td>
                    <td className="data-cell text-grey-600">{row[2]}</td>
                    <td className="data-cell text-grey-600">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" disabled={readOnly}>
                Preview changes
              </Button>
              <Button disabled={readOnly}>
                <Play className="size-4" />
                Run cleaning
              </Button>
              <Button variant="secondary">
                <Download className="size-4" />
                Download stage report
              </Button>
            </div>
          </div>
        </Card>
      )}

      {stage === 2 && (
        <Card title="Stage 3 — Import (Ref. 77)">
          <div className="space-y-3">
            <Banner tone="warning" icon={<ShieldAlert className="size-4" />} title="Staging schema — not the main database">
              Imported data is stored as a <strong>separate database schema</strong>, deliberately
              outside the main database. Everything on this stage is labelled{' '}
              <span className="font-mono">pea_staging</span> so the separation is never ambiguous.
            </Banner>

            <ul className="space-y-2">
              {[
                ['pea_staging.candidate', 248301, 100],
                ['pea_staging.application', 412880, 100],
                ['pea_staging.centre', 312, 100],
                ['pea_staging.marks', 1104220, 74],
                ['pea_staging.selection', 18441, 0],
              ].map(([table, rows, progress]) => (
                <li key={String(table)} className="flex flex-wrap items-center gap-3">
                  <span className="w-56 shrink-0 font-mono text-[12px] text-navy-900">{table}</span>
                  <span className="w-24 shrink-0 text-right font-mono text-[12px] text-grey-600">
                    {Number(rows).toLocaleString('en-IN')}
                  </span>
                  <ProgressBar value={Number(progress)} showLabel tone="blue" className="min-w-40 flex-1" />
                </li>
              ))}
            </ul>

            <p className="text-[12px] text-grey-600">
              Relations between tables are maintained along with their constraints and validations.
            </p>
          </div>
        </Card>
      )}

      {stage === 3 && (
        <Card title="Stage 4 — Integration (Ref. 78)">
          <div className="space-y-3">
            <Banner tone="info" title="Table by table, with a correctness check after each">
              Integration follows FK dependency order. Each table halts on failure and rolls back,
              and the result of every integration is documented for subsequent reference and audit.
            </Banner>

            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  {['#', 'Table', 'Rows', 'Row count check', 'Referential integrity', 'Spot check', 'Result'].map(
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
                {[
                  [1, 'pea_centre', '312', true, true, true, 'Passed'],
                  [2, 'pea_candidate', '247,815', true, true, true, 'Passed'],
                  [3, 'pea_application', '412,880', true, true, true, 'Passed'],
                  [4, 'pea_marks', '1,104,220', true, false, true, 'Halted'],
                  [5, 'pea_selection', '18,441', false, false, false, 'Not started'],
                ].map((row) => (
                  <tr
                    key={String(row[1])}
                    className={cn(
                      'border-b border-grey-200 last:border-b-0',
                      row[6] === 'Halted' && 'bg-red-050',
                    )}
                  >
                    <td className="data-cell">{row[0]}</td>
                    <td className="data-cell font-mono text-[12px]">{row[1]}</td>
                    <td className="data-cell text-right font-mono text-[12px]">{row[2]}</td>
                    {[3, 4, 5].map((index) => (
                      <td key={index} className="data-cell">
                        {row[6] === 'Not started' ? (
                          <span className="text-grey-600">—</span>
                        ) : row[index] ? (
                          <CircleCheck className="size-4 text-green-600" />
                        ) : (
                          <span className="text-red-600">Failed</span>
                        )}
                      </td>
                    ))}
                    <td className="data-cell">
                      <span
                        className={cn(
                          'font-medium',
                          row[6] === 'Passed'
                            ? 'text-green-600'
                            : row[6] === 'Halted'
                              ? 'text-red-600'
                              : 'text-grey-600',
                        )}
                      >
                        {row[6]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Banner tone="danger" title="pea_marks halted on referential integrity">
              1,240 rows reference an application reference number that does not exist in
              pea_application. The table has been rolled back. Resolve in Stage 2 cleaning, re-import,
              then re-run this table.
            </Banner>
          </div>
        </Card>
      )}

      {stage === 4 && (
        <Card title="Stage 5 — Migration reports">
          <p className="mb-3 text-[13px] text-grey-600">
            Every stage report in one place, downloadable and retained. This is the artefact PEA
            signs off against.
          </p>
          <ul className="divide-y divide-grey-200 rounded-md border border-grey-200">
            {[
              ['Stage 1 — Metadata consolidation report', '2024-05-06', 'PDF'],
              ['Stage 2 — Data cleaning report (candidate_master)', '2024-05-09', 'PDF'],
              ['Stage 2 — Data cleaning report (application_detail)', '2024-05-10', 'PDF'],
              ['Stage 3 — Staging import report', '2024-05-14', 'Excel'],
              ['Stage 4 — Integration report (4 of 5 tables)', '2024-05-19', 'PDF'],
            ].map(([name, date, format]) => (
              <li key={name} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                <Database className="size-4 shrink-0 text-grey-600" />
                <span className="min-w-0 flex-1 text-[13px] text-navy-900">{name}</span>
                <span className="text-[12px] text-grey-600">{date}</span>
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[11px] font-semibold',
                    format === 'PDF' ? 'bg-red-050 text-red-600' : 'bg-green-050 text-green-600',
                  )}
                >
                  {format}
                </span>
                <Button variant="ghost" size="sm">
                  <Download className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
