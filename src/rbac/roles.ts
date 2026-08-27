import type { RoleId } from '@/types'
import type { Permission } from './permissions'

/**
 * The eight portals. `PortalId` gates the route tree; `Permission` gates
 * everything inside it. A user with no permission for a portal never sees
 * its nav entry and cannot reach its routes.
 */
export type PortalId =
  | 'candidate'
  | 'department'
  | 'exam-admin'
  | 'evaluator'
  | 'admin'
  | 'invigilator'
  | 'helpdesk'
  | 'finance'

export type RoleFamily = 'Admin Roles' | 'Employee/Staff Roles' | 'Feature Roles' | 'Reports Roles'

export interface RoleDefinition {
  id: RoleId
  name: string
  family: RoleFamily
  /** Ref. 65 — Super Admin monitors users holding critical roles. */
  critical: boolean
  /** Portal the user lands on after login. */
  homePortal: PortalId
  portals: PortalId[]
  permissions: Permission[]
  description: string
}

/* Reusable permission bundles, so role rows stay readable. */

const REPORTS_READ: Permission[] = ['report.view', 'report.export']
const REPORTS_FULL: Permission[] = [...REPORTS_READ, 'report.schedule', 'report.request']

const DEPARTMENT_BASE: Permission[] = [
  'post.view',
  'vacancy.view',
  'criteria.view',
  'reservation.view',
  'requisition.view',
  'centre.view',
  'ticket.view',
  ...REPORTS_READ,
]

const EXAM_BASE: Permission[] = [
  'exam.view',
  'centre.view',
  'seating.view',
  'functionary.view',
  'admitcard.view',
  'attendance.view',
  'monitoring.view',
  'notification.view',
  ...REPORTS_READ,
]

const EVALUATION_BASE: Permission[] = ['evaluation.view', 'answerkey.view', ...REPORTS_READ]

