import type {
  ActivityEntry,
  AlertEntry,
  Application,
  AnswerKeyEntry,
  AnswerScript,
  AttendanceRecord,
  AuditEvent,
  Candidate,
  Category,
  Centre,
  Department,
  EvaluationBatch,
  Exam,
  ExamResult,
  Functionary,
  Hall,
  Integration,
  MeritEntry,
  MeritList,
  Objection,
  Office,
  PaperLanguage,
  Post,
  PublicNotification,
  Requisition,
  Seat,
  SelectionList,
  StaffUser,
  Ticket,
  Vacancy,
  WorkflowStep,
} from '@/types'

/**
 * Deterministic seed data.
 *
 * Everything is generated from a fixed PRNG so the demo shows the same numbers
 * on every machine — the figures are the ones printed in `PEA System_Demo.pptx`
 * (45,612 candidates, 24 examinations, 12,458 applications, 62% evaluation
 * progress and so on), so screenshots and the deck line up.
 */

/** Mulberry32 — small, deterministic, good enough for demo data. */
function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = makeRng(20240520)
const pick = <T>(items: readonly T[]): T => items[Math.floor(rng() * items.length)]
const int = (min: number, max: number) => min + Math.floor(rng() * (max - min + 1))

/** The demo clock. Fixed so "today" always matches the deck's 20-May-2024. */
export const DEMO_TODAY = '2024-05-20'
export const DEMO_NOW = '10:30 AM'

const FIRST_NAMES = [
  'Ramesh',
  'Priya',
  'Arun',
  'Karthik',
  'Meena',
  'Suresh',
  'Anitha',
  'Vignesh',
  'Deepak',
  'Gayathri',
  'Lakshmi',
  'Sathish',
  'Divya',
  'Manoj',
  'Kavitha',
  'Rajesh',
  'Nithya',
  'Prakash',
  'Sangeetha',
  'Vimal',
]
const LAST_NAMES = [
  'Kumar',
  'Sharma',
  'Prakash',
  'R',
  'Devi',
  'B',
  'J',
  'M',
  'N',
  'S',
  'Raman',
  'Murugan',
  'Selvam',
  'Krishnan',
  'Balan',
]

const CATEGORIES: Category[] = ['General', 'OBC', 'SC', 'ST', 'EWS']
const LANGUAGES: PaperLanguage[] = ['Tamil', 'English', 'Malayalam', 'Telugu']
const DISTRICTS = ['Puducherry', 'Karaikal', 'Mahe', 'Yanam', 'Villianur', 'Bahour']

function name() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
}

