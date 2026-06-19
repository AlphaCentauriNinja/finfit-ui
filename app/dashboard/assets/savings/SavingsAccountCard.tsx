'use client'

import { useState } from 'react'
import { ArrowRightLeft, ChevronRight, History, LayoutGrid, Pencil, Wallet } from 'lucide-react'
import type { DashboardSavingsAccount } from '@/lib/dashboard-data'
import EditAccountModal from './EditAccountModal'
import SavingsTransactionModal from './SavingsTransactionModal'
import SavingsHistoryModal from './SavingsHistoryModal'
import SavingsPotsModal from './SavingsPotsModal'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'
import { formatCurrency } from '@/lib/utils'

type Props = {
    account: DashboardSavingsAccount
    totalSavingsValue: number
}

export default function SavingsAccountCard({ account, totalSavingsValue }: Props) {
    const { hideValues } = usePrivacy()
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDepositOpen, setIsDepositOpen] = useState(false)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [isPotsOpen, setIsPotsOpen] = useState(false)

    return (
        <>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors flex flex-col h-full group/card">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="text-sm font-medium text-white/60">{account.name}</h3>
                        <p className="text-2xl font-bold text-white mt-1">
                            {formatCurrency(account.totalValue, undefined, hideValues)}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 group-hover/card:scale-110 transition-transform">
                        <Wallet className="w-5 h-5" />
                    </div>
                </div>

                <div className="w-full bg-white/5 rounded-full h-1.5 mt-4 mb-6">
                    <div
                        className="bg-indigo-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${totalSavingsValue > 0 ? (account.totalValue / totalSavingsValue) * 100 : 0}%` }}
                    />
                </div>

                <div className="flex-1 space-y-4">
                    <button
                        onClick={() => setIsPotsOpen(true)}
                        className="w-full text-left group/pots"
                    >
                        <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 group-hover/pots:scale-110 transition-transform">
                                        <LayoutGrid className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Pots & Goals</p>
                                        <p className="text-sm font-medium text-white mt-0.5">
                                            {account.pots.length} {account.pots.length === 1 ? 'Pot' : 'Pots'} Active
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-white/20 group-hover/pots:text-white/60 group-hover/pots:translate-x-1 transition-all" />
                            </div>
                        </div>
                    </button>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setIsEditOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                    </button>
                    <button
                        onClick={() => setIsDepositOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/20 hover:text-indigo-100 transition-colors"
                    >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        Transaction
                    </button>
                    <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/35 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/20 transition-colors"
                    >
                        <History className="h-3.5 w-3.5" />
                        History
                    </button>
                </div>
            </div>

            {isEditOpen && (
                <EditAccountModal
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    accountId={account.id}
                    initialName={account.name}
                />
            )}

            {isDepositOpen && (
                <SavingsTransactionModal
                    isOpen={isDepositOpen}
                    onClose={() => setIsDepositOpen(false)}
                    account={account}
                />
            )}

            {isHistoryOpen && (
                <SavingsHistoryModal
                    isOpen={isHistoryOpen}
                    onClose={() => setIsHistoryOpen(false)}
                    account={account}
                />
            )}

            {isPotsOpen && (
                <SavingsPotsModal
                    isOpen={isPotsOpen}
                    onClose={() => setIsPotsOpen(false)}
                    account={account}
                />
            )}
        </>
    )
}
