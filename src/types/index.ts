/* ------------------------------------------------------------------ *
 * Domain types — PEA e-Exam 2.0
 * Vocabulary follows 00-README.md "Status pill vocabulary" exactly.
 * ------------------------------------------------------------------ */

export type VacancyStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Published'
  | 'Cancelled'

export type ApplicationStatus =
  | 'Draft'
  | 'Fee Pending'
  | 'Submitted'
  | 'Under Scrutiny'
  | 'Shortlisted'
  | 'Rejected'
  | 'Withdrawn'
  | 'Cancelled'

export type ExamStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'

export type EvaluationStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'Under Moderation'
  | 'Re-evaluation'

export type ResultStatus = 'Qualified' | 'Not Qualified' | 'Waiting List' | 'Selected'

export type TicketStatus =
  | 'Open'
  | 'In Progress'
  | 'Sent Back for Clarification'
  | 'Closed'
  | 'Not Relevant'
  | 'Cancelled'
  | 'Re-opened'

export type AnyStatus =
  | VacancyStatus
  | ApplicationStatus
  | ExamStatus
  | EvaluationStatus
  | ResultStatus
  | TicketStatus
  | 'Ongoing'
  | 'Upcoming'
  | 'Active'
  | 'Pending'
  | 'Accepted'
  | 'Healthy'
  | 'Degraded'
  | 'Down'
  | 'Locked'
  | 'Paid'
  | 'Verified'
  | 'Mismatch'
  | 'Manually Entered'
  | 'Primary'
  | 'Reserve'

export type Category = 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'MBC' | 'EBC' | 'BT' | 'BCM'
export type PaperLanguage = 'English' | 'Tamil' | 'Malayalam' | 'Telugu'
export type ExamMode = 'OMR' | 'CBT'
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent'

/* ---------- Organisation ---------- */

export interface Department {
  id: string
  name: string
  code: string
  officeId: string
}

export interface Office {
  id: string
  name: string
  departmentId: string
  parentId: string | null
  level: number
  pendingTasks: number
  mappedUsers: number
}

/* ---------- People ---------- */

/** A staff user. Candidates are a separate identity (see `Candidate`). */
export interface StaffUser {
  id: string
  employeeId: string
  name: string
  email: string
  mobile: string
  designation: string
  roleIds: RoleId[]
  departmentId: string | null
  officeId: string | null
  isActive: boolean
  deactivationReason?: DeactivationReason
  createdAt: string
  lastLoginAt: string | null
  initials: string
}

export type DeactivationReason =
  | 'Resignation from services'
  | 'Suspension'
  | 'Superannuation'
  | 'Transfer on deputation'
  | 'Temporary deactivation'

export interface Candidate {
  id: string
  registrationNo: string
  name: string
  dob: string
  gender: 'Male' | 'Female' | 'Others'
  fatherName: string
  motherName: string
  mobile: string
  email: string
  category: Category
  isPwBD: boolean
  disabilityCategory?: string
  scribeRequired?: boolean
  aadhaarVerified: boolean
  district: string
  state: string
  profileCompletion: number
  initials: string
}

/* ---------- Recruitment ---------- */

export interface Post {
  id: string
  name: string
  code: string
  departmentId: string
  classification: string
  payLevel: string
  ageLimit: string
  splitDirect: number
  splitPromotion: number
  splitLdce: number
  sanctionedStrength: number
  availableStrength: number
  syncedFromEhrms: boolean
  syncedAt: string | null
}

export interface Vacancy {
  id: string
  vacancyId: string
  postId: string
  postName: string
  departmentId: string
  departmentName: string
  noOfPosts: number
  status: VacancyStatus
  createdAt: string
  lastDate: string
}

export interface WorkflowStep {
  office: string
  actor: string
  action: string
  timestamp: string
  remarks?: string
  signed: boolean
}

export interface Requisition {
  id: string
  requisitionNo: string
  departmentId: string
  departmentName: string
  posts: { postId: string; postName: string; count: number }[]
  totalPosts: number
  status: VacancyStatus
  stage: 'Initiating' | 'Verifying' | 'Approving' | 'Initiated' | 'Verified' | 'Approved'
  nodalOfficer: string
  nodalMobile: string
  financeRoute: 'Route to Finance Department' | 'Upload existing approval' | 'Not required'
  financeStatus: 'Concurred' | 'Pending' | 'Returned' | 'Not applicable'
  submittedOn: string
  dueOn: string
  signedBy: string | null
  trail: WorkflowStep[]
}

export interface ScheduleDate {
  label: string
  date: string
}

export interface GateCheck {
  group: 'Verification' | 'Validation'
  label: string
  passed: boolean
  detail: string
}

export interface PublicNotification {
  id: string
  notificationNo: string
  title: string
  departmentNames: string[]
  totalVacancies: number
  status: VacancyStatus
  publishedOn: string | null
  lastDate: string
  summary: string
  schedule: ScheduleDate[]
  napsChecks: GateCheck[]
}

export interface PaymentAttempt {
  timestamp: string
  mode: 'Net Banking' | 'Debit / Credit Card' | 'UPI' | 'Wallet'
  gatewayRef: string
  status: 'Success' | 'Failed' | 'Pending'
  amount: number
}

export interface Application {
  id: string
  applicationNo: string
  candidateId: string
  candidateName: string
  postId: string
  postName: string
  departmentName: string
  notificationId: string
  category: Category
  status: ApplicationStatus
  submittedOn: string | null
  feePaid: boolean
  feeAmount: number
  systemCheck: { met: number; total: number; unverified: string[] }
  scrutinyRemarks?: string
  courtCase: boolean
  paperLanguage: PaperLanguage
  centrePreference: string
  trail: WorkflowStep[]
  paymentAttempts: PaymentAttempt[]
}

