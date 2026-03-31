'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { InvestmentAccountCardData, InvestmentHoldingRow } from './types'

type Props = {
    isOpen: boolean
    onClose: () => void
    accounts: InvestmentAccountCardData[]
    selectedAccountId?: string
    onCreated?: (row: InvestmentHoldingRow) => void
}

export default function AddInvestmentHoldingModal({ isOpen, onClose, accounts, selectedAccountId, onCreated }: Props) {
    const [accountId, setAccountId] = useState(selectedAccountId || (accounts.length > 0 ? accounts[0].id : ''))
    const [ticker, setTicker] = useState('')
    const [name, setName] = useState('')
    const [invested, setInvested] = useState('')
    const [currentValue, setCurrentValue] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    if (!isOpen) return null

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError(null)

        const cleanTicker = ticker.trim().toUpperCase()
        const cleanName = name.trim()
        const parsedInvested = Number(invested)
        const parsedCurrentValue = Number(currentValue)

        if (!accountId) {
            setError('Account is required. Please create an account first.')
            return
        }

        if (!cleanTicker || !cleanName) {
            setError('Ticker and name are required.')
            return
        }

        if (!Number.isFinite(parsedInvested) || parsedInvested < 0) {
            setError('Invested amount must be 0 or greater.')
            return
        }

        if (!Number.isFinite(parsedCurrentValue) || parsedCurrentValue < 0) {
            setError('Current value must be 0 or greater.')
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

        const holdingPayload = {
            account_id: accountId,
            user_id: user.id,
            ticker: cleanTicker,
            name: cleanName,
            invested_amount: parsedInvested,
            current_value: parsedCurrentValue,
        }

        const { data, error: insertError } = await supabase
            .from('investment_holdings')
            .insert(holdingPayload)
            .select('id')
            .single()

        if (insertError || !data?.id) {
            setError(insertError?.message || 'Unable to save investment holding.')
            setIsSaving(false)
            return
        }

        setIsSaving(false)
        if (onCreated) {
            onCreated({
                id: data.id,
                accountId,
                ticker: cleanTicker,
                name: cleanName,
                investedAmount: parsedInvested,
                currentValue: parsedCurrentValue,
            })
        }
        
        // Reset and close
        setTicker('')
        setName('')
        setInvested('')
        setCurrentValue('')
        onClose()
        router.refresh()
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Add Investment</h3>
                        <p className="mt-1 text-xs text-white/50">Add a ticker positional holding into an account.</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white" aria-label="Close add investment modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4 space-y-2">
                        <label className="text-sm font-medium text-white/80">Account</label>
                        <select
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            disabled={isSaving || accounts.length === 0}
                            className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            {accounts.length === 0 ? <option value="">No Accounts Available</option> : null}
                            {accounts.map(account => (
                                <option key={account.id} value={account.id}>
                                    {account.name} ({account.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Ticker</label>
                            <input
                                type="text"
                                value={ticker}
                                onChange={(event) => setTicker(event.target.value)}
                                disabled={isSaving}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="e.g. AAPL"
                                maxLength={10}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                disabled={isSaving}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="e.g. Apple Inc."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Invested</label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={invested}
                                disabled={isSaving}
                                onChange={(event) => setInvested(event.target.value)}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Current Value</label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={currentValue}
                                disabled={isSaving}
                                onChange={(event) => setCurrentValue(event.target.value)}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="0.00"
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
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {isSaving ? 'Saving...' : 'Add Investment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
