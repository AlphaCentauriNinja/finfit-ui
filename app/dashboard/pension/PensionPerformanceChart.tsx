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
    date: string
    label: string
    totalValue: number
    contributions: number
    pnl: number
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
        payload: ChartPoint
    }>
    label?: string
}

const formatCurrency = (value: number): string =>
    `£${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function PerformanceTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload?.length) return null
    const point = payload[0].payload

    return (
        <div className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 shadow-lg">
            <p className="mb-2 text-xs text-white/70">{label}</p>
            <div className="space-y-1 text-xs">
                <p className="text-indigo-200">Total Value: {formatCurrency(point.totalValue)}</p>
                <p className="text-cyan-200">Contributions: {formatCurrency(point.contributions)}</p>
                <p className={point.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                    PNL: {point.pnl >= 0 ? '+' : ''}{formatCurrency(point.pnl)}
                </p>
            </div>
        </div>
    )
}

export default function PensionPerformanceChart({ data }: Props) {
    return (
        <section className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-white">Pension Performance</h2>
                <p className="mt-1 text-xs text-white/60">Total value vs cumulative contributions</p>
            </div>

            <div className="h-[340px] w-full rounded-xl border border-white/10 bg-[#0b1220] p-3">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 12, right: 16, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                        <XAxis
                            dataKey="label"
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(148,163,184,0.24)' }}
                            minTickGap={24}
                        />
                        <YAxis
                            tickFormatter={(value) => `£${Number(value).toLocaleString()}`}
                            tick={{ fill: '#cbd5e1', fontSize: 10 }}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(148,163,184,0.24)' }}
                            width={78}
                        />
                        <Tooltip content={<PerformanceTooltip />} />
                        <Legend
                            wrapperStyle={{ color: '#e2e8f0', fontSize: 12 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="totalValue"
                            name="Total Value"
                            stroke="#818cf8"
                            strokeWidth={2.5}
                            dot={false}
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="contributions"
                            name="Contributions"
                            stroke="#22d3ee"
                            strokeWidth={2.2}
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    )
}
