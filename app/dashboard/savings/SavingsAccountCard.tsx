'use client'

import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, ChevronRight, History, LayoutGrid, Minus, Pencil, PlusCircle, Trash2, Wallet } from 'lucide-react'
import type { DashboardSavingsAccount, DashboardSavingsPot } from '@/lib/dashboard-data'
import EditAccountModal from './EditAccountModal'
import PotOperationModal from './PotOperationModal'
import SavingsDepositModal from './SavingsDepositModal'
import SavingsHistoryModal from './SavingsHistoryModal'
import SavingsPotsModal from './SavingsPotsModal'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import PensionOperationModal from '../pension/PensionOperationModal'

type Props = {
    account: DashboardSavingsAccount
    totalSavingsValue: number
}

type PnlState = 'positive' | 'negative' | 'neutral'

const getPnlState = (value: number): PnlState => {
    const epsilon = 0.000001
    if (value > epsilon) return 'positive'
    if (value < -epsilon) return 'negative'
    return 'neutral'
}

export default function SavingsAccountCard({ account, totalSavingsValue }: Props) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDepositOpen, setIsDepositOpen] = useState(false)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [isPotsOpen, setIsPotsOpen] = useState(false)
    const [potModalOpen, setPotModalOpen] = useState(false)
    const [editingPot, setEditingPot] = useState<DashboardSavingsPot | null>(null)
    const [deletingPotId, setDeletingPotId] = useState<string | null>(null)
    const router = useRouter()

    const openCreatePotModal = () => {
        setEditingPot(null)
        setPotModalOpen(true)
    }

    const pnlLabel = `${account.totalPnl >= 0 ? '+' : ''}£${account.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const pnlPctLabel = `${account.totalPnlPercentage >= 0 ? '+' : ''}${account.totalPnlPercentage.toFixed(2)}%`
    const pnlState = getPnlState(account.totalPnl)
    const PnlIcon = pnlState === 'positive' ? ArrowUpRight : pnlState === 'negative' ? ArrowDownRight : Minus
    const pnlPillTone = pnlState === 'positive'
        ? 'border-green-500 bg-green-500/20 text-green-200'
        : pnlState === 'negative'
            ? 'border-red-500 bg-red-500/20 text-red-200'
            : 'border-amber-500 bg-amber-500/20 text-amber-200'

    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-colors flex flex-col h-full group/card">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h3 className="text-sm font-medium text-white/60">{account.name}</h3>
                    <p className="text-2xl font-bold text-white mt-1">
                        £{account.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 group-hover/card:scale-110 transition-transform">
                    <Wallet className="w-5 h-5" />
                </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${pnlPillTone}`}>
                    <PnlIcon className="mr-1 h-3.5 w-3.5" />
                    PNL {pnlLabel}
                </span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${pnlPillTone}`}>
                    {pnlPctLabel}
                </span>
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
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Deposit
                </button>
                <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/35 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/20 transition-colors"
                >
                    <History className="h-3.5 w-3.5" />
                    History
                </button>
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
                <SavingsDepositModal
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
        </div>
    )
}
