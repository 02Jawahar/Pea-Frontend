/* eslint-disable react-refresh/only-export-components -- route table, not a component module */
import { lazy } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'

import { PublicShell } from '@/components/layout/PublicShell'
import { StaffShell } from '@/components/layout/StaffShell'
import { ROUTES } from '@/constants/routes'
import {
  RedirectIfAuthenticated,
  RequireCandidate,
  RequirePermission,
  RequireStaff,
} from './guards'

/* Route-level code splitting — each screen ships as its own chunk. */

// Public
const Landing = lazy(() => import('@/pages/public/Landing'))
const NotificationDetail = lazy(() => import('@/pages/public/NotificationDetail'))
const TrackApplication = lazy(() => import('@/pages/public/TrackApplication'))
const TrackGrievance = lazy(() => import('@/pages/public/TrackGrievance'))
const StaffLogin = lazy(() => import('@/pages/public/StaffLogin'))
const CandidateLogin = lazy(() => import('@/pages/public/CandidateLogin'))
const NotFound = lazy(() => import('@/pages/public/NotFound'))

// Candidate
const CandidateDashboard = lazy(() => import('@/pages/candidate/Dashboard'))
const Register = lazy(() => import('@/pages/candidate/Register'))
const CandidateExaminations = lazy(() => import('@/pages/candidate/Examinations'))
const ApplyWizard = lazy(() => import('@/pages/candidate/ApplyWizard'))
const CandidateApplications = lazy(() => import('@/pages/candidate/Applications'))
const CandidateApplicationDetail = lazy(() => import('@/pages/candidate/ApplicationDetail'))
const CandidatePayment = lazy(() => import('@/pages/candidate/Payment'))
const CandidateAdmitCard = lazy(() => import('@/pages/candidate/AdmitCard'))
const CandidateResults = lazy(() => import('@/pages/candidate/Results'))
const AnswerKeyChallenge = lazy(() => import('@/pages/candidate/AnswerKeyChallenge'))
const CandidateProfile = lazy(() => import('@/pages/candidate/Profile'))
const CandidateDocuments = lazy(() => import('@/pages/candidate/Documents'))
const CandidateEDossier = lazy(() => import('@/pages/candidate/EDossier'))
const CandidateGrievance = lazy(() => import('@/pages/candidate/Grievance'))

// Exam delivery
const ExamEntry = lazy(() => import('@/pages/exam/Entry'))
const ExamInstructions = lazy(() => import('@/pages/exam/Instructions'))
const ExamLive = lazy(() => import('@/pages/exam/Live'))
const ExamSubmitted = lazy(() => import('@/pages/exam/Submitted'))

// Department
const DepartmentDashboard = lazy(() => import('@/pages/department/Dashboard'))
const PostMaster = lazy(() => import('@/pages/department/PostMaster'))
const DepartmentVacancies = lazy(() => import('@/pages/department/Vacancies'))
const CandidateCriteria = lazy(() => import('@/pages/department/Criteria'))
const ReservationMatrix = lazy(() => import('@/pages/department/ReservationMatrix'))
const DepartmentRequisitions = lazy(() => import('@/pages/department/Requisitions'))
const RequisitionWizard = lazy(() => import('@/pages/department/RequisitionWizard'))
const RequisitionDetail = lazy(() => import('@/pages/department/RequisitionDetail'))
const ApplicationScrutiny = lazy(() => import('@/pages/department/Scrutiny'))
const DepartmentCentres = lazy(() => import('@/pages/department/Centres'))
const DepartmentReports = lazy(() => import('@/pages/department/Reports'))

// Exam admin
const ExamAdminDashboard = lazy(() => import('@/pages/examAdmin/Dashboard'))
const ExamAdminRequisitions = lazy(() => import('@/pages/examAdmin/Requisitions'))
const ExamAdminNotifications = lazy(() => import('@/pages/examAdmin/Notifications'))
const NotificationPublish = lazy(() => import('@/pages/examAdmin/NotificationPublish'))
const ManageExaminations = lazy(() => import('@/pages/examAdmin/Exams'))
const ExamDetail = lazy(() => import('@/pages/examAdmin/ExamDetail'))
const ApplicantLanguageMapping = lazy(() => import('@/pages/examAdmin/LanguageMapping'))
const ExamCentres = lazy(() => import('@/pages/examAdmin/Centres'))
const SeatingChart = lazy(() => import('@/pages/examAdmin/Seating'))
const FunctionaryManagement = lazy(() => import('@/pages/examAdmin/Functionaries'))
const AdmitCardManagement = lazy(() => import('@/pages/examAdmin/AdmitCards'))
const PaperManagement = lazy(() => import('@/pages/examAdmin/Papers'))
const LiveMonitoring = lazy(() => import('@/pages/examAdmin/LiveMonitoring'))
const ExamAdminAttendance = lazy(() => import('@/pages/examAdmin/Attendance'))
const MeritDashboard = lazy(() => import('@/pages/examAdmin/MeritDashboard'))
const MeritGenerate = lazy(() => import('@/pages/examAdmin/MeritGenerate'))
const MeritListDetail = lazy(() => import('@/pages/examAdmin/MeritListDetail'))
const SelectionList = lazy(() => import('@/pages/examAdmin/Selection'))
const ExamAdminReports = lazy(() => import('@/pages/examAdmin/Reports'))

