import { ArrowLeft, BadgeCheck, Building2, CalendarClock, PauseCircle, PlayCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ApprovalBar, type ApprovalAction } from '@/components/common/ApprovalBar'
import { AuditTrailPanel } from '@/components/common/AuditTrailPanel'
import { DigitalSignModal, type SignatureReceipt } from '@/components/common/DigitalSignModal'
import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { WorkflowTrail } from '@/components/common/WorkflowTrail'
import { Banner, Button, Card, Field, Textarea } from '@/components/common/primitives'
import { EmptyState, SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import { SummaryPanel } from '../examAdmin/widgets'

/**
 * Requisition detail — the workflow trail (Ref. 12), the post-creation controls
 * from Ref. 11 (extend last date, stop temporarily, reconfigure & resume), and
 * the approval bar for anyone whose role can approve at this level.
 */
export default function RequisitionDetail() {
  const { id = '' } = useParams()
  const { data, isLoading, reload } = useAsync(() => api.requisition(id), id)
  const { staff, can } = useAuth()
  const [signOpen, setSignOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ action: ApprovalAction; remarks: string } | null>(null)
  const [periodAction, setPeriodAction] = useState<'extend' | 'stop' | 'resume' | null>(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  if (isLoading) return <SkeletonCards />
  if (!data) {
    return (
      <Card>
        <EmptyState title="Requisition not found" description="Check the link and try again." />
      </Card>
    )
  }

  const canApprove = can('requisition.approve') && data.status === 'Under Review'

  function beginApproval(action: ApprovalAction, remarks: string) {
    if (action === 'Approve') {
      // Every approval is digitally signed (Ref. 12).
      setPendingAction({ action, remarks })
      setSignOpen(true)
      return
    }
    void applyAction(action, remarks)
  }

  async function applyAction(action: ApprovalAction, remarks: string, receipt?: SignatureReceipt) {
    setBusy(true)
    await api.actOnRequisition(
      id,
      action,
      receipt ? `${remarks || 'Approved'} · signed with ${receipt.method}` : remarks,
      staff?.name ?? 'Officer',
    )
    setBusy(false)
    setPendingAction(null)
    reload()
  }

  return (
    <div className="page">
      <Link
        to={ROUTES.DEPT_REQUISITIONS}
        className="inline-flex items-center gap-1.5 text-[13px] text-navy-700 hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Requisitions
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">{data.requisitionNo}</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {data.departmentName} · {data.totalPosts} vacancies
          </p>
        </div>
        <StatusPill status={data.status} size="md" />
      </div>

      {data.signedBy && (
        <Banner tone="success" icon={<BadgeCheck className="size-4" />} title="Signed artefact stored">
          Submitted and digitally signed by {data.signedBy}. The record is stored encrypted; the
          signature guarantees its integrity (Ref. 10).
        </Banner>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card title="Posts requested" bodyClassName="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  <th className="px-4 py-2 text-left text-[12px] font-semibold uppercase">Post</th>
                  <th className="px-4 py-2 text-right text-[12px] font-semibold uppercase">
                    Vacancies
                  </th>
                  <th className="px-4 py-2 text-left text-[12px] font-semibold uppercase">
                    Recruitment period
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.posts.map((post) => (
                  <tr key={post.postId} className="border-b border-grey-200 last:border-b-0">
                    <td className="data-cell font-medium">{post.postName}</td>
                    <td className="data-cell text-right">{post.count}</td>
                    <td className="data-cell">20-Apr-2024 → 20-May-2024</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Ref. 11 — explicit named actions, each with a reason field. */}
          <Card title="Recruitment period controls">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPeriodAction('extend')}>
                <CalendarClock className="size-3.5" />
                Extend last date
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPeriodAction('stop')}>
                <PauseCircle className="size-3.5" />
                Stop temporarily
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPeriodAction('resume')}>
                <PlayCircle className="size-3.5" />
                Reconfigure &amp; resume
              </Button>
            </div>
            <p className="mt-2 text-[12px] text-grey-600">
              Each action requires a reason, which is recorded against the requisition and shown to
              candidates as a schedule change.
            </p>
          </Card>

          <Card title="Workflow Trail">
            <WorkflowTrail steps={data.trail} />
          </Card>

          {canApprove && (
            <ApprovalBar
              onAct={beginApproval}
              busy={busy}
              approveLabel="Approve & Sign"
            />
          )}
        </div>

        <div className="space-y-4">
          <SummaryPanel
            title="Requisition Summary"
            rows={[
              { label: 'Department', value: data.departmentName },
              { label: 'Nodal Officer', value: data.nodalOfficer },
              { label: 'Nodal Mobile', value: data.nodalMobile },
              { label: 'Total Vacancies', value: data.totalPosts },
              { label: 'Submitted On', value: data.submittedOn },
              { label: 'Alert threshold', value: data.dueOn },
              { label: 'Signed By', value: data.signedBy ?? 'Not signed' },
            ]}
          />

          {/* Ref. 15 — both finance paths terminate in the same state; show which was used. */}
          <Card title="Finance Concurrence">
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-[13px] text-navy-900">
                <Building2 className="size-4 text-grey-600" />
                {data.financeRoute}
              </p>
              <StatusPill status={data.financeStatus === 'Concurred' ? 'Approved' : data.financeStatus === 'Pending' ? 'Pending' : 'Draft'} />
              <p className="text-[12px] text-grey-600">
                {data.financeRoute === 'Route to Finance Department'
                  ? 'Sent as an inter-department workflow task to the Finance Department inbox.'
                  : data.financeRoute === 'Upload existing approval'
                    ? 'Concurrence evidenced by an uploaded file approval rather than a workflow route.'
                    : 'Finance concurrence is not required for this post.'}
              </p>
            </div>
          </Card>

          <AuditTrailPanel
            changes={[
              {
                timestamp: '2024-05-08 11:02',
                actor: 'Deepa Rajan',
                field: 'Number of posts',
                from: '22',
                to: '25',
              },
              {
                timestamp: '2024-05-09 09:41',
                actor: 'Deepa Rajan',
                field: 'Nodal Officer',
                from: 'Not set',
                to: 'M. Kalaiselvi',
              },
            ]}
          />
        </div>
      </div>

      <DigitalSignModal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        signerName={staff?.name ?? 'Officer'}
        artefact={`Requisition ${data.requisitionNo}`}
        checkpoint="Checkpoint 2 of 9 — Requisition approval at each workflow level (Ref. 12)"
        onSigned={(receipt) => {
          if (pendingAction) void applyAction(pendingAction.action, pendingAction.remarks, receipt)
        }}
      />

      <Modal
        open={periodAction !== null}
        onClose={() => setPeriodAction(null)}
        title={
          periodAction === 'extend'
            ? 'Extend the last date'
            : periodAction === 'stop'
              ? 'Stop this recruitment temporarily'
              : 'Reconfigure and resume'
        }
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPeriodAction(null)}>
              Cancel
            </Button>
            <Button
              disabled={!reason.trim()}
              onClick={() => {
                setPeriodAction(null)
                setReason('')
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        <Field label="Reason" required hint="Recorded against the requisition and shown publicly as a schedule change.">
          <Textarea value={reason} onChange={(event) => setReason(event.target.value)} />
        </Field>
      </Modal>
    </div>
  )
}
