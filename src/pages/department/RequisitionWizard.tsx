import { BadgeCheck, Building2, ChevronLeft, ChevronRight, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { DigitalSignModal } from '@/components/common/DigitalSignModal'
import { StepperWizard } from '@/components/common/StepperWizard'
import { Banner, Button, Card, Field, Input, ProgressBar, Select } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { seed } from '@/mock/api'
import { cn } from '@/utils/cn'

/** Ref. 10–17 — the requisition wizard. */

const STEPS = [
  { id: 'posts', label: 'Select Posts' },
  { id: 'period', label: 'Recruitment Period' },
  { id: 'nodal', label: 'Nodal Officer' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'finance', label: 'Finance Concurrence' },
  { id: 'sign', label: 'Sign & Submit' },
]

const CHECKLIST_ITEMS = [
  'Recruitment Rules extract for the post',
  'Vacancy position certified by the Head of Office',
  'Reservation matrix approved by the department',
  'Roster register verified for the recruitment year',
  'No pending court case affecting these posts',
  'Budget provision confirmed for the current financial year',
]

export default function RequisitionWizard() {
  const { staff, can } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [selectedPosts, setSelectedPosts] = useState<Record<string, number>>({})
  const [nodalOfficer, setNodalOfficer] = useState('')
  const [nodalMobile, setNodalMobile] = useState('')
  const [checked, setChecked] = useState<string[]>(CHECKLIST_ITEMS.slice(0, 4))
  const [financeRoute, setFinanceRoute] = useState<'route' | 'upload'>('route')
  const [errors, setErrors] = useState<string[]>([])
  const [signOpen, setSignOpen] = useState(false)
  const [requisitionNo, setRequisitionNo] = useState<string | null>(null)

  const departmentPosts = seed.posts.filter(
    (post) => !staff?.departmentId || post.departmentId === staff.departmentId,
  )
  const totalPosts = Object.values(selectedPosts).reduce((sum, count) => sum + count, 0)
  const outstanding = CHECKLIST_ITEMS.filter((item) => !checked.includes(item))

  function validate(): boolean {
    const next: string[] = []
    if (step === 0 && totalPosts === 0) next.push('Select at least one post and enter the number of vacancies.')
    if (step === 2 && !nodalOfficer) next.push('A Nodal Officer is required (Ref. 16).')
    if (step === 2 && !nodalMobile.trim()) next.push("Enter the Nodal Officer's mobile number.")
    if (step === 3 && outstanding.length > 0)
      next.push(`Every mandatory checklist item must be ticked. Outstanding: ${outstanding.length}.`)
    setErrors(next)
    return next.length === 0
  }

  if (requisitionNo) {
    return (
      <div className="page mx-auto w-full max-w-2xl">
        <Card>
          <div className="space-y-4 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-050">
              <BadgeCheck className="size-8 text-green-600" strokeWidth={1.5} />
            </span>
            <h1 className="text-[20px] font-semibold text-navy-900">Requisition submitted</h1>
            <div className="rounded-md bg-grey-050 px-4 py-4">
              <p className="text-[12px] text-grey-600">Requisition Number</p>
              <p className="mt-1 font-mono text-[22px] font-semibold text-navy-900">
                {requisitionNo}
              </p>
            </div>
            <Banner tone="info">
              The requisition is now with the next office in your department's hierarchy. Data is
              stored encrypted and digitally signed to guarantee its integrity (Ref. 10).
            </Banner>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => navigate(ROUTES.DEPT_REQUISITIONS)}>View my requisitions</Button>
              <Link to={ROUTES.DEPT_DASHBOARD}>
                <Button variant="secondary">Back to dashboard</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="page mx-auto w-full max-w-6xl">
      <div>
        <h1 className="page-title">Create Requisition</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          {seed.departments.find((d) => d.id === staff?.departmentId)?.name ?? 'Your department'} ·
          six steps, ending in a digital signature
        </p>
      </div>

      <StepperWizard steps={STEPS} current={step} onStepClick={setStep} />

      <div className="grid flex-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <Card
          title={`${step + 1}. ${STEPS[step].label}`}
          className="flex-1"
          footer={
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                disabled={step === 0}
                onClick={() => setStep((value) => Math.max(0, value - 1))}
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>

              {step < STEPS.length - 1 ? (
                <Button
                  onClick={() => {
                    if (validate()) setStep((value) => value + 1)
                  }}
                >
                  Save &amp; Next
                  <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button
                  variant="success"
                  disabled={!can('requisition.create')}
                  onClick={() => setSignOpen(true)}
                >
                  Sign &amp; Submit
                </Button>
              )}
            </div>
          }
        >
          {errors.length > 0 && (
            <Banner tone="danger" className="mb-4" title="Fix the following before continuing">
              <ul className="mt-1 list-inside list-disc">
                {errors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </Banner>
          )}

          {step === 0 && (
            <div className="space-y-3">
              <p className="text-[13px] text-grey-600">
                Pick posts from your department's post master and enter the number of vacancies
                available for recruitment against each (Ref. 10).
              </p>
              <ul className="divide-y divide-grey-200 rounded-md border border-grey-200">
                {departmentPosts.map((post) => (
                  <li key={post.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={post.id in selectedPosts}
                      onChange={(event) =>
                        setSelectedPosts((previous) => {
                          const next = { ...previous }
                          if (event.target.checked) next[post.id] = post.availableStrength
                          else delete next[post.id]
                          return next
                        })
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <p className="clamp-1 text-[13px] font-medium text-navy-900">{post.name}</p>
                      <p className="text-[12px] text-grey-600">
                        {post.code} · {post.classification} · {post.payLevel} · available{' '}
                        {post.availableStrength}
                      </p>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={post.availableStrength}
                      value={selectedPosts[post.id] ?? ''}
                      disabled={!(post.id in selectedPosts)}
                      onChange={(event) =>
                        setSelectedPosts((previous) => ({
                          ...previous,
                          [post.id]: Number(event.target.value),
                        }))
                      }
                      className="w-24 text-center"
                      aria-label={`Vacancies for ${post.name}`}
                    />
                  </li>
                ))}
              </ul>
              <p className="text-[13px] font-medium text-navy-900">
                Total vacancies requested: {totalPosts}
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-[13px] text-grey-600">
                Set the recruitment window per post (Ref. 11). After submission you can extend the
                last date, stop the recruitment temporarily, or reconfigure and resume — each with a
                recorded reason.
              </p>
              <ul className="space-y-2">
                {Object.keys(selectedPosts).map((postId) => {
                  const post = seed.posts.find((item) => item.id === postId)!
                  return (
                    <li key={postId} className="rounded-md border border-grey-200 p-3">
                      <p className="text-[13px] font-medium text-navy-900">{post.name}</p>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        <Field label="Start date" required>
                          <Input type="date" defaultValue="2024-06-01" />
                        </Field>
                        <Field label="End date" required>
                          <Input type="date" defaultValue="2024-07-01" />
                        </Field>
                      </div>
                    </li>
                  )
                })}
                {Object.keys(selectedPosts).length === 0 && (
                  <li className="rounded-md border border-dashed border-grey-300 px-4 py-6 text-center text-[13px] text-grey-600">
                    Select at least one post in step 1.
                  </li>
                )}
              </ul>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nodal Officer" required hint="The authorised official for this requisition (Ref. 16).">
                <Select
                  value={nodalOfficer}
                  onChange={(event) => {
                    setNodalOfficer(event.target.value)
                    const match = seed.staffUsers.find((user) => user.name === event.target.value)
                    if (match) setNodalMobile(match.mobile)
                    setErrors([])
                  }}
                >
                  <option value="">-- Select --</option>
                  {seed.staffUsers
                    .filter((user) => user.isActive)
                    .map((user) => (
                      <option key={user.id}>{user.name}</option>
                    ))}
                </Select>
              </Field>
              <Field label="Mobile number" required>
                <Input
                  value={nodalMobile}
                  onChange={(event) => {
                    setNodalMobile(event.target.value)
                    setErrors([])
                  }}
                  maxLength={10}
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-[13px] text-grey-600">
                Compliance checklist with a document against each item wherever applicable (Ref. 17).
                The requisition cannot be submitted with a mandatory item unticked.
              </p>
              <ul className="divide-y divide-grey-200 rounded-md border border-grey-200">
                {CHECKLIST_ITEMS.map((item) => {
                  const done = checked.includes(item)
                  return (
                    <li key={item} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => {
                          setChecked((previous) =>
                            previous.includes(item)
                              ? previous.filter((value) => value !== item)
                              : [...previous, item],
                          )
                          setErrors([])
                        }}
                      />
                      <span className="min-w-0 flex-1 text-[13px] text-navy-900">{item}</span>
                      {done ? (
                        <span className="text-[12px] text-green-600">Document attached</span>
                      ) : (
                        <Button variant="ghost" size="sm">
                          <Upload className="size-3.5" />
                          Attach
                        </Button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-[13px] text-grey-600">
                Where filling the post by direct recruitment needs Finance Department concurrence,
                either route an inter-department workflow task or upload the approval you already
                hold (Ref. 15). Both paths end in the same requisition state.
              </p>

              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ['route', 'Route to Finance Department', 'Sends an inter-department task to the Finance concurrence inbox.'],
                    ['upload', 'Upload existing approval', 'Attach a file approval from Finance or another government authority.'],
                  ] as const
                ).map(([value, label, detail]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFinanceRoute(value)}
                    aria-pressed={financeRoute === value}
                    className={cn(
                      'rounded-md border p-3 text-left transition-colors',
                      financeRoute === value
                        ? 'border-navy-700 bg-blue-050'
                        : 'border-grey-200 hover:bg-grey-050',
                    )}
                  >
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-navy-900">
                      <Building2 className="size-4" />
                      {label}
                    </span>
                    <span className="mt-1 block text-[12px] text-grey-600">{detail}</span>
                  </button>
                ))}
              </div>

              {financeRoute === 'upload' && (
                <Field label="Approval document" required hint="PDF, max 2 MB.">
                  <Input type="file" accept=".pdf" className="py-1.5" />
                </Field>
              )}

              <Banner tone="info">
                Estimated financial implication:{' '}
                <strong>₹ {(totalPosts * 4_80_000).toLocaleString('en-IN')} per year</strong> across{' '}
                {totalPosts} posts.
              </Banner>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <p className="text-[13px] text-grey-600">
                Review before signing. Once signed, the requisition is stored encrypted and moves to
                the next office in your hierarchy.
              </p>

              <dl className="divide-y divide-grey-200 rounded-md border border-grey-200">
                {[
                  ['Department', seed.departments.find((d) => d.id === staff?.departmentId)?.name ?? '—'],
                  ['Posts', String(Object.keys(selectedPosts).length)],
                  ['Total vacancies', String(totalPosts)],
                  ['Nodal Officer', nodalOfficer || '—'],
                  ['Nodal mobile', nodalMobile || '—'],
                  ['Checklist', `${checked.length} of ${CHECKLIST_ITEMS.length} complete`],
                  [
                    'Finance concurrence',
                    financeRoute === 'route' ? 'Route to Finance Department' : 'Upload existing approval',
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 px-3 py-2.5">
                    <dt className="text-[13px] text-grey-600">{label}</dt>
                    <dd className="text-right text-[13px] font-medium text-navy-900">{value}</dd>
                  </div>
                ))}
              </dl>

              <Banner tone="warning">
                A digital signature is mandatory — DSC e-Token or Aadhaar e-Sign (Ref. 10).
              </Banner>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="Progress">
            <ProgressBar value={((step + 1) / STEPS.length) * 100} showLabel tone="navy" />
            <p className="mt-2 text-[12px] text-grey-600">
              Step {step + 1} of {STEPS.length}
            </p>
          </Card>

          <Card title="Summary">
            <dl className="space-y-2">
              {[
                ['Posts selected', String(Object.keys(selectedPosts).length)],
                ['Total vacancies', String(totalPosts)],
                ['Checklist', `${checked.length} / ${CHECKLIST_ITEMS.length}`],
                ['Nodal Officer', nodalOfficer || 'Not set'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-[12px] text-grey-600">{label}</dt>
                  <dd className="clamp-1 text-right text-[13px] font-medium text-navy-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title="What happens next">
            <ol className="space-y-2">
              {[
                'Your Head of Office verifies and approves, digitally signing at their level.',
                financeRoute === 'route'
                  ? 'The Finance Department records its concurrence in their inbox.'
                  : 'Your uploaded approval evidences Finance concurrence.',
                'PEA reviews against the four-point compliance check.',
                'An approved requisition feeds the draft notification.',
              ].map((text, index) => (
                <li key={text} className="flex gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-050 text-[11px] font-semibold text-navy-700">
                    {index + 1}
                  </span>
                  <span className="text-[12px] text-grey-700">{text}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      <DigitalSignModal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        onSigned={() => setRequisitionNo('REQ/REV/2024/0012')}
        signerName={staff?.name ?? 'Officer'}
        artefact={`Requisition — ${totalPosts} vacancies across ${Object.keys(selectedPosts).length} post(s)`}
        checkpoint="Checkpoint 1 of 9 — Department requisition submission (Ref. 10)"
      />
    </div>
  )
}
