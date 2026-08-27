import { EyeOff, Lock, Plus } from 'lucide-react'
import { useState } from 'react'

import { OtpModal } from '@/components/common/OtpModal'
import { Banner, Button, Card, Field, Input, Select, Tabs } from '@/components/common/primitives'
import { useAuth } from '@/hooks/useAuth'

type TabId = 'personal' | 'education' | 'sports' | 'work' | 'other'

/**
 * Ref. 25 — profile data is candidate-only and must never reach Department
 * scrutiny screens. The privacy notice is repeated visibly on this page.
 * Ref. 27 — any profile edit requires OTP re-authentication.
 */
export default function CandidateProfile() {
  const { candidate } = useAuth()
  const [tab, setTab] = useState<TabId>('personal')
  const [editing, setEditing] = useState(false)
  const [otpOpen, setOtpOpen] = useState(false)

  if (!candidate) return null

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Profile Details</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Saved independently of any application — fill it once and every future application
            pre-fills.
          </p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={() => setEditing(false)}>
              Save changes
            </Button>
          </div>
        ) : (
          <Button onClick={() => setOtpOpen(true)}>
            <Lock className="size-4" />
            Verify to edit
          </Button>
        )}
      </div>

      <Banner tone="info" icon={<EyeOff className="size-4" />} title="These details are visible only to you">
        Departments see only what you include in an application. Nothing on this page is exposed to
        a scrutiny screen (Ref. 25).
      </Banner>

      <Card bodyClassName="p-0">
        <Tabs
          className="px-4 pt-2"
          active={tab}
          onChange={setTab}
          tabs={[
            { id: 'personal', label: 'Personal' },
            { id: 'education', label: 'Education' },
            { id: 'sports', label: 'Sports' },
            { id: 'work', label: 'Work' },
            { id: 'other', label: 'Other' },
          ]}
        />

        <div className="p-4">
          {tab === 'personal' && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Full Name">
                <Input defaultValue={candidate.name} readOnly={!editing} />
              </Field>
              <Field label="Date of Birth">
                <Input defaultValue={candidate.dob} readOnly={!editing} />
              </Field>
              <Field label="Blood Group">
                <Select disabled={!editing} defaultValue="">
                  <option value="">-- Select --</option>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((group) => (
                    <option key={group}>{group}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Mailing Address" className="sm:col-span-2">
                <Input defaultValue={`${candidate.district}, ${candidate.state}`} readOnly={!editing} />
              </Field>
              <Field label="Alternate Mobile">
                <Input placeholder="Optional" readOnly={!editing} />
              </Field>
            </div>
          )}

          {tab === 'education' && (
            <RepeatableSection
              editing={editing}
              addLabel="Add qualification"
              columns={['Level', 'Institution', 'Board / University', 'Year', 'Marks / %']}
              rows={[
                ['Class X', 'Govt. Higher Sec. School, Villianur', 'State Board', '2012', '84%'],
                ['Class XII', 'Govt. Higher Sec. School, Villianur', 'State Board', '2014', '79%'],
                ['Graduate', 'Pondicherry University', 'Pondicherry University', '2017', '68%'],
              ]}
            />
          )}

          {tab === 'sports' && (
            <RepeatableSection
              editing={editing}
              addLabel="Add sport"
              columns={['Name of Sport', 'Level of Representation', 'Awards / Recognition']}
              rows={[['Volleyball', 'State', 'Runner-up, State Championship 2016']]}
            />
          )}

          {tab === 'work' && (
            <RepeatableSection
              editing={editing}
              addLabel="Add experience"
              columns={['Organisation', 'Period', 'Designation', 'Brief Role']}
              rows={[]}
              emptyNote="No work experience recorded. The eligibility check flags this as 'cannot verify' where a post requires experience."
            />
          )}

          {tab === 'other' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Bank Account Number" hint="Used for fee refunds only.">
                <Input placeholder="Account number" readOnly={!editing} />
              </Field>
              <Field label="IFSC">
                <Input placeholder="IFSC" readOnly={!editing} />
              </Field>
              <Field label="Published books / articles" className="sm:col-span-2">
                <Input placeholder="Optional" readOnly={!editing} />
              </Field>
            </div>
          )}
        </div>
      </Card>

      <Banner tone="warning" title="Documents linked to a submitted application">
        When you link a profile document into an application, a separate copy is stored for that
        application. Deleting or replacing the profile copy never changes what a department already
        holds — you will be shown every affected application before the change goes through.
      </Banner>

      <OtpModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onVerified={() => {
          setOtpOpen(false)
          setEditing(true)
        }}
        destination={candidate.mobile}
        purpose="profile edit (Ref. 27)"
      />
    </div>
  )
}

function RepeatableSection({
  columns,
  rows,
  editing,
  addLabel,
  emptyNote,
}: {
  columns: string[]
  rows: string[][]
  editing: boolean
  addLabel: string
  emptyNote?: string
}) {
  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-grey-300 px-4 py-6 text-center text-[13px] text-grey-600">
          {emptyNote ?? 'Nothing recorded yet.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey-200 bg-grey-050">
                {columns.map((column) => (
                  <th key={column} className="px-3 py-2 text-left text-[12px] font-semibold uppercase">
                    {column}
                  </th>
                ))}
                <th className="px-3 py-2 text-left text-[12px] font-semibold uppercase">Document</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-b border-grey-200 last:border-b-0">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="data-cell">
                      {cell}
                    </td>
                  ))}
                  <td className="data-cell text-navy-700">Certificate.pdf</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Button variant="secondary" size="sm">
          <Plus className="size-3.5" />
          {addLabel}
        </Button>
      )}
    </div>
  )
}
