import { Info, Save, Upload } from 'lucide-react'
import { useState } from 'react'

import { Banner, Button, Card, Field, Input, Select, Textarea } from '@/components/common/primitives'
import { useAuth } from '@/hooks/useAuth'
import { seed } from '@/mock/api'
import { cn } from '@/utils/cn'

/**
 * Ref. 4–9 — the candidate criteria builder.
 *
 * Objective criteria use structured controls, subjective criteria are free text
 * (Ref. 4 requires both). Physical test becomes a qualifying gate *before* the
 * written exam (Ref. 8), and disability categories derive the scribe offer and
 * compensatory time automatically (Ref. 9) — shown as consequences, not options.
 */

const QUALIFICATIONS = [
  'Class X / SSLC',
  'Class XII / HSC',
  'Bachelor’s degree',
  'Master’s degree',
  'B.Ed.',
  'Diploma',
]

const SKILLS = ['Computer literacy', 'Typewriting — English', 'Typewriting — Tamil', 'Shorthand', 'Data entry speed']

const CATEGORIES = ['Unreserved', 'MBC', 'OBC', 'EBC', 'EWS', 'SC', 'ST', 'BT', 'BCM']

const DISABILITIES = [
  'Blind',
  'Low Vision',
  'Hard of Hearing',
  'Locomotor',
  'Autism',
  'Specific Learning Disability',
  'Mental Illness',
  'Multiple Disabilities',
]

const SCRIBE_ELIGIBLE = ['Blind', 'Low Vision']

const DOCUMENT_SLOTS = [
  'Educational qualification',
  'Experience',
  'Skill',
  'Physical test',
  'Regional candidate',
  'Caste',
  'Disability',
  'Ex-service men',
  'Sports',
]

