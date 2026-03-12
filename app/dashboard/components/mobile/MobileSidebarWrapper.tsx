'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '../Sidebar'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export default function MobileSidebarWrapper({ isOpen, onClose }: Props) {
    const pathname = usePathname()

    // Close the sidebar when the route changes
    useEffect(() => {
        onClose()
    }, [pathname, onClose])

    if (!isOpen) return null

    return (
        <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
                aria-hidden="true"
            />
            
            {/* Sidebar Slider */}
            <div className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-slate-900 shadow-2xl animate-in slide-in-from-left-full duration-300">
                <div className="absolute right-4 top-4">
                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <span className="sr-only">Close sidebar</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* 
                    We reuse the existing Sidebar component directly. 
                    Because it returns an `<aside className="... h-full">`, 
                    it will perfectly fill this mobile wrapper.
                */}
                <Sidebar />
            </div>
        </div>
    )
}
