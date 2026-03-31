'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { InvestmentHoldingRow } from './types'

type Props = {
    isOpen: boolean
    onClose: () => void
    holding: InvestmentHoldingRow
    onUpdated?: (row: InvestmentHoldingRow) => void
    onDeleted?: (id: string) => void
}

export default function InvestmentEditModal({ isOpen, onClose, holding, onUpdated, onDeleted }: Props) {
    const [ticker, setTicker] = useState(holding.ticker)
    const [name, setName] = useState(holding.name)
    const [invested, setInvested] = useState(holding.investedAmount.toString())
    const [currentValue, setCurrentValue] = useState(holding.currentValue.toString())
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (isOpen) {
            setTicker(holding.ticker)
            setName(holding.name)
            setInvested(holding.investedAmount.toString())
            setCurrentValue(holding.currentValue.toString())
            setError(null)
        }
    }, [isOpen, holding])

    if (!isOpen) return null

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError(null)

        const cleanTicker = ticker.trim().toUpperCase()
        const cleanName = name.trim()
        const parsedInvested = Number(invested)
        const parsedCurrentValue = Number(currentValue)

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

        const { error: updateError } = await supabase
            .from('investment_holdings')
            .update({
                ticker: cleanTicker,
                name: cleanName,
                invested_amount: parsedInvested,
                current_value: parsedCurrentValue,
                updated_at: new Date().toISOString()
            })
            .eq('id', holding.id)

        if (updateError) {
            setError(updateError.message || 'Unable to update investment holding.')
            setIsSaving(false)
            return
        }

        setIsSaving(false)
        if (onUpdated) {
            onUpdated({
                ...holding,
                ticker: cleanTicker,
                name: cleanName,
                investedAmount: parsedInvested,
                currentValue: parsedCurrentValue,
            })
        }
        
        onClose()
        router.refresh()
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this investment? This action cannot be undone.')) {
            return
        }

        setIsDeleting(true)
        setError(null)
        const supabase = createClient()

        const { error: deleteError } = await supabase
            .from('investment_holdings')
            .delete()
            .eq('id', holding.id)

        if (deleteError) {
            setError(deleteError.message || 'Unable to delete investment holding.')
            setIsDeleting(false)
            return
        }

        setIsDeleting(false)
        if (onDeleted) {
            onDeleted(holding.id)
        }
        
        onClose()
        router.refresh()
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Edit Investment</h3>
                        <p className="mt-1 text-xs text-white/50">Update details for {holding.ticker}.</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white" aria-label="Close edit investment modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Ticker</label>
                            <input
                                type="text"
                                value={ticker}
                                onChange={(event) => setTicker(event.target.value)}
                                disabled={isSaving || isDeleting}
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
                                disabled={isSaving || isDeleting}
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
                                disabled={isSaving || isDeleting}
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
                                disabled={isSaving || isDeleting}
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

                    <div className="mt-6 flex flex-col gap-3">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSaving || isDeleting}
                                className="flex-1 rounded-xl border border-rose-500/35 text-rose-300 px-4 py-3 text-sm font-semibold hover:bg-rose-500/10 transition-colors disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || isDeleting}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                        
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isSaving || isDeleting}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-60 mt-2"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            {isDeleting ? 'Deleting...' : 'Delete Investment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
