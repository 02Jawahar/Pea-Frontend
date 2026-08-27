import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { cn } from '@/utils/cn'
import { ProgressBar } from '@/components/common/primitives'
import { CHART_COLORS, TOOLTIP_STYLE } from './palette'

export interface Slice {
  name: string
  value: number
  pct: number
}

/**
 * Donut with a centred total and a legend listing count and percentage —
 * the shape used on every dashboard in the demo deck.
 */
export function DonutChart({
  data,
  totalLabel = 'Total',
  colors = CHART_COLORS,
  className,
  valueFormatter = (value: number) => value.toLocaleString('en-IN'),
}: {
  data: Slice[]
  totalLabel?: string
  colors?: string[]
  className?: string
  valueFormatter?: (value: number) => string
}) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0)

  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={1}
              stroke="none"
            >
              {data.map((slice, index) => (
                <Cell key={slice.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value, name) => [valueFormatter(Number(value ?? 0)), String(name ?? '')]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[12px] text-grey-600">{totalLabel}</span>
          <span className="text-[20px] font-semibold text-navy-900">{valueFormatter(total)}</span>
        </div>
      </div>

      <ul className="min-w-40 flex-1 space-y-1.5">
        {data.map((slice, index) => (
          <li key={slice.name} className="flex items-center gap-2 text-[13px]">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="flex-1 truncate text-navy-900">{slice.name}</span>
            <span className="text-grey-600">
              {valueFormatter(slice.value)} ({slice.pct}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Multi-series line chart — Examination Trend, Application Receipt Trend. */
export function TrendChart({
  data,
  xKey,
  series,
  height = 220,
}: {
  data: Record<string, string | number>[]
  xKey: string
  series: { key: string; label: string; color?: string }[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="#EEF1F6" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#5A6B85' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#5A6B85' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} iconType="plainline" />}
        {series.map((item, index) => (
          <Line
            key={item.key}
            type="monotone"
            dataKey={item.key}
            name={item.label}
            stroke={item.color ?? CHART_COLORS[index % CHART_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

/** Combo bar + line — the Report Generation Summary panel. */
export function ComboChart({
  data,
  xKey,
  barKey,
  barLabel,
  lineKey,
  lineLabel,
  height = 220,
}: {
  data: Record<string, string | number>[]
  xKey: string
  barKey: string
  barLabel: string
  lineKey: string
  lineLabel: string
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="#EEF1F6" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#5A6B85' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#5A6B85' }} axisLine={false} tickLine={false} />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11, fill: '#5A6B85' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar yAxisId="left" dataKey={barKey} name={barLabel} fill="#1A56A8" radius={[3, 3, 0, 0]} barSize={18} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey={lineKey}
          name={lineLabel}
          stroke="#1B7A3D"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

/** Horizontal batch bars — Evaluation Progress Overview. */
export function BarProgressList({
  items,
  className,
}: {
  items: { name: string; pct: number }[]
  className?: string
}) {
  const tones = ['green', 'blue', 'purple', 'amber', 'navy'] as const

  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((item, index) => (
        <li key={item.name} className="flex items-center gap-3">
          <span className="w-16 shrink-0 text-[13px] text-navy-900">{item.name}</span>
          <ProgressBar
            value={item.pct}
            tone={tones[index % tones.length]}
            className="flex-1"
          />
          <span className="w-20 shrink-0 text-right text-[12px] text-grey-600">
            {item.pct === 0 ? 'Not Started' : `${item.pct}%`}
          </span>
        </li>
      ))}
    </ul>
  )
}
