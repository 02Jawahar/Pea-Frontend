import { CircleCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Banner, Button } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'

/** Shell C — final confirmation. No route back into the paper. */
export default function ExamSubmitted() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-050">
          <CircleCheck className="size-10 text-green-600" strokeWidth={1.5} />
        </span>
        <h1 className="mt-4 text-[22px] font-semibold text-navy-900">Your exam has been submitted</h1>
        <p className="mt-2 text-[13px] text-grey-600">
          Assistant Grade-II Examination 2024 · APP20240012345 · submitted at 11:47 AM
        </p>

        <dl className="mt-5 grid grid-cols-3 gap-3 text-left">
          {[
            ['Answered', '86'],
            ['Not answered', '14'],
            ['Marked for review', '7'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md bg-grey-050 px-3 py-2">
              <dt className="text-[12px] text-grey-600">{label}</dt>
              <dd className="text-[18px] font-semibold text-navy-900">{value}</dd>
            </div>
          ))}
        </dl>

        <Banner tone="info" className="mt-5 text-left">
          Your response sheet is published after the exam window closes. The provisional answer key
          follows, with a window to raise objections before the final key is published.
        </Banner>

        <p className="mt-5 text-[13px] text-grey-600">
          Please hand your rough sheet to the invigilator and leave the hall quietly.
        </p>

        <Link to={ROUTES.CANDIDATE_DASHBOARD}>
          <Button variant="secondary" className="mt-4">
            Return to the Candidate Portal
          </Button>
        </Link>
      </div>
    </div>
  )
}
