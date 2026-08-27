import { Download, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import { DataTable, type Column } from '@/components/common/DataTable'
import { Banner, Button, Card, Input, Tabs } from '@/components/common/primitives'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import type { AuditEvent } from '@/types'
import { cn } from '@/utils/cn'

type TabId = 'log' | 'signatures' | 'access' | 'backup'

/**
 * §2.9.5 and §2.7 Special Points — activity logs, signature verification,
 * schema access control, and backup / archival status.
 */
export default function AuditLogs() {
  const { data, isLoading } = useAsync(() => api.auditEvents(), 'auditEvents')
  const { can } = useAuth()
  const [tab, setTab] = useState<TabId>('log')
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<string | null>(null)

  const columns: Column<AuditEvent>[] = [
    { key: 'timestamp', header: 'Timestamp', accessor: (row) => row.timestamp, sortable: true },
    { key: 'actor', header: 'User', accessor: (row) => row.actor, sortable: true },
    { key: 'role', header: 'Role', accessor: (row) => row.role, className: 'text-grey-600' },
    { key: 'module', header: 'Module', accessor: (row) => row.module },
    { key: 'action', header: 'Action', accessor: (row) => row.action },
    {
      key: 'target',
      header: 'Target',
      accessor: (row) => row.target,
      render: (row) => <span className="font-mono text-[12px]">{row.target}</span>,
    },
    {
      key: 'ip',
      header: 'IP',
      accessor: (row) => row.ip,
      render: (row) => <span className="font-mono text-[12px] text-grey-600">{row.ip}</span>,
    },
    {
      key: 'anomaly',
      header: 'Flag',
      render: (row) =>
        row.anomaly ? (
          <span className="inline-flex items-center gap-1 rounded bg-red-050 px-1.5 py-0.5 text-[11px] font-semibold text-red-600">
            <ShieldAlert className="size-3" />
            Anomaly
          </span>
        ) : (
          <span className="text-[12px] text-grey-600">—</span>
        ),
    },
  ]

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Audit &amp; Security</h1>
        <p className="mt-0.5 text-[13px] text-grey-600">
          Detailed logs of all activities, to prevent and detect unauthorised access or tampering
          with exam data.
        </p>
      </div>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'log', label: 'Activity log', count: (data ?? []).length },
          { id: 'signatures', label: 'Signature verification' },
          { id: 'access', label: 'Schema access' },
          { id: 'backup', label: 'Backup & archival' },
        ]}
      />

      {tab === 'log' && (
        <Card
          title="Activity log"
          action={
            <div className="flex items-center gap-2">
              <Input type="date" defaultValue="2024-05-14" className="w-auto py-1" aria-label="From" />
              <Input type="date" defaultValue="2024-05-20" className="w-auto py-1" aria-label="To" />
              <Button variant="secondary" size="sm">
                <Download className="size-3.5" />
                Export
              </Button>
            </div>
          }
        >
          <Banner tone="neutral" className="mb-3">
            Retention policy: activity logs are retained for 7 years, matching the recruitment
            record retention period. Anomaly flags cover out-of-hours access, bulk export and
            repeated failed authentication.
          </Banner>

          <DataTable
            rows={data ?? []}
            columns={columns}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            searchPlaceholder="Search by user, module, action or target"
            searchFields={(row) => `${row.actor} ${row.module} ${row.action} ${row.target} ${row.ip}`}
            filters={[
              {
                key: 'module',
                label: 'Module',
                options: [...new Set((data ?? []).map((row) => row.module))],
                match: (row, value) => row.module === value,
              },
              {
                key: 'anomaly',
                label: 'Flag',
                options: ['Anomalies only', 'Normal only'],
                match: (row, value) => (value === 'Anomalies only' ? row.anomaly : !row.anomaly),
              },
            ]}
            pageSize={12}
            emptyTitle="No events match these filters"
            emptyDescription="Widen the date range or clear the module filter."
          />
        </Card>
      )}

      {tab === 'signatures' && (
        <Card title="Digitally signed record verification">
          <div className="space-y-3">
            <Banner tone="info" title="Tamper evidence">
              Marks obtained by candidates and candidate ranking in the Selection List are stored
              digitally signed. Verifying a record set re-computes each signature against the stored
              certificate — this is the proof to demonstrate at UAT.
            </Banner>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Candidate marks', '45,612 records', 'Signed at capture'],
                ['Merit list entries', '500 records', 'Signed at approval'],
                ['Selection list ranking', '145 records', 'Signed at approval'],
              ].map(([label, count, note]) => (
                <div key={label} className="rounded-md border border-grey-200 p-3">
                  <p className="text-[13px] font-medium text-navy-900">{label}</p>
                  <p className="text-[12px] text-grey-600">{count}</p>
                  <p className="mt-1 text-[12px] text-grey-600">{note}</p>
                </div>
              ))}
            </div>

            <Button
              disabled={!can('security.verify')}
              isLoading={verifying}
              onClick={() => {
                setVerifying(true)
                window.setTimeout(() => {
                  setVerifying(false)
                  setVerifyResult(
                    '46,257 signatures verified · 46,257 valid · 0 invalid · 0 missing. No tampering detected.',
                  )
                }, 1400)
              }}
            >
              <ShieldCheck className="size-4" />
              Verify all signatures
            </Button>

            {verifyResult && <Banner tone="success">{verifyResult}</Banner>}
          </div>
        </Card>
      )}

      {tab === 'access' && (
        <Card title="Secured access to critical schemas" bodyClassName="p-0">
          <p className="border-b border-grey-200 px-4 py-3 text-[13px] text-grey-600">
            Tables holding candidate data, exam scores, merit list and selection list. Access
            requests are routed for approval and every grant is recorded.
          </p>
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey-200 bg-grey-050">
                {['Schema', 'Holder', 'Granted by', 'Granted on', 'Last access', 'Scope'].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-2 text-left text-[12px] font-semibold uppercase"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {[
                ['pea_candidate', 'System Admin', 'Admin User', '2023-04-01', '2024-05-20 08:12', 'Read / Write'],
                ['pea_marks', 'K. Bhuvaneswari', 'Admin User', '2023-03-15', '2024-05-20 07:58', 'Read'],
                ['pea_merit', 'Merit Officer', 'Admin User', '2023-02-21', '2024-05-20 09:30', 'Read / Write'],
                ['pea_selection', 'Merit Officer', 'Admin User', '2023-02-21', '2024-05-20 09:31', 'Read'],
                ['pea_audit', 'Admin User', 'System', '2023-04-01', '2024-05-20 09:41', 'Read only'],
              ].map((row) => (
                <tr key={row[0]} className="border-b border-grey-200 last:border-b-0">
                  <td className="data-cell font-mono text-[12px]">{row[0]}</td>
                  <td className="data-cell font-medium">{row[1]}</td>
                  <td className="data-cell text-grey-600">{row[2]}</td>
                  <td className="data-cell text-grey-600">{row[3]}</td>
                  <td className="data-cell text-grey-600">{row[4]}</td>
                  <td className="data-cell">{row[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'backup' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Secondary database & recovery">
            <dl className="space-y-2">
              <Row label="Replication status" value="Streaming" tone="success" />
              <Row label="Replication lag" value="0.8 s" tone="success" />
              <Row label="Last failover test" value="2024-04-28 — passed in 42 s" />
              <Row label="Last full backup" value="2024-05-20 02:00" />
              <Row label="Last restore test" value="2024-05-04 — passed" />
            </dl>
            <Button variant="secondary" size="sm" className="mt-3" disabled={!can('backup.manage')}>
              Run a restore test
            </Button>
          </Card>

          <Card title="Encryption status">
            <ul className="space-y-2">
              {[
                ['Candidate data at rest', 'AES-256', '2024-03-01'],
                ['Question papers at rest', 'AES-256', '2024-03-01'],
                ['Marks and merit at rest', 'AES-256', '2024-03-01'],
                ['All traffic in transit', 'TLS 1.3', '2024-05-02'],
              ].map(([store, cipher, rotated]) => (
                <li key={store} className="flex flex-wrap items-center gap-2 text-[13px]">
                  <ShieldCheck className="size-4 shrink-0 text-green-600" />
                  <span className="min-w-0 flex-1 text-navy-900">{store}</span>
                  <span className="text-grey-600">{cipher}</span>
                  <span className="text-[12px] text-grey-600">rotated {rotated}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Data archival" className="lg:col-span-2">
            <p className="text-[13px] text-grey-600">
              Old data is removed from the live database to prevent size growth and slowdown. This
              is a stated requirement, not an optimisation — archived records stay retrievable.
            </p>
            <table className="mt-3 w-full">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  {['Policy', 'Older than', 'Destination', 'Last run', 'Rows archived'].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-left text-[12px] font-semibold uppercase"
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Completed recruitment cycles', '7 years', 'Cold storage (WORM)', '2024-04-01', '1,284,301'],
                  ['Cancelled applications', '3 years', 'Cold storage', '2024-04-01', '48,220'],
                  ['Delivery logs (SMS / email)', '18 months', 'Cold storage', '2024-05-01', '2,914,777'],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-grey-200 last:border-b-0">
                    <td className="data-cell font-medium">{row[0]}</td>
                    <td className="data-cell">{row[1]}</td>
                    <td className="data-cell text-grey-600">{row[2]}</td>
                    <td className="data-cell text-grey-600">{row[3]}</td>
                    <td className="data-cell text-right font-mono text-[12px]">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'success' }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[12px] text-grey-600">{label}</dt>
      <dd
        className={cn(
          'text-right text-[13px] font-medium',
          tone === 'success' ? 'text-green-600' : 'text-navy-900',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
