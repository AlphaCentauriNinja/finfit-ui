'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Save,
    Loader2,
    Camera,
    Info,
    Briefcase,
    Phone,
    MapPin,
    Building
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
    const supabase = createClient()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Form state corresponding to the Fluent template structure
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [position, setPosition] = useState('')
    const [phone, setPhone] = useState('')
    const [city, setCity] = useState('')
    const [country, setCountry] = useState('')
    const [bio, setBio] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        async function loadProfile() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setEmail(user.email || '')
                setFullName(user.user_metadata?.full_name || '')
                setPosition(user.user_metadata?.position || '')
                setPhone(user.user_metadata?.phone || '')
                setCity(user.user_metadata?.city || '')
                setCountry(user.user_metadata?.country || '')
                setBio(user.user_metadata?.bio || '')
            }
            setLoading(false)
        }

        loadProfile()
    }, [supabase])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            const updates: any = {
                data: {
                    full_name: fullName,
                    position,
                    phone,
                    city,
                    country,
                    bio
                }
            }

            // Only update password if user entered something
            if (password) {
                const { error: pwdError } = await supabase.auth.updateUser({ password })
                if (pwdError) throw pwdError
            }

            const { error: metaError } = await supabase.auth.updateUser(updates)
            if (metaError) throw metaError

            setMessage({ type: 'success', text: 'Profile updated successfully!' })
            router.refresh()
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="w-full h-full pb-12">
            {/* Fluent inspired Banner - Full Width */}
            <div className="relative h-48 w-full rounded-2xl bg-gradient-to-r from-[#0078d4] via-[#2b88d8] to-[#005a9e] overflow-hidden shadow-lg mb-8">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                {/* Decorative Elements mimicking Fluent depth */}
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-24 -left-12 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>

                {/* Header Content */}
                <div className="absolute bottom-6 left-48 z-10 hidden sm:block">
                    <h1 className="text-3xl font-bold text-white shadow-sm">{fullName || 'FinFit User'}</h1>
                    <p className="text-blue-100 mt-1 font-medium">{position || 'Personal Finance Manager'}</p>
                </div>
            </div>

            {/* Profile Content Container - Full Width layout */}
            <div className="relative px-4 sm:px-8">
                {/* Overlapping Avatar */}
                <div className="absolute -top-32 left-8 z-20">
                    <div className="w-32 h-32 rounded-full border-4 border-[#0f172a] bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl relative group cursor-pointer transition-transform hover:scale-105">
                        {fullName ? (
                            <div className="w-full h-full bg-[#0078d4] flex items-center justify-center text-4xl font-bold text-white">
                                {fullName.charAt(0)}
                            </div>
                        ) : (
                            <User className="w-16 h-16 text-slate-400" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                {/* Main Profile Form Card - Spanning Full Width */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-sm mt-12 sm:mt-0 p-6 sm:p-8">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
                        <div>
                            <h2 className="text-xl font-bold text-white">User Profile</h2>
                            <p className="text-slate-400 text-sm mt-1">Manage your personal and contact information</p>
                        </div>
                        {message && (
                            <div className={`px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-right-4 duration-300 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                {message.text}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSave} className="space-y-8">
                        {/* 1. Basic Information Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-[#0078d4]" />
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#0078d4]/50 transition-all hover:border-white/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Position</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Briefcase className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <input
                                            type="text"
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                            placeholder="e.g. Software Engineer"
                                            className="w-full rounded-xl border border-white/10 bg-slate-900/50 pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#0078d4]/50 transition-all hover:border-white/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            disabled
                                            className="w-full rounded-xl border border-white/5 bg-slate-900/30 pl-10 pr-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Contact & Location Section */}
                        <div className="pt-6 border-t border-white/5">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Phone className="w-5 h-5 text-[#0078d4]" />
                                Contact & Location
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#0078d4]/50 transition-all hover:border-white/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">City</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="London"
                                            className="w-full rounded-xl border border-white/10 bg-slate-900/50 pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#0078d4]/50 transition-all hover:border-white/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Country</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <input
                                            type="text"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            placeholder="United Kingdom"
                                            className="w-full rounded-xl border border-white/10 bg-slate-900/50 pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#0078d4]/50 transition-all hover:border-white/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Security Section */}
                        <div className="pt-6 border-t border-white/5">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-[#0078d4]" />
                                Security
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Change Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter new password (optional)"
                                            className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#0078d4]/50 transition-all hover:border-white/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 ml-1 mt-1">
                                        <Info className="w-3.5 h-3.5" />
                                        Leave blank to keep your current password
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 4. Notes/Bio Section */}
                        <div className="pt-6 border-t border-white/5">
                            <h3 className="text-lg font-semibold text-white mb-4">Notes & Biography</h3>
                            <div className="space-y-2">
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={5}
                                    placeholder="Add any additional notes, biography or important context about the user..."
                                    className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#0078d4]/50 transition-all resize-none hover:border-white/20 leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Submission */}
                        <div className="pt-6 mt-4 border-t border-white/10 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 bg-[#0078d4] text-white text-sm font-semibold px-8 py-3 rounded-md hover:bg-[#2b88d8] transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
