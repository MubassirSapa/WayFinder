import { describe, it, expect } from 'vitest'
import { splitRouteByFloor } from '../../../lib/routeSegments'
import type { ViewerMapNode, ViewerPathEdge } from '@/features/map-viewer/types/map-viewer.types'
import type { ShortestPathResult } from '../../../types/navigation.types'

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

describe('splitRouteByFloor', () => {
  it('returns exactly one segment for a single-floor route', () => {
    const nodesById = {
      a: makeNode({ id: 'a', floorId: 'f1' }),
      b: makeNode({ id: 'b', floorId: 'f1' }),
    }
    const edgesById = {
      e1: makeEdge({ id: 'e1', fromNodeId: 'a', toNodeId: 'b' }),
    }
    const path: ShortestPathResult = { edgeIds: ['e1'], nodeIds: ['a', 'b'], totalDistanceMeters: 1 }

    const segments = splitRouteByFloor(path, nodesById, edgesById)

    expect(segments).toHaveLength(1)
    expect(segments[0]).toMatchObject({ floorId: 'f1', nodeIds: ['a', 'b'] })
  })

  it('splits a two-floor route into two segments tagged with the connecting edge type', () => {
    const nodesById = {
      a: makeNode({ id: 'a', floorId: 'f1' }),
      stairs1: makeNode({ id: 'stairs1', floorId: 'f1', role: 'stairs_entry' }),
      stairs2: makeNode({ id: 'stairs2', floorId: 'f2', role: 'stairs_entry' }),
      z: makeNode({ id: 'z', floorId: 'f2' }),
    }
    const edgesById = {
      e1: makeEdge({ id: 'e1', fromNodeId: 'a', toNodeId: 'stairs1' }),
      cross: makeEdge({ id: 'cross', fromNodeId: 'stairs1', toNodeId: 'stairs2', type: 'stairs' }),
      e2: makeEdge({ id: 'e2', fromNodeId: 'stairs2', toNodeId: 'z' }),
    }
    const path: ShortestPathResult = {
      edgeIds: ['e1', 'cross', 'e2'],
      nodeIds: ['a', 'stairs1', 'stairs2', 'z'],
      totalDistanceMeters: 3,
    }

    const segments = splitRouteByFloor(path, nodesById, edgesById)

    expect(segments).toHaveLength(2)
    expect(segments[0]).toMatchObject({ floorId: 'f1', nodeIds: ['a', 'stairs1'] })
    expect(segments[1]).toMatchObject({ floorId: 'f2', nodeIds: ['stairs2', 'z'], enterViaEdgeType: 'stairs' })
  })

  it('splits a three-floor route into three ordered segments', () => {
    const nodesById = {
      a: makeNode({ id: 'a', floorId: 'f1' }),
      s1: makeNode({ id: 's1', floorId: 'f1' }),
      s2: makeNode({ id: 's2', floorId: 'f2' }),
      e1n: makeNode({ id: 'e1n', floorId: 'f2' }),
      e2n: makeNode({ id: 'e2n', floorId: 'f3' }),
      z: makeNode({ id: 'z', floorId: 'f3' }),
    }
    const edgesById = {
      a1: makeEdge({ id: 'a1', fromNodeId: 'a', toNodeId: 's1' }),
      cross1: makeEdge({ id: 'cross1', fromNodeId: 's1', toNodeId: 's2', type: 'stairs' }),
      a2: makeEdge({ id: 'a2', fromNodeId: 's2', toNodeId: 'e1n' }),
      cross2: makeEdge({ id: 'cross2', fromNodeId: 'e1n', toNodeId: 'e2n', type: 'elevator' }),
      a3: makeEdge({ id: 'a3', fromNodeId: 'e2n', toNodeId: 'z' }),
    }
    const path: ShortestPathResult = {
      edgeIds: ['a1', 'cross1', 'a2', 'cross2', 'a3'],
      nodeIds: ['a', 's1', 's2', 'e1n', 'e2n', 'z'],
      totalDistanceMeters: 5,
    }

    const segments = splitRouteByFloor(path, nodesById, edgesById)

    expect(segments.map((segment) => segment.floorId)).toEqual(['f1', 'f2', 'f3'])
    expect(segments[1].enterViaEdgeType).toBe('stairs')
    expect(segments[2].enterViaEdgeType).toBe('elevator')
  })
})
