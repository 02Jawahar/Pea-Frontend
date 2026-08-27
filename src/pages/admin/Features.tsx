import { Clock, Rocket, ShieldCheck, Undo2 } from 'lucide-react'
import { useState } from 'react'

import { Modal } from '@/components/common/Modal'
import { OtpModal } from '@/components/common/OtpModal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Field, Input, Select, Tabs } from '@/components/common/primitives'
import { useAuth } from '@/hooks/useAuth'
import { seed } from '@/mock/api'
import { cn } from '@/utils/cn'

type TabId = 'matrix' | 'releases' | 'alerts'

const FEATURES = [
  'Requisition workflow',
  'Finance concurrence routing',
  'Application scrutiny',
  'Physical test gate',
  'CBT examination',
  'Answer key objections',
  'Normalization',
  'Re-evaluation',
  'e-Dossier',
]

const RELEASES = [
  {
    version: '2.4.0',
    title: 'Answer key objection module',
    modules: 'Evaluator Portal · Candidate Portal',
    status: 'Pending authentication',
    notes: 'Adds the objection window, adjudication grouped by question and final-key re-scoring.',
  },
  {
    version: '2.3.2',
    title: 'Seat sequence constraint engine',
    modules: 'Exam Admin Portal',
    status: 'Pending authentication',
    notes: 'Enforces the Ref. 45 adjacency and hall-allocation constraints simultaneously.',
  },
  {
    version: '2.3.1',
    title: 'Payment reconciliation exceptions',
    modules: 'Admin Portal',
    status: 'Live',
    notes: 'Bank statement upload, auto-match and the three exception types.',
  },
]

/**
 * Ref. 68, 69 — Super Admin enables and disables features per department at
 * task and workflow level, and a new feature release must be authenticated by
 * the Super Admin (with MFA) before it opens to users.
 */
