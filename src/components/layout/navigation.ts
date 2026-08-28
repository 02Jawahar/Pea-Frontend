import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Award,
  BadgeCheck,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Database,
  FileCheck2,
  FileSpreadsheet,
  FileStack,
  FileText,
  Fingerprint,
  Gauge,
  GitBranch,
  Grid3x3,
  IdCard,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Languages,
  MapPin,
  Medal,
  Monitor,
  Plug,
  ScanLine,
  ScrollText,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Ticket,
  TrendingUp,
  Trophy,
  Users,
  UserSquare2,
  Wallet,
} from 'lucide-react'

import { ROUTES } from '@/constants/routes'
import type { Permission } from '@/rbac/permissions'
import type { PortalId } from '@/rbac/roles'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  /** Hidden entirely when the user holds none of these permissions. */
  permission?: Permission | Permission[]
  end?: boolean
}

export interface NavGroup {
  /** Uppercase group label; omit for the leading Dashboard entry. */
  label?: string
  items: NavItem[]
}

/**
 * Sidebars are transcribed from the per-portal specs (which in turn come from
 * the demo deck), then permission-gated. A Department Officer never sees
 * "Create New Exam" — 03-department-portal.md Flow 7 calls this out explicitly.
 */
export const PORTAL_NAV: Record<PortalId, NavGroup[]> = {
  candidate: [
    { items: [{ label: 'Dashboard', to: ROUTES.CANDIDATE_DASHBOARD, icon: LayoutDashboard }] },
    {
      label: 'Application',
      items: [
        { label: 'Available Examinations', to: ROUTES.CANDIDATE_EXAMINATIONS, icon: ClipboardList },
        { label: 'My Applications', to: ROUTES.CANDIDATE_APPLICATIONS, icon: FileText },
        { label: 'Admit Card', to: ROUTES.CANDIDATE_ADMIT_CARD, icon: IdCard },
        { label: 'Results & Scorecard', to: ROUTES.CANDIDATE_RESULTS, icon: Trophy },
        { label: 'Answer Key Challenge', to: ROUTES.CANDIDATE_ANSWER_KEY, icon: FileCheck2 },
      ],
    },
    {
      label: 'My Profile',
      items: [
        { label: 'Profile Details', to: ROUTES.CANDIDATE_PROFILE, icon: UserSquare2 },
        { label: 'Documents', to: ROUTES.CANDIDATE_DOCUMENTS, icon: FileStack },
        { label: 'e-Dossier', to: ROUTES.CANDIDATE_DOSSIER, icon: Database },
      ],
    },
    {
      label: 'Support',
      items: [{ label: 'Grievance', to: ROUTES.CANDIDATE_GRIEVANCE, icon: LifeBuoy }],
    },
  ],

  department: [
    { items: [{ label: 'Dashboard', to: ROUTES.DEPT_DASHBOARD, icon: LayoutDashboard }] },
    {
      label: 'Post & Vacancy',
      items: [
        { label: 'Post Master', to: ROUTES.DEPT_POSTS, icon: Building2, permission: 'post.view' },
        { label: 'Vacant Positions', to: ROUTES.DEPT_VACANCIES, icon: ClipboardList, permission: 'vacancy.view' },
        { label: 'Candidate Criteria', to: ROUTES.DEPT_CRITERIA, icon: ListChecks, permission: 'criteria.view' },
        { label: 'Reservation Matrix', to: ROUTES.DEPT_MATRIX, icon: Grid3x3, permission: 'reservation.view' },
      ],
    },
    {
      label: 'Requisition',
      items: [
        { label: 'My Requisitions', to: ROUTES.DEPT_REQUISITIONS, icon: FileText, permission: 'requisition.view', end: true },
        { label: 'Create Requisition', to: ROUTES.DEPT_REQUISITION_NEW, icon: FileSpreadsheet, permission: 'requisition.create' },
      ],
    },
    {
      label: 'Recruitment',
      items: [
        { label: 'Application Scrutiny', to: ROUTES.DEPT_SCRUTINY, icon: ClipboardCheck, permission: 'scrutiny.view' },
        { label: 'Exam Centres', to: ROUTES.DEPT_CENTRES, icon: MapPin, permission: 'centre.view' },
      ],
    },
    {
      label: 'Reports',
      items: [{ label: 'Department Reports', to: ROUTES.DEPT_REPORTS, icon: BarChart3, permission: 'report.view' }],
    },
  ],

  'exam-admin': [
    { items: [{ label: 'Dashboard', to: ROUTES.EA_DASHBOARD, icon: LayoutDashboard }] },
    {
      label: 'Notification',
      items: [
        { label: 'Requisitions', to: ROUTES.EA_REQUISITIONS, icon: FileText, permission: 'requisition.view' },
        { label: 'Notifications', to: ROUTES.EA_NOTIFICATIONS, icon: Bell, permission: 'notification.view' },
      ],
    },
    {
      label: 'Exam Management',
      items: [
        { label: 'Manage Examinations', to: ROUTES.EA_EXAMS, icon: CalendarDays, permission: 'exam.view', end: true },
        { label: 'Applicant Languages', to: ROUTES.EA_LANGUAGE_MAPPING, icon: Languages, permission: 'exam.view' },
        { label: 'Exam Centres', to: ROUTES.EA_CENTRES, icon: MapPin, permission: 'centre.view' },
        { label: 'Hall & Seating', to: ROUTES.EA_SEATING, icon: Grid3x3, permission: 'seating.view' },
        { label: 'Invigilator Management', to: ROUTES.EA_FUNCTIONARIES, icon: Users, permission: 'functionary.view' },
      ],
    },
    {
      label: 'Question Paper',
      items: [{ label: 'Paper Management', to: ROUTES.EA_PAPERS, icon: FileStack, permission: 'paper.view' }],
    },
    {
      label: 'Candidate Management',
      items: [{ label: 'Admit Card Management', to: ROUTES.EA_ADMIT_CARDS, icon: IdCard, permission: 'admitcard.view' }],
    },
    {
      label: 'Examination',
      items: [
        { label: 'Live Monitoring', to: ROUTES.EA_LIVE, icon: Monitor, permission: 'monitoring.view' },
        { label: 'Attendance Sheet', to: ROUTES.EA_ATTENDANCE, icon: Fingerprint, permission: 'attendance.view' },
      ],
    },
    {
      label: 'Merit Management',
      items: [
        { label: 'Merit Dashboard', to: ROUTES.EA_MERIT, icon: Medal, permission: 'merit.view', end: true },
        { label: 'Merit Generation', to: ROUTES.EA_MERIT_GENERATE, icon: Award, permission: 'merit.generate' },
        { label: 'Selection List', to: ROUTES.EA_SELECTION, icon: Trophy, permission: 'selection.view' },
      ],
    },
    {
      label: 'Reports & Analytics',
      items: [{ label: 'Reports & Analytics', to: ROUTES.EA_REPORTS, icon: BarChart3, permission: 'report.view' }],
    },
  ],

  evaluator: [
    { items: [{ label: 'Evaluation Dashboard', to: ROUTES.EV_DASHBOARD, icon: LayoutDashboard }] },
    {
      label: 'Evaluation Management',
      items: [
        { label: 'My Batches', to: ROUTES.EV_BATCHES, icon: Layers, permission: 'evaluation.view' },
        { label: 'Answer Scripts', to: ROUTES.EV_SCRIPTS, icon: FileText, permission: 'evaluation.view', end: true },
        { label: 'Review & Moderation', to: ROUTES.EV_MODERATION, icon: ClipboardCheck, permission: 'evaluation.moderate' },
        { label: 'Evaluation Completion', to: ROUTES.EV_COMPLETION, icon: BadgeCheck, permission: 'evaluation.complete' },
      ],
    },
    {
      label: 'Answer Key',
      items: [
        { label: 'Answer Key Management', to: ROUTES.EV_ANSWER_KEY, icon: FileCheck2, permission: 'answerkey.view' },
        { label: 'Objection Handling', to: ROUTES.EV_OBJECTIONS, icon: ScrollText, permission: 'objection.adjudicate' },
      ],
    },
    {
      label: 'Processing',
      items: [
        { label: 'OMR Processing', to: ROUTES.EV_OMR, icon: ScanLine, permission: 'omr.process' },
        { label: 'Normalization', to: ROUTES.EV_NORMALIZATION, icon: SlidersHorizontal, permission: 'normalization.apply' },
      ],
    },
    {
      label: 'Reports',
      items: [{ label: 'Evaluation Reports', to: ROUTES.EV_REPORTS, icon: BarChart3, permission: 'report.view' }],
    },
  ],

  admin: [
    { items: [{ label: 'Dashboard', to: ROUTES.AD_DASHBOARD, icon: LayoutDashboard }] },
    {
      label: 'Users & Roles',
      items: [
        { label: 'User Management', to: ROUTES.AD_USERS, icon: Users, permission: 'user.view' },
        { label: 'Role & Permissions', to: ROUTES.AD_ROLES, icon: ShieldCheck, permission: 'role.view' },
        { label: 'Office Hierarchy', to: ROUTES.AD_HIERARCHY, icon: GitBranch, permission: 'hierarchy.view' },
      ],
    },
    {
      label: 'Configuration',
      items: [
        { label: 'Feature Configuration', to: ROUTES.AD_FEATURES, icon: Settings2, permission: 'feature.configure' },
        { label: 'Master Data', to: ROUTES.AD_MASTERS, icon: Database, permission: 'master.view' },
      ],
    },
    {
      label: 'Integration',
      items: [
        { label: 'Integration Console', to: ROUTES.AD_INTEGRATIONS, icon: Plug, permission: 'integration.view' },
        { label: 'Payment Reconciliation', to: ROUTES.AD_RECONCILIATION, icon: Wallet, permission: 'reconciliation.view' },
      ],
    },
    {
      label: 'Security',
      items: [
        { label: 'Audit Logs', to: ROUTES.AD_AUDIT, icon: Activity, permission: 'audit.view' },
        { label: 'Data Migration', to: ROUTES.AD_MIGRATION, icon: Database, permission: 'migration.run' },
      ],
    },
  ],

  invigilator: [
    { items: [{ label: 'Centre Dashboard', to: ROUTES.IN_DASHBOARD, icon: Gauge }] },
    {
      label: 'Exam Day',
      items: [
        { label: 'Attendance Capture', to: ROUTES.IN_ATTENDANCE, icon: Fingerprint, permission: 'attendance.capture' },
        { label: 'Seating Chart', to: ROUTES.IN_SEATING, icon: Grid3x3, permission: 'seating.view' },
      ],
    },
    {
      label: 'Documents',
      items: [{ label: 'Orders & Honorarium', to: ROUTES.IN_DOCUMENTS, icon: FileStack }],
    },
  ],

  helpdesk: [
    { items: [{ label: 'Dashboard', to: ROUTES.HD_DASHBOARD, icon: LayoutDashboard }] },
    {
      label: 'Grievance',
      items: [{ label: 'Ticket Queue', to: ROUTES.HD_QUEUE, icon: Ticket, permission: 'ticket.view', end: true }],
    },
  ],

  finance: [
    {
      label: 'Concurrence',
      items: [{ label: 'Inbox', to: ROUTES.FI_INBOX, icon: TrendingUp, permission: 'finance.concur', end: true }],
    },
  ],
}

