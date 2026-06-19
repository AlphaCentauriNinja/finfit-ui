'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, User, Loader2, ArrowLeft, Check } from 'lucide-react'

export default function RegisterPage() {
    const supabase = createClient()
    const router = useRouter()

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        })

        setLoading(false)

        if (error) {
            setError(error.message)
            return
        }

        setSuccess(true)
        // If email confirmation is disabled, redirect to dashboard
        setTimeout(() => {
            router.push('/dashboard')
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left panel — illustration */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden flex-col items-center justify-center p-16">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
                        backgroundSize: '28px 28px',
                    }}
                />
                <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/30 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />

                <div className="relative text-center">
                    <div className="inline-flex items-center gap-2.5 mb-12">
                        <div className="w-10 h-10 rounded-xl bg-surface/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-white">FinFit</span>
                    </div>

                    <Image
                        src="/illustrations/register.svg"
                        alt="Welcome to FinFit illustration"
                        width={400}
                        height={400}
                        className="w-full max-w-sm mx-auto mb-12 animate-float"
                    />

                    <h2 className="text-3xl font-bold text-white mb-4">
                        Start your financial journey
                    </h2>
                    <p className="text-green-100 text-lg leading-relaxed max-w-sm mx-auto mb-10">
                        Join FinFit and get complete visibility over your entire financial life — for free.
                    </p>

                    {/* Feature bullets */}
                    <div className="space-y-3 text-left">
                        {[
                            'Track 6 asset classes in one dashboard',
                            'Live crypto & bullion price feeds',
                            'Net worth & portfolio analytics',
                            'Bank-level security with Supabase',
                        ].map((feature) => (
                            <div key={feature} className="flex items-center gap-3 bg-surface/10 rounded-xl px-4 py-2.5">
                                <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-green-50 text-sm font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md">
                    {/* Back link */}
                    <Link
                        href="/"
                        id="register-back-home"
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

                    {success ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary mb-2">Account created!</h2>
                            <p className="text-text-muted mb-6">Redirecting you to your dashboard...</p>
                            <div className="flex items-center justify-center gap-2 text-primary">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm font-medium">Setting up your workspace</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-text-primary mb-2">Create your account</h1>
                                <p className="text-text-muted">Free forever. No credit card required.</p>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-5">
                                <div>
                                    <label htmlFor="register-name" className="block text-sm font-semibold text-text-secondary mb-2">
                                        Full name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                                        <input
                                            id="register-name"
                                            type="text"
                                            placeholder="Your full name"
                                            className="w-full bg-surface border border-strong text-text-primary pl-11 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all placeholder:text-text-subtle text-sm shadow-sm"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="register-email" className="block text-sm font-semibold text-text-secondary mb-2">
                                        Email address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                                        <input
                                            id="register-email"
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
                                    <label htmlFor="register-password" className="block text-sm font-semibold text-text-secondary mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                                        <input
                                            id="register-password"
                                            type="password"
                                            placeholder="Min. 8 characters"
                                            minLength={8}
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

                                <p className="text-xs text-text-subtle leading-relaxed">
                                    By creating an account you agree to our{' '}
                                    <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}
                                    and{' '}
                                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                                </p>

                                <button
                                    id="register-submit-btn"
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2.5 bg-primary text-white py-4 rounded-xl hover:bg-primary-dark transition-all font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-primary active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        'Create Free Account'
                                    )}
                                </button>

                                <p className="text-center text-sm text-text-muted">
                                    Already have an account?{' '}
                                    <Link href="/login" id="register-login-link" className="text-primary font-semibold hover:underline">
                                        Sign in
                                    </Link>
                                </p>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
