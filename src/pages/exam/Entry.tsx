import { ArrowRight, Fingerprint, Mic, QrCode, ScanFace, Camera } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Banner, Button } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'

/**
 * Ref. 47 — hall entry.
 *
 * The candidate-facing artefact here is the admit card QR; the capture itself is
 * driven from the invigilator's device. This screen exists so the candidate can
 * see what will happen at the door and reach the instructions afterwards.
 */
export default function ExamEntry() {
  return (
    <div className="min-h-screen bg-navy-900 py-6">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-lg bg-white p-6">
          <p className="text-[12px] tracking-[0.14em] text-grey-600 uppercase">
            Puducherry Examining Authority
          </p>
          <h1 className="mt-1 text-[22px] font-semibold text-navy-900">Hall Entry</h1>
          <p className="mt-1 text-[13px] text-grey-600">
            Present your admit card at the door. The invigilator scans the QR code and completes
            verification on their device.
          </p>

          <div className="mt-5 flex flex-col items-center gap-3 rounded-md border border-grey-200 bg-grey-050 py-8">
            <QrCode className="size-28 text-navy-900" strokeWidth={0.8} />
            <p className="text-[12px] text-grey-600">
              Encodes name, application reference, place of residence and scribe details
            </p>
          </div>

          <ol className="mt-5 space-y-2">
            {[
              [<QrCode key="a" className="size-4" />, 'Scan QR from your admit card', 'Resolves your name, hall, seat and scribe flag'],
              [<Camera key="b" className="size-4" />, 'Live photograph', 'Captured at the door'],
              [<Mic key="c" className="size-4" />, 'Voice sample', 'Recorded as an artefact for dispute resolution'],
              [<Fingerprint key="d" className="size-4" />, 'Fingerprint', 'Matched against your enrolment record'],
              [<ScanFace key="e" className="size-4" />, 'Aadhaar face authentication', 'Where Aadhaar was captured at enrolment'],
            ].map(([icon, label, detail], index) => (
              <li key={String(label)} className="flex gap-3 rounded-md border border-grey-200 px-3 py-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-050 text-navy-700">
                  {icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-navy-900">
                    {index + 1}. {String(label)}
                  </p>
                  <p className="text-[12px] text-grey-600">{String(detail)}</p>
                </div>
              </li>
            ))}
          </ol>

          <Banner tone="info" className="mt-4">
            If any capture device fails, the invigilator records the reason and you are admitted
            regardless. A device failure never bars a candidate from the exam.
          </Banner>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link to={ROUTES.EXAM_INSTRUCTIONS}>
              <Button size="lg">
                Continue to instructions
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to={ROUTES.CANDIDATE_ADMIT_CARD}>
              <Button variant="secondary" size="lg">
                View my admit card
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
