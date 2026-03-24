'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import DeleteActionModal from '@/app/dashboard/components/DeleteActionModal'

type Asset = {
    id: string
    ticker: string
    name: string
    amount: number
    usd: number
    investedGbp: number
}

type Props = {
    isOpen: boolean
    onClose: () => void
    asset: Asset
}

export default function CryptoEditModal({ isOpen, onClose, asset }: Props) {
    const [ticker, setTicker] = useState(asset.ticker)
    const [name, setName] = useState(asset.name)
    const [amount, setAmount] = useState(asset.amount.toString())
    const [usd, setUsd] = useState(asset.usd.toString())
    const [invested, setInvested] = useState(asset.investedGbp.toString())
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    if (!isOpen) return null

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setFormError(null)

        const cleanTicker = ticker.trim().toUpperCase()
        const cleanName = name.trim()
        const parsedAmount = Number(amount)
        const parsedUsd = Number(usd)
        const parsedInvested = Number(invested)

        if (!cleanTicker || !cleanName) {
            setFormError('Ticker and name are required.')
            return
        }

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setFormError('Amount must be greater than 0.')
            return
        }

        if (!Number.isFinite(parsedUsd) || parsedUsd < 0) {
            setFormError('USD price must be 0 or greater.')
            return
        }

        if (!Number.isFinite(parsedInvested) || parsedInvested < 0) {
            setFormError('Invested amount must be 0 or greater.')
            return
        }

        setIsSaving(true)

        const { error } = await supabase
            .from('crypto_assets')
            .update({
                ticker: cleanTicker,
                name: cleanName,
                amount: parsedAmount,
                usd: parsedUsd,
                invested_gbp: parsedInvested,
            })
            .eq('id', asset.id)

        if (error) {
            setFormError(error.message)
            setIsSaving(false)
            return
        }

        setIsSaving(false)
        onClose()
        router.refresh()
    }

    const handleDelete = async () => {
        setFormError(null)
        setIsDeleting(true)

        const { error } = await supabase
            .from('crypto_assets')
            .delete()
            .eq('id', asset.id)

        if (error) {
            setFormError(error.message)
            setIsDeleting(false)
            return
        }

        setIsDeleting(false)
        setIsDeleteConfirmOpen(false)
        onClose()
        router.refresh()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-white">Edit Coin</h2>
                        <p className="text-xs text-white/60 mt-1">{asset.ticker}</p>
                    </div>
                    <button onClick={onClose} className="text-rose-300 hover:text-rose-200 transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Ticker</label>
                            <input
                                type="text"
                                required
                                maxLength={10}
                                value={ticker}
                                onChange={(event) => setTicker(event.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                                placeholder="e.g. BTC"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Amount</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="any"
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                            placeholder="e.g. Bitcoin"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Price (USD)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="any"
                                value={usd}
                                onChange={(event) => setUsd(event.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Invested (GBP)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="any"
                                value={invested}
                                onChange={(event) => setInvested(event.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {formError ? (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                            {formError}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isSaving || isDeleting}
                        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsDeleteConfirmOpen(true)}
                        disabled={isSaving || isDeleting}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-rose-500/35 text-rose-300 hover:bg-rose-500/10 transition-colors text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        {isDeleting ? 'Deleting...' : 'Delete Coin'}
                    </button>
                </form>
            </div>

            <DeleteActionModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => !isDeleting && setIsDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Coin?"
                message={`This will permanently remove ${asset.name} from your crypto portfolio.`}
                confirmText="Delete"
                isProcessing={isDeleting}
            />
        </div>
    )
}
