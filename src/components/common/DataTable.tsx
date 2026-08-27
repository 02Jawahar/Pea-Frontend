import { ChevronDown, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, ChevronUp, Search } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

import { cn } from '@/utils/cn'
import { Input, Select } from './primitives'
import { EmptyState, SkeletonTable } from './states'

export interface Column<T> {
  key: string
  header: ReactNode
  /** Cell renderer. Omit for a plain string field via `accessor`. */
  render?: (row: T, index: number) => ReactNode
  accessor?: (row: T) => string | number
  sortable?: boolean
  className?: string
  headerClassName?: string
}

export interface FilterSpec<T> {
  key: string
  label: string
  options: string[]
  match: (row: T, value: string) => boolean
}

interface DataTableProps<T> {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  isLoading?: boolean
  searchPlaceholder?: string
  searchFields?: (row: T) => string
  filters?: FilterSpec<T>[]
  pageSize?: number
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  onRowClick?: (row: T) => void
  toolbarExtra?: ReactNode
  dense?: boolean
}

/**
 * The `<DataTable>` from 00-README.md: search, multi-filter row, sortable
 * columns, pagination (« ‹ 1 2 3 › ») and a "Showing X to Y of Z entries" line.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  isLoading = false,
  searchPlaceholder = 'Search',
  searchFields,
  filters = [],
  pageSize = 10,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'No records match the current filters.',
  emptyAction,
  onRowClick,
  toolbarExtra,
  dense = false,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = rows

    if (query && searchFields) {
      const needle = query.toLowerCase()
      result = result.filter((row) => searchFields(row).toLowerCase().includes(needle))
    }

    for (const filter of filters) {
      const value = filterValues[filter.key]
      if (value) result = result.filter((row) => filter.match(row, value))
    }

    if (sort) {
      const column = columns.find((candidate) => candidate.key === sort.key)
      if (column?.accessor) {
        const accessor = column.accessor
        result = [...result].sort((a, b) => {
          const left = accessor(a)
          const right = accessor(b)
          const comparison =
            typeof left === 'number' && typeof right === 'number'
              ? left - right
              : String(left).localeCompare(String(right))
          return sort.dir === 'asc' ? comparison : -comparison
        })
      }
    }

    return result
  }, [rows, query, searchFields, filters, filterValues, sort, columns])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const pageRows = filtered.slice(start, start + pageSize)

  const showToolbar = Boolean(searchFields) || filters.length > 0 || toolbarExtra

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-2 pb-3">
          {searchFields && (
            <div className="relative min-w-56 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-grey-600" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                placeholder={searchPlaceholder}
                className="pl-9"
                aria-label={searchPlaceholder}
              />
            </div>
          )}

          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filterValues[filter.key] ?? ''}
              aria-label={filter.label}
              className="w-auto min-w-44"
              onChange={(event) => {
                setFilterValues((previous) => ({ ...previous, [filter.key]: event.target.value }))
                setPage(1)
              }}
            >
              <option value="">-- {filter.label} --</option>
              {filter.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          ))}

          {toolbarExtra}
        </div>
      )}

      {isLoading ? (
        <SkeletonTable cols={columns.length} />
      ) : pageRows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <div className="min-w-0 flex-1 overflow-x-auto">
          <table className="w-full min-w-full border-collapse">
            <thead>
              <tr className="border-y border-grey-200 bg-grey-050">
                {columns.map((column) => {
                  const isSorted = sort?.key === column.key
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      className={cn(
                        'px-4 py-2.5 text-left text-[12px] font-semibold tracking-[0.03em] text-navy-900 uppercase',
                        column.headerClassName,
                      )}
                    >
                      {column.sortable && column.accessor ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-navy-700"
                          onClick={() =>
                            setSort((previous) =>
                              previous?.key === column.key && previous.dir === 'asc'
                                ? { key: column.key, dir: 'desc' }
                                : { key: column.key, dir: 'asc' },
                            )
                          }
                        >
                          {column.header}
                          {isSorted ? (
                            sort.dir === 'asc' ? (
                              <ChevronUp className="size-3.5" />
                            ) : (
                              <ChevronDown className="size-3.5" />
                            )
                          ) : (
                            <ChevronDown className="size-3.5 opacity-30" />
                          )}
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, index) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-grey-200 last:border-b-0',
                    onRowClick && 'cursor-pointer hover:bg-grey-050',
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'data-cell max-w-[22rem] align-middle',
                        dense && 'py-1.5',
                        column.className,
                      )}
                    >
                      {column.render
                        ? column.render(row, start + index)
                        : column.accessor
                          ? column.accessor(row)
                          : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <p className="text-[13px] text-grey-600">
            Showing {start + 1} to {Math.min(start + pageSize, filtered.length)} of{' '}
            {filtered.length.toLocaleString('en-IN')} entries
          </p>
          {totalPages > 1 && (
            <nav className="flex items-center gap-1" aria-label="Pagination">
              <PagerButton onClick={() => setPage(1)} disabled={currentPage === 1} label="First">
                <ChevronsLeft className="size-4" />
              </PagerButton>
              <PagerButton
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                label="Previous"
              >
                <ChevronLeft className="size-4" />
              </PagerButton>
              {pageNumbers(currentPage, totalPages).map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  aria-current={number === currentPage ? 'page' : undefined}
                  className={cn(
                    'min-w-8 rounded-md px-2 py-1.5 text-[13px] font-medium',
                    number === currentPage
                      ? 'bg-navy-700 text-white'
                      : 'text-grey-700 hover:bg-grey-100',
                  )}
                >
                  {number}
                </button>
              ))}
              <PagerButton
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                label="Next"
              >
                <ChevronRight className="size-4" />
              </PagerButton>
              <PagerButton
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
                label="Last"
              >
                <ChevronsRight className="size-4" />
              </PagerButton>
            </nav>
          )}
        </div>
      )}
    </div>
  )
}

function PagerButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: ReactNode
  onClick: () => void
  disabled: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="rounded-md p-1.5 text-grey-700 hover:bg-grey-100 disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}

function pageNumbers(current: number, total: number): number[] {
  const window = 5
  let start = Math.max(1, current - Math.floor(window / 2))
  const end = Math.min(total, start + window - 1)
  start = Math.max(1, end - window + 1)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}
