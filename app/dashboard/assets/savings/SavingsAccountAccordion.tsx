'use client'

import { useState } from 'react'
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import type { DashboardSavingsAccount, DashboardSavingsPot } from '@/lib/dashboard-data'
import EditAccountModal from './EditAccountModal'
import PotOperationModal from './PotOperationModal'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import PensionOperationModal from '../pension/PensionOperationModal'

type Props = {
    accounts: DashboardSavingsAccount[]
}

export default function SavingsAccountAccordion({ accounts }: Props) {
    const [openAccountId, setOpenAccountId] = useState<string | null>(
        accounts.length > 0 ? accounts[0].id : null
    )

    // Edit Account State
    const [editAccountTarget, setEditAccountTarget] = useState<DashboardSavingsAccount | null>(null)

    // Pot Operation State
    const [potModalOpen, setPotModalOpen] = useState(false)
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
    const [editingPot, setEditingPot] = useState<DashboardSavingsPot | null>(null)

    // Delete Pot State
    const [deletingPotId, setDeletingPotId] = useState<string | null>(null)
    const router = useRouter()

    const handleToggleAccount = (id: string) => {
        setOpenAccountId(prev => (prev === id ? null : id))
    }

    const openCreatePotModal = (accountId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedAccountId(accountId)
        setEditingPot(null)
        setPotModalOpen(true)
    }

    const openEditPotModal = (accountId: string, pot: DashboardSavingsPot, e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedAccountId(accountId)
        setEditingPot(pot)
        setPotModalOpen(true)
    }

    const handleDeletePot = async (potId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this pot?')) return

        setDeletingPotId(potId)
        const supabase = createClient()

        await supabase.from('savings_pots').delete().eq('id', potId)

        setDeletingPotId(null)
        router.refresh()
    }

    const handleClosePotModal = () => {
        setPotModalOpen(false)
        setEditingPot(null)
        setSelectedAccountId(null)
    }

    if (accounts.length === 0) {
        return (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center backdrop-blur-sm">
                <p className="text-red-200/90 font-medium mb-4">No savings accounts created yet.</p>
                <p className="text-sm text-red-200/60">Use the Add Account button to get started.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {accounts.map((account) => {
                const isOpen = openAccountId === account.id

                return (
                    <div
                        key={account.id}
                        className="rounded-2xl border border-white/10 bg-[#0e1629]/80 backdrop-blur-md overflow-hidden transition-all duration-300 shadow-lg"
                    >
                        {/* Accordion Header (Account level) */}
                        <div
                            onClick={() => handleToggleAccount(account.id)}
                            className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <ChevronDown
                                    className={`w-5 h-5 text-white/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                />
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                                    {account.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                        {account.name}
                                    </h3>
                                    <p className="text-xs text-white/50">{account.pots.length} Pot{account.pots.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="font-bold text-lg text-white tabular-nums">
                                    £{account.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setEditAccountTarget(account)
                                        }}
                                        className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => openCreatePotModal(account.id, e)}
                                        className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 rounded-lg transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Accordion Body (Pots level) */}
                        {isOpen && (
                            <div className="overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                                {account.pots.length === 0 ? (
                                    <div className="p-6 text-center border-t border-white/[0.05] bg-black/20">
                                        <p className="text-sm text-white/40 mb-3">No pots inside this account.</p>
                                        <button
                                            onClick={(e) => openCreatePotModal(account.id, e)}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add First Pot
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-2 px-4 pb-4 bg-black/20 border-t border-white/[0.05]">
                                        <div className="grid gap-2">
                                            {account.pots.map(pot => {
                                                const hasTarget = pot.targetAmount !== null && pot.targetAmount > 0;
                                                const progressPercentage = hasTarget
                                                    ? Math.min(100, Math.round((pot.balance / pot.targetAmount!) * 100))
                                                    : 0;

                                                return (
                                                    <div
                                                        key={pot.id}
                                                        className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                                                    >
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <div className="flex items-baseline justify-between mb-1.5">
                                                                <span className="font-medium text-white/80 truncate text-sm">
                                                                    {pot.name}
                                                                </span>
                                                                <span className="font-semibold text-white/90 tabular-nums text-sm">
                                                                    £{pot.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                            {hasTarget && (
                                                                <div className="w-full">
                                                                    <div className="flex justify-between text-[10px] text-white/50 mb-1 font-medium">
                                                                        <span>{progressPercentage}%</span>
                                                                        <span>Target: £{pot.targetAmount?.toLocaleString()}</span>
                                                                    </div>
                                                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-indigo-500 rounded-full"
                                                                            style={{ width: `${progressPercentage}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => openEditPotModal(account.id, pot, e)}
                                                                className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeletePot(pot.id, e)}
                                                                className="p-1.5 text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}

            {/* Editing Top-Level Account */}
            {editAccountTarget && (
                <EditAccountModal
                    isOpen={!!editAccountTarget}
                    onClose={() => setEditAccountTarget(null)}
                    accountId={editAccountTarget.id}
                    initialName={editAccountTarget.name}
                />
            )}

            {/* Creating / Editing a Pot */}
            {selectedAccountId && (
                <PotOperationModal
                    isOpen={potModalOpen}
                    onClose={handleClosePotModal}
                    accountId={selectedAccountId}
                    potId={editingPot?.id}
                    initialName={editingPot?.name || ''}
                    initialBalance={editingPot?.balance || 0}
                    initialTarget={editingPot?.targetAmount || null}
                />
            )}

            {/* Spinner for fast pot deletions */}
            <PensionOperationModal
                isOpen={!!deletingPotId}
                title="Deleting Pot"
                message="Please wait..."
            />
        </div>
    )
}
