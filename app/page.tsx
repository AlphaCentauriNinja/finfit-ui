'use client'

import { useState } from 'react'
import LoginModal from '@/components/LoginModal'
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import PricingSection from '@/components/PricingSection'
import SocialProofSection from '@/components/SocialProofSection'
import CtaSection from '@/components/CtaSection'

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#050c1e] relative overflow-hidden font-sans selection:bg-indigo-400/40 scroll-smooth">
      <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_15%_0%,rgba(99,102,241,0.25),rgba(5,12,30,0)_70%),radial-gradient(45%_35%_at_85%_10%,rgba(34,211,238,0.22),rgba(5,12,30,0)_70%),linear-gradient(180deg,#050c1e_0%,#09132b_55%,#050b1a_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.14] mix-blend-overlay pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 z-30">
        <div className="px-6 pt-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 rounded-2xl border border-white/10 bg-slate-950/55 backdrop-blur-xl shadow-[0_12px_40px_rgba(2,6,23,0.45)]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">
                FinFit
              </span>
            </div>
            <div className="hidden md:flex items-center gap-7 text-sm font-medium">
              <a href="#hero" className="text-white/65 hover:text-white transition-colors">
                Home
              </a>
              <a href="#features" className="text-white/65 hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-white/65 hover:text-white transition-colors">
                Pricing
              </a>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors px-3 py-2"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-sm font-semibold bg-indigo-500 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-400 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-24">
        <div className="w-full flex flex-col gap-16 md:gap-20 lg:gap-24">
          <HeroSection onOpenLogin={() => setIsLoginModalOpen(true)} />
          <SocialProofSection />
          <FeaturesSection />
          <PricingSection onOpenLogin={() => setIsLoginModalOpen(true)} />
          <CtaSection onOpenLogin={() => setIsLoginModalOpen(true)} />
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
