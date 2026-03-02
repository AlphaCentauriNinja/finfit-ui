import test from 'node:test'
import assert from 'node:assert/strict'
import { assets, totalAssets, assetsWithAllocation } from '../lib/assets.ts'

test('all asset values are finite and non-negative', () => {
    for (const asset of assets) {
        assert.equal(Number.isFinite(asset.value), true, `${asset.name} value should be finite`)
        assert.equal(asset.value >= 0, true, `${asset.name} value should be >= 0`)
    }
})

test('asset names are unique', () => {
    const uniqueNames = new Set(assets.map((asset) => asset.name))
    assert.equal(uniqueNames.size, assets.length)
})

test('total assets is positive when at least one asset exists', () => {
    assert.equal(assets.length > 0, true)
    assert.equal(totalAssets > 0, true)
})

test('each allocation is mathematically consistent with source value', () => {
    for (const asset of assetsWithAllocation) {
        const expected = (asset.value / totalAssets) * 100
        assert.ok(Math.abs(asset.allocation - expected) < 1e-9)
    }
})

test('allocations are bounded between 0 and 100', () => {
    for (const asset of assetsWithAllocation) {
        assert.equal(asset.allocation >= 0, true, `${asset.name} allocation should be >= 0`)
        assert.equal(asset.allocation <= 100, true, `${asset.name} allocation should be <= 100`)
    }
})

test('highest value asset also has highest allocation', () => {
    const highestValueAsset = [...assets].sort((a, b) => b.value - a.value)[0]
    const highestAllocationAsset = [...assetsWithAllocation].sort((a, b) => b.allocation - a.allocation)[0]

    assert.equal(highestValueAsset.name, highestAllocationAsset.name)
})