/* ---------- Examination ---------- */

export interface ExamSession {
  id: string
  label: string
  startTime: string
  endTime: string
  status: 'Ongoing' | 'Upcoming' | 'Completed'
  centres: number
  candidates: number
}

export interface Exam {
  id: string
  examCode: string
  name: string
  departmentId: string
  departmentName: string
  examDate: string
  status: ExamStatus
  candidates: number
  centres: number
  mode: ExamMode
  sessions: ExamSession[]
  languages: PaperLanguage[]
  totalMarks: number
  durationMinutes: number
}

export interface Centre {
  id: string
  centreCode: string
  legacyRef: string
  name: string
  district: string
  address: string
  contact: string
  email: string
  lat: number
  lng: number
  rooms: number
  capacity: number
  allocated: number
  accessible: boolean
  status: 'Active' | 'Pending'
}

export interface Seat {
  seq: number
  row: number
  col: number
  kind: 'General' | 'PwD / VI' | 'Scribe seat' | 'Court case' | 'Vacant'
  candidateRef?: string
  candidateName?: string
  category?: Category
  paperII?: string
  conflict?: string
}

export interface Hall {
  id: string
  name: string
  centreId: string
  centreName: string
  language: PaperLanguage
  rows: number
  cols: number
  capacity: number
  allocated: number
  present: number
  seats: Seat[]
}

export interface Functionary {
  id: string
  employeeId: string
  name: string
  category: 'Centre Supervisor' | 'Assistant Centre Supervisor' | 'Zonal Officer' | 'Invigilator'
  centreId: string
  centreName: string
  assignment: 'Primary' | 'Reserve'
  honorarium: number
  paymentStatus: 'Paid' | 'Pending'
  mobile: string
}

export interface AttendanceRecord {
  ref: string
  rollNo: string
  candidateName: string
  hallId: string
  hallName: string
  seatSeq: number
  capturedAt: string | null
  method: 'Biometric' | 'Manually Entered' | null
  verdict: 'Verified' | 'Mismatch' | 'Absent'
  synced: boolean
}

/* ---------- Evaluation ---------- */

export interface EvaluationBatch {
  id: string
  batchId: string
  name: string
  examId: string
  examName: string
  paper: string
  totalScripts: number
  assigned: number
  completed: number
  pending: number
  status: EvaluationStatus
  evaluatorId: string
}

export interface AnswerScript {
  id: string
  scriptId: string
  batchId: string
  candidateName: string
  rollNo: string
  marksAwarded: number | null
  status: EvaluationStatus
  lastUpdated: string | null
  pages: number
  questions: { qNo: number; max: number; awarded: number | null }[]
}

export interface AnswerKeyEntry {
  qNo: number
  correctOption: 'A' | 'B' | 'C' | 'D'
  objections: number
}

export interface Objection {
  id: string
  qNo: number
  applicationNo: string
  text: string
  status: 'Pending' | 'Accepted' | 'Rejected'
  remarks?: string
}

/* ---------- Merit & result ---------- */

export interface MeritEntry {
  rank: number
  rollNo: string
  candidateName: string
  category: Category
  totalMarks: number
  normalizedMarks: number
  tieBreakerApplied: boolean
}

export interface MeritList {
  id: string
  examId: string
  examName: string
  post: string
  version: number
  generatedOn: string
  generatedBy: string
  status: EvaluationStatus
  size: number
  appeared: number
  considered: number
  entries: MeritEntry[]
  approved: boolean
  signedBy: string | null
}

export interface SelectionList {
  id: string
  meritListId: string
  examName: string
  totalVacancies: number
  selected: number
  waitingList: number
  approvalStatus: 'Approved' | 'Pending'
  issuedAt: string | null
}

export interface ExamResult {
  applicationNo: string
  examName: string
  marksObtained: number
  totalMarks: number
  qualifyingMark: number
  status: ResultStatus
  rank: number | null
  declaredOn: string
}

/* ---------- Support ---------- */

export interface TicketMessage {
  author: string
  role: string
  timestamp: string
  body: string
  internal: boolean
}

export interface Ticket {
  id: string
  ticketNo: string
  submittedByType: 'Candidate' | 'Staff'
  submittedByName: string
  submittedById: string
  type: string
  subject: string
  description: string
  submittedOn: string
  priority: Priority
  status: TicketStatus
  assignedTo: string | null
  lockedBy: string | null
  slaHours: number
  ageHours: number
  relatedApplicationNo?: string
  thread: TicketMessage[]
  confirmationAt?: string
  reopenCount: number
}

export interface Integration {
  key: string
  name: string
  usedBy: string
  ref: string
  status: 'Healthy' | 'Degraded' | 'Down'
  lastSuccess: string
  errorRate: number
  retryQueue: number
  credentialExpiry: string
}

export interface AuditEvent {
  id: string
  timestamp: string
  actor: string
  role: string
  module: string
  action: string
  target: string
  ip: string
  anomaly: boolean
}

export interface ActivityEntry {
  id: string
  text: string
  actor: string
  timestamp: string
  tone: 'info' | 'success' | 'warning'
}

export interface AlertEntry {
  id: string
  text: string
  timestamp: string
  tone: 'info' | 'success' | 'warning' | 'danger'
}

/* ---------- Framework ---------- */

export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
}

export type RoleId =
  | 'super-admin'
  | 'system-admin'
  | 'department-officer'
  | 'nodal-officer'
  | 'hod-approver'
  | 'finance-concurrence'
  | 'exam-officer'
  | 'merit-officer'
  | 'evaluator'
  | 'moderator'
  | 'evaluation-admin'
  | 'centre-supervisor'
  | 'invigilator'
  | 'helpdesk-agent'
  | 'reports-officer'
  | 'analytics-viewer'
