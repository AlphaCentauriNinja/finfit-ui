import test from 'node:test'
import assert from 'node:assert/strict'
import { babySteps } from '../lib/baby-steps.ts'

test('baby steps list has exactly 7 steps', () => {
    assert.equal(babySteps.length, 7)
})

test('baby step numbers are sequential from 1 to 7', () => {
    const numbers = babySteps.map((step) => step.step)
    assert.deepEqual(numbers, [1, 2, 3, 4, 5, 6, 7])
})

test('each baby step has a title and description', () => {
    for (const step of babySteps) {
        assert.ok(step.title.trim().length > 0)
        assert.ok(step.description.trim().length > 0)
    }
})
