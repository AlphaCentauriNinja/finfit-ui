'use client'

import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { useDashboardData } from '@/app/dashboard/components/providers/DashboardDataProvider'
import AddPensionButton from './AddPensionButton'
import PensionAccountCard from './PensionAccountCard'
import PensionPerformanceChart from './PensionPerformanceChart'

type PnlState = 'positive' | 'negative' | 'neutral'

const getPnlState = (value: number): PnlState => {
    const epsilon = 0.000001
    if (value > epsilon) return 'positive'
    if (value < -epsilon) return 'negative'
    return 'neutral'
}

export default function PensionPage() {
    const dashboardData = useDashboardData()
    const pensions = dashboardData.pension.accounts
    const total = dashboardData.pension.totalValue
    const totalPnlPerformance = dashboardData.pension.totalPnl
    const totalPnlPercentage = dashboardData.pension.totalPnlPercentage
    const totalPnlLabel = `${totalPnlPerformance >= 0 ? '+' : ''}£${totalPnlPerformance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const totalPnlPctLabel = `${totalPnlPercentage >= 0 ? '+' : ''}${totalPnlPercentage.toFixed(2)}%`
    const totalPnlState = getPnlState(totalPnlPerformance)
    const TotalPnlIcon = totalPnlState === 'positive' ? ArrowUpRight : totalPnlState === 'negative' ? ArrowDownRight : Minus
    const totalPnlPillTone = totalPnlState === 'positive'
        ? 'border-green-500 bg-green-500/20 text-green-200'
        : totalPnlState === 'negative'
            ? 'border-red-500 bg-red-500/20 text-red-200'
            : 'border-amber-500 bg-amber-500/20 text-amber-200'

    return (
        <div className="w-full">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Pensions</h1>
                <AddPensionButton />
            </div>

            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                <p className="text-sm font-medium text-white/60">Total Value</p>
                <p className="mt-2 text-3xl font-bold text-white">
                    £{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${totalPnlPillTone}`}>
                        <TotalPnlIcon className="mr-1 h-3.5 w-3.5" />
                        PNL {totalPnlLabel}
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${totalPnlPillTone}`}>
                        {totalPnlPctLabel}
                    </span>
                </div>
            </div>

            <PensionPerformanceChart
                data={dashboardData.pension.chartData}
            />

            {dashboardData.pension.loadError ? (
                <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    HTTP 500: could not load pension
                </div>
            ) : null}

            {pensions.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70 shadow-sm backdrop-blur-sm">
                    No pension accounts yet. Use <span className="font-medium text-white">Add Pension</span> to create your first entry.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {pensions.map((pension) => (
                        <PensionAccountCard
                            key={pension.id}
                            pension={pension}
                            total={total}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

