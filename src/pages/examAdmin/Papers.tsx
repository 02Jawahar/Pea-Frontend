import { FileLock2, Lock, Plus, ShieldAlert, Upload } from 'lucide-react'
import { useState } from 'react'

import { DataTable, type Column } from '@/components/common/DataTable'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, ProgressBar, Tabs } from '@/components/common/primitives'
import { useAuth } from '@/hooks/useAuth'
import { seed } from '@/mock/api'
import { cn } from '@/utils/cn'

type TabId = 'papers' | 'bank' | 'blueprint'

interface Paper {
  id: string
  code: string
  exam: string
  paper: string
  series: string
  language: string
  questions: number
  marks: number
  status: 'Draft' | 'Approved' | 'Published'
  unlocksAt: string
}

const PAPERS: Paper[] = [
  ['AG2/GS/A/EN', 'General Studies - Paper I', 'Series A', 'English'],
  ['AG2/GS/A/TA', 'General Studies - Paper I', 'Series A', 'Tamil'],
  ['AG2/GS/B/EN', 'General Studies - Paper I', 'Series B', 'English'],
  ['AG2/GS/B/ML', 'General Studies - Paper I', 'Series B', 'Malayalam'],
  ['AG2/P2/A/EN', 'Paper-II — Accountancy', 'Series A', 'English'],
  ['AG2/P2/A/TE', 'Paper-II — Accountancy', 'Series A', 'Telugu'],
  ['JA/GS/A/EN', 'General Studies - Paper I', 'Series A', 'English'],
  ['JA/GS/A/TA', 'General Studies - Paper I', 'Series A', 'Tamil'],
].map(([code, paper, series, language], index) => ({
  id: `pap-${index + 1}`,
  code,
  exam: index < 6 ? seed.exams[0].name : seed.exams[1].name,
  paper,
  series,
  language,
  questions: paper.startsWith('General') ? 100 : 60,
  marks: paper.startsWith('General') ? 100 : 60,
  status: (['Approved', 'Approved', 'Draft', 'Draft', 'Approved', 'Draft', 'Approved', 'Approved'] as const)[index],
  unlocksAt: index < 6 ? '2024-05-25 08:00' : '2024-06-02 08:00',
}))

const QUESTION_BANK = [
  ['Indian Polity', 'Constitutional provisions', 'Easy', 148, 'Used 3×'],
  ['Indian Polity', 'Union Territories', 'Medium', 96, 'Used 5×'],
  ['History', 'Freedom movement', 'Medium', 212, 'Used 2×'],
  ['Geography', 'Physical geography of India', 'Hard', 88, 'Unused'],
  ['General Science', 'Everyday science', 'Easy', 174, 'Used 4×'],
  ['Current Affairs', 'Puducherry administration', 'Medium', 61, 'Used 1×'],
  ['Quantitative Aptitude', 'Percentages and ratio', 'Medium', 133, 'Used 6×'],
  ['Reasoning', 'Series and analogy', 'Easy', 159, 'Used 3×'],
]

const BLUEPRINT = [
  ['Indian Polity', 20, 20, 'Easy 8 · Medium 9 · Hard 3'],
  ['History', 15, 15, 'Easy 6 · Medium 7 · Hard 2'],
  ['Geography', 15, 15, 'Easy 5 · Medium 7 · Hard 3'],
  ['General Science', 20, 20, 'Easy 9 · Medium 8 · Hard 3'],
  ['Current Affairs', 10, 10, 'Easy 4 · Medium 5 · Hard 1'],
  ['Quantitative Aptitude', 10, 10, 'Easy 3 · Medium 5 · Hard 2'],
  ['Reasoning', 10, 10, 'Easy 4 · Medium 4 · Hard 2'],
]

/**
 * §2.4.4 and the demo sidebar — paper management, question bank and blueprint.
 * Access to a paper is time-locked and every access is audit-logged.
 */
