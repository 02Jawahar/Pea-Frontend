import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'

import { STORAGE_KEYS } from '@/constants/storage'
import type { Permission } from '@/rbac/permissions'
import {
  hasPermission,
  homePortalFor,
  permissionsFor,
  portalsFor,
  roleNames,
} from '@/rbac/access'
import type { PortalId } from '@/rbac/roles'
import { seed } from '@/mock/api'
import type { Candidate, RoleId, StaffUser } from '@/types'
import { storage } from '@/utils/storage'

/**
 * Two separate identities, per 00-README.md:
 * "Candidate is outside the role system entirely — separate auth, separate
 * session store, separate route tree."
 */
export interface StaffSession {
  kind: 'staff'
  user: StaffUser
}

export interface CandidateSession {
  kind: 'candidate'
  candidate: Candidate
}

export type Session = StaffSession | CandidateSession

export interface AuthContextValue {
  session: Session | null
  isAuthenticated: boolean
  /** Staff user, or null when signed out or signed in as a candidate. */
  staff: StaffUser | null
  candidate: Candidate | null
  roleIds: RoleId[]
  roleLabel: string
  portals: PortalId[]
  homePortal: PortalId | null
  can: (required?: Permission | Permission[]) => boolean
  canAccessPortal: (portal: PortalId) => boolean
  loginAsStaff: (employeeId: string) => StaffUser | null
  loginAsCandidate: (mobileOrReg: string) => Candidate | null
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // localStorage is synchronous, so the session rehydrates during the first
  // render rather than in an effect — no flash of the signed-out shell.
  const [session, setSession] = useState<Session | null>(() =>
    storage.get<Session>(STORAGE_KEYS.USER),
  )

  const loginAsStaff = useCallback((employeeId: string) => {
    const user = seed.staffUsers.find(
      (candidate) =>
        candidate.employeeId.toLowerCase() === employeeId.trim().toLowerCase() ||
        candidate.email.toLowerCase() === employeeId.trim().toLowerCase() ||
        candidate.mobile === employeeId.trim(),
    )
    if (!user || !user.isActive) return null

    const next: Session = { kind: 'staff', user }
    storage.set(STORAGE_KEYS.USER, next)
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, `demo-staff-${user.id}`)
    setSession(next)
    return user
  }, [])

  const loginAsCandidate = useCallback((mobileOrReg: string) => {
    const value = mobileOrReg.trim().toLowerCase()
    const found =
      seed.candidates.find(
        (candidate) =>
          candidate.mobile === value ||
          candidate.registrationNo.toLowerCase() === value ||
          candidate.email.toLowerCase() === value,
      ) ?? seed.candidates.find((candidate) => candidate.id === seed.DEMO_CANDIDATE_ID)!

    const next: Session = { kind: 'candidate', candidate: found }
    storage.set(STORAGE_KEYS.USER, next)
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, `demo-candidate-${found.id}`)
    setSession(next)
    return found
  }, [])

  const logout = useCallback(() => {
    storage.remove(STORAGE_KEYS.USER)
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    const staff = session?.kind === 'staff' ? session.user : null
    const candidate = session?.kind === 'candidate' ? session.candidate : null
    const roleIds = staff?.roleIds ?? []
    const granted = permissionsFor(roleIds)
    const portals = staff ? portalsFor(roleIds) : candidate ? (['candidate'] as PortalId[]) : []

    return {
      session,
      isAuthenticated: Boolean(session),
      staff,
      candidate,
      roleIds,
      roleLabel: staff ? roleNames(roleIds) : candidate ? 'Candidate' : '',
      portals,
      homePortal: staff ? homePortalFor(roleIds) : candidate ? 'candidate' : null,
      can: (required) => (staff ? hasPermission(granted, required) : false),
      canAccessPortal: (portal) => portals.includes(portal),
      loginAsStaff,
      loginAsCandidate,
      logout,
    }
  }, [session, loginAsStaff, loginAsCandidate, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
