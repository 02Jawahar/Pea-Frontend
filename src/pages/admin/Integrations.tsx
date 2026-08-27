import { KeyRound, Plug, RefreshCcw, TriangleAlert, Zap } from 'lucide-react'
import { useState } from 'react'

import { DataTable, type Column } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Banner, Button, Card, Field, Input } from '@/components/common/primitives'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import type { Integration } from '@/types'
import { cn } from '@/utils/cn'

/**
 * The RFP names integrations across modules but gives them no module of their
 * own. This console covers all eleven, with status, last successful call, error
 * rate, retry-queue depth and credential expiry.
 */
export default function IntegrationConsole() {
  const { data, isLoading, reload } = useAsync(() => api.integrations(), 'integrations')
  const { can } = useAuth()
  const [detail, setDetail] = useState<Integration | null>(null)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const list = data ?? []
  const unhealthy = list.filter((integration) => integration.status !== 'Healthy')
  const expiringSoon = list.filter((integration) => integration.credentialExpiry < '2025-10-01')

  const columns: Column<Integration>[] = [
    {
      key: 'name',
      header: 'Integration',
      accessor: (row) => row.name,
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-navy-900">{row.name}</p>
          <p className="text-[12px] text-grey-600">{row.usedBy}</p>
        </div>
      ),
    },
    { key: 'ref', header: 'Ref.', accessor: (row) => row.ref, className: 'text-grey-600' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
    { key: 'last', header: 'Last successful call', accessor: (row) => row.lastSuccess, sortable: true },
    {
      key: 'error',
      header: 'Error rate',
      accessor: (row) => row.errorRate,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
      render: (row) => (
        <span
          className={cn(
            'font-medium',
            row.errorRate > 10 ? 'text-red-600' : row.errorRate > 3 ? 'text-amber-500' : 'text-grey-700',
          )}
        >
          {row.errorRate}%
        </span>
      ),
    },
    {
      key: 'queue',
      header: 'Retry queue',
      accessor: (row) => row.retryQueue,
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
      render: (row) =>
        row.retryQueue > 0 ? (
          <span className="font-medium text-amber-500">{row.retryQueue}</span>
        ) : (
          <span className="text-grey-600">0</span>
        ),
    },
    {
      key: 'expiry',
      header: 'Credential expiry',
      accessor: (row) => row.credentialExpiry,
      sortable: true,
      render: (row) => (
        <span
          className={cn(
            'text-[12px]',
            row.credentialExpiry < '2025-10-01' ? 'text-amber-500' : 'text-grey-600',
          )}
        >
          {row.credentialExpiry}
        </span>
      ),
    },
    {
      key: 'action',
      header: '',
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => setDetail(row)}>
          Configure
        </Button>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Integration Console</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            {list.length} integrations · {list.length - unhealthy.length} healthy
          </p>
        </div>
        <Button variant="secondary" onClick={reload}>
          <RefreshCcw className="size-4" />
          Refresh status
        </Button>
      </div>

      {unhealthy.length > 0 && (
        <Banner
          tone={unhealthy.some((integration) => integration.status === 'Down') ? 'danger' : 'warning'}
          icon={<TriangleAlert className="size-4" />}
          title={`${unhealthy.length} integration${unhealthy.length === 1 ? '' : 's'} need attention`}
        >
          {unhealthy
            .map((integration) => `${integration.name} (${integration.status})`)
            .join(' · ')}
          . Queued calls are retried automatically; the depth of each queue is shown below.
        </Banner>
      )}

      {expiringSoon.length > 0 && (
        <Banner
          tone="warning"
          icon={<KeyRound className="size-4" />}
          title={`${expiringSoon.length} credential${expiringSoon.length === 1 ? '' : 's'} expiring within the year`}
        >
          {expiringSoon.map((integration) => integration.name).join(' · ')} — renew before expiry to
          avoid an outage on exam day.
        </Banner>
      )}

      <Card>
        <DataTable
          rows={list}
          columns={columns}
          rowKey={(row) => row.key}
          isLoading={isLoading}
          searchPlaceholder="Search integrations"
          searchFields={(row) => `${row.name} ${row.usedBy}`}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: ['Healthy', 'Degraded', 'Down'],
              match: (row, value) => row.status === value,
            },
          ]}
          pageSize={12}
          emptyTitle="No integrations match"
          emptyDescription="Clear the status filter."
        />
      </Card>

      <Modal
        open={detail !== null}
        onClose={() => {
          setDetail(null)
          setTestResult(null)
        }}
        title={detail?.name ?? ''}
        description={detail ? `Used by ${detail.usedBy} · Ref. ${detail.ref}` : undefined}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              isLoading={testing}
              onClick={() => {
                setTesting(true)
                window.setTimeout(() => {
                  setTesting(false)
                  setTestResult(
                    detail?.status === 'Down'
                      ? 'Connection refused — endpoint unreachable (timeout after 30s).'
                      : 'Connection succeeded in 214 ms. Handshake and certificate valid.',
                  )
                }, 900)
              }}
            >
              <Zap className="size-4" />
              Test connection
            </Button>
            <Button
              disabled={!can('integration.configure')}
              onClick={() => {
                setDetail(null)
                setTestResult(null)
              }}
            >
              Save configuration
            </Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Endpoint">
                <Input
                  defaultValue={`https://api.${detail.key}.gov.in/v2`}
                  readOnly={!can('integration.configure')}
                  className="font-mono text-[12px]"
                />
              </Field>
              <Field label="Timeout (ms)">
                <Input defaultValue={30000} readOnly={!can('integration.configure')} />
              </Field>
              <Field label="Credential expiry">
                <Input defaultValue={detail.credentialExpiry} readOnly />
              </Field>
              <Field label="Retry policy">
                <Input defaultValue="5 attempts, exponential backoff" readOnly />
              </Field>
            </div>

            {testResult && (
              <Banner tone={testResult.startsWith('Connection succeeded') ? 'success' : 'danger'}>
                {testResult}
              </Banner>
            )}

            <div>
              <p className="label-caps mb-2">Recent call log</p>
              <ul className="divide-y divide-grey-200 rounded-md border border-grey-200">
                {[
                  ['10:29:41', 'POST /verify', '200 OK', '186 ms'],
                  ['10:29:12', 'POST /verify', '200 OK', '203 ms'],
                  ['10:28:55', 'POST /verify', detail.status === 'Down' ? '503 Service Unavailable' : '200 OK', '30,000 ms'],
                  ['10:28:31', 'POST /verify', '200 OK', '174 ms'],
                ].map(([time, call, status, duration]) => (
                  <li key={time} className="flex items-center gap-3 px-3 py-2 font-mono text-[12px]">
                    <span className="text-grey-600">{time}</span>
                    <span className="min-w-0 flex-1 text-navy-900">{call}</span>
                    <span className={status.startsWith('2') ? 'text-green-600' : 'text-red-600'}>
                      {status}
                    </span>
                    <span className="text-grey-600">{duration}</span>
                  </li>
                ))}
              </ul>
            </div>

            {detail.retryQueue > 0 && (
              <Banner tone="warning" icon={<Plug className="size-4" />}>
                {detail.retryQueue} call{detail.retryQueue === 1 ? '' : 's'} queued for retry. They
                replay automatically once the endpoint recovers.
              </Banner>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
