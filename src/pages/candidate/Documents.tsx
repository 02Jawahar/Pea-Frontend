import { CloudDownload, FileText, Link2, Trash2, TriangleAlert, Upload } from 'lucide-react'
import { useState } from 'react'

import { KpiCard, KpiStrip } from '@/components/common/KpiCard'
import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card } from '@/components/common/primitives'
import { SkeletonCards } from '@/components/common/states'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import { cn } from '@/utils/cn'

interface VaultDoc {
  id: string
  label: string
  fileName: string
  sizeKb: number
  source: 'Upload' | 'DigiLocker'
  uploadedOn: string
  /** Application numbers that have taken a copy of this document. */
  linkedTo: string[]
}

/**
 * Ref. 25, 27 — the document vault.
 *
 * When a profile document is linked into a submitted application the system
 * stores a **separate copy** for that application. Deleting or replacing the
 * profile copy therefore shows a blocking dialog listing every application that
 * links it — and the application's copy is never mutated.
 */
export default function CandidateDocuments() {
  const { candidate } = useAuth()
  const { data, isLoading } = useAsync(() => api.applicationsFor(candidate!.id), candidate?.id)
  const [acting, setActing] = useState<{ doc: VaultDoc; mode: 'delete' | 'replace' } | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)

  if (isLoading || !candidate) return <SkeletonCards />

  const applications = data ?? []
  const applicationNos = applications
    .filter((application) => application.status !== 'Draft')
    .map((application) => application.applicationNo)

  const DOCUMENTS: VaultDoc[] = [
    {
      id: 'photo',
      label: 'Passport photograph',
      fileName: 'photo.jpg',
      sizeKb: 148,
      source: 'Upload',
      uploadedOn: '2024-04-21',
      linkedTo: applicationNos,
    },
    {
      id: 'signature',
      label: 'Signature',
      fileName: 'signature.png',
      sizeKb: 62,
      source: 'Upload',
      uploadedOn: '2024-04-21',
      linkedTo: applicationNos,
    },
    {
      id: 'aadhaar',
      label: 'Aadhaar card',
      fileName: 'Aadhaar_DigiLocker.pdf',
      sizeKb: 184,
      source: 'DigiLocker',
      uploadedOn: '2024-04-21',
      linkedTo: applicationNos.slice(0, 1),
    },
    {
      id: 'sslc',
      label: 'Class X marksheet',
      fileName: 'SSLC_DigiLocker.pdf',
      sizeKb: 212,
      source: 'DigiLocker',
      uploadedOn: '2024-04-22',
      linkedTo: applicationNos,
    },
    {
      id: 'degree',
      label: 'Degree certificate',
      fileName: 'degree_certificate.pdf',
      sizeKb: 486,
      source: 'Upload',
      uploadedOn: '2024-04-22',
      linkedTo: applicationNos.slice(0, 2),
    },
    {
      id: 'community',
      label: 'Community certificate',
      fileName: 'community_certificate.pdf',
      sizeKb: 331,
      source: 'Upload',
      uploadedOn: '2024-05-02',
      linkedTo: [],
    },
  ]

  const linked = DOCUMENTS.filter((document) => document.linkedTo.length > 0)
  const fromDigilocker = DOCUMENTS.filter((document) => document.source === 'DigiLocker')
  const totalKb = DOCUMENTS.reduce((sum, document) => sum + document.sizeKb, 0)

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Document Vault</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Upload once and reuse across every application. Files are validated for type and size
            before they are transmitted.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <CloudDownload className="size-4" />
            Fetch from DigiLocker
          </Button>
          <Button>
            <Upload className="size-4" />
            Upload document
          </Button>
        </div>
      </div>

      <KpiStrip>
        <KpiCard icon={<FileText className="size-5" />} label="Documents" value={DOCUMENTS.length} tone="blue" />
        <KpiCard icon={<Link2 className="size-5" />} label="Linked into applications" value={linked.length} tone="green" />
        <KpiCard icon={<CloudDownload className="size-5" />} label="From DigiLocker" value={fromDigilocker.length} tone="purple" />
        <KpiCard icon={<FileText className="size-5" />} label="Storage used" value={`${(totalKb / 1024).toFixed(2)} MB`} tone="navy" />
      </KpiStrip>

      <Banner tone="info" icon={<Link2 className="size-4" />} title="Linked documents are copied, not referenced">
        When you attach a document to an application, that application keeps its own copy. Replacing
        or deleting the vault copy never changes what a department already holds — but you will be
        shown every affected application first.
      </Banner>

      <Card title="My documents" bodyClassName="p-0" className="flex-1">
        <ul className="divide-y divide-grey-200">
          {DOCUMENTS.map((document) => (
            <li key={document.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-lg',
                  document.source === 'DigiLocker'
                    ? 'bg-purple-050 text-purple-600'
                    : 'bg-blue-050 text-blue-500',
                )}
              >
                <FileText className="size-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="clamp-1 text-[13px] font-medium text-navy-900">{document.label}</p>
                <p className="clamp-1 text-[12px] text-grey-600">
                  {document.fileName} · {document.sizeKb} KB · via {document.source} ·{' '}
                  {document.uploadedOn}
                </p>
              </div>

              {document.linkedTo.length > 0 ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded bg-green-050 px-1.5 py-0.5 text-[11px] font-medium text-green-600">
                  <Link2 className="size-3" />
                  {document.linkedTo.length} application{document.linkedTo.length === 1 ? '' : 's'}
                </span>
              ) : (
                <StatusPill status="Draft" />
              )}

              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm">
                  Preview
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setActing({ doc: document, mode: 'replace' })
                    setAcknowledged(false)
                  }}
                >
                  Replace
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete ${document.label}`}
                  onClick={() => {
                    setActing({ doc: document, mode: 'delete' })
                    setAcknowledged(false)
                  }}
                >
                  <Trash2 className="size-4 text-red-600" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Modal
        open={acting !== null}
        onClose={() => setActing(null)}
        title={
          acting?.mode === 'delete'
            ? `Delete ${acting.doc.label}?`
            : `Replace ${acting?.doc.label}?`
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setActing(null)}>
              Cancel
            </Button>
            <Button
              variant={acting?.mode === 'delete' ? 'danger' : 'primary'}
              disabled={(acting?.doc.linkedTo.length ?? 0) > 0 && !acknowledged}
              onClick={() => setActing(null)}
            >
              {acting?.mode === 'delete' ? 'Delete from vault' : 'Replace in vault'}
            </Button>
          </>
        }
      >
        {acting && (
          <div className="space-y-3">
            {acting.doc.linkedTo.length > 0 ? (
              <>
                <Banner
                  tone="warning"
                  icon={<TriangleAlert className="size-4" />}
                  title={`This document is linked into ${acting.doc.linkedTo.length} submitted application${acting.doc.linkedTo.length === 1 ? '' : 's'}`}
                >
                  Those applications keep their own copy — this change does not alter what the
                  department already holds or has scrutinised.
                </Banner>

                <ul className="divide-y divide-grey-200 rounded-md border border-grey-200">
                  {acting.doc.linkedTo.map((applicationNo) => {
                    const application = applications.find(
                      (item) => item.applicationNo === applicationNo,
                    )
                    return (
                      <li key={applicationNo} className="flex items-center gap-3 px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[12px] text-navy-900">{applicationNo}</p>
                          <p className="clamp-1 text-[12px] text-grey-600">
                            {application?.postName} · {application?.departmentName}
                          </p>
                        </div>
                        {application && <StatusPill status={application.status} />}
                      </li>
                    )
                  })}
                </ul>

                <label className="flex items-start gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    className="mt-0.5"
                    onChange={(event) => setAcknowledged(event.target.checked)}
                  />
                  <span>
                    I understand that {acting.mode === 'delete' ? 'deleting' : 'replacing'} this
                    document changes only my vault copy, and that the applications listed above keep
                    the copy they were submitted with.
                  </span>
                </label>
              </>
            ) : (
              <Banner tone="info">
                This document is not linked into any submitted application, so nothing else is
                affected.
              </Banner>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