export default function CandidateCriteria() {
  const { can } = useAuth()
  const editable = can('criteria.edit')

  const [postId, setPostId] = useState(seed.posts[0].id)
  const [essential, setEssential] = useState<string[]>(['Bachelor’s degree'])
  const [desirable, setDesirable] = useState<string[]>(['Diploma'])
  const [skills, setSkills] = useState<string[]>(['Computer literacy'])
  const [categories, setCategories] = useState<string[]>(CATEGORIES)
  const [disabilities, setDisabilities] = useState<string[]>(['Low Vision', 'Locomotor'])
  const [physicalTest, setPhysicalTest] = useState(false)
  const [regional, setRegional] = useState(true)
  const [exServiceMen, setExServiceMen] = useState(true)
  const [sports, setSports] = useState(false)

  const post = seed.posts.find((item) => item.id === postId)!
  const scribeCategories = disabilities.filter((item) => SCRIBE_ELIGIBLE.includes(item))

  const toggle = (list: string[], set: (next: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Candidate Criteria</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {post.name} · {seed.departments.find((d) => d.id === post.departmentId)?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            aria-label="Select post"
            className="w-auto min-w-52"
            value={postId}
            onChange={(event) => setPostId(event.target.value)}
          >
            {seed.posts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
          {editable && (
            <Button>
              <Save className="size-4" />
              Save criteria
            </Button>
          )}
        </div>
      </div>

      <div className="grid flex-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="flex flex-col gap-4">
          <Card title="Objective criteria">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Minimum age" required>
                <Input type="number" defaultValue={18} readOnly={!editable} />
              </Field>
              <Field label="Maximum age" required hint={`Post age limit: ${post.ageLimit}`}>
                <Input type="number" defaultValue={30} readOnly={!editable} />
              </Field>

              <ChipField
                label="Educational qualification (Essential)"
                required
                options={[...QUALIFICATIONS, 'Any equivalent qualification']}
                selected={essential}
                onToggle={(value) => toggle(essential, setEssential, value)}
                disabled={!editable}
                className="sm:col-span-2"
              />

              <ChipField
                label="Educational qualification (Desirable)"
                options={QUALIFICATIONS}
                selected={desirable}
                onToggle={(value) => toggle(desirable, setDesirable, value)}
                disabled={!editable}
                className="sm:col-span-2"
              />

              <Field label="Years of experience">
                <Input type="number" defaultValue={0} readOnly={!editable} />
              </Field>
              <Field label="Type of experience">
                <Select disabled={!editable} defaultValue="Not required">
                  <option>Not required</option>
                  <option>Government service</option>
                  <option>Public sector</option>
                  <option>Any organisation</option>
                </Select>
              </Field>

              <ChipField
                label="Skills"
                options={SKILLS}
                selected={skills}
                onToggle={(value) => toggle(skills, setSkills, value)}
                disabled={!editable}
                className="sm:col-span-2"
              />

              <ChipField
                label="Caste category"
                options={CATEGORIES}
                selected={categories}
                onToggle={(value) => toggle(categories, setCategories, value)}
                disabled={!editable}
                className="sm:col-span-2"
              />
            </div>
          </Card>

          <Card title="Toggles">
            <div className="grid gap-3 sm:grid-cols-2">
              <ToggleRow
                label="Physical test"
                detail="Becomes a qualifying gate before the written examination."
                checked={physicalTest}
                onChange={setPhysicalTest}
                disabled={!editable}
              />
              <ToggleRow
                label="Regional candidate"
                detail="Preference applied for candidates of the defined region."
                checked={regional}
                onChange={setRegional}
                disabled={!editable}
              />
              <ToggleRow
                label="Ex-Service Men"
                detail="One-time provision applies at merit generation."
                checked={exServiceMen}
                onChange={setExServiceMen}
                disabled={!editable}
              />
              <ToggleRow
                label="Sports"
                detail="Meritorious sports person quota with a level requirement."
                checked={sports}
                onChange={setSports}
                disabled={!editable}
              />
            </div>

            {physicalTest && (
              <div className="mt-4 rounded-md border border-amber-100 bg-amber-050 p-3">
                <p className="text-[13px] font-semibold text-amber-500">
                  Candidates must clear the physical test before being admitted to the written
                  examination.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Field label="Height (minimum)">
                    <Input defaultValue="163 cm" readOnly={!editable} />
                  </Field>
                  <Field label="Chest (minimum)">
                    <Input defaultValue="79 cm" readOnly={!editable} />
                  </Field>
                  <Field label="Endurance">
                    <Input defaultValue="1600 m in 6 min 30 s" readOnly={!editable} />
                  </Field>
                </div>
              </div>
            )}
          </Card>

          <Card title="Persons with Disability (Ref. 9)">
            <ChipField
              label="Permitted disability categories"
              options={DISABILITIES}
              selected={disabilities}
              onToggle={(value) => toggle(disabilities, setDisabilities, value)}
              disabled={!editable}
            />

            <Banner tone="info" className="mt-3" icon={<Info className="size-4" />} title="Derived consequences — not editable">
              {scribeCategories.length > 0 ? (
                <>
                  For {scribeCategories.join(' and ')}, the scribe option is offered to the candidate
                  automatically and compensatory time is granted by the system automatically. UDID
                  number and validity are collected from the candidate at enrolment.
                </>
              ) : (
                <>
                  None of the selected categories triggers the automatic scribe offer. Compensatory
                  time is still granted automatically. The scribe offer applies to Blind, Low Vision,
                  Both Arms and Cerebral Palsy.
                </>
              )}
            </Banner>
          </Card>

          <Card title="Subjective criteria (Ref. 4)">
            <Textarea
              readOnly={!editable}
              defaultValue="Preference will be given to candidates with demonstrated experience in revenue administration and working knowledge of Tamil. The selection committee may consider any other qualification it deems relevant to the duties of the post."
              className="min-h-28"
            />
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card title="Criteria documents (Ref. 5)">
            <p className="mb-3 text-[13px] text-grey-600">
              One upload slot per criteria section. These are what a scrutiny officer checks a
              candidate's documents against.
            </p>
            <ul className="space-y-2">
              {DOCUMENT_SLOTS.map((slot, index) => (
                <li
                  key={slot}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-grey-200 px-3 py-2"
                >
                  <span className="min-w-0 flex-1 text-[13px] text-navy-900">{slot}</span>
                  {index < 4 ? (
                    <span className="text-[12px] text-green-600">Uploaded</span>
                  ) : (
                    <Button variant="ghost" size="sm" disabled={!editable}>
                      <Upload className="size-3.5" />
                      Upload
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Effect on the flow">
            <ul className="space-y-2 text-[13px]">
              {[
                ['Eligibility advisory', 'Candidates see how many criteria they appear to meet before applying — informative, never blocking.'],
                ['System check at scrutiny', 'The officer sees the same comparison, labelled “System check”, with their own verdict required per criterion.'],
                ['Merit weightage', physicalTest ? 'Physical fitness weightage becomes available in Merit Criteria Setup.' : 'No physical fitness weightage for this post.'],
                ['Reservation matrix', 'The caste categories selected here define the rows of the reservation matrix.'],
              ].map(([label, detail]) => (
                <li key={label} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-navy-700" />
                  <span>
                    <span className="font-medium text-navy-900">{label}</span>
                    <span className="block text-[12px] text-grey-600">{detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ChipField({
  label,
  required,
  options,
  selected,
  onToggle,
  disabled,
  className,
}: {
  label: string
  required?: boolean
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  disabled?: boolean
  className?: string
}) {
  return (
    <Field label={label} required={required} className={className}>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {options.map((option) => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onToggle(option)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors',
                active
                  ? 'border-navy-700 bg-blue-050 text-navy-700'
                  : 'border-grey-200 text-grey-700 hover:bg-grey-050',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </Field>
  )
}

function ToggleRow({
  label,
  detail,
  checked,
  onChange,
  disabled,
}: {
  label: string
  detail: string
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5',
        checked ? 'border-navy-700 bg-blue-050' : 'border-grey-200',
        disabled && 'cursor-not-allowed opacity-70',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-navy-900">{label}</span>
        <span className="block text-[12px] text-grey-600">{detail}</span>
      </span>
    </label>
  )
}
