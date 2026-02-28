'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PensionOperationModal from './PensionOperationModal'

type Props = {
    isOpen: boolean
    onClose: () => void
    pensionId: string
    initialName: string
}

export default function PensionEditModal({ isOpen, onClose, pensionId, initialName }: Props) {
    const [name, setName] = useState(initialName)
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

        const cleanName = name.trim()
        if (!cleanName) {
            setFormError('Pension name is required.')
            return
        }

        setIsSaving(true)

        const { error } = await supabase
            .from('pension_accounts')
            .update({ provider_name: cleanName })
            .eq('id', pensionId)

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
            .from('pension_accounts')
            .delete()
            .eq('id', pensionId)

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

    const handleCancelDeleteOperation = () => {
        if (isDeleting) return
        setIsDeleteConfirmOpen(false)
        onClose()
        router.push('/pension')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Edit Pension Account</h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 text-left">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Pension Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                            placeholder="e.g. Scottish Widows"
                        />
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
                        {isDeleting ? 'Deleting...' : 'Delete Pension'}
                    </button>
                </form>
            </div>

            {isDeleteConfirmOpen ? (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
                        onClick={() => {
                            handleCancelDeleteOperation()
                        }}
                    />
                    <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white">Delete Pension Account</h3>
                            <p className="text-sm text-white/70 mt-2">
                                This pension and all its data will be deleted permanently.
                            </p>
                        </div>
                        <div className="p-6 flex gap-3">
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl !bg-lime-500 hover:!bg-lime-400 !text-white px-4 py-3 text-sm font-semibold transition-colors shadow-lg shadow-lime-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                YES
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelDeleteOperation}
                                disabled={isDeleting}
                                className="flex-1 rounded-xl !bg-red-500 hover:!bg-red-400 !text-white px-4 py-3 text-sm font-semibold transition-colors shadow-lg shadow-red-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            <PensionOperationModal
                isOpen={isSaving || isDeleting}
                title={isDeleting ? 'Deleting Pension' : 'Saving Changes'}
                message={isDeleting ? 'Please wait while we delete this pension and its related data.' : 'Please wait while we store your pension changes.'}
            />
        </div>
    )
}
