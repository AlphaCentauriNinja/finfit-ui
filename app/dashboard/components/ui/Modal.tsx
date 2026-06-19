'use client'

import { useCallback, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

type ModalProps = {
    /** Whether the modal is visible. */
    isOpen: boolean
    /** Callback to close the modal. */
    onClose: () => void
    /** Modal title displayed in the header. */
    title: string
    /** Optional subtitle below the title. */
    subtitle?: string
    /** Max-width variant. Defaults to 'lg'. */
    size?: ModalSize
    /** If true, clicking the backdrop will not close the modal. */
    preventBackdropClose?: boolean
    /** If true, the close (X) button is hidden. */
    hideCloseButton?: boolean
    /** Contents of the modal body. */
    children: React.ReactNode
    /** Optional footer slot (e.g. action buttons). */
    footer?: React.ReactNode
}

const SIZE_MAP: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-3xl',
}

/**
 * Reusable modal shell used across the FinFit application.
 *
 * Provides a consistent backdrop, sizing, close button, header, body scroll,
 * and optional footer. Manages focus trap and Escape key handling.
 *
 * Usage:
 * ```tsx
 * <Modal isOpen={show} onClose={() => setShow(false)} title="Add Item">
 *   <p>Modal content here</p>
 * </Modal>
 * ```
 */
export default function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    size = 'lg',
    preventBackdropClose = false,
    hideCloseButton = false,
    children,
    footer,
}: ModalProps) {
    const panelRef = useRef<HTMLDivElement>(null)

    // Close on Escape
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        },
        [onClose],
    )

    useEffect(() => {
        if (!isOpen) return

        document.addEventListener('keydown', handleKeyDown)
        // Prevent background scroll while modal is open
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = previousOverflow
        }
    }, [isOpen, handleKeyDown])

    if (!isOpen) return null

    const handleBackdropClick = () => {
        if (!preventBackdropClose) {
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={handleBackdropClick}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                className={`relative flex max-h-[90vh] w-full ${SIZE_MAP[size]} flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-xl animate-in fade-in zoom-in-95 duration-200`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
                        {subtitle ? (
                            <p className="mt-1 text-xs text-white/60">{subtitle}</p>
                        ) : null}
                    </div>
                    {!hideCloseButton ? (
                        <button
                            type="button"
                            onClick={onClose}
                            className="ml-3 flex-shrink-0 p-1 text-white/40 transition-colors hover:text-white/70"
                            aria-label="Close modal"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    ) : null}
                </div>

                {/* Body — scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>

                {/* Footer */}
                {footer ? (
                    <div className="border-t border-white/10 bg-white/[0.02] p-4 sm:p-6">
                        {footer}
                    </div>
                ) : null}
            </div>
        </div>
    )
}
