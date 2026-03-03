'use client'

import { useState } from 'react'
import LoginModal from '@/components/LoginModal'
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import PricingSection from '@/components/PricingSection'
import FaqSection from '@/components/FaqSection'
import SocialProofSection from '@/components/SocialProofSection'
import CtaSection from '@/components/CtaSection'

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#080d1a] relative overflow-x-hidden font-sans selection:bg-blue-400/30 scroll-smooth">

      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(30,64,175,0.18),transparent_70%)] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#080d1a]/80 backdrop-blur-xl">
        <div className="max-w-[80%] mx-auto flex items-center justify-between h-16 px-4 sm:px-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-white tracking-tight">FinFit</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#hero" className="hover:text-white transition-colors">Home</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-sm font-semibold bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              SIGN IN
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Wrapper with top padding for fixed navbar */}
      <main className="relative z-10 w-full max-w-[80%] mx-auto pb-32 pt-16">
        <div className="w-full flex flex-col gap-28 md:gap-36">
          <HeroSection onOpenLogin={() => setIsLoginModalOpen(true)} />
          <SocialProofSection />
          <FeaturesSection />
          <PricingSection onOpenLogin={() => setIsLoginModalOpen(true)} />
          <FaqSection />
          <CtaSection onOpenLogin={() => setIsLoginModalOpen(true)} />
        </div>
      </main>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  )
}