function initials(full: string) {
  return full
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/* ------------------------------------------------------------------ *
 * Organisation
 * ------------------------------------------------------------------ */

export const departments: Department[] = [
  { id: 'dep-rev', name: 'Revenue Department', code: 'REV', officeId: 'off-rev-hq' },
  { id: 'dep-fin', name: 'Finance Department', code: 'FIN', officeId: 'off-fin-hq' },
  { id: 'dep-it', name: 'IT Department', code: 'ITD', officeId: 'off-it-hq' },
  { id: 'dep-home', name: 'Home Department', code: 'HOM', officeId: 'off-home-hq' },
  { id: 'dep-pwd', name: 'Public Works Dept.', code: 'PWD', officeId: 'off-pwd-hq' },
  { id: 'dep-edu', name: 'Education Department', code: 'EDU', officeId: 'off-edu-hq' },
]

export const offices: Office[] = [
  {
    id: 'off-pea',
    name: 'Puducherry Examining Authority',
    departmentId: 'dep-pea',
    parentId: null,
    level: 0,
    pendingTasks: 12,
    mappedUsers: 18,
  },
  ...departments.flatMap<Office>((dept, index) => [
    {
      id: dept.officeId,
      name: `${dept.name} — Head Office`,
      departmentId: dept.id,
      parentId: 'off-pea',
      level: 1,
      pendingTasks: [4, 2, 0, 3, 1, 5][index] ?? 0,
      mappedUsers: int(3, 9),
    },
    {
      id: `${dept.officeId}-est`,
      name: `${dept.name} — Establishment Section`,
      departmentId: dept.id,
      parentId: dept.officeId,
      level: 2,
      pendingTasks: [1, 0, 2, 0, 0, 1][index] ?? 0,
      mappedUsers: int(2, 6),
    },
  ]),
]

/* ------------------------------------------------------------------ *
 * Staff users — one per role, so every RBAC path is demonstrable
 * ------------------------------------------------------------------ */

export const staffUsers: StaffUser[] = [
  {
    id: 'usr-001',
    employeeId: 'PEA0001',
    name: 'Admin User',
    email: 'superadmin@pondi.gov.in',
    mobile: '9876500001',
    designation: 'Super Administrator',
    roleIds: ['super-admin'],
    departmentId: null,
    officeId: 'off-pea',
    isActive: true,
    createdAt: '2023-04-01',
    lastLoginAt: '2024-05-20 09:41',
    initials: 'AU',
  },
  {
    id: 'usr-002',
    employeeId: 'PEA0002',
    name: 'System Admin',
    email: 'sysadmin@pondi.gov.in',
    mobile: '9876500002',
    designation: 'Administrator',
    roleIds: ['system-admin'],
    departmentId: null,
    officeId: 'off-pea',
    isActive: true,
    createdAt: '2023-04-01',
    lastLoginAt: '2024-05-20 08:12',
    initials: 'SA',
  },
  {
    id: 'usr-003',
    employeeId: 'REV1041',
    name: 'Deepa Rajan',
    email: 'deepa.rajan@pondi.gov.in',
    mobile: '9876500003',
    designation: 'Department Officer',
    roleIds: ['department-officer'],
    departmentId: 'dep-rev',
    officeId: 'off-rev-hq-est',
    isActive: true,
    createdAt: '2023-06-14',
    lastLoginAt: '2024-05-20 09:02',
    initials: 'DR',
  },
  {
    id: 'usr-004',
    employeeId: 'REV1002',
    name: 'S. Venkatesan',
    email: 'venkatesan.s@pondi.gov.in',
    mobile: '9876500004',
    designation: 'Head of Department',
    roleIds: ['hod-approver'],
    departmentId: 'dep-rev',
    officeId: 'off-rev-hq',
    isActive: true,
    createdAt: '2022-11-02',
    lastLoginAt: '2024-05-19 17:20',
    initials: 'SV',
  },
  {
    id: 'usr-005',
    employeeId: 'REV1088',
    name: 'M. Kalaiselvi',
    email: 'kalaiselvi.m@pondi.gov.in',
    mobile: '9876500005',
    designation: 'Nodal Officer',
    roleIds: ['nodal-officer'],
    departmentId: 'dep-rev',
    officeId: 'off-rev-hq-est',
    isActive: true,
    createdAt: '2023-08-19',
    lastLoginAt: '2024-05-18 11:35',
    initials: 'MK',
  },
  {
    id: 'usr-006',
    employeeId: 'FIN2010',
    name: 'R. Anandan',
    email: 'anandan.r@pondi.gov.in',
    mobile: '9876500006',
    designation: 'Under Secretary (Finance)',
    roleIds: ['finance-concurrence'],
    departmentId: 'dep-fin',
    officeId: 'off-fin-hq',
    isActive: true,
    createdAt: '2022-05-30',
    lastLoginAt: '2024-05-20 10:04',
    initials: 'RA',
  },
  {
    id: 'usr-007',
    employeeId: 'PEA0114',
    name: 'Exam Officer',
    email: 'exam.officer@pondi.gov.in',
    mobile: '9876500007',
    designation: 'Examination Officer',
    roleIds: ['exam-officer'],
    departmentId: null,
    officeId: 'off-pea',
    isActive: true,
    createdAt: '2023-01-09',
    lastLoginAt: '2024-05-20 08:55',
    initials: 'EO',
  },
  {
    id: 'usr-008',
    employeeId: 'MERIT001',
    name: 'Merit Officer',
    email: 'merit.officer@pondi.gov.in',
    mobile: '9876500008',
    designation: 'Merit Officer',
    roleIds: ['merit-officer'],
    departmentId: null,
    officeId: 'off-pea',
    isActive: true,
    createdAt: '2023-02-21',
    lastLoginAt: '2024-05-20 09:30',
    initials: 'MO',
  },
  {
    id: 'usr-009',
    employeeId: 'EVAL0001',
    name: 'Evaluator 01',
    email: 'evaluator01@pondi.gov.in',
    mobile: '9876500009',
    designation: 'Evaluator',
    roleIds: ['evaluator'],
    departmentId: 'dep-edu',
    officeId: 'off-edu-hq',
    isActive: true,
    createdAt: '2024-04-11',
    lastLoginAt: '2024-05-20 10:15',
    initials: 'E1',
  },
  {
    id: 'usr-010',
    employeeId: 'EVAL0044',
    name: 'Dr. P. Saravanan',
    email: 'saravanan.p@pondi.gov.in',
    mobile: '9876500010',
    designation: 'Moderator',
    roleIds: ['moderator'],
    departmentId: 'dep-edu',
    officeId: 'off-edu-hq',
    isActive: true,
    createdAt: '2024-04-11',
    lastLoginAt: '2024-05-19 16:02',
    initials: 'PS',
  },
  {
    id: 'usr-011',
    employeeId: 'PEA0207',
    name: 'K. Bhuvaneswari',
    email: 'bhuvaneswari.k@pondi.gov.in',
    mobile: '9876500011',
    designation: 'Evaluation Admin',
    roleIds: ['evaluation-admin'],
    departmentId: null,
    officeId: 'off-pea',
    isActive: true,
    createdAt: '2023-03-15',
    lastLoginAt: '2024-05-20 07:58',
    initials: 'KB',
  },
  {
    id: 'usr-012',
    employeeId: 'CS00231',
    name: 'A. Thirumurugan',
    email: 'thirumurugan.a@pondi.gov.in',
    mobile: '9876500012',
    designation: 'Centre Supervisor',
    roleIds: ['centre-supervisor'],
    departmentId: null,
    officeId: 'off-pea',
    isActive: true,
    createdAt: '2024-03-02',
    lastLoginAt: '2024-05-20 08:05',
    initials: 'AT',
  },
  {
    id: 'usr-013',
    employeeId: 'INV01188',
    name: 'J. Revathi',
    email: 'revathi.j@pondi.gov.in',
    mobile: '9876500013',
    designation: 'Invigilator',
    roleIds: ['invigilator'],
    departmentId: null,
    officeId: 'off-pea',
    isActive: true,
    createdAt: '2024-03-02',
    lastLoginAt: '2024-05-20 08:47',
    initials: 'JR',
  },
  {
    id: 'usr-014',
    employeeId: 'HD0031',
    name: 'Helpdesk Agent',
    email: 'helpdesk01@pondi.gov.in',
    mobile: '9876500014',
    designation: 'Helpdesk Agent',
    roleIds: ['helpdesk-agent'],
    departmentId: null,
    officeId: 'off-pea',
    isActive: true,
    createdAt: '2023-09-01',
    lastLoginAt: '2024-05-20 09:12',
    initials: 'HA',
  },
  {
    id: 'usr-015',
    employeeId: 'RPT0007',
    name: 'Reports Officer',
    email: 'reports@pondi.gov.in',
    mobile: '9876500015',
    designation: 'Analytics Division',
    roleIds: ['reports-officer'],
    departmentId: null,
    officeId: 'off-pea',
    isActive: true,
    createdAt: '2023-07-19',
    lastLoginAt: '2024-05-20 10:20',
    initials: 'RA',
  },
  {
    id: 'usr-016',
    employeeId: 'REV1120',
    name: 'G. Anbarasan',
    email: 'anbarasan.g@pondi.gov.in',
    mobile: '9876500016',
    designation: 'Assistant Section Officer',
    roleIds: ['department-officer'],
    departmentId: 'dep-pwd',
    officeId: 'off-pwd-hq-est',
    isActive: false,
    deactivationReason: 'Transfer on deputation',
    createdAt: '2022-02-08',
    lastLoginAt: '2024-04-30 15:41',
    initials: 'GA',
  },
]

/* ------------------------------------------------------------------ *
 * Candidates
 * ------------------------------------------------------------------ */

const CANDIDATE_SEEDS: [string, Category, boolean][] = [
  ['Ramesh Kumar', 'General', false],
  ['Priya Sharma', 'General', false],
  ['Arun Prakash', 'OBC', false],
  ['Karthik R', 'General', false],
  ['Meena Devi', 'SC', true],
  ['Suresh B', 'OBC', false],
  ['Anitha J', 'General', false],
  ['Vignesh M', 'OBC', false],
  ['Deepak N', 'SC', false],
  ['Gayathri S', 'EWS', false],
  ['Lakshmi Raman', 'General', false],
  ['Sathish Murugan', 'ST', false],
]

export const candidates: Candidate[] = CANDIDATE_SEEDS.map(
  ([full, category, pwbd], index): Candidate => ({
    id: `cnd-${String(index + 1).padStart(3, '0')}`,
    registrationNo: `REG2024${String(123456 + index)}`,
    name: full,
    dob: `${int(10, 28)}-0${int(1, 9)}-199${int(0, 8)}`,
    gender: index % 3 === 1 ? 'Female' : 'Male',
    fatherName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    motherName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    mobile: `98765${String(43210 + index)}`,
    email: `${full.split(' ')[0].toLowerCase()}.${index}@email.com`,
    category,
    isPwBD: pwbd,
    disabilityCategory: pwbd ? 'Low Vision' : undefined,
    scribeRequired: pwbd,
    aadhaarVerified: index !== 4,
    district: pick(DISTRICTS),
    state: 'Puducherry',
    profileCompletion: [100, 92, 78, 100, 64, 88, 100, 71, 95, 83, 56, 100][index],
    initials: initials(full),
  }),
)

/** The candidate the demo signs in as — matches demo slide 5 (CND123456). */
export const DEMO_CANDIDATE_ID = 'cnd-001'

/* ------------------------------------------------------------------ *
 * Posts & vacancies
 * ------------------------------------------------------------------ */

const POST_SEEDS: [string, string, string, number][] = [
  ['Assistant Grade II', 'dep-rev', 'Group B', 25],
  ['Junior Assistant', 'dep-fin', 'Group C', 40],
  ['Data Entry Operator', 'dep-it', 'Group C', 60],
  ['Stenographer Grade III', 'dep-home', 'Group C', 15],
  ['Junior Engineer', 'dep-pwd', 'Group B', 18],
  ['Graduate Teacher', 'dep-edu', 'Group B', 32],
]

export const posts: Post[] = POST_SEEDS.map(([postName, departmentId, classification, count], index) => ({
  id: `post-${index + 1}`,
  name: postName,
  code: `${departments.find((d) => d.id === departmentId)!.code}/P/${100 + index}`,
  departmentId,
  classification,
  payLevel: `Level ${4 + (index % 4)}`,
  ageLimit: '18 – 30 years',
  splitDirect: [75, 60, 100, 50, 66, 80][index],
  splitPromotion: [15, 30, 0, 40, 24, 10][index],
  splitLdce: [10, 10, 0, 10, 10, 10][index],
  sanctionedStrength: count * 6,
  availableStrength: count,
  syncedFromEhrms: index !== 2,
  syncedAt: index !== 2 ? '2024-05-18 09:12' : null,
}))

export const vacancies: Vacancy[] = posts.map((post, index) => {
  const dept = departments.find((d) => d.id === post.departmentId)!
  return {
    id: `vac-${index + 1}`,
    vacancyId: `V240500${index + 1}`,
    postId: post.id,
    postName: post.name,
    departmentId: dept.id,
    departmentName: dept.name,
    noOfPosts: post.availableStrength,
    status: (['Published', 'Published', 'Draft', 'Draft', 'Under Review', 'Approved'] as const)[
      index
    ],
    createdAt: `2024-0${3 + (index % 2)}-1${index}`,
    lastDate: '2024-06-15',
  }
})

/* ------------------------------------------------------------------ *
 * Requisitions
 * ------------------------------------------------------------------ */

function trail(steps: [string, string, string, boolean, string?][]): WorkflowStep[] {
  return steps.map(([office, actor, action, signed, remarks]) => ({
    office,
    actor,
    action,
    signed,
    remarks,
    timestamp: `2024-05-${String(int(2, 19)).padStart(2, '0')} ${int(9, 17)}:${String(int(0, 59)).padStart(2, '0')}`,
  }))
}

export const requisitions: Requisition[] = [
  {
    id: 'req-1',
    requisitionNo: 'REQ/REV/2024/0007',
    departmentId: 'dep-rev',
    departmentName: 'Revenue Department',
    posts: [{ postId: 'post-1', postName: 'Assistant Grade II', count: 25 }],
    totalPosts: 25,
    status: 'Approved',
    stage: 'Approved',
    nodalOfficer: 'M. Kalaiselvi',
    nodalMobile: '9876500005',
    financeRoute: 'Route to Finance Department',
    financeStatus: 'Concurred',
    submittedOn: '2024-04-02',
    dueOn: '2024-04-12',
    signedBy: 'S. Venkatesan (DSC)',
    trail: trail([
      ['Revenue — Establishment', 'Deepa Rajan', 'Initiated & signed', true],
      ['Revenue — Head Office', 'S. Venkatesan', 'Approved', true, 'Vacancy matrix verified.'],
      ['Finance — Head Office', 'R. Anandan', 'Concurred', true, 'Provision available in BE 2024-25.'],
      ['PEA', 'Exam Officer', 'Accepted for notification', true],
    ]),
  },
  {
    id: 'req-2',
    requisitionNo: 'REQ/FIN/2024/0011',
    departmentId: 'dep-fin',
    departmentName: 'Finance Department',
    posts: [{ postId: 'post-2', postName: 'Junior Assistant', count: 40 }],
    totalPosts: 40,
    status: 'Under Review',
    stage: 'Verifying',
    nodalOfficer: 'R. Anandan',
    nodalMobile: '9876500006',
    financeRoute: 'Not required',
    financeStatus: 'Not applicable',
    submittedOn: '2024-05-06',
    dueOn: '2024-05-16',
    signedBy: 'R. Anandan (e-Sign)',
    trail: trail([
      ['Finance — Establishment', 'R. Anandan', 'Initiated & signed', true],
      ['PEA', 'Exam Officer', 'Under compliance review', false],
    ]),
  },
  {
    id: 'req-3',
    requisitionNo: 'REQ/ITD/2024/0003',
    departmentId: 'dep-it',
    departmentName: 'IT Department',
    posts: [{ postId: 'post-3', postName: 'Data Entry Operator', count: 60 }],
    totalPosts: 60,
    status: 'Submitted',
    stage: 'Initiated',
    nodalOfficer: 'Deepa Rajan',
    nodalMobile: '9876500003',
    financeRoute: 'Upload existing approval',
    financeStatus: 'Concurred',
    submittedOn: '2024-05-14',
    dueOn: '2024-05-24',
    signedBy: 'Deepa Rajan (DSC)',
    trail: trail([['IT — Establishment', 'Deepa Rajan', 'Initiated & signed', true]]),
  },
  {
    id: 'req-4',
    requisitionNo: 'REQ/PWD/2024/0002',
    departmentId: 'dep-pwd',
    departmentName: 'Public Works Dept.',
    posts: [{ postId: 'post-5', postName: 'Junior Engineer', count: 18 }],
    totalPosts: 18,
    status: 'Draft',
    stage: 'Initiating',
    nodalOfficer: '—',
    nodalMobile: '—',
    financeRoute: 'Route to Finance Department',
    financeStatus: 'Pending',
    submittedOn: '—',
    dueOn: '2024-05-28',
    signedBy: null,
    trail: [],
  },
  {
    id: 'req-5',
    requisitionNo: 'REQ/HOM/2024/0009',
    departmentId: 'dep-home',
    departmentName: 'Home Department',
    posts: [{ postId: 'post-4', postName: 'Stenographer Grade III', count: 15 }],
    totalPosts: 15,
    status: 'Under Review',
    stage: 'Approving',
    nodalOfficer: 'A. Thirumurugan',
    nodalMobile: '9876500012',
    financeRoute: 'Route to Finance Department',
    financeStatus: 'Pending',
    submittedOn: '2024-05-11',
    dueOn: '2024-05-21',
    signedBy: 'A. Thirumurugan (e-Sign)',
    trail: trail([
      ['Home — Establishment', 'A. Thirumurugan', 'Initiated & signed', true],
      ['Home — Head Office', 'S. Venkatesan', 'Pending approval', false],
    ]),
  },
  {
    id: 'req-6',
    requisitionNo: 'REQ/EDU/2024/0021',
    departmentId: 'dep-edu',
    departmentName: 'Education Department',
    posts: [{ postId: 'post-6', postName: 'Graduate Teacher', count: 32 }],
    totalPosts: 32,
    status: 'Approved',
    stage: 'Verified',
    nodalOfficer: 'K. Bhuvaneswari',
    nodalMobile: '9876500011',
    financeRoute: 'Upload existing approval',
    financeStatus: 'Concurred',
    submittedOn: '2024-04-25',
    dueOn: '2024-05-05',
    signedBy: 'K. Bhuvaneswari (DSC)',
    trail: trail([
      ['Education — Establishment', 'K. Bhuvaneswari', 'Initiated & signed', true],
      ['Education — Head Office', 'S. Venkatesan', 'Approved', true],
    ]),
  },
]

/* ------------------------------------------------------------------ *
 * Notifications (public)
 * ------------------------------------------------------------------ */

const SCHEDULE_LABELS = [
  'Date of Notification',
  'Start date of Application Submission',
  'End date of Application Submission',
  'Date of Application Scrutiny',
  'Date of notifying qualified candidates',
  'Date of Examination',
  'Date of Marks Notification',
  'Date of Merit List Notification',
  'Date of Selection List Notification',
  'Start date of document verification',
  'End date of document verification',
  'Date of issue of Appointment Order',
  'Date of Expiry of Wait list',
]

const SCHEDULE_DATES = [
  '2024-04-15',
  '2024-04-20',
  '2024-05-20',
  '2024-05-25',
  '2024-05-30',
  '2024-06-25',
  '2024-07-10',
  '2024-07-20',
  '2024-07-30',
  '2024-08-05',
  '2024-08-20',
  '2024-09-10',
  '2025-09-10',
]

const schedule = SCHEDULE_LABELS.map((label, index) => ({ label, date: SCHEDULE_DATES[index] }))

export const notifications: PublicNotification[] = [
  {
    id: 'ntf-1',
    notificationNo: 'PEA/NOTIF/2024/001',
    title: 'Direct Recruitment to the post of Assistant Grade II — Revenue Department',
    departmentNames: ['Revenue Department'],
    totalVacancies: 25,
    status: 'Published',
    publishedOn: '2024-04-15',
    lastDate: '2024-05-20',
    summary:
      'Applications are invited from eligible candidates for direct recruitment to 25 posts of Assistant Grade II in the Revenue Department, Government of Puducherry.',
    schedule,
    napsChecks: [
      {
        group: 'Verification',
        label: 'Vacancy verification',
        passed: true,
        detail: '25 posts reconciled against requisition REQ/REV/2024/0007.',
      },
      {
        group: 'Verification',
        label: 'Delegation of powers',
        passed: true,
        detail: 'Competent authority: Secretary (Personnel).',
      },
      {
        group: 'Verification',
        label: 'Qualification restrictions',
        passed: true,
        detail: 'Essential qualification matches Recruitment Rules dated 12-Mar-2019.',
      },
      {
        group: 'Validation',
        label: 'Digital signature of competent official',
        passed: true,
        detail: 'DSC token, valid to 2026-01-31.',
      },
      {
        group: 'Validation',
        label: 'Reservation policies',
        passed: true,
        detail: 'Vertical + horizontal totals equal 25.',
      },
      {
        group: 'Validation',
        label: 'Timelines',
        passed: true,
        detail: 'All 13 schedule dates in chronological order.',
      },
    ],
  },
  {
    id: 'ntf-2',
    notificationNo: 'PEA/NOTIF/2024/002',
    title: 'Common Notification — Junior Assistant & Data Entry Operator',
    departmentNames: ['Finance Department', 'IT Department'],
    totalVacancies: 100,
    status: 'Under Review',
    publishedOn: null,
    lastDate: '2024-06-30',
    summary:
      'Consolidated notification covering 40 posts of Junior Assistant (Finance Department) and 60 posts of Data Entry Operator (IT Department).',
    schedule,
    napsChecks: [
      {
        group: 'Verification',
        label: 'Vacancy verification',
        passed: true,
        detail: '100 posts reconciled across two requisitions.',
      },
      {
        group: 'Verification',
        label: 'Delegation of powers',
        passed: true,
        detail: 'Competent authority recorded for both departments.',
      },
      {
        group: 'Verification',
        label: 'Qualification restrictions',
        passed: false,
        detail: 'IT Department — desirable qualification not mapped to the qualification master.',
      },
      {
        group: 'Validation',
        label: 'Digital signature of competent official',
        passed: false,
        detail: 'Awaiting signature of Secretary (Finance).',
      },
      {
        group: 'Validation',
        label: 'Reservation policies',
        passed: false,
        detail: 'IT Department matrix totals 58 against 60 posts — shortfall of 2.',
      },
      {
        group: 'Validation',
        label: 'Timelines',
        passed: true,
        detail: 'All 13 schedule dates in chronological order.',
      },
    ],
  },
  {
    id: 'ntf-3',
    notificationNo: 'PEA/NOTIF/2024/003',
    title: 'Direct Recruitment to the post of Graduate Teacher — Education Department',
    departmentNames: ['Education Department'],
    totalVacancies: 32,
    status: 'Published',
    publishedOn: '2024-05-02',
    lastDate: '2024-06-10',
    summary:
      'Applications are invited for 32 posts of Graduate Teacher. Weightage is applied on X, XII and Graduation marks as per departmental merit criteria.',
    schedule,
    napsChecks: notifications0(),
  },
]

/** Third notification reuses the passing check set. */
function notifications0() {
  return [
    {
      group: 'Verification' as const,
      label: 'Vacancy verification',
      passed: true,
      detail: '32 posts reconciled against requisition REQ/EDU/2024/0021.',
    },
    {
      group: 'Verification' as const,
      label: 'Delegation of powers',
      passed: true,
      detail: 'Competent authority: Director (Education).',
    },
    {
      group: 'Verification' as const,
      label: 'Qualification restrictions',
      passed: true,
      detail: 'B.Ed. mandatory — matched to qualification master.',
    },
    {
      group: 'Validation' as const,
      label: 'Digital signature of competent official',
      passed: true,
      detail: 'Aadhaar e-Sign, public key stored.',
    },
    {
      group: 'Validation' as const,
      label: 'Reservation policies',
      passed: true,
      detail: 'Vertical + horizontal totals equal 32.',
    },
    {
      group: 'Validation' as const,
      label: 'Timelines',
      passed: true,
      detail: 'All 13 schedule dates in chronological order.',
    },
  ]
}

/* ------------------------------------------------------------------ *
 * Applications
 * ------------------------------------------------------------------ */

const APPLICATION_STATUSES = [
  'Submitted',
  'Fee Pending',
  'Under Scrutiny',
  'Shortlisted',
  'Submitted',
  'Rejected',
  'Shortlisted',
  'Submitted',
  'Under Scrutiny',
  'Draft',
  'Withdrawn',
  'Shortlisted',
] as const

export const applications: Application[] = candidates.map((candidate, index): Application => {
  const post = posts[index % 3]
  const dept = departments.find((d) => d.id === post.departmentId)!
  const status = APPLICATION_STATUSES[index]
  const feePaid = status !== 'Fee Pending' && status !== 'Draft'
  const met = int(4, 7)

  return {
    id: `app-${index + 1}`,
    applicationNo: `APP2024${String(12345 + index * 7)}`,
    candidateId: candidate.id,
    candidateName: candidate.name,
    postId: post.id,
    postName: post.name,
    departmentName: dept.name,
    notificationId: 'ntf-1',
    category: candidate.category,
    status,
    submittedOn: status === 'Draft' ? null : `2024-05-${String(int(2, 19)).padStart(2, '0')}`,
    feePaid,
    feeAmount: 750,
    systemCheck: {
      met,
      total: 7,
      unverified: met < 7 ? ['Experience requirement could not be verified'] : [],
    },
    scrutinyRemarks:
      status === 'Rejected' ? 'Essential qualification certificate not legible.' : undefined,
    courtCase: index === 7,
    paperLanguage: pick(LANGUAGES),
    centrePreference: `Puducherry — Center 0${int(1, 4)}`,
    trail: trail(
      status === 'Draft'
        ? []
        : [
            ['Online', candidate.name, 'Application submitted & e-Signed', true],
            [
              `${dept.name} — Establishment`,
              'Deepa Rajan',
              status === 'Rejected' ? 'Rejected at scrutiny' : 'Under scrutiny',
              false,
            ],
          ],
    ),
    paymentAttempts: feePaid
      ? [
          {
            timestamp: '2024-05-12 11:04',
            mode: 'UPI',
            gatewayRef: `PAYU${int(100000, 999999)}`,
            status: 'Failed',
            amount: 750,
          },
          {
            timestamp: '2024-05-12 11:25',
            mode: 'Net Banking',
            gatewayRef: `TXN${1234567890 + index}`,
            status: 'Success',
            amount: 750,
          },
        ]
      : [
          {
            timestamp: '2024-05-15 09:31',
            mode: 'Debit / Credit Card',
            gatewayRef: `PAYU${int(100000, 999999)}`,
            status: 'Failed',
            amount: 750,
          },
        ],
  }
})

/* ------------------------------------------------------------------ *
 * Examinations
 * ------------------------------------------------------------------ */

const EXAM_SEEDS: [string, string, string, string, number, number][] = [
  ['PDRB/2024/001', 'Assistant Grade-II Examination 2024', 'dep-rev', '2024-05-25', 12458, 24],
  ['PDRB/2024/002', 'Junior Assistant Examination 2024', 'dep-fin', '2024-06-02', 8736, 18],
  ['PDRB/2024/003', 'Data Entry Operator Exam 2024', 'dep-it', '2024-06-15', 6214, 15],
  ['PDRB/2024/004', 'Stenographer Grade-III Exam 2024', 'dep-home', '2024-04-20', 5102, 12],
  ['PDRB/2024/005', 'Junior Engineer Exam 2024', 'dep-pwd', '2024-04-10', 7856, 16],
  ['PDRB/2024/006', 'Graduate Teacher Exam 2024', 'dep-edu', '2024-07-08', 5246, 14],
]

const EXAM_STATUSES: Exam['status'][] = [
  'Scheduled',
  'Scheduled',
  'In Progress',
  'Completed',
  'Completed',
  'Scheduled',
]

export const exams: Exam[] = EXAM_SEEDS.map(
  ([examCode, examName, departmentId, examDate, candidateCount, centreCount], index): Exam => {
    const dept = departments.find((d) => d.id === departmentId)!
    return {
      id: `exm-${index + 1}`,
      examCode,
      name: examName,
      departmentId,
      departmentName: dept.name,
      examDate,
      status: EXAM_STATUSES[index],
      candidates: candidateCount,
      centres: centreCount,
      mode: index === 2 ? 'CBT' : 'OMR',
      totalMarks: 100,
      durationMinutes: 180,
      languages: ['Tamil', 'English', 'Malayalam', 'Telugu'],
      sessions: [
        {
          id: `${examCode}-m`,
          label: 'Morning Session',
          startTime: '09:00 AM',
          endTime: '12:00 PM',
          status: index === 0 ? 'Ongoing' : 'Upcoming',
          centres: Math.round(centreCount / 2),
          candidates: Math.round(candidateCount / 2),
        },
        {
          id: `${examCode}-a`,
          label: 'Afternoon Session',
          startTime: '02:00 PM',
          endTime: '05:00 PM',
          status: 'Upcoming',
          centres: Math.round(centreCount / 2),
          candidates: Math.round(candidateCount / 2),
        },
      ],
    }
  },
)

/* ------------------------------------------------------------------ *
 * Centres, halls, seating
 * ------------------------------------------------------------------ */

export const centres: Centre[] = Array.from({ length: 12 }, (_, index) => {
  const district = DISTRICTS[index % DISTRICTS.length]
  const capacity = int(180, 640)
  return {
    id: `ctr-${index + 1}`,
    centreCode: `PEA/C/${String(index + 1).padStart(3, '0')}`,
    legacyRef: `PDY-EXC-${1200 + index}`,
    name: `${district} — Government Higher Secondary School ${index + 1}`,
    district,
    address: `${int(1, 90)}, Main Road, ${district}, Puducherry`,
    contact: `0413-24${int(10000, 99999)}`,
    email: `centre${index + 1}@pondi.gov.in`,
    lat: 11.91 + rng() * 0.3,
    lng: 79.79 + rng() * 0.3,
    rooms: Math.ceil(capacity / 30),
    capacity,
    allocated: Math.round(capacity * (0.6 + rng() * 0.35)),
    accessible: index % 3 !== 2,
    status: index < 10 ? 'Active' : 'Pending',
  }
})

/**
 * Seat allocation for one hall, honouring the Ref. 45 constraints:
 * last row is reserved for court-case candidates, PwD/VI and scribe seats are
 * placed together, and no two candidates writing the same Paper-II sit adjacent.
 */
function buildSeats(rows: number, cols: number, allocated: number): Seat[] {
  const seats: Seat[] = []
  const papers = ['Accountancy', 'Statistics', 'Computer Science']
  let seq = 0

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      seq += 1
      const isLastRow = row === rows - 1
      const filled = seq <= allocated

      if (!filled) {
        seats.push({ seq, row, col, kind: 'Vacant' })
        continue
      }

      // Checkerboard the Paper-II subject so neighbours never match by row or column.
      const paperII = papers[(row + col) % papers.length]
      let kind: Seat['kind'] = 'General'
      if (isLastRow) kind = 'Court case'
      else if (row === 0 && col < 2) kind = 'PwD / VI'
      else if (row === 0 && col === 2) kind = 'Scribe seat'

      seats.push({
        seq,
        row,
        col,
        kind,
        candidateRef: `APP2024${String(12345 + seq)}`,
        candidateName: name(),
        category: pick(CATEGORIES),
        paperII,
      })
    }
  }
  return seats
}

