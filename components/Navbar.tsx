'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    Bell,
    MessageSquare,
    User,
    Settings,
    LogOut
} from 'lucide-react'

export default function Navbar({ userEmail, userFullName }: { userEmail?: string; userFullName?: string }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/')
    }

    const displayName = userFullName || userEmail?.split('@')[0] || 'User'

    return (
        <header className="sticky top-0 z-40 w-full bg-transparent border-b border-white/10 px-8 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Mobile menu toggle could go here if implemented later */}
                    <div className="hidden lg:block text-white/50 text-sm font-medium">
                        FinFit Dashboard | Welcome back, {displayName}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/user/messages"
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950"></span>
                    </Link>

                    <Link
                        href="/dashboard/user/alerts"
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-950"></span>
                    </Link>

                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-1 pl-3 pr-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
                        >
                            <span className="text-sm font-medium text-white/80 hidden sm:block">My Account</span>
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                                <User className="w-4 h-4" />
                            </div>
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                                <Link
                                    href="/dashboard/user/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                </Link>
                                <Link
                                    href="/dashboard/user/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>
                                <div className="h-px bg-white/10 my-2" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
