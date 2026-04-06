'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRightLeft, Loader2, X } from 'lucide-react'
import DatePickerField from '@/app/dashboard/components/DatePickerField'
import type { DashboardSavingsAccount } from '@/lib/dashboard-data'
import { usePrivacy } from '@/app/dashboard/components/providers/PrivacyProvider'

type Props = {
    isOpen: boolean
    onClose: () => void
    account: DashboardSavingsAccount
}

export default function SavingsTransactionModal({ isOpen, onClose, account }: Props) {
    const { hideValues } = usePrivacy()
    const [potId, setPotId] = useState(account.pots[0]?.id || '')
    const [amount, setAmount] = useState('')
    const [name, setName] = useState('Transaction')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSave = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)

        const parsedAmount = Number(amount)
        if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
            setError('Amount must be a valid non-zero number.')
            return
        }

        if (!potId) {
            setError('Please select a pot.')
            return
        }

        setIsLoading(true)
        const supabase = createClient()

        // 1. Add to history
        const { error: historyError } = await supabase
            .from('savings_history')
            .insert({
                pot_id: potId,
                amount: parsedAmount,
                date: date,
                name: name.trim() || 'Transaction'
            })

        if (historyError) {
            setError(historyError.message)
            setIsLoading(false)
            return
        }

        // 2. Update pot balance
        // Note: In a real app, this should be a DB trigger or RPC to ensure consistency
        const pot = account.pots.find(p => p.id === potId)
        if (pot) {
            const { error: updateError } = await supabase
                .from('savings_pots')
                .update({ balance: pot.balance + parsedAmount })
                .eq('id', potId)

            if (updateError) {
                setError(updateError.message)
                setIsLoading(false)
                return
            }
        }

        setIsLoading(false)
        onClose()
        router.refresh()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-5xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            <ArrowRightLeft className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-white">New Transaction</h2>
                    </div>
                    <button onClick={onClose} className="text-rose-300 hover:text-rose-300 transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Select Pot</label>
                        <select
                            value={potId}
                            onChange={(e) => setPotId(e.target.value)}
                            className="w-full h-12 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                        >
                            {account.pots.map(pot => (
                                <option key={pot.id} value={pot.id}>
                                    {hideValues ? `${pot.name} (****)` : `${pot.name} (£${pot.balance.toLocaleString()})`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-white/80">Amount (£)</label>
                            <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                                Use negative for withdrawal
                            </span>
                        </div>
                        <input
                            type="number"
                            required
                            step="any"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full h-12 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-semibold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Description</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Transaction"
                            className="w-full h-12 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                        />
                    </div>

                    <DatePickerField
                        label="Date"
                        value={date}
                        onChange={setDate}
                        disabled={isLoading}
                    />

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
                            disabled={isLoading}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-3 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isLoading ? 'Saving...' : 'Add Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
