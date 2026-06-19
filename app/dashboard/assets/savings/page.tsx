/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { ArrowUpRight, Plus, PiggyBank, Target, CreditCard } from 'lucide-react'
import SavingsCharts from './SavingsCharts'
import { useDashboardData } from '@/app/dashboard/components/providers/DashboardDataProvider'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import SavingsAccountCard from './SavingsAccountCard'
import { useState, useMemo } from 'react'
import AddAccountModal from './AddAccountModal'
import EmptyStateAlert from '@/app/dashboard/components/EmptyStateAlert'
import AssetOnboardingHero from '@/app/dashboard/components/AssetOnboardingHero'
import { formatCurrency } from '@/lib/utils'

export default function SavingsPage() {
    const dashboardData = useDashboardData()
    const { hideValues } = usePrivacy()
    const savingsAccounts = dashboardData.savings.accounts
    const total = dashboardData.savings.totalValue
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Format all pots from all accounts specifically for the distribution pie chart
    const allPots = useMemo(() => {
        return savingsAccounts.flatMap(acc =>
            acc.pots.map(pot => ({
                name: pot.name,
                value: pot.balance
            }))
        )
    }, [savingsAccounts])

    // Mock PNL to match pension page style (3% return as in original page.tsx)
    const mockPnl = total * 0.03
    const mockPnlPct = 3.00
    const totalPnlLabel = hideValues ? '****' : `+£${mockPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const totalPnlPctLabel = hideValues ? '****' : `+${mockPnlPct.toFixed(2)}%`
    const totalPnlPillTone = 'border-green-500 bg-green-500/20 text-green-200'

    const hasSavings = savingsAccounts.length > 0

    return (
        <div className="w-full">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Savings</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Account</span>
                </button>
            </div>

            {hasSavings ? (
                <>
                    <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm">
                        <p className="text-sm font-medium text-white/60">Total Savings Value</p>
                        <p className="mt-2 text-3xl font-bold text-white">
                            {formatCurrency(total, undefined, hideValues)}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${totalPnlPillTone}`}>
                                <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
                                PNL {totalPnlLabel}
                            </span>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${totalPnlPillTone}`}>
                                {totalPnlPctLabel}
                            </span>
                        </div>
                    </div>

                    {!hideValues ? (
                        <SavingsCharts pots={allPots} chartData={dashboardData.savings.chartData} />
                    ) : null}
                </>
            ) : null}

            {dashboardData.savings.loadError ? (
                <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    HTTP 500: could not load savings data
                </div>
            ) : null}

            {hasSavings ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {savingsAccounts.map((account) => (
                        <SavingsAccountCard
                            key={account.id}
                            account={account}
                            totalSavingsValue={total}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    <EmptyStateAlert
                        description="No savings accounts tracked yet. Use the Add Account button above to monitor your cash reserves."
                    />

                    <AssetOnboardingHero
                        title="Track Your Savings & Goals"
                        description="Monitor your cash reserves across different accounts and specialized savings pots. FinFit helps you stay on top of your financial safety net."
                        items={[
                            {
                                icon: PiggyBank,
                                title: "High-Interest Accounts",
                                description: "Track your main savings accounts, ISAs, and emergency funds. Monitor interest rates and total balances in one place.",
                                colorClass: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
                            },
                            {
                                icon: Target,
                                title: "Savings Pots",
                                description: "Divide your savings into specific goals like 'House Deposit' or 'Travel' to track your progress towards what matters most.",
                                colorClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            }
                        ]}
                        actionText="Add First Account"
                        onAction={() => setIsAddModalOpen(true)}
                    />
                </div>
            )}

            <AddAccountModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    )
}
