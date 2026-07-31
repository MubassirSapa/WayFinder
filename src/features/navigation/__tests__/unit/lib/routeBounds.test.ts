import { describe, it, expect } from 'vitest'
import { getRouteSegmentBounds } from '../../../lib/routeBounds'
import { MAP_VIEWER_FLOOR_CONTENT_PADDING } from '@/features/map-viewer/constants/mapViewer.constants'
import type { ViewerMapNode } from '@/features/map-viewer/types/map-viewer.types'
import type { RouteFloorSegment } from '../../../types/navigation.types'

function makeNode(overrides: Partial<ViewerMapNode> & { id: string; x: number; y: number }): ViewerMapNode {
  return {
    buildingId: 'b1', floorId: 'f1', geometryType: 'icon', isAccessible: true,
    label: '', objectId: null, role: 'hallway_point',
    ...overrides,
  }
}

describe('getRouteSegmentBounds', () => {
  it('returns the padded min/max bounding box for the segment nodes', () => {
    const nodesById = {
      a: makeNode({ id: 'a', x: 10, y: 50 }),
      b: makeNode({ id: 'b', x: 90, y: 20 }),
    }
    const segment: RouteFloorSegment = { edgeIds: [], floorId: 'f1', nodeIds: ['a', 'b'] }

    const bounds = getRouteSegmentBounds(segment, nodesById)

    expect(bounds).toEqual({
      maxX: 90 + MAP_VIEWER_FLOOR_CONTENT_PADDING,
      maxY: 50 + MAP_VIEWER_FLOOR_CONTENT_PADDING,
      minX: 10 + MAP_VIEWER_FLOOR_CONTENT_PADDING,
      minY: 20 + MAP_VIEWER_FLOOR_CONTENT_PADDING,
    })
  })

  it('returns null when no segment nodes resolve', () => {
    const segment: RouteFloorSegment = { edgeIds: [], floorId: 'f1', nodeIds: ['missing'] }
    expect(getRouteSegmentBounds(segment, {})).toBeNull()
  })
})
