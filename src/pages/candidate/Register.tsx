import { BadgeCheck, ChevronLeft, ChevronRight, Download, Info, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { DocumentUpload, type UploadedDoc } from '@/components/common/DocumentUpload'
import { OtpModal } from '@/components/common/OtpModal'
import { StepperWizard } from '@/components/common/StepperWizard'
import { Banner, Button, Card, Field, Input, ProgressBar, Select } from '@/components/common/primitives'
import { PartialState } from '@/components/common/states'
import { NeedHelpCard } from '@/components/layout/NeedHelpCard'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

/**
 * Six-step enrolment wizard (Ref. 24) — demo slide 4 is the reference.
 * Enrolment is independent of applying: a person can enrol with no live
 * notification, and the landing copy says so.
 */

const STEPS = [
  { id: 'basic', label: 'Basic Details' },
  { id: 'contact', label: 'Contact Details' },
  { id: 'identity', label: 'Identity Details' },
  { id: 'address', label: 'Address Details' },
  { id: 'documents', label: 'Upload Documents' },
  { id: 'preview', label: 'Preview & Submit' },
]

const DOCUMENT_SPECS = [
  { id: 'photo', label: 'Passport size photograph', formats: ['JPG', 'PNG'], maxKb: 200, required: true },
  { id: 'signature', label: 'Signature', formats: ['JPG', 'PNG'], maxKb: 100, required: true },
  { id: 'identity', label: 'Identity Proof', formats: ['PDF', 'JPG'], maxKb: 500, required: true, digilocker: true },
  { id: 'aadhaar', label: 'Aadhaar Card', formats: ['PDF', 'JPG'], maxKb: 500, required: true, digilocker: true },
]

const DISABILITY_CATEGORIES = [
  'Blind',
  'Low Vision',
  'Hard of Hearing',
  'Locomotor',
  'Autism',
  'Specific Learning Disability',
  'Mental Illness',
  'Multiple Disabilities',
]

/** Ref. 9 — a scribe is offered automatically only for these categories. */
const SCRIBE_ELIGIBLE = ['Blind', 'Low Vision', 'Both Arms', 'Cerebral Palsy']

interface FormState {
  fullName: string
  dob: string
  gender: string
  fatherName: string
  motherName: string
  maritalStatus: string
  nationality: string
  category: string
  isPwBD: 'Yes' | 'No' | ''
  disabilityCategory: string
  udid: string
  udidValidity: string
  aadhaar: string
  pan: string
  voterId: string
  identificationType: string
  identificationNumber: string
  placeOfBirth: string
  mobile: string
  email: string
  altMobile: string
  altEmail: string
  addressLine1: string
  addressLine2: string
  district: string
  state: string
  pin: string
  sameAsCorrespondence: boolean
}

const EMPTY: FormState = {
  fullName: '',
  dob: '',
  gender: '',
  fatherName: '',
  motherName: '',
  maritalStatus: '',
  nationality: 'Indian',
  category: '',
  isPwBD: '',
  disabilityCategory: '',
  udid: '',
  udidValidity: '',
  aadhaar: '',
  pan: '',
  voterId: '',
  identificationType: '',
  identificationNumber: '',
  placeOfBirth: '',
  mobile: '',
  email: '',
  altMobile: '',
  altEmail: '',
  addressLine1: '',
  addressLine2: '',
  district: '',
  state: 'Puducherry',
  pin: '',
  sameAsCorrespondence: true,
}

export default function Register() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [docs, setDocs] = useState<Record<string, UploadedDoc | undefined>>({})
  const [aadhaarVerified, setAadhaarVerified] = useState(false)
  const [uidaiDown, setUidaiDown] = useState(false)
  const [mobileVerified, setMobileVerified] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [declaration, setDeclaration] = useState(false)
  const [otpFor, setOtpFor] = useState<'aadhaar' | 'mobile' | 'email' | null>(null)
  const [registrationNo, setRegistrationNo] = useState<string | null>(null)
  const { loginAsCandidate } = useAuth()
  const navigate = useNavigate()

  const set = (patch: Partial<FormState>) => {
    setForm((previous) => ({ ...previous, ...patch }))
    setErrors({})
  }

  function validate(): boolean {
    const next: Record<string, string> = {}

    if (step === 0) {
      if (!form.fullName.trim()) next.fullName = 'Enter your name as it appears on the 10th certificate.'
      if (!form.dob) next.dob = 'Date of birth is required.'
      if (!form.gender) next.gender = 'Select a gender.'
      if (!form.fatherName.trim()) next.fatherName = "Father's name is required."
      if (!form.motherName.trim()) next.motherName = "Mother's name is required."
      if (!form.category) next.category = 'Select your community / category.'
      if (!form.isPwBD) next.isPwBD = 'Answer whether you are a PwBD candidate.'
      if (form.isPwBD === 'Yes' && !form.disabilityCategory)
        next.disabilityCategory = 'Select your disability category.'
      if (form.isPwBD === 'Yes' && !form.udid) next.udid = 'UDID number is required.'
      if (!form.identificationType) next.identificationType = 'Select an identification type.'
      if (!form.identificationNumber.trim())
        next.identificationNumber = 'Enter the identification number.'
      if (!form.placeOfBirth.trim()) next.placeOfBirth = 'Place of birth is required.'
    }

    if (step === 1) {
      if (!form.mobile.trim()) next.mobile = 'Mobile number is required.'
      else if (!mobileVerified) next.mobile = 'Verify your mobile number with the OTP.'
      if (!form.email.trim()) next.email = 'Email is required.'
      else if (!emailVerified) next.email = 'Verify your email with the OTP (Ref. 24).'
    }

    if (step === 3) {
      if (!form.addressLine1.trim()) next.addressLine1 = 'Address line 1 is required.'
      if (!form.district) next.district = 'Select a district.'
      if (!form.pin.trim()) next.pin = 'PIN code is required.'
    }

    if (step === 4) {
      for (const spec of DOCUMENT_SPECS) {
        if (spec.required && !docs[spec.id]) next[spec.id] = `${spec.label} is required.`
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  function next() {
    if (!validate()) return
    setStep((value) => Math.min(STEPS.length - 1, value + 1))
  }

  function submit() {
    if (!declaration) {
      setErrors({ declaration: 'You must accept the declaration before submitting.' })
      return
    }
    setRegistrationNo('REG2024123468')
  }

  if (registrationNo) {
    return <RegistrationReceipt registrationNo={registrationNo} name={form.fullName} onContinue={() => {
      loginAsCandidate('')
      navigate(ROUTES.CANDIDATE_DASHBOARD)
    }} />
  }

  return (
    <div className="page mx-auto w-full max-w-6xl">
      <div>
        <h1 className="page-title">Candidate Registration</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Create your account to apply for Government Examinations. You can enrol now even if no
          notification is open — this account is reusable for every future post.
        </p>
      </div>

      <StepperWizard steps={STEPS} current={step} onStepClick={setStep} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card
          title={`${step + 1}. ${STEPS[step].label}`}
          bodyClassName="p-4 sm:p-5"
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
                <Button onClick={next}>
                  Save &amp; Next
                  <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button variant="success" onClick={submit}>
                  Submit Registration
                </Button>
              )}
            </div>
          }
        >
          {Object.keys(errors).length > 0 && (
            <Banner tone="danger" className="mb-4" title="Fix the following before continuing">
              <ul className="mt-1 list-inside list-disc">
                {Object.values(errors).map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </Banner>
          )}

          {step === 0 && (
            <div className="space-y-4">
              {uidaiDown && (
                <PartialState
                  source="UIDAI"
                  fallbackLabel="Continue with manual entry"
                  onFallback={() => setUidaiDown(false)}
                />
              )}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Full Name (As per 10th Certificate)" required error={errors.fullName}>
                  <Input
                    value={form.fullName}
                    onChange={(event) => set({ fullName: event.target.value })}
                    placeholder="Enter full name"
                    readOnly={aadhaarVerified}
                    className={cn(aadhaarVerified && 'bg-green-050')}
                  />
                  {aadhaarVerified && <VerifiedBadge />}
                </Field>

                <Field label="Date of Birth" required error={errors.dob}>
                  <Input
                    type="date"
                    value={form.dob}
                    onChange={(event) => set({ dob: event.target.value })}
                    readOnly={aadhaarVerified}
                  />
                  {aadhaarVerified && <VerifiedBadge />}
                </Field>

                <Field label="Gender" required error={errors.gender}>
                  <div className="flex gap-4 pt-2">
                    {['Male', 'Female', 'Others'].map((option) => (
                      <label key={option} className="flex items-center gap-1.5 text-[13px]">
                        <input
                          type="radio"
                          name="gender"
                          checked={form.gender === option}
                          onChange={() => set({ gender: option })}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Father's Name" required error={errors.fatherName}>
                  <Input
                    value={form.fatherName}
                    onChange={(event) => set({ fatherName: event.target.value })}
                    placeholder="Enter father's name"
                  />
                </Field>

                <Field label="Mother's Name" required error={errors.motherName}>
                  <Input
                    value={form.motherName}
                    onChange={(event) => set({ motherName: event.target.value })}
                    placeholder="Enter mother's name"
                  />
                </Field>

                <Field label="Marital Status">
                  <Select
                    value={form.maritalStatus}
                    onChange={(event) => set({ maritalStatus: event.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {['Single', 'Married', 'Widowed', 'Divorced'].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Nationality" required>
                  <Select
                    value={form.nationality}
                    onChange={(event) => set({ nationality: event.target.value })}
                  >
                    <option>Indian</option>
                    <option>Other</option>
                  </Select>
                </Field>

                <Field label="Community / Category" required error={errors.category}>
                  <Select
                    value={form.category}
                    onChange={(event) => set({ category: event.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {['General', 'OBC', 'MBC', 'EBC', 'EWS', 'SC', 'ST', 'BT', 'BCM'].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Are you a PwBD Candidate?" required error={errors.isPwBD}>
                  <div className="flex gap-4 pt-2">
                    {(['Yes', 'No'] as const).map((option) => (
                      <label key={option} className="flex items-center gap-1.5 text-[13px]">
                        <input
                          type="radio"
                          name="pwbd"
                          checked={form.isPwBD === option}
                          onChange={() => set({ isPwBD: option })}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </Field>
              </div>

              {/* Ref. 9 — PwBD reveals UDID, category, and derives the scribe offer. */}
              {form.isPwBD === 'Yes' && (
                <div className="rounded-md border border-blue-100 bg-blue-050 p-3">
                  <p className="mb-3 text-[13px] font-semibold text-navy-700">
                    Disability details (Ref. 9)
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Disability Category" required error={errors.disabilityCategory}>
                      <Select
                        value={form.disabilityCategory}
                        onChange={(event) => set({ disabilityCategory: event.target.value })}
                      >
                        <option value="">-- Select --</option>
                        {DISABILITY_CATEGORIES.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="UDID Number" required error={errors.udid}>
                      <Input
                        value={form.udid}
                        onChange={(event) => set({ udid: event.target.value })}
                        placeholder="Enter UDID number"
                      />
                    </Field>
                    <Field label="UDID Validity Date" required>
                      <Input
                        type="date"
                        value={form.udidValidity}
                        onChange={(event) => set({ udidValidity: event.target.value })}
                      />
                    </Field>
                  </div>

                  {form.disabilityCategory && (
                    <Banner
                      tone={SCRIBE_ELIGIBLE.includes(form.disabilityCategory) ? 'success' : 'neutral'}
                      className="mt-3"
                    >
                      {SCRIBE_ELIGIBLE.includes(form.disabilityCategory)
                        ? 'Your category entitles you to a scribe and to compensatory time. Both are granted by the system automatically — you will be asked to confirm the scribe option when you apply.'
                        : 'Compensatory time is granted automatically for this category. A scribe is offered only for Blind, Low Vision, Both Arms and Cerebral Palsy.'}
                    </Banner>
                  )}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field
                  label="Aadhaar Number"
                  hint="Verifying with Aadhaar pre-fills and locks Name, Gender, Email and DOB."
                >
                  <div className="flex gap-2">
                    <Input
                      value={form.aadhaar}
                      onChange={(event) => set({ aadhaar: event.target.value })}
                      placeholder="Enter 12 digit Aadhaar number"
                      maxLength={12}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={form.aadhaar.length !== 12 || aadhaarVerified}
                      onClick={() => setOtpFor('aadhaar')}
                    >
                      {aadhaarVerified ? 'Verified' : 'Verify'}
                    </Button>
                  </div>
                </Field>

                <Field label="PAN Number">
                  <Input
                    value={form.pan}
                    onChange={(event) => set({ pan: event.target.value.toUpperCase() })}
                    placeholder="Enter PAN number"
                    maxLength={10}
                  />
                </Field>

                <Field label="Voter ID Number">
                  <Input
                    value={form.voterId}
                    onChange={(event) => set({ voterId: event.target.value })}
                    placeholder="Enter Voter ID number"
                  />
                </Field>

                <Field label="Identification Type" required error={errors.identificationType}>
                  <Select
                    value={form.identificationType}
                    onChange={(event) => set({ identificationType: event.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {['Aadhaar', 'PAN', 'Voter ID', 'Driving Licence', 'Passport'].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Identification Number"
                  required
                  error={errors.identificationNumber}
                >
                  <Input
                    value={form.identificationNumber}
                    onChange={(event) => set({ identificationNumber: event.target.value })}
                    placeholder="Enter identification number"
                  />
                </Field>

                <Field label="Place of Birth" required error={errors.placeOfBirth}>
                  <Input
                    value={form.placeOfBirth}
                    onChange={(event) => set({ placeOfBirth: event.target.value })}
                    placeholder="Enter place of birth"
                  />
                </Field>
              </div>

              <Banner tone="info" icon={<ShieldAlert className="size-4" />} title="Important Note">
                Please ensure the details entered are correct. You will not be able to modify basic
                details after registration.
              </Banner>

              {!aadhaarVerified && !uidaiDown && (
                <button
                  type="button"
                  onClick={() => setUidaiDown(true)}
                  className="text-[12px] text-grey-600 underline"
                >
                  Simulate UIDAI being unavailable
                </button>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Banner tone="info" icon={<Info className="size-4" />}>
                Your Aadhaar-registered mobile becomes your login ID. Both the mobile and the email
                require their own OTP before you can continue (Ref. 24).
              </Banner>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Mobile Number (login ID)" required error={errors.mobile}>
                  <div className="flex gap-2">
                    <Input
                      value={form.mobile}
                      onChange={(event) => set({ mobile: event.target.value })}
                      placeholder="10 digit mobile number"
                      maxLength={10}
                      readOnly={mobileVerified}
                      className={cn(mobileVerified && 'bg-green-050')}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={form.mobile.length !== 10 || mobileVerified}
                      onClick={() => setOtpFor('mobile')}
                    >
                      {mobileVerified ? 'Verified' : 'Verify'}
                    </Button>
                  </div>
                  {mobileVerified && <VerifiedBadge label="Verified via OTP" />}
                </Field>

                <Field label="Email ID" required error={errors.email}>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(event) => set({ email: event.target.value })}
                      placeholder="name@example.com"
                      readOnly={emailVerified}
                      className={cn(emailVerified && 'bg-green-050')}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={!form.email.includes('@') || emailVerified}
                      onClick={() => setOtpFor('email')}
                    >
                      {emailVerified ? 'Verified' : 'Verify'}
                    </Button>
                  </div>
                  {emailVerified && <VerifiedBadge label="Verified via OTP" />}
                </Field>

                <Field label="Alternate Mobile">
                  <Input
                    value={form.altMobile}
                    onChange={(event) => set({ altMobile: event.target.value })}
                    maxLength={10}
                  />
                </Field>

                <Field label="Alternate Email">
                  <Input
                    type="email"
                    value={form.altEmail}
                    onChange={(event) => set({ altEmail: event.target.value })}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-[13px] text-grey-600">
                Confirm the identity documents declared in Step 1. Verification status is shown per
                document.
              </p>
              <ul className="divide-y divide-grey-200 rounded-md border border-grey-200">
                {[
                  ['Aadhaar', form.aadhaar, aadhaarVerified ? 'Verified via UIDAI' : 'Not verified'],
                  ['PAN', form.pan, form.pan ? 'Declared — verification at scrutiny' : 'Not provided'],
                  ['Voter ID', form.voterId, form.voterId ? 'Declared' : 'Not provided'],
                  [form.identificationType || 'Primary ID', form.identificationNumber, 'Declared'],
                ].map(([label, value, status], index) => (
                  <li key={index} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                    <span className="w-32 shrink-0 text-[13px] font-medium text-navy-900">
                      {label}
                    </span>
                    <span className="min-w-0 flex-1 font-mono text-[13px] text-grey-700">
                      {value || '—'}
                    </span>
                    <span
                      className={cn(
                        'text-[12px]',
                        String(status).startsWith('Verified') ? 'text-green-600' : 'text-grey-600',
                      )}
                    >
                      {status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Address Line 1" required error={errors.addressLine1} className="sm:col-span-2">
                  <Input
                    value={form.addressLine1}
                    onChange={(event) => set({ addressLine1: event.target.value })}
                    placeholder="House / street"
                  />
                </Field>
                <Field label="Address Line 2" className="sm:col-span-2">
                  <Input
                    value={form.addressLine2}
                    onChange={(event) => set({ addressLine2: event.target.value })}
                  />
                </Field>
                <Field label="District" required error={errors.district}>
                  <Select
                    value={form.district}
                    onChange={(event) => set({ district: event.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {['Puducherry', 'Karaikal', 'Mahe', 'Yanam'].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="State" required>
                  <Input value={form.state} readOnly className="bg-grey-100" />
                </Field>
                <Field label="PIN Code" required error={errors.pin}>
                  <Input
                    value={form.pin}
                    onChange={(event) => set({ pin: event.target.value })}
                    maxLength={6}
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={form.sameAsCorrespondence}
                  onChange={(event) => set({ sameAsCorrespondence: event.target.checked })}
                />
                Permanent address is the same as correspondence address
              </label>

              {/* Derived, not settable — the spec is explicit about this. */}
              {form.district && (
                <Banner tone="neutral" title="Local candidate status (derived)">
                  Based on district <span className="font-medium">{form.district}</span>, you are
                  recorded as a{' '}
                  <span className="font-medium">
                    {['Puducherry', 'Villianur', 'Bahour'].includes(form.district)
                      ? 'local candidate for the Puducherry region'
                      : `local candidate for the ${form.district} region`}
                  </span>
                  . This is derived from your address and cannot be set by hand.
                </Banner>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-[13px] text-grey-600">
                Files are checked for format and size before they are transmitted. Where DigiLocker
                holds the document, fetch it instead of uploading.
              </p>
              {DOCUMENT_SPECS.map((spec) => (
                <div key={spec.id}>
                  <DocumentUpload
                    spec={spec}
                    value={docs[spec.id]}
                    onChange={(doc) => setDocs((previous) => ({ ...previous, [spec.id]: doc }))}
                  />
                  {errors[spec.id] && (
                    <p className="mt-1 text-[12px] text-red-600">{errors[spec.id]}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <ReviewSection
                title="Basic Details"
                onEdit={() => setStep(0)}
                rows={[
                  ['Full Name', form.fullName],
                  ['Date of Birth', form.dob],
                  ['Gender', form.gender],
                  ["Father's Name", form.fatherName],
                  ["Mother's Name", form.motherName],
                  ['Category', form.category],
                  ['PwBD', form.isPwBD === 'Yes' ? `Yes — ${form.disabilityCategory}` : 'No'],
                ]}
              />
              <ReviewSection
                title="Contact Details"
                onEdit={() => setStep(1)}
                rows={[
                  ['Mobile', form.mobile],
                  ['Email', form.email],
                  ['Alternate Mobile', form.altMobile || '—'],
                ]}
              />
              <ReviewSection
                title="Address"
                onEdit={() => setStep(3)}
                rows={[
                  ['Correspondence', `${form.addressLine1}, ${form.district} - ${form.pin}`],
                  [
                    'Permanent',
                    form.sameAsCorrespondence
                      ? 'Same as correspondence'
                      : `${form.addressLine1}, ${form.district}`,
                  ],
                ]}
              />
              <ReviewSection
                title="Documents"
                onEdit={() => setStep(4)}
                rows={DOCUMENT_SPECS.map((spec) => [
                  spec.label,
                  docs[spec.id] ? `${docs[spec.id]!.fileName} (${docs[spec.id]!.source})` : 'Not uploaded',
                ])}
              />

              <div className="rounded-md border border-grey-200 p-3">
                <p className="mb-2 text-[13px] font-semibold text-navy-900">Create Password</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Password" required>
                    <Input type="password" placeholder="At least 8 characters" />
                  </Field>
                  <Field label="Confirm Password" required>
                    <Input type="password" />
                  </Field>
                </div>
              </div>

              <label className="flex items-start gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={declaration}
                  className="mt-0.5"
                  onChange={(event) => {
                    setDeclaration(event.target.checked)
                    setErrors({})
                  }}
                />
                <span>
                  I hereby declare that all the statements made in this registration are true,
                  complete and correct to the best of my knowledge and belief. In the event of any
                  information being found false or incorrect, my candidature is liable to be
                  rejected.
                </span>
              </label>
              {errors.declaration && (
                <p className="text-[12px] text-red-600">{errors.declaration}</p>
              )}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card title="Registration Progress">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-medium text-navy-700">Step {step + 1} of {STEPS.length}</span>
              <span className="text-grey-600">{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
            </div>
            <ProgressBar value={((step + 1) / STEPS.length) * 100} className="mt-2" tone="navy" />
          </Card>

          <Card title="Guidelines">
            <ul className="space-y-2">
              {[
                'Keep your valid email ID and mobile number active.',
                'Use correct details as per your legal documents.',
                'You will receive OTP on your mobile and email.',
                'Fields marked with * are mandatory.',
              ].map((item) => (
                <li key={item} className="flex gap-2 text-[13px] text-navy-900">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-green-600" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Documents Required (Step 5)">
            <ol className="space-y-1.5">
              {DOCUMENT_SPECS.map((spec, index) => (
                <li key={spec.id} className="flex gap-2 text-[13px] text-navy-900">
                  <span className="text-grey-600">{index + 1}.</span>
                  <span>
                    {spec.label}{' '}
                    <span className="text-grey-600">
                      ({spec.formats.join('/')}, Max {spec.maxKb}KB)
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>

          <NeedHelpCard />
        </div>
      </div>

      <OtpModal
        open={otpFor !== null}
        onClose={() => setOtpFor(null)}
        onVerified={() => {
          if (otpFor === 'aadhaar') {
            // UIDAI returns Name, Gender, Email, DOB — those four become read-only.
            setAadhaarVerified(true)
            set({
              fullName: form.fullName || 'Ramesh Kumar',
              gender: form.gender || 'Male',
              dob: form.dob || '1996-08-15',
              email: form.email || 'ramesh.kumar@email.com',
            })
          }
          if (otpFor === 'mobile') setMobileVerified(true)
          if (otpFor === 'email') setEmailVerified(true)
          setOtpFor(null)
        }}
        destination={
          otpFor === 'email' ? form.email : otpFor === 'mobile' ? form.mobile : 'Aadhaar-linked mobile'
        }
        purpose={
          otpFor === 'aadhaar'
            ? 'Aadhaar verification'
            : otpFor === 'email'
              ? 'email verification'
              : 'mobile verification'
        }
      />
    </div>
  )
}

function VerifiedBadge({ label = 'Verified via Aadhaar' }: { label?: string }) {
  return (
    <p className="mt-1 flex items-center gap-1 text-[12px] font-medium text-green-600">
      <BadgeCheck className="size-3.5" />
      {label}
    </p>
  )
}

function ReviewSection({
  title,
  rows,
  onEdit,
}: {
  title: string
  rows: (string | undefined)[][]
  onEdit: () => void
}) {
  return (
    <section className="rounded-md border border-grey-200">
      <header className="flex items-center justify-between border-b border-grey-200 px-3 py-2">
        <h3 className="text-[13px] font-semibold text-navy-700">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </header>
      <dl className="grid gap-x-6 gap-y-2 px-3 py-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[12px] text-grey-600">{label}</dt>
            <dd className="text-[13px] text-navy-900">{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function RegistrationReceipt({
  registrationNo,
  name,
  onContinue,
}: {
  registrationNo: string
  name: string
  onContinue: () => void
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <div className="space-y-4 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-050">
            <BadgeCheck className="size-8 text-green-600" strokeWidth={1.5} />
          </span>
          <h1 className="text-[20px] font-semibold text-navy-900">Registration successful</h1>
          <p className="text-[13px] text-grey-600">
            {name || 'Your account'} has been enrolled. Your Registration Number has been sent by SMS
            and email.
          </p>

          <div className="rounded-md bg-grey-050 px-4 py-4">
            <p className="text-[12px] text-grey-600">Registration / Reference Number</p>
            <p className="mt-1 font-mono text-[26px] font-semibold tracking-wide text-navy-900">
              {registrationNo}
            </p>
          </div>

          <Banner tone="info">
            This is <strong>not</strong> your Application Number. An Application Number is issued
            separately each time you apply to a post.
          </Banner>

          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="secondary">
              <Download className="size-4" />
              Download as PDF
            </Button>
            <Button variant="success" onClick={onContinue}>
              Go to my dashboard
            </Button>
            <Link to={ROUTES.HOME}>
              <Button variant="ghost">Back to home</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
