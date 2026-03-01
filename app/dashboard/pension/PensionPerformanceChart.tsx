'use client'

import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

type ChartPoint = {
    month: string
    label: string
    current: number
    comparison: number
}

type Props = {
    data: ChartPoint[]
    comparisonLabel: string
}

type TooltipProps = {
    active?: boolean
    payload?: Array<{
        color?: string
        name?: string
        value?: number | string
        dataKey?: string
        payload: ChartPoint
    }>
    label?: string
}

const formatCurrency = (value: number): string =>
    `£${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function PerformanceTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload?.length) return null
    const currentSeries = payload.find((entry) => entry.dataKey === 'current')
    const comparisonSeries = payload.find((entry) => entry.dataKey === 'comparison')
    const currentValue = Number(currentSeries?.value ?? 0)
    const comparisonValue = Number(comparisonSeries?.value ?? 0)

    return (
        <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-lg">
            <p className="mb-2 text-xs font-medium text-slate-600">{label}</p>
            <div className="space-y-1 text-xs">
                <p className="font-semibold text-purple-700">CURRENT: {formatCurrency(currentValue)}</p>
                <p className="font-semibold text-red-600">{comparisonSeries?.name}: {formatCurrency(comparisonValue)}</p>
            </div>
        </div>
    )
}

export default function PensionPerformanceChart({ data, comparisonLabel }: Props) {
    const hasData = data.some((point) => point.current > 0 || point.comparison > 0)

    if (!hasData) {
        return (
            <section className="mb-8 rounded-2xl border border-red-500/35 bg-red-500/10 p-6">
                <h2 className="text-lg font-semibold text-red-200">Pension Performance</h2>
                <p className="mt-2 text-sm text-red-100">No pension data available for performance chart.</p>
            </section>
        )
    }

    return (
        <section className="mb-8 rounded-2xl border border-slate-300 bg-[#e5e5e5] p-6">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Pension Performance</h2>
                <p className="mt-1 text-xs text-slate-600">Current combined value compared with provider trend</p>
            </div>

            <div className="h-[380px] w-full rounded-xl border border-slate-300 bg-[#e5e5e5] p-3">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 12, right: 24, left: 8, bottom: 8 }}>
                        <CartesianGrid vertical={false} stroke="#94a3b8" strokeOpacity={0.5} />
                        <XAxis
                            dataKey="label"
                            tick={{ fill: '#111827', fontSize: 11, fontWeight: 500 }}
                            tickLine={false}
                            axisLine={{ stroke: '#6b7280' }}
                            minTickGap={18}
                        />
                        <YAxis
                            tickFormatter={(value) => `£${Number(value).toLocaleString()}`}
                            tick={{ fill: '#111827', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={110}
                        />
                        <Tooltip content={<PerformanceTooltip />} />
                        <Legend
                            verticalAlign="top"
                            align="center"
                            iconType="line"
                            wrapperStyle={{ color: '#111827', fontSize: 12, paddingBottom: 14 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="current"
                            name="CURRENT"
                            stroke="#a21caf"
                            strokeWidth={3}
                            activeDot={{ r: 4 }}
                            dot={false}
                            isAnimationActive={false}
                            connectNulls
                        />
                        <Line
                            type="monotone"
                            dataKey="comparison"
                            name={comparisonLabel}
                            stroke="#ef4444"
                            strokeWidth={2.5}
                            activeDot={{ r: 4 }}
                            dot={false}
                            isAnimationActive={false}
                            connectNulls
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    )
}
