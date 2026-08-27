import { ShieldAlert } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { Button } from '@/components/common/primitives'
import { EmptyState } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import type { Permission } from '@/rbac/permissions'
import type { PortalId } from '@/rbac/roles'

/** Staff route tree. Redirects to the staff login, remembering where they were. */
export function RequireStaff({ portal }: { portal: PortalId }) {
  const { staff, canAccessPortal } = useAuth()
  const location = useLocation()

  if (!staff) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
  }

  if (!canAccessPortal(portal)) {
    return <NoAccess reason={`Your roles do not include access to the ${portalName(portal)}.`} />
  }

  return <Outlet />
}

/** Candidate route tree — a completely separate identity from staff. */
export function RequireCandidate() {
  const { candidate } = useAuth()
  const location = useLocation()

  if (!candidate) {
    return <Navigate to={ROUTES.CANDIDATE_LOGIN} replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

/**
 * Screen-level permission gate. A user who can reach the portal but not this
 * screen gets an explanation, not a blank page or a silent redirect.
 */
export function RequirePermission({ permission }: { permission: Permission | Permission[] }) {
  const { can } = useAuth()

  if (!can(permission)) {
    return (
      <NoAccess
        reason={`This screen requires the ${[permission].flat().join(' or ')} permission, which none of your roles grant.`}
      />
    )
  }
  return <Outlet />
}

/** Signed-in users are pushed on to their home portal instead of the login page. */
export function RedirectIfAuthenticated() {
  const { staff, candidate, homePortal } = useAuth()

  if (candidate) return <Navigate to={ROUTES.CANDIDATE_DASHBOARD} replace />
  if (staff && homePortal) return <Navigate to={portalHome(homePortal)} replace />
  return <Outlet />
}

export function portalHome(portal: PortalId): string {
  return {
    candidate: ROUTES.CANDIDATE_DASHBOARD,
    department: ROUTES.DEPT_DASHBOARD,
    'exam-admin': ROUTES.EA_DASHBOARD,
    evaluator: ROUTES.EV_DASHBOARD,
    admin: ROUTES.AD_DASHBOARD,
    invigilator: ROUTES.IN_DASHBOARD,
    helpdesk: ROUTES.HD_DASHBOARD,
    finance: ROUTES.FI_INBOX,
  }[portal]
}

function portalName(portal: PortalId) {
  return {
    candidate: 'Candidate Portal',
    department: 'Department Portal',
    'exam-admin': 'Exam Admin Portal',
    evaluator: 'Evaluator Portal',
    admin: 'Admin Portal',
    invigilator: 'Centre Functionary Portal',
    helpdesk: 'Helpdesk Console',
    finance: 'Finance Concurrence',
  }[portal]
}

function NoAccess({ reason }: { reason: string }) {
  const { homePortal, roleLabel } = useAuth()

  return (
    <div className="card">
      <EmptyState
        icon={<ShieldAlert className="size-8 text-amber-500" strokeWidth={1.5} />}
        title="You do not have access to this screen"
        description={`${reason} You are signed in as ${roleLabel}. Ask a Super Admin to grant the role you need, or go back to a screen you can use.`}
        action={
          homePortal && (
            <a href={portalHome(homePortal)}>
              <Button variant="secondary">Back to my dashboard</Button>
            </a>
          )
        }
      />
    </div>
  )
}
