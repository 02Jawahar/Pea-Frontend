import { BadgeCheck, RotateCw, ScanLine, ShieldAlert, Upload, ZoomIn } from 'lucide-react'
import { useState } from 'react'

import { Banner, Button, Card, Field, Input, ProgressBar, Tabs } from '@/components/common/primitives'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

type TabId = 'scan' | 'import' | 'exceptions'

/**
 * Ref. 51, 52 — OMR scanning and the non-readable queue.
 *
 * Path A (direct scan) is observational: data is extracted and auto-updated
 * without manual intervention, so the UI reports rather than asks. Path B
 * (file import) rejects an unsigned or signature-invalid file outright.
 * Marks are captured at 4 decimal places throughout.
 */
export default function OmrProcessing() {
  const { can } = useAuth()
  const [tab, setTab] = useState<TabId>('scan')
  const [sheet, setSheet] = useState(14)
  const [signatureState, setSignatureState] = useState<'none' | 'valid' | 'invalid'>('none')

  const readOnly = !can('omr.process')

  return (
    <div className="page">
      <div>
        <h1 className="page-title">OMR Processing</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Assistant Grade-II Examination 2024 · General Studies Paper I
        </p>
      </div>

      <Banner tone="info" title="Marks precision">
        Marks are captured and displayed at <strong>4 decimal places</strong> everywhere — evaluation,
        merit and scorecard. Rounding is a merit-ranking decision, not a formatting one, so nothing
        is rounded for display.
      </Banner>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'scan', label: 'Direct scan' },
          { id: 'import', label: 'File-based import' },
          { id: 'exceptions', label: 'Non-readable queue', count: 37 },
        ]}
      />

      {tab === 'scan' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Scan batches in progress" bodyClassName="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  {['Batch', 'Scanned', 'Read', 'Failed', 'Progress'].map((header) => (
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
                  ['BATCH/AG2/GS/01', 500, 494, 6, 100],
                  ['BATCH/AG2/GS/02', 500, 476, 11, 97],
                  ['BATCH/AG2/GS/03', 320, 305, 8, 64],
                  ['BATCH/AG2/GS/04', 180, 168, 12, 36],
                ].map(([batch, scanned, read, failed, progress]) => (
                  <tr key={String(batch)} className="border-b border-grey-200 last:border-b-0">
                    <td className="data-cell font-mono text-[12px]">{batch}</td>
                    <td className="data-cell">{scanned}</td>
                    <td className="data-cell text-green-600">{read}</td>
                    <td className="data-cell text-red-600">{failed}</td>
                    <td className="data-cell min-w-32">
                      <ProgressBar value={Number(progress)} showLabel tone="blue" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="How this path works">
            <div className="space-y-3">
              <p className="flex items-start gap-2 text-[13px] text-navy-900">
                <ScanLine className="mt-0.5 size-4 shrink-0 text-navy-700" />
                The scanner feeds the system, data is extracted and auto-updated without manual
                intervention. In the happy path there is nothing for an operator to do — this screen
                is observational.
              </p>
              <Banner tone="neutral">
                Sheets that cannot be read drop into the non-readable queue, where a human captures
                the marks with the image-reading tool. Nothing is silently discarded.
              </Banner>
            </div>
          </Card>
        </div>
      )}

      {tab === 'import' && (
        <Card title="File-based import">
          <div className="space-y-4">
            <Banner tone="warning" icon={<ShieldAlert className="size-4" />} title="Signed files only">
              The import file must be digitally signed to guarantee data integrity. An unsigned file,
              or one whose signature does not verify, is rejected outright with the failure named.
            </Banner>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Import file" required hint="CSV or fixed-width, digitally signed.">
                <Input type="file" accept=".csv,.p7s,.dat" disabled={readOnly} className="py-1.5" />
              </Field>
              <Field label="Signature file (.p7s)" required>
                <Input type="file" accept=".p7s" disabled={readOnly} className="py-1.5" />
              </Field>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                disabled={readOnly}
                onClick={() => setSignatureState('valid')}
              >
                <Upload className="size-4" />
                Verify signature &amp; preview
              </Button>
              <Button
                variant="secondary"
                disabled={readOnly}
                onClick={() => setSignatureState('invalid')}
              >
                Simulate an invalid signature
              </Button>
            </div>

            {signatureState === 'valid' && (
              <>
                <Banner tone="success" icon={<BadgeCheck className="size-4" />} title="Signature verified">
                  Signed by PEA Scanning Vendor · certificate serial 7B:2E:11:C4 · valid to
                  2026-02-28.
                </Banner>

                <div>
                  <p className="label-caps mb-2">Mapping preview</p>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-grey-200 bg-grey-050">
                        {['Row', 'Application reference', 'Matched candidate', 'Marks (4dp)'].map(
                          (header) => (
                            <th
                              key={header}
                              className="px-3 py-2 text-left text-[12px] font-semibold uppercase"
                            >
                              {header}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        [1, 'APP20240012345', 'Matched', '68.5000'],
                        [2, 'APP20240012352', 'Matched', '72.2500'],
                        [3, 'APP20240012359', 'Unmatched — quarantined', '—'],
                        [4, 'APP20240012366', 'Matched', '61.7500'],
                      ].map((row) => (
                        <tr key={String(row[0])} className="border-b border-grey-200 last:border-b-0">
                          <td className="data-cell">{row[0]}</td>
                          <td className="data-cell font-mono text-[12px]">{row[1]}</td>
                          <td
                            className={cn(
                              'data-cell',
                              String(row[2]).startsWith('Unmatched')
                                ? 'text-red-600'
                                : 'text-green-600',
                            )}
                          >
                            {row[2]}
                          </td>
                          <td className="data-cell text-right font-mono">{row[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-[12px] text-grey-600">
                    Unmatched rows are quarantined into the exceptions queue for manual mapping —
                    never silently dropped.
                  </p>
                </div>

                <Button variant="success" disabled={readOnly}>
                  Commit import
                </Button>
              </>
            )}

            {signatureState === 'invalid' && (
              <Banner tone="danger" title="Import rejected — signature does not verify">
                The digest in the .p7s file does not match the import file. This usually means the
                file was edited after signing. Ask the vendor to re-export and re-sign; do not accept
                an unsigned file as a workaround.
              </Banner>
            )}
          </div>
        </Card>
      )}

      {tab === 'exceptions' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card
            title={`Non-readable OMR · sheet ${sheet} of 37`}
            action={
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" aria-label="Zoom">
                  <ZoomIn className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" aria-label="Rotate">
                  <RotateCw className="size-4" />
                </Button>
              </div>
            }
            footer={
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={sheet === 1}
                  onClick={() => setSheet((value) => value - 1)}
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={readOnly}>
                    Flag for supervisor
                  </Button>
                  <Button
                    size="sm"
                    disabled={readOnly}
                    onClick={() => setSheet((value) => Math.min(37, value + 1))}
                  >
                    Save &amp; next
                  </Button>
                </div>
              </div>
            }
          >
            <div className="flex aspect-[4/3] items-center justify-center rounded-md border border-dashed border-grey-300 bg-grey-050">
              <p className="text-[13px] text-grey-600">
                Scanned sheet image · zoom, rotate, pan, region highlight
              </p>
            </div>
            <p className="mt-2 font-mono text-[12px] text-grey-600">Ref: APP20240012345</p>
          </Card>

          <Card title="Manual capture">
            <div className="space-y-3">
              <Banner tone="warning">Detected: partial bubble on Q23.</Banner>

              {[
                { q: 23, detected: 'B' },
                { q: 47, detected: null },
              ].map((item) => (
                <div key={item.q} className="rounded-md border border-grey-200 p-3">
                  <p className="text-[13px] font-medium text-navy-900">Q{item.q}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {(['A', 'B', 'C', 'D'] as const).map((option) => (
                      <label key={option} className="flex items-center gap-1.5 text-[13px]">
                        <input
                          type="radio"
                          name={`q${item.q}`}
                          defaultChecked={item.detected === option}
                          disabled={readOnly}
                        />
                        {option}
                      </label>
                    ))}
                    <Button variant="secondary" size="sm" className="ml-auto" disabled={readOnly}>
                      {item.detected ? 'Confirm' : 'Unreadable'}
                    </Button>
                  </div>
                </div>
              ))}

              <div className="rounded-md border border-grey-200 p-3">
                <p className="text-[13px] text-navy-900">
                  Roll no. read: <span className="font-mono font-medium">1023456</span>{' '}
                  <span className="text-green-600">✓</span>
                </p>
                <p className="mt-1 text-[12px] text-grey-600">
                  Where the roll number itself is unreadable, two-person verification is required
                  before the sheet can be committed.
                </p>
              </div>

              <p className="text-[12px] text-grey-600">
                Every manual capture is logged with the operator ID and a timestamp.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
