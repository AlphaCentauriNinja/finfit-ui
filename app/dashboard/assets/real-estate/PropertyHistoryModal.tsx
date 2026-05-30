/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { History, Loader2, X, Trash2, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react'

type Transaction = {
    id: string
    transaction_type: 'PAYMENT' | 'ADJUSTMENT'
    amount: number
    transaction_date: string
    notes: string | null
    created_at: string
}

type Props = {
    isOpen: boolean
    onClose: () => void
    property: { id: string; name: string }
    onDeleted?: () => void
}

export default function PropertyHistoryModal({ isOpen, onClose, property, onDeleted }: Props) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        const supabase = createClient()

        const { data, error: fetchError } = await supabase
            .from('real_estate_transactions')
            .select('*')
            .eq('property_id', property.id)
            .order('transaction_date', { ascending: false })
            .order('created_at', { ascending: false })

        if (fetchError) {
            setError(fetchError.message)
        } else {
            setTransactions(data || [])
        }
        setIsLoading(false)
    }, [property.id])

    useEffect(() => {
        if (isOpen) {
            void fetchTransactions()
        }
    }, [isOpen, fetchTransactions])

    const handleDelete = async (tx: Transaction) => {
        if (!confirm('Are you sure you want to delete this transaction record? This will NOT revert the property balance updates.')) {
            return
        }

        const supabase = createClient()
        const { error: deleteError } = await supabase
            .from('real_estate_transactions')
            .delete()
            .eq('id', tx.id)

        if (deleteError) {
            alert(deleteError.message)
            return
        }

        setTransactions(prev => prev.filter(t => t.id !== tx.id))
        if (onDeleted) onDeleted()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <History className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Transaction History</h3>
                            <p className="text-xs text-white/50">{property.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                            <p className="text-sm text-white/40">Loading history...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-300 text-sm text-center">
                            {error}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12 px-6">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <Info className="w-6 h-6 text-white/20" />
                            </div>
                            <h4 className="text-sm font-semibold text-white mb-1">No Transactions</h4>
                            <p className="text-xs text-white/40 max-w-[200px] mx-auto">
                                Mortgage payments and value adjustments will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="bg-white/5 border border-white/10 rounded-xl p-4 transition-colors hover:bg-white/[0.07] group">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className={`p-2 rounded-lg mt-0.5 border ${
                                                tx.transaction_type === 'PAYMENT' 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'
                                                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10'
                                            }`}>
                                                {tx.transaction_type === 'PAYMENT' 
                                                    ? <ArrowDownRight className="w-4 h-4" /> 
                                                    : <ArrowUpRight className="w-4 h-4" />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-bold text-white">
                                                        {tx.transaction_type === 'PAYMENT' ? 'Mortgage Payment' : 'Value Adjustment'}
                                                    </span>
                                                    <span className="text-xs text-white/40">
                                                        {new Date(tx.transaction_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                {tx.notes && (
                                                    <p className="text-xs text-white/50 mt-1 line-clamp-2 italic">
                                                        &quot;{tx.notes}&quot;
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-white">
                                                £{new Intl.NumberFormat('en-GB').format(tx.amount)}
                                            </p>
                                            <button 
                                                onClick={() => handleDelete(tx)}
                                                className="mt-2 p-1.5 text-rose-500/40 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/10 bg-white/[0.02]">
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl border border-rose-500/35 text-rose-300 px-4 py-3 text-sm font-semibold hover:bg-rose-500/10 transition-colors"
                    >
                        Close History
                    </button>
                </div>
            </div>
        </div>
    )
}
