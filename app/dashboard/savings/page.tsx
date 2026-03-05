'use client'

import { ArrowUpRight, Plus } from 'lucide-react'
import SavingsCharts from './SavingsCharts'
import { useDashboardData } from '@/app/dashboard/components/providers/DashboardDataProvider'
import SavingsAccountAccordion from './SavingsAccountAccordion'
import { useState } from 'react'
import AddAccountModal from './AddAccountModal'

export default function SavingsPage() {
    const dashboardData = useDashboardData()
    const savingsAccounts = dashboardData.savings.accounts
    const total = dashboardData.savings.totalValue
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Format the data for the pie chart
    const chartAccounts = savingsAccounts.map(acc => ({
        name: acc.name,
        value: acc.totalValue
    }))

    // Hardcoded positive mock PNL to match pension page style
    const mockPnl = total > 0 ? total * 0.03 : 0 // Mocking a 3% return
    const mockPnlPct = 3.00
    const totalPnlLabel = `+£${mockPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const totalPnlPctLabel = `+${mockPnlPct.toFixed(2)}%`
    const totalPnlPillTone = 'border-green-500 bg-green-500/20 text-green-200'

    return (
        <div className="w-full">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Savings Accounts</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Account</span>
                </button>
            </div>

            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                <p className="text-sm font-medium text-white/60">Total Value</p>
                <p className="mt-2 text-3xl font-bold text-white">
                    £{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${totalPnlPillTone}`}>
                        <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
                        PNL {totalPnlLabel}
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${totalPnlPillTone}`}>
                        {totalPnlPctLabel}
                    </span>
                </div>
            </div>

            <SavingsCharts accounts={chartAccounts} chartData={dashboardData.savings.chartData} />

            {dashboardData.savings.loadError ? (
                <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    HTTP 500: could not load savings data
                </div>
            ) : null}

            {/* Render the Accordion component for dynamic Accounts/Pots */}
            <SavingsAccountAccordion accounts={savingsAccounts} />

            {/* Modal for creating a new independent Top-Level Bank Account */}
            <AddAccountModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    )
}
