'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type PrivacyContextValue = {
    hideValues: boolean
    toggleHideValues: () => void
}

const PrivacyContext = createContext<PrivacyContextValue | undefined>(undefined)

export function PrivacyProvider({ children }: { children: ReactNode }) {
    const [hideValues, setHideValues] = useState(false)

    const toggleHideValues = () => {
        setHideValues(prev => !prev)
    }

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