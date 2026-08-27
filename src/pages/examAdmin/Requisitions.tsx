import DepartmentRequisitions from '../department/Requisitions'

/**
 * Ref. 13, 18 — PEA sees a combined dashboard across all departments.
 * The department component takes a scope prop, so it is implemented once.
 */
export default function ExamAdminRequisitions() {
  return <DepartmentRequisitions scope="pea" />
}
