'use client'

import { FormEvent, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Trash2, X } from 'lucide-react'

type Props = {
    isOpen: boolean
    onClose: () => void
    accountId: string
    initialName: string
}

export default function EditAccountModal({ isOpen, onClose, accountId, initialName }: Props) {
    const [name, setName] = useState(initialName)
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (isOpen) {
            setName(initialName)
            setError(null)
            setShowDeleteConfirm(false)
        }
    }, [isOpen, initialName])

    const handleSave = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError('Account name is required')
            return
        }

        setIsLoading(true)
        const supabase = createClient()

        const { error: updateError } = await supabase
            .from('savings_accounts')
            .update({
                name: name.trim()
            })
            .eq('id', accountId)

        if (updateError) {
            setError(updateError.message)
            setIsLoading(false)
            return
        }

        setIsLoading(false)
        onClose()
        router.refresh()
    }

    const handleDelete = async () => {
        setError(null)
        setIsDeleting(true)
        const supabase = createClient()

        // Pots cascade delete automatically via FK in DB
        const { error: deleteError } = await supabase
            .from('savings_accounts')
            .delete()
            .eq('id', accountId)

        if (deleteError) {
            setError(deleteError.message)
            setIsDeleting(false)
            return
        }

        setIsDeleting(false)
        onClose()
        router.refresh()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-4xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Edit Savings Account</h2>
                    <button onClick={onClose} className="text-rose-300 hover:text-rose-300 transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!showDeleteConfirm ? (
                    <form onSubmit={handleSave} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Account Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                            />
                        </div>

                        {error && (
                            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-sm font-medium transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Account
                            </button>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="rounded-xl border border-rose-500/35 text-rose-300 px-4 py-2 text-sm font-semibold hover:bg-rose-500/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed group"
                                >
                                    <span className="inline-flex items-center justify-center gap-2">
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="p-6 space-y-4">
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                            <h3 className="text-rose-400 font-bold mb-2">Delete this account?</h3>
                            <p className="text-sm text-rose-200">
                                Are you sure you want to permanently delete <strong>{initialName}</strong>?
                                This will also delete all of the pots inside. This action cannot be undone.
                            </p>
                        </div>

                        {error && (
                            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 rounded-xl border border-rose-500/35 text-rose-300 px-4 py-3 text-sm font-semibold hover:bg-rose-500/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 text-white px-4 py-3 text-sm font-semibold hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
