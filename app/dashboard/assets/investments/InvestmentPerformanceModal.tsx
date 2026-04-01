'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Props = {
    isOpen: boolean
    onClose: () => void
}

type TxRow = {
    transaction_date: string
    created_at: string
    invested_amount_impact: number
    current_value_impact: number
}

type ChartPoint = {
    date: string
    label: string
    current: number
    contributions: number
}

const formatGBP = (value: number): string =>
    `£${value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

function CustomTooltip({ active, payload, label }: any) {
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

export default function InvestmentPerformanceModal({ isOpen, onClose }: Props) {
    const [transactions, setTransactions] = useState<TxRow[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        const fetchTx = async () => {
            setIsLoading(true)
            const supabase = createClient()
            const { data, error } = await supabase
                .from('investment_transactions')
                .select('transaction_date, created_at, invested_amount_impact, current_value_impact')
                .order('transaction_date', { ascending: true })
                .order('created_at', { ascending: true })

            if (!error) setTransactions((data ?? []) as TxRow[])
            setIsLoading(false)
        }
        void fetchTx()
    }, [isOpen])

    const chartData = useMemo<ChartPoint[]>(() => {
        if (!transactions.length) return []

        const sorted = [...transactions].sort((a, b) => {
            if (a.transaction_date === b.transaction_date) {
                return a.created_at.localeCompare(b.created_at)
            }
            return a.transaction_date.localeCompare(b.transaction_date)
        })

        const points: ChartPoint[] = []
        let cumulativeInvested = 0
        let cumulativeCurrent = 0
        let lastDate = ''

        for (const tx of sorted) {
            cumulativeInvested += Number(tx.invested_amount_impact) || 0
            cumulativeCurrent += Number(tx.current_value_impact) || 0
            const label = new Date(tx.transaction_date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: '2-digit',
            })

            // only push once per day; overwrite with latest cumulative
            if (tx.transaction_date === lastDate) {
                points[points.length - 1] = {
                    date: tx.transaction_date,
                    label,
                    current: cumulativeCurrent,
                    contributions: cumulativeInvested,
                }
            } else {
                points.push({
                    date: tx.transaction_date,
                    label,
                    current: cumulativeCurrent,
                    contributions: cumulativeInvested,
                })
                lastDate = tx.transaction_date
            }
        }

        return points
    }, [transactions])

    if (!isOpen) return null

    const hasData = chartData.length > 0

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl pointer-events-auto"
                onClick={onClose}
            />
            <div className="relative z-10 w-full h-full max-h-[calc(100vh-2rem)] max-w-6xl rounded-2xl border border-white/10 bg-[#0e1629] shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
                <button
                    onClick={onClose}
                    type="button"
                    className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-rose-500/15 text-rose-200 hover:bg-rose-500/25 transition-colors"
                    aria-label="Close performance modal"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex-1 w-full p-6 pt-10">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading…</div>
                    ) : !hasData ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center">
                            No transactions yet. Add buys/deposits to see performance.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
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
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
                                <Line
                                    type="monotone"
                                    dataKey="current"
                                    name="Current Value"
                                    stroke="#fbbf24"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#fbbf24', strokeWidth: 0 }}
                                    isAnimationActive={false}
                                    connectNulls
                                />
                                <Line
                                    type="monotone"
                                    dataKey="contributions"
                                    name="Deposits"
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
                    )}
                </div>
            </div>
        </div>
    )
}