// Evaluator
const EvaluatorDashboard = lazy(() => import('@/pages/evaluator/Dashboard'))
const EvaluationBatches = lazy(() => import('@/pages/evaluator/Batches'))
const AnswerScripts = lazy(() => import('@/pages/evaluator/Scripts'))
const ScriptWorkspace = lazy(() => import('@/pages/evaluator/ScriptWorkspace'))
const AnswerKeyManagement = lazy(() => import('@/pages/evaluator/AnswerKey'))
const ObjectionHandling = lazy(() => import('@/pages/evaluator/Objections'))
const OmrProcessing = lazy(() => import('@/pages/evaluator/Omr'))
const NormalizationScreen = lazy(() => import('@/pages/evaluator/Normalization'))
const ModerationScreen = lazy(() => import('@/pages/evaluator/Moderation'))
const EvaluationCompletion = lazy(() => import('@/pages/evaluator/Completion'))
const EvaluationReports = lazy(() => import('@/pages/evaluator/Reports'))

// Admin
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const UserManagement = lazy(() => import('@/pages/admin/Users'))
const RoleManagement = lazy(() => import('@/pages/admin/Roles'))
const OfficeHierarchy = lazy(() => import('@/pages/admin/Hierarchy'))
const FeatureConfiguration = lazy(() => import('@/pages/admin/Features'))
const MasterData = lazy(() => import('@/pages/admin/Masters'))
const IntegrationConsole = lazy(() => import('@/pages/admin/Integrations'))
const PaymentReconciliation = lazy(() => import('@/pages/admin/Reconciliation'))
const AuditLogs = lazy(() => import('@/pages/admin/Audit'))
const DataMigration = lazy(() => import('@/pages/admin/Migration'))

// Centre functionary
const InvigilatorDashboard = lazy(() => import('@/pages/invigilator/Dashboard'))
const InvigilatorAttendance = lazy(() => import('@/pages/invigilator/Attendance'))
const InvigilatorSeating = lazy(() => import('@/pages/invigilator/Seating'))
const InvigilatorDocuments = lazy(() => import('@/pages/invigilator/Documents'))

// Helpdesk
const HelpdeskDashboard = lazy(() => import('@/pages/helpdesk/Dashboard'))
const TicketQueue = lazy(() => import('@/pages/helpdesk/Queue'))
const TicketDetail = lazy(() => import('@/pages/helpdesk/TicketDetail'))

// Finance
const FinanceInbox = lazy(() => import('@/pages/finance/Inbox'))
const FinanceRequestDetail = lazy(() => import('@/pages/finance/RequestDetail'))

