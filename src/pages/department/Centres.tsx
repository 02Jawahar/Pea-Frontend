import ExamCentres from '../examAdmin/Centres'

/**
 * Ref. 40 — departments view their eligible centres read-only.
 * Same component, read-only scope, so the two views can never drift apart.
 */
export default function DepartmentCentres() {
  return <ExamCentres readOnly />
}
