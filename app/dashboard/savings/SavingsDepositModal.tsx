'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, X } from 'lucide-react'
import DatePickerField from '../pension/DatePickerField'
import type { DashboardSavingsAccount } from '@/lib/dashboard-data'

type Props = {
    isOpen: boolean
    onClose: () => void
    account: DashboardSavingsAccount
}

export default function SavingsDepositModal({ isOpen, onClose, account }: Props) {
    const [potId, setPotId] = useState(account.pots[0]?.id || '')
    const [amount, setAmount] = useState('')
    const [name, setName] = useState('Deposit')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSave = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)

        const parsedAmount = Number(amount)
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setError('Amount must be a valid number greater than 0.')
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
                name: name.trim() || 'Deposit'
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
            <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Add Deposit</h2>
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
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                        >
                            {account.pots.map(pot => (
                                <option key={pot.id} value={pot.id}>{pot.name} (£{pot.balance.toLocaleString()})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Amount (£)</label>
                        <input
                            type="number"
                            required
                            min="0.01"
                            step="any"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Description</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Deposit"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
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
                            className="flex-1 rounded-xl border border-white/10 text-white/60 px-4 py-3 text-sm font-semibold hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-3 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isLoading ? 'Saving...' : 'Add Deposit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
