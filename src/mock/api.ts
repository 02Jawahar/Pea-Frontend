import { STORAGE_KEYS } from '@/constants/storage'
import type {
  AnswerScript,
  Application,
  Requisition,
  Ticket,
  TicketStatus,
} from '@/types'
import { storage } from '@/utils/storage'
import * as seed from './seed'

/**
 * In-memory mock API.
 *
 * Stands in for the backend so every screen renders real, mutable data. Writes
 * are persisted to localStorage, so a demo survives a page reload; `resetDb()`
 * puts everything back to the seeded state.
 */

const DB_KEY = 'pea.db.v1'

interface Db {
  applications: Application[]
  requisitions: Requisition[]
  tickets: Ticket[]
  scripts: AnswerScript[]
}

function freshDb(): Db {
  return structuredClone({
    applications: seed.applications,
    requisitions: seed.requisitions,
    tickets: seed.tickets,
    scripts: seed.answerScripts,
  })
}

let db: Db = storage.get<Db>(DB_KEY) ?? freshDb()

function persist() {
  storage.set(DB_KEY, db)
}

export function resetDb() {
  db = freshDb()
  persist()
  storage.remove(STORAGE_KEYS.USER)
  storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
}

/** Network latency, so loading skeletons are actually exercised. */
function delay<T>(value: T, ms = 260): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(value)), ms)
  })
}

/* ---------------- reads ---------------- */

