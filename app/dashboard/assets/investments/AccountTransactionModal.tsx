'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRightLeft, Loader2, X } from 'lucide-react'
import DatePickerField from '@/app/dashboard/components/DatePickerField'
import type { InvestmentAccountCardData } from './types'

type TransactionType = 'BUY' | 'SELL' | 'ADJUSTMENT'

type Props = {
    isOpen: boolean
    onClose: () => void
    account: InvestmentAccountCardData
    onSaved?: () => void
}

const todayIso = new Date().toISOString().slice(0, 10)

export default function AccountTransactionModal({ isOpen, onClose, account, onSaved }: Props) {
    const hasHoldings = account.holdings.length > 0
    const [scope, setScope] = useState<'ACCOUNT' | 'HOLDING'>(hasHoldings ? 'HOLDING' : 'ACCOUNT')
    const [holdingId, setHoldingId] = useState(account.holdings[0]?.id || '')
    const [transactionType, setTransactionType] = useState<TransactionType>('BUY')
    const [setAsCurrentValue, setSetAsCurrentValue] = useState(false)
    const [amount, setAmount] = useState('')
    const [transactionDate, setTransactionDate] = useState(todayIso)
    const [notes, setNotes] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (!isOpen) return
        setScope(hasHoldings ? 'HOLDING' : 'ACCOUNT')
        setTransactionType(hasHoldings ? 'BUY' : 'ADJUSTMENT')
        setSetAsCurrentValue(!hasHoldings)
        setHoldingId(account.holdings[0]?.id || '')
        setAmount('')
        setTransactionDate(todayIso)
        setNotes('')
        setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, account.id, hasHoldings])

    if (!isOpen) return null

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const parsedAmount = Number(amount)
        if (!Number.isFinite(parsedAmount)) {
            setError('Amount must be a valid number.')
            return
        }

        if (transactionType === 'BUY' || transactionType === 'SELL') {
            if (parsedAmount <= 0) {
                setError('Amount must be greater than 0.')
                return
            }
        } else if (setAsCurrentValue) {
            if (parsedAmount < 0) {
                setError('Current value must be 0 or greater.')
                return
            }
        } else if (parsedAmount === 0) {
            setError('Adjustment amount must be non-zero.')
            return
        }

        if (scope === 'HOLDING' && !holdingId) {
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

        const holding = scope === 'ACCOUNT' ? null : account.holdings.find(h => h.id === holdingId)
        if (scope === 'HOLDING' && !holding) {
            setError('Holding not found.')
            setIsSaving(false)
            return
        }

        const referenceCurrentValue = scope === 'ACCOUNT'
            ? account.totalCurrentValue
            : (holding?.currentValue ?? 0)

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
            currentValueImpact = setAsCurrentValue
                ? parsedAmount - referenceCurrentValue
                : parsedAmount
        }

        // 1. Record the transaction
        const { error: txError } = await supabase.from('investment_transactions').insert({
            user_id: user.id,
            account_id: account.id,
            holding_id: scope === 'ACCOUNT' ? null : holdingId,
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
        if (scope === 'HOLDING' && holding) {
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
        }

        setIsSaving(false)
        onClose()
        if (onSaved) {
            onSaved()
        } else {
            router.refresh()
        }
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
                    <label className="text-sm font-medium text-white/80">Apply To</label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['ACCOUNT', 'HOLDING'] as const).map((target) => (
                            <button
                                key={target}
                                type="button"
                                onClick={() => setScope(target)}
                                className={`rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                                    scope === target
                                        ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300 shadow-sm shadow-indigo-500/10'
                                        : 'border-white/10 bg-slate-900 text-white/60 hover:bg-white/5'
                                }`}
                                disabled={!hasHoldings && target === 'HOLDING'}
                            >
                                {target === 'ACCOUNT' ? 'Whole account' : 'Specific holding'}
                            </button>
                        ))}
                    </div>
                    {scope === 'HOLDING' ? (
                        hasHoldings ? (
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
                        ) : (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-xs text-center font-medium">
                                No holdings yet. Add a holding or switch to account-level deposit.
                            </div>
                        )
                    ) : (
                        <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/70 text-xs">
                            Account-level entries let you track deposits, withdrawals, or set a live cash value before adding individual holdings.
                        </div>
                    )}
                </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Transaction Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['BUY', 'SELL', 'ADJUSTMENT'] as const).map((type) => {
                                const label = type === 'BUY' && scope === 'ACCOUNT'
                                    ? 'Deposit'
                                    : type === 'SELL' && scope === 'ACCOUNT'
                                        ? 'Withdrawal'
                                        : type === 'BUY'
                                            ? 'Buy'
                                            : type === 'SELL'
                                                ? 'Sell'
                                                : 'Adjust Value'
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => {
                                            setTransactionType(type)
                                            if (type === 'ADJUSTMENT') {
                                                setSetAsCurrentValue(true)
                                            }
                                        }}
                                        className={`rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                                            transactionType === type
                                                ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300 shadow-sm shadow-indigo-500/10'
                                                : 'border-white/10 bg-slate-900 text-white/60 hover:bg-white/5'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">
                            {transactionType === 'ADJUSTMENT' && setAsCurrentValue
                                ? `New ${scope === 'ACCOUNT' ? 'Account' : 'Holding'} Current Value (£)`
                                : transactionType === 'ADJUSTMENT'
                                    ? 'Adjustment Amount (Relative)'
                                    : 'Amount (£)'}
                        </label>
                        <input
                            type="number"
                            required
                            min={transactionType === 'ADJUSTMENT' && !setAsCurrentValue ? undefined : "0"}
                            step="any"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={
                                transactionType === 'ADJUSTMENT' && setAsCurrentValue
                                    ? scope === 'ACCOUNT'
                                        ? 'e.g. 10250 total account value'
                                        : 'e.g. 1250 total holding value'
                                    : scope === 'ACCOUNT'
                                        ? 'e.g. 200 monthly deposit'
                                        : '0.00'
                            }
                            className="w-full h-12 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-semibold"
                        />
                        {transactionType === 'ADJUSTMENT' ? (
                            <label className="flex items-center gap-2 text-xs text-white/70">
                                <input
                                    type="checkbox"
                                    checked={setAsCurrentValue}
                                    onChange={(e) => setSetAsCurrentValue(e.target.checked)}
                                    className="h-4 w-4 rounded border-white/20 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                                />
                                Treat amount as the new total current value
                            </label>
                        ) : null}
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
                            className="flex-1 rounded-xl border border-rose-500/35 text-rose-300 px-4 py-3 text-sm font-semibold hover:bg-rose-500/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || (scope === 'HOLDING' && !holdingId)}
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
