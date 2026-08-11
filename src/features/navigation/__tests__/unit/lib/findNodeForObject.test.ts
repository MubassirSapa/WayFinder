import { describe, it, expect } from 'vitest'
import { findBestNodeIdForObject, findNodeIdForObject, findNodeIdsForObject } from '../../../lib/findNodeForObject'
import { buildRouteGraph } from '../../../lib/graph'
import type { ViewerMapNode, ViewerPathEdge } from '@/features/map-viewer/types/map-viewer.types'

function makeNode(overrides: Partial<ViewerMapNode> & { id: string }): ViewerMapNode {
  return {
    buildingId: 'b1', floorId: 'f1', geometryType: 'icon', isAccessible: true,
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

describe('findNodeIdForObject', () => {
  it('returns the matching node id', () => {
    const nodes = [makeNode({ id: 'n1', objectId: 'obj1' })]
    expect(findNodeIdForObject('obj1', nodes)).toBe('n1')
  })

  it('returns null when no node matches', () => {
    expect(findNodeIdForObject('obj1', [])).toBeNull()
  })
})

describe('findNodeIdsForObject', () => {
  it('returns every node sharing the objectId, not just the first', () => {
    const nodes = [
      makeNode({ id: 'entryA', objectId: 'room1' }),
      makeNode({ id: 'entryB', objectId: 'room1' }),
      makeNode({ id: 'other', objectId: 'room2' }),
    ]
    expect(findNodeIdsForObject('room1', nodes)).toEqual(['entryA', 'entryB'])
  })

  it('returns an empty array when the object has no nodes', () => {
    expect(findNodeIdsForObject('room1', [])).toEqual([])
  })
})

describe('findBestNodeIdForObject', () => {
  it('returns the single candidate without touching the graph when there is only one', () => {
    const nodes = [makeNode({ id: 'n1', objectId: 'room1' })]
    // An empty graph would fail any pathfinding attempt - if this returns
    // n1 anyway, the single-candidate fast path skipped pathfinding entirely.
    expect(findBestNodeIdForObject('room1', nodes, new Map(), 'other', 'origin')).toBe('n1')
  })

  it('falls back to the first candidate when there is no other endpoint to compare against yet', () => {
    const nodes = [
      makeNode({ id: 'entryA', objectId: 'room1' }),
      makeNode({ id: 'entryB', objectId: 'room1' }),
    ]
    expect(findBestNodeIdForObject('room1', nodes, new Map(), null, 'origin')).toBe('entryA')
  })

  it('picks whichever entrance produces the shorter path, not whichever is first', () => {
    // other--(2m)--entryA--(10m)--entryB : entryB is a real second entrance to
    // the same room, but far from "other" - entryA is the correct pick even
    // though entryB happens to come first in the node list.
    const nodes = [
      makeNode({ id: 'entryB', objectId: 'room1' }),
      makeNode({ id: 'entryA', objectId: 'room1' }),
      makeNode({ id: 'other' }),
    ]
    const edges = [
      makeEdge({ id: 'e1', fromNodeId: 'other', toNodeId: 'entryA', distanceMeters: 2 }),
      makeEdge({ id: 'e2', fromNodeId: 'entryA', toNodeId: 'entryB', distanceMeters: 10 }),
    ]
    const graph = buildRouteGraph(nodes, edges)

    expect(findBestNodeIdForObject('room1', nodes, graph, 'other', 'origin')).toBe('entryA')
  })

  it('routes in the correct direction for a "destination" role, not just "origin"', () => {
    // One-way edges: other -> entryA exists, but nothing reaches entryB from
    // other. As a destination, only entryA is actually reachable.
    const nodes = [
      makeNode({ id: 'entryA', objectId: 'room1' }),
      makeNode({ id: 'entryB', objectId: 'room1' }),
      makeNode({ id: 'other' }),
    ]
    const edges = [
      makeEdge({ id: 'e1', fromNodeId: 'other', toNodeId: 'entryA', bidirectional: false, distanceMeters: 5 }),
    ]
    const graph = buildRouteGraph(nodes, edges)

    expect(findBestNodeIdForObject('room1', nodes, graph, 'other', 'destination')).toBe('entryA')
  })

  it('skips an entrance that fails the accessible-only filter in favor of one that passes', () => {
    const nodes = [
      makeNode({ id: 'entryA', objectId: 'room1', isAccessible: false }),
      makeNode({ id: 'entryB', objectId: 'room1', isAccessible: true }),
      makeNode({ id: 'other' }),
    ]
    const edges = [
      // entryA is closer, but not accessible - entryB must win once the
      // graph is built with accessibleOnly.
      makeEdge({ id: 'e1', fromNodeId: 'other', toNodeId: 'entryA', distanceMeters: 1 }),
      makeEdge({ id: 'e2', fromNodeId: 'other', toNodeId: 'entryB', distanceMeters: 8 }),
    ]
    const accessibleGraph = buildRouteGraph(nodes, edges, { accessibleOnly: true })

    expect(findBestNodeIdForObject('room1', nodes, accessibleGraph, 'other', 'origin')).toBe('entryB')
  })

  it('returns null when none of the candidates can reach the other endpoint at all', () => {
    const nodes = [
      makeNode({ id: 'entryA', objectId: 'room1' }),
      makeNode({ id: 'entryB', objectId: 'room1' }),
      makeNode({ id: 'other' }),
    ]
    // No edges at all - nothing is reachable from "other".
    const graph = buildRouteGraph(nodes, [])

    expect(findBestNodeIdForObject('room1', nodes, graph, 'other', 'origin')).toBeNull()
  })

  it('returns null for an object with no nodes at all', () => {
    expect(findBestNodeIdForObject('room1', [], new Map(), 'other', 'origin')).toBeNull()
  })
})
