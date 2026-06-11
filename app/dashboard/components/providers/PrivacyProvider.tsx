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

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, String(hideValues))
        } catch {
            // Ignore storage errors (e.g. private browsing quota exceeded)
        }
    }, [hideValues])

    const toggleHideValues = useCallback(() => {
        setHideValues(prev => !prev)
    }, [])

    return (
        <PrivacyContext.Provider value={{ hideValues, toggleHideValues }}>
            {children}
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