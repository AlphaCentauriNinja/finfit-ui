'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const supabase = createClient()
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        setLoading(false)

        if (error) {
            setError(error.message)
            return
        }

        router.push('/dashboard')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300 ease-in-out">
            <div
                className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                        Welcome Back
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
                        Enter your credentials to access your account
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 ml-1">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 placeholder:text-zinc-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 ml-1">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all duration-200 placeholder:text-zinc-400"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative group overflow-hidden bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-3.5 rounded-xl hover:bg-black dark:hover:bg-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg active:scale-[0.98]"
                    >
                        <span className="relative z-10">
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </span>
                        {/* Subtle gradient hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>

                    <p className="text-center text-xs text-zinc-500 dark:text-zinc-500 pt-2">
                        Demo Account: test@example.com / password123
                    </p>
                </form>
            </div>
            {/* Click-away backdrop */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    )
}
