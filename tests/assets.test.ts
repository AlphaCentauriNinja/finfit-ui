import test from 'node:test'
import assert from 'node:assert/strict'
import { assets, totalAssets, assetsWithAllocation } from '../lib/assets.ts'

test('totalAssets equals sum of asset values', () => {
    const computedTotal = assets.reduce((sum, asset) => sum + asset.value, 0)
    assert.equal(totalAssets, computedTotal)
})

test('assetsWithAllocation mirrors assets list', () => {
    assert.equal(assetsWithAllocation.length, assets.length)
    for (let i = 0; i < assets.length; i += 1) {
        assert.equal(assetsWithAllocation[i].name, assets[i].name)
        assert.equal(assetsWithAllocation[i].value, assets[i].value)
    }
})

test('asset allocations sum to approximately 100%', () => {
    const allocationTotal = assetsWithAllocation.reduce((sum, asset) => sum + asset.allocation, 0)
    assert.ok(Math.abs(allocationTotal - 100) < 0.000001)
})
