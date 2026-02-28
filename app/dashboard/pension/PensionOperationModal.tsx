'use client'

import { Loader2 } from 'lucide-react'

type Props = {
    isOpen: boolean
    title: string
    message: string
}

export default function PensionOperationModal({ isOpen, title, message }: Props) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f172a] p-6 text-center shadow-2xl">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/15">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-300" />
                </div>
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-white/70">{message}</p>
            </div>
        </div>
    )
}
