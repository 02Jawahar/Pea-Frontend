import { BadgeCheck, ChevronLeft, ChevronRight, Info, Layers } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { DigitalSignModal } from '@/components/common/DigitalSignModal'
import { StepperWizard } from '@/components/common/StepperWizard'
import { Banner, Button, Card, Field, Input, ProgressBar, Select } from '@/components/common/primitives'
import { EmptyState } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { seed } from '@/mock/api'
import { cn } from '@/utils/cn'

/**
 * Ref. 27, 28, 30 — the application wizard.
 *
 * Auto-filled from the profile, editable per post without changing the profile,
 * saveable and resumable, and applyable to several eligible posts at once. A
 * digital signature is mandatory before Submit enables (Ref. 30).
 */

const STEPS = [
  { id: 'basic', label: 'Basic Details' },
  { id: 'contact', label: 'Contact Details' },
  { id: 'identity', label: 'Identity Details' },
  { id: 'address', label: 'Address Details' },
  { id: 'documents', label: 'Upload Documents' },
  { id: 'review', label: 'Review & Submit' },
]

const CHECKLIST = [
  'Personal Details',
  'Contact Details',
  'Identity Details',
  'Address Details',
  'Upload Documents',
  'Application Review',
]

export default function ApplyWizard() {
  const { postId = '' } = useParams()
  const { candidate } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(5)
  const [declaration, setDeclaration] = useState(false)
  const [signed, setSigned] = useState(false)
  const [signOpen, setSignOpen] = useState(false)
  const [alsoApply, setAlsoApply] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [applicationNo, setApplicationNo] = useState<string | null>(null)

  const post = seed.posts.find((item) => item.id === postId)
  const department = seed.departments.find((item) => item.id === post?.departmentId)

  if (!post || !candidate) {
    return (
      <Card>
        <EmptyState
          title="Post not found"
          description="This post is no longer open for application."
          action={
            <Link to={ROUTES.CANDIDATE_EXAMINATIONS}>
              <Button variant="secondary">Browse open examinations</Button>
            </Link>
          }
        />
      </Card>
    )
  }

  const otherPosts = seed.posts.filter((item) => item.id !== post.id).slice(0, 3)

  function submit() {
    if (!declaration) {
      setError('Tick the declaration before submitting.')
      return
    }
    if (!signed) {
      setError('A digital signature is mandatory before you can submit (Ref. 30).')
      return
    }
    setError(null)
    setApplicationNo('APP20240012468')
  }

  if (applicationNo) {
    return (
      <div className="page mx-auto w-full max-w-2xl">
        <Card>
          <div className="space-y-4 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-050">
              <BadgeCheck className="size-8 text-green-600" strokeWidth={1.5} />
            </span>
            <h1 className="text-[20px] font-semibold text-navy-900">Application submitted</h1>
            <p className="text-[13px] text-grey-600">
              {post.name} · {department?.name}
            </p>

            <div className="rounded-md bg-grey-050 px-4 py-4">
              <p className="text-[12px] text-grey-600">Application Number</p>
              <p className="mt-1 font-mono text-[24px] font-semibold tracking-wide text-navy-900">
                {applicationNo}
              </p>
              <p className="mt-2 text-[12px] text-grey-600">
                {department?.code} · {post.code.split('/').pop()} · 20240520 · test type 1 · series A
                · sequence 0468
              </p>
            </div>

            {alsoApply.length > 0 && (
              <Banner tone="info" icon={<Layers className="size-4" />} title="Applied to additional posts">
                {alsoApply.length} further application{alsoApply.length === 1 ? '' : 's'} were
                generated from this form. Each has its own Application Number and shares your
                Registration Number {candidate.registrationNo}.
              </Banner>
            )}

            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => navigate(ROUTES.CANDIDATE_APPLICATIONS)}>
                View my applications
              </Button>
              <Link to={ROUTES.CANDIDATE_EXAMINATIONS}>
                <Button variant="secondary">Apply to another post</Button>
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
        <h1 className="page-title">Apply — {post.name}</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          {department?.name} · {post.availableStrength} posts · last date 15-Jun-2024
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

              <div className="flex gap-2">
                <Button variant="ghost">Save &amp; resume later</Button>
                {step < STEPS.length - 1 ? (
                  <Button onClick={() => setStep((value) => value + 1)}>
                    Save &amp; Next
                    <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button variant="success" onClick={submit}>
                    Submit Application
                  </Button>
                )}
              </div>
            </div>
          }
        >
          {error && (
            <Banner tone="danger" className="mb-4">
              {error}
            </Banner>
          )}

          {step < 5 ? (
            <div className="space-y-4">
              <Banner tone="info" icon={<Info className="size-4" />} title="Pre-filled from your profile">
                Any value can be edited for this post without changing your profile. Saves overwrite
                — no version history is kept for an unsubmitted application.
              </Banner>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {step === 0 &&
                  [
                    ['Full Name', candidate.name],
                    ['Date of Birth', candidate.dob],
                    ['Gender', candidate.gender],
                    ["Father's Name", candidate.fatherName],
                    ["Mother's Name", candidate.motherName],
                    ['Category', candidate.category],
                  ].map(([label, value]) => (
                    <Field key={label} label={label}>
                      <Input defaultValue={value} />
                    </Field>
                  ))}

                {step === 1 &&
                  [
                    ['Mobile Number', candidate.mobile],
                    ['Email ID', candidate.email],
                    ['Alternate Mobile', ''],
                  ].map(([label, value]) => (
                    <Field key={label} label={label}>
                      <Input defaultValue={value} />
                    </Field>
                  ))}

                {step === 2 &&
                  [
                    ['Aadhaar', candidate.aadhaarVerified ? 'Verified via UIDAI' : 'Aadhaar Pending'],
                    ['Identification Type', 'Aadhaar'],
                    ['Identification Number', 'XXXX XXXX 4821'],
                  ].map(([label, value]) => (
                    <Field key={label} label={label}>
                      <Input defaultValue={value} readOnly className="bg-grey-100" />
                    </Field>
                  ))}

                {step === 3 &&
                  [
                    ['District', candidate.district],
                    ['State', candidate.state],
                    ['PIN Code', '605110'],
                  ].map(([label, value]) => (
                    <Field key={label} label={label}>
                      <Input defaultValue={value} />
                    </Field>
                  ))}
              </div>

              {step === 4 && (
                <ul className="space-y-2">
                  {['Passport photograph', 'Signature', 'Identity proof', 'Qualification certificate'].map(
                    (document) => (
                      <li
                        key={document}
                        className="flex flex-wrap items-center gap-3 rounded-md border border-green-100 bg-green-050 px-3 py-2.5"
                      >
                        <BadgeCheck className="size-4 shrink-0 text-green-600" />
                        <span className="min-w-0 flex-1 text-[13px] font-medium text-navy-900">
                          {document}
                        </span>
                        <span className="text-[12px] text-grey-600">Linked from your profile</span>
                        <Button variant="secondary" size="sm">
                          Replace for this application
                        </Button>
                      </li>
                    ),
                  )}
                </ul>
              )}

              {/* Post-specific extras appear conditionally. */}
              <div className="rounded-md border border-grey-200 p-3">
                <p className="mb-3 text-[13px] font-semibold text-navy-900">
                  Post-specific selections
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Question paper language" required>
                    <Select defaultValue="Tamil">
                      {['English', 'Tamil', 'Malayalam', 'Telugu'].map((language) => (
                        <option key={language}>{language}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Exam centre preference" required>
                    <Select defaultValue="Puducherry — Center 01">
                      {seed.centres.slice(0, 5).map((centre) => (
                        <option key={centre.id}>{centre.name.split(' — ')[0]} — {centre.centreCode}</option>
                      ))}
                    </Select>
                  </Field>
                  {candidate.isPwBD && (
                    <Field label="Scribe required?" hint="Offered automatically for your category.">
                      <Select defaultValue={candidate.scribeRequired ? 'Yes' : 'No'}>
                        <option>Yes</option>
                        <option>No</option>
                      </Select>
                    </Field>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                [
                  'Personal Information',
                  [
                    ['Full Name', candidate.name],
                    ['Date of Birth', candidate.dob],
                    ['Gender', candidate.gender],
                    ["Father's Name", candidate.fatherName],
                    ["Mother's Name", candidate.motherName],
                    ['Category', candidate.category],
                    ['PwBD Candidate', candidate.isPwBD ? `Yes — ${candidate.disabilityCategory}` : 'No'],
                  ],
                ],
                [
                  'Contact Information',
                  [
                    ['Mobile Number', candidate.mobile],
                    ['Email ID', candidate.email],
                  ],
                ],
                [
                  'Address Information',
                  [
                    ['Correspondence', `${candidate.district}, ${candidate.state} - 605110`],
                    ['Permanent', 'Same as correspondence'],
                  ],
                ],
                [
                  'Exam / Post Details',
                  [
                    ['Examination', 'Assistant Grade-II Examination 2024'],
                    ['Post Applied For', post.name],
                    ['Department', department?.name ?? ''],
                    ['Question paper language', 'Tamil'],
                  ],
                ],
                [
                  'Fee Details',
                  [
                    ['Application Fee', '₹ 750.00'],
                    ['Payment Mode', 'Net Banking'],
                    ['Transaction ID', 'TXN1234567890'],
                    ['Payment Date', '20-May-2024 11:25 AM'],
                  ],
                ],
              ].map(([title, rows]) => (
                <section key={String(title)} className="rounded-md border border-grey-200">
                  <header className="border-b border-grey-200 px-3 py-2">
                    <h3 className="text-[13px] font-semibold text-navy-700">{String(title)}</h3>
                  </header>
                  <dl className="grid gap-x-6 gap-y-2 px-3 py-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(rows as string[][]).map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <dt className="text-[12px] text-grey-600">{label}</dt>
                        <dd className="clamp-1 text-[13px] text-navy-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}

              {/* Ref. 27 — one form, many posts. */}
              <div className="rounded-md border border-grey-200 p-3">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-navy-900">
                  <Layers className="size-4 text-navy-700" />
                  Apply this application to other posts
                </p>
                <p className="mt-1 text-[12px] text-grey-600">
                  Each generates its own Application Number and shares your Registration Number.
                </p>
                <ul className="mt-3 space-y-2">
                  {otherPosts.map((other) => (
                    <li key={other.id}>
                      <label className="flex items-center gap-2.5 rounded-md border border-grey-200 px-3 py-2 text-[13px]">
                        <input
                          type="checkbox"
                          checked={alsoApply.includes(other.id)}
                          onChange={() =>
                            setAlsoApply((previous) =>
                              previous.includes(other.id)
                                ? previous.filter((item) => item !== other.id)
                                : [...previous, other.id],
                            )
                          }
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-navy-900">{other.name}</span>
                          <span className="block text-[12px] text-grey-600">
                            {seed.departments.find((d) => d.id === other.departmentId)?.name} ·{' '}
                            {other.availableStrength} posts
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <label className="flex items-start gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={declaration}
                  className="mt-0.5"
                  onChange={(event) => {
                    setDeclaration(event.target.checked)
                    setError(null)
                  }}
                />
                <span>
                  I hereby declare that all the statements made in this application are true,
                  complete and correct to the best of my knowledge and belief. In the event of any
                  information being found false or incorrect, my candidature is liable to be
                  rejected.
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-3 rounded-md border border-grey-200 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-navy-900">Digital signature</p>
                  <p className="text-[12px] text-grey-600">
                    Mandatory before Submit enables — Aadhaar e-Sign or DSC token.
                  </p>
                </div>
                {signed ? (
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-green-600">
                    <BadgeCheck className="size-4" />
                    Signed
                  </span>
                ) : (
                  <Button disabled={!declaration} onClick={() => setSignOpen(true)}>
                    Sign application
                  </Button>
                )}
              </div>

              <Banner tone="warning">
                Once submitted, you will not be able to edit the application.
              </Banner>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="Application Checklist" bodyClassName="p-0">
            <ul className="divide-y divide-grey-200">
              {CHECKLIST.map((item, index) => (
                <li key={item} className="flex items-center gap-2.5 px-4 py-2.5">
                  <span
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded-full',
                      index < step ? 'bg-green-600 text-white' : 'border border-grey-300',
                    )}
                  >
                    {index < step && <BadgeCheck className="size-3" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] text-navy-900">{item}</span>
                  <span
                    className={cn(
                      'text-[12px]',
                      index < step ? 'text-green-600' : 'text-grey-600',
                    )}
                  >
                    {index < step ? 'Completed' : 'Pending'}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Payment Status">
            <Banner tone="success" icon={<BadgeCheck className="size-4" />} title="Payment Successful">
              Your application fee has been paid successfully.
            </Banner>
            <dl className="mt-3 space-y-2">
              {[
                ['Amount Paid', '₹ 750.00'],
                ['Transaction ID', 'TXN1234567890'],
                ['Payment Date', '20-May-2024 11:25 AM'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-[12px] text-grey-600">{label}</dt>
                  <dd className="text-right text-[13px] font-medium text-navy-900">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title="Progress">
            <ProgressBar value={((step + 1) / STEPS.length) * 100} showLabel tone="green" />
            <p className="mt-2 text-[12px] text-grey-600">
              Step {step + 1} of {STEPS.length}. You can save and resume as many times as you like
              until you submit.
            </p>
          </Card>
        </div>
      </div>

      <DigitalSignModal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        onSigned={() => setSigned(true)}
        signerName={candidate.name}
        artefact={`Application for ${post.name}`}
        checkpoint="Checkpoint 5 of 9 — Candidate application submission (Ref. 30)"
      />
    </div>
  )
}