export const halls: Hall[] = [
  { name: 'Hall 1', language: 'Tamil' as PaperLanguage, rows: 5, cols: 6, allocated: 30 },
  { name: 'Hall 2', language: 'English' as PaperLanguage, rows: 5, cols: 6, allocated: 27 },
  { name: 'Hall 3', language: 'Tamil' as PaperLanguage, rows: 5, cols: 6, allocated: 28 },
  { name: 'Hall 4', language: 'Malayalam' as PaperLanguage, rows: 5, cols: 6, allocated: 22 },
  { name: 'Hall 5', language: 'Telugu' as PaperLanguage, rows: 5, cols: 6, allocated: 19 },
].map((hall, index) => ({
  id: `hall-${index + 1}`,
  name: hall.name,
  centreId: 'ctr-1',
  centreName: centres[0].name,
  language: hall.language,
  rows: hall.rows,
  cols: hall.cols,
  capacity: hall.rows * hall.cols,
  allocated: hall.allocated,
  present: hall.allocated - int(0, 3),
  seats: buildSeats(hall.rows, hall.cols, hall.allocated),
}))

export const attendance: AttendanceRecord[] = halls.flatMap((hall) =>
  hall.seats
    .filter((seat) => seat.kind !== 'Vacant')
    .slice(0, 8)
    .map((seat, index): AttendanceRecord => {
      const captured = index < 6
      return {
        ref: seat.candidateRef!,
        rollNo: String(1023456 + seat.seq),
        candidateName: seat.candidateName!,
        hallId: hall.id,
        hallName: hall.name,
        seatSeq: seat.seq,
        capturedAt: captured ? `09:${String(10 + index).padStart(2, '0')}` : null,
        method: captured ? (index === 5 ? 'Manually Entered' : 'Biometric') : null,
        verdict: !captured ? 'Absent' : index === 4 ? 'Mismatch' : 'Verified',
        synced: index < 4,
      }
    }),
)

