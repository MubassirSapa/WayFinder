import { describe, it, expect } from 'vitest'
import { normalizeFloor, normalizeMapObject } from '../../../lib/normalizeEditorData'
import type { Floor, MapObject } from '@/payload-types'

function makeFloorDoc(overrides: Partial<Floor> = {}): Floor {
  return {
    id: 1,
    buildingId: 'b1',
    name: 'Ground Floor',
    level: 0,
    width: 1200,
    height: 800,
    status: 'draft',
    updatedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeObjectDoc(overrides: Partial<MapObject> = {}): MapObject {
  return {
    id: 1,
    buildingId: 'b1',
    floor: 1,
    type: 'room',
    name: 'Room 1',
    x: 0,
    y: 0,
    updatedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('normalizeFloor', () => {
  it('defaults backgroundImageVisible to true when the field is absent (legacy floors)', () => {
    const result = normalizeFloor(makeFloorDoc())
    expect(result.backgroundImageVisible).toBe(true)
  })

  it('defaults backgroundImageVisible to true when explicitly null', () => {
    const result = normalizeFloor(makeFloorDoc({ backgroundImageVisible: null }))
    expect(result.backgroundImageVisible).toBe(true)
  })

  it('preserves an explicit false for backgroundImageVisible', () => {
    const result = normalizeFloor(makeFloorDoc({ backgroundImageVisible: false }))
    expect(result.backgroundImageVisible).toBe(false)
  })

  it('preserves an explicit true for backgroundImageVisible', () => {
    const result = normalizeFloor(makeFloorDoc({ backgroundImageVisible: true }))
    expect(result.backgroundImageVisible).toBe(true)
  })

  it('applies the usual defaults for other reference-image fields', () => {
    const result = normalizeFloor(makeFloorDoc())
    expect(result.backgroundImageRotation).toBe(0)
    expect(result.backgroundImageScale).toBe(1)
    expect(result.backgroundImageOpacity).toBe(0.3)
    expect(result.backgroundImageLocked).toBe(false)
    expect(result.backgroundImageOffsetX).toBe(0)
    expect(result.backgroundImageOffsetY).toBe(0)
    expect(result.backgroundImageFit).toBe('fill')
  })
})

describe('normalizeMapObject', () => {
  it('defaults shape to "rectangle" when absent', () => {
    const result = normalizeMapObject(makeObjectDoc())
    expect(result.shape).toBe('rectangle')
  })

  it('defaults points to null when absent', () => {
    const result = normalizeMapObject(makeObjectDoc())
    expect(result.points).toBeNull()
  })

  it('defaults points to null when explicitly null', () => {
    const result = normalizeMapObject(makeObjectDoc({ points: null }))
    expect(result.points).toBeNull()
  })

  it('maps a polygon shape and its points through unchanged', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 80 },
      { x: 0, y: 80 },
    ]
    const result = normalizeMapObject(
      makeObjectDoc({ shape: 'polygon', points: points.map((p) => ({ ...p, id: null })) }),
    )
    expect(result.shape).toBe('polygon')
    expect(result.points).toEqual(points)
  })

  it('drops the per-point id field (index-based, no stable point identity)', () => {
    const result = normalizeMapObject(
      makeObjectDoc({ shape: 'polygon', points: [{ x: 1, y: 2, id: 'abc' }] }),
    )
    expect(result.points).toEqual([{ x: 1, y: 2 }])
  })

  it('preserves an explicit ellipse shape', () => {
    const result = normalizeMapObject(makeObjectDoc({ shape: 'ellipse' }))
    expect(result.shape).toBe('ellipse')
  })
})
