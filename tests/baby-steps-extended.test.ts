import test from 'node:test'
import assert from 'node:assert/strict'
import { babySteps } from '../lib/baby-steps.ts'

test('baby step titles are unique', () => {
    const uniqueTitles = new Set(babySteps.map((step) => step.title))
    assert.equal(uniqueTitles.size, babySteps.length)
})

test('each step detail fields are present and non-empty', () => {
    for (const step of babySteps) {
        assert.equal(step.details.headline.trim().length > 0, true, `step ${step.step} headline missing`)
        assert.equal(step.details.whyItMatters.trim().length > 0, true, `step ${step.step} whyItMatters missing`)
    }
})

test('each step contains at least three practical actions', () => {
    for (const step of babySteps) {
        assert.equal(step.details.actions.length >= 3, true, `step ${step.step} should have >= 3 actions`)
    }
})

test('actions are non-empty strings with no duplicates per step', () => {
    for (const step of babySteps) {
        const cleaned = step.details.actions.map((action) => action.trim())
        const unique = new Set(cleaned)

        assert.equal(cleaned.every((action) => action.length > 0), true, `step ${step.step} has empty action`)
        assert.equal(unique.size, cleaned.length, `step ${step.step} has duplicate actions`)
    }
})

test('step metadata shape is consistent', () => {
    for (const step of babySteps) {
        assert.equal(typeof step.step, 'number')
        assert.equal(typeof step.title, 'string')
        assert.equal(typeof step.description, 'string')
        assert.equal(Array.isArray(step.details.actions), true)
    }
})
