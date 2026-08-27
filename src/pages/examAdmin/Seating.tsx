import { CircleAlert, Info, Wand2 } from 'lucide-react'
import { useState } from 'react'

import { Banner, Button, Card, Select } from '@/components/common/primitives'
import { SkeletonCards } from '@/components/common/states'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/mock/api'
import type { Hall, Seat } from '@/types'
import { cn } from '@/utils/cn'

/**
 * Ref. 45, 46 — seat sequence generation with a visual hall chart.
 *
 * Constraints enforced simultaneously:
 *  · one hall for PwD / VI; remaining seats may take the centre's major language
 *  · the hall must accommodate a scribe where one was opted for
 *  · one hall each for Tamil, Malayalam and Telugu question papers
 *  · the last row of every hall is reserved for court-case candidates
 *  · candidates writing the same Paper-II must not be adjacent, by row or column
 */

const LEGEND: { kind: Seat['kind']; className: string; label: string }[] = [
  { kind: 'General', className: 'bg-white border-grey-300', label: 'General' },
  { kind: 'PwD / VI', className: 'bg-blue-100 border-blue-500', label: 'PwD / VI' },
  { kind: 'Scribe seat', className: 'bg-purple-100 border-purple-600', label: 'Scribe seat' },
  { kind: 'Court case', className: 'bg-amber-100 border-amber-500', label: 'Court case' },
  { kind: 'Vacant', className: 'bg-grey-100 border-grey-200', label: 'Vacant' },
]

export default function SeatingChart({ readOnly = false }: { readOnly?: boolean }) {
  const { data, isLoading } = useAsync(() => api.halls(), 'halls')
  const { can } = useAuth()
  const [hallId, setHallId] = useState('hall-3')
  const [hovered, setHovered] = useState<Seat | null>(null)

  if (isLoading) return <SkeletonCards />

  const halls = data ?? []
  const hall = halls.find((item) => item.id === hallId) ?? halls[0]
  if (!hall) return null

  const conflicts = countAdjacencyConflicts(hall)

  return (
    <div className="page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">{readOnly ? 'Seating Chart' : 'Hall & Seating'}</h1>
          <p className="mt-0.5 text-[13px] text-grey-600">
            Assistant Grade-II Examination 2024 · {hall.centreName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            aria-label="Select hall"
            className="w-auto"
            value={hall.id}
            onChange={(event) => setHallId(event.target.value)}
          >
            {halls.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} — {item.language}
              </option>
            ))}
          </Select>
          {!readOnly && can('seating.generate') && (
            <Button>
              <Wand2 className="size-4" />
              Regenerate seat sequence
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card
          title={`${hall.name} — ${hall.language}`}
          action={
            <span className="text-[12px] text-grey-600">
              Capacity {hall.capacity} · Allocated {hall.allocated}
            </span>
          }
        >
          <div className="overflow-x-auto">
            <div
              className="inline-grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${hall.cols}, minmax(0, 1fr))` }}
            >
              {hall.seats.map((seat) => {
                const legend = LEGEND.find((item) => item.kind === seat.kind)!
                const isLastRow = seat.row === hall.rows - 1
                return (
                  <button
                    key={seat.seq}
                    type="button"
                    onMouseEnter={() => setHovered(seat)}
                    onFocus={() => setHovered(seat)}
                    onMouseLeave={() => setHovered(null)}
                    aria-label={`Seat ${seat.seq}, ${seat.kind}`}
                    className={cn(
                      'flex size-12 flex-col items-center justify-center rounded border text-[11px] transition-colors',
                      legend.className,
                      isLastRow && 'border-t-2 border-t-amber-500',
                      hovered?.seq === seat.seq && 'ring-2 ring-navy-700',
                    )}
                  >
                    <span className="font-mono font-medium text-navy-900">
                      {String(seat.seq).padStart(2, '0')}
                    </span>
                    {seat.paperII && (
                      <span className="text-[9px] text-grey-600">{seat.paperII.slice(0, 4)}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-grey-200 pt-3">
            {LEGEND.map((item) => (
              <span key={item.kind} className="flex items-center gap-1.5 text-[12px] text-grey-700">
                <span className={cn('size-3 rounded-sm border', item.className)} />
                {item.label}
              </span>
            ))}
            <span
              className={cn(
                'ml-auto text-[13px] font-medium',
                conflicts === 0 ? 'text-green-600' : 'text-red-600',
              )}
            >
              Adjacency conflicts: {conflicts}
            </span>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Seat detail">
            {hovered ? (
              <dl className="space-y-2">
                <Row label="Seat sequence" value={String(hovered.seq)} />
                <Row label="Seat type" value={hovered.kind} />
                <Row label="Application reference" value={hovered.candidateRef ?? '—'} mono />
                <Row label="Candidate" value={hovered.candidateName ?? '—'} />
                <Row label="Category" value={hovered.category ?? '—'} />
                <Row label="Paper-II subject" value={hovered.paperII ?? '—'} />
                <Row label="Question paper language" value={hall.language} />
              </dl>
            ) : (
              <p className="text-[13px] text-grey-600">
                Hover or tab to a seat to see the candidate reference, category, Paper-II subject and
                language mapped to it.
              </p>
            )}
          </Card>

          <Card title="Constraints enforced">
            <ul className="space-y-2">
              {[
                ['One hall for PwD and visually impaired', true],
                ['Hall accommodates a scribe where opted', true],
                ['One hall each for Tamil, Malayalam and Telugu', true],
                ['Last row reserved for court-case candidates', true],
                ['Same Paper-II not adjacent by row or column', conflicts === 0],
              ].map(([label, satisfied]) => (
                <li key={String(label)} className="flex items-start gap-2 text-[13px]">
                  {satisfied ? (
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-green-600" />
                  ) : (
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-600" />
                  )}
                  <span className={satisfied ? 'text-navy-900' : 'text-red-600'}>
                    {String(label)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Banner tone="info" icon={<Info className="size-4" />}>
            Centre auto-assignment considers place of residence, type of post and physical state of
            candidate (Ref. 45). Manual override is permitted with a mandatory reason and is logged.
          </Banner>

          {!readOnly && can('seating.generate') && (
            <Button variant="secondary" className="w-full">
              Manual override with reason
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[12px] text-grey-600">{label}</dt>
      <dd className={cn('text-right text-[13px] font-medium text-navy-900', mono && 'font-mono text-[12px]')}>
        {value}
      </dd>
    </div>
  )
}

/** Same Paper-II must not sit adjacent by row or by column. */
function countAdjacencyConflicts(hall: Hall) {
  const grid = new Map<string, Seat>()
  for (const seat of hall.seats) grid.set(`${seat.row}:${seat.col}`, seat)

  let conflicts = 0
  for (const seat of hall.seats) {
    if (!seat.paperII) continue
    const right = grid.get(`${seat.row}:${seat.col + 1}`)
    const below = grid.get(`${seat.row + 1}:${seat.col}`)
    if (right?.paperII === seat.paperII) conflicts += 1
    if (below?.paperII === seat.paperII) conflicts += 1
  }
  return conflicts
}