export const functionaries: Functionary[] = Array.from({ length: 14 }, (_, index) => {
  const centre = centres[index % centres.length]
  const category = (
    ['Centre Supervisor', 'Assistant Centre Supervisor', 'Zonal Officer', 'Invigilator'] as const
  )[index % 4]
  return {
    id: `fun-${index + 1}`,
    employeeId: `EMP${20000 + index}`,
    name: name(),
    category,
    centreId: centre.id,
    centreName: centre.name,
    assignment: index % 5 === 4 ? 'Reserve' : 'Primary',
    honorarium: { 'Centre Supervisor': 3500, 'Assistant Centre Supervisor': 2500, 'Zonal Officer': 4000, Invigilator: 1800 }[category],
    paymentStatus: index % 3 === 0 ? 'Pending' : 'Paid',
    mobile: `98${int(10000000, 99999999)}`,
  }
})

/* ------------------------------------------------------------------ *
 * Evaluation
 * ------------------------------------------------------------------ */

export const evaluationBatches: EvaluationBatch[] = Array.from({ length: 10 }, (_, index) => {
  const completed = [130, 80, 0, 200, 150, 90, 45, 220, 175, 60][index]
  return {
    id: `bat-${index + 1}`,
    batchId: `BATCH/AG2/GS/${String(index + 1).padStart(2, '0')}`,
    name: `Batch ${String(index + 1).padStart(2, '0')} - General Studies`,
    examId: 'exm-1',
    examName: 'Assistant Grade-II Examination 2024',
    paper: 'General Studies - Paper I',
    totalScripts: 500,
    assigned: 250,
    completed,
    pending: 250 - completed,
    status: completed === 0 ? 'Not Started' : completed >= 250 ? 'Completed' : 'In Progress',
    evaluatorId: 'usr-009',
  }
})

