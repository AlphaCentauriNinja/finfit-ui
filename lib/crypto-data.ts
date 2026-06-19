/**
 * Crypto asset data types and Binance stream configuration.
 *
 * Currency types and constants are now imported from @/lib/types/currency.
 */

// Re-export currency types for backward compatibility with existing imports
export { type CurrencyCode, USD_TO_GBP, GBP_TO_CURRENCY_RATE, CURRENCY_LOCALE } from '@/lib/types/currency'

export type CryptoRow = {
    id: string
    ticker: string
    name: string
    description?: string
    amount: number
    usd: number
    marketValueGbp: number
    investedGbp: number
}

export const DEFAULT_COIN_NAME_BY_TICKER: Record<string, string> = {
    BTC: 'Bitcoin',
    XRP: 'Ripple XRP',
    ADA: 'Cardano',
    SOL: 'Solana',
    ALGO: 'Algorand',
    ETH: 'Ethereum',
}

export const initialCryptoRows: CryptoRow[] = [
    {
        id: 'C.1',
        ticker: 'BTC',
        name: 'Bitcoin',
        amount: 0.238478,
        usd: 67207.08,
        marketValueGbp: 11954.51,
        investedGbp: 11929.00,
    },
    {
        id: 'C.2',
        ticker: 'XRP',
        name: 'Ripple XRP',
        amount: 2689.15,
        usd: 1.34,
        marketValueGbp: 2687.75,
        investedGbp: 2667.75,
    },
    {
        id: 'C.3',
        ticker: 'ADA',
        name: 'Cardano',
        amount: 5332.275228,
        usd: 0.2493,
        marketValueGbp: 991.52,
        investedGbp: 984.70,
    },
    {
        id: 'C.4',
        ticker: 'SOL',
        name: 'Solana',
        amount: 7.59431,
        usd: 81.99,
        marketValueGbp: 464.43,
        investedGbp: 461.46,
    },
    {
        id: 'C.5',
        ticker: 'ALGO',
        name: 'Algorand',
        amount: 1055.66,
        usd: 0.08209,
        marketValueGbp: 64.64,
        investedGbp: 63.81,
    },
    {
        id: 'C.6',
        ticker: 'ETH',
        name: 'Ethereum',
        amount: 0.023609,
        usd: 1941.89,
        marketValueGbp: 34.20,
        investedGbp: 33.86,
    },
]

export const streamSymbols = initialCryptoRows.map((row) => `${row.ticker.toLowerCase()}usdt`)
export const binanceCombinedStreamUrl = `wss://stream.binance.com:9443/stream?streams=${streamSymbols
    .map((symbol) => `${symbol}@ticker`)
    .join('/')}`
