import { KeyRound, ShieldCheck } from 'lucide-react'
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
import type { StaffUser } from '@/types'

/**
 * Staff authentication is Employee ID / mobile / email + OTP (Ref. 63), with
 * MFA on top for the Admin Portal. The demo shows every seeded account so each
 * RBAC path is one click away.
 */
export default function StaffLogin() {
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingUser, setPendingUser] = useState<StaffUser | null>(null)
  const { loginAsStaff } = useAuth()
  const navigate = useNavigate()

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
          title="Demo accounts — one per role"
          action={<span className="text-[12px] text-grey-600">OTP for all accounts: 123456</span>}
          bodyClassName="p-0"
        >
          <p className="border-b border-grey-200 px-4 py-3 text-[13px] text-grey-600">
            Every account below carries a different role. Signing in as each one shows how the
            sidebar, the screens and the action buttons change — nothing is hidden by CSS, the
            routes and the controls genuinely are not granted.
          </p>

          <ul className="divide-y divide-grey-200">
            {seed.staffUsers.map((user) => {
              const roles = user.roleIds.map((id) => ROLES[id])
              return (
                <li key={user.id}>
                  <button
                    type="button"
                    disabled={!user.isActive}
                    onClick={() => begin(user.employeeId)}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                      user.isActive ? 'hover:bg-grey-050' : 'cursor-not-allowed opacity-55',
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy-900 text-[12px] font-semibold text-white">
                      {user.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-[13px] font-semibold text-navy-900">{user.name}</span>
                        <span className="font-mono text-[12px] text-grey-600">
                          {user.employeeId}
                        </span>
                        {!user.isActive && (
                          <span className="text-[12px] text-red-600">
                            Deactivated — {user.deactivationReason}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-grey-600">
                        {roles.map((role) => role.name).join(' · ')} → {roles[0].homePortal}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-grey-600">
                        {roles[0].description}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
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
