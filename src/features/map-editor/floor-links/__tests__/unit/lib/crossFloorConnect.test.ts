import { describe, it, expect } from 'vitest'
import { buildCrossFloorEdge, CROSS_FLOOR_DEFAULT_DISTANCE_METERS } from '../../../lib/crossFloorConnect'
import type { EditorMapNode, EditorPathEdge } from '@/features/map-editor/core/types/map.types'

function makeNode(overrides: Partial<EditorMapNode> & { id: string; floorId: string }): EditorMapNode {
  return {
    buildingId: 'b1', geometryType: 'icon', isAccessible: true,
    label: '', objectId: null, role: 'stairs_entry', x: 0, y: 0,
    ...overrides,
  }
}

describe('buildCrossFloorEdge', () => {
  it('returns null when both nodes are on the same floor', () => {
    const fromNode = makeNode({ id: 'n1', floorId: 'f1' })
    const toNode = makeNode({ id: 'n2', floorId: 'f1' })
    expect(buildCrossFloorEdge(fromNode, toNode, [], 'stairs')).toBeNull()
  })

  it('returns null when an edge already exists between the nodes', () => {
    const fromNode = makeNode({ id: 'n1', floorId: 'f1' })
    const toNode = makeNode({ id: 'n2', floorId: 'f2' })
    const existingEdge: EditorPathEdge = {
      bidirectional: true, buildingId: 'b1', distanceMeters: 6, floorId: 'f1',
      fromNodeId: 'n1', id: 'e1', isAccessible: true, toNodeId: 'n2', type: 'stairs',
    }
    expect(buildCrossFloorEdge(fromNode, toNode, [existingEdge], 'stairs')).toBeNull()
  })

  it('builds a valid edge for two nodes on different floors', () => {
    const fromNode = makeNode({ id: 'n1', floorId: 'f1' })
    const toNode = makeNode({ id: 'n2', floorId: 'f2' })
    const edge = buildCrossFloorEdge(fromNode, toNode, [], 'elevator')

    expect(edge).toMatchObject({
      bidirectional: true,
      distanceMeters: CROSS_FLOOR_DEFAULT_DISTANCE_METERS.elevator,
      fromNodeId: 'n1',
      toNodeId: 'n2',
      type: 'elevator',
    })
  })

  it('uses the default distance for the type when none is passed', () => {
    const fromNode = makeNode({ id: 'n1', floorId: 'f1' })
    const toNode = makeNode({ id: 'n2', floorId: 'f2' })
    const edge = buildCrossFloorEdge(fromNode, toNode, [], 'stairs')
    expect(edge?.distanceMeters).toBe(CROSS_FLOOR_DEFAULT_DISTANCE_METERS.stairs)
  })

  it('accepts an explicit distance override', () => {
    const fromNode = makeNode({ id: 'n1', floorId: 'f1' })
    const toNode = makeNode({ id: 'n2', floorId: 'f2' })
    const edge = buildCrossFloorEdge(fromNode, toNode, [], 'stairs', 12)
    expect(edge?.distanceMeters).toBe(12)
  })

  it('marks the edge inaccessible if either node is inaccessible', () => {
    const fromNode = makeNode({ id: 'n1', floorId: 'f1', isAccessible: false })
    const toNode = makeNode({ id: 'n2', floorId: 'f2' })
    const edge = buildCrossFloorEdge(fromNode, toNode, [], 'elevator')
    expect(edge?.isAccessible).toBe(false)
  })
})
