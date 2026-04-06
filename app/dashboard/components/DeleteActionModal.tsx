'use client'

import { Loader2, Trash2 } from 'lucide-react'

type DeleteActionModalProps = {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
    isProcessing?: boolean
}

export default function DeleteActionModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Delete Entry?',
    message = 'Are you sure you want to delete this item?',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    isProcessing = false,
}: DeleteActionModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20 mx-auto mb-4">
                    <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/60 mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-rose-500/35 text-rose-300 text-sm font-semibold hover:bg-rose-500/10 transition-colors disabled:opacity-60"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="flex-1 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}