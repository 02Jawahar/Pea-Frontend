import { ArrowLeft, Building2, CalendarDays, Download } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card } from '@/components/common/primitives'
import { EmptyState, SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { api, seed } from '@/mock/api'

/** Ref. 22 — the recruitment schedule is part of the notification and is public. */
export default function NotificationDetail() {
  const { id = '' } = useParams()
  const { data, isLoading } = useAsync(() => api.notification(id), id)

  if (isLoading) return <SkeletonCards />
  if (!data) {
    return (
      <Card>
        <EmptyState
          title="Notification not found"
          description="It may have been withdrawn. Check the active notifications on the home page."
          action={
            <Link to={ROUTES.HOME}>
              <Button variant="secondary">Back to home</Button>
            </Link>
          }
        />
      </Card>
    )
  }

  return (
    <div className="page mx-auto w-full max-w-4xl">
      <Link
        to={ROUTES.HOME}
        className="inline-flex items-center gap-1.5 text-[13px] text-navy-700 hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Active notifications
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[12px] text-grey-600">{data.notificationNo}</p>
          <h1 className="page-title">{data.title}</h1>
          <p className="mt-1 text-[13px] text-grey-600">{data.summary}</p>
        </div>
        <StatusPill status={data.status} size="md" />
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ['Total vacancies', String(data.totalVacancies)],
          ['Departments', String(data.departmentNames.length)],
          ['Published on', data.publishedOn ?? 'Not published'],
          ['Last date', data.lastDate],
        ].map(([label, value]) => (
          <div key={label} className="card px-4 py-3">
            <p className="text-[12px] text-grey-600">{label}</p>
            <p className="text-[16px] font-semibold text-navy-900">{value}</p>
          </div>
        ))}
      </div>

      <Card title="Posts notified" bodyClassName="p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-grey-200 bg-grey-050">
              {['Post', 'Department', 'Vacancies', 'Pay level', 'Age limit'].map((header) => (
                <th key={header} className="px-4 py-2 text-left text-[12px] font-semibold uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {seed.posts
              .filter((post) =>
                data.departmentNames.includes(
                  seed.departments.find((department) => department.id === post.departmentId)?.name ?? '',
                ),
              )
              .map((post) => (
                <tr key={post.id} className="border-b border-grey-200 last:border-b-0">
                  <td className="data-cell font-medium">{post.name}</td>
                  <td className="data-cell text-grey-600">
                    {seed.departments.find((department) => department.id === post.departmentId)?.name}
                  </td>
                  <td className="data-cell">{post.availableStrength}</td>
                  <td className="data-cell">{post.payLevel}</td>
                  <td className="data-cell">{post.ageLimit}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>

      <Card title="Recruitment schedule">
        <p className="mb-3 text-[13px] text-grey-600">
          All thirteen dates that govern this recruitment cycle, from notification to the expiry of
          the wait list.
        </p>
        <ol className="space-y-0">
          {data.schedule.map((entry, index) => (
            <li key={entry.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-050 text-[11px] font-semibold text-navy-700">
                  {index + 1}
                </span>
                {index < data.schedule.length - 1 && <span className="w-px flex-1 bg-grey-200" />}
              </div>
              <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3 pb-3">
                <span className="text-[13px] text-navy-900">{entry.label}</span>
                <span className="flex items-center gap-1.5 font-mono text-[12px] text-grey-600">
                  <CalendarDays className="size-3.5" />
                  {entry.date}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Banner tone="info" icon={<Building2 className="size-4" />} title="Before you apply">
        Enrol once and your profile pre-fills every application. A single application can be applied
        to several eligible posts — each generates its own Application Number while sharing your
        Registration Number.
      </Banner>

      <div className="flex flex-wrap gap-2">
        <Link to={ROUTES.CANDIDATE_LOGIN}>
          <Button size="lg">Apply Now</Button>
        </Link>
        <Button variant="secondary" size="lg">
          <Download className="size-4" />
          Download notification (PDF)
        </Button>
      </div>
    </div>
  )
}
