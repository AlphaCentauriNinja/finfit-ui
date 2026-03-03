'use client'

import React from 'react'

const affiliates = [
  { name: 'HSBC', href: 'https://www.hsbc.com' },
  { name: 'Coinbase', href: 'https://www.coinbase.com' },
  { name: 'TradingView', href: 'https://www.tradingview.com' },
  { name: 'Trading 212', href: 'https://www.trading212.com' },
  { name: 'PensionBee', href: 'https://www.pensionbee.com' },
  { name: 'BullionByPost', href: 'https://www.bullionbypost.co.uk' },
]

export default function SocialProofSection() {
  // Double the items for a seamless loop
  const marqueeItems = [...affiliates, ...affiliates]

  return (
    <section id="affiliates" className="scroll-mt-20 py-16 overflow-hidden bg-[#080d1a]">
      {/* Inline styles for guaranteed animation performance */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-container {
          display: flex;
          width: max-content;
          animation: marquee-scroll 40s linear infinite;
        }
        .marquee-container:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="flex flex-col items-center mb-12">
        <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Connected Financial Platforms</p>
        <div className="h-px w-12 bg-blue-500/20" />
      </div>

      <div className="relative">
        {/* Soft edge fades */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#080d1a] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#080d1a] to-transparent z-10 pointer-events-none" />

        <div className="marquee-container gap-24 px-10">
          {marqueeItems.map((affiliate, idx) => (
            <div
              key={`${affiliate.name}-${idx}`}
              className="flex items-center justify-center min-w-[180px]"
            >
              <a
                href={affiliate.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-white transition-all duration-500 text-xl font-bold tracking-tight hover:scale-110 transform"
              >
                {affiliate.name}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
