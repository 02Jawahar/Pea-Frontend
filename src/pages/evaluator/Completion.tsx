import { BadgeCheck, CircleCheck, CircleX, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { DigitalSignModal } from '@/components/common/DigitalSignModal'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { Banner, Button, Card, ProgressBar } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { seed } from '@/mock/api'
import { cn } from '@/utils/cn'
import { SummaryPanel } from '../examAdmin/widgets'

const CHECKLIST: { label: string; detail: string; done: boolean; to: string }[] = [
  {
    label: 'All batches complete',
    detail: '8 of 10 batches complete · 2 in progress',
    done: false,
    to: ROUTES.EV_BATCHES,
  },
  {
    label: 'All exceptions resolved',
    detail: '37 non-readable OMR sheets · 4 still queued',
    done: false,
    to: ROUTES.EV_OMR,
  },
  {
    label: 'Moderation sample done',
    detail: '5% sample moderated across 128 evaluators',
    done: true,
    to: ROUTES.EV_MODERATION,
  },
  {
    label: 'Normalization applied or explicitly skipped',
    detail: 'Linear normalization applied · version 1',
    done: true,
    to: ROUTES.EV_NORMALIZATION,
  },
  {
    label: 'Consolidation run',
    detail: 'Section-wise qualifying and grace rules applied to 12,458 candidates',
    done: true,
    to: ROUTES.EV_COMPLETION,
  },
  {
    label: 'Totals reconciled against attendance',
    detail: '12,458 scripts against 12,458 candidates present — no variance',
    done: true,
    to: ROUTES.EV_COMPLETION,
  },
]

/**
 * Ref. 55 and Flow 9 — the gate before marks release.
 *
 * Sign-off is digitally signed and hands control to Merit Generation. Every
 * failing item links to the screen that fixes it.
 */
export default function EvaluationCompletion() {
  const { staff, can } = useAuth()
  const [signOpen, setSignOpen] = useState(false)
  const [signed, setSigned] = useState(false)

  const outstanding = CHECKLIST.filter((item) => !item.done)
  const allDone = outstanding.length === 0

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Evaluation Completion</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Assistant Grade-II Examination 2024 · gate before marks are released to Merit Generation
        </p>
      </div>

      <KpiStrip>
        <KpiCard
          icon={<CircleCheck className="size-5" />}
          label="Checks passed"
          value={`${CHECKLIST.length - outstanding.length} of ${CHECKLIST.length}`}
          tone={allDone ? 'green' : 'amber'}
        />
        <KpiCard icon={<CircleCheck className="size-5" />} label="Scripts evaluated" value={seed.stats.scriptsEvaluated} tone="blue" />
        <KpiCard icon={<CircleX className="size-5" />} label="Exceptions open" value={4} tone="red" />
        <KpiCard
          icon={<CircleCheck className="size-5" />}
          label="Qualified after consolidation"
          value={seed.stats.qualified}
          tone="green"
        />
        <KpiCard
          icon={<CircleCheck className="size-5" />}
          label="Qualified only on grace"
          value={214}
          subLabel="the figure PEA will be asked about"
          tone="purple"
        />
      </KpiStrip>

      {signed ? (
        <Banner tone="success" icon={<BadgeCheck className="size-4" />} title="Evaluation signed off">
          Control has passed to Merit Generation. Marks are frozen; any change from here requires
          re-evaluation, which creates a new version rather than overwriting.
          <Link to={ROUTES.EA_MERIT_GENERATE}>
            <Button variant="success" size="sm" className="mt-2">
              Go to Merit Generation
            </Button>
          </Link>
        </Banner>
      ) : (
        <Banner
          tone={allDone ? 'success' : 'warning'}
          title={
            allDone
              ? 'All checks pass — ready for sign-off'
              : `${outstanding.length} check${outstanding.length === 1 ? '' : 's'} still outstanding`
          }
        >
          {allDone
            ? 'Sign off to hand control to Merit Generation.'
            : `Resolve ${outstanding.map((item) => item.label.toLowerCase()).join(' and ')} before sign-off.`}
        </Banner>
      )}

      <div className="grid flex-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="flex flex-col gap-4">
          <Card title="Completion checklist" bodyClassName="p-0" className="flex-1">
            <ul className="divide-y divide-grey-200">
              {CHECKLIST.map((item) => (
                <li key={item.label} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  {item.done ? (
                    <CircleCheck className="size-5 shrink-0 text-green-600" />
                  ) : (
                    <CircleX className="size-5 shrink-0 text-red-600" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-navy-900">{item.label}</p>
                    <p className="clamp-1 text-[12px] text-grey-600">{item.detail}</p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 text-[12px] font-medium',
                      item.done ? 'text-green-600' : 'text-red-600',
                    )}
                  >
                    {item.done ? 'Pass' : 'Fail'}
                  </span>
                  {!item.done && (
                    <Link to={item.to}>
                      <Button variant="secondary" size="sm">
                        Fix
                        <ExternalLink className="size-3.5" />
                      </Button>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Marks consolidation (Ref. 55)">
            <p className="mb-3 text-[13px] text-grey-600">
              Four rule types are configured and applied: qualifying mark per section, qualifying
              mark across all sections, grace mark per section and grace mark across all sections.
            </p>

            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  {['Outcome', 'Candidates', 'Share'].map((header) => (
                    <th key={header} className="px-4 py-2 text-left text-[12px] font-semibold uppercase">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Qualified outright', 2126],
                  ['Qualified only because of grace marks', 214],
                  ['Failed a single section despite a passing total', 391],
                  ['Not qualified', 9727],
                ].map(([label, count]) => (
                  <tr key={String(label)} className="border-b border-grey-200 last:border-b-0">
                    <td className="data-cell">{label}</td>
                    <td className="data-cell text-right font-mono">
                      {Number(count).toLocaleString('en-IN')}
                    </td>
                    <td className="data-cell min-w-36">
                      <ProgressBar
                        value={(Number(count) / 12458) * 100}
                        showLabel
                        tone={label === 'Not qualified' ? 'amber' : 'green'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <SummaryPanel
            title="Handover"
            rows={[
              { label: 'Examination', value: 'Assistant Grade-II 2024' },
              { label: 'Scripts', value: seed.stats.totalScripts.toLocaleString('en-IN') },
              { label: 'Evaluators', value: '128' },
              { label: 'Normalization', value: 'Linear · version 1' },
              { label: 'Consolidation', value: 'Run 20-May-2024' },
              { label: 'Sign-off', value: signed ? 'Signed' : 'Pending' },
            ]}
          />

          <Card title="Sign-off">
            <p className="text-[13px] text-grey-600">
              Sign-off is digitally signed by the Evaluation Admin and hands control of the marks to
              Merit Generation.
            </p>
            <Button
              variant="success"
              className="mt-3 w-full"
              disabled={!can('evaluation.complete') || !allDone || signed}
              onClick={() => setSignOpen(true)}
              title={!allDone ? 'Every checklist item must pass first.' : undefined}
            >
              <BadgeCheck className="size-4" />
              {signed ? 'Signed off' : 'Sign off & hand over'}
            </Button>
            {!allDone && !signed && (
              <p className="mt-2 text-[12px] text-grey-600">
                Disabled — {outstanding.length} check{outstanding.length === 1 ? '' : 's'} failing.
              </p>
            )}
          </Card>
        </div>
      </div>

      <DigitalSignModal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        onSigned={() => setSigned(true)}
        signerName={staff?.name ?? 'Evaluation Admin'}
        artefact="Evaluation completion — Assistant Grade-II Examination 2024"
        checkpoint="Evaluation sign-off — hands control to Merit Generation (Ref. 55)"
      />
    </div>
  )
}
