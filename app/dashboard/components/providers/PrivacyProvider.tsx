'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

const STORAGE_KEY = 'finfit_hide_values'

type PrivacyContextValue = {
    hideValues: boolean
    toggleHideValues: () => void
}

const PrivacyContext = createContext<PrivacyContextValue | undefined>(undefined)

export function PrivacyProvider({ children }: { children: ReactNode }) {
    const [hideValues, setHideValues] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        try {
            return localStorage.getItem(STORAGE_KEY) === 'true'
        } catch {
            return false
        }
    })

    const [isReloading, setIsReloading] = useState(false)

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, String(hideValues))
        } catch {
            // Ignore storage errors (e.g. private browsing quota exceeded)
        }
    }, [hideValues])

    const toggleHideValues = useCallback(() => {
        setIsReloading(true)
        const nextValue = !hideValues
        setHideValues(nextValue)
        try {
            localStorage.setItem(STORAGE_KEY, String(nextValue))
        } catch {
            // Ignore storage errors
        }
        
        setTimeout(() => {
            window.location.reload()
        }, 300)
    }, [hideValues])

    return (
        <PrivacyContext.Provider value={{ hideValues, toggleHideValues }}>
            {children}
            {isReloading && (
                <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mb-4" />
                    <p className="text-white/80 font-medium">Reloading dashboard...</p>
                </div>
            )}
        </PrivacyContext.Provider>
    )
}

export function usePrivacy() {
    const context = useContext(PrivacyContext)
    if (!context) {
        throw new Error('usePrivacy must be used within a PrivacyProvider')
    }
    return context
}