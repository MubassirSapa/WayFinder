import { describe, it, expect } from 'vitest'
import { findConnectorTargets, getConnectorType, isConnectorNode } from '../../../lib/connectors'
import type { ViewerMapNode, ViewerPathEdge } from '../../../types/map-viewer.types'

function makeNode(overrides: Partial<ViewerMapNode> & { id: string; floorId: string }): ViewerMapNode {
  return {
    buildingId: 'b1', geometryType: 'icon', isAccessible: true,
    label: '', objectId: null, role: 'hallway_point', x: 0, y: 0,
    ...overrides,
  }
}

function makeEdge(overrides: Partial<ViewerPathEdge> & { id: string; fromNodeId: string; toNodeId: string }): ViewerPathEdge {
  return {
    bidirectional: true, buildingId: 'b1', distanceMeters: 1, floorId: 'f1',
    isAccessible: true, type: 'walkway',
    ...overrides,
  }
}

describe('isConnectorNode', () => {
  it('is true for stairs/elevator/escalator entry roles', () => {
    expect(isConnectorNode(makeNode({ id: 'n1', floorId: 'f1', role: 'stairs_entry' }))).toBe(true)
    expect(isConnectorNode(makeNode({ id: 'n2', floorId: 'f1', role: 'elevator_entry' }))).toBe(true)
    expect(isConnectorNode(makeNode({ id: 'n3', floorId: 'f1', role: 'escalator_entry' }))).toBe(true)
  })

  it('is false for non-connector roles', () => {
    expect(isConnectorNode(makeNode({ id: 'n1', floorId: 'f1', role: 'entrance' }))).toBe(false)
    expect(isConnectorNode(makeNode({ id: 'n2', floorId: 'f1', role: 'hallway_point' }))).toBe(false)
  })
})

describe('getConnectorType', () => {
  it('maps each connector role to its type', () => {
    expect(getConnectorType('stairs_entry')).toBe('stairs')
    expect(getConnectorType('elevator_entry')).toBe('elevator')
    expect(getConnectorType('escalator_entry')).toBe('escalator')
  })

  it('returns null for a non-connector role', () => {
    expect(getConnectorType('hallway_point')).toBeNull()
    expect(getConnectorType('entrance')).toBeNull()
  })
})

describe('findConnectorTargets', () => {
  it('returns an empty array for a non-connector node', () => {
    const node = makeNode({ id: 'n1', floorId: 'f1', role: 'hallway_point' })
    const targets = findConnectorTargets(node, [], {})
    expect(targets).toEqual([])
  })

  it('returns an empty array when the connector has no cross-floor edge yet', () => {
    const node = makeNode({ id: 'stairs1', floorId: 'f1', role: 'stairs_entry' })
    const other = makeNode({ id: 'a', floorId: 'f1' })
    const edges = [makeEdge({ id: 'e1', fromNodeId: 'stairs1', toNodeId: 'a' })]
    const targets = findConnectorTargets(node, edges, { stairs1: node, a: other })
    expect(targets).toEqual([])
  })

  it('returns the single cross-floor target for a two-floor connector', () => {
    const stairs1 = makeNode({ id: 'stairs1', floorId: 'f1', role: 'stairs_entry' })
    const stairs2 = makeNode({ id: 'stairs2', floorId: 'f2', role: 'stairs_entry' })
    const edges = [makeEdge({ id: 'cross', fromNodeId: 'stairs1', toNodeId: 'stairs2', type: 'stairs' })]
    const nodesById = { stairs1, stairs2 }

    const targets = findConnectorTargets(stairs1, edges, nodesById)

    expect(targets).toEqual([{ floorId: 'f2', node: stairs2 }])
  })

  it('finds the target regardless of which side of the edge the node is on', () => {
    const stairs1 = makeNode({ id: 'stairs1', floorId: 'f1', role: 'stairs_entry' })
    const stairs2 = makeNode({ id: 'stairs2', floorId: 'f2', role: 'stairs_entry' })
    const edges = [makeEdge({ id: 'cross', fromNodeId: 'stairs1', toNodeId: 'stairs2', type: 'stairs' })]
    const nodesById = { stairs1, stairs2 }

    const targets = findConnectorTargets(stairs2, edges, nodesById)

    expect(targets).toEqual([{ floorId: 'f1', node: stairs1 }])
  })

  it('returns one entry per distinct floor for a connector serving 3+ floors', () => {
    const elevG = makeNode({ id: 'elevG', floorId: 'ground', role: 'elevator_entry' })
    const elev1 = makeNode({ id: 'elev1', floorId: 'f1', role: 'elevator_entry' })
    const elev2 = makeNode({ id: 'elev2', floorId: 'f2', role: 'elevator_entry' })
    const edges = [
      makeEdge({ id: 'g-1', fromNodeId: 'elevG', toNodeId: 'elev1', type: 'elevator' }),
      makeEdge({ id: 'g-2', fromNodeId: 'elevG', toNodeId: 'elev2', type: 'elevator' }),
    ]
    const nodesById = { elevG, elev1, elev2 }

    const targets = findConnectorTargets(elevG, edges, nodesById)

    expect(targets).toEqual([
      { floorId: 'f1', node: elev1 },
      { floorId: 'f2', node: elev2 },
    ])
  })

  it('dedupes multiple edges that lead to the same floor', () => {
    const elevG = makeNode({ id: 'elevG', floorId: 'ground', role: 'elevator_entry' })
    const elev1a = makeNode({ id: 'elev1a', floorId: 'f1', role: 'elevator_entry' })
    const elev1b = makeNode({ id: 'elev1b', floorId: 'f1', role: 'elevator_entry' })
    const edges = [
      makeEdge({ id: 'g-1a', fromNodeId: 'elevG', toNodeId: 'elev1a', type: 'elevator' }),
      makeEdge({ id: 'g-1b', fromNodeId: 'elevG', toNodeId: 'elev1b', type: 'elevator' }),
    ]
    const nodesById = { elevG, elev1a, elev1b }

    const targets = findConnectorTargets(elevG, edges, nodesById)

    expect(targets).toHaveLength(1)
    expect(targets[0].floorId).toBe('f1')
  })
})