export default function PaperManagement() {
  const { can } = useAuth()
  const [tab, setTab] = useState<TabId>('papers')

  const columns: Column<Paper>[] = [
    {
      key: 'code',
      header: 'Paper code',
      accessor: (row) => row.code,
      sortable: true,
      render: (row) => <span className="font-mono text-[12px] font-medium">{row.code}</span>,
    },
    { key: 'exam', header: 'Examination', accessor: (row) => row.exam, sortable: true },
    { key: 'paper', header: 'Paper', accessor: (row) => row.paper },
    { key: 'series', header: 'Series', accessor: (row) => row.series, sortable: true },
    { key: 'language', header: 'Language', accessor: (row) => row.language, sortable: true },
    {
      key: 'questions',
      header: 'Questions',
      accessor: (row) => row.questions,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'marks',
      header: 'Marks',
      accessor: (row) => row.marks,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
    {
      key: 'lock',
      header: 'Unlocks at',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-[12px] text-grey-600">
          <Lock className="size-3.5" />
          {row.unlocksAt}
        </span>
      ),
    },
  ]

  const totalQuestions = QUESTION_BANK.reduce((sum, row) => sum + Number(row[3]), 0)
  const blueprintTotal = BLUEPRINT.reduce((sum, row) => sum + Number(row[1]), 0)

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Paper Management</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Papers per exam, series and language versions, the question bank and the blueprint.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={!can('paper.manage')}>
            <Plus className="size-4" />
            New paper
          </Button>
          <Button disabled={!can('paper.manage')}>
            <Upload className="size-4" />
            Upload paper
          </Button>
        </div>
      </div>

      <Banner tone="warning" icon={<ShieldAlert className="size-4" />} title="Encrypted at rest, time-locked, audit-logged">
        A paper file is encrypted in storage and cannot be opened before its unlock time. Every
        access — view, download, print — is written to the audit log against the officer's Employee
        ID.
      </Banner>

      <KpiStrip>
        <KpiCard icon={<FileLock2 className="size-5" />} label="Papers" value={PAPERS.length} tone="blue" />
        <KpiCard
          icon={<FileLock2 className="size-5" />}
          label="Approved"
          value={PAPERS.filter((paper) => paper.status === 'Approved').length}
          tone="green"
        />
        <KpiCard
          icon={<FileLock2 className="size-5" />}
          label="Draft"
          value={PAPERS.filter((paper) => paper.status === 'Draft').length}
          tone="amber"
        />
        <KpiCard icon={<FileLock2 className="size-5" />} label="Question bank" value={totalQuestions} subLabel="tagged questions" tone="purple" />
        <KpiCard icon={<Lock className="size-5" />} label="Locked" value={PAPERS.length} subLabel="until exam morning" tone="navy" />
      </KpiStrip>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'papers', label: 'Papers', count: PAPERS.length },
          { id: 'bank', label: 'Question bank', count: QUESTION_BANK.length },
          { id: 'blueprint', label: 'Paper blueprint' },
        ]}
      />

      {tab === 'papers' && (
        <Card className="flex-1">
          <DataTable
            rows={PAPERS}
            columns={columns}
            rowKey={(row) => row.id}
            searchPlaceholder="Search by paper code, exam or language"
            searchFields={(row) => `${row.code} ${row.exam} ${row.paper} ${row.language}`}
            filters={[
              {
                key: 'series',
                label: 'Series',
                options: ['Series A', 'Series B'],
                match: (row, value) => row.series === value,
              },
              {
                key: 'language',
                label: 'Language',
                options: ['English', 'Tamil', 'Malayalam', 'Telugu'],
                match: (row, value) => row.language === value,
              },
              {
                key: 'status',
                label: 'Status',
                options: ['Draft', 'Approved', 'Published'],
                match: (row, value) => row.status === value,
              },
            ]}
            pageSize={10}
            emptyTitle="No papers"
            emptyDescription="Upload a paper for an approved examination."
          />
        </Card>
      )}

      {tab === 'bank' && (
        <Card title="Question bank" bodyClassName="p-0" className="flex-1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey-200 bg-grey-050">
                {['Subject', 'Topic', 'Difficulty', 'Questions', 'Usage history'].map((header) => (
                  <th key={header} className="px-4 py-2 text-left text-[12px] font-semibold uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {QUESTION_BANK.map((row) => (
                <tr key={String(row[1])} className="border-b border-grey-200 last:border-b-0">
                  <td className="data-cell font-medium">{row[0]}</td>
                  <td className="data-cell">{row[1]}</td>
                  <td className="data-cell">
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[11px] font-medium',
                        row[2] === 'Easy'
                          ? 'bg-green-050 text-green-600'
                          : row[2] === 'Medium'
                            ? 'bg-amber-050 text-amber-500'
                            : 'bg-red-050 text-red-600',
                      )}
                    >
                      {row[2]}
                    </span>
                  </td>
                  <td className="data-cell text-right font-mono">{row[3]}</td>
                  <td className="data-cell text-grey-600">{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'blueprint' && (
        <Card title="Blueprint — General Studies Paper I" className="flex-1">
          <p className="mb-3 text-[13px] text-grey-600">
            Section-wise question count, marks and difficulty split. For CBT the engine randomises
            within each section while holding this distribution.
          </p>

          <table className="w-full">
            <thead>
              <tr className="border-b border-grey-200 bg-grey-050">
                {['Section', 'Questions', 'Marks', 'Difficulty split', 'Share'].map((header) => (
                  <th key={header} className="px-4 py-2 text-left text-[12px] font-semibold uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BLUEPRINT.map((row) => (
                <tr key={String(row[0])} className="border-b border-grey-200">
                  <td className="data-cell font-medium">{row[0]}</td>
                  <td className="data-cell text-right font-mono">{row[1]}</td>
                  <td className="data-cell text-right font-mono">{row[2]}</td>
                  <td className="data-cell text-grey-600">{row[3]}</td>
                  <td className="data-cell min-w-36">
                    <ProgressBar value={(Number(row[1]) / blueprintTotal) * 100} showLabel tone="blue" />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-grey-050">
                <th scope="row" className="px-4 py-2.5 text-left text-[13px] font-semibold">
                  Total
                </th>
                <td className="px-4 py-2.5 text-right font-mono text-[13px] font-semibold">
                  {blueprintTotal}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-[13px] font-semibold">
                  {blueprintTotal}
                </td>
                <td colSpan={2} className="px-4 py-2.5 text-[12px] text-grey-600">
                  Matches the 100-question, 100-mark paper structure
                </td>
              </tr>
            </tfoot>
          </table>
        </Card>
      )}
    </div>
  )
}
