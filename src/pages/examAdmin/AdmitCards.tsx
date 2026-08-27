import { Download, IdCard, Mail, RefreshCcw, Scale, Send } from 'lucide-react'
import { useState } from 'react'

import { DataTable, type Column } from '@/components/common/DataTable'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, ProgressBar, Select } from '@/components/common/primitives'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import type { Application } from '@/types'

/** Ref. 37 — bulk generation, release toggle, resend and court-case flagging. */
export default function AdmitCardManagement() {
  const { data, isLoading } = useAsync(() => api.applications(), 'applications')
  const { can } = useAuth()
  const [released, setReleased] = useState(true)
  const [generating, setGenerating] = useState(false)

  const rows = (data ?? []).filter(
    (application) => application.status === 'Shortlisted' || application.courtCase,
  )
  const courtCases = rows.filter((application) => application.courtCase)
  const downloaded = Math.round(rows.length * 0.72)

  const columns: Column<Application>[] = [
    {
      key: 'no',
      header: 'Application No.',
      accessor: (row) => row.applicationNo,
      sortable: true,
      render: (row) => <span className="font-mono text-[12px]">{row.applicationNo}</span>,
    },
    { key: 'name', header: 'Candidate', accessor: (row) => row.candidateName, sortable: true },
    { key: 'post', header: 'Post', accessor: (row) => row.postName },
    { key: 'centre', header: 'Centre preference', accessor: (row) => row.centrePreference },
    { key: 'language', header: 'Paper language', accessor: (row) => row.paperLanguage },
    {
      key: 'path',
      header: 'Entry path',
      render: (row) =>
        row.courtCase ? (
          <span className="inline-flex items-center gap-1 rounded bg-amber-050 px-1.5 py-0.5 text-[11px] font-medium text-amber-500">
            <Scale className="size-3" />
            Court direction — scrutiny bypassed
          </span>
        ) : (
          <span className="text-[12px] text-grey-600">Shortlisted at scrutiny</span>
        ),
    },
    {
      key: 'status',
      header: 'Card',
      render: () => <StatusPill status={released ? 'Active' : 'Pending'} />,
    },
    {
      key: 'action',
      header: '',
      render: () => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" aria-label="Regenerate">
            <RefreshCcw className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" aria-label="Resend">
            <Send className="size-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Admit Card Management</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            One admit card covers every post a candidate applied for — cards are per candidate, not
            per application.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select aria-label="Examination" className="w-auto" defaultValue={seed.exams[0].name}>
            {seed.exams.map((exam) => (
              <option key={exam.id}>{exam.name}</option>
            ))}
          </Select>
          <Button
            variant="secondary"
            disabled={!can('admitcard.generate')}
            onClick={() => setReleased((value) => !value)}
          >
            {released ? 'Withdraw release' : 'Release to candidates'}
          </Button>
          <Button disabled={!can('admitcard.generate')} onClick={() => setGenerating(true)}>
            <IdCard className="size-4" />
            Bulk generate
          </Button>
        </div>
      </div>

      <KpiStrip>
        <KpiCard icon={<IdCard className="size-5" />} label="Eligible candidates" value={rows.length} tone="blue" />
        <KpiCard
          icon={<IdCard className="size-5" />}
          label="Cards generated"
          value={released ? rows.length : 0}
          tone="green"
        />
        <KpiCard
          icon={<Download className="size-5" />}
          label="Downloaded"
          value={released ? downloaded : 0}
          subLabel={released ? `${Math.round((downloaded / rows.length) * 100)}% of released` : 'Not released'}
          tone="purple"
        />
        <KpiCard icon={<Scale className="size-5" />} label="Court-case candidates" value={courtCases.length} tone="amber" />
        <KpiCard
          icon={<Mail className="size-5" />}
          label="SMS / email sent"
          value={released ? rows.length * 2 : 0}
          subLabel="one of each per candidate"
          tone="navy"
        />
      </KpiStrip>

      <Banner tone={released ? 'success' : 'warning'} title={released ? 'Released' : 'Not released'}>
        {released
          ? 'Candidates can download their admit card from the Candidate Portal. Downloads are tracked per candidate.'
          : 'Cards are generated but withheld. Candidates see “No admit card is available yet” with the reason.'}
      </Banner>

      <Card title="Download progress">
        <ProgressBar value={released ? (downloaded / rows.length) * 100 : 0} showLabel tone="green" />
        <p className="mt-2 text-[12px] text-grey-600">
          {released ? downloaded : 0} of {rows.length} candidates have downloaded their card. A
          reminder SMS goes out 72 hours before the exam to anyone who has not.
        </p>
      </Card>

      <Card className="flex-1">
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          searchPlaceholder="Search by application number or candidate"
          searchFields={(row) => `${row.applicationNo} ${row.candidateName} ${row.postName}`}
          filters={[
            {
              key: 'path',
              label: 'Entry path',
              options: ['Shortlisted at scrutiny', 'Court direction'],
              match: (row, value) =>
                value === 'Court direction' ? row.courtCase : !row.courtCase,
            },
            {
              key: 'language',
              label: 'Paper language',
              options: ['English', 'Tamil', 'Malayalam', 'Telugu'],
              match: (row, value) => row.paperLanguage === value,
            },
          ]}
          pageSize={10}
          emptyTitle="No candidates are eligible yet"
          emptyDescription="Admit cards release after shortlisting is approved and digitally signed."
        />
      </Card>

      <Modal
        open={generating}
        onClose={() => setGenerating(false)}
        title="Bulk generate admit cards"
        footer={
          <>
            <Button variant="secondary" onClick={() => setGenerating(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={() => {
                setReleased(true)
                setGenerating(false)
              }}
            >
              Generate {rows.length} cards
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <dl className="grid gap-3 sm:grid-cols-3">
            {[
              ['Candidates', String(rows.length)],
              ['Court-case', String(courtCases.length)],
              ['Notifications', `${rows.length * 2}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-grey-050 px-3 py-2.5">
                <dt className="text-[12px] text-grey-600">{label}</dt>
                <dd className="text-[18px] font-semibold text-navy-900">{value}</dd>
              </div>
            ))}
          </dl>
          <Banner tone="info">
            Each card carries the QR encoding name, application reference, place of residence and
            scribe details, and prints the per-exam table of date, shift, centre, hall and seat.
          </Banner>
        </div>
      </Modal>
    </div>
  )
}
