'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export type InvestmentAccountType = 'ISA' | 'INVEST'
export type InvestmentAccountTaxStatus = 'TAX-FREE' | 'TAXED'

type Props = {
    isOpen: boolean
    onClose: () => void
    onCreated?: () => void
}

export default function AddInvestmentAccountModal({ isOpen, onClose, onCreated }: Props) {
    const [name, setName] = useState('')
    const [type, setType] = useState<InvestmentAccountType>('ISA')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    if (!isOpen) return null

    const taxStatus: InvestmentAccountTaxStatus = type === 'ISA' ? 'TAX-FREE' : 'TAXED'

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError(null)

        const cleanName = name.trim()
        if (!cleanName) {
            setError('Account name is required.')
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

        const { error: insertError } = await supabase
            .from('investment_accounts')
            .insert({
                user_id: user.id,
                name: cleanName,
                type,
                tax_status: taxStatus,
            })

        if (insertError) {
            setError(insertError.message || 'Unable to create investment account.')
            setIsSaving(false)
            return
        }

        setIsSaving(false)
        if (onCreated) onCreated()
        onClose()
        router.refresh()
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Add Account</h3>
                        <p className="mt-1 text-xs text-white/50">Create an overarching container for your holdings.</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white" aria-label="Close modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Account Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as InvestmentAccountType)}
                                disabled={isSaving}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                <option value="ISA">ISA (Tax Free)</option>
                                <option value="INVEST">Invest Account (Taxed)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Account Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isSaving}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder={type === 'ISA' ? 'e.g. Vanguard S&S ISA' : 'e.g. Trading 212 Invest'}
                                maxLength={50}
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
                            className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/5 disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !name.trim()}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 disabled:opacity-60"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {isSaving ? 'Saving...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
