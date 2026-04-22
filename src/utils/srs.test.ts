import { describe, expect, it } from 'vitest'
import { addDays, calculateNextInterval, isDue } from './srs'

describe('srs', () => {
  it('calculates interval based on mastery and wrong count', () => {
    expect(calculateNextInterval(0, false)).toBe(3)
    expect(calculateNextInterval(0, true)).toBe(7)
    expect(calculateNextInterval(2, false)).toBe(4)
    expect(calculateNextInterval(4, false)).toBe(2)
    expect(calculateNextInterval(6, false)).toBe(1)
  })

  it('adds days', () => {
    const date = new Date('2026-01-01T00:00:00.000Z')
    expect(addDays(date, 3).toISOString()).toContain('2026-01-04')
  })

  it('checks due state', () => {
    const now = new Date('2026-01-10T00:00:00.000Z')
    expect(isDue('2026-01-09T00:00:00.000Z', now)).toBe(true)
    expect(isDue('2026-01-11T00:00:00.000Z', now)).toBe(false)
  })
})