export default function FeatureConfiguration() {
  const { can } = useAuth()
  const [tab, setTab] = useState<TabId>('matrix')
  const [releasing, setReleasing] = useState<(typeof RELEASES)[number] | null>(null)
  const [mfaOpen, setMfaOpen] = useState(false)
  const [live, setLive] = useState<string[]>(['2.3.1'])

  const readOnly = !can('feature.configure')

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Feature Configuration</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Enable or disable features per department, and gate new releases behind Super Admin
          authentication.
        </p>
      </div>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'matrix', label: 'Department × feature' },
          {
            id: 'releases',
            label: 'Release gate',
            count: RELEASES.filter((release) => !live.includes(release.version)).length,
          },
          { id: 'alerts', label: 'Workflow alert timelines' },
        ]}
      />

      {tab === 'matrix' && (
        <Card title="Feature availability by department" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  <th className="sticky left-0 z-10 bg-grey-050 px-4 py-2.5 text-left text-[12px] font-semibold uppercase">
                    Department
                  </th>
                  {FEATURES.map((feature) => (
                    <th
                      key={feature}
                      className="px-2 py-2.5 text-center text-[11px] font-semibold text-grey-700"
                    >
                      <span className="block max-w-24">{feature}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seed.departments.map((department, departmentIndex) => (
                  <tr key={department.id} className="border-b border-grey-200 last:border-b-0">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-white px-4 py-2 text-left text-[13px] font-medium text-navy-900"
                    >
                      {department.name}
                    </th>
                    {FEATURES.map((feature, featureIndex) => {
                      // Education Department carries the marks-weightage variation (Ref. 56).
                      const enabled = !(departmentIndex === 2 && featureIndex === 4)
                      return (
                        <td key={feature} className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            defaultChecked={enabled}
                            disabled={readOnly}
                            aria-label={`${department.name} — ${feature}`}
                            className={cn('size-4', readOnly && 'cursor-not-allowed')}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'releases' && (
        <div className="space-y-3">
          <Banner tone="info" icon={<ShieldCheck className="size-4" />} title="Releases are gated">
            A new feature must be authenticated by the Super Admin with MFA before it opens to
            users. Rollout can be staged by department, and every release keeps a rollback control.
          </Banner>

          {RELEASES.map((release) => {
            const isLive = live.includes(release.version)
            return (
              <Card key={release.version}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[13px] font-semibold text-navy-900">
                        v{release.version}
                      </span>
                      <span className="text-[15px] font-semibold text-navy-900">
                        {release.title}
                      </span>
                      <StatusPill status={isLive ? 'Active' : 'Pending'} />
                    </p>
                    <p className="mt-1 text-[13px] text-grey-600">{release.notes}</p>
                    <p className="mt-1 text-[12px] text-grey-600">
                      Affected modules: {release.modules}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {isLive ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={readOnly}
                        onClick={() =>
                          setLive((previous) => previous.filter((item) => item !== release.version))
                        }
                      >
                        <Undo2 className="size-3.5" />
                        Roll back
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={!can('feature.release')}
                        onClick={() => setReleasing(release)}
                      >
                        <Rocket className="size-3.5" />
                        Authenticate &amp; release
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {tab === 'alerts' && (
        <Card title="Workflow alert timelines (Ref. 14)">
          <p className="mb-3 text-[13px] text-grey-600">
            The delay after which a pending task raises an alert, per workflow stage, and the
            channels the alert uses. Department dashboards show which of their tasks are approaching
            or past their threshold.
          </p>

          <table className="w-full">
            <thead>
              <tr className="border-b border-grey-200 bg-grey-050">
                {['Workflow stage', 'Alert after', 'Escalate after', 'System alert', 'SMS'].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-2 text-left text-[12px] font-semibold uppercase"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {[
                ['Requisition initiation', 3, 7],
                ['Requisition verification', 3, 7],
                ['Requisition approval', 5, 10],
                ['Finance concurrence', 7, 14],
                ['Notification approval', 3, 5],
                ['Application scrutiny', 10, 15],
                ['Shortlisting approval', 3, 5],
                ['Merit approval', 5, 10],
              ].map(([stage, alertDays, escalateDays]) => (
                <tr key={String(stage)} className="border-b border-grey-200 last:border-b-0">
                  <td className="data-cell font-medium">{stage}</td>
                  <td className="data-cell">
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        defaultValue={Number(alertDays)}
                        readOnly={readOnly}
                        className="w-16 py-1 text-center"
                        aria-label={`Alert after, ${stage}`}
                      />
                      <span className="text-[12px] text-grey-600">days</span>
                    </div>
                  </td>
                  <td className="data-cell">
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        defaultValue={Number(escalateDays)}
                        readOnly={readOnly}
                        className="w-16 py-1 text-center"
                        aria-label={`Escalate after, ${stage}`}
                      />
                      <span className="text-[12px] text-grey-600">days</span>
                    </div>
                  </td>
                  <td className="data-cell">
                    <input type="checkbox" defaultChecked disabled={readOnly} className="size-4" />
                  </td>
                  <td className="data-cell">
                    <input type="checkbox" defaultChecked disabled={readOnly} className="size-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-grey-600">
            <Clock className="size-3.5" />
            Alerts fire from the moment a task lands with an office, not from when a user opens it.
          </p>
        </Card>
      )}

      <Modal
        open={releasing !== null}
        onClose={() => setReleasing(null)}
        title={releasing ? `Release v${releasing.version}?` : ''}
        description={releasing?.title}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReleasing(null)}>
              Cancel
            </Button>
            <Button onClick={() => setMfaOpen(true)}>
              <ShieldCheck className="size-4" />
              Authenticate with MFA
            </Button>
          </>
        }
      >
        {releasing && (
          <div className="space-y-3">
            <div className="rounded-md border border-grey-200 p-3">
              <p className="text-[12px] text-grey-600">Release notes</p>
              <p className="text-[13px] text-navy-900">{releasing.notes}</p>
              <p className="mt-2 text-[12px] text-grey-600">Affected modules</p>
              <p className="text-[13px] text-navy-900">{releasing.modules}</p>
            </div>

            <Field label="Rollout" hint="Staged rollout by department is preferred for a first release.">
              <Select defaultValue="Staged — Revenue Department first">
                <option>Staged — Revenue Department first</option>
                <option>All departments at once</option>
              </Select>
            </Field>

            <Banner tone="warning">
              Until you authenticate, this feature stays closed to every user regardless of their
              role.
            </Banner>
          </div>
        )}
      </Modal>

      <OtpModal
        open={mfaOpen}
        onClose={() => setMfaOpen(false)}
        onVerified={() => {
          if (releasing) setLive((previous) => [...previous, releasing.version])
          setMfaOpen(false)
          setReleasing(null)
        }}
        destination="Super Admin registered mobile"
        purpose="feature release authentication (MFA)"
      />
    </div>
  )
}
