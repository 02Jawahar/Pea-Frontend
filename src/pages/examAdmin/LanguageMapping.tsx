import { FileText, Languages, MapPin, Users } from 'lucide-react'

import { DataTable, type Column } from '@/components/common/DataTable'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Card } from '@/components/common/primitives'
import { useAsync } from '@/hooks/useAsync'
import { api, seed } from '@/mock/api'
import type { Application, PaperLanguage } from '@/types'

type LanguageMappingRow = Application & {
  examCode: string
  examName: string
  district: string
}

const LANGUAGES: PaperLanguage[] = ['English', 'Tamil', 'Malayalam', 'Telugu']

/** Candidate language demand carried from application into paper, seating and admit-card planning. */
export default function ApplicantLanguageMapping() {
  const { data, isLoading } = useAsync(() => api.applications(), 'applicant-language-mapping')

  const rows: LanguageMappingRow[] = (data ?? [])
    .filter((application) => !['Draft', 'Withdrawn', 'Cancelled'].includes(application.status))
    .map((application) => {
      const exam = seed.exams.find((item) => item.departmentName === application.departmentName)
      const candidate = seed.candidates.find((item) => item.id === application.candidateId)

      return {
        ...application,
        examCode: exam?.examCode ?? 'To be assigned',
        examName: exam?.name ?? 'Examination not assigned',
        district: candidate?.district ?? '—',
      }
    })

  const languageCount = (language: PaperLanguage) =>
    rows.filter((row) => row.paperLanguage === language).length

  const columns: Column<LanguageMappingRow>[] = [
    {
      key: 'application',
      header: 'Application No.',
      accessor: (row) => row.applicationNo,
      sortable: true,
      render: (row) => <span className="font-mono text-[12px]">{row.applicationNo}</span>,
    },
    {
      key: 'candidate',
      header: 'Applicant',
      accessor: (row) => row.candidateName,
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-navy-900">{row.candidateName}</p>
          <p className="font-mono text-[11px] text-grey-600">{row.candidateId}</p>
        </div>
      ),
    },
    {
      key: 'exam',
      header: 'Examination',
      accessor: (row) => row.examName,
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-navy-900">{row.postName}</p>
          <p className="font-mono text-[11px] text-grey-600">{row.examCode}</p>
        </div>
      ),
    },
    {
      key: 'region',
      header: 'Region / Centre preference',
      accessor: (row) => `${row.district} ${row.centrePreference}`,
      render: (row) => (
        <div>
          <p>{row.district}</p>
          <p className="text-[11px] text-grey-600">{row.centrePreference}</p>
        </div>
      ),
    },
    {
      key: 'language',
      header: 'Writing language',
      accessor: (row) => row.paperLanguage,
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-050 px-2 py-1 text-[12px] font-semibold text-navy-700 ring-1 ring-blue-100">
          <Languages className="size-3.5" />
          {row.paperLanguage}
        </span>
      ),
    },
    {
      key: 'mapping',
      header: 'Mapping',
      render: () => <StatusPill status="Verified" />,
    },
  ]

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Applicant Language Mapping</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Language opted by each applicant for writing the examination, mapped to question-paper,
          centre, seating and admit-card planning.
        </p>
      </div>

      <KpiStrip>
        <KpiCard
          icon={<Users className="size-5" />}
          label="Mapped applicants"
          value={rows.length}
          subLabel="active applications"
          tone="navy"
        />
        {LANGUAGES.map((language, index) => (
          <KpiCard
            key={language}
            icon={<Languages className="size-5" />}
            label={language}
            value={languageCount(language)}
            subLabel="question papers required"
            tone={(['blue', 'green', 'purple', 'amber'] as const)[index]}
          />
        ))}
      </KpiStrip>

      <Banner tone="info" icon={<FileText className="size-4" />} title="Source of language mapping">
        The writing language is inherited from the candidate's submitted application. Exam officers
        use this mapping to prepare language-wise paper quantities and language-compatible halls.
        Any correction must be completed before admit cards are generated.
      </Banner>

      <Card className="flex-1" bodyClassName="p-0">
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          searchPlaceholder="Search applicant, application, post or exam code"
          searchFields={(row) =>
            `${row.candidateName} ${row.applicationNo} ${row.postName} ${row.examCode} ${row.district}`
          }
          filters={[
            {
              key: 'exam',
              label: 'Examination',
              options: [...new Set(rows.map((row) => row.examName))],
              match: (row, value) => row.examName === value,
            },
            {
              key: 'language',
              label: 'Writing language',
              options: LANGUAGES,
              match: (row, value) => row.paperLanguage === value,
            },
            {
              key: 'region',
              label: 'Region',
              options: [...new Set(rows.map((row) => row.district))],
              match: (row, value) => row.district === value,
            },
          ]}
          pageSize={10}
          emptyTitle="No applicant language mappings"
          emptyDescription="Mappings appear after candidates submit applications with their examination language."
        />
      </Card>

      <Banner tone="neutral" icon={<MapPin className="size-4" />}>
        Seating generation can use this mapping to keep language-wise paper distribution within each
        hall auditable while still respecting PwD, scribe and region requirements.
      </Banner>
    </div>
  )
}
