import type { RoleId, StaffUser } from '@/types'
import type { Permission } from './permissions'
import { ROLES, type PortalId } from './roles'

/** Union of every permission granted by the roles a user holds. */
export function permissionsFor(roleIds: RoleId[]): Set<Permission> {
  const granted = new Set<Permission>()
  for (const roleId of roleIds) {
    for (const permission of ROLES[roleId]?.permissions ?? []) {
      granted.add(permission)
    }
  }
  return granted
}

/** Union of every portal the user's roles can reach. */
export function portalsFor(roleIds: RoleId[]): PortalId[] {
  const portals = new Set<PortalId>()
  for (const roleId of roleIds) {
    for (const portal of ROLES[roleId]?.portals ?? []) {
      portals.add(portal)
    }
  }
  return [...portals]
}

/** Portal the user lands on after login — the first role's home portal. */
export function homePortalFor(roleIds: RoleId[]): PortalId {
  return ROLES[roleIds[0]]?.homePortal ?? 'department'
}

/**
 * Grant check used by `useCan`, `<Can>` and the route guards.
 * `required` is OR-semantics: any one of the listed permissions is enough,
 * which matches how screens are gated (a screen is visible if the user can
 * do *anything* on it).
 */
export function hasPermission(
  granted: Set<Permission>,
  required: Permission | Permission[] | undefined,
): boolean {
  if (!required) return true
  const list = Array.isArray(required) ? required : [required]
  return list.some((permission) => granted.has(permission))
}

export function roleNames(roleIds: RoleId[]): string {
  return roleIds.map((id) => ROLES[id]?.name ?? id).join(' · ')
}

/** Ref. 65 — the Super Admin monitoring view lists holders of critical roles. */
export function holdsCriticalRole(user: Pick<StaffUser, 'roleIds'>): boolean {
  return user.roleIds.some((id) => ROLES[id]?.critical)
}
