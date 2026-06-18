import { describe, it, expect } from 'vitest'
import { snapToGrid, GRID_SIZE } from '../../../lib/canvas'

// canvasPointFromEvent requires a live SVGSVGElement (browser CTM) — covered by E2E tests

describe('GRID_SIZE', () => {
  it('is 20', () => {
    expect(GRID_SIZE).toBe(20)
  })
})

describe('snapToGrid', () => {
  it('snaps exact grid value to itself', () => {
    expect(snapToGrid(40)).toBe(40)
  })

  it('snaps value below midpoint down', () => {
    expect(snapToGrid(9)).toBe(0)
  })

  it('snaps value above midpoint up', () => {
    expect(snapToGrid(11)).toBe(20)
  })

  it('snaps midpoint up', () => {
    expect(snapToGrid(10)).toBe(20)
  })

  it('works with custom grid size', () => {
    expect(snapToGrid(7, 5)).toBe(5)
    expect(snapToGrid(8, 5)).toBe(10)
  })

  it('handles 0', () => {
    expect(snapToGrid(0)).toBe(0)
  })

  it('handles negative values', () => {
    expect(snapToGrid(-5)).toBeCloseTo(0)
    expect(snapToGrid(-11)).toBe(-20)
  })
})
