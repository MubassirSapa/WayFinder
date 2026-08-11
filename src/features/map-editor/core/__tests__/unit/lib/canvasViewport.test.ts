import { describe, it, expect } from 'vitest'
import {
  buildCanvasViewportTransform,
  clampEditorPan,
  clampEditorZoom,
  getEditorDefaultView,
  getEditorFitZoom,
} from '../../../lib/canvasViewport'

describe('clampEditorZoom', () => {
  it('clamps above the max', () => {
    expect(clampEditorZoom(10)).toBe(4)
  })

  it('clamps below the min', () => {
    expect(clampEditorZoom(0.001)).toBe(0.25)
  })

  it('leaves an in-range value untouched', () => {
    expect(clampEditorZoom(1)).toBe(1)
  })
})

describe('getEditorFitZoom', () => {
  it('picks the tighter of the two axes so the whole floor fits', () => {
    // (1200-96)/1200 = 0.92, (800-96)/800 = 0.88 -> the smaller one wins
    expect(getEditorFitZoom({ width: 1200, height: 800 }, { x: 1200, y: 800 })).toBeCloseTo(0.88)
  })

  it('returns 1 for a non-positive floor size', () => {
    expect(getEditorFitZoom({ width: 0, height: 800 }, { x: 1200, y: 800 })).toBe(1)
  })

  it('returns 1 for a non-positive viewport size', () => {
    expect(getEditorFitZoom({ width: 1200, height: 800 }, { x: 0, y: 0 })).toBe(1)
  })

  it('clamps a tiny floor to the max zoom instead of zooming in indefinitely', () => {
    expect(getEditorFitZoom({ width: 10, height: 10 }, { x: 1200, y: 800 })).toBe(4)
  })
})

describe('clampEditorPan', () => {
  it('keeps a floor smaller than the viewport within overscroll of centered bounds', () => {
    const floorSize = { width: 1200, height: 800 }
    const viewport = { x: 1200, y: 800 }
    const zoom = 0.88 // scaled size 1056x704, both under the viewport

    expect(clampEditorPan({ x: 72, y: 48 }, floorSize, viewport, zoom)).toEqual({ x: 72, y: 48 })
    expect(clampEditorPan({ x: 10000, y: 10000 }, floorSize, viewport, zoom)).toEqual({ x: 232, y: 184 })
    expect(clampEditorPan({ x: -10000, y: -10000 }, floorSize, viewport, zoom)).toEqual({ x: -88, y: -88 })
  })

  it('keeps at least the overscroll sliver reachable for a floor larger than the viewport', () => {
    const floorSize = { width: 2000, height: 2000 }
    const viewport = { x: 1000, y: 1000 }
    const zoom = 1

    expect(clampEditorPan({ x: 0, y: 0 }, floorSize, viewport, zoom)).toEqual({ x: 0, y: 0 })
    expect(clampEditorPan({ x: 500, y: 500 }, floorSize, viewport, zoom)).toEqual({ x: 88, y: 88 })
    expect(clampEditorPan({ x: -2000, y: -2000 }, floorSize, viewport, zoom)).toEqual({ x: -1088, y: -1088 })
  })
})

describe('getEditorDefaultView', () => {
  it('centers the floor in the viewport at the fit zoom', () => {
    const view = getEditorDefaultView({ width: 1200, height: 800 }, { x: 1200, y: 800 })
    expect(view.zoom).toBeCloseTo(0.88)
    expect(view.pan.x).toBeCloseTo(72)
    expect(view.pan.y).toBeCloseTo(48)
  })
})

describe('buildCanvasViewportTransform', () => {
  it('formats a translate + scale CSS transform', () => {
    expect(buildCanvasViewportTransform({ x: 10, y: 20 }, 1.5)).toBe('translate(10px, 20px) scale(1.5)')
  })
})
