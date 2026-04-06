'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const INACTIVITY_TIMEOUT = 10 * 60 * 1000 // 10 minutes

export default function AutoLogoutHandler() {
    const router = useRouter()
    const supabase = createClient()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/')
    }

    const resetTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT)
    }

    useEffect(() => {
        const events = [
            'mousemove',
            'mousedown',
            'keydown',
            'scroll',
            'touchstart',
        ]

        const activityHandler = () => resetTimer()

        // Initialize the timer
        resetTimer()

        // Add event listeners
        events.forEach((event) => {
            window.addEventListener(event, activityHandler)
        })

        return () => {
            // Clean up
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            events.forEach((event) => {
                window.removeEventListener(event, activityHandler)
            })
        }
    }, [])

    return null // This component doesn't render anything
}
