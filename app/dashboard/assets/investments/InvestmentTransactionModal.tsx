'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DatePickerField from '@/app/dashboard/components/DatePickerField'
import type { InvestmentHoldingRow } from './types'

type TransactionType = 'BUY' | 'SELL' | 'ADJUSTMENT'

type Props = {
    isOpen: boolean
    onClose: () => void
    holding: InvestmentHoldingRow
}

const todayIso = new Date().toISOString().slice(0, 10)

export default function InvestmentTransactionModal({ isOpen, onClose, holding }: Props) {
    const [transactionType, setTransactionType] = useState<TransactionType>('BUY')
    const [amount, setAmount] = useState('')
    const [transactionDate, setTransactionDate] = useState(todayIso)
    const [notes, setNotes] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    if (!isOpen) return null

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError(null)

        const parsedAmount = Number(amount)
        const cleanNotes = notes.trim()

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setError('Amount must be greater than 0.')
            return
        }

        setIsSaving(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setError('Session not found. Please sign in again.')
            setIsSaving(false)
            return
        }

        // Calculate impacts
        let investedImpact = 0
        let currentValueImpact = 0

        if (transactionType === 'BUY') {
            investedImpact = parsedAmount
            currentValueImpact = parsedAmount
        } else if (transactionType === 'SELL') {
            investedImpact = -parsedAmount
            currentValueImpact = -parsedAmount
        } else if (transactionType === 'ADJUSTMENT') {
            // Adjustment in this context means "Set new current value" or "Relative adjustment"
            // For simplicity, let's treat it as a relative adjustment to the total current value
            currentValueImpact = parsedAmount
        }

        // 1. Record the transaction
        const { error: txError } = await supabase.from('investment_transactions').insert({
            user_id: user.id,
            holding_id: holding.id,
            transaction_type: transactionType,
            amount: parsedAmount,
            invested_amount_impact: investedImpact,
            current_value_impact: currentValueImpact,
            transaction_date: transactionDate,
            notes: cleanNotes || null,
        })

        if (txError) {
            setError(txError.message)
            setIsSaving(false)
            return
        }

        // 2. Update the holding total
        const { error: updateError } = await supabase.rpc('update_investment_holding_totals', {
            target_holding_id: holding.id,
            v_invested_impact: investedImpact,
            v_current_impact: currentValueImpact
        })

        // Fallback if RPC doesn't exist yet (I'll create it in a separate migration or just use manual update)
        if (updateError) {
            const { error: manualError } = await supabase
                .from('investment_holdings')
                .update({
                    invested_amount: holding.investedAmount + investedImpact,
                    current_value: holding.currentValue + currentValueImpact,
                    updated_at: new Date().toISOString()
                })
                .eq('id', holding.id)

            if (manualError) {
                setError(manualError.message)
                setIsSaving(false)
                return
            }
        }

        setIsSaving(false)
        onClose()
        router.refresh()
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Add Transaction</h3>
                        <p className="mt-1 text-xs text-white/50">{holding.name} ({holding.ticker})</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white" aria-label="Close transaction modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['BUY', 'SELL', 'ADJUSTMENT'] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setTransactionType(type)}
                                        className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                                            transactionType === type
                                                ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300 shadow-sm shadow-indigo-500/10'
                                                : 'border-white/10 bg-slate-900 text-white/60 hover:bg-white/5 hover:text-white/80'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">
                                {transactionType === 'ADJUSTMENT' ? 'Adjustment Amount (Relative)' : 'Total Amount (GBP)'}
                            </label>
                            <input
                                type="number"
                                required
                                min={transactionType === 'ADJUSTMENT' ? undefined : "0"}
                                step="any"
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="0.00"
                            />
                        </div>

                        <DatePickerField
                            label="Transaction Date"
                            value={transactionDate}
                            onChange={setTransactionDate}
                            disabled={isSaving}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Notes (Optional)</label>
                            <textarea
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                rows={3}
                                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="e.g. Monthly top-up"
                            />
                        </div>
                    </div>

                    {error ? (
                        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                            {error}
                        </div>
                    ) : null}

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 rounded-xl border border-rose-500/35 text-rose-300 px-4 py-3 text-sm font-semibold hover:bg-rose-500/10 transition-colors disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isSaving ? 'Saving...' : 'Save Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
