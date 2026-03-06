'use client'

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import { useMemo } from 'react'

type SavingsPot = {
    name: string
    value: number
}

type Props = {
    pots: SavingsPot[]
    chartData: { month: string; label: string; current: number }[]
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6']

const formatGBP = (value: number): string =>
    `£${value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

function LineTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border border-white/10 bg-[#0e1629] px-4 py-3 shadow-xl text-xs">
            <p className="text-slate-400 mb-2 font-medium">{label}</p>
            {payload.map((entry: any) => (
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

function PieTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null
    const data = payload[0].payload
    return (
        <div className="rounded-lg border border-white/10 bg-[#0e1629] px-4 py-3 shadow-xl text-xs">
            <div className="flex items-center gap-2 py-0.5">
                <span
                    className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: data.fill }}
                />
                <span className="text-slate-400">{data.name}:</span>
                <span className="text-white font-semibold tabular-nums">
                    {formatGBP(Number(data.value ?? 0))}
                </span>
            </div>
        </div>
    )
}

export default function SavingsCharts({ pots, chartData }: Props) {
    const pieData = useMemo(() => {
        return pots
            .filter(p => p.value > 0)
            .sort((a, b) => b.value - a.value)
            .map((p, i) => ({
                ...p,
                fill: COLORS[i % COLORS.length]
            }))
    }, [pots])

    const totalPotsValue = useMemo(() => pieData.reduce((s, a) => s + a.value, 0), [pieData])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* 75% Line Chart */}
            <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden flex flex-col shadow-sm">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                    <div>
                        <h2 className="text-base font-semibold text-white">Savings History</h2>
                        <p className="text-xs text-white/50 mt-0.5">Total savings value over time</p>
                    </div>
                </div>
                <div className="h-[340px] w-full p-4 pt-6 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={20}
                            />
                            <YAxis
                                tickFormatter={formatGBP}
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                width={80}
                            />
                            <RechartsTooltip content={<LineTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
                            <Line
                                type="monotone"
                                dataKey="current"
                                name="Total Value"
                                stroke="#818cf8"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 25% Pie Chart */}
            <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden flex flex-col shadow-sm">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                    <div>
                        <h2 className="text-base font-semibold text-white">Pot Allocation</h2>
                        <p className="text-xs text-white/50 mt-0.5">Distribution across goals</p>
                    </div>
                </div>
                <div className="h-[340px] w-full p-4 flex flex-col justify-center items-center flex-1">
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<PieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend underneath */}
                    <div className="w-full mt-4 flex flex-col gap-2 px-2 max-h-[100px] overflow-y-auto custom-scrollbar">
                        {pieData.map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[10px]">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
                                    <span className="text-white/70 truncate">{entry.name}</span>
                                </div>
                                <span className="text-white font-medium ml-2 tabular-nums">
                                    {totalPotsValue > 0 ? Math.round((entry.value / totalPotsValue) * 100) : 0}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
