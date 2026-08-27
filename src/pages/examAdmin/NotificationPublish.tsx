import { ArrowLeft, CircleCheck, CircleX, Megaphone } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { DigitalSignModal } from '@/components/common/DigitalSignModal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card } from '@/components/common/primitives'
import { EmptyState, SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import type { GateCheck } from '@/types'
import { cn } from '@/utils/cn'

/**
 * Ref. 23 — NAPS publish gate.
 *
 * Two grouped panels (Verifications and Validations), every item pass/fail with
 * detail on expand. Publish stays disabled until all pass; each failing row
 * links to the screen that fixes it.
 */
export default function NotificationPublish() {
  const { id = '' } = useParams()
  const { data, isLoading } = useAsync(() => api.notification(id), id)
  const { can } = useAuth()
  const [signOpen, setSignOpen] = useState(false)
  const [published, setPublished] = useState(false)

  if (isLoading) return <SkeletonCards />
  if (!data) {
    return (
      <Card>
        <EmptyState title="Notification not found" description="Check the link and try again." />
      </Card>
    )
  }

  const verifications = data.napsChecks.filter((check) => check.group === 'Verification')
  const validations = data.napsChecks.filter((check) => check.group === 'Validation')
  const failures = data.napsChecks.filter((check) => !check.passed)
  const allPass = failures.length === 0

  return (
    <div className="page">
      <Link
        to={ROUTES.EA_NOTIFICATIONS}
        className="inline-flex items-center gap-1.5 text-[13px] text-navy-700 hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Notifications
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">NAPS Publish Gate</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {data.notificationNo} · {data.title}
          </p>
        </div>
        <StatusPill status={published ? 'Published' : data.status} size="md" />
      </div>

      {published ? (
        <Banner tone="success" title="Notification published">
          It is now visible on the public portal along with the full recruitment schedule.
          Applications open on {data.schedule[1].date}.
        </Banner>
      ) : allPass ? (
        <Banner tone="success" title="All checks pass">
          The Notification Approval and Publishing System has cleared this notification for publish.
        </Banner>
      ) : (
        <Banner tone="danger" title={`${failures.length} check${failures.length === 1 ? '' : 's'} must pass before publish`}>
          Publish stays disabled until every verification and validation clears. Use the links
          against each failing row to fix it at source.
        </Banner>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <GatePanel title="Verifications" checks={verifications} />
        <GatePanel title="Validations" checks={validations} />
      </div>

      <Card title="Recruitment Schedule">
        <p className="mb-3 text-[13px] text-grey-600">
          All 13 dates are part of the notification and are rendered publicly as a timeline (Ref. 22).
          Chronological order is validated across the whole set.
        </p>
        <ol className="space-y-0">
          {data.schedule.map((entry, index) => {
            const previous = data.schedule[index - 1]
            const outOfOrder = previous ? entry.date < previous.date : false
            return (
              <li key={entry.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'mt-1 size-2.5 shrink-0 rounded-full',
                      outOfOrder ? 'bg-red-600' : 'bg-navy-700',
                    )}
                  />
                  {index < data.schedule.length - 1 && <span className="w-px flex-1 bg-grey-200" />}
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 pb-3 flex-1">
                  <span className="text-[13px] text-navy-900">{entry.label}</span>
                  <span
                    className={cn(
                      'font-mono text-[12px]',
                      outOfOrder ? 'font-semibold text-red-600' : 'text-grey-600',
                    )}
                  >
                    {entry.date}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="success"
          size="lg"
          disabled={!allPass || published || !can('notification.publish')}
          onClick={() => setSignOpen(true)}
          title={
            !allPass
              ? 'Every NAPS check must pass before the notification can be published.'
              : !can('notification.publish')
                ? 'Your roles do not grant notification.publish.'
                : undefined
          }
        >
          <Megaphone className="size-4" />
          {published ? 'Published' : 'Sign & Publish Notification'}
        </Button>
        {!allPass && (
          <p className="text-[13px] text-grey-600">
            Disabled — {failures.map((check) => check.label).join(', ')} still failing.
          </p>
        )}
      </div>

      <DigitalSignModal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        onSigned={() => setPublished(true)}
        signerName="Secretary (Personnel)"
        artefact={`Final Notification ${data.notificationNo}`}
        checkpoint="Checkpoint 4 of 9 — Final notification approval (Ref. 21)"
      />
    </div>
  )
}

function GatePanel({ title, checks }: { title: string; checks: GateCheck[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <Card title={title} bodyClassName="p-0">
      <ul className="divide-y divide-grey-200">
        {checks.map((check) => (
          <li key={check.label}>
            <button
              type="button"
              onClick={() => setExpanded(expanded === check.label ? null : check.label)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-grey-050"
              aria-expanded={expanded === check.label}
            >
              {check.passed ? (
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-green-600" />
              ) : (
                <CircleX className="mt-0.5 size-4 shrink-0 text-red-600" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-navy-900">{check.label}</span>
                {expanded === check.label && (
                  <span className="mt-1 block text-[12px] text-grey-600">{check.detail}</span>
                )}
              </span>
              <span
                className={cn(
                  'shrink-0 text-[12px] font-medium',
                  check.passed ? 'text-green-600' : 'text-red-600',
                )}
              >
                {check.passed ? 'Pass' : 'Fail'}
              </span>
            </button>

            {!check.passed && expanded === check.label && (
              <div className="border-t border-grey-200 bg-red-050 px-4 py-2.5">
                <Link
                  to={ROUTES.DEPT_MATRIX}
                  className="text-[13px] font-medium text-red-600 hover:underline"
                >
                  Go to the screen that fixes this →
                </Link>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  )
}
