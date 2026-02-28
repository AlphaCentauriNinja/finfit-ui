'use client'

import { useState } from 'react'
import { ArrowRight, Sparkles, ShieldCheck, BarChart3 } from 'lucide-react'
import LoginModal from '@/components/LoginModal'

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-purple-700/30 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto backdrop-blur-md bg-slate-950/50 border-b border-white/5 rounded-b-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">
            FinFit
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="text-sm font-medium text-white/80 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="text-sm font-medium bg-white text-slate-950 px-5 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center max-w-4xl mx-auto -mt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-medium text-purple-200 tracking-wide uppercase">Smart Personal Finance</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
          Build momentum with <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400">
            FinFit
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300/80 max-w-2xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          Track spending, investments, savings goals, and net worth in one secure workspace designed for everyday financial decisions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-[0_0_40px_rgba(147,51,234,0.4)] transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            Open FinFit Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-20 text-left w-full max-w-2xl mx-auto animate-in fade-in duration-1000 delay-700 opacity-80">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Bank-Grade Security</h3>
              <p className="text-sm text-slate-400">Supabase auth with strong account protection on every FinFit profile.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Live Financial Insights</h3>
              <p className="text-sm text-slate-400">Monitor portfolio performance and cash flow with real-time dashboards.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  )
}
