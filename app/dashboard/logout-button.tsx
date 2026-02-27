'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
    const supabase = createClient()
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/')
    }

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors w-full px-3 py-2 rounded-lg hover:bg-white/10"
        >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
        </button>
    )
}
