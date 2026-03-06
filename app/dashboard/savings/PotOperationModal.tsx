'use client'

import { FormEvent, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, X } from 'lucide-react'

type Props = {
    isOpen: boolean
    onClose: () => void
    accountId: string
    potId?: string | null
    initialName?: string
    initialBalance?: number
    initialTarget?: number | null
}

export default function PotOperationModal({
    isOpen,
    onClose,
    accountId,
    potId,
    initialName = '',
    initialBalance = 0,
    initialTarget = null
}: Props) {
    const [name, setName] = useState(initialName)
    const [balance, setBalance] = useState(initialBalance.toString())
    const [target, setTarget] = useState(initialTarget?.toString() || '')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (isOpen) {
            setName(initialName)
            setBalance(initialBalance === 0 ? '' : initialBalance.toString())
            setTarget(initialTarget?.toString() || '')
            setError(null)
        }
    }, [isOpen, initialName, initialBalance, initialTarget])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError('Pot name is required')
            return
        }

        const parsedBalance = Number(balance)
        if (!Number.isFinite(parsedBalance) || parsedBalance < 0) {
            setError('Balance must be a valid number >= 0')
            return
        }

        let parsedTarget: number | null = null
        if (target.trim() !== '') {
            parsedTarget = Number(target)
            if (!Number.isFinite(parsedTarget) || parsedTarget < 0) {
                setError('Target must be a valid positive number if provided')
                return
            }
        }

        setIsLoading(true)
        const supabase = createClient()

        if (potId) {
            // Update mode
            const { error: updateError } = await supabase
                .from('savings_pots')
                .update({
                    name: name.trim(),
                    balance: parsedBalance,
                    target_amount: parsedTarget
                })
                .eq('id', potId)

            if (updateError) {
                setError(updateError.message)
                setIsLoading(false)
                return
            }
        } else {
            // Insert mode
            const { error: insertError } = await supabase
                .from('savings_pots')
                .insert({
                    account_id: accountId,
                    name: name.trim(),
                    balance: parsedBalance,
                    target_amount: parsedTarget
                })

            if (insertError) {
                setError(insertError.message)
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-4xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">
                        {potId ? 'Edit Pot' : 'Create New Pot'}
                    </h2>
                    <button onClick={onClose} className="text-rose-300 hover:text-rose-300 transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Pot Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                            placeholder="Emergency Fund"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Current Balance (£)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="any"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Target Amount (£) <span className="text-white/40 font-normal">(Optional)</span></label>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                            placeholder="10000"
                        />
                    </div>

                    {error && (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 rounded-xl border border-rose-500/35 text-rose-300 px-4 py-3 text-sm font-semibold hover:bg-rose-500/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed group"
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {isLoading ? (potId ? 'Updating...' : 'Saving...') : (potId ? 'Save Changes' : 'Create Pot')}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
