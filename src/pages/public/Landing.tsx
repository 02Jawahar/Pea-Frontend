import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  FileSearch,
  Gauge,
  IdCard,
  ShieldCheck,
  Ticket,
  UserPlus,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card } from '@/components/common/primitives'
import { SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/mock/api'

export default function Landing() {
  const { data: notifications, isLoading } = useAsync(() => api.notifications(), 'notifications')
  const published = (notifications ?? []).filter((item) => item.status === 'Published')

  return (
    <div className="page mx-auto w-full max-w-6xl">
      <section className="rounded-lg bg-navy-900 px-6 py-8 text-white">
        <p className="text-[12px] font-semibold tracking-[0.14em] text-amber-500 uppercase">
          Puducherry Examining Authority
        </p>
        <h1 className="mt-2 max-w-3xl text-[26px] leading-tight font-semibold">
          Integrated e-Recruitment and Digital End-to-End Examination Management
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] text-white/80">
          Enrol once and apply to any post as it opens. Enrolment does not require a live
          notification — you can register now as part of your readiness and apply later.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to={ROUTES.REGISTER}>
            <Button variant="success" size="lg">
              <UserPlus className="size-4" />
              New Registration
            </Button>
          </Link>
          <Link to={ROUTES.CANDIDATE_LOGIN}>
            <Button
              variant="secondary"
              size="lg"
              className="border-white/30 bg-transparent text-white ring-white/30 hover:bg-white/10"
            >
              Candidate Login
            </Button>
          </Link>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card
          title="Active Notifications"
          action={
            <span className="text-[12px] text-grey-600">
              {published.length} open for application
            </span>
          }
          bodyClassName="p-0"
        >
          {isLoading ? (
            <div className="p-4">
              <SkeletonCards count={2} />
            </div>
          ) : (
            <ul className="divide-y divide-grey-200">
              {published.map((notification) => (
                <li key={notification.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[12px] text-grey-600">
                        {notification.notificationNo}
                      </p>
                      <h3 className="mt-0.5 text-[15px] font-semibold text-navy-900">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-[13px] text-grey-600">{notification.summary}</p>
                    </div>
                    <StatusPill status={notification.status} />
                  </div>

                  <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
                    <Meta label="Vacancies" value={String(notification.totalVacancies)} />
                    <Meta label="Departments" value={notification.departmentNames.join(', ')} />
                    <Meta label="Published" value={notification.publishedOn ?? '—'} />
                    <Meta label="Last date" value={notification.lastDate} />
                  </dl>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to={ROUTES.NOTIFICATION(notification.id)}>
                      <Button variant="secondary" size="sm">
                        View notification & schedule
                      </Button>
                    </Link>
                    <Link to={ROUTES.CANDIDATE_LOGIN}>
                      <Button size="sm">
                        Apply Now
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          <Card title="Quick Services">
            <ul className="space-y-2">
              <QuickLink
                to={ROUTES.TRACK_APPLICATION}
                icon={<FileSearch className="size-4" />}
                label="Track your application"
                detail="Application Number + OTP. No login needed."
              />
              <QuickLink
                to={ROUTES.TRACK_GRIEVANCE}
                icon={<Ticket className="size-4" />}
                label="Track a grievance"
                detail="Ticket number + date of submission."
              />
              <QuickLink
                to={ROUTES.CANDIDATE_LOGIN}
                icon={<IdCard className="size-4" />}
                label="Download admit card"
                detail="One admit card covers every post you applied for."
              />
              <QuickLink
                to={ROUTES.LOGIN}
                icon={<Gauge className="size-4" />}
                label="Staff & officer login"
                detail="Department, PEA, Evaluator, Helpdesk and Admin portals."
              />
            </ul>
          </Card>

          <Card title="How it works">
            <ol className="space-y-3">
              {[
                ['Register once', 'Aadhaar-assisted enrolment in 6 steps. Reusable for every post.'],
                ['Apply to a post', 'Your profile pre-fills the form. One form can cover several posts.'],
                ['Pay the fee', 'Net banking, card, UPI or wallet. Every attempt is listed to you.'],
                ['Sit the exam', 'Admit card with QR, hall and seat. Scribe and compensatory time where entitled.'],
                ['Get your result', 'Scorecard, merit position, selection list and appointment order.'],
              ].map(([title, detail], index) => (
                <li key={title} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-050 text-[12px] font-semibold text-navy-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-navy-900">{title}</p>
                    <p className="text-[12px] text-grey-600">{detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      <Banner tone="info" icon={<ShieldCheck className="size-4" />} title="Accessibility & languages">
        This portal meets WCAG 2.1 AA. Use A- / A / A+ and the contrast toggle in the header — both
        settings persist across sessions. Question papers are offered in English, Tamil, Malayalam
        and Telugu. Candidates with benchmark disabilities are offered a scribe and compensatory time
        automatically where the disability category entitles them.
      </Banner>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [<BadgeCheck key="a" className="size-4" />, 'Role Based Access Control'],
          [<ShieldCheck key="b" className="size-4" />, 'Secure & Encrypted Data'],
          [<CalendarClock key="c" className="size-4" />, 'Audit Trail & Logs'],
          [<Gauge key="d" className="size-4" />, 'Real-time Notifications'],
        ].map(([icon, label]) => (
          <div
            key={String(label)}
            className="card flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-navy-900"
          >
            <span className="text-green-600">{icon}</span>
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] text-grey-600">{label}</dt>
      <dd className="font-medium text-navy-900">{value}</dd>
    </div>
  )
}

function QuickLink({
  to,
  icon,
  label,
  detail,
}: {
  to: string
  icon: React.ReactNode
  label: string
  detail: string
}) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-start gap-3 rounded-md border border-grey-200 px-3 py-2.5 transition-colors hover:bg-grey-050"
      >
        <span className="mt-0.5 text-navy-700">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-medium text-navy-900">{label}</span>
          <span className="block text-[12px] text-grey-600">{detail}</span>
        </span>
        <ArrowRight className="mt-1 size-3.5 shrink-0 text-grey-600" />
      </Link>
    </li>
  )
}
