import { CircleAlert, CircleCheck, CircleHelp, EyeOff, FileText } from 'lucide-react'
import { useState } from 'react'

import { DataTable, type Column } from '@/components/common/DataTable'
import { DigitalSignModal } from '@/components/common/DigitalSignModal'
import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Field, Textarea } from '@/components/common/primitives'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import type { Application } from '@/types'
import { cn } from '@/utils/cn'

const CRITERIA = [
  'Age within limit',
  'Essential qualification',
  'Desirable qualification',
  'Years of experience',
  'Category / reservation',
  'Local candidate',
  'Document legibility',
]

type Verdict = 'Meets' | 'Does not meet' | 'Cannot verify'

/**
 * Ref. 33, 34 — application scrutiny.
 *
 * The system's auto-evaluation is advisory and is labelled "System check", not
 * "Result". Nothing is pre-selected: the officer's per-criterion verdicts are
 * separate fields and are always required.
 */
export default function ApplicationScrutiny() {
  const { data, isLoading, reload } = useAsync(() => api.applications(), 'applications')
  const { staff, can } = useAuth()
  const [open, setOpen] = useState<Application | null>(null)
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({})
  const [remarks, setRemarks] = useState('')
  const [decision, setDecision] = useState<'Shortlisted' | 'Rejected' | null>(null)
  const [signOpen, setSignOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const queue = (data ?? []).filter((application) =>
    ['Submitted', 'Under Scrutiny'].includes(application.status),
  )

  const columns: Column<Application>[] = [
    {
      key: 'no',
      header: 'Application No.',
      accessor: (row) => row.applicationNo,
      sortable: true,
      render: (row) => <span className="font-mono text-[12px]">{row.applicationNo}</span>,
    },
    { key: 'name', header: 'Candidate Name', accessor: (row) => row.candidateName, sortable: true },
    { key: 'post', header: 'Post', accessor: (row) => row.postName },
    { key: 'category', header: 'Category', accessor: (row) => row.category },
    { key: 'submitted', header: 'Submitted On', accessor: (row) => row.submittedOn ?? '' },
    {
      // Labelled "System check", never "Result" — and shown with its reasons.
      key: 'check',
      header: 'System check',
      className: 'min-w-56',
      render: (row) => (
        <div>
          <span
            className={cn(
              'text-[13px] font-medium',
              row.systemCheck.met === row.systemCheck.total ? 'text-green-600' : 'text-amber-500',
            )}
          >
            Meets {row.systemCheck.met} of {row.systemCheck.total}
          </span>
          {row.systemCheck.unverified.length > 0 && (
            <p className="text-[12px] text-grey-600">· {row.systemCheck.unverified[0]}</p>
          )}
        </div>
      ),
    },
    { key: 'status', header: 'Scrutiny status', render: (row) => <StatusPill status={row.status} /> },
    {
      key: 'action',
      header: '',
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          disabled={!can('scrutiny.decide')}
          onClick={() => {
            setOpen(row)
            setVerdicts({})
            setRemarks('')
            setDecision(null)
            setError(null)
          }}
        >
          Scrutinise
        </Button>
      ),
    },
  ]

  async function submit() {
    if (!open) return
    const missing = CRITERIA.filter((criterion) => !verdicts[criterion])
    if (missing.length > 0) {
      setError(`Record a verdict for every criterion. Missing: ${missing.join(', ')}.`)
      return
    }
    if (!decision) {
      setError('Select a scrutiny decision.')
      return
    }
    if (!remarks.trim()) {
      setError('Remarks are mandatory and are shown to the candidate.')
      return
    }

    setBusy(true)
    await api.recordScrutiny(open.id, decision, remarks.trim())
    setBusy(false)
    setOpen(null)
    reload()
  }

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Application Scrutiny</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          {queue.length} application{queue.length === 1 ? '' : 's'} awaiting a decision
        </p>
      </div>

      <Banner tone="info" title="The system check complements manual scrutiny — it is not the decision">
        Auto-evaluation shows how many criteria a candidate appears to meet and why the rest could
        not be verified. Nothing is pre-selected; every criterion needs your own verdict before you
        can record an outcome.
      </Banner>

      <Banner tone="neutral" icon={<EyeOff className="size-4" />} title="Profile data is not shown here">
        You see only what the candidate included in this application. Their wider profile — sports,
        work history, bank details — is candidate-only and never reaches this screen (Ref. 25).
      </Banner>

      <Card>
        <DataTable
          rows={queue}
          columns={columns}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          searchPlaceholder="Search by application number or candidate"
          searchFields={(row) => `${row.applicationNo} ${row.candidateName} ${row.postName}`}
          filters={[
            {
              key: 'post',
              label: 'Post',
              options: [...new Set((data ?? []).map((row) => row.postName))],
              match: (row, value) => row.postName === value,
            },
            {
              key: 'category',
              label: 'Category',
              options: ['General', 'OBC', 'SC', 'ST', 'EWS'],
              match: (row, value) => row.category === value,
            },
          ]}
          emptyTitle="The scrutiny queue is empty"
          emptyDescription="Applications appear here once candidates submit and the fee is confirmed."
        />
      </Card>

      {can('shortlist.approve') && (
        <Card title="Shortlisting">
          <div className="space-y-3">
            <p className="text-[13px] text-grey-600">
              Shortlisting is three distinct steps and must not be collapsed into one button:
              shortlist the candidates, route them for workflow verification and approval, then
              digitally sign. Admit cards release only after the signature.
            </p>
            <ol className="space-y-2">
              {[
                ['Shortlist candidates', 'Done — 2,340 candidates marked from the scrutiny queue', true],
                ['Workflow verification & approval', 'Pending with Head of Department', false],
                ['Digital signature', 'Not started', false],
                ['Admit card release', 'Blocked until the signature is applied', false],
              ].map(([label, detail, done]) => (
                <li key={String(label)} className="flex gap-3">
                  <span
                    className={cn(
                      'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                      done ? 'bg-green-600 text-white' : 'bg-grey-200 text-grey-600',
                    )}
                  >
                    <CircleCheck className="size-3" />
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-navy-900">{String(label)}</p>
                    <p className="text-[12px] text-grey-600">{String(detail)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button onClick={() => setSignOpen(true)}>Sign shortlisting approval</Button>
          </div>
        </Card>
      )}

      <Modal
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open ? `Scrutiny — ${open.candidateName}` : ''}
        description={open ? `${open.applicationNo} · ${open.postName}` : undefined}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(null)}>
              Close
            </Button>
            <Button isLoading={busy} onClick={submit}>
              Record decision
            </Button>
          </>
        }
      >
        {open && (
          <div className="space-y-4">
            {error && (
              <Banner tone="danger" title="Cannot record this decision">
                {error}
              </Banner>
            )}

            <Banner tone="info" title={`System check: meets ${open.systemCheck.met} of ${open.systemCheck.total}`}>
              {open.systemCheck.unverified.length > 0
                ? open.systemCheck.unverified.join('; ')
                : 'All criteria appear satisfied. Your own verdict is still required for each.'}
            </Banner>

            <div>
              <p className="label-caps mb-2">Criteria checklist</p>
              <ul className="divide-y divide-grey-200 rounded-md border border-grey-200">
                {CRITERIA.map((criterion) => (
                  <li key={criterion} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                    <span className="min-w-0 flex-1 text-[13px] text-navy-900">{criterion}</span>
                    <div className="flex gap-1">
                      {(['Meets', 'Does not meet', 'Cannot verify'] as Verdict[]).map((verdict) => (
                        <button
                          key={verdict}
                          type="button"
                          onClick={() => {
                            setVerdicts((previous) => ({ ...previous, [criterion]: verdict }))
                            setError(null)
                          }}
                          className={cn(
                            'flex items-center gap-1 rounded-md border px-2 py-1 text-[12px]',
                            verdicts[criterion] === verdict
                              ? verdict === 'Meets'
                                ? 'border-green-600 bg-green-050 text-green-600'
                                : verdict === 'Does not meet'
                                  ? 'border-red-600 bg-red-050 text-red-600'
                                  : 'border-amber-500 bg-amber-050 text-amber-500'
                              : 'border-grey-200 text-grey-600 hover:bg-grey-050',
                          )}
                        >
                          {verdict === 'Meets' ? (
                            <CircleCheck className="size-3.5" />
                          ) : verdict === 'Does not meet' ? (
                            <CircleAlert className="size-3.5" />
                          ) : (
                            <CircleHelp className="size-3.5" />
                          )}
                          {verdict}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="label-caps mb-2">Documents</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {['Passport photograph', 'Signature', 'Identity proof', 'Qualification certificate'].map(
                  (document) => (
                    <li
                      key={document}
                      className="flex items-center gap-2 rounded-md border border-grey-200 px-3 py-2 text-[13px]"
                    >
                      <FileText className="size-4 shrink-0 text-grey-600" />
                      <span className="min-w-0 flex-1 truncate">{document}</span>
                      <Button variant="ghost" size="sm">
                        Preview
                      </Button>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Scrutiny decision" required>
                <div className="flex gap-2">
                  <Button
                    variant={decision === 'Shortlisted' ? 'success' : 'secondary'}
                    className="flex-1"
                    onClick={() => {
                      setDecision('Shortlisted')
                      setError(null)
                    }}
                  >
                    Shortlist
                  </Button>
                  <Button
                    variant={decision === 'Rejected' ? 'danger' : 'secondary'}
                    className="flex-1"
                    onClick={() => {
                      setDecision('Rejected')
                      setError(null)
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </Field>

              <Field label="Remarks" required hint="Shown to the candidate in their status trail.">
                <Textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} />
              </Field>
            </div>
          </div>
        )}
      </Modal>

      <DigitalSignModal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        onSigned={() => setSignOpen(false)}
        signerName={staff?.name ?? 'Officer'}
        artefact="Shortlisting approval — Assistant Grade-II Examination 2024"
        checkpoint="Checkpoint 6 of 9 — Shortlisting approval (Ref. 34)"
      />
    </div>
  )
}
