import { toNumber } from '@/lib/utils/number'
import type { CryptoAssetRow } from '../types'

const USD_TO_GBP = 0.746

export const buildCryptoSnapshot = (cryptoAssets: CryptoAssetRow[]) => {
    const cryptoAssetsSummary = cryptoAssets.map((row) => {
        const amount = toNumber(row.amount);
        const usd = toNumber(row.usd);
        const investedGbp = toNumber(row.invested_gbp);

        return {
            id: row.id,
            ticker: row.ticker,
            name: row.name,
            amount: Number.isFinite(amount) ? amount : 0,
            usd: Number.isFinite(usd) ? usd : 0,
            investedGbp: Number.isFinite(investedGbp) ? investedGbp : 0,
            marketValueGbp: 0, // dynamic base snapshot
        };
    }).filter(asset => asset.amount > 0);

    const totalCryptoValueSnapshot = cryptoAssetsSummary.reduce(
        (sum, asset) => sum + (asset.amount * asset.usd * USD_TO_GBP),
        0
    );
    const totalCryptoInvested = cryptoAssetsSummary.reduce(
        (sum, asset) => sum + asset.investedGbp,
        0
    );

    return {
        assets: cryptoAssetsSummary,
        totalValue: totalCryptoValueSnapshot,
        totalInvested: totalCryptoInvested,
    }
}
