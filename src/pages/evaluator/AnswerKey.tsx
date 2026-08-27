import { Pencil, Megaphone, Upload } from 'lucide-react'
import { useState } from 'react'

import { Modal } from '@/components/common/Modal'
import { Banner, Button, Card, Field, Input, Select, Tabs } from '@/components/common/primitives'
import { SkeletonTable } from '@/components/common/states'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import { cn } from '@/utils/cn'

type TabId = 'provisional' | 'final'

/**
 * §2.4.4 — answer key management.
 *
 * Keys are versioned and a published key is never overwritten. Publishing the
 * final key triggers re-scoring, so the impact estimate is shown before the
 * confirmation, not after.
 */
export default function AnswerKeyManagement() {
  const { data, isLoading } = useAsync(() => api.answerKey(), 'answerKey')
  const { can } = useAuth()
  const [tab, setTab] = useState<TabId>('provisional')
  const [editing, setEditing] = useState<number | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState<TabId | null>(null)

  const key = data ?? []
  const changed = key.filter((entry) => entry.objections > 3).length

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Answer Key Management</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Assistant Grade-II Examination 2024 · General Studies Paper I · Series A
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={!can('answerkey.publish')}>
            <Upload className="size-4" />
            Bulk upload from template
          </Button>
          <Button
            variant={tab === 'final' ? 'success' : 'primary'}
            disabled={!can('answerkey.publish') || published === tab}
            onClick={() => setPublishing(true)}
          >
            <Megaphone className="size-4" />
            {published === tab
              ? `${tab === 'provisional' ? 'Provisional' : 'Final'} key published`
              : `Publish ${tab} key`}
          </Button>
        </div>
      </div>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'provisional', label: 'Provisional Answer Key' },
          { id: 'final', label: 'Final Answer Key' },
        ]}
      />

      {tab === 'final' && (
        <Banner tone="warning" title="Publishing the final key triggers re-scoring">
          Changes to <strong>{changed} question{changed === 1 ? '' : 's'}</strong> will re-score{' '}
          <strong>12,458 candidates</strong>. The provisional key is retained as version 1 and is
          never overwritten.
        </Banner>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        <Select aria-label="Paper" defaultValue="General Studies - Paper I">
          <option>General Studies - Paper I</option>
          <option>Paper-II — Accountancy</option>
          <option>Paper-II — Statistics</option>
        </Select>
        <Select aria-label="Series" defaultValue="Series A">
          {['Series A', 'Series B', 'Series C', 'Series D'].map((series) => (
            <option key={series}>{series}</option>
          ))}
        </Select>
        <Select aria-label="Language" defaultValue="English">
          {['English', 'Tamil', 'Malayalam', 'Telugu'].map((language) => (
            <option key={language}>{language}</option>
          ))}
        </Select>
      </div>

      <Card title={`${tab === 'provisional' ? 'Provisional' : 'Final'} Answer Key`} bodyClassName="p-0">
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable rows={8} cols={4} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-200 bg-grey-050">
                  {['Q. No.', 'Correct Option', 'Objections', 'Action'].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-2 text-left text-[12px] font-semibold uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {key.map((entry) => (
                  <tr
                    key={entry.qNo}
                    className={cn(
                      'border-b border-grey-200 last:border-b-0',
                      entry.objections > 3 && 'bg-amber-050',
                    )}
                  >
                    <td className="data-cell font-medium">{entry.qNo}</td>
                    <td className="data-cell">
                      <span className="inline-flex size-7 items-center justify-center rounded-md bg-grey-100 font-mono font-semibold">
                        {entry.correctOption}
                      </span>
                    </td>
                    <td className="data-cell">
                      {entry.objections > 0 ? (
                        <span
                          className={cn(
                            'font-medium',
                            entry.objections > 3 ? 'text-amber-500' : 'text-grey-700',
                          )}
                        >
                          {entry.objections}
                        </span>
                      ) : (
                        <span className="text-grey-600">—</span>
                      )}
                    </td>
                    <td className="data-cell">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!can('answerkey.publish') || published === tab}
                        onClick={() => setEditing(entry.qNo)}
                        aria-label={`Edit answer for question ${entry.qNo}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={`Edit answer — Q. No. ${editing}`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={() => setEditing(null)}>Save</Button>
          </>
        }
      >
        <Field label="Correct option" required>
          <Select defaultValue={key.find((entry) => entry.qNo === editing)?.correctOption}>
            {['A', 'B', 'C', 'D'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </Select>
        </Field>
      </Modal>

      <Modal
        open={publishing}
        onClose={() => setPublishing(false)}
        title={`Publish the ${tab} key?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPublishing(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={() => {
                setPublished(tab)
                setPublishing(false)
              }}
            >
              Publish
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {tab === 'provisional' ? (
            <>
              <Banner tone="info" title="Objection window">
                Candidates can raise objections from the moment this key is published until the
                window closes.
              </Banner>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Objection window opens">
                  <Input type="date" defaultValue="2024-05-22" />
                </Field>
                <Field label="Objection window closes">
                  <Input type="date" defaultValue="2024-05-27" />
                </Field>
              </div>
            </>
          ) : (
            <Banner tone="warning" title="Re-scoring impact">
              Changes to {changed} question{changed === 1 ? '' : 's'} will re-score 12,458
              candidates. The provisional key stays available as a superseded version.
            </Banner>
          )}
        </div>
      </Modal>
    </div>
  )
}
