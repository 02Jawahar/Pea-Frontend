import {
  ArrowRight,
  CalendarClock,
  FileText,
  IdCard,
  LifeBuoy,
  Trophy,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Button, Card, ProgressBar } from '@/components/common/primitives'
import { EmptyState, SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import { AlertFeed } from '../examAdmin/widgets'

export default function CandidateDashboard() {
  const { candidate } = useAuth()
  const { data: applications, isLoading } = useAsync(
    () => api.applicationsFor(candidate!.id),
    candidate?.id,
  )

  if (isLoading || !candidate) return <SkeletonCards />

  const rows = applications ?? []
  const submitted = rows.filter((row) => row.status !== 'Draft').length
  const feePending = rows.filter((row) => !row.feePaid && row.status !== 'Draft').length
  const admitCards = rows.filter((row) => row.status === 'Shortlisted').length

  // A first-time user gets a real next step, not four zero-value KPI cards.
  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <EmptyState
            icon={<FileText className="size-8" strokeWidth={1.5} />}
            title="You're enrolled"
            description="Browse open examinations to apply. Your profile pre-fills every application, so applying to a second post takes a fraction of the time."
            action={
              <Link to={ROUTES.CANDIDATE_EXAMINATIONS}>
                <Button>
                  Browse open examinations
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            }
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Welcome, {candidate.name.split(' ')[0]}</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Registration Number <span className="font-mono">{candidate.registrationNo}</span> — this is
          different from an Application Number, which is issued per post.
        </p>
      </div>

      <KpiStrip>
        <KpiCard
          icon={<FileText className="size-5" />}
          label="Applications Submitted"
          value={submitted}
          tone="blue"
        />
        <KpiCard
          icon={<Wallet className="size-5" />}
          label="Fee Pending"
          value={feePending}
          tone="amber"
        />
        <KpiCard
          icon={<IdCard className="size-5" />}
          label="Admit Cards Available"
          value={admitCards ? 1 : 0}
          subLabel="One card covers every post"
          tone="green"
        />
        <KpiCard
          icon={<Trophy className="size-5" />}
          label="Results Declared"
          value={seed.results.length}
          tone="purple"
        />
      </KpiStrip>

      <div className="grid flex-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="space-y-4">
          <Card
            title="My Applications"
            action={
              <Link
                to={ROUTES.CANDIDATE_APPLICATIONS}
                className="text-[13px] font-medium text-navy-700 hover:underline"
              >
                View all
              </Link>
            }
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-grey-200">
              {rows.slice(0, 5).map((application) => (
                <li key={application.id}>
                  <Link
                    to={ROUTES.CANDIDATE_APPLICATION(application.id)}
                    className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-grey-050"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[12px] text-grey-600">
                        {application.applicationNo}
                      </p>
                      <p className="text-[13px] font-medium text-navy-900">
                        {application.postName}
                      </p>
                      <p className="text-[12px] text-grey-600">{application.departmentName}</p>
                    </div>
                    {!application.feePaid && application.status !== 'Draft' && (
                      <Link to={ROUTES.CANDIDATE_PAY(application.id)}>
                        <Button size="sm" variant="secondary">
                          Pay ₹{application.feeAmount}
                        </Button>
                      </Link>
                    )}
                    <StatusPill status={application.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Upcoming Examinations" bodyClassName="p-0">
            <ul className="divide-y divide-grey-200">
              {seed.exams
                .filter((exam) => exam.status === 'Scheduled')
                .slice(0, 3)
                .map((exam) => (
                  <li key={exam.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <CalendarClock className="size-4 shrink-0 text-navy-700" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-navy-900">{exam.name}</p>
                      <p className="text-[12px] text-grey-600">
                        {exam.examDate} · {exam.sessions[0].startTime} · {exam.mode} mode
                      </p>
                    </div>
                    <span className="text-[12px] text-grey-600">
                      {daysUntil(exam.examDate)} days to go
                    </span>
                  </li>
                ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Profile Completeness">
            <div className="flex items-center gap-4">
              <div className="relative size-20 shrink-0">
                <svg viewBox="0 0 36 36" className="size-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E3E8EF" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#1B7A3D"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${candidate.profileCompletion} 100`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[15px] font-semibold text-navy-900">
                  {candidate.profileCompletion}%
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-grey-600">
                  {candidate.profileCompletion === 100
                    ? 'Your profile is complete. Applications pre-fill instantly.'
                    : 'Next incomplete section: Work Experience.'}
                </p>
                {candidate.profileCompletion < 100 && (
                  <Link to={ROUTES.CANDIDATE_PROFILE}>
                    <Button size="sm" variant="secondary" className="mt-2">
                      Complete profile
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-grey-200 pt-3">
              {[
                ['Personal', 100],
                ['Education', candidate.profileCompletion],
                ['Sports', 40],
                ['Work Experience', 20],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-[12px] text-grey-600">{label}</span>
                  <ProgressBar value={Number(value)} tone="green" className="flex-1" showLabel />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Open Grievances" bodyClassName="p-0">
            <ul className="divide-y divide-grey-200">
              {seed.tickets
                .filter((ticket) => ticket.submittedById === candidate.id)
                .slice(0, 3)
                .map((ticket) => (
                  <li key={ticket.id} className="flex items-center gap-3 px-4 py-3">
                    <LifeBuoy className="size-4 shrink-0 text-navy-700" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] text-navy-900">{ticket.type}</p>
                      <p className="font-mono text-[12px] text-grey-600">{ticket.ticketNo}</p>
                    </div>
                    <StatusPill status={ticket.status} />
                  </li>
                ))}
            </ul>
          </Card>

          <AlertFeed title="Notifications" />
        </div>
      </div>
    </div>
  )
}

function daysUntil(date: string) {
  const target = new Date(date).getTime()
  const today = new Date(seed.DEMO_TODAY).getTime()
  return Math.max(0, Math.round((target - today) / 86_400_000))
}