export const router = createBrowserRouter([
  /* -------------------- Public (Shell A, no sidebar) -------------------- */
  {
    element: <PublicShell />,
    children: [
      { path: ROUTES.HOME, element: <Landing /> },
      { path: ROUTES.NOTIFICATION(), element: <NotificationDetail /> },
      { path: ROUTES.TRACK_APPLICATION, element: <TrackApplication /> },
      { path: ROUTES.TRACK_GRIEVANCE, element: <TrackGrievance /> },
      {
        element: <RedirectIfAuthenticated />,
        children: [
          { path: ROUTES.CANDIDATE_LOGIN, element: <CandidateLogin /> },
          { path: ROUTES.REGISTER, element: <Register /> },
        ],
      },
    ],
  },

  /* Staff login uses its own full-page layout. */
  {
    element: <RedirectIfAuthenticated />,
    children: [{ path: ROUTES.LOGIN, element: <StaffLogin /> }],
  },

  /* ------------------ Candidate (Shell A, with sidebar) ----------------- */
  {
    element: <RequireCandidate />,
    children: [
      {
        element: <PublicShell withSidebar title="CANDIDATE PORTAL" subtitle="Apply, track and download" />,
        children: [
          { path: ROUTES.CANDIDATE, element: <Navigate to={ROUTES.CANDIDATE_DASHBOARD} replace /> },
          { path: ROUTES.CANDIDATE_DASHBOARD, element: <CandidateDashboard /> },
          { path: ROUTES.CANDIDATE_EXAMINATIONS, element: <CandidateExaminations /> },
          { path: ROUTES.CANDIDATE_APPLY(), element: <ApplyWizard /> },
          { path: ROUTES.CANDIDATE_APPLICATIONS, element: <CandidateApplications /> },
          { path: ROUTES.CANDIDATE_APPLICATION(), element: <CandidateApplicationDetail /> },
          { path: ROUTES.CANDIDATE_PAY(), element: <CandidatePayment /> },
          { path: ROUTES.CANDIDATE_ADMIT_CARD, element: <CandidateAdmitCard /> },
          { path: ROUTES.CANDIDATE_RESULTS, element: <CandidateResults /> },
          { path: ROUTES.CANDIDATE_ANSWER_KEY, element: <AnswerKeyChallenge /> },
          { path: ROUTES.CANDIDATE_PROFILE, element: <CandidateProfile /> },
          { path: ROUTES.CANDIDATE_DOCUMENTS, element: <CandidateDocuments /> },
          { path: ROUTES.CANDIDATE_DOSSIER, element: <CandidateEDossier /> },
          { path: ROUTES.CANDIDATE_GRIEVANCE, element: <CandidateGrievance /> },
        ],
      },
    ],
  },

  /* -------------- Exam delivery (Shell C — locked kiosk) ---------------- */
  { path: ROUTES.EXAM_ENTRY, element: <ExamEntry /> },
  { path: ROUTES.EXAM_INSTRUCTIONS, element: <ExamInstructions /> },
  { path: ROUTES.EXAM_LIVE, element: <ExamLive /> },
  { path: ROUTES.EXAM_SUBMITTED, element: <ExamSubmitted /> },

  /* ------------------------- Department (Shell B) ----------------------- */
  {
    element: <RequireStaff portal="department" />,
    children: [
      {
        element: <StaffShell portal="department" />,
        children: [
          { path: ROUTES.DEPARTMENT, element: <Navigate to={ROUTES.DEPT_DASHBOARD} replace /> },
          { path: ROUTES.DEPT_DASHBOARD, element: <DepartmentDashboard /> },
          {
            element: <RequirePermission permission="post.view" />,
            children: [{ path: ROUTES.DEPT_POSTS, element: <PostMaster /> }],
          },
          {
            element: <RequirePermission permission="vacancy.view" />,
            children: [{ path: ROUTES.DEPT_VACANCIES, element: <DepartmentVacancies /> }],
          },
          {
            element: <RequirePermission permission="criteria.view" />,
            children: [{ path: ROUTES.DEPT_CRITERIA, element: <CandidateCriteria /> }],
          },
          {
            element: <RequirePermission permission="reservation.view" />,
            children: [{ path: ROUTES.DEPT_MATRIX, element: <ReservationMatrix /> }],
          },
          {
            element: <RequirePermission permission="requisition.view" />,
            children: [
              { path: ROUTES.DEPT_REQUISITIONS, element: <DepartmentRequisitions /> },
              { path: ROUTES.DEPT_REQUISITION(), element: <RequisitionDetail /> },
            ],
          },
          {
            element: <RequirePermission permission="requisition.create" />,
            children: [{ path: ROUTES.DEPT_REQUISITION_NEW, element: <RequisitionWizard /> }],
          },
          {
            element: <RequirePermission permission="scrutiny.view" />,
            children: [{ path: ROUTES.DEPT_SCRUTINY, element: <ApplicationScrutiny /> }],
          },
          {
            element: <RequirePermission permission="centre.view" />,
            children: [{ path: ROUTES.DEPT_CENTRES, element: <DepartmentCentres /> }],
          },
          {
            element: <RequirePermission permission="report.view" />,
            children: [{ path: ROUTES.DEPT_REPORTS, element: <DepartmentReports /> }],
          },
        ],
      },
    ],
  },

  /* ------------------------- Exam admin (Shell B) ----------------------- */
  {
    element: <RequireStaff portal="exam-admin" />,
    children: [
      {
        element: <StaffShell portal="exam-admin" />,
        children: [
          { path: ROUTES.EXAM_ADMIN, element: <Navigate to={ROUTES.EA_DASHBOARD} replace /> },
          { path: ROUTES.EA_DASHBOARD, element: <ExamAdminDashboard /> },
          {
            element: <RequirePermission permission="requisition.view" />,
            children: [{ path: ROUTES.EA_REQUISITIONS, element: <ExamAdminRequisitions /> }],
          },
          {
            element: <RequirePermission permission="notification.view" />,
            children: [
              { path: ROUTES.EA_NOTIFICATIONS, element: <ExamAdminNotifications /> },
              { path: ROUTES.EA_NOTIFICATION_PUBLISH(), element: <NotificationPublish /> },
            ],
          },
          {
            element: <RequirePermission permission="exam.view" />,
            children: [
              { path: ROUTES.EA_EXAMS, element: <ManageExaminations /> },
              { path: ROUTES.EA_EXAM(), element: <ExamDetail /> },
              { path: ROUTES.EA_LANGUAGE_MAPPING, element: <ApplicantLanguageMapping /> },
            ],
          },
          {
            element: <RequirePermission permission="centre.view" />,
            children: [{ path: ROUTES.EA_CENTRES, element: <ExamCentres /> }],
          },
          {
            element: <RequirePermission permission="seating.view" />,
            children: [{ path: ROUTES.EA_SEATING, element: <SeatingChart /> }],
          },
          {
            element: <RequirePermission permission="functionary.view" />,
            children: [{ path: ROUTES.EA_FUNCTIONARIES, element: <FunctionaryManagement /> }],
          },
          {
            element: <RequirePermission permission="admitcard.view" />,
            children: [{ path: ROUTES.EA_ADMIT_CARDS, element: <AdmitCardManagement /> }],
          },
          {
            element: <RequirePermission permission="paper.view" />,
            children: [{ path: ROUTES.EA_PAPERS, element: <PaperManagement /> }],
          },
          {
            element: <RequirePermission permission="monitoring.view" />,
            children: [{ path: ROUTES.EA_LIVE, element: <LiveMonitoring /> }],
          },
          {
            element: <RequirePermission permission="attendance.view" />,
            children: [{ path: ROUTES.EA_ATTENDANCE, element: <ExamAdminAttendance /> }],
          },
          {
            element: <RequirePermission permission="merit.view" />,
            children: [
              { path: ROUTES.EA_MERIT, element: <MeritDashboard /> },
              { path: ROUTES.EA_MERIT_LIST(), element: <MeritListDetail /> },
            ],
          },
          {
            element: <RequirePermission permission="merit.generate" />,
            children: [{ path: ROUTES.EA_MERIT_GENERATE, element: <MeritGenerate /> }],
          },
          {
            element: <RequirePermission permission="selection.view" />,
            children: [{ path: ROUTES.EA_SELECTION, element: <SelectionList /> }],
          },
          {
            element: <RequirePermission permission="report.view" />,
            children: [{ path: ROUTES.EA_REPORTS, element: <ExamAdminReports /> }],
          },
        ],
      },
    ],
  },

  /* -------------------- Evaluator (Shell B, purple) --------------------- */
  {
    element: <RequireStaff portal="evaluator" />,
    children: [
      {
        element: <StaffShell portal="evaluator" />,
        children: [
          { path: ROUTES.EVALUATOR, element: <Navigate to={ROUTES.EV_DASHBOARD} replace /> },
          { path: ROUTES.EV_DASHBOARD, element: <EvaluatorDashboard /> },
          {
            element: <RequirePermission permission="evaluation.view" />,
            children: [
              { path: ROUTES.EV_BATCHES, element: <EvaluationBatches /> },
              { path: ROUTES.EV_SCRIPTS, element: <AnswerScripts /> },
              { path: ROUTES.EV_SCRIPT(), element: <ScriptWorkspace /> },
            ],
          },
          {
            element: <RequirePermission permission="answerkey.view" />,
            children: [{ path: ROUTES.EV_ANSWER_KEY, element: <AnswerKeyManagement /> }],
          },
          {
            element: <RequirePermission permission="objection.adjudicate" />,
            children: [{ path: ROUTES.EV_OBJECTIONS, element: <ObjectionHandling /> }],
          },
          {
            element: <RequirePermission permission="omr.process" />,
            children: [{ path: ROUTES.EV_OMR, element: <OmrProcessing /> }],
          },
          {
            element: <RequirePermission permission="normalization.apply" />,
            children: [{ path: ROUTES.EV_NORMALIZATION, element: <NormalizationScreen /> }],
          },
          {
            element: <RequirePermission permission="evaluation.moderate" />,
            children: [{ path: ROUTES.EV_MODERATION, element: <ModerationScreen /> }],
          },
          {
            element: <RequirePermission permission="evaluation.complete" />,
            children: [{ path: ROUTES.EV_COMPLETION, element: <EvaluationCompletion /> }],
          },
          {
            element: <RequirePermission permission="report.view" />,
            children: [{ path: ROUTES.EV_REPORTS, element: <EvaluationReports /> }],
          },
        ],
      },
    ],
  },

  /* ---------------------------- Admin (Shell B) ------------------------- */
  {
    element: <RequireStaff portal="admin" />,
    children: [
      {
        element: <StaffShell portal="admin" />,
        children: [
          { path: ROUTES.ADMIN, element: <Navigate to={ROUTES.AD_DASHBOARD} replace /> },
          { path: ROUTES.AD_DASHBOARD, element: <AdminDashboard /> },
          {
            element: <RequirePermission permission="user.view" />,
            children: [{ path: ROUTES.AD_USERS, element: <UserManagement /> }],
          },
          {
            element: <RequirePermission permission="role.view" />,
            children: [{ path: ROUTES.AD_ROLES, element: <RoleManagement /> }],
          },
          {
            element: <RequirePermission permission="hierarchy.view" />,
            children: [{ path: ROUTES.AD_HIERARCHY, element: <OfficeHierarchy /> }],
          },
          {
            element: <RequirePermission permission="feature.configure" />,
            children: [{ path: ROUTES.AD_FEATURES, element: <FeatureConfiguration /> }],
          },
          {
            element: <RequirePermission permission="master.view" />,
            children: [{ path: ROUTES.AD_MASTERS, element: <MasterData /> }],
          },
          {
            element: <RequirePermission permission="integration.view" />,
            children: [{ path: ROUTES.AD_INTEGRATIONS, element: <IntegrationConsole /> }],
          },
          {
            element: <RequirePermission permission="reconciliation.view" />,
            children: [{ path: ROUTES.AD_RECONCILIATION, element: <PaymentReconciliation /> }],
          },
          {
            element: <RequirePermission permission="audit.view" />,
            children: [{ path: ROUTES.AD_AUDIT, element: <AuditLogs /> }],
          },
          {
            element: <RequirePermission permission="migration.run" />,
            children: [{ path: ROUTES.AD_MIGRATION, element: <DataMigration /> }],
          },
        ],
      },
    ],
  },

  /* --------------------- Centre functionary (Shell B) ------------------- */
  {
    element: <RequireStaff portal="invigilator" />,
    children: [
      {
        element: <StaffShell portal="invigilator" />,
        children: [
          { path: ROUTES.INVIGILATOR, element: <Navigate to={ROUTES.IN_DASHBOARD} replace /> },
          { path: ROUTES.IN_DASHBOARD, element: <InvigilatorDashboard /> },
          {
            element: <RequirePermission permission="attendance.capture" />,
            children: [{ path: ROUTES.IN_ATTENDANCE, element: <InvigilatorAttendance /> }],
          },
          {
            element: <RequirePermission permission="seating.view" />,
            children: [{ path: ROUTES.IN_SEATING, element: <InvigilatorSeating /> }],
          },
          { path: ROUTES.IN_DOCUMENTS, element: <InvigilatorDocuments /> },
        ],
      },
    ],
  },

  /* -------------------------- Helpdesk (Shell B) ------------------------ */
  {
    element: <RequireStaff portal="helpdesk" />,
    children: [
      {
        element: <StaffShell portal="helpdesk" />,
        children: [
          { path: ROUTES.HELPDESK, element: <Navigate to={ROUTES.HD_DASHBOARD} replace /> },
          { path: ROUTES.HD_DASHBOARD, element: <HelpdeskDashboard /> },
          {
            element: <RequirePermission permission="ticket.view" />,
            children: [
              { path: ROUTES.HD_QUEUE, element: <TicketQueue /> },
              { path: ROUTES.HD_TICKET(), element: <TicketDetail /> },
            ],
          },
        ],
      },
    ],
  },

  /* --------------------------- Finance (Shell B) ------------------------ */
  {
    element: <RequireStaff portal="finance" />,
    children: [
      {
        element: <StaffShell portal="finance" />,
        children: [
          { path: ROUTES.FINANCE, element: <Navigate to={ROUTES.FI_INBOX} replace /> },
          {
            element: <RequirePermission permission="finance.concur" />,
            children: [
              { path: ROUTES.FI_INBOX, element: <FinanceInbox /> },
              { path: ROUTES.FI_REQUEST(), element: <FinanceRequestDetail /> },
            ],
          },
        ],
      },
    ],
  },

  { path: ROUTES.NOT_FOUND, element: <NotFound /> },
])
