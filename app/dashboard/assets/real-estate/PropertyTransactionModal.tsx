/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowRightLeft, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DatePickerField from '@/app/dashboard/components/DatePickerField'

type PropertyRow = {
    id: string
    name: string
    current_value: number | null
    mortgage_balance: number | null
}

type Props = {
    isOpen: boolean
    onClose: () => void
    property: PropertyRow
    onSaved?: () => void
}

const todayIso = new Date().toISOString().slice(0, 10)

export default function PropertyTransactionModal({ isOpen, onClose, property, onSaved }: Props) {
    const [transactionType, setTransactionType] = useState<'PAYMENT' | 'ADJUSTMENT'>('PAYMENT')
    const [amount, setAmount] = useState('')
    const [transactionDate, setTransactionDate] = useState(todayIso)
    const [notes, setNotes] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
         
         
        if (isOpen) {
            setTransactionType('PAYMENT')
            setAmount('')
            setTransactionDate(todayIso)
            setNotes('')
            setError(null)
        }
    }, [isOpen, property.id])

    if (!isOpen) return null

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const parsedAmount = Number(amount)
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setError('Please enter a valid amount.')
            return
        }

        setIsSaving(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setError('Session not found.')
            setIsSaving(false)
            return
        }

        // 1. Record the transaction
        const { error: txError } = await supabase.from('real_estate_transactions').insert({
            user_id: user.id,
            property_id: property.id,
            transaction_type: transactionType,
            amount: parsedAmount,
            transaction_date: transactionDate,
            notes: notes.trim() || null
        })

        if (txError) {
            setError(txError.message)
            setIsSaving(false)
            return
        }

        // 2. Update the property totals
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString()
        }

        if (transactionType === 'PAYMENT') {
            // Reduce mortgage balance
            updateData.mortgage_balance = Math.max(0, (property.mortgage_balance || 0) - parsedAmount)
        } else {
            // Adjustment sets the new current value
            updateData.current_value = parsedAmount
        }

        const { error: updateError } = await supabase
            .from('real_estate_properties')
            .update(updateData)
            .eq('id', property.id)

        if (updateError) {
            setError(updateError.message)
            setIsSaving(false)
            return
        }

        setIsSaving(false)
        if (onSaved) onSaved()
        onClose()
        router.refresh()
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <ArrowRightLeft className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Property Transaction</h3>
                            <p className="text-xs text-white/50">{property.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Transaction Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['PAYMENT', 'ADJUSTMENT'] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setTransactionType(type)}
                                    className={`rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                                        transactionType === type
                                            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/10'
                                            : 'border-white/10 bg-slate-900 text-white/60 hover:bg-white/5'
                                    }`}
                                >
                                    {type === 'PAYMENT' ? 'Mortgage Payment' : 'Value Adjustment'}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-white/40 px-1">
                            {transactionType === 'PAYMENT' 
                                ? 'Payments reduce the mortgage balance and increase your equity.' 
                                : 'Adjustments set a new estimated current market value for the property.'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">
                            {transactionType === 'PAYMENT' ? 'Payment Amount (£)' : 'New Property Value (£)'}
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full h-12 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm font-semibold"
                        />
                    </div>

                    <DatePickerField
                        label="Transaction Date"
                        value={transactionDate}
                        onChange={setTransactionDate}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Monthly overpayment"
                            rows={2}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm resize-none"
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
                            className="flex-1 rounded-xl border border-rose-500/35 text-rose-300 px-4 py-3 text-sm font-semibold hover:bg-rose-500/10 transition-colors disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-3 text-sm font-semibold hover:bg-emerald-500 disabled:opacity-60 transition-all"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isSaving ? 'Processing...' : 'Save Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
