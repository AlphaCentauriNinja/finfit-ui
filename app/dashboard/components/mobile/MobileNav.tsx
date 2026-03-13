'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import Sidebar from '@/app/dashboard/components/Sidebar'

/**
 * Self-contained mobile navigation:
 * - Renders a hamburger button (hidden on desktop via inline media query)
 * - Renders a fullscreen sidebar drawer when open
 * - Auto-closes on route change
 * - No context, no portal, no prop drilling
 */
export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const [lastPathname, setLastPathname] = useState(pathname)

    // Close on route change (derived state)
    if (lastPathname !== pathname) {
        setLastPathname(pathname)
        if (isOpen) setIsOpen(false)
    }

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    return (
        <>
            {/* 
                Hamburger button: 
                Using inline style for the media query to guarantee it hides on desktop.
                display:none at >= 1024px, display:flex below that.
            */}
            <style>{`
                .mobile-nav-hamburger { display: flex; }
                @media (min-width: 1024px) { .mobile-nav-hamburger { display: none !important; } }
            `}</style>
            <button
                onClick={() => setIsOpen(true)}
                className="mobile-nav-hamburger items-center justify-center p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Open navigation menu"
                type="button"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Fullscreen sidebar drawer */}
            {isOpen && (
                <>
                    <style>{`
                        @media (min-width: 1024px) { .mobile-nav-overlay { display: none !important; } }
                    `}</style>
                    <div
                        className="mobile-nav-overlay"
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 9999,
                            display: 'flex',
                        }}
                    >
                        {/* Backdrop */}
                        <div
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                backdropFilter: 'blur(4px)',
                            }}
                        />

                        {/* Drawer panel */}
                        <div
                            style={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                width: '18rem',
                                maxWidth: '85vw',
                                height: '100%',
                                backgroundColor: '#0f172a',
                                boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
                                borderRight: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            {/* Close button */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem' }}>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                                    type="button"
                                    aria-label="Close navigation menu"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Sidebar content */}
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                <Sidebar />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
