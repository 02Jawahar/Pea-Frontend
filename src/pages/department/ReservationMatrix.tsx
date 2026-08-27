import { Info, Plus, Save } from 'lucide-react'
import { useState } from 'react'

import { Banner, Button, Card, Select } from '@/components/common/primitives'
import { useAuth } from '@/hooks/useAuth'
import { seed } from '@/mock/api'
import { cn } from '@/utils/cn'

/**
 * Ref. 6 — the reservation matrix is a grid, not a form.
 * Rows are vertical reservations, columns are horizontal reservations, cells
 * are vacancy counts. Live row and column totals; the grand total must equal
 * the number of posts in the requisition, and a mismatch shows as a banner
 * rather than failing only on submit.
 *
 * Horizontal reservations are cross-cutting — *within* vertical categories,
 * not additional to them — which the helper line under the grid states.
 */

const VERTICAL = ['Unreserved', 'MBC', 'OBC', 'EBC', 'EWS', 'SC', 'ST', 'BT', 'BCM']
const HORIZONTAL = ['PwBD', 'XSM', 'MSP (Sports)', 'Regional Preference', 'Language in SSLC']

const INITIAL: Record<string, Record<string, number>> = {
  Unreserved: { PwBD: 1, XSM: 1, 'MSP (Sports)': 0, 'Regional Preference': 2, 'Language in SSLC': 1 },
  MBC: { PwBD: 0, XSM: 1, 'MSP (Sports)': 1, 'Regional Preference': 1, 'Language in SSLC': 0 },
  OBC: { PwBD: 1, XSM: 0, 'MSP (Sports)': 0, 'Regional Preference': 1, 'Language in SSLC': 1 },
  EBC: { PwBD: 0, XSM: 0, 'MSP (Sports)': 0, 'Regional Preference': 0, 'Language in SSLC': 0 },
  EWS: { PwBD: 0, XSM: 0, 'MSP (Sports)': 1, 'Regional Preference': 1, 'Language in SSLC': 0 },
  SC: { PwBD: 1, XSM: 0, 'MSP (Sports)': 0, 'Regional Preference': 1, 'Language in SSLC': 1 },
  ST: { PwBD: 0, XSM: 0, 'MSP (Sports)': 0, 'Regional Preference': 1, 'Language in SSLC': 0 },
  BT: { PwBD: 0, XSM: 0, 'MSP (Sports)': 0, 'Regional Preference': 0, 'Language in SSLC': 0 },
  BCM: { PwBD: 0, XSM: 0, 'MSP (Sports)': 0, 'Regional Preference': 1, 'Language in SSLC': 0 },
}

export default function ReservationMatrix() {
  const [matrix, setMatrix] = useState(INITIAL)
  const [postId, setPostId] = useState(seed.posts[0].id)
  const { can } = useAuth()
  const editable = can('reservation.edit')

  const post = seed.posts.find((item) => item.id === postId)!
  const requisitionPosts = post.availableStrength

  const rowTotal = (row: string) =>
    HORIZONTAL.reduce((sum, column) => sum + (matrix[row]?.[column] ?? 0), 0)
  const columnTotal = (column: string) =>
    VERTICAL.reduce((sum, row) => sum + (matrix[row]?.[column] ?? 0), 0)
  const grandTotal = VERTICAL.reduce((sum, row) => sum + rowTotal(row), 0)
  const mismatch = grandTotal - requisitionPosts

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Reservation Matrix</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Vertical reservations down, horizontal reservations across, vacancy counts in the cells.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            aria-label="Select post"
            className="w-auto"
            value={postId}
            onChange={(event) => setPostId(event.target.value)}
          >
            {seed.posts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.availableStrength} posts)
              </option>
            ))}
          </Select>
          {editable && (
            <Button>
              <Save className="size-4" />
              Save matrix
            </Button>
          )}
        </div>
      </div>

      {mismatch !== 0 && (
        <Banner
          tone="warning"
          title={`Matrix total is ${grandTotal} against ${requisitionPosts} posts in the requisition`}
        >
          {mismatch > 0
            ? `Remove ${mismatch} allocation${mismatch === 1 ? '' : 's'} to match.`
            : `Allocate ${-mismatch} more vacanc${-mismatch === 1 ? 'y' : 'ies'} to match.`}{' '}
          Reservation policy is also validated again at the NAPS publish gate (Ref. 23) — catching it
          here saves a round trip.
        </Banner>
      )}

      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-grey-200 bg-grey-050">
                <th className="sticky left-0 z-10 bg-grey-050 px-4 py-2.5 text-left text-[12px] font-semibold uppercase">
                  Vertical ↓ / Horizontal →
                </th>
                {HORIZONTAL.map((column) => (
                  <th
                    key={column}
                    className="px-3 py-2.5 text-center text-[12px] font-semibold uppercase"
                  >
                    {column}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-center text-[12px] font-semibold uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {VERTICAL.map((row) => (
                <tr key={row} className="border-b border-grey-200">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-white px-4 py-1.5 text-left text-[13px] font-medium text-navy-900"
                  >
                    {row}
                  </th>
                  {HORIZONTAL.map((column) => (
                    <td key={column} className="px-2 py-1.5 text-center">
                      <input
                        type="number"
                        min={0}
                        aria-label={`${row} × ${column}`}
                        value={matrix[row]?.[column] ?? 0}
                        readOnly={!editable}
                        onChange={(event) =>
                          setMatrix((previous) => ({
                            ...previous,
                            [row]: { ...previous[row], [column]: Number(event.target.value) },
                          }))
                        }
                        className={cn(
                          'w-14 rounded-md border border-grey-200 px-2 py-1 text-center text-[13px]',
                          !editable && 'bg-grey-050',
                          (matrix[row]?.[column] ?? 0) > 0 && 'border-navy-700 font-medium',
                        )}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-1.5 text-center text-[13px] font-semibold text-navy-900">
                    {rowTotal(row)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-grey-300 bg-grey-050">
                <th className="sticky left-0 z-10 bg-grey-050 px-4 py-2.5 text-left text-[12px] font-semibold uppercase">
                  Total
                </th>
                {HORIZONTAL.map((column) => (
                  <td
                    key={column}
                    className="px-3 py-2.5 text-center text-[13px] font-semibold text-navy-900"
                  >
                    {columnTotal(column)}
                  </td>
                ))}
                <td
                  className={cn(
                    'px-3 py-2.5 text-center text-[15px] font-semibold',
                    mismatch === 0 ? 'text-green-600' : 'text-red-600',
                  )}
                >
                  {grandTotal}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <Banner tone="info" icon={<Info className="size-4" />}>
        Horizontal reservations are cross-cutting: a PwBD or Ex-Service Man vacancy sits{' '}
        <strong>within</strong> a vertical category, it is not an extra post on top of it. The grand
        total therefore equals the number of posts in the requisition.
      </Banner>

      {editable && (
        <Card title="Reservation categories">
          <p className="mb-3 text-[13px] text-grey-600">
            Categories can be added and deactivated. Deactivation is soft — historical matrices keep
            the categories they were drawn with and stay renderable.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm">
              <Plus className="size-3.5" />
              Add vertical category
            </Button>
            <Button variant="secondary" size="sm">
              <Plus className="size-3.5" />
              Add horizontal category
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
