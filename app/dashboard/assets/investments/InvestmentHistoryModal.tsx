'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Loader2, ArrowUpRight, ArrowDownRight, Minus, History, Trash2 } from 'lucide-react'
import type { InvestmentHoldingRow } from './types'

type Transaction = {
    id: string
    transaction_type: 'BUY' | 'SELL' | 'ADJUSTMENT'
    amount: number
    invested_amount_impact: number
    current_value_impact: number
    transaction_date: string
    notes: string | null
    created_at: string
}

type Props = {
    isOpen: boolean
    onClose: () => void
    holding: InvestmentHoldingRow
    preferredCurrency: string
    formatCurrency: (val: number, curr: any) => string
}

export default function InvestmentHistoryModal({ 
    isOpen, 
    onClose, 
    holding, 
    preferredCurrency,
    formatCurrency 
}: Props) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen) return

        const fetchHistory = async () => {
            setIsLoading(true)
            setError(null)
            const supabase = createClient()

            const { data, error: fetchError } = await supabase
                .from('investment_transactions')
                .select('*')
                .eq('holding_id', holding.id)
                .order('transaction_date', { ascending: false })
                .order('created_at', { ascending: false })

            if (fetchError) {
                setError(fetchError.message)
            } else {
                setTransactions(data || [])
            }
            setIsLoading(false)
        }

        void fetchHistory()
    }, [isOpen, holding.id])

    if (!isOpen) return null

    const deleteTransaction = async (id: string, investedImpact: number, currentValueImpact: number) => {
        if (!confirm('Delete this transaction and reverse its impact on the holding?')) return

        const supabase = createClient()
        const { error: deleteError } = await supabase
            .from('investment_transactions')
            .delete()
            .eq('id', id)

        if (deleteError) {
            alert(deleteError.message)
            return
        }

        // Reverse the impact
        await supabase
            .from('investment_holdings')
            .update({
                invested_amount: holding.investedAmount - investedImpact,
                current_value: holding.currentValue - currentValueImpact,
                updated_at: new Date().toISOString()
            })
            .eq('id', holding.id)

        setTransactions(prev => prev.filter(t => t.id !== id))
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <History className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Investment History</h3>
                            <p className="mt-0.5 text-xs text-white/50">{holding.name} ({holding.ticker})</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white" aria-label="Close history modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-950/30">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-white/40">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
                            <p className="text-sm">Loading activity logs...</p>
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-300 text-sm">
                            {error}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5 mb-4 border border-white/10 text-white/20">
                                <Minus className="h-6 w-6" />
                            </div>
                            <p className="text-white/40 text-sm">No transaction history found for this holding.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx) => {
                                const isPositive = tx.current_value_impact > 0
                                const isNegative = tx.current_value_impact < 0
                                
                                return (
                                    <div key={tx.id} className="bg-white/5 border border-white/10 rounded-xl p-4 transition-colors hover:bg-white/[0.07] group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4 items-start">
                                                <div className={`mt-1 h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                    tx.transaction_type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 
                                                    tx.transaction_type === 'SELL' ? 'bg-rose-500/10 text-rose-400' : 
                                                    'bg-indigo-500/10 text-indigo-400'
                                                }`}>
                                                    {tx.transaction_type === 'BUY' ? <ArrowUpRight className="w-4 h-4" /> : 
                                                     tx.transaction_type === 'SELL' ? <ArrowDownRight className="w-4 h-4" /> : 
                                                     <TrendingUp className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-white">{tx.transaction_type}</span>
                                                        <span className="text-xs text-white/40">
                                                            {new Date(tx.transaction_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    {tx.notes && <p className="mt-1 text-sm text-white/50 italic leading-relaxed">{tx.notes}</p>}
                                                    <div className="mt-2 flex gap-4 text-xs font-medium">
                                                        <div className="flex flex-col">
                                                            <span className="text-white/30 uppercase tracking-wider text-[10px]">Value Impact</span>
                                                            <span className={tx.current_value_impact >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                                                {tx.current_value_impact >= 0 ? '+' : ''}{formatCurrency(tx.current_value_impact, preferredCurrency)}
                                                            </span>
                                                        </div>
                                                        {tx.transaction_type !== 'ADJUSTMENT' && (
                                                            <div className="flex flex-col">
                                                                <span className="text-white/30 uppercase tracking-wider text-[10px]">Cost Impact</span>
                                                                <span className={tx.invested_amount_impact >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                                                    {tx.invested_amount_impact >= 0 ? '+' : ''}{formatCurrency(tx.invested_amount_impact, preferredCurrency)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => deleteTransaction(tx.id, tx.invested_amount_impact, tx.current_value_impact)}
                                                className="p-2 text-white/20 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete transaction"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-white/70 hover:text-white transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}
