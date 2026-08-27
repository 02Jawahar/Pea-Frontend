/**
 * Permission catalogue.
 *
 * Named `<module>.<action>` so the role matrix in `roles.ts` reads like the
 * permission-matrix editor the Admin Portal spec (Ref. 65) describes:
 * roles as rows, features as columns, cells for view / create / edit / approve / delete.
 */
export const PERMISSIONS = [
  // Department — post, vacancy, criteria, requisition
  'post.view',
  'post.edit',
  'vacancy.view',
  'vacancy.edit',
  'criteria.view',
  'criteria.edit',
  'reservation.view',
  'reservation.edit',
  'requisition.view',
  'requisition.create',
  'requisition.approve',
  'requisition.sign',
  'finance.concur',

  // Scrutiny & shortlisting
  'scrutiny.view',
  'scrutiny.decide',
  'shortlist.approve',

  // Notification (PEA)
  'notification.view',
  'notification.draft',
  'notification.approve',
  'notification.publish',

  // Exam operations
  'exam.view',
  'exam.create',
  'exam.edit',
  'centre.view',
  'centre.edit',
  'centre.allocate',
  'seating.view',
  'seating.generate',
  'functionary.view',
  'functionary.assign',
  'functionary.pay',
  'paper.view',
  'paper.manage',
  'admitcard.view',
  'admitcard.generate',
  'attendance.view',
  'attendance.capture',
  'monitoring.view',
  'malpractice.record',

  // Evaluation
  'evaluation.view',
  'evaluation.score',
  'evaluation.moderate',
  'evaluation.reevaluate',
  'answerkey.view',
  'answerkey.publish',
  'objection.adjudicate',
  'omr.process',
  'normalization.apply',
  'marks.consolidate',
  'evaluation.complete',
  'evaluator.manage',

  // Merit & selection
  'merit.view',
  'merit.generate',
  'merit.approve',
  'selection.view',
  'selection.generate',
  'selection.publish',
  'appointment.generate',

  // Reports
  'report.view',
  'report.export',
  'report.schedule',
  'report.request',

  // Support
  'ticket.view',
  'ticket.handle',
  'ticket.assign',
  'ticket.forcerelease',

  // Administration
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
] as const

export type Permission = (typeof PERMISSIONS)[number]