/** Accent colour per portal — the Evaluator Portal uses purple (05 spec). */
export const PORTAL_ACCENT: Record<PortalId, 'navy' | 'purple'> = {
  candidate: 'navy',
  department: 'navy',
  'exam-admin': 'navy',
  evaluator: 'purple',
  admin: 'navy',
  invigilator: 'navy',
  helpdesk: 'navy',
  finance: 'navy',
}

export const PORTAL_SUBTITLE: Record<PortalId, string> = {
  candidate: 'Create your account and apply for Government Examinations',
  department: 'Real-time overview of examinations and activities',
  'exam-admin': 'Create, Manage and Conduct Examinations',
  evaluator: 'Evaluate Answer Scripts, Award Marks and Finalize Results',
  admin: 'Users, roles, integrations, security and migration',
  invigilator: 'Centre operations, attendance and hall readiness',
  helpdesk: 'Grievance intake, triage and redressal',
  finance: 'Concurrence for filling posts by direct recruitment',
}

export const PORTAL_TITLE: Record<PortalId, string> = {
  candidate: 'CANDIDATE PORTAL',
  department: 'DEPARTMENT DASHBOARD',
  'exam-admin': 'EXAM ADMINISTRATION',
  evaluator: 'EVALUATION',
  admin: 'ADMIN PORTAL',
  invigilator: 'CENTRE FUNCTIONARY PORTAL',
  helpdesk: 'HELPDESK CONSOLE',
  finance: 'FINANCE CONCURRENCE',
}
