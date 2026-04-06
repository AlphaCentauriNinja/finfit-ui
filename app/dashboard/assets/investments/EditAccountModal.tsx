'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DeleteActionModal from '@/app/dashboard/components/DeleteActionModal'
import type { InvestmentAccountCardData, InvestmentAccountType, InvestmentAccountTaxStatus } from './types'

type Props = {
    isOpen: boolean
    onClose: () => void
    account: InvestmentAccountCardData
    onUpdated?: (account: InvestmentAccountCardData) => void
    onDeleted?: (id: string) => void
}

export default function EditAccountModal({ isOpen, onClose, account, onUpdated, onDeleted }: Props) {
    const [name, setName] = useState(account.name)
    const [type, setType] = useState<InvestmentAccountType>(account.type)
    const [taxStatus, setTaxStatus] = useState<InvestmentAccountTaxStatus>(account.taxStatus)
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (isOpen) {
            setName(account.name)
            setType(account.type)
            setTaxStatus(account.taxStatus)
            setError(null)
        }
    }, [isOpen, account])

    if (!isOpen) return null

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError('Account name is required.')
            return
        }

        setIsLoading(true)
        const supabase = createClient()

        const { error: updateError } = await supabase
            .from('investment_accounts')
            .update({
                name: name.trim(),
                type: type,
                tax_status: taxStatus
            })
            .eq('id', account.id)

        if (updateError) {
            setError(updateError.message)
            setIsLoading(false)
            return
        }

        setIsLoading(false)
        if (onUpdated) {
            onUpdated({
                ...account,
                name: name.trim(),
                type: type,
                taxStatus: taxStatus
            })
        }
        
        onClose()
        router.refresh()
    }

    const handleDelete = () => {
        setShowDeleteConfirm(true)
    }

    const confirmDelete = async () => {
        setIsDeleting(true)
        setError(null)
        const supabase = createClient()

        const { error: deleteError } = await supabase
            .from('investment_accounts')
            .delete()
            .eq('id', account.id)

        if (deleteError) {
            setError(deleteError.message)
            setIsDeleting(false)
            setShowDeleteConfirm(false)
            return
        }

        setIsDeleting(false)
        setShowDeleteConfirm(false)
        if (onDeleted) {
            onDeleted(account.id)
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
                        <h3 className="text-lg font-bold text-white">Edit Investment Account</h3>
                        <p className="mt-1 text-xs text-white/50">Modify details for {account.name}.</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white" aria-label="Close edit account modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Account Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading || isDeleting}
                                placeholder="e.g. Vanguard Stocks & Shares ISA"
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as InvestmentAccountType)}
                                    disabled={isLoading || isDeleting}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                >
                                    <option value="ISA">ISA</option>
                                    <option value="INVEST">Taxable (Invest)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">Tax Status</label>
                                <select
                                    value={taxStatus}
                                    onChange={(e) => setTaxStatus(e.target.value as InvestmentAccountTaxStatus)}
                                    disabled={isLoading || isDeleting}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                >
                                    <option value="TAX-FREE">Tax-Free</option>
                                    <option value="TAXED">Taxed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                            {error}
                        </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading || isDeleting}
                                className="flex-1 rounded-xl border border-rose-500/35 text-rose-300 px-4 py-3 text-sm font-semibold hover:bg-rose-500/10 transition-colors disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || isDeleting}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                        
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isLoading || isDeleting}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-60 mt-2"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            {isDeleting ? 'Deleting...' : 'Delete Account'}
                        </button>
                    </div>
                </form>
            </div>

            <DeleteActionModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete Investment Account?"
                message={`Are you sure you want to delete "${account.name}"? All underlying holdings will also be deleted. This action cannot be undone.`}
                confirmText="Delete Account"
                isProcessing={isDeleting}
            />
        </div>
    )
}
