'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import DatePickerField from '@/app/dashboard/components/DatePickerField'

type Asset = {
    id: string
    ticker: string
    name: string
    amount: number
    investedGbp: number
}

type Props = {
    isOpen: boolean
    onClose: () => void
    asset: Asset
}

type TransactionType = 'BUY' | 'SELL' | 'STAKE'

type CryptoAssetBalanceRow = {
    amount: number | string | null
    invested_gbp: number | string | null
}

const todayIso = new Date().toISOString().slice(0, 10)

const toNumber = (value: number | string | null | undefined): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) return parsed
    }
    return 0
}

export default function CryptoTransactionModal({ isOpen, onClose, asset }: Props) {
    const [transactionType, setTransactionType] = useState<TransactionType>('BUY')
    const [amount, setAmount] = useState('')
    const [totalValueGbp, setTotalValueGbp] = useState('')
    const [transactionDate, setTransactionDate] = useState(todayIso)
    const [notes, setNotes] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()
    const requiresTotalValue = transactionType !== 'STAKE'

    if (!isOpen) return null

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setFormError(null)

        const parsedAmount = Number(amount)
        const parsedTotal = totalValueGbp.trim().length > 0 ? Number(totalValueGbp) : null
        const cleanNotes = notes.trim()

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setFormError('Amount must be greater than 0.')
            return
        }

        if (requiresTotalValue && (parsedTotal === null || !Number.isFinite(parsedTotal) || parsedTotal <= 0)) {
            setFormError('Total value must be greater than 0.')
            return
        }

        const safeParsedTotal = parsedTotal ?? 0

        if (!transactionDate) {
            setFormError('Transaction date is required.')
            return
        }

        setIsSaving(true)

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            setFormError('Session not found. Please sign in again.')
            setIsSaving(false)
            return
        }

        const { data: latestAsset, error: latestAssetError } = await supabase
            .from('crypto_assets')
            .select('amount, invested_gbp')
            .eq('id', asset.id)
            .single()

        if (latestAssetError || !latestAsset) {
            setFormError(latestAssetError?.message || 'Unable to load current asset balance.')
            setIsSaving(false)
            return
        }

        const latestAssetTyped = latestAsset as CryptoAssetBalanceRow
        const currentAmount = toNumber(latestAssetTyped.amount)
        const currentInvested = Math.max(0, toNumber(latestAssetTyped.invested_gbp))

        if (transactionType === 'SELL' && parsedAmount > currentAmount) {
            setFormError('Sell amount cannot be greater than current coin amount.')
            setIsSaving(false)
            return
        }

        const nextAmount = transactionType === 'SELL'
            ? Math.max(0, currentAmount - parsedAmount)
            : currentAmount + parsedAmount

        const nextInvestedRaw = transactionType === 'BUY'
            ? currentInvested + safeParsedTotal
            : transactionType === 'SELL'
                ? currentInvested - safeParsedTotal
                : currentInvested
        const nextInvested = Math.max(0, nextInvestedRaw)

        const { error: transactionError } = await supabase.from('crypto_transactions').insert({
            user_id: user.id,
            crypto_asset_id: asset.id,
            transaction_type: transactionType,
            amount: parsedAmount,
            total_value_gbp: requiresTotalValue ? parsedTotal : null,
            transaction_date: transactionDate,
            notes: cleanNotes.length > 0 ? cleanNotes : null,
        })

        if (transactionError) {
            setFormError(transactionError.message)
            setIsSaving(false)
            return
        }

        const { error: updateError } = await supabase
            .from('crypto_assets')
            .update({
                amount: nextAmount,
                invested_gbp: nextInvested,
            })
            .eq('id', asset.id)

        if (updateError) {
            setFormError(updateError.message)
            setIsSaving(false)
            return
        }

        setIsSaving(false)
        onClose()
        router.refresh()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-white">Add Transaction</h2>
                        <p className="text-xs text-white/60 mt-1">{asset.name} ({asset.ticker})</p>
                    </div>
                    <button onClick={onClose} className="text-rose-300 hover:text-rose-200 transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Type</label>
                        <select
                            value={transactionType}
                            onChange={(event) => setTransactionType(event.target.value as TransactionType)}
                            className="w-full h-12 rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            <option value="BUY">Buy</option>
                            <option value="SELL">Sell</option>
                            <option value="STAKE">Stake</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Amount</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="any"
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                className="w-full h-12 rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="0.00"
                            />
                        </div>
                        {requiresTotalValue ? (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">Total Value (GBP)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="any"
                                    value={totalValueGbp}
                                    onChange={(event) => setTotalValueGbp(event.target.value)}
                                    className="w-full h-12 rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="0.00"
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">Total Value (GBP)</label>
                                <div className="flex h-12 items-center rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 text-sm text-rose-300">
                                    Not needed for stake
                                </div>
                            </div>
                        )}
                    </div>

                    <DatePickerField
                        label="Date"
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
                            placeholder={transactionType === 'STAKE' ? 'e.g. Validator reward' : 'e.g. Monthly DCA buy'}
                        />
                    </div>

                    {formError ? (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                            {formError}
                        </div>
                    ) : null}

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 px-4 py-3 border border-rose-500/35 rounded-xl text-rose-300 hover:bg-rose-500/10 transition-colors text-sm font-semibold disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {isSaving ? 'Saving...' : 'Save Transaction'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
