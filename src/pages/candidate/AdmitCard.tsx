import { Download, Printer, QrCode } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Banner, Button, Card } from '@/components/common/primitives'
import { EmptyState, SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'

/**
 * Ref. 37 — one admit card covers every post the candidate applied for, not one
 * per application. The QR encodes name, application reference, place of
 * residence and scribe details, and is scanned at hall entry (Ref. 47).
 */
export default function CandidateAdmitCard() {
  const { candidate } = useAuth()
  const { data, isLoading } = useAsync(() => api.applicationsFor(candidate!.id), candidate?.id)

  if (isLoading || !candidate) return <SkeletonCards />

  const eligible = (data ?? []).filter(
    (application) => application.status === 'Shortlisted' || application.courtCase,
  )

  if (eligible.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No admit card is available yet"
          description="Your admit card is released after scrutiny, once shortlisting has been approved and digitally signed. You will be notified by SMS and email."
          action={
            <Link to={ROUTES.CANDIDATE_APPLICATIONS}>
              <Button variant="secondary">Check my application status</Button>
            </Link>
          }
        />
      </Card>
    )
  }

  const courtCase = eligible.some((application) => application.courtCase)

  return (
    <div className="page mx-auto w-full max-w-4xl">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Admit Card</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            One card, {eligible.length} post{eligible.length === 1 ? '' : 's'}. Carry a printout and
            an original photo ID.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print
          </Button>
          <Button>
            <Download className="size-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {courtCase && (
        <Banner tone="warning" className="no-print" title="Admitted under court direction">
          One or more of your applications was admitted without scrutiny under a court direction.
        </Banner>
      )}

      <article className="card overflow-hidden">
        <header className="bg-navy-900 px-5 py-4 text-white">
          <p className="text-[12px] tracking-[0.14em] uppercase">Government of Puducherry</p>
          <h2 className="text-[18px] font-semibold">Puducherry Examining Authority — Admit Card</h2>
          <p className="text-[12px] text-white/75">
            Assistant Grade-II Examination 2024 · Notification PEA/NOTIF/2024/001
          </p>
        </header>

        <div className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto]">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Row label="Candidate Name" value={candidate.name} />
            <Row label="Registration Number" value={candidate.registrationNo} mono />
            <Row label="Father's Name" value={candidate.fatherName} />
            <Row label="Date of Birth" value={candidate.dob} />
            <Row label="Category" value={candidate.category} />
            <Row label="Place of Residence" value={`${candidate.district}, ${candidate.state}`} />
            {candidate.isPwBD && (
              <>
                <Row label="PwD" value={`Yes — ${candidate.disabilityCategory}`} />
                <Row
                  label="Scribe"
                  value={candidate.scribeRequired ? 'Scribe permitted' : 'Not requested'}
                />
              </>
            )}
          </dl>

          <div className="flex flex-col items-center gap-2">
            <div className="flex size-24 items-center justify-center rounded-md border border-grey-300 bg-grey-050 text-[12px] text-grey-600">
              Photo
            </div>
            <div className="flex size-24 items-center justify-center rounded-md border border-grey-300 bg-white">
              <QrCode className="size-20 text-navy-900" strokeWidth={1} />
            </div>
            <p className="max-w-28 text-center text-[10px] text-grey-600">
              QR encodes name, reference no., residence and scribe details
            </p>
          </div>
        </div>

        {/* Per-exam table — this is what makes one card cover several posts. */}
        <div className="overflow-x-auto border-t border-grey-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey-200 bg-grey-050">
                {[
                  'Application No.',
                  'Post',
                  'Exam Date',
                  'Shift',
                  'Reporting',
                  'Exam Centre',
                  'Hall',
                  'Seat',
                ].map((header) => (
                  <th
                    key={header}
                    className="px-3 py-2 text-left text-[11px] font-semibold uppercase"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eligible.map((application, index) => (
                <tr key={application.id} className="border-b border-grey-200 last:border-b-0">
                  <td className="px-3 py-2 font-mono text-[12px]">{application.applicationNo}</td>
                  <td className="px-3 py-2 text-[12px]">{application.postName}</td>
                  <td className="px-3 py-2 text-[12px]">{seed.exams[index % 3].examDate}</td>
                  <td className="px-3 py-2 text-[12px]">Morning</td>
                  <td className="px-3 py-2 text-[12px]">08:30 AM</td>
                  <td className="px-3 py-2 text-[12px]">{application.centrePreference}</td>
                  <td className="px-3 py-2 text-[12px]">Hall {(index % 5) + 1}</td>
                  <td className="px-3 py-2 font-mono text-[12px]">{String(12 + index * 7)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 border-t border-grey-200 p-5 sm:grid-cols-2">
          <div>
            <h3 className="text-[13px] font-semibold text-navy-900">Instructions</h3>
            <ul className="mt-2 space-y-1 text-[12px] text-grey-700">
              <li>Report at the centre by the reporting time. Late entry is not permitted.</li>
              <li>Carry this admit card and one original photo identity document.</li>
              <li>Your QR code is scanned at hall entry; biometric capture follows.</li>
              {candidate.isPwBD && (
                <li className="font-medium text-navy-900">
                  Compensatory time is applied automatically. Your exam duration is 180 minutes,
                  including 40 minutes compensatory time.
                </li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-navy-900">Prohibited Items</h3>
            <ul className="mt-2 space-y-1 text-[12px] text-grey-700">
              <li>Mobile phones, smart watches and any electronic device.</li>
              <li>Books, notes, calculators and printed material.</li>
              <li>Bags and any item not expressly permitted by the Centre Supervisor.</li>
            </ul>
          </div>
        </div>
      </article>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[12px] text-grey-600">{label}</dt>
      <dd className={`text-[13px] font-medium text-navy-900 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}