export const answerScripts: AnswerScript[] = Array.from({ length: 24 }, (_, index) => {
  const done = index < 10
  const questions = Array.from({ length: 10 }, (_, q) => ({
    qNo: q + 1,
    max: q < 5 ? 5 : 10,
    awarded: done ? Number(((q < 5 ? 5 : 10) * (0.5 + rng() * 0.5)).toFixed(1)) : null,
  }))
  return {
    id: `scr-${index + 1}`,
    scriptId: `AGR2/GS/I/2024/000${2456 + index}`,
    batchId: 'bat-1',
    candidateName: CANDIDATE_SEEDS[index % CANDIDATE_SEEDS.length][0],
    rollNo: String(1023456 + index),
    marksAwarded: done ? Number((60 + rng() * 20).toFixed(4)) : null,
    status: done ? 'Completed' : 'In Progress',
    lastUpdated: done ? `2024-05-20 ${9 + (index % 6)}:${String(int(10, 59))} AM` : null,
    pages: 12,
    questions,
  }
})

export const answerKey: AnswerKeyEntry[] = Array.from({ length: 40 }, (_, index) => ({
  qNo: index + 1,
  correctOption: (['A', 'B', 'C', 'D'] as const)[Math.floor(rng() * 4)],
  objections: [23, 47, 15].includes(index + 1) ? int(4, 32) : int(0, 3),
}))

