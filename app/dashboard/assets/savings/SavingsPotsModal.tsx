'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Trash2, X, PlusCircle, LayoutGrid } from 'lucide-react'
import type { DashboardSavingsAccount, DashboardSavingsPot } from '@/lib/dashboard-data'
import PotOperationModal from './PotOperationModal'
import DeleteActionModal from '@/app/dashboard/components/DeleteActionModal'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'

type Props = {
    isOpen: boolean
    onClose: () => void
    account: DashboardSavingsAccount
}

export default function SavingsPotsModal({ isOpen, onClose, account }: Props) {
    const { hideValues } = usePrivacy()
    const [potModalOpen, setPotModalOpen] = useState(false)
    const [editingPot, setEditingPot] = useState<DashboardSavingsPot | null>(null)
    const [deletingPotId, setDeletingPotId] = useState<string | null>(null)
    const router = useRouter()

    const openCreatePotModal = () => {
        setEditingPot(null)
        setPotModalOpen(true)
    }

    const openEditPotModal = (pot: DashboardSavingsPot) => {
        setEditingPot(pot)
        setPotModalOpen(true)
    }

    const confirmDeletePot = async () => {
        if (!deletingPotId) return
        
        const potId = deletingPotId
        const supabase = createClient()
        await supabase.from('savings_pots').delete().eq('id', potId)

        setDeletingPotId(null)
        router.refresh()
    }

    const handleDeletePot = (potId: string) => {
        setDeletingPotId(potId)
    }

    if (!isOpen) return null

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
                <div className="relative w-full max-w-5xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                    <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                <LayoutGrid className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Pots & Goals</h2>
                                <p className="text-xs text-white/60 mt-1">{account.name}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-rose-300 hover:text-rose-300 transition-colors p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm font-semibold text-white/40 uppercase tracking-wider">Your Distribution</p>
                            <button
                                onClick={openCreatePotModal}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Add New Pot
                            </button>
                        </div>

                        {account.pots.length === 0 ? (
                            <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-12 text-center">
                                <p className="text-sm text-white/40 italic">No pots inside this account.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {account.pots.map((pot) => {
                                    const hasTarget = pot.targetAmount !== null && pot.targetAmount > 0
                                    const progressPercentage = hasTarget
                                        ? Math.min(100, Math.round((pot.balance / pot.targetAmount!) * 100))
                                        : 0

                                    return (
                                        <div
                                            key={pot.id}
                                            className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-white truncate">{pot.name}</h3>
                                                    <p className="text-2xl font-black text-white mt-1">
                                                        {hideValues ? '****' : `£${pot.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => openEditPotModal(pot)}
                                                        className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePot(pot.id)}
                                                        className="p-2 rounded-xl bg-rose-500/5 text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-rose-500/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {hasTarget && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs font-semibold">
                                                        <span className="text-white/40">Target Progress</span>
                                                        <span className="text-white">{hideValues ? '****' : `${progressPercentage}%`}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                                            style={{ width: hideValues ? '0%' : `${progressPercentage}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-white/30 font-medium">
                                                        {hideValues ? 'Goal: ****' : `Goal: £${pot.targetAmount?.toLocaleString()}`}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-white/10 bg-white/[0.02] shrink-0">
                        <button
                            onClick={onClose}
                            className="w-full rounded-xl border border-rose-500/35 px-4 py-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/10 transition-all shadow-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {potModalOpen && (
                <PotOperationModal
                    isOpen={potModalOpen}
                    onClose={() => {
                        setPotModalOpen(false)
                        setEditingPot(null)
                    }}
                    accountId={account.id}
                    potId={editingPot?.id}
                    initialName={editingPot?.name || ''}
                    initialBalance={editingPot?.balance || 0}
                    initialTarget={editingPot?.targetAmount || null}
                />
            )}

            <DeleteActionModal
                isOpen={!!deletingPotId}
                onClose={() => setDeletingPotId(null)}
                onConfirm={confirmDeletePot}
                title="Delete Pot?"
                message={`Are you sure you want to delete this pot?`}
                confirmText="Delete"
                isProcessing={false} // Add a state if needed, but it's fast
            />

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </>
    )
}
