'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
    const supabase = createClient()
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setLoading(false)
            setError(error.message)
            return
        }

        router.push('/dashboard')
    }

    return (
        <>
            <div className="min-h-screen bg-background flex">
                {/* Left panel — illustration */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden flex-col items-center justify-center p-16">
                {/* Decorative dots */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
                        backgroundSize: '28px 28px',
                    }}
                />
                <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/30 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-800/30 rounded-full blur-2xl" />

                <div className="relative text-center">
                    {/* Logo */}
                    <div className="inline-flex items-center gap-2.5 mb-12">
                        <div className="w-10 h-10 rounded-xl bg-surface/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-white">FinFit</span>
                    </div>

                    <Image
                        src="/illustrations/login.svg"
                        alt="Secure login illustration"
                        width={400}
                        height={400}
                        className="w-full max-w-sm mx-auto mb-12 animate-float"
                    />

                    <h2 className="text-3xl font-bold text-white mb-4">
                        Your finances, all in one place
                    </h2>
                    <p className="text-green-100 text-lg leading-relaxed max-w-sm mx-auto">
                        Track investments, bullion, crypto, savings, pension, real estate, and debt — beautifully.
                    </p>

                    {/* Testimonial */}
                    <div className="mt-10 bg-surface/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 text-left">
                        <p className="text-white/90 text-sm leading-relaxed italic mb-3">
                            &ldquo;FinFit gave me complete clarity over my finances for the first time. I can see everything in one dashboard.&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-surface/20 flex items-center justify-center text-white text-xs font-bold">S</div>
                            <div>
                                <p className="text-white text-sm font-semibold">S. van Laar</p>
                                <p className="text-green-200 text-xs">Personal Finance Enthusiast</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md">
                    {/* Back link */}
                    <Link
                        href="/"
                        id="login-back-home"
                        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-10 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back to home
                    </Link>

                    {/* Mobile logo */}
                    <div className="flex items-center gap-2.5 mb-8 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-base font-bold text-text-primary">FinFit</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-text-primary mb-2">Sign in to FinFit</h1>
                        <p className="text-text-muted">Welcome back! Please enter your credentials.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-semibold text-text-secondary mb-2">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                                <input
                                    id="login-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="w-full bg-surface border border-strong text-text-primary pl-11 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all placeholder:text-text-subtle text-sm shadow-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="login-password" className="block text-sm font-semibold text-text-secondary">
                                    Password
                                </label>
                                <a href="#" className="text-xs text-primary hover:text-primary-dark font-semibold hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                                <input
                                    id="login-password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-surface border border-strong text-text-primary pl-11 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all placeholder:text-text-subtle text-sm shadow-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-700 text-sm bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-2.5">
                                <span className="text-red-500 flex-shrink-0">⚠</span>
                                {error}
                            </div>
                        )}

                        <button
                            id="login-submit-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2.5 bg-primary text-white py-4 rounded-xl hover:bg-primary-dark transition-all font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-primary active:scale-[0.98] mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-strong" />
                            </div>
                            <div className="relative flex justify-center text-xs text-text-subtle bg-background px-3">
                                New to FinFit?
                            </div>
                        </div>

                        <Link
                            href="/register"
                            id="login-register-link"
                            className="w-full flex items-center justify-center py-3.5 rounded-xl border-2 border-strong hover:border-green-300 hover:bg-primary-light text-text-secondary hover:text-primary-dark font-semibold text-sm transition-all"
                        >
                            Create a free account
                        </Link>
                    </form>
                </div>
            </div>
        </div>
            
            {/* Full-screen loading spinner overlay */}
            {loading && (
                <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4" />
                    <p className="text-white/80 font-medium">Logging in...</p>
                </div>
            )}
        </>
    )
}