export const api = {
  departments: () => delay(seed.departments),
  offices: () => delay(seed.offices),
  staffUsers: () => delay(seed.staffUsers),
  candidates: () => delay(seed.candidates),
  posts: () => delay(seed.posts),
  vacancies: () => delay(seed.vacancies),
  notifications: () => delay(seed.notifications),
  notification: (id: string) => delay(seed.notifications.find((n) => n.id === id) ?? null),
  exams: () => delay(seed.exams),
  exam: (id: string) => delay(seed.exams.find((e) => e.id === id) ?? null),
  centres: () => delay(seed.centres),
  halls: () => delay(seed.halls),
  attendance: () => delay(seed.attendance),
  functionaries: () => delay(seed.functionaries),
  evaluationBatches: () => delay(seed.evaluationBatches),
  answerKey: () => delay(seed.answerKey),
  objections: () => delay(seed.objections),
  meritLists: () => delay(seed.meritLists),
  meritList: (id: string) => delay(seed.meritLists.find((m) => m.id === id) ?? null),
  selectionLists: () => delay(seed.selectionLists),
  results: () => delay(seed.results),
  integrations: () => delay(seed.integrations),
  auditEvents: () => delay(seed.auditEvents),
  activities: () => delay(seed.activities),
  alerts: () => delay(seed.alerts),

  requisitions: () => delay(db.requisitions),
  requisition: (id: string) => delay(db.requisitions.find((r) => r.id === id) ?? null),

  applications: () => delay(db.applications),
  application: (id: string) => delay(db.applications.find((a) => a.id === id) ?? null),
  applicationsFor: (candidateId: string) =>
    delay(db.applications.filter((a) => a.candidateId === candidateId)),

  scripts: () => delay(db.scripts),
  script: (id: string) => delay(db.scripts.find((s) => s.id === id) ?? null),

  tickets: () => delay(db.tickets),
  ticket: (id: string) => delay(db.tickets.find((t) => t.id === id) ?? null),

  /* ---------------- writes ---------------- */

  /** Ref. 31 — withdrawal keeps the payment and permits re-submission. */
  withdrawApplication: (id: string) => {
    const app = db.applications.find((a) => a.id === id)
    if (app) {
      app.status = 'Withdrawn'
      app.trail.push({
        office: 'Online',
        actor: app.candidateName,
        action: 'Application withdrawn by candidate',
        timestamp: `${seed.DEMO_TODAY} 11:02`,
        signed: false,
      })
      persist()
    }
    return delay(app ?? null)
  },

  /** Ref. 32 — cancellation is terminal and triggers the refund rule. */
  cancelApplication: (id: string) => {
    const app = db.applications.find((a) => a.id === id)
    if (app) {
      app.status = 'Cancelled'
      app.trail.push({
        office: 'Online',
        actor: app.candidateName,
        action: 'Application cancelled by candidate — refund rule RF-02 applies',
        timestamp: `${seed.DEMO_TODAY} 11:04`,
        signed: false,
      })
      persist()
    }
    return delay(app ?? null)
  },

  payFee: (id: string, mode: Application['paymentAttempts'][number]['mode']) => {
    const app = db.applications.find((a) => a.id === id)
    if (app) {
      app.feePaid = true
      app.status = 'Submitted'
      app.paymentAttempts.push({
        timestamp: `${seed.DEMO_TODAY} 11:25`,
        mode,
        gatewayRef: `TXN${Math.floor(1000000000 + db.applications.length * 7919)}`,
        status: 'Success',
        amount: app.feeAmount,
      })
      persist()
    }
    return delay(app ?? null, 700)
  },

  /** Ref. 33/34 — the officer's decision is always explicit, never pre-selected. */
  recordScrutiny: (id: string, decision: 'Shortlisted' | 'Rejected', remarks: string) => {
    const app = db.applications.find((a) => a.id === id)
    if (app) {
      app.status = decision
      app.scrutinyRemarks = remarks
      app.trail.push({
        office: `${app.departmentName} — Establishment`,
        actor: 'Deepa Rajan',
        action: decision === 'Shortlisted' ? 'Shortlisted at scrutiny' : 'Rejected at scrutiny',
        remarks,
        timestamp: `${seed.DEMO_TODAY} 12:10`,
        signed: true,
      })
      persist()
    }
    return delay(app ?? null)
  },

  actOnRequisition: (
    id: string,
    action: 'Approve' | 'Send Back' | 'Reject',
    remarks: string,
    actor: string,
  ) => {
    const req = db.requisitions.find((r) => r.id === id)
    if (req) {
      req.status = action === 'Approve' ? 'Approved' : action === 'Reject' ? 'Cancelled' : 'Draft'
      req.stage = action === 'Approve' ? 'Approved' : 'Initiating'
      req.trail.push({
        office: 'PEA',
        actor,
        action: `${action}d`.replace('Approved', 'Approved').replace('Send Backd', 'Sent back'),
        remarks,
        timestamp: `${seed.DEMO_TODAY} 12:30`,
        signed: action === 'Approve',
      })
      persist()
    }
    return delay(req ?? null)
  },

  saveScriptMarks: (id: string, questions: AnswerScript['questions'], submit: boolean) => {
    const script = db.scripts.find((s) => s.id === id)
    if (script) {
      script.questions = questions
      const total = questions.reduce((sum, q) => sum + (q.awarded ?? 0), 0)
      script.marksAwarded = Number(total.toFixed(4))
      script.status = submit ? 'Completed' : 'In Progress'
      script.lastUpdated = `${seed.DEMO_TODAY} 11:45 AM`
      persist()
    }
    return delay(script ?? null)
  },

  /** Ref. 83 — a ticket selected by one agent is locked to that agent. */
  lockTicket: (id: string, agent: string) => {
    const ticket = db.tickets.find((t) => t.id === id)
    if (ticket && !ticket.lockedBy) {
      ticket.lockedBy = agent
      ticket.assignedTo = agent
      persist()
    }
    return delay(ticket ?? null)
  },

  releaseTicket: (id: string) => {
    const ticket = db.tickets.find((t) => t.id === id)
    if (ticket) {
      ticket.lockedBy = null
      persist()
    }
    return delay(ticket ?? null)
  },

  setTicketStatus: (id: string, status: TicketStatus, note: string, agent: string) => {
    const ticket = db.tickets.find((t) => t.id === id)
    if (ticket) {
      if (status === 'Re-opened') ticket.reopenCount += 1
      ticket.status = status
      ticket.thread.push({
        author: agent,
        role: 'Helpdesk',
        timestamp: `${seed.DEMO_TODAY} 12:45`,
        body: note,
        internal: false,
      })
      persist()
    }
    return delay(ticket ?? null)
  },

  setTicketPriority: (id: string, priority: Ticket['priority']) => {
    const ticket = db.tickets.find((t) => t.id === id)
    if (ticket) {
      ticket.priority = priority
      ticket.slaHours = { Low: 72, Medium: 48, High: 24, Urgent: 6 }[priority]
      persist()
    }
    return delay(ticket ?? null)
  },
}

export { seed }
