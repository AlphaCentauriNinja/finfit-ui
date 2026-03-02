const affiliates = [
  { name: 'BullionByPost', label: 'bullionbypost.co.uk', href: 'https://www.bullionbypost.co.uk', category: 'Precious Metals' },
  { name: 'HSBC', label: 'hsbc.com', href: 'https://www.hsbc.com', category: 'Banking' },
  { name: 'Trading 212', label: 'trading212.com', href: 'https://www.trading212.com', category: 'Equities & ETFs' },
  { name: 'PensionBee', label: 'pensionbee.com', href: 'https://www.pensionbee.com', category: 'Pension' },
  { name: 'TradingView', label: 'tradingview.com', href: 'https://www.tradingview.com', category: 'Market Data' },
  { name: 'Coinbase', label: 'coinbase.com', href: 'https://www.coinbase.com', category: 'Crypto' },
]

export default function SocialProofSection() {
  return (
    <section id="affiliates" className="scroll-mt-20">
      <div className="rounded-xl border border-white/[0.07] bg-[#0e1629] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-8 py-6 border-b border-white/[0.06]">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-blue-400 mb-1.5">Affiliates</p>
            <h2 className="text-xl font-bold text-white">Connected Financial Platforms</h2>
          </div>
          <span className="text-xs text-slate-500">{affiliates.length} platforms integrated</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-white/[0.05]">
          {affiliates.map((affiliate) => (
            <a
              key={affiliate.name}
              href={affiliate.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between p-6 hover:bg-white/[0.03] transition-colors"
            >
              <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 group-hover:text-blue-400 transition-colors">
                {affiliate.category}
              </p>
              <div>
                <p className="text-base font-semibold text-slate-300 group-hover:text-white transition-colors">
                  {affiliate.name}
                </p>
                <p className="text-xs text-slate-600 mt-1 group-hover:text-slate-400 transition-colors">
                  {affiliate.label}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
