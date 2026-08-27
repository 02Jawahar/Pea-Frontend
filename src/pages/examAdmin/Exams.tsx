import { Eye, MoreVertical, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { DataTable, type Column } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { Button, Card, Field, Input, Select } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api, seed } from '@/mock/api'
import type { Exam } from '@/types'

export default function ManageExaminations() {
  const { data, isLoading } = useAsync(() => api.exams(), 'exams')
  const { can } = useAuth()
  const [creating, setCreating] = useState(false)

  const columns: Column<Exam>[] = [
    {
      key: 'code',
      header: 'Exam Code',
      accessor: (row) => row.examCode,
      sortable: true,
      render: (row) => (
        <Link
          to={ROUTES.EA_EXAM(row.id)}
          className="font-mono text-[12px] font-medium text-navy-700 hover:underline"
        >
          {row.examCode}
        </Link>
      ),
    },
    { key: 'name', header: 'Exam Name', accessor: (row) => row.name, sortable: true },
    { key: 'dept', header: 'Department', accessor: (row) => row.departmentName },
    { key: 'date', header: 'Exam Date', accessor: (row) => row.examDate, sortable: true },
    { key: 'mode', header: 'Mode', accessor: (row) => row.mode },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
    {
      key: 'candidates',
      header: 'Candidates',
      accessor: (row) => row.candidates,
      sortable: true,
      render: (row) => row.candidates.toLocaleString('en-IN'),
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'centres',
      header: 'Centers',
      accessor: (row) => row.centres,
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <div className="flex gap-0.5">
          <Link to={ROUTES.EA_EXAM(row.id)}>
            <Button variant="ghost" size="sm" aria-label={`View ${row.name}`}>
              <Eye className="size-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit ${row.name}`}
            disabled={!can('exam.edit')}
          >
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" aria-label="More actions">
            <MoreVertical className="size-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Manage Examinations</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Create, schedule and monitor examinations across departments.
          </p>
        </div>
        {can('exam.create') && (
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Create New Exam
          </Button>
        )}
      </div>

      <Card title="Examinations List">
        <DataTable
          rows={data ?? []}
          columns={columns}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          searchPlaceholder="Search by Exam Name / Code"
          searchFields={(row) => `${row.name} ${row.examCode} ${row.departmentName}`}
          filters={[
            {
              key: 'status',
              label: 'Select Status',
              options: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
              match: (row, value) => row.status === value,
            },
            {
              key: 'dept',
              label: 'Select Department',
              options: seed.departments.map((department) => department.name),
              match: (row, value) => row.departmentName === value,
            },
            {
              key: 'mode',
              label: 'Mode',
              options: ['OMR', 'CBT'],
              match: (row, value) => row.mode === value,
            },
          ]}
          emptyTitle="No examinations match these filters"
          emptyDescription="Clear the filters, or create a new examination for an approved notification."
        />
      </Card>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Create New Exam"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={() => setCreating(false)}>Create exam</Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Exam Name" required className="sm:col-span-2">
            <Input placeholder="e.g. Assistant Grade-II Examination 2024" />
          </Field>
          <Field label="Exam Code" required>
            <Input placeholder="PDRB/2024/007" className="font-mono" />
          </Field>
          <Field label="Department" required>
            <Select defaultValue="">
              <option value="">-- Select --</option>
              {seed.departments.map((department) => (
                <option key={department.id}>{department.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Post(s)" required>
            <Select defaultValue="">
              <option value="">-- Select --</option>
              {seed.posts.map((post) => (
                <option key={post.id}>{post.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Exam Date" required>
            <Input type="date" />
          </Field>
          <Field label="Mode" required hint="OMR is the primary path; CBT is a configurable mode.">
            <Select defaultValue="OMR">
              <option>OMR</option>
              <option>CBT</option>
            </Select>
          </Field>
          <Field label="Duration (minutes)" required>
            <Input type="number" defaultValue={180} />
          </Field>
          <Field label="Total Marks" required>
            <Input type="number" defaultValue={100} />
          </Field>
          <Field label="Paper structure">
            <Select defaultValue="Paper-I + Paper-II">
              <option>Paper-I only</option>
              <option>Paper-I + Paper-II</option>
            </Select>
          </Field>
          <Field
            label="Languages offered"
            className="sm:col-span-2"
            hint="Ref. 45 mandates English, Tamil, Malayalam and Telugu."
          >
            <div className="flex flex-wrap gap-4 pt-1">
              {['English', 'Tamil', 'Malayalam', 'Telugu'].map((language) => (
                <label key={language} className="flex items-center gap-1.5 text-[13px]">
                  <input type="checkbox" defaultChecked />
                  {language}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Sessions & shifts" className="sm:col-span-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-md border border-grey-200 p-2.5">
                <p className="text-[13px] font-medium text-navy-900">Morning Session</p>
                <div className="mt-1.5 flex gap-2">
                  <Input type="time" defaultValue="09:00" />
                  <Input type="time" defaultValue="12:00" />
                </div>
              </div>
              <div className="rounded-md border border-grey-200 p-2.5">
                <p className="text-[13px] font-medium text-navy-900">Afternoon Session</p>
                <div className="mt-1.5 flex gap-2">
                  <Input type="time" defaultValue="14:00" />
                  <Input type="time" defaultValue="17:00" />
                </div>
              </div>
            </div>
          </Field>
        </div>
      </Modal>
    </div>
  )
}
