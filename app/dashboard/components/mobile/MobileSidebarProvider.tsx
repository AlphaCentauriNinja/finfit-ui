'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/app/dashboard/components/Sidebar'
import { X } from 'lucide-react'

type MobileSidebarContextValue = {
    open: () => void
}

const MobileSidebarContext = createContext<MobileSidebarContextValue | undefined>(undefined)

export function useMobileSidebar() {
    const ctx = useContext(MobileSidebarContext)
    if (!ctx) throw new Error('useMobileSidebar must be used inside MobileSidebarProvider')
    return ctx
}

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const [trackedPathname, setTrackedPathname] = useState(pathname)

    const open = useCallback(() => setIsOpen(true), [])
    const close = useCallback(() => setIsOpen(false), [])

    // Auto-close when navigating to a new route (derived state pattern — no useEffect)
    if (trackedPathname !== pathname) {
        setTrackedPathname(pathname)
        if (isOpen) setIsOpen(false)
    }

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    return (
        <MobileSidebarContext.Provider value={{ open }}>
            {children}

            {/* Mobile sidebar overlay — rendered here at layout root, outside any overflow container */}
            {isOpen && (
                <div className="fixed inset-0 z-[200] lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={close}
                    />

                    {/* Drawer */}
                    <div className="absolute inset-y-0 left-0 w-72 bg-slate-900 shadow-2xl border-r border-white/10 flex flex-col">
                        <div className="flex items-center justify-end p-4">
                            <button
                                onClick={close}
                                className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <Sidebar />
                        </div>
                    </div>
                </div>
            )}
        </MobileSidebarContext.Provider>
    )
}
