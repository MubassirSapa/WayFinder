import { describe, it, expect } from 'vitest'
import { buildRouteGraph } from '../../../lib/graph'
import { FLOOR_CHANGE_PENALTY_METERS } from '../../../constants/routing.constants'
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

describe('buildRouteGraph', () => {
  it('adds a bidirectional edge in both directions', () => {
    const nodes = [makeNode({ id: 'n1' }), makeNode({ id: 'n2' })]
    const edges = [makeEdge({ id: 'e1', fromNodeId: 'n1', toNodeId: 'n2', bidirectional: true })]
    const graph = buildRouteGraph(nodes, edges)

    expect(graph.get('n1')?.map((entry) => entry.toNodeId)).toEqual(['n2'])
    expect(graph.get('n2')?.map((entry) => entry.toNodeId)).toEqual(['n1'])
  })

  it('adds a one-way edge only in the forward direction', () => {
    const nodes = [makeNode({ id: 'n1' }), makeNode({ id: 'n2' })]
    const edges = [makeEdge({ id: 'e1', fromNodeId: 'n1', toNodeId: 'n2', bidirectional: false })]
    const graph = buildRouteGraph(nodes, edges)

    expect(graph.get('n1')?.map((entry) => entry.toNodeId)).toEqual(['n2'])
    expect(graph.get('n2')).toEqual([])
  })

  it('excludes inaccessible nodes and edges when accessibleOnly is set', () => {
    const nodes = [
      makeNode({ id: 'n1' }),
      makeNode({ id: 'n2', isAccessible: false }),
      makeNode({ id: 'n3' }),
    ]
    const edges = [
      makeEdge({ id: 'e1', fromNodeId: 'n1', toNodeId: 'n2' }),
      makeEdge({ id: 'e2', fromNodeId: 'n1', toNodeId: 'n3', isAccessible: false }),
    ]
    const graph = buildRouteGraph(nodes, edges, { accessibleOnly: true })

    expect(graph.has('n2')).toBe(false)
    expect(graph.get('n1')).toEqual([])
  })

  it('skips edges that reference a missing node', () => {
    const nodes = [makeNode({ id: 'n1' })]
    const edges = [makeEdge({ id: 'e1', fromNodeId: 'n1', toNodeId: 'ghost' })]
    const graph = buildRouteGraph(nodes, edges)

    expect(graph.get('n1')).toEqual([])
  })

  it('adds the floor-change penalty to a cross-floor edge on top of its own distance', () => {
    const nodes = [
      makeNode({ id: 'n1', floorId: 'f1', role: 'stairs_entry' }),
      makeNode({ id: 'n2', floorId: 'f2', role: 'stairs_entry' }),
    ]
    const edges = [
      makeEdge({ id: 'e1', fromNodeId: 'n1', toNodeId: 'n2', type: 'stairs', distanceMeters: 6 }),
    ]
    const graph = buildRouteGraph(nodes, edges)

    expect(graph.get('n1')).toEqual([
      { edgeId: 'e1', floorId: 'f2', toNodeId: 'n2', type: 'stairs', weight: 6 + FLOOR_CHANGE_PENALTY_METERS },
    ])
    expect(graph.get('n2')).toEqual([
      { edgeId: 'e1', floorId: 'f1', toNodeId: 'n1', type: 'stairs', weight: 6 + FLOOR_CHANGE_PENALTY_METERS },
    ])
  })

  it('does not penalize a same-floor edge', () => {
    const nodes = [makeNode({ id: 'n1', floorId: 'f1' }), makeNode({ id: 'n2', floorId: 'f1' })]
    const edges = [makeEdge({ id: 'e1', fromNodeId: 'n1', toNodeId: 'n2', distanceMeters: 6 })]
    const graph = buildRouteGraph(nodes, edges)

    expect(graph.get('n1')?.[0].weight).toBe(6)
  })
})
