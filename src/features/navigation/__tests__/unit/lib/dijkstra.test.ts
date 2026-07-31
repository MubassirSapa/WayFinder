import { describe, it, expect } from 'vitest'
import { findShortestPath } from '../../../lib/dijkstra'
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

describe('findShortestPath', () => {
  it('finds the shortest path in a simple 3-node line', () => {
    const nodes = [makeNode({ id: 'a' }), makeNode({ id: 'b' }), makeNode({ id: 'c' })]
    const edges = [
      makeEdge({ id: 'e1', fromNodeId: 'a', toNodeId: 'b', distanceMeters: 3 }),
      makeEdge({ id: 'e2', fromNodeId: 'b', toNodeId: 'c', distanceMeters: 4 }),
    ]
    const graph = buildRouteGraph(nodes, edges)
    const result = findShortestPath(graph, 'a', 'c')

    expect(result).toEqual({ edgeIds: ['e1', 'e2'], nodeIds: ['a', 'b', 'c'], totalDistanceMeters: 7 })
  })

  it('prefers the lower-total-weight path over fewer hops', () => {
    const nodes = [makeNode({ id: 'a' }), makeNode({ id: 'b' }), makeNode({ id: 'c' })]
    const edges = [
      makeEdge({ id: 'direct', fromNodeId: 'a', toNodeId: 'c', distanceMeters: 20 }),
      makeEdge({ id: 'e1', fromNodeId: 'a', toNodeId: 'b', distanceMeters: 3 }),
      makeEdge({ id: 'e2', fromNodeId: 'b', toNodeId: 'c', distanceMeters: 4 }),
    ]
    const graph = buildRouteGraph(nodes, edges)
    const result = findShortestPath(graph, 'a', 'c')

    expect(result?.nodeIds).toEqual(['a', 'b', 'c'])
    expect(result?.totalDistanceMeters).toBe(7)
  })

  it('returns null when origin and destination are disconnected', () => {
    const nodes = [makeNode({ id: 'a' }), makeNode({ id: 'b' })]
    const graph = buildRouteGraph(nodes, [])
    expect(findShortestPath(graph, 'a', 'b')).toBeNull()
  })

  it('returns null when destination id is not in the graph', () => {
    const nodes = [makeNode({ id: 'a' })]
    const graph = buildRouteGraph(nodes, [])
    expect(findShortestPath(graph, 'a', 'ghost')).toBeNull()
  })

  it('returns a zero-distance single-node result when origin equals destination', () => {
    const nodes = [makeNode({ id: 'a' })]
    const graph = buildRouteGraph(nodes, [])
    expect(findShortestPath(graph, 'a', 'a')).toEqual({
      edgeIds: [], nodeIds: ['a'], totalDistanceMeters: 0,
    })
  })

  it('respects one-way edges', () => {
    const nodes = [makeNode({ id: 'a' }), makeNode({ id: 'b' })]
    const edges = [makeEdge({ id: 'e1', fromNodeId: 'a', toNodeId: 'b', bidirectional: false })]
    const graph = buildRouteGraph(nodes, edges)

    expect(findShortestPath(graph, 'a', 'b')?.nodeIds).toEqual(['a', 'b'])
    expect(findShortestPath(graph, 'b', 'a')).toBeNull()
  })

  it('accessibleOnly forces a longer accessible route over a shorter inaccessible one', () => {
    const nodes = [
      makeNode({ id: 'a' }), makeNode({ id: 'b', isAccessible: false }),
      makeNode({ id: 'c' }), makeNode({ id: 'd' }),
    ]
    const edges = [
      makeEdge({ id: 'short', fromNodeId: 'a', toNodeId: 'b', distanceMeters: 2 }),
      makeEdge({ id: 'short2', fromNodeId: 'b', toNodeId: 'd', distanceMeters: 2 }),
      makeEdge({ id: 'long1', fromNodeId: 'a', toNodeId: 'c', distanceMeters: 5 }),
      makeEdge({ id: 'long2', fromNodeId: 'c', toNodeId: 'd', distanceMeters: 5 }),
    ]

    const fullGraph = buildRouteGraph(nodes, edges)
    expect(findShortestPath(fullGraph, 'a', 'd')?.totalDistanceMeters).toBe(4)

    const accessibleGraph = buildRouteGraph(nodes, edges, { accessibleOnly: true })
    expect(findShortestPath(accessibleGraph, 'a', 'd')?.totalDistanceMeters).toBe(10)
  })

  it('finds a multi-floor route via stairs/elevator edges (total includes the floor-change penalty)', () => {
    const nodes = [
      makeNode({ id: 'a', floorId: 'f1' }),
      makeNode({ id: 'stairs1', floorId: 'f1', role: 'stairs_entry' }),
      makeNode({ id: 'stairs2', floorId: 'f2', role: 'stairs_entry' }),
      makeNode({ id: 'elevator1', floorId: 'f2', role: 'elevator_entry' }),
      makeNode({ id: 'elevator2', floorId: 'f3', role: 'elevator_entry' }),
      makeNode({ id: 'z', floorId: 'f3' }),
    ]
    const edges = [
      makeEdge({ id: 'e1', fromNodeId: 'a', toNodeId: 'stairs1', distanceMeters: 2 }),
      makeEdge({ id: 'cross1', fromNodeId: 'stairs1', toNodeId: 'stairs2', distanceMeters: 6, type: 'stairs' }),
      makeEdge({ id: 'e2', fromNodeId: 'stairs2', toNodeId: 'elevator1', distanceMeters: 2 }),
      makeEdge({ id: 'cross2', fromNodeId: 'elevator1', toNodeId: 'elevator2', distanceMeters: 3, type: 'elevator' }),
      makeEdge({ id: 'e3', fromNodeId: 'elevator2', toNodeId: 'z', distanceMeters: 2 }),
    ]
    const graph = buildRouteGraph(nodes, edges)
    const result = findShortestPath(graph, 'a', 'z')

    expect(result?.nodeIds).toEqual(['a', 'stairs1', 'stairs2', 'elevator1', 'elevator2', 'z'])
    // Own leg distances sum to 15m, plus a 12m penalty for each of the 2 floor crossings.
    expect(result?.totalDistanceMeters).toBe(15 + 2 * FLOOR_CHANGE_PENALTY_METERS)
  })

  it('prefers a same-floor walk over a shortcut that bounces through another floor and back', () => {
    // a --(20m walkway)-- b, both on f1 — a plausible long same-floor walk.
    // A "shortcut" also exists: a -> stairsA (f1) -> stairsA' (f2) -> stairsB' (f2)
    // -> stairsB (f1) -> b, whose own leg distances sum to only 18m. Without a
    // floor-change penalty this shortcut used to win, producing a route that
    // visits f1, then f2, then f1 again (the "repeated floors" bug).
    const nodes = [
      makeNode({ id: 'a', floorId: 'f1' }),
      makeNode({ id: 'b', floorId: 'f1' }),
      makeNode({ id: 'stairsA', floorId: 'f1', role: 'stairs_entry' }),
      makeNode({ id: 'stairsAX', floorId: 'f2', role: 'stairs_entry' }),
      makeNode({ id: 'stairsBX', floorId: 'f2', role: 'stairs_entry' }),
      makeNode({ id: 'stairsB', floorId: 'f1', role: 'stairs_entry' }),
    ]
    const edges = [
      makeEdge({ id: 'direct', fromNodeId: 'a', toNodeId: 'b', distanceMeters: 20 }),
      makeEdge({ id: 'toStairsA', fromNodeId: 'a', toNodeId: 'stairsA', distanceMeters: 2 }),
      makeEdge({ id: 'crossA', fromNodeId: 'stairsA', toNodeId: 'stairsAX', type: 'stairs', distanceMeters: 6 }),
      makeEdge({ id: 'acrossF2', fromNodeId: 'stairsAX', toNodeId: 'stairsBX', distanceMeters: 2 }),
      makeEdge({ id: 'crossB', fromNodeId: 'stairsBX', toNodeId: 'stairsB', type: 'stairs', distanceMeters: 6 }),
      makeEdge({ id: 'fromStairsB', fromNodeId: 'stairsB', toNodeId: 'b', distanceMeters: 2 }),
    ]

    const graph = buildRouteGraph(nodes, edges)
    const result = findShortestPath(graph, 'a', 'b')

    expect(result?.nodeIds).toEqual(['a', 'b'])
    expect(result?.nodeIds.map((id) => nodes.find((n) => n.id === id)?.floorId)).toEqual(['f1', 'f1'])
  })
})
