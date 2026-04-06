'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DeleteActionModal from '@/app/dashboard/components/DeleteActionModal'

type PropertyRow = {
    id: string
    name: string
    address: string | null
    current_value: number | null
    estimated_value?: number | null
    market_value?: number | null
    mortgage_balance: number | null
}

type Props = {
    isOpen: boolean
    onClose: () => void
    property: PropertyRow
    onUpdated?: () => void
    onDeleted?: () => void
}

export default function EditPropertyModal({ isOpen, onClose, property, onUpdated, onDeleted }: Props) {
    const initialValuation = property.current_value ?? property.estimated_value ?? property.market_value
    const [name, setName] = useState(property.name)
    const [address, setAddress] = useState(property.address || '')
    const [currentValue, setCurrentValue] = useState(initialValuation?.toString() || '')
    const [mortgageBalance, setMortgageBalance] = useState(property.mortgage_balance?.toString() || '')
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (isOpen) {
            const valuation = property.current_value ?? property.estimated_value ?? property.market_value
            setName(property.name)
            setAddress(property.address || '')
            setCurrentValue(valuation?.toString() || '')
            setMortgageBalance(property.mortgage_balance?.toString() || '')
            setError(null)
        }
    }, [isOpen, property])

    if (!isOpen) return null

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError('Property name is required.')
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

        const nextValue = currentValue ? Number(currentValue) : null
        const prevValue = property.current_value ?? property.estimated_value ?? property.market_value
        
        // 1. If value changed, record an ADJUSTMENT transaction
        if (nextValue !== prevValue && nextValue !== null) {
            const { error: txError } = await supabase.from('real_estate_transactions').insert({
                user_id: user.id,
                property_id: property.id,
                transaction_type: 'ADJUSTMENT',
                amount: nextValue,
                transaction_date: new Date().toISOString().slice(0, 10),
                notes: 'Value updated via Edit Property'
            })

            if (txError) {
                setError(`Failed to record transaction: ${txError.message}`)
                setIsSaving(false)
                return
            }
        }

        // 2. Update the property record as before
        const { error: updateError } = await supabase
            .from('real_estate_properties')
            .update({
                name: name.trim(),
                address: address.trim() || null,
                current_value: nextValue,
                estimated_value: nextValue,
                market_value: nextValue,
                mortgage_balance: mortgageBalance ? Number(mortgageBalance) : null,
                updated_at: new Date().toISOString()
            })
            .eq('id', property.id)

        if (updateError) {
            setError(updateError.message)
            setIsSaving(false)
            return
        }

        setIsSaving(false)
        if (onUpdated) onUpdated()
        onClose()
        router.refresh()
    }

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true)
    }

    const confirmDelete = async () => {
        setIsDeleting(true)
        setError(null)
        const supabase = createClient()

        const { error: deleteError } = await supabase
            .from('real_estate_properties')
            .delete()
            .eq('id', property.id)

        if (deleteError) {
            setError(deleteError.message)
            setIsDeleting(false)
            setShowDeleteConfirm(false)
            return
        }

        setIsDeleting(false)
        setShowDeleteConfirm(false)
        if (onDeleted) onDeleted()
        onClose()
        router.refresh()
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Edit Property</h3>
                        <p className="mt-1 text-xs text-white/50">Modify details for {property.name}.</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-white/60 hover:text-white" aria-label="Close edit property modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Property Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isSaving || isDeleting}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                placeholder="e.g. Main Residence"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Address</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                disabled={isSaving || isDeleting}
                                className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                placeholder="Street, City"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">Current Valuation (£)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={currentValue}
                                    onChange={(e) => setCurrentValue(e.target.value)}
                                    disabled={isSaving || isDeleting}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="0"
                                />
                                <p className="text-[10px] text-white/40 px-1">
                                    Changing this will create a valuation history record.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">Mortgage Balance (£)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={mortgageBalance}
                                    onChange={(e) => setMortgageBalance(e.target.value)}
                                    disabled={isSaving || isDeleting}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="0"
                                />
                                <p className="text-[10px] text-white/40 px-1">
                                    Current remaining balance of all mortgages on this property.
                                </p>
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
                                disabled={isSaving || isDeleting}
                                className="flex-1 rounded-xl border border-rose-500/35 text-rose-300 px-4 py-3 text-sm font-semibold hover:bg-rose-500/10 transition-colors disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || isDeleting}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                        
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            disabled={isSaving || isDeleting}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-60 mt-2"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            {isDeleting ? 'Deleting...' : 'Delete Property'}
                        </button>
                    </div>
                </form>
            </div>

            <DeleteActionModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete Property?"
                message={`Are you sure you want to delete "${property.name}"? This action cannot be undone and will remove all transaction history.`}
                confirmText="Delete Property"
                isProcessing={isDeleting}
            />
        </div>
    )
}
