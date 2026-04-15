import { useCallback, useEffect, useRef, useState } from 'react'

type SpotPricesState = {
    /** Gold spot price per gram in the requested currency */
    goldPricePerGram: number | null
    /** Silver spot price per gram in the requested currency */
    silverPricePerGram: number | null
    /** Gold spot price per troy ounce in the requested currency */
    goldPricePerOz: number | null
    /** Silver spot price per troy ounce in the requested currency */
    silverPricePerOz: number | null
    /** Platinum spot price per troy ounce in the requested currency */
    platinumPricePerOz: number | null
    /** Palladium spot price per troy ounce in the requested currency */
    palladiumPricePerOz: number | null
    /** Platinum spot price per gram in the requested currency */
    platinumPricePerGram: number | null
    /** Palladium spot price per gram in the requested currency */
    palladiumPricePerGram: number | null
    /** Whether the latest fetch was successful */
    isConnected: boolean
    /** Timestamp of the last successful price update */
    lastUpdated: Date | null
    /** Error message if the last fetch failed */
    error: string | null
}

const TROY_OZ_TO_GRAMS = 31.1035

const POLL_INTERVAL_MS = 60_000 // 60 seconds

export function useSpotPrices(currency: string = 'GBP'): SpotPricesState {
    const [state, setState] = useState<SpotPricesState>({
        goldPricePerGram: null,
        silverPricePerGram: null,
        goldPricePerOz: null,
        silverPricePerOz: null,
        platinumPricePerOz: null,
        palladiumPricePerOz: null,
        platinumPricePerGram: null,
        palladiumPricePerGram: null,
        isConnected: false,
        lastUpdated: null,
        error: null,
    })

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const isMountedRef = useRef(true)

    const fetchPrices = useCallback(async () => {
        try {
            const response = await fetch(`/api/spot-prices?currency=${currency}`)

            if (!isMountedRef.current) return

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            const data = await response.json()

            if (!isMountedRef.current) return

            if (data.gold !== null && data.silver !== null) {
                setState({
                    goldPricePerOz: data.gold,
                    silverPricePerOz: data.silver,
                    platinumPricePerOz: data.platinum,
                    palladiumPricePerOz: data.palladium,
                    goldPricePerGram: data.gold / TROY_OZ_TO_GRAMS,
                    silverPricePerGram: data.silver / TROY_OZ_TO_GRAMS,
                    platinumPricePerGram: data.platinum !== null ? data.platinum / TROY_OZ_TO_GRAMS : null,
                    palladiumPricePerGram: data.palladium !== null ? data.palladium / TROY_OZ_TO_GRAMS : null,
                    isConnected: true,
                    lastUpdated: new Date(data.timestamp),
                    error: null,
                })
            } else {
                setState((prev) => ({
                    ...prev,
                    isConnected: false,
                    error: data.error || 'No price data available',
                }))
            }
        } catch (err) {
            if (!isMountedRef.current) return
            setState((prev) => ({
                ...prev,
                isConnected: false,
                error: err instanceof Error ? err.message : 'Failed to fetch spot prices',
            }))
        }
    }, [currency])

    useEffect(() => {
        isMountedRef.current = true

        // Fetch immediately on mount
        void fetchPrices()

        // Set up polling interval
        intervalRef.current = setInterval(() => {
            void fetchPrices()
        }, POLL_INTERVAL_MS)

        // Pause polling when the tab is hidden, resume when visible
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                    intervalRef.current = null
                }
            } else {
                // Fetch immediately when tab becomes visible again
                void fetchPrices()
                intervalRef.current = setInterval(() => {
                    void fetchPrices()
                }, POLL_INTERVAL_MS)
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            isMountedRef.current = false
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [fetchPrices])

    return state
}
