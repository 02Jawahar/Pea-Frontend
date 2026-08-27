import { Info, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import { Banner, Button, Card, Tabs } from '@/components/common/primitives'
import { useAuth } from '@/hooks/useAuth'
import { seed } from '@/mock/api'
import { PERMISSIONS, type Permission } from '@/rbac/permissions'
import { ROLE_FAMILIES, ROLE_LIST, type RoleFamily } from '@/rbac/roles'
import { cn } from '@/utils/cn'

/**
 * Ref. 65 — role management.
 *
 * The matrix editor is roles as rows, features as columns, with cells for the
 * actions each role can take. It reads directly from `src/rbac/roles.ts`, so
 * what you see here is exactly what gates the routes and the buttons.
 */

/** Permissions grouped into the "features" the matrix is columned by. */
const FEATURE_GROUPS: { feature: string; permissions: Permission[] }[] = [
  { feature: 'Post & Vacancy', permissions: ['post.view', 'post.edit', 'vacancy.view', 'vacancy.edit'] },
  { feature: 'Criteria & Reservation', permissions: ['criteria.view', 'criteria.edit', 'reservation.view', 'reservation.edit'] },
  { feature: 'Requisition', permissions: ['requisition.view', 'requisition.create', 'requisition.approve', 'requisition.sign', 'finance.concur'] },
  { feature: 'Scrutiny & Shortlisting', permissions: ['scrutiny.view', 'scrutiny.decide', 'shortlist.approve'] },
  { feature: 'Notification', permissions: ['notification.view', 'notification.draft', 'notification.approve', 'notification.publish'] },
  { feature: 'Exam Operations', permissions: ['exam.view', 'exam.create', 'exam.edit', 'centre.view', 'centre.edit', 'centre.allocate', 'seating.view', 'seating.generate'] },
  { feature: 'Functionaries & Admit Cards', permissions: ['functionary.view', 'functionary.assign', 'functionary.pay', 'admitcard.view', 'admitcard.generate'] },
  { feature: 'Exam Day', permissions: ['attendance.view', 'attendance.capture', 'monitoring.view', 'malpractice.record', 'paper.view', 'paper.manage'] },
  { feature: 'Evaluation', permissions: ['evaluation.view', 'evaluation.score', 'evaluation.moderate', 'evaluation.reevaluate', 'evaluation.complete', 'evaluator.manage'] },
  { feature: 'Answer Key & OMR', permissions: ['answerkey.view', 'answerkey.publish', 'objection.adjudicate', 'omr.process', 'normalization.apply', 'marks.consolidate'] },
  { feature: 'Merit & Selection', permissions: ['merit.view', 'merit.generate', 'merit.approve', 'selection.view', 'selection.generate', 'selection.publish', 'appointment.generate'] },
  { feature: 'Reports', permissions: ['report.view', 'report.export', 'report.schedule', 'report.request'] },
  { feature: 'Grievance', permissions: ['ticket.view', 'ticket.handle', 'ticket.assign', 'ticket.forcerelease'] },
  { feature: 'Administration', permissions: ['user.view', 'user.create', 'user.deactivate', 'role.view', 'role.edit', 'hierarchy.view', 'hierarchy.edit', 'feature.configure', 'feature.release', 'master.view', 'master.edit'] },
  { feature: 'Security & Platform', permissions: ['integration.view', 'integration.configure', 'reconciliation.view', 'audit.view', 'security.verify', 'backup.manage', 'migration.run'] },
]

const FAMILY_GRANTS: Record<RoleFamily, string> = {
  'Admin Roles':
    'Create / modify / deactivate / activate users; change system configurations and task movement.',
  'Employee/Staff Roles': 'View staff data and requisition details; submit grievances and complaints.',
  'Feature Roles':
    'Perform feature tasks pertaining to recruitment of posts; perform the tasks of the section.',
  'Reports Roles':
    'View and download reports; submit requirements for new reports useful in decision making.',
}

type TabId = 'matrix' | 'families' | 'critical'

export default function RoleManagement() {
  const [tab, setTab] = useState<TabId>('matrix')
  const [feature, setFeature] = useState(FEATURE_GROUPS[0].feature)
  const { can } = useAuth()

  const group = FEATURE_GROUPS.find((item) => item.feature === feature)!

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Role &amp; Permissions</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          {ROLE_LIST.length} roles across four families, covering {PERMISSIONS.length} permissions.
        </p>
      </div>

      <Banner tone="info" icon={<Info className="size-4" />} title="This matrix is the live gate">
        These grants are what the application actually enforces — they hide navigation entries,
        block routes and disable action buttons. Changing a cell changes behaviour everywhere at
        once. Changes are versioned and audit-logged.
      </Banner>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'matrix', label: 'Permission matrix' },
          { id: 'families', label: 'Role families', count: ROLE_FAMILIES.length },
          {
            id: 'critical',
            label: 'Critical roles',
            count: ROLE_LIST.filter((role) => role.critical).length,
          },
        ]}
      />

      {tab === 'matrix' && (
        <Card
          title="Roles × Permissions"
          action={
            <select
              aria-label="Select feature"
              value={feature}
              onChange={(event) => setFeature(event.target.value)}
              className="field-input w-auto py-1 text-[13px]"
            >
              {FEATURE_GROUPS.map((item) => (
                <option key={item.feature}>{item.feature}</option>
              ))}
            </select>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  <th className="sticky left-0 z-10 bg-grey-050 px-4 py-2.5 text-left text-[12px] font-semibold uppercase">
                    Role
                  </th>
                  {group.permissions.map((permission) => (
                    <th
                      key={permission}
                      className="px-2 py-2.5 text-center text-[11px] font-semibold whitespace-nowrap text-grey-700"
                    >
                      {permission.split('.')[1]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLE_LIST.map((role) => (
                  <tr key={role.id} className="border-b border-grey-200 last:border-b-0">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-white px-4 py-2 text-left"
                    >
                      <span className="flex items-center gap-1.5 text-[13px] font-medium text-navy-900">
                        {role.name}
                        {role.critical && (
                          <ShieldAlert
                            className="size-3.5 text-amber-500"
                            aria-label="Critical role"
                          />
                        )}
                      </span>
                      <span className="text-[11px] text-grey-600">{role.family}</span>
                    </th>
                    {group.permissions.map((permission) => {
                      const granted = role.permissions.includes(permission)
                      return (
                        <td key={permission} className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={granted}
                            readOnly={!can('role.edit')}
                            onChange={() => undefined}
                            aria-label={`${role.name} — ${permission}`}
                            className={cn('size-4', !can('role.edit') && 'cursor-not-allowed')}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'families' && (
        <div className="grid gap-3 lg:grid-cols-2">
          {ROLE_FAMILIES.map((family) => (
            <Card key={family} title={family}>
              <p className="text-[13px] text-grey-600">{FAMILY_GRANTS[family]}</p>
              <ul className="mt-3 divide-y divide-grey-200 rounded-md border border-grey-200">
                {ROLE_LIST.filter((role) => role.family === family).map((role) => (
                  <li key={role.id} className="px-3 py-2.5">
                    <p className="flex items-center gap-1.5 text-[13px] font-medium text-navy-900">
                      {role.name}
                      {role.critical && (
                        <span className="rounded bg-amber-050 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500 uppercase">
                          Critical
                        </span>
                      )}
                    </p>
                    <p className="text-[12px] text-grey-600">{role.description}</p>
                    <p className="mt-1 text-[11px] text-grey-600">
                      {role.permissions.length} permissions · portals: {role.portals.join(', ')}
                    </p>
                  </li>
                ))}
              </ul>

              {family === 'Reports Roles' && (
                <Banner tone="neutral" className="mt-3">
                  Reports Roles include a <strong>request a new report</strong> capability. That
                  request form routes to the Super Admin.
                  <Button variant="secondary" size="sm" className="mt-2">
                    Open new-report request form
                  </Button>
                </Banner>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === 'critical' && (
        <Card title="Users holding critical roles" bodyClassName="p-0">
          <p className="border-b border-grey-200 px-4 py-3 text-[13px] text-grey-600">
            Super Admin monitors who holds a critical role, when it was granted, by whom, and their
            recent activity (Ref. 65). Roles are marked critical in the role definition, so this
            list is data-driven rather than hand-maintained.
          </p>
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey-200 bg-grey-050">
                {['User', 'Employee ID', 'Critical role', 'Granted', 'Last sign-in', 'Recent activity'].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-2 text-left text-[12px] font-semibold uppercase"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {seed.staffUsers
                .filter((user) => user.roleIds.some((id) => ROLE_LIST.find((role) => role.id === id)?.critical))
                .map((user) => {
                  const criticalRoles = user.roleIds
                    .map((id) => ROLE_LIST.find((role) => role.id === id))
                    .filter((role) => role?.critical)
                  const activity = seed.auditEvents.find((event) => event.actor === user.name)
                  return (
                    <tr key={user.id} className="border-b border-grey-200 last:border-b-0">
                      <td className="data-cell font-medium">{user.name}</td>
                      <td className="data-cell font-mono text-[12px]">{user.employeeId}</td>
                      <td className="data-cell">
                        <span className="inline-flex items-center gap-1 text-amber-500">
                          <ShieldCheck className="size-3.5" />
                          {criticalRoles.map((role) => role?.name).join(', ')}
                        </span>
                      </td>
                      <td className="data-cell">{user.createdAt}</td>
                      <td className="data-cell">{user.lastLoginAt ?? '—'}</td>
                      <td className="data-cell text-grey-600">
                        {activity ? `${activity.action} · ${activity.timestamp}` : 'No recent activity'}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
