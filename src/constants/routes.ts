/** Route map — mirrors the top-level map in 00-README.md. */
export const ROUTES = {
  // Public
  HOME: '/',
  NOTIFICATION: (id = ':id') => `/notifications/${id}`,
  TRACK_APPLICATION: '/track',
  TRACK_GRIEVANCE: '/grievance/track',
  LOGIN: '/login',
  CANDIDATE_LOGIN: '/candidate/login',
  REGISTER: '/register',

  // Candidate
  CANDIDATE: '/candidate',
  CANDIDATE_DASHBOARD: '/candidate/dashboard',
  CANDIDATE_PROFILE: '/candidate/profile',
  CANDIDATE_DOCUMENTS: '/candidate/documents',
  CANDIDATE_EXAMINATIONS: '/candidate/examinations',
  CANDIDATE_APPLY: (postId = ':postId') => `/candidate/apply/${postId}`,
  CANDIDATE_APPLICATIONS: '/candidate/applications',
  CANDIDATE_APPLICATION: (id = ':id') => `/candidate/applications/${id}`,
  CANDIDATE_PAY: (id = ':id') => `/candidate/applications/${id}/pay`,
  CANDIDATE_ADMIT_CARD: '/candidate/admit-card',
  CANDIDATE_RESULTS: '/candidate/results',
  CANDIDATE_ANSWER_KEY: '/candidate/answer-key',
  CANDIDATE_DOSSIER: '/candidate/e-dossier',
  CANDIDATE_GRIEVANCE: '/candidate/grievance',

  // Exam delivery (Shell C)
  EXAM_ENTRY: '/exam/entry',
  EXAM_INSTRUCTIONS: '/exam/instructions',
  EXAM_LIVE: '/exam/live',
  EXAM_SUBMITTED: '/exam/submitted',

  // Department
  DEPARTMENT: '/department',
  DEPT_DASHBOARD: '/department/dashboard',
  DEPT_POSTS: '/department/posts',
  DEPT_VACANCIES: '/department/vacancies',
  DEPT_CRITERIA: '/department/criteria',
  DEPT_MATRIX: '/department/reservation-matrix',
  DEPT_REQUISITIONS: '/department/requisitions',
  DEPT_REQUISITION_NEW: '/department/requisitions/new',
  DEPT_REQUISITION: (id = ':id') => `/department/requisitions/${id}`,
  DEPT_SCRUTINY: '/department/scrutiny',
  DEPT_CENTRES: '/department/centres',
  DEPT_REPORTS: '/department/reports',

  // Exam admin
  EXAM_ADMIN: '/exam-admin',
  EA_DASHBOARD: '/exam-admin/dashboard',
  EA_REQUISITIONS: '/exam-admin/requisitions',
  EA_NOTIFICATIONS: '/exam-admin/notifications',
  EA_NOTIFICATION_PUBLISH: (id = ':id') => `/exam-admin/notifications/${id}/publish`,
  EA_EXAMS: '/exam-admin/exams',
  EA_EXAM: (id = ':id') => `/exam-admin/exams/${id}`,
  EA_SEATING: '/exam-admin/seating',
  EA_CENTRES: '/exam-admin/centres',
  EA_FUNCTIONARIES: '/exam-admin/functionaries',
  EA_ADMIT_CARDS: '/exam-admin/admit-cards',
  EA_PAPERS: '/exam-admin/papers',
  EA_LIVE: '/exam-admin/live-monitoring',
  EA_ATTENDANCE: '/exam-admin/attendance',
  EA_MERIT: '/exam-admin/merit',
  EA_MERIT_GENERATE: '/exam-admin/merit/generate',
  EA_MERIT_LIST: (id = ':id') => `/exam-admin/merit/${id}`,
  EA_SELECTION: '/exam-admin/selection',
  EA_REPORTS: '/exam-admin/reports',

  // Evaluator
  EVALUATOR: '/evaluator',
  EV_DASHBOARD: '/evaluator/dashboard',
  EV_BATCHES: '/evaluator/batches',
  EV_SCRIPTS: '/evaluator/scripts',
  EV_SCRIPT: (id = ':id') => `/evaluator/scripts/${id}`,
  EV_ANSWER_KEY: '/evaluator/answer-key',
  EV_OBJECTIONS: '/evaluator/objections',
  EV_OMR: '/evaluator/omr',
  EV_NORMALIZATION: '/evaluator/normalization',
  EV_MODERATION: '/evaluator/moderation',
  EV_COMPLETION: '/evaluator/completion',
  EV_REPORTS: '/evaluator/reports',

  // Admin
  ADMIN: '/admin',
  AD_DASHBOARD: '/admin/dashboard',
  AD_USERS: '/admin/users',
  AD_ROLES: '/admin/roles',
  AD_HIERARCHY: '/admin/hierarchy',
  AD_FEATURES: '/admin/features',
  AD_MASTERS: '/admin/masters',
  AD_INTEGRATIONS: '/admin/integrations',
  AD_RECONCILIATION: '/admin/reconciliation',
  AD_AUDIT: '/admin/audit',
  AD_MIGRATION: '/admin/migration',

  // Centre functionary
  INVIGILATOR: '/invigilator',
  IN_DASHBOARD: '/invigilator/dashboard',
  IN_ATTENDANCE: '/invigilator/attendance',
  IN_SEATING: '/invigilator/seating',
  IN_DOCUMENTS: '/invigilator/documents',

  // Helpdesk
  HELPDESK: '/helpdesk',
  HD_DASHBOARD: '/helpdesk/dashboard',
  HD_QUEUE: '/helpdesk/queue',
  HD_TICKET: (id = ':id') => `/helpdesk/queue/${id}`,

  // Finance
  FINANCE: '/finance',
  FI_INBOX: '/finance/inbox',
  FI_REQUEST: (id = ':id') => `/finance/inbox/${id}`,

  NOT_FOUND: '*',
} as const