export const objections: Objection[] = Array.from({ length: 18 }, (_, index) => ({
  id: `obj-${index + 1}`,
  qNo: pick([1, 15, 23, 27, 34, 47]),
  applicationNo: `APP2024${String(12345 + index * 3)}`,
  text: pick([
    'Option B is also correct as per the topic.',
    'Question is ambiguous — two options are defensible.',
    'The question is out of the prescribed syllabus.',
    'Tamil translation of the question changes its meaning.',
  ]),
  status: index < 8 ? 'Pending' : index < 14 ? 'Accepted' : 'Rejected',
  remarks: index >= 8 ? 'Subject expert opinion recorded.' : undefined,
}))

/* ------------------------------------------------------------------ *
 * Merit & selection
 * ------------------------------------------------------------------ */

const MERIT_SEED: [string, string, Category, number, boolean][] = [
  ['1023456', 'Ramesh Kumar', 'General', 78.5, false],
  ['1023478', 'Priya Sharma', 'General', 76.0, false],
  ['1023499', 'Arun Prakash', 'OBC', 75.5, false],
  ['1023501', 'Karthik R', 'General', 74.75, false],
  ['1023512', 'Meena Devi', 'SC', 74.5, true],
  ['1023523', 'Suresh B', 'OBC', 74.5, true],
  ['1023534', 'Anitha J', 'General', 73.75, false],
  ['1023545', 'Vignesh M', 'OBC', 73.25, false],
  ['1023556', 'Deepak N', 'SC', 72.8, false],
  ['1023567', 'Gayathri S', 'EWS', 72.5, false],
]

export const meritEntries: MeritEntry[] = MERIT_SEED.map(
  ([rollNo, candidateName, category, totalMarks, tie], index) => ({
    rank: index + 1,
    rollNo,
    candidateName,
    category,
    totalMarks,
    normalizedMarks: Number((totalMarks - (tie ? 0.05 : 0)).toFixed(4)),
    tieBreakerApplied: tie,
  }),
)

export const meritLists: MeritList[] = [
  {
    id: 'mrt-1',
    examId: 'exm-1',
    examName: 'Assistant Grade-II Examination 2024',
    post: 'Assistant Grade-II (General)',
    version: 2,
    generatedOn: '2024-05-20 02:30 PM',
    generatedBy: 'Merit Officer (MERIT001)',
    status: 'Completed',
    size: 500,
    appeared: 12458,
    considered: 11872,
    entries: meritEntries,
    approved: true,
    signedBy: 'Secretary (Personnel) — DSC',
  },
  {
    id: 'mrt-2',
    examId: 'exm-4',
    examName: 'Stenographer Grade-III Exam 2024',
    post: 'Stenographer Grade-III (General)',
    version: 1,
    generatedOn: '2024-05-04 11:10 AM',
    generatedBy: 'Merit Officer (MERIT001)',
    status: 'Under Moderation',
    size: 120,
    appeared: 5102,
    considered: 4890,
    entries: meritEntries.slice(0, 6),
    approved: false,
    signedBy: null,
  },
]

export const selectionLists: SelectionList[] = [
  {
    id: 'sel-1',
    meritListId: 'mrt-1',
    examName: 'Assistant Grade-II Examination 2024',
    totalVacancies: 125,
    selected: 125,
    waitingList: 20,
    approvalStatus: 'Approved',
    issuedAt: '2024-05-20 04:15 PM',
  },
]

export const results: ExamResult[] = [
  {
    applicationNo: 'APP20240012345',
    examName: 'Assistant Grade-II Examination 2024',
    marksObtained: 68.5,
    totalMarks: 100,
    qualifyingMark: 60,
    status: 'Qualified',
    rank: 342,
    declaredOn: '2024-05-20',
  },
]

/* ------------------------------------------------------------------ *
 * Grievance
 * ------------------------------------------------------------------ */

