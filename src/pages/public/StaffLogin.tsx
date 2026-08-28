import { Building2, ChevronRight, KeyRound, ShieldCheck, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { OtpModal } from '@/components/common/OtpModal'
import { Banner, Button, Card, Field, Input } from '@/components/common/primitives'
import { GovBrand } from '@/components/layout/Emblem'
import { AccessibilityControls } from '@/components/layout/AccessibilityControls'
import { useAuth } from '@/hooks/useAuth'
import { seed } from '@/mock/api'
import { ROLES } from '@/rbac/roles'
import { portalHome } from '@/routes/guards'
import { cn } from '@/utils/cn'
import type { RoleId, StaffUser } from '@/types'

type StaffGroupId =
  | 'job-notification'
  | 'job-application'
  | 'exam-centre'
  | 'examination'
  | 'evaluation'
  | 'selection'
  | 'reports'
  | 'grievance'
  | 'integrations'
  | 'migration'

const STAFF_GROUPS: Array<{
  id: StaffGroupId
  name: string
  description: string
  roles: RoleId[]
}> = [
  {
    id: 'job-notification',
    name: 'Job Notification Management',
    description: 'Notifications, vacancies, eligibility, syllabus and key dates',
    roles: [
      'department-officer',
      'nodal-officer',
      'hod-approver',
      'finance-concurrence',
      'exam-officer',
    ],
  },
  {
    id: 'job-application',
    name: 'Job Application Management',
    description: 'Registration, eKYC, document upload, fee payment and tracking',
    roles: ['department-officer', 'hod-approver', 'exam-officer', 'helpdesk-agent'],
  },
  {
    id: 'exam-centre',
    name: 'Exam Centre Management',
    description: 'Centre mapping, candidate allocation and capacity planning',
    roles: ['exam-officer', 'centre-supervisor', 'invigilator'],
  },
  {
    id: 'examination',
    name: 'Examination Management',
    description: 'CBT / OMR exams, question papers and biometric attendance',
    roles: ['exam-officer', 'centre-supervisor', 'invigilator'],
  },
  {
    id: 'evaluation',
    name: 'Evaluation Management',
    description: 'Evaluation, OMR / CBT processing, normalisation and audit trail',
    roles: ['evaluator', 'moderator', 'evaluation-admin'],
  },
  {
    id: 'selection',
    name: 'Selection Management',
    description: 'Merit, rank lists, reservation rules and final selection',
    roles: ['merit-officer', 'evaluation-admin', 'exam-officer'],
  },
  {
    id: 'reports',
    name: 'MIS & Reporting',
    description: 'Dashboards, statutory reports, analytics and data export',
    roles: ['reports-officer', 'analytics-viewer', 'super-admin', 'system-admin'],
  },
  {
    id: 'grievance',
    name: 'Grievance Management',
    description: 'Grievance portal, ticketing, tracking and escalation',
    roles: ['helpdesk-agent', 'super-admin'],
  },
  {
    id: 'integrations',
    name: 'External System Integration',
    description: 'Aadhaar / eKYC, DigiLocker, payments, SMS, email and e-HRMS',
    roles: ['system-admin', 'super-admin'],
  },
  {
    id: 'migration',
    name: 'Data Migration',
    description: 'Legacy migration, validation, deduplication and archival',
    roles: ['system-admin', 'super-admin'],
  },
]

/**
 * Staff authentication is Employee ID / mobile / email + OTP (Ref. 63), with
 * MFA on top for the Admin Portal. The demo shows every seeded account so each
 * RBAC path is one click away.
 */
export default function StaffLogin() {
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingUser, setPendingUser] = useState<StaffUser | null>(null)
  const [activeGroup, setActiveGroup] = useState<StaffGroupId | null>(null)
  const { loginAsStaff } = useAuth()
  const navigate = useNavigate()

  const selectedGroup = STAFF_GROUPS.find((group) => group.id === activeGroup)
  const selectedUsers = selectedGroup
    ? seed.staffUsers.filter((user) =>
        user.roleIds.some((roleId) => selectedGroup.roles.includes(roleId)),
      )
    : []

  function begin(value: string) {
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Enter your Employee ID, registered mobile number or email.')
      return
    }

    const match = seed.staffUsers.find(
      (user) =>
        user.employeeId.toLowerCase() === trimmed.toLowerCase() ||
        user.email.toLowerCase() === trimmed.toLowerCase() ||
        user.mobile === trimmed,
    )

    if (!match) {
      setError('No account matches that identifier.')
      return
    }
    if (!match.isActive) {
      setError(
        `This account is deactivated (${match.deactivationReason}). Contact the Super Admin for reactivation.`,
      )
      return
    }

    setError(null)
    setPendingUser(match)
  }

  function complete() {
    if (!pendingUser) return
    const user = loginAsStaff(pendingUser.employeeId)
    setPendingUser(null)
    if (user) navigate(portalHome(ROLES[user.roleIds[0]].homePortal), { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-grey-050">
      <header className="bg-navy-900 px-4 py-3 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <GovBrand />
          <AccessibilityControls />
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card title="Staff & Officer Login" className="h-fit">
          <div className="space-y-4">
            <Field
              label="Employee ID / Mobile / Email"
              required
              hint="Any of the three identifiers works (Ref. 63)."
            >
              <Input
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value)
                  setError(null)
                }}
                onKeyDown={(event) => event.key === 'Enter' && begin(identifier)}
                placeholder="e.g. PEA0114"
                autoFocus
              />
            </Field>

            {error && (
              <p className="text-[13px] text-red-600" role="alert">
                {error}
              </p>
            )}

            <Button className="w-full" onClick={() => begin(identifier)}>
              <KeyRound className="size-4" />
              Send OTP
            </Button>

            <Banner tone="info" icon={<ShieldCheck className="size-4" />}>
              Admin Portal sign-in additionally requires MFA. Authentication is OTP-based; there is
              no password for staff accounts.
            </Banner>
          </div>
        </Card>

        <Card
          title="Demo accounts by module"
          action={<span className="text-[12px] text-grey-600">OTP for all accounts: 123456</span>}
          bodyClassName="p-0"
        >
          <p className="border-b border-grey-200 px-4 py-3 text-[13px] text-grey-600">
            Select a functional module, then choose an officer assigned to that workflow. Officers
            can appear in more than one module where their role spans multiple responsibilities.
          </p>

          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {STAFF_GROUPS.map((group, index) => {
              const users = seed.staffUsers.filter((user) =>
                user.roleIds.some((roleId) => group.roles.includes(roleId)),
              )
              const activeUsers = users.filter((user) => user.isActive).length
              const expanded = activeGroup === group.id

              return (
                <button
                  key={group.id}
                  type="button"
                  aria-expanded={expanded}
                  aria-controls="selected-module-users"
                  onClick={() => setActiveGroup(expanded ? null : group.id)}
                  className={cn(
                    'group flex min-h-40 flex-col rounded-lg border p-4 text-left transition-all',
                    expanded
                      ? 'border-navy-700 bg-navy-900 text-white shadow-sm'
                      : 'border-grey-200 bg-white hover:border-navy-700 hover:bg-blue-050',
                  )}
                >
                  <span
                    className={cn(
                      'text-[22px] font-bold tabular-nums',
                      expanded ? 'text-amber-400' : 'text-green-600',
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={cn(
                      'mt-3 text-[15px] font-semibold',
                      expanded ? 'text-white' : 'text-navy-900',
                    )}
                  >
                    {group.name}
                  </span>
                  <span
                    className={cn(
                      'mt-1 text-[12px] leading-relaxed',
                      expanded ? 'text-white/70' : 'text-grey-600',
                    )}
                  >
                    {group.description}
                  </span>
                  <span className="mt-auto flex w-full items-center justify-between gap-2 pt-4 text-[12px] font-medium">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      {activeUsers} active account{activeUsers === 1 ? '' : 's'}
                    </span>
                    <ChevronRight
                      className={cn('size-4 transition-transform', expanded && 'rotate-90')}
                    />
                  </span>
                </button>
              )
            })}
          </div>

          {selectedGroup && (
            <section
              id="selected-module-users"
              aria-label={`${selectedGroup.name} demo accounts`}
              className="border-t border-grey-200 bg-grey-050"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-md bg-navy-900 text-white">
                    <Building2 className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-[14px] font-semibold text-navy-900">
                      {selectedGroup.name}
                    </h3>
                    <p className="text-[12px] text-grey-600">
                      Select an officer to continue with OTP verification
                    </p>
                  </div>
                </div>
                <span className="text-[12px] text-grey-600">
                  {selectedUsers.length} account{selectedUsers.length === 1 ? '' : 's'}
                </span>
              </div>

              <ul className="grid gap-3 border-t border-grey-200 p-4 sm:grid-cols-2">
                {selectedUsers.map((user) => {
                  const roles = user.roleIds.map((id) => ROLES[id])
                  const department = seed.departments.find(
                    (item) => item.id === user.departmentId,
                  )

                  return (
                    <li key={user.id}>
                      <button
                        type="button"
                        disabled={!user.isActive}
                        onClick={() => begin(user.employeeId)}
                        className={cn(
                          'flex h-full w-full items-start gap-3 rounded-md border border-grey-200 bg-white p-3 text-left transition-colors',
                          user.isActive
                            ? 'hover:border-navy-700 hover:bg-blue-050'
                            : 'cursor-not-allowed opacity-55',
                        )}
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy-900 text-[12px] font-semibold text-white">
                          {user.initials}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-baseline gap-x-2">
                            <span className="text-[13px] font-semibold text-navy-900">
                              {user.name}
                            </span>
                            <span className="font-mono text-[11px] text-grey-600">
                              {user.employeeId}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-[12px] text-grey-600">
                            {user.designation}
                            {department ? ` · ${department.name}` : ''}
                          </span>
                          <span className="mt-1 block text-[12px] font-medium text-navy-700">
                            {roles.map((role) => role.name).join(' · ')}
                          </span>
                          {!user.isActive && (
                            <span className="mt-1 block text-[11px] text-red-600">
                              Deactivated — {user.deactivationReason}
                            </span>
                          )}
                        </span>
                        {user.isActive && (
                          <ChevronRight className="mt-1 size-4 shrink-0 text-grey-600" />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {!selectedGroup && (
            <div className="border-t border-grey-200 bg-grey-050 px-4 py-3 text-center text-[12px] text-grey-600">
              Choose a module block above to view its officers.
            </div>
          )}
        </Card>
      </main>

      <OtpModal
        open={Boolean(pendingUser)}
        onClose={() => setPendingUser(null)}
        onVerified={complete}
        destination={pendingUser?.mobile ?? ''}
        purpose="staff sign-in"
      />
    </div>
  )
}
