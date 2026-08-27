import {
  Award,
  ChevronRight,
  Download,
  Eye,
  FileText,
  History,
  Megaphone,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { DonutChart } from '@/components/charts'
import { DigitalSignModal } from '@/components/common/DigitalSignModal'
import { StepperWizard } from '@/components/common/StepperWizard'
import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Field, Select } from '@/components/common/primitives'
import { SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import { cn } from '@/utils/cn'
import { QuickActions, SummaryPanel } from './widgets'

const STEPS = [
  { id: 'select', label: 'Select Exam' },
  { id: 'criteria', label: 'Apply Criteria' },
  { id: 'generate', label: 'Generate Merit' },
  { id: 'review', label: 'Review & Validate' },
  { id: 'publish', label: 'Publish Result' },
]

/** Merit Generation — demo slide 8, 5-step wizard exactly as specified (Ref. 58). */
export default function MeritGenerate() {
  const { data, isLoading } = useAsync(() => api.meritLists(), 'meritLists')
  const { staff, can } = useAuth()
  const [step, setStep] = useState(0)
  const [examId, setExamId] = useState('exm-1')
  const [meritType, setMeritType] = useState<'Overall Merit' | 'Category Merit'>('Overall Merit')
  const [generated, setGenerated] = useState(false)
  const [signOpen, setSignOpen] = useState(false)
  const [approved, setApproved] = useState(false)

  if (isLoading) return <SkeletonCards />

  const meritList = (data ?? [])[0]
  const exam = seed.exams.find((item) => item.id === examId)!
  const s = seed.stats

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Merit Generation</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Generate Merit Lists, Apply Tie-Breaker Rules and Publish Results · {staff?.name} (
          {staff?.employeeId})
        </p>
      </div>

      <KpiStrip>
        <KpiCard icon={<FileText className="size-5" />} label="Examinations" value={3} subLabel="Active Exams" tone="blue" />
        <KpiCard icon={<Users className="size-5" />} label="Candidates Appeared" value={s.totalApplications} subLabel="Total" tone="green" />
        <KpiCard icon={<Award className="size-5" />} label="Merit Lists Generated" value={3} subLabel="This Exam" tone="purple" />
        <KpiCard icon={<Megaphone className="size-5" />} label="Results Published" value={1} subLabel="This Exam" tone="amber" />
        <KpiCard icon={<ShieldAlert className="size-5" />} label="Tie-Breaker Rules" value="Configured" subLabel="Active" tone="green" />
      </KpiStrip>

      {/* Ref. 56 — confidentiality is a first-class requirement, not a footnote. */}
      <Banner tone="danger" icon={<ShieldAlert className="size-4" />} title="Confidential — not for public display">
        The merit list is viewable only by concerned officials. Every view and download is logged
        against your Employee ID, and exports are watermarked with it. Do not circulate outside the
        approving chain.
      </Banner>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card title="Merit Generation Workflow">
            <StepperWizard steps={STEPS} current={step} onStepClick={setStep} className="mb-5" />

            {step === 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Select Examination" required>
                  <Select value={examId} onChange={(event) => setExamId(event.target.value)}>
                    {seed.exams.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Select Post / Category">
                  <Select defaultValue="Assistant Grade-II (General)">
                    <option>Assistant Grade-II (General)</option>
                    <option>Assistant Grade-II (OBC)</option>
                    <option>Assistant Grade-II (SC)</option>
                  </Select>
                </Field>

                <Field label="Merit Type">
                  <div className="flex gap-4 pt-2">
                    {(['Overall Merit', 'Category Merit'] as const).map((option) => (
                      <label key={option} className="flex items-center gap-1.5 text-[13px]">
                        <input
                          type="radio"
                          name="meritType"
                          checked={meritType === option}
                          onChange={() => setMeritType(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </Field>

                <div className="sm:col-span-3">
                  <Button onClick={() => setStep(1)}>
                    Proceed
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <p className="text-[13px] text-grey-600">
                  Criteria for {exam.departmentName} — versioned with effective dates, so a
                  correction never rewrites the set a previous list was generated under (Ref. 57).
                </p>
                <ul className="divide-y divide-grey-200 rounded-md border border-grey-200">
                  {[
                    ['Horizontal and vertical reservation', 'Applied', '—'],
                    ['One-time provision for Ex-Service Men', 'Applied', '—'],
                    ['Preference for local candidates', 'Applied', '—'],
                    ['Weightage on educational qualification', 'Not applicable to this post', '0%'],
                    ['Weightage on work experience', 'Not applicable to this post', '0%'],
                    ['Weightage on physical fitness', 'Not applicable to this post', '0%'],
                    ['Weightage — Paper I', 'Applied', '60%'],
                    ['Weightage — Paper II', 'Applied', '40%'],
                    ['Tie-breaker: older candidate ranks higher', 'Applied', '—'],
                  ].map(([rule, status, weight]) => (
                    <li key={rule} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                      <span className="min-w-0 flex-1 text-[13px] text-navy-900">{rule}</span>
                      <span
                        className={cn(
                          'text-[12px]',
                          status === 'Applied' ? 'text-green-600' : 'text-grey-600',
                        )}
                      >
                        {status}
                      </span>
                      <span className="w-12 text-right font-mono text-[12px] text-grey-600">
                        {weight}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-[13px] font-medium text-navy-900">Total paper weightage: 100%</p>
                <Button onClick={() => setStep(2)}>
                  Continue
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}

            {step >= 2 && (
              <div className="space-y-3">
                {!generated && step === 2 ? (
                  <div className="space-y-3">
                    <Banner tone="info" title="Ready to generate">
                      {s.totalApplications.toLocaleString('en-IN')} candidates appeared;{' '}
                      {meritList.considered.toLocaleString('en-IN')} are considered for merit after
                      qualifying-mark and grace rules. This will create version{' '}
                      {meritList.version + 1}; version {meritList.version} is retained and remains
                      comparable.
                    </Banner>
                    <Button
                      variant="success"
                      onClick={() => {
                        setGenerated(true)
                        setStep(3)
                      }}
                    >
                      <Award className="size-4" />
                      Generate Merit List
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="label-caps">Merit List Preview (Top 10)</p>
                      <Link
                        to={ROUTES.EA_MERIT_LIST(meritList.id)}
                        className="text-[13px] font-medium text-navy-700 hover:underline"
                      >
                        View Full Merit List →
                      </Link>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-y border-grey-200 bg-grey-050">
                            {[
                              'Rank',
                              'Roll Number',
                              'Candidate Name',
                              'Category',
                              'Total Marks (out of 100)',
                              'Normalized Marks',
                              'Tie-Breaker Applied',
                            ].map((header) => (
                              <th
                                key={header}
                                className="px-3 py-2 text-left text-[12px] font-semibold uppercase"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {meritList.entries.map((entry) => (
                            <tr
                              key={entry.rollNo}
                              className={cn(
                                'border-b border-grey-200 last:border-b-0',
                                entry.tieBreakerApplied && 'bg-amber-050',
                              )}
                            >
                              <td className="data-cell font-semibold">{entry.rank}</td>
                              <td className="data-cell font-mono text-[12px]">{entry.rollNo}</td>
                              <td className="data-cell">{entry.candidateName}</td>
                              <td className="data-cell">{entry.category}</td>
                              <td className="data-cell">{entry.totalMarks.toFixed(2)}</td>
                              {/* Ref. 51 — 4 decimal places carried through to merit. */}
                              <td className="data-cell font-mono">
                                {entry.normalizedMarks.toFixed(4)}
                              </td>
                              <td className="data-cell">
                                {entry.tieBreakerApplied ? (
                                  <span className="font-medium text-amber-500">Yes</span>
                                ) : (
                                  'No'
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <p className="text-[13px] text-grey-600">
                      Showing Top 10 of {meritList.size} Candidates
                    </p>

                    {step === 3 && (
                      <div className="flex flex-wrap gap-2 border-t border-grey-200 pt-3">
                        <Button variant="secondary">
                          <History className="size-4" />
                          Compare with version {meritList.version - 1}
                        </Button>
                        <Button
                          variant="success"
                          disabled={!can('merit.approve')}
                          onClick={() => setSignOpen(true)}
                        >
                          Approve &amp; Sign merit list
                        </Button>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="space-y-3 border-t border-grey-200 pt-3">
                        {approved ? (
                          <>
                            <Banner tone="success" title="Merit list approved and signed">
                              The Selection List can now be generated. Reverting the selection list
                              to merit later requires the merit list to be verified and approved
                              again before it can be regenerated (Ref. 60).
                            </Banner>
                            <Link to={ROUTES.EA_SELECTION}>
                              <Button variant="success">Generate Selection List</Button>
                            </Link>
                          </>
                        ) : (
                          <Banner tone="warning" title="Approval and signature are required first">
                            The Selection List button stays disabled until the merit list is verified,
                            approved and digitally signed by the competent official (Ref. 59).
                          </Banner>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <SummaryPanel
            title={`Merit Summary (${exam.name})`}
            rows={[
              { label: 'Total Candidates Appeared', value: meritList.appeared.toLocaleString('en-IN') },
              { label: 'Candidates Considered for Merit', value: meritList.considered.toLocaleString('en-IN') },
              { label: 'Merit List Size', value: meritList.size },
              { label: 'Tie-Breaker Rules Applied', value: 'Yes' },
              { label: 'Merit Generated On', value: meritList.generatedOn },
              { label: 'Generated By', value: meritList.generatedBy },
              { label: 'Status', value: <StatusPill status={meritList.status} /> },
            ]}
            footer={
              <Link
                to={ROUTES.EA_MERIT_LIST(meritList.id)}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-navy-700 hover:underline"
              >
                <Eye className="size-3.5" />
                View Merit List
              </Link>
            }
          />

          <Card title="Category Wise Merit Distribution">
            <DonutChart
              data={seed.meritCategoryDistribution}
              totalLabel="Total"
              valueFormatter={(value) => String(value)}
            />
          </Card>

          <QuickActions
            actions={[
              { label: 'Generate Merit', icon: Award, to: ROUTES.EA_MERIT_GENERATE, permission: 'merit.generate', tone: 'green' },
              { label: 'View Merit List', icon: Eye, to: ROUTES.EA_MERIT, permission: 'merit.view', tone: 'blue' },
              { label: 'Download Merit List', icon: Download, to: ROUTES.EA_MERIT, permission: 'merit.view', tone: 'purple' },
              { label: 'Publish Result', icon: Megaphone, to: ROUTES.EA_SELECTION, permission: 'selection.publish', tone: 'amber' },
              { label: 'Merit Reports', icon: FileText, to: ROUTES.EA_REPORTS, permission: 'report.view', tone: 'navy' },
              { label: 'Merit History', icon: History, to: ROUTES.EA_MERIT, permission: 'merit.view', tone: 'red' },
            ]}
          />
        </div>
      </div>

      <DigitalSignModal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        signerName={staff?.name ?? 'Officer'}
        artefact={`Merit List — ${exam.name} (version ${meritList.version + 1})`}
        checkpoint="Checkpoint 8 of 9 — Merit List approval (Ref. 58)"
        onSigned={() => {
          setApproved(true)
          setStep(4)
        }}
      />
    </div>
  )
}
