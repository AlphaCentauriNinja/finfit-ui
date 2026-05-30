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
        const apiUrl = process.env.NEXT_PUBLIC_FINFIT_API_URL
        const apiToken = process.env.NEXT_PUBLIC_FINFIT_API_TOKEN

        if (!apiUrl || !apiToken) {
            console.warn('[useSpotPrices] NEXT_PUBLIC_FINFIT_API_URL or NEXT_PUBLIC_FINFIT_API_TOKEN is not set')
            setState((prev) => ({
                ...prev,
                isConnected: false,
                error: 'FinFit API is not configured',
            }))
            return
        }

        let finalApiUrl = apiUrl

        try {
            // Health check first on primary
            let healthResponse = await fetch(`${finalApiUrl}/health`, { cache: 'no-store' }).catch(() => null)
            
            if (!healthResponse?.ok) {
                console.warn(`[useSpotPrices] Primary health check failed at ${finalApiUrl}/health. Trying fallback localhost...`)
                finalApiUrl = 'http://localhost:4000/api/v1'
                healthResponse = await fetch(`${finalApiUrl}/health`, { cache: 'no-store' }).catch(() => null)

                if (!healthResponse?.ok) {
                    throw new Error('FinFit API is unreachable on both primary and fallback URLs')
                }
            }

            const response = await fetch(
                `${finalApiUrl}/metals?currency=${currency}&unit=toz`,
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${apiToken}`,
                    },
                    cache: 'no-store',
                }
            )

            if (!isMountedRef.current) return

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.warn(`[useSpotPrices] Metals request failed — status ${response.status}`, errorData)
                throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            const data = await response.json()

            if (!isMountedRef.current) return

            if (data.metals?.gold !== undefined && data.metals?.silver !== undefined) {
                const gold = data.metals.gold
                const silver = data.metals.silver
                const platinum = data.metals.platinum ?? null
                const palladium = data.metals.palladium ?? null
                const timestamp = data.timestamps?.metal ?? new Date().toISOString()

                setState({
                    goldPricePerOz: gold,
                    silverPricePerOz: silver,
                    platinumPricePerOz: platinum,
                    palladiumPricePerOz: palladium,
                    goldPricePerGram: gold / TROY_OZ_TO_GRAMS,
                    silverPricePerGram: silver / TROY_OZ_TO_GRAMS,
                    platinumPricePerGram: platinum !== null ? platinum / TROY_OZ_TO_GRAMS : null,
                    palladiumPricePerGram: palladium !== null ? palladium / TROY_OZ_TO_GRAMS : null,
                    isConnected: true,
                    lastUpdated: new Date(timestamp),
                    error: null,
                })
            } else {
                console.warn('[useSpotPrices] Unexpected response shape — metals.gold or metals.silver missing', data)
                setState((prev) => ({
                    ...prev,
                    isConnected: false,
                    error: data.error || 'No price data available',
                }))
            }
        } catch (err) {
            if (!isMountedRef.current) return
            console.warn('[useSpotPrices] Connection error:', err)
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
