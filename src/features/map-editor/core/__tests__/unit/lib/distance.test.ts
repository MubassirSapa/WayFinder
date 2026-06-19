import { describe, it, expect } from 'vitest'
import { pixelDistance, pixelsToMeters } from '../../../lib/distance'

describe('pixelDistance', () => {
  it('returns 0 for same point', () => {
    expect(pixelDistance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0)
  })

  it('calculates horizontal distance', () => {
    expect(pixelDistance({ x: 0, y: 0 }, { x: 3, y: 0 })).toBe(3)
  })

  it('calculates vertical distance', () => {
    expect(pixelDistance({ x: 0, y: 0 }, { x: 0, y: 4 })).toBe(4)
  })

  it('calculates diagonal distance (3-4-5 triangle)', () => {
    expect(pixelDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })

  it('is symmetric', () => {
    const a = { x: 10, y: 20 }
    const b = { x: 50, y: 80 }
    expect(pixelDistance(a, b)).toBe(pixelDistance(b, a))
  })
})

describe('pixelsToMeters', () => {
  it('uses default scale of 0.05', () => {
    expect(pixelsToMeters(100)).toBe(5)
  })

  it('applies custom scale', () => {
    expect(pixelsToMeters(200, 0.1)).toBe(20)
  })

  it('rounds to 2 decimal places', () => {
    expect(pixelsToMeters(3, 0.1)).toBe(0.3)
  })

  it('returns 0 for 0 pixels', () => {
    expect(pixelsToMeters(0)).toBe(0)
  })
})