export const ROLES: Record<RoleId, RoleDefinition> = {
  'super-admin': {
    id: 'super-admin',
    name: 'Super Admin',
    family: 'Admin Roles',
    critical: true,
    homePortal: 'admin',
    portals: [
      'admin',
      'department',
      'exam-admin',
      'evaluator',
      'helpdesk',
      'invigilator',
      'finance',
    ],
    description:
      'Controls all roles, monitors users holding critical roles, authenticates feature releases (Ref. 65, 69).',
    permissions: [
      'user.view',
      'user.create',
      'user.deactivate',
      'role.view',
      'role.edit',
      'hierarchy.view',
      'hierarchy.edit',
      'feature.configure',
      'feature.release',
      'master.view',
      'master.edit',
      'integration.view',
      'integration.configure',
      'reconciliation.view',
      'audit.view',
      'security.verify',
      'backup.manage',
      'migration.run',
      'ticket.view',
      'ticket.assign',
      'ticket.forcerelease',
      'notification.view',
      'exam.view',
      'centre.view',
      'evaluation.view',
      'merit.view',
      'selection.view',
      'requisition.view',
      ...REPORTS_FULL,
    ],
  },

  'system-admin': {
    id: 'system-admin',
    name: 'System Admin',
    family: 'Admin Roles',
    critical: true,
    homePortal: 'admin',
    portals: ['admin', 'exam-admin'],
    description: 'Creates and deactivates users, maintains master data and integrations (Ref. 63).',
    permissions: [
      'user.view',
      'user.create',
      'user.deactivate',
      'role.view',
      'hierarchy.view',
      'master.view',
      'master.edit',
      'integration.view',
      'audit.view',
      'exam.view',
      'centre.view',
      ...REPORTS_READ,
    ],
  },

  'department-officer': {
    id: 'department-officer',
    name: 'Department Officer',
    family: 'Employee/Staff Roles',
    critical: false,
    homePortal: 'department',
    portals: ['department'],
    description:
      'Maintains the post master, enters vacancies, builds criteria and raises requisitions (Ref. 1–11).',
    permissions: [
      ...DEPARTMENT_BASE,
      'post.edit',
      'vacancy.edit',
      'criteria.edit',
      'reservation.edit',
      'requisition.create',
      'scrutiny.view',
      'scrutiny.decide',
    ],
  },

  'nodal-officer': {
    id: 'nodal-officer',
    name: 'Nodal Officer',
    family: 'Employee/Staff Roles',
    critical: false,
    homePortal: 'department',
    portals: ['department'],
    description: 'Authorised departmental contact for a requisition (Ref. 16).',
    permissions: [...DEPARTMENT_BASE, 'requisition.create', 'scrutiny.view'],
  },

  'hod-approver': {
    id: 'hod-approver',
    name: 'HoD Approver',
    family: 'Employee/Staff Roles',
    critical: true,
    homePortal: 'department',
    portals: ['department'],
    description:
      'Approves requisitions at their level in the office hierarchy; every approval is digitally signed (Ref. 12).',
    permissions: [
      ...DEPARTMENT_BASE,
      'requisition.approve',
      'requisition.sign',
      'shortlist.approve',
      'scrutiny.view',
    ],
  },

  'finance-concurrence': {
    id: 'finance-concurrence',
    name: 'Finance Concurrence',
    family: 'Employee/Staff Roles',
    critical: false,
    homePortal: 'finance',
    portals: ['finance'],
    description: 'Concurs on filling posts by direct recruitment (Ref. 15).',
    permissions: ['requisition.view', 'finance.concur', ...REPORTS_READ],
  },

  'exam-officer': {
    id: 'exam-officer',
    name: 'Exam Officer',
    family: 'Feature Roles',
    critical: true,
    homePortal: 'exam-admin',
    portals: ['exam-admin'],
    description:
      'Runs notification, centres, seating, exam conduct and admit cards (Ref. 18–50).',
    permissions: [
      ...EXAM_BASE,
      'exam.create',
      'exam.edit',
      'centre.edit',
      'centre.allocate',
      'seating.generate',
      'functionary.assign',
      'functionary.pay',
      'paper.view',
      'paper.manage',
      'admitcard.generate',
      'malpractice.record',
      'notification.draft',
      'notification.approve',
      'notification.publish',
      'requisition.view',
      'scrutiny.view',
      ...REPORTS_FULL,
    ],
  },

  'merit-officer': {
    id: 'merit-officer',
    name: 'Merit Officer',
    family: 'Feature Roles',
    critical: true,
    homePortal: 'exam-admin',
    portals: ['exam-admin'],
    description:
      'Generates merit lists, applies tie-breaker rules and publishes results (Ref. 56–62).',
    permissions: [
      'exam.view',
      'merit.view',
      'merit.generate',
      'merit.approve',
      'selection.view',
      'selection.generate',
      'selection.publish',
      'appointment.generate',
      'evaluation.view',
      ...REPORTS_FULL,
    ],
  },

  evaluator: {
    id: 'evaluator',
    name: 'Evaluator',
    family: 'Feature Roles',
    critical: false,
    homePortal: 'evaluator',
    portals: ['evaluator'],
    description: 'Evaluates assigned answer scripts and awards marks (Ref. 53, 54).',
    permissions: [...EVALUATION_BASE, 'evaluation.score'],
  },

  moderator: {
    id: 'moderator',
    name: 'Moderator',
    family: 'Feature Roles',
    critical: false,
    homePortal: 'evaluator',
    portals: ['evaluator'],
    description: 'Moderates a sample of evaluated scripts and handles re-evaluation.',
    permissions: [
      ...EVALUATION_BASE,
      'evaluation.score',
      'evaluation.moderate',
      'evaluation.reevaluate',
    ],
  },

  'evaluation-admin': {
    id: 'evaluation-admin',
    name: 'Evaluation Admin',
    family: 'Feature Roles',
    critical: true,
    homePortal: 'evaluator',
    portals: ['evaluator'],
    description:
      'Owns OMR processing, answer keys, normalization, consolidation and evaluation sign-off (Ref. 51–55).',
    permissions: [
      ...EVALUATION_BASE,
      'evaluation.score',
      'evaluation.moderate',
      'evaluation.reevaluate',
      'answerkey.publish',
      'objection.adjudicate',
      'omr.process',
      'normalization.apply',
      'marks.consolidate',
      'evaluation.complete',
      'evaluator.manage',
      'merit.view',
      ...REPORTS_FULL,
    ],
  },

  'centre-supervisor': {
    id: 'centre-supervisor',
    name: 'Centre Supervisor',
    family: 'Feature Roles',
    critical: false,
    homePortal: 'invigilator',
    portals: ['invigilator'],
    description:
      'Supervises an exam centre; sees hall-wise candidate counts and the exception queue (Ref. 44).',
    permissions: [
      'attendance.view',
      'attendance.capture',
      'seating.view',
      'monitoring.view',
      'functionary.view',
      'malpractice.record',
      ...REPORTS_READ,
    ],
  },

  invigilator: {
    id: 'invigilator',
    name: 'Invigilator',
    family: 'Feature Roles',
    critical: false,
    homePortal: 'invigilator',
    portals: ['invigilator'],
    description: 'Captures hall attendance and reports malpractice (Ref. 47, 48, 50).',
    permissions: ['attendance.view', 'attendance.capture', 'seating.view', 'malpractice.record'],
  },

  'helpdesk-agent': {
    id: 'helpdesk-agent',
    name: 'Helpdesk Agent',
    family: 'Feature Roles',
    critical: false,
    homePortal: 'helpdesk',
    portals: ['helpdesk'],
    description: 'Triages, locks and resolves grievance tickets (Ref. 83–88).',
    permissions: ['ticket.view', 'ticket.handle', 'ticket.assign', ...REPORTS_READ],
  },

  'reports-officer': {
    id: 'reports-officer',
    name: 'Reports Officer',
    family: 'Reports Roles',
    critical: false,
    homePortal: 'exam-admin',
    portals: ['exam-admin', 'department'],
    description:
      'Views and downloads reports and submits requirements for new reports (Ref. 65).',
    permissions: [
      'exam.view',
      'merit.view',
      'evaluation.view',
      'requisition.view',
      'notification.view',
      ...REPORTS_FULL,
    ],
  },

  'analytics-viewer': {
    id: 'analytics-viewer',
    name: 'Analytics Viewer',
    family: 'Reports Roles',
    critical: false,
    homePortal: 'exam-admin',
    portals: ['exam-admin'],
    description: 'Read-only MIS access across portals.',
    permissions: ['exam.view', 'notification.view', ...REPORTS_READ],
  },
}

export const ROLE_LIST = Object.values(ROLES)

export const ROLE_FAMILIES: RoleFamily[] = [
  'Admin Roles',
  'Employee/Staff Roles',
  'Feature Roles',
  'Reports Roles',
]

export const PORTAL_LABELS: Record<PortalId, string> = {
  candidate: 'Candidate Portal',
  department: 'Department Portal',
  'exam-admin': 'Exam Admin Portal',
  evaluator: 'Evaluator Portal',
  admin: 'Admin Portal',
  invigilator: 'Centre Functionary Portal',
  helpdesk: 'Helpdesk Console',
  finance: 'Finance Concurrence',
}
