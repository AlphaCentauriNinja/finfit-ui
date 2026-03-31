'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRightLeft, Loader2, X } from 'lucide-react'
import DatePickerField from '@/app/dashboard/components/DatePickerField'
import type { InvestmentAccountCardData, InvestmentHoldingRow } from './types'

type TransactionType = 'BUY' | 'SELL' | 'ADJUSTMENT'

type Props = {
    isOpen: boolean
    onClose: () => void
    account: InvestmentAccountCardData
}

const todayIso = new Date().toISOString().slice(0, 10)

export default function AccountTransactionModal({ isOpen, onClose, account }: Props) {
    const [holdingId, setHoldingId] = useState(account.holdings[0]?.id || '')
    const [transactionType, setTransactionType] = useState<TransactionType>('BUY')
    const [amount, setAmount] = useState('')
    const [transactionDate, setTransactionDate] = useState(todayIso)
    const [notes, setNotes] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    if (!isOpen) return null

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const parsedAmount = Number(amount)
        if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
            setError('Amount must be a valid non-zero number.')
            return
        }

        if (!holdingId) {
            setError('Please select a holding (or create one first).')
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

        const holding = account.holdings.find(h => h.id === holdingId)
        if (!holding) {
            setError('Holding not found.')
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
            currentValueImpact = parsedAmount
        }

        // 1. Record the transaction
        const { error: txError } = await supabase.from('investment_transactions').insert({
            user_id: user.id,
            account_id: account.id,
            holding_id: holdingId,
            transaction_type: transactionType,
            amount: parsedAmount,
            invested_amount_impact: investedImpact,
            current_value_impact: currentValueImpact,
            transaction_date: transactionDate,
            notes: notes.trim() || null,
        })

        if (txError) {
            setError(txError.message)
            setIsSaving(false)
            return
        }

        // 2. Update the holding total
        const { error: updateError } = await supabase.rpc('update_investment_holding_totals', {
            target_holding_id: holdingId,
            v_invested_impact: investedImpact,
            v_current_impact: currentValueImpact
        })

        if (updateError) {
            // Manual fallback if RPC fails
            const { error: manualError } = await supabase
                .from('investment_holdings')
                .update({
                    invested_amount: holding.investedAmount + investedImpact,
                    current_value: holding.currentValue + currentValueImpact,
                    updated_at: new Date().toISOString()
                })
                .eq('id', holdingId)

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
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            <ArrowRightLeft className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Add Transaction</h2>
                    </div>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white" aria-label="Close transaction modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Select Holding</label>
                        {account.holdings.length === 0 ? (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-xs text-center font-medium">
                                No holdings found. Add a holding to this account first.
                            </div>
                        ) : (
                            <select
                                value={holdingId}
                                onChange={(e) => setHoldingId(e.target.value)}
                                className="w-full h-12 bg-slate-900 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium"
                            >
                                {account.holdings.map(h => (
                                    <option key={h.id} value={h.id}>
                                        {h.ticker} - {h.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Transaction Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['BUY', 'SELL', 'ADJUSTMENT'] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setTransactionType(type)}
                                    className={`rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                                        transactionType === type
                                            ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300 shadow-sm shadow-indigo-500/10'
                                            : 'border-white/10 bg-slate-900 text-white/60 hover:bg-white/5'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Amount (£)</label>
                        <input
                            type="number"
                            required
                            min={transactionType === 'ADJUSTMENT' ? undefined : "0"}
                            step="any"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full h-12 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-semibold"
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
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Monthly top-up"
                            rows={3}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                        />
                    </div>

                    {error && (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-white/10 text-white/70 px-4 py-3 text-sm font-semibold hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !holdingId}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-3 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-60 transition-all"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isSaving ? 'Saving...' : 'Add Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
