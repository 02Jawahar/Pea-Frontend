import { CalendarClock, CheckCircle2, CircleAlert, Filter, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Select } from '@/components/common/primitives'
import { EmptyState, SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import type { Post } from '@/types'

/**
 * Ref. 26 — browse and register for a post.
 *
 * Before the form opens, the eligibility check (§2.2.4 General Point 1) runs
 * and is shown as an advisory panel. It is explicitly informative, not a
 * decision, and never blocks Apply.
 */
export default function CandidateExaminations() {
  const { data: posts, isLoading } = useAsync(() => api.posts(), 'posts')
  const { candidate } = useAuth()
  const [department, setDepartment] = useState('')
  const [checking, setChecking] = useState<Post | null>(null)

  if (isLoading) return <SkeletonCards />

  const open = (posts ?? []).filter(
    (post) => !department || seed.departments.find((d) => d.id === post.departmentId)?.name === department,
  )

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Available Examinations</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {open.length} post{open.length === 1 ? '' : 's'} open for application
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            aria-label="Filter by department"
            className="w-auto"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
          >
            <option value="">All Departments</option>
            {seed.departments.map((item) => (
              <option key={item.id}>{item.name}</option>
            ))}
          </Select>
          <Button variant="secondary">
            <Filter className="size-4" />
            Filter
          </Button>
        </div>
      </div>

      {open.length === 0 ? (
        <Card>
          <EmptyState
            title="No posts match this filter"
            description="Clear the department filter to see every open notification."
            action={
              <Button variant="secondary" onClick={() => setDepartment('')}>
                Clear filter
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {open.map((post) => {
            const dept = seed.departments.find((item) => item.id === post.departmentId)!
            return (
              <article key={post.id} className="card flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold text-navy-900">{post.name}</h2>
                    <p className="text-[12px] text-grey-600">{dept.name}</p>
                  </div>
                  <StatusPill status="Published" />
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
                  <Meta label="No. of Posts" value={String(post.availableStrength)} />
                  <Meta label="Pay Level" value={post.payLevel} />
                  <Meta label="Classification" value={post.classification} />
                  <Meta label="Age Limit" value={post.ageLimit} />
                </dl>

                <p className="mt-3 flex items-center gap-1.5 text-[12px] text-grey-600">
                  <CalendarClock className="size-3.5" />
                  Last date: 15-Jun-2024
                </p>
                <p className="flex items-center gap-1.5 text-[12px] text-grey-600">
                  <MapPin className="size-3.5" />
                  Centres across Puducherry, Karaikal, Mahe and Yanam
                </p>

                <div className="mt-4 flex gap-2 border-t border-grey-200 pt-3">
                  <Button size="sm" className="flex-1" onClick={() => setChecking(post)}>
                    Apply Now
                  </Button>
                  <Link to={ROUTES.NOTIFICATION('ntf-1')}>
                    <Button size="sm" variant="secondary">
                      Details
                    </Button>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Modal
        open={checking !== null}
        onClose={() => setChecking(null)}
        title="Eligibility check"
        description="Informative only — this is not a decision on your candidature."
        footer={
          <>
            <Button variant="secondary" onClick={() => setChecking(null)}>
              Not now
            </Button>
            <Link to={checking ? ROUTES.CANDIDATE_APPLY(checking.id) : '#'}>
              <Button>Continue to application</Button>
            </Link>
          </>
        }
      >
        {checking && candidate && (
          <div className="space-y-3">
            <Banner tone="info">
              Based on your profile you appear to meet <strong>6 of 7</strong> criteria for{' '}
              {checking.name}. Experience requirement could not be verified. You may apply
              regardless — eligibility is decided at scrutiny by the department.
            </Banner>

            <ul className="divide-y divide-grey-200 rounded-md border border-grey-200">
              {[
                ['Age within limit', true, `Your date of birth ${candidate.dob}`],
                ['Essential qualification', true, 'Graduate — recorded in your profile'],
                ['Desirable qualification', true, 'Computer literacy certificate on file'],
                ['Category', true, `${candidate.category} — reservation applies`],
                ['Local candidate', true, `${candidate.district} district`],
                ['Nationality', true, 'Indian'],
                ['Years of experience', false, 'No work experience recorded in your profile'],
              ].map(([label, met, detail]) => (
                <li key={String(label)} className="flex items-start gap-2.5 px-3 py-2.5">
                  {met ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                  ) : (
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-navy-900">{String(label)}</p>
                    <p className="text-[12px] text-grey-600">{String(detail)}</p>
                  </div>
                  <span className="shrink-0 text-[12px] text-grey-600">
                    {met ? 'Meets' : 'Cannot verify'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
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
