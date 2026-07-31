import { describe, it, expect, beforeEach } from 'vitest'
import { makeStore } from './makeStore'
import type { EditorPathEdge } from '../../../types/map.types'

const EDGE: EditorPathEdge = {
  id: 'temp_edge_1', floorId: 'f1', buildingId: 'b1',
  fromNodeId: 'temp_node_1', toNodeId: 'temp_node_2',
  type: 'walkway', distanceMeters: 5, bidirectional: true, isAccessible: true,
}

describe('EdgeSlice', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => { store = makeStore() })

  it('starts with no edges', () => {
    expect(store.getState().edges).toEqual({})
  })

  it('addEdge stores edge by id', () => {
    store.getState().addEdge(EDGE)
    expect(store.getState().edges['temp_edge_1']).toMatchObject({ id: 'temp_edge_1' })
  })

  it('updateEdge patches fields', () => {
    store.getState().addEdge(EDGE)
    store.getState().updateEdge('temp_edge_1', { distanceMeters: 99 })
    expect(store.getState().edges['temp_edge_1'].distanceMeters).toBe(99)
    expect(store.getState().edges['temp_edge_1'].type).toBe('walkway') // untouched
  })

  it('removeEdge deletes edge', () => {
    store.getState().addEdge(EDGE)
    store.getState().removeEdge('temp_edge_1')
    expect(store.getState().edges['temp_edge_1']).toBeUndefined()
  })

  it('setEdges replaces the entire record', () => {
    store.getState().addEdge(EDGE)
    const edge2 = { ...EDGE, id: 'temp_edge_2' }
    store.getState().setEdges([edge2])
    expect(store.getState().edges).not.toHaveProperty('temp_edge_1')
    expect(store.getState().edges).toHaveProperty('temp_edge_2')
  })
})
