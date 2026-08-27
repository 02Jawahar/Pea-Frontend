import { IdCard, TriangleAlert, UploadCloud, UserPlus } from 'lucide-react'
import { useState } from 'react'

import { DataTable, type Column } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { OtpModal } from '@/components/common/OtpModal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Field, Input, Select } from '@/components/common/primitives'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import { ROLES, ROLE_LIST } from '@/rbac/roles'
import type { DeactivationReason, StaffUser } from '@/types'
import { cn } from '@/utils/cn'

const DEACTIVATION_REASONS: DeactivationReason[] = [
  'Resignation from services',
  'Suspension',
  'Superannuation',
  'Transfer on deputation',
  'Temporary deactivation',
]

/**
 * Ref. 63, 64 — user administration.
 *
 * The primary path is bulk provisioning from the employee master, not one-by-one
 * entry. Deactivation names an explicit reason and never orphans a workflow task:
 * pending tasks are listed and must be reassigned or acknowledged first.
 */
export default function UserManagement() {
  const { data, isLoading } = useAsync(() => api.staffUsers(), 'staffUsers')
  const { can } = useAuth()
  const [deactivating, setDeactivating] = useState<StaffUser | null>(null)
  const [reason, setReason] = useState<DeactivationReason | ''>('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [contactUser, setContactUser] = useState<StaffUser | null>(null)
  const [otpOpen, setOtpOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const columns: Column<StaffUser>[] = [
    {
      key: 'name',
      header: 'User',
      accessor: (row) => row.name,
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold',
              row.isActive ? 'bg-navy-900 text-white' : 'bg-grey-200 text-grey-600',
            )}
          >
            {row.initials}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-navy-900">{row.name}</p>
            <p className="text-[12px] text-grey-600">{row.designation}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'employeeId',
      header: 'Employee ID',
      accessor: (row) => row.employeeId,
      sortable: true,
      render: (row) => <span className="font-mono text-[12px]">{row.employeeId}</span>,
    },
    {
      key: 'contact',
      header: 'Login identifiers',
      render: (row) => (
        <div className="text-[12px] text-grey-600">
          <p>{row.mobile}</p>
          <p className="truncate">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roleIds.map((id) => (
            <span
              key={id}
              className={cn(
                'rounded px-1.5 py-0.5 text-[11px] font-medium',
                ROLES[id].critical
                  ? 'bg-amber-050 text-amber-500'
                  : 'bg-grey-100 text-grey-700',
              )}
            >
              {ROLES[id].name}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) =>
        seed.departments.find((department) => department.id === row.departmentId)?.name ?? 'PEA',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) =>
        row.isActive ? (
          <StatusPill status="Active" />
        ) : (
          <div>
            <StatusPill status="Cancelled" />
            <p className="mt-0.5 text-[11px] text-grey-600">{row.deactivationReason}</p>
          </div>
        ),
    },
    {
      key: 'action',
      header: '',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setContactUser(row)}>
            Update contact
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!can('user.deactivate')}
            className={row.isActive ? 'text-red-600' : 'text-green-600'}
            onClick={() => {
              setDeactivating(row)
              setReason('')
              setAcknowledged(false)
              setError(null)
            }}
          >
            {row.isActive ? 'Deactivate' : 'Reactivate'}
          </Button>
        </div>
      ),
    },
  ]

  const pendingTasks = deactivating
    ? seed.offices.filter((office) => office.id === deactivating.officeId && office.pendingTasks > 0)
    : []

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Authentication is OTP-based — Employee ID, mobile number or email all work as the login
            identifier (Ref. 63).
          </p>
        </div>
        {can('user.create') && (
          <div className="flex gap-2">
            <Button variant="secondary">
              <IdCard className="size-4" />
              Generate ID cards
            </Button>
            <Button variant="secondary">
              <UploadCloud className="size-4" />
              Bulk provision from employee master
            </Button>
            <Button>
              <UserPlus className="size-4" />
              Add user
            </Button>
          </div>
        )}
      </div>

      <Banner tone="info" title="Bulk provisioning is the primary path">
        Ref. 63 requires the system to create login credentials automatically for department staff.
        One-by-one entry exists for exceptions, not as the default route.
      </Banner>

      <Card>
        <DataTable
          rows={data ?? []}
          columns={columns}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          searchPlaceholder="Search by name, Employee ID, mobile or email"
          searchFields={(row) => `${row.name} ${row.employeeId} ${row.mobile} ${row.email} ${row.designation}`}
          filters={[
            {
              key: 'role',
              label: 'Role',
              options: ROLE_LIST.map((role) => role.name),
              match: (row, value) => row.roleIds.some((id) => ROLES[id].name === value),
            },
            {
              key: 'status',
              label: 'Status',
              options: ['Active', 'Deactivated'],
              match: (row, value) => (value === 'Active' ? row.isActive : !row.isActive),
            },
          ]}
          pageSize={10}
          emptyTitle="No users match these filters"
          emptyDescription="Clear the search or role filter."
        />
      </Card>

      {/* Ref. 64 — never orphan a workflow task. */}
      <Modal
        open={deactivating !== null}
        onClose={() => setDeactivating(null)}
        title={
          deactivating?.isActive
            ? `Deactivate ${deactivating.name}?`
            : `Reactivate ${deactivating?.name}?`
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeactivating(null)}>
              Cancel
            </Button>
            <Button
              variant={deactivating?.isActive ? 'danger' : 'success'}
              onClick={() => {
                if (deactivating?.isActive) {
                  if (!reason) {
                    setError('Select a deactivation reason.')
                    return
                  }
                  if (pendingTasks.length > 0 && !acknowledged) {
                    setError('Reassign the pending tasks or acknowledge them explicitly.')
                    return
                  }
                }
                setDeactivating(null)
              }}
            >
              {deactivating?.isActive ? 'Deactivate user' : 'Reactivate user'}
            </Button>
          </>
        }
      >
        {deactivating && (
          <div className="space-y-3">
            {error && <Banner tone="danger">{error}</Banner>}

            {deactivating.isActive ? (
              <>
                <Field label="Reason for deactivation" required>
                  <Select
                    value={reason}
                    onChange={(event) => {
                      setReason(event.target.value as DeactivationReason)
                      setError(null)
                    }}
                  >
                    <option value="">-- Select --</option>
                    {DEACTIVATION_REASONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </Select>
                </Field>

                {reason === 'Temporary deactivation' && (
                  <Field label="Auto-reactivate on" hint="Optional — leave blank to reactivate by hand.">
                    <Input type="date" />
                  </Field>
                )}

                {pendingTasks.length > 0 && (
                  <Banner
                    tone="warning"
                    icon={<TriangleAlert className="size-4" />}
                    title={`${pendingTasks[0].pendingTasks} task${pendingTasks[0].pendingTasks === 1 ? '' : 's'} pending with this user's office`}
                  >
                    <ul className="mt-1 list-inside list-disc">
                      <li>REQ/REV/2024/0007 — awaiting approval</li>
                      <li>Application scrutiny queue — 34 applications</li>
                    </ul>
                    <label className="mt-2 flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={acknowledged}
                        className="mt-0.5"
                        onChange={(event) => {
                          setAcknowledged(event.target.checked)
                          setError(null)
                        }}
                      />
                      <span>
                        I have reassigned these tasks or explicitly accept that they remain with the
                        office after deactivation.
                      </span>
                    </label>
                  </Banner>
                )}
              </>
            ) : (
              <p className="text-[13px] text-grey-600">
                Reactivating restores this user's roles and login credentials. They will receive an
                OTP on their registered mobile at the next sign-in.
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Ref. 63 — a contact change updates both the profile and the credential. */}
      <Modal
        open={contactUser !== null}
        onClose={() => setContactUser(null)}
        title={contactUser ? `Update contact — ${contactUser.name}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setContactUser(null)}>
              Cancel
            </Button>
            <Button onClick={() => setOtpOpen(true)}>Verify new destination</Button>
          </>
        }
      >
        {contactUser && (
          <div className="space-y-3">
            <Banner tone="info">
              Changing a mobile number or email changes the login credential with it. The new
              destination is verified by OTP, and a notice goes to the old one.
            </Banner>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Mobile Number">
                <Input defaultValue={contactUser.mobile} />
              </Field>
              <Field label="Email ID">
                <Input defaultValue={contactUser.email} />
              </Field>
            </div>
          </div>
        )}
      </Modal>

      <OtpModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onVerified={() => {
          setOtpOpen(false)
          setContactUser(null)
        }}
        destination={contactUser?.mobile ?? ''}
        purpose="contact change"
      />
    </div>
  )
}
