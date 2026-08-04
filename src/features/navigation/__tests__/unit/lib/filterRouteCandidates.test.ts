import { describe, it, expect } from 'vitest'
import { filterRouteCandidates } from '../../../lib/filterRouteCandidates'
import type { ViewerMapNode, ViewerMapObject } from '@/features/map-viewer/types/map-viewer.types'

function makeObject(overrides: Partial<ViewerMapObject> & { id: string }): ViewerMapObject {
  return {
    buildingId: 'b1', floorId: 'f1', height: 80, isAccessible: true, isSearchable: true,
    label: '', name: '', parentObjectId: null, rotation: 0, shape: 'rectangle',
    type: 'room', width: 100, x: 0, y: 0,
    ...overrides,
  }
}

function makeNode(overrides: Partial<ViewerMapNode> & { id: string; objectId: string }): ViewerMapNode {
  return {
    buildingId: 'b1', floorId: 'f1', geometryType: 'icon', isAccessible: true,
    label: '', role: 'hallway_point', x: 0, y: 0,
    ...overrides,
  }
}

describe('filterRouteCandidates', () => {
  const objects = [
    makeObject({ id: 'a', name: 'Room A' }),
    makeObject({ id: 'b', name: 'Room B', label: 'The B Room' }),
    makeObject({ id: 'c', name: 'No Node Room' }),
  ]
  const nodes = [
    makeNode({ id: 'n1', objectId: 'a' }),
    makeNode({ id: 'n2', objectId: 'b' }),
    // "c" deliberately has no routable node.
  ]

  it('returns the first few routable objects when the query is empty', () => {
    const result = filterRouteCandidates(objects, nodes, '')
    expect(result.map((object) => object.id)).toEqual(['a', 'b'])
  })

  it('excludes objects with no routable node even with an empty query', () => {
    const result = filterRouteCandidates(objects, nodes, '')
    expect(result.some((object) => object.id === 'c')).toBe(false)
  })

  it('filters by name or label when a query is given', () => {
    expect(filterRouteCandidates(objects, nodes, 'Room A').map((o) => o.id)).toEqual(['a'])
    expect(filterRouteCandidates(objects, nodes, 'The B').map((o) => o.id)).toEqual(['b'])
  })

  it('is case-insensitive', () => {
    expect(filterRouteCandidates(objects, nodes, 'room a').map((o) => o.id)).toEqual(['a'])
  })

  it('caps results at 5', () => {
    const manyObjects = Array.from({ length: 10 }, (_, index) =>
      makeObject({ id: `o${index}`, name: `Room ${index}` }),
    )
    const manyNodes = manyObjects.map((object, index) =>
      makeNode({ id: `n${index}`, objectId: object.id }),
    )

    expect(filterRouteCandidates(manyObjects, manyNodes, '')).toHaveLength(5)
  })
})
