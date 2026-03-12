'use client'

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
} from 'recharts'
import { useState, useMemo } from 'react'

type TimeframeOption = '3m' | '6m' | '1y' | 'all'

type ChartPoint = {
    month: string
    label: string
    current: number
    comparison: number
    contributions: number
}

type Props = {
    data: ChartPoint[]
}

type TooltipProps = {
    active?: boolean
    payload?: Array<{
        color?: string
        name?: string
        value?: number | string
        dataKey?: string
    }>
    label?: string
}

const formatGBP = (value: number): string =>
    `£${value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

function CustomTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload?.length) return null

    return (
        <div className="rounded-lg border border-white/10 bg-[#0e1629] px-4 py-3 shadow-xl text-xs">
            <p className="text-slate-400 mb-2 font-medium">{label}</p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
                    <span
                        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: entry.color }}
                    />
                    <span className="text-slate-400">{entry.name}:</span>
                    <span className="text-white font-semibold tabular-nums">
                        {formatGBP(Number(entry.value ?? 0))}
                    </span>
                </div>
            ))}
        </div>
    )
}

export default function PensionPerformanceChart({ data }: Props) {
    const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('all')

    const filteredData = useMemo(() => {
        if (selectedTimeframe === 'all' || data.length === 0) return data

        const count = selectedTimeframe === '3m' ? 3 : selectedTimeframe === '6m' ? 6 : 12
        return data.slice(-count)
    }, [data, selectedTimeframe])

    const hasData = data.some((point) => point.current > 0 || point.contributions > 0)

    if (!hasData) {
        return (
            <section className="mb-8 rounded-xl border border-white/[0.07] bg-[#0e1629] p-6">
                <h2 className="text-base font-semibold text-white mb-1">Pension Performance</h2>
                <p className="text-sm text-slate-500">
                    No pension data yet. Add contributions and value snapshots to see your chart.
                </p>
            </section>
        )
    }

    return (
        <section className="mb-8 rounded-xl border border-white/[0.07] bg-[#0e1629] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                <div>
                    <h2 className="text-base font-semibold text-white">Pension Performance</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Total pension value vs cumulative contributions over time</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 mr-2">
                        <select
                            value={selectedTimeframe}
                            onChange={(e) => setSelectedTimeframe(e.target.value as TimeframeOption)}
                            className="h-12 bg-slate-900 border border-white/10 text-white/70 text-sm font-medium rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer hover:border-white/20 transition-colors"
                        >
                            <option value="3m">Last 3 Months</option>
                            <option value="6m">Last 6 Months</option>
                            <option value="1y">Last Year</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-3 h-0.5 bg-amber-400 rounded" />
                            Total Value
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-3 h-0.5 bg-emerald-500 rounded-full [border-style:dashed]" />
                            Contributions
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[340px] w-full p-4 pt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                        <CartesianGrid
                            vertical={false}
                            stroke="rgba(255,255,255,0.05)"
                        />
                        <XAxis
                            dataKey="label"
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={20}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tickFormatter={formatGBP}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
                        <Legend wrapperStyle={{ display: 'none' }} />

                        {/* Total pension value */}
                        <Line
                            type="monotone"
                            dataKey="current"
                            name="Total Value"
                            stroke="#fbbf24"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 4, fill: '#fbbf24', strokeWidth: 0 }}
                            isAnimationActive={false}
                            connectNulls
                        />

                        {/* Cumulative contributions */}
                        <Line
                            type="monotone"
                            dataKey="contributions"
                            name="Contributions"
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="5 3"
                            dot={false}
                            activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                            isAnimationActive={false}
                            connectNulls
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    )
}
