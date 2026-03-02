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
    <div className="min-h-screen bg-[#080d1a] relative overflow-hidden font-sans selection:bg-blue-400/30 scroll-smooth">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(30,64,175,0.18),transparent_70%)] pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#080d1a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-8 h-16">
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
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 pb-32">
        <div className="w-full flex flex-col gap-28 md:gap-36">
          <HeroSection onOpenLogin={() => setIsLoginModalOpen(true)} />
          <SocialProofSection />
          <FeaturesSection />
          <PricingSection onOpenLogin={() => setIsLoginModalOpen(true)} />
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
