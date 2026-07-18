import { describe, it, expect } from 'vitest'
import { getFitBoundsView } from '../../../lib/mapViewerViewport'

describe('getFitBoundsView', () => {
  it('centers the pan on the bounds center', () => {
    const bounds = { maxX: 200, maxY: 100, minX: 100, minY: 0 }
    const viewport = { x: 800, y: 600 }

    const { pan, zoom } = getFitBoundsView(bounds, viewport, 0)

    const centerX = (bounds.minX + bounds.maxX) / 2
    const centerY = (bounds.minY + bounds.maxY) / 2
    expect(pan.x).toBeCloseTo(viewport.x / 2 - centerX * zoom)
    expect(pan.y).toBeCloseTo(viewport.y / 2 - centerY * zoom)
  })

  it('fits the bounds box within the viewport minus padding', () => {
    const bounds = { maxX: 1000, maxY: 500, minX: 0, minY: 0 }
    const viewport = { x: 1600, y: 1200 }
    const padding = 96

    const { zoom } = getFitBoundsView(bounds, viewport, padding)

    // Chosen so the raw fit-zoom falls inside the unclamped min/max zoom
    // range for this viewport width, isolating the fit-to-bounds math from
    // clampZoom's separate min/max-zoom behavior.
    const expectedZoom = Math.min(
      (viewport.x - padding) / 1000,
      (viewport.y - padding) / 500,
    )
    expect(zoom).toBeCloseTo(expectedZoom, 5)
  })

  it('does not divide by zero for a single-point bounds box', () => {
    const bounds = { maxX: 50, maxY: 50, minX: 50, minY: 50 }
    const viewport = { x: 800, y: 600 }

    const { zoom } = getFitBoundsView(bounds, viewport, 0)
    expect(Number.isFinite(zoom)).toBe(true)
  })
})