const TICKET_TYPES = [
  'Application correction',
  'Fee payment issue',
  'Admit card not generated',
  'Document upload failure',
  'Result discrepancy',
  'Exam centre change request',
]

export const tickets: Ticket[] = Array.from({ length: 16 }, (_, index) => {
  const status = (
    [
      'Open',
      'In Progress',
      'Sent Back for Clarification',
      'Closed',
      'Re-opened',
      'Open',
      'In Progress',
      'Not Relevant',
    ] as const
  )[index % 8]
  const priority = (['Low', 'Medium', 'High', 'Urgent'] as const)[index % 4]
  const slaHours = { Low: 72, Medium: 48, High: 24, Urgent: 6 }[priority]
  const ageHours = int(1, 90)
  const candidate = candidates[index % candidates.length]

  return {
    id: `tkt-${index + 1}`,
    // Ref. 82 — DDMMYY HHMMSS T NNN. Decoded in a tooltip on screen.
    ticketNo: `2805251${String(10000 + index * 137)}${index % 6}${String(index + 1).padStart(3, '0')}`,
    submittedByType: index % 5 === 4 ? 'Staff' : 'Candidate',
    submittedByName: index % 5 === 4 ? 'G. Anbarasan' : candidate.name,
    submittedById: index % 5 === 4 ? 'usr-016' : candidate.id,
    type: TICKET_TYPES[index % TICKET_TYPES.length],
    subject: `${TICKET_TYPES[index % TICKET_TYPES.length]} — ${candidate.name}`,
    description:
      'Payment was debited from my account on 12-May-2024 but the application still shows Fee Pending. Transaction reference attached.',
    submittedOn: `2024-05-${String(int(10, 20)).padStart(2, '0')} ${int(9, 17)}:${String(int(10, 59))}`,
    priority,
    status,
    assignedTo: index % 3 === 0 ? 'Helpdesk Agent' : null,
    lockedBy: index === 1 ? 'Helpdesk Agent' : index === 6 ? 'A. Thirumurugan' : null,
    slaHours,
    ageHours,
    relatedApplicationNo: applications[index % applications.length].applicationNo,
    reopenCount: status === 'Re-opened' ? 1 : 0,
    confirmationAt: status === 'Closed' ? '2024-05-18 14:22' : undefined,
    thread: [
      {
        author: candidate.name,
        role: 'Candidate',
        timestamp: '2024-05-14 10:02',
        body: 'Fee was debited but the portal still shows Fee Pending.',
        internal: false,
      },
      {
        author: 'Helpdesk Agent',
        role: 'Helpdesk',
        timestamp: '2024-05-14 11:40',
        body: 'We have raised a status query with the payment gateway. Please allow 24 hours.',
        internal: false,
      },
      {
        author: 'Helpdesk Agent',
        role: 'Helpdesk',
        timestamp: '2024-05-14 11:41',
        body: 'Gateway reference not present in the 13-May settlement file — route to reconciliation.',
        internal: true,
      },
    ],
  }
})

/* ------------------------------------------------------------------ *
 * Platform
 * ------------------------------------------------------------------ */

export const integrations: Integration[] = [
  { key: 'uidai', name: 'UIDAI / Aadhaar authentication', usedBy: 'Candidate enrolment', ref: '24', status: 'Healthy', lastSuccess: '2024-05-20 10:28', errorRate: 0.4, retryQueue: 0, credentialExpiry: '2026-01-31' },
  { key: 'aadhaar-face', name: 'Aadhaar face authentication', usedBy: 'Attendance', ref: '47', status: 'Degraded', lastSuccess: '2024-05-20 09:58', errorRate: 6.2, retryQueue: 34, credentialExpiry: '2026-01-31' },
  { key: 'digilocker', name: 'DigiLocker', usedBy: 'Profile, application documents', ref: '25, 27', status: 'Healthy', lastSuccess: '2024-05-20 10:26', errorRate: 1.1, retryQueue: 2, credentialExpiry: '2025-11-04' },
  { key: 'esign', name: 'e-Sign (UIDAI)', usedBy: '9 signature checkpoints', ref: '12, 30', status: 'Healthy', lastSuccess: '2024-05-20 10:19', errorRate: 0.2, retryQueue: 0, credentialExpiry: '2025-08-30' },
  { key: 'dsc', name: 'DSC / cryptographic token', usedBy: '9 signature checkpoints', ref: '10, 30', status: 'Healthy', lastSuccess: '2024-05-20 09:44', errorRate: 0, retryQueue: 0, credentialExpiry: '2026-03-12' },
  { key: 'ehrms', name: 'e-HRMS / PaySoft', usedBy: 'Post strength, vacancies (two-way)', ref: '1, 2', status: 'Down', lastSuccess: '2024-05-19 22:10', errorRate: 100, retryQueue: 118, credentialExpiry: '2025-06-30' },
  { key: 'payment', name: 'Payment gateway', usedBy: 'Application fee, honorarium', ref: '29, 44', status: 'Healthy', lastSuccess: '2024-05-20 10:29', errorRate: 0.8, retryQueue: 17, credentialExpiry: '2025-12-01' },
  { key: 'bank', name: 'Nodal bank statement files', usedBy: 'Payment settlement', ref: '29', status: 'Healthy', lastSuccess: '2024-05-20 06:00', errorRate: 0, retryQueue: 0, credentialExpiry: '2026-04-18' },
  { key: 'sms', name: 'SMS gateway', usedBy: 'OTP, workflow alerts', ref: '14, 24', status: 'Healthy', lastSuccess: '2024-05-20 10:30', errorRate: 2.3, retryQueue: 9, credentialExpiry: '2025-09-15' },
  { key: 'email', name: 'Email gateway', usedBy: 'OTP, notifications', ref: '24', status: 'Healthy', lastSuccess: '2024-05-20 10:30', errorRate: 1.6, retryQueue: 4, credentialExpiry: '2025-09-15' },
  { key: 'udid', name: 'UDID', usedBy: 'Disability verification', ref: '9', status: 'Degraded', lastSuccess: '2024-05-20 08:12', errorRate: 11.4, retryQueue: 21, credentialExpiry: '2025-10-22' },
]

export const auditEvents: AuditEvent[] = Array.from({ length: 30 }, (_, index) => {
  const user = staffUsers[index % staffUsers.length]
  const action = pick([
    'Viewed merit list',
    'Downloaded selection list',
    'Approved requisition',
    'Published notification',
    'Created user',
    'Modified role permissions',
    'Exported candidate report',
    'Signed shortlisting approval',
    'Failed login attempt',
  ])
  return {
    id: `aud-${index + 1}`,
    timestamp: `2024-05-${String(20 - Math.floor(index / 4)).padStart(2, '0')} ${String(int(0, 23)).padStart(2, '0')}:${String(int(0, 59)).padStart(2, '0')}`,
    actor: user.name,
    role: user.designation,
    module: pick(['Merit', 'Requisition', 'Notification', 'User Management', 'Reports', 'Security']),
    action,
    target: pick(['mrt-1', 'REQ/REV/2024/0007', 'PEA/NOTIF/2024/001', 'usr-003', 'exm-1']),
    ip: `10.14.${int(1, 40)}.${int(2, 240)}`,
    anomaly: action === 'Failed login attempt' || index % 11 === 0,
  }
})

