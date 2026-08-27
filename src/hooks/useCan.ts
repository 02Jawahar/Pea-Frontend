import type { Permission } from '@/rbac/permissions'
import { useAuth } from './useAuth'

/** `useCan('merit.generate')` — the check every gated control uses. */
export function useCan(required?: Permission | Permission[]) {
  return useAuth().can(required)
}
