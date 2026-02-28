export const assets = [
    { name: 'Pension', value: 77654.66 },
    { name: 'Real Estate', value: 103201.0 },
    { name: 'Investments', value: 28146.91 },
    { name: 'Savings', value: 21173.29 },
    { name: 'Crypto', value: 16340.57 },
    { name: 'Bullion', value: 15232.91 },
]

export const totalAssets = assets.reduce(
    (sum, asset) => sum + asset.value,
    0
)

export const assetsWithAllocation = assets.map(asset => ({
    ...asset,
    allocation: (asset.value / totalAssets) * 100
}))
