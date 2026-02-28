const affiliates = [
  {
    name: 'BullionByPost',
    label: 'bullionbypost.co.uk',
    href: 'https://www.bullionbypost.co.uk',
    badgeClass: 'from-amber-500/35 to-yellow-300/20 border-amber-300/35 text-amber-100',
  },
  {
    name: 'HSBC',
    label: 'hsbc.com',
    href: 'https://www.hsbc.com',
    badgeClass: 'from-red-600/35 to-red-300/20 border-red-300/35 text-red-100',
  },
  {
    name: 'Trading 212',
    label: 'trading212.com',
    href: 'https://www.trading212.com',
    badgeClass: 'from-emerald-500/35 to-green-300/20 border-emerald-300/35 text-emerald-100',
  },
  {
    name: 'PensionBee',
    label: 'pensionbee.com',
    href: 'https://www.pensionbee.com',
    badgeClass: 'from-yellow-500/35 to-amber-300/20 border-yellow-300/35 text-yellow-100',
  },
  {
    name: 'TradingView',
    label: 'tradingview.com',
    href: 'https://www.tradingview.com',
    badgeClass: 'from-blue-500/35 to-sky-300/20 border-blue-300/35 text-blue-100',
  },
  {
    name: 'Coinbase',
    label: 'coinbase.com',
    href: 'https://www.coinbase.com',
    badgeClass: 'from-indigo-500/35 to-violet-300/20 border-indigo-300/35 text-indigo-100',
  },
]

export default function SocialProofSection() {
  return (
    <section id="affiliates" className="scroll-mt-28">
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300/70">Affiliates</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">Connected Financial Platforms</h2>
          </div>
          <p className="text-xs text-slate-400">Grey by default, full colour on hover</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {affiliates.map((affiliate) => (
            <a
              key={affiliate.name}
              href={affiliate.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`block rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300 grayscale saturate-0 opacity-75 hover:grayscale-0 hover:saturate-100 hover:opacity-100 hover:-translate-y-0.5 ${affiliate.badgeClass}`}
            >
              <p className="text-lg font-semibold">{affiliate.name}</p>
              <p className="text-xs mt-1 text-white/80">{affiliate.label}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
