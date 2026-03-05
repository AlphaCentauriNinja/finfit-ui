'use client'

type Props = {
    isOpen: boolean
    title: string
    message: string
}

export default function PensionOperationModal({ isOpen }: Props) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/88 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center gap-5">
                <div
                    aria-hidden="true"
                    className="h-48 w-48 animate-spin rounded-full border-8 border-sky-200/30 border-t-sky-400 border-r-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.3)]"
                />
                <p className="text-xl font-semibold tracking-wide text-white">Loading</p>
            </div>
        </div>
    )
}
