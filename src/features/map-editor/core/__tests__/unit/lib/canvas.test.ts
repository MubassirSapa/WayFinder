import { describe, it, expect } from 'vitest'
import { getFloorContentBounds, snapToGrid, GRID_SIZE, toObjectLocalPoint } from '../../../lib/canvas'
import type { EditorMapNode, EditorMapObject } from '../../../types/map.types'

// canvasPointFromEvent/clientPointToSvg require a live SVGSVGElement (browser CTM) — covered by E2E tests

function makeObject(overrides: Partial<EditorMapObject>): EditorMapObject {
  return {
    id: 'o1',
    floorId: 'f1',
    buildingId: 'b1',
    parentObjectId: null,
    type: 'room',
    name: 'Room',
    label: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    shape: 'rectangle',
    isSearchable: true,
    isAccessible: true,
    ...overrides,
  }
}

function makeNode(overrides: Partial<EditorMapNode>): EditorMapNode {
  return {
    id: 'n1',
    floorId: 'f1',
    buildingId: 'b1',
    objectId: null,
    role: 'hallway_point',
    label: '',
    x: 0,
    y: 0,
    geometryType: 'icon',
    isAccessible: true,
    ...overrides,
  }
}

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

describe('toObjectLocalPoint', () => {
  // A 100x80 object at (200, 100), so cx=50, cy=40 and its screen-space
  // center sits at (250, 140).
  const objectX = 200
  const objectY = 100
  const cx = 50
  const cy = 40

  it('is a no-op translate when rotation is 0', () => {
    const local = toObjectLocalPoint({ x: 210, y: 110 }, objectX, objectY, 0, cx, cy)
    expect(local.x).toBeCloseTo(10)
    expect(local.y).toBeCloseTo(10)
  })

  it('recovers the local origin for the object at any rotation', () => {
    // The object's own center in SVG space is always (objectX + cx, objectY + cy),
    // regardless of rotation, since rotation pivots around that exact point.
    for (const rotation of [0, 45, 90, 180, 270, -30]) {
      const local = toObjectLocalPoint(
        { x: objectX + cx, y: objectY + cy },
        objectX,
        objectY,
        rotation,
        cx,
        cy,
      )
      expect(local.x).toBeCloseTo(cx)
      expect(local.y).toBeCloseTo(cy)
    }
  })

  it('rotates a screen-space drag back into local space at 90 degrees', () => {
    // A point one unit to the right of center in screen space, with the
    // object rotated 90°, lands one unit *above* center locally — dragging
    // right on screen corresponds to moving "up" in the object's own
    // unrotated coordinate space once it's rotated a quarter turn.
    const local = toObjectLocalPoint(
      { x: objectX + cx + 10, y: objectY + cy },
      objectX,
      objectY,
      90,
      cx,
      cy,
    )
    expect(local.x).toBeCloseTo(cx)
    expect(local.y).toBeCloseTo(cy - 10)
  })

  it('rotates a screen-space drag back into local space at -90 degrees', () => {
    const local = toObjectLocalPoint(
      { x: objectX + cx + 10, y: objectY + cy },
      objectX,
      objectY,
      -90,
      cx,
      cy,
    )
    expect(local.x).toBeCloseTo(cx)
    expect(local.y).toBeCloseTo(cy + 10)
  })

  it('round-trips: rotating a local point forward then back returns the original', () => {
    const rotationDeg = 37
    const localPoint = { x: cx + 15, y: cy - 8 }
    const rad = (rotationDeg * Math.PI) / 180

    // Forward transform: local -> screen (mirrors the object's own
    // translate(objectX, objectY) rotate(rotationDeg, cx, cy) render transform).
    const dx = localPoint.x - cx
    const dy = localPoint.y - cy
    const screenPoint = {
      x: objectX + cx + dx * Math.cos(rad) - dy * Math.sin(rad),
      y: objectY + cy + dx * Math.sin(rad) + dy * Math.cos(rad),
    }

    const recovered = toObjectLocalPoint(screenPoint, objectX, objectY, rotationDeg, cx, cy)
    expect(recovered.x).toBeCloseTo(localPoint.x)
    expect(recovered.y).toBeCloseTo(localPoint.y)
  })
})

describe('getFloorContentBounds', () => {
  it('returns 0x0 for an empty floor', () => {
    expect(getFloorContentBounds([], [])).toEqual({ width: 0, height: 0 })
  })

  it('bounds a single object by its far corner', () => {
    const objects = [makeObject({ x: 100, y: 50, width: 80, height: 40 })]
    expect(getFloorContentBounds(objects, [])).toEqual({ width: 180, height: 90 })
  })

  it('bounds a single node by its point', () => {
    const nodes = [makeNode({ x: 300, y: 120 })]
    expect(getFloorContentBounds([], nodes)).toEqual({ width: 300, height: 120 })
  })

  it('takes the max extent across every object and node', () => {
    const objects = [
      makeObject({ x: 0, y: 0, width: 100, height: 100 }),
      makeObject({ x: 500, y: 10, width: 50, height: 20 }),
    ]
    const nodes = [makeNode({ x: 200, y: 900 })]

    expect(getFloorContentBounds(objects, nodes)).toEqual({ width: 550, height: 900 })
  })
})