export const activities: ActivityEntry[] = [
  { id: 'act-1', text: 'Exam "Assistant Grade-II Exam 2024" has been scheduled.', actor: 'System Admin', timestamp: '10:30 AM', tone: 'success' },
  { id: 'act-2', text: 'Question paper uploaded for "Junior Assistant Exam 2024".', actor: 'Exam Officer', timestamp: '09:15 AM', tone: 'info' },
  { id: 'act-3', text: 'Invigilators assigned for 6 centers.', actor: 'System Admin', timestamp: 'Yesterday', tone: 'info' },
  { id: 'act-4', text: 'Admit cards generated for 8,736 candidates.', actor: 'System Admin', timestamp: 'Yesterday', tone: 'success' },
  { id: 'act-5', text: 'e-HRMS sync failed — 118 records queued for retry.', actor: 'Integration Service', timestamp: 'Yesterday', tone: 'warning' },
]

export const alerts: AlertEntry[] = [
  { id: 'alr-1', text: 'Assistant Grade-II Exam 2024 (Morning Session) will start in 1 hour.', timestamp: '09:00 AM', tone: 'danger' },
  { id: 'alr-2', text: 'Please complete hall readiness for 12 centers.', timestamp: '08:30 AM', tone: 'warning' },
  { id: 'alr-3', text: 'Answer script evaluation for Batch 02 is 75% completed.', timestamp: '08:45 AM', tone: 'info' },
  { id: 'alr-4', text: 'Results for Junior Assistant Exam 2023 declared on 18-May-2024.', timestamp: '08:30 AM', tone: 'success' },
  { id: 'alr-5', text: 'Server load is normal. All systems operational.', timestamp: '08:00 AM', tone: 'info' },
]

/* ------------------------------------------------------------------ *
 * Aggregates used by dashboards — figures match the demo deck
 * ------------------------------------------------------------------ */

export const stats = {
  totalExaminations: 24,
  activeExams: 8,
  scheduledExams: 12,
  upcomingExams: 5,
  completedExams: 6,
  cancelledExams: 4,
  inProgressExams: 2,
  registeredCandidates: 45612,
  candidatesToday: 1248,
  activeCentres: 86,
  activeCentresToday: 42,
  resultsDeclared: 6,
  totalApplications: 12458,
  applicationsSubmitted: 11245,
  feePaid: 10876,
  incomplete: 1582,
  evaluated: 9245,
  evaluationPending: 1631,
  objections: 245,
  qualified: 2340,
  selected: 1250,
  waitingList: 320,
  evaluationProgressPct: 62,
  scriptsEvaluated: 28290,
  totalScripts: 45612,
  examsConducted: 18,
  reportsGenerated: 156,
  averageMarks: 67.48,
}

export const categoryDistribution = [
  { name: 'General', value: 22835, pct: 50.1 },
  { name: 'OBC', value: 12540, pct: 27.5 },
  { name: 'SC', value: 6840, pct: 15.0 },
  { name: 'ST', value: 2520, pct: 5.5 },
  { name: 'EWS', value: 877, pct: 1.9 },
]

export const examStatusDistribution = [
  { name: 'Scheduled', value: 12, pct: 50 },
  { name: 'In Progress', value: 2, pct: 8.3 },
  { name: 'Completed', value: 6, pct: 25 },
  { name: 'Cancelled', value: 4, pct: 16.7 },
]

export const evaluationStatusBreakup = [
  { name: 'Completed', value: 28290, pct: 62 },
  { name: 'In Progress', value: 9870, pct: 21.6 },
  { name: 'Not Started', value: 7452, pct: 16.4 },
]

export const meritCategoryDistribution = [
  { name: 'General (UR)', value: 220, pct: 44 },
  { name: 'OBC', value: 135, pct: 27 },
  { name: 'SC', value: 75, pct: 15 },
  { name: 'ST', value: 40, pct: 8 },
  { name: 'EWS', value: 30, pct: 6 },
]

export const applicationTrend = [
  { day: '14-May', applications: 560, conducted: 7, planned: 8, declared: 3 },
  { day: '15-May', applications: 620, conducted: 12, planned: 10, declared: 4 },
  { day: '16-May', applications: 890, conducted: 17, planned: 11, declared: 5 },
  { day: '17-May', applications: 1420, conducted: 14, planned: 12, declared: 5 },
  { day: '18-May', applications: 1180, conducted: 22, planned: 15, declared: 7 },
  { day: '19-May', applications: 1020, conducted: 19, planned: 13, declared: 6 },
  { day: '20-May', applications: 1010, conducted: 18, planned: 13, declared: 6 },
]

export const reportGenerationTrend = [
  { day: '14-May', generated: 16, downloaded: 180 },
  { day: '15-May', generated: 18, downloaded: 195 },
  { day: '16-May', generated: 22, downloaded: 240 },
  { day: '17-May', generated: 33, downloaded: 305 },
  { day: '18-May', generated: 24, downloaded: 268 },
  { day: '19-May', generated: 19, downloaded: 232 },
  { day: '20-May', generated: 26, downloaded: 281 },
]

export const batchProgress = [
  { name: 'Batch 01', pct: 90 },
  { name: 'Batch 02', pct: 75 },
  { name: 'Batch 03', pct: 50 },
  { name: 'Batch 04', pct: 20 },
  { name: 'Batch 05', pct: 0 },
]

export const generatedReports = [
  { name: 'Assistant Grade-II Exam 2024 – Performance Report', type: 'Performance Report', by: 'Reports Officer', on: '2024-05-20 10:15 AM', format: 'PDF' },
  { name: 'Evaluation Progress Report – Batch 02', type: 'Evaluation Report', by: 'Reports Officer', on: '2024-05-20 09:30 AM', format: 'Excel' },
  { name: 'Candidate Category Analysis Report', type: 'Analytics Report', by: 'Reports Officer', on: '2024-05-19 06:20 PM', format: 'PDF' },
  { name: 'Examination Trend Report (May 2024)', type: 'Trend Report', by: 'Reports Officer', on: '2024-05-19 04:10 PM', format: 'PDF' },
]

/** Ref. 29 — reconciliation figures for the Admin Portal screen. */
export const reconciliation = {
  date: '2024-05-20',
  portalTransactions: { count: 12458, amount: 9343500 },
  gatewaySettled: { count: 12441, amount: 9330750 },
  bankStatement: { count: 12441, amount: 9330750 },
  unmatched: { count: 17, amount: 12750 },
  exceptions: [
    { type: 'Debited not credited', count: 9 },
    { type: 'Credited not recorded', count: 5 },
    { type: 'Amount mismatch', count: 3 },
  ],
}

/** Volume-I §10 SLA counters surfaced on the Admin dashboard. */
export const slaCounters = [
  { label: 'System availability (quarter)', value: '99.34%', target: '99%', breach: false, note: 'Penalty exposure ₹0' },
  { label: 'Critical fault resolution', value: '4h 10m avg', target: '6 hours', breach: false, note: '2 open' },
  { label: 'Non-critical fault resolution', value: '61h avg', target: '72 hours', breach: false, note: '9 open' },
  { label: 'Security incident reporting', value: '1h 05m', target: '6 hours', breach: false, note: '0 open' },
  { label: 'Critical vulnerability closure', value: '52h', target: '48 hours', breach: true, note: '1 overdue' },
  { label: 'Non-critical vulnerability', value: '3.2 days', target: '5 days', breach: false, note: '6 open' },
]
