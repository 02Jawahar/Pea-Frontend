import { Archive, Download, FileText, Lock } from 'lucide-react'
import { useState } from 'react'

import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card } from '@/components/common/primitives'
import { EmptyState, SkeletonCards } from '@/components/common/states'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import { cn } from '@/utils/cn'

interface Artefact {
  label: string
  detail: string
  available: boolean
}

/**
 * Ref. 61 — the e-Dossier.
 *
 * A read-only archive grouped by recruitment cycle: application form, OMR sheet
 * scan, attendance record, exam marks, selection list entry, appointment order
 * and every document submitted with the application.
 */
export default function CandidateEDossier() {
  const { candidate } = useAuth()
  const { data, isLoading } = useAsync(() => api.applicationsFor(candidate!.id), candidate?.id)
  const [openCycle, setOpenCycle] = useState<string | null>('ntf-1')

  if (isLoading || !candidate) return <SkeletonCards />

  const applications = (data ?? []).filter((application) => application.status !== 'Draft')

  if (applications.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Archive className="size-8" strokeWidth={1.5} />}
          title="Your e-Dossier is empty"
          description="Once you submit an application, everything connected to it — the form, your documents, your OMR sheet, attendance, marks and any appointment order — is archived here permanently."
        />
      </Card>
    )
  }

  const cycles = [
    {
      id: 'ntf-1',
      title: 'Assistant Grade-II Examination 2024',
      notification: 'PEA/NOTIF/2024/001',
      year: '2024',
      applications: applications.slice(0, 2),
      artefacts: [
        { label: 'Application form (as submitted)', detail: 'PDF · 284 KB · signed 20-May-2024', available: true },
        { label: 'Documents submitted with the application', detail: '5 files · 1.2 MB', available: true },
        { label: 'Fee receipt', detail: 'PDF · 96 KB · TXN1234567890', available: true },
        { label: 'Admit card', detail: 'PDF · 148 KB', available: true },
        { label: 'OMR sheet scan', detail: 'PDF · 620 KB · scanned 25-May-2024', available: true },
        { label: 'Attendance record', detail: 'Verified biometrically · Hall 3 · seat 14', available: true },
        { label: 'Exam marks', detail: '68.5000 / 100 · declared 20-May-2024', available: true },
        { label: 'Selection list entry', detail: 'Rank 342 · Qualified', available: true },
        { label: 'Appointment order', detail: 'Issued after document verification', available: false },
      ] as Artefact[],
    },
    {
      id: 'ntf-old',
      title: 'Junior Assistant Examination 2023',
      notification: 'PEA/NOTIF/2023/004',
      year: '2023',
      applications: applications.slice(2, 3),
      artefacts: [
        { label: 'Application form (as submitted)', detail: 'PDF · 271 KB · signed 14-Aug-2023', available: true },
        { label: 'Documents submitted with the application', detail: '4 files · 980 KB', available: true },
        { label: 'Fee receipt', detail: 'PDF · 92 KB', available: true },
        { label: 'Admit card', detail: 'PDF · 141 KB', available: true },
        { label: 'OMR sheet scan', detail: 'PDF · 604 KB', available: true },
        { label: 'Attendance record', detail: 'Verified biometrically', available: true },
        { label: 'Exam marks', detail: '54.2500 / 100 · Not Qualified', available: true },
        { label: 'Selection list entry', detail: 'Not selected', available: false },
        { label: 'Appointment order', detail: 'Not applicable', available: false },
      ] as Artefact[],
    },
  ].filter((cycle) => cycle.applications.length > 0)

  const totalArtefacts = cycles.reduce(
    (sum, cycle) => sum + cycle.artefacts.filter((artefact) => artefact.available).length,
    0,
  )

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">e-Dossier</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            A permanent, read-only archive of everything connected to your candidature, grouped by
            recruitment cycle.
          </p>
        </div>
        <Button variant="secondary">
          <Download className="size-4" />
          Download everything (zip)
        </Button>
      </div>

      <KpiStrip>
        <KpiCard icon={<Archive className="size-5" />} label="Recruitment cycles" value={cycles.length} tone="blue" />
        <KpiCard icon={<FileText className="size-5" />} label="Archived artefacts" value={totalArtefacts} tone="green" />
        <KpiCard
          icon={<FileText className="size-5" />}
          label="Applications"
          value={applications.length}
          tone="purple"
        />
        <KpiCard
          icon={<Lock className="size-5" />}
          label="Retention"
          value="7 years"
          subLabel="matching the record retention policy"
          tone="navy"
        />
      </KpiStrip>

      <Banner tone="neutral" icon={<Lock className="size-4" />} title="Read-only">
        Nothing here can be edited or deleted, by you or by PEA. That is what makes the dossier
        usable as evidence in a later dispute.
      </Banner>

      <div className="flex flex-1 flex-col gap-4">
        {cycles.map((cycle) => {
          const expanded = openCycle === cycle.id
          return (
            <Card
              key={cycle.id}
              title={
                <button
                  type="button"
                  onClick={() => setOpenCycle(expanded ? null : cycle.id)}
                  className="min-w-0 text-left"
                  aria-expanded={expanded}
                >
                  <span className="clamp-1 block text-[14px] font-semibold text-navy-900">
                    {cycle.title}
                  </span>
                  <span className="block font-mono text-[11px] text-grey-600">
                    {cycle.notification}
                  </span>
                </button>
              }
              action={
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-grey-600">
                    {cycle.artefacts.filter((artefact) => artefact.available).length} artefacts
                  </span>
                  <Button variant="secondary" size="sm">
                    <Download className="size-3.5" />
                    Zip
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpenCycle(expanded ? null : cycle.id)}
                  >
                    {expanded ? 'Collapse' : 'Expand'}
                  </Button>
                </div>
              }
              bodyClassName="p-0"
            >
              {expanded && (
                <>
                  <div className="border-b border-grey-200 px-4 py-3">
                    <p className="label-caps mb-2">Applications in this cycle</p>
                    <ul className="flex flex-wrap gap-2">
                      {cycle.applications.map((application) => (
                        <li
                          key={application.id}
                          className="flex items-center gap-2 rounded-md border border-grey-200 px-2.5 py-1.5"
                        >
                          <span className="font-mono text-[12px] text-navy-900">
                            {application.applicationNo}
                          </span>
                          <span className="text-[12px] text-grey-600">{application.postName}</span>
                          <StatusPill status={application.status} />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <ul className="divide-y divide-grey-200">
                    {cycle.artefacts.map((artefact) => (
                      <li
                        key={artefact.label}
                        className={cn(
                          'flex flex-wrap items-center gap-3 px-4 py-2.5',
                          !artefact.available && 'opacity-60',
                        )}
                      >
                        <FileText
                          className={cn(
                            'size-4 shrink-0',
                            artefact.available ? 'text-navy-700' : 'text-grey-600',
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="clamp-1 text-[13px] font-medium text-navy-900">
                            {artefact.label}
                          </p>
                          <p className="clamp-1 text-[12px] text-grey-600">{artefact.detail}</p>
                        </div>
                        {artefact.available ? (
                          <Button variant="ghost" size="sm" aria-label={`Download ${artefact.label}`}>
                            <Download className="size-4" />
                          </Button>
                        ) : (
                          <span className="shrink-0 text-[12px] text-grey-600">Not available</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          )
        })}
      </div>

      <p className="text-[12px] text-grey-600">
        Registration Number {candidate.registrationNo} · {seed.DEMO_TODAY}
      </p>
    </div>
  )
}
