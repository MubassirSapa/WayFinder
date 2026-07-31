import { describe, it, expect } from 'vitest'
import { findDefaultOriginNode } from '../../../lib/defaultOrigin'
import type { ViewerFloor, ViewerMapNode } from '@/features/map-viewer/types/map-viewer.types'

function makeFloor(overrides: Partial<ViewerFloor> & { id: string; level: number }): ViewerFloor {
  return {
    buildingId: 'b1', height: 800, name: `Floor ${overrides.level}`,
    organizationName: null, status: 'published', width: 1200,
    ...overrides,
  }
}

function makeNode(overrides: Partial<ViewerMapNode> & { id: string; floorId: string }): ViewerMapNode {
  return {
    buildingId: 'b1', geometryType: 'icon', isAccessible: true,
    label: '', objectId: null, role: 'hallway_point', x: 0, y: 0,
    ...overrides,
  }
}

describe('findDefaultOriginNode', () => {
  it('returns the entrance node on the lowest-level floor', () => {
    const floors = [makeFloor({ id: 'f1', level: 0 }), makeFloor({ id: 'f2', level: 1 })]
    const nodesByFloorId = {
      f1: [makeNode({ id: 'n1', floorId: 'f1', role: 'entrance' })],
      f2: [makeNode({ id: 'n2', floorId: 'f2', role: 'entrance' })],
    }

    expect(findDefaultOriginNode(floors, nodesByFloorId)?.id).toBe('n1')
  })

  it('handles a negative-level basement as the lowest floor', () => {
    const floors = [makeFloor({ id: 'basement', level: -1 }), makeFloor({ id: 'ground', level: 0 })]
    const nodesByFloorId = {
      basement: [makeNode({ id: 'nb', floorId: 'basement', role: 'entrance' })],
      ground: [makeNode({ id: 'ng', floorId: 'ground', role: 'entrance' })],
    }

    expect(findDefaultOriginNode(floors, nodesByFloorId)?.id).toBe('nb')
  })

  it('falls back to an exit node when no entrance exists', () => {
    const floors = [makeFloor({ id: 'f1', level: 0 })]
    const nodesByFloorId = {
      f1: [makeNode({ id: 'n1', floorId: 'f1', role: 'exit' })],
    }

    expect(findDefaultOriginNode(floors, nodesByFloorId)?.id).toBe('n1')
  })

  it('returns null when neither an entrance nor an exit exists', () => {
    const floors = [makeFloor({ id: 'f1', level: 0 })]
    const nodesByFloorId = {
      f1: [makeNode({ id: 'n1', floorId: 'f1', role: 'hallway_point' })],
    }

    expect(findDefaultOriginNode(floors, nodesByFloorId)).toBeNull()
  })

  it('returns null when there are no floors', () => {
    expect(findDefaultOriginNode([], {})).toBeNull()
  })
})
