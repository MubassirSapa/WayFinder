import { describe, it, expect } from 'vitest'
import {
  clampPanToViewport,
  clampZoom,
  getDefaultViewState,
  getDistance,
  getFitBoundsView,
  getMidpoint,
  getZoomProfile,
} from '../../../lib/mapViewerViewport'
import type { ViewerFloor } from '../../../types/map-viewer.types'

const floor: ViewerFloor = {
  id: 'floor-1',
  buildingId: 'building-1',
  organizationName: null,
  name: 'Ground Floor',
  level: 0,
  width: 800,
  height: 600,
  status: 'published',
}

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

describe('getZoomProfile', () => {
  it('returns the desktop range at and above the mobile breakpoint', () => {
    expect(getZoomProfile(768)).toEqual({
      initialZoomMultiplier: 1.18,
      maxZoom: 2.1,
      minZoom: 0.75,
    })
  })

  it('returns the mobile range below the breakpoint', () => {
    expect(getZoomProfile(767)).toEqual({
      initialZoomMultiplier: 1.28,
      maxZoom: 2.35,
      minZoom: 0.7,
    })
  })
})

describe('clampZoom', () => {
  it('leaves an in-range desktop zoom untouched', () => {
    expect(clampZoom(1.5, 1200)).toBe(1.5)
  })

  it('clamps below the desktop minimum', () => {
    expect(clampZoom(0.1, 1200)).toBe(0.75)
  })

  it('clamps above the desktop maximum', () => {
    expect(clampZoom(10, 1200)).toBe(2.1)
  })

  it('uses the mobile range when the viewport is narrow', () => {
    expect(clampZoom(10, 400)).toBe(2.35)
    expect(clampZoom(0.1, 400)).toBe(0.7)
  })
})

describe('getDistance', () => {
  it('computes the straight-line distance between two points', () => {
    expect(getDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })

  it('is zero for coincident points', () => {
    expect(getDistance({ x: 12, y: -7 }, { x: 12, y: -7 })).toBe(0)
  })
})

describe('getMidpoint', () => {
  it('averages the x and y of two points', () => {
    expect(getMidpoint({ x: 0, y: 0 }, { x: 10, y: 20 })).toEqual({ x: 5, y: 10 })
  })

  it('handles negative coordinates', () => {
    expect(getMidpoint({ x: -10, y: 4 }, { x: 10, y: -4 })).toEqual({ x: 0, y: 0 })
  })
})

describe('clampPanToViewport', () => {
  const viewport = { x: 1000, y: 800 }

  it('keeps an in-bounds pan unchanged when the floor is smaller than the viewport', () => {
    // Rendered floor (800+40) x (600+40) at zoom 1 fits well inside the
    // 1000x800 viewport, so any pan within the overscroll margin passes through.
    const pan = clampPanToViewport({ x: 50, y: 30 }, floor, viewport, 1)
    expect(pan).toEqual({ x: 50, y: 30 })
  })

  it('does not let a small floor be dragged past the overscroll margin', () => {
    const pan = clampPanToViewport({ x: 5000, y: 5000 }, floor, viewport, 1, 88)
    // Clamped to viewport - scaledSize + overscroll on the high side.
    expect(pan.x).toBeLessThanOrEqual(1000 - 840 + 88)
    expect(pan.y).toBeLessThanOrEqual(800 - 640 + 88)
  })

  it('does not let a small floor be dragged before the negative overscroll margin', () => {
    const pan = clampPanToViewport({ x: -5000, y: -5000 }, floor, viewport, 1, 88)
    expect(pan.x).toBeGreaterThanOrEqual(-88)
    expect(pan.y).toBeGreaterThanOrEqual(-88)
  })

  it('clamps a floor larger than the viewport so it cannot be dragged past its own edges', () => {
    // At zoom 3 the rendered floor (840x640 * 3) is much bigger than the viewport,
    // so the clamp branch flips: pan.x/y must stay between
    // (viewport - scaledSize - overscroll) and overscroll.
    const zoom = 3
    const pan = clampPanToViewport({ x: 100000, y: 100000 }, floor, viewport, zoom, 88)
    expect(pan.x).toBeLessThanOrEqual(88)
    expect(pan.y).toBeLessThanOrEqual(88)

    const panNegative = clampPanToViewport({ x: -100000, y: -100000 }, floor, viewport, zoom, 88)
    const scaledWidth = (floor.width + 40) * zoom
    const scaledHeight = (floor.height + 40) * zoom
    expect(panNegative.x).toBeGreaterThanOrEqual(viewport.x - scaledWidth - 88)
    expect(panNegative.y).toBeGreaterThanOrEqual(viewport.y - scaledHeight - 88)
  })
})

describe('getDefaultViewState', () => {
  it('returns a zoom within the desktop profile range and a clamped pan', () => {
    const viewport = { x: 1200, y: 900 }
    const { pan, zoom } = getDefaultViewState(floor, viewport)

    expect(zoom).toBeGreaterThanOrEqual(0.75)
    expect(zoom).toBeLessThanOrEqual(2.1)
    // The unclamped default pan is the fixed offset (20, 76); for a floor that
    // fits comfortably in this viewport, clamping should leave it untouched.
    expect(pan).toEqual({ x: 20, y: 76 })
  })

  it('is finite and stable for a tiny viewport (initial mount / zero-size race)', () => {
    const { pan, zoom } = getDefaultViewState(floor, { x: 0, y: 0 })
    expect(Number.isFinite(zoom)).toBe(true)
    expect(Number.isFinite(pan.x)).toBe(true)
    expect(Number.isFinite(pan.y)).toBe(true)
  })
})
