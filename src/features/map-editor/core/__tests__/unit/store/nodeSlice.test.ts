import { describe, it, expect, beforeEach } from 'vitest'
import { makeStore } from './makeStore'
import type { EditorMapNode, EditorPathEdge } from '../../../types/map.types'

const NODE: EditorMapNode = {
  id: 'temp_node_1', floorId: 'f1', buildingId: 'b1', objectId: 'temp_obj_1',
  role: 'entrance', label: 'Entry', x: 50, y: 80,
  geometryType: 'icon', isAccessible: true,
}

const EDGE: EditorPathEdge = {
  id: 'temp_edge_1', floorId: 'f1', buildingId: 'b1',
  fromNodeId: 'temp_node_1', toNodeId: 'temp_node_2',
  type: 'walkway', distanceMeters: 5, bidirectional: true, isAccessible: true,
}

describe('NodeSlice', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => { store = makeStore() })

  it('addNode stores node by id', () => {
    store.getState().addNode(NODE)
    expect(store.getState().nodes['temp_node_1']).toMatchObject({ id: 'temp_node_1' })
  })

  it('updateNode patches fields', () => {
    store.getState().addNode(NODE)
    store.getState().updateNode('temp_node_1', { label: 'Updated' })
    expect(store.getState().nodes['temp_node_1'].label).toBe('Updated')
    expect(store.getState().nodes['temp_node_1'].x).toBe(50) // untouched
  })

  it('moveNode updates x and y', () => {
    store.getState().addNode(NODE)
    store.getState().moveNode('temp_node_1', 99, 88)
    const node = store.getState().nodes['temp_node_1']
    expect(node.x).toBe(99)
    expect(node.y).toBe(88)
  })

  it('removeNode deletes node', () => {
    store.getState().addNode(NODE)
    store.getState().removeNode('temp_node_1')
    expect(store.getState().nodes['temp_node_1']).toBeUndefined()
  })

  it('removeNode also removes connected edges', () => {
    store.getState().addNode(NODE)
    store.getState().addEdge(EDGE)
    store.getState().removeNode('temp_node_1')
    expect(store.getState().edges['temp_edge_1']).toBeUndefined()
  })

  it('setPendingPathNode sets and clears', () => {
    store.getState().setPendingPathNode('temp_node_1')
    expect(store.getState().pendingPathNodeId).toBe('temp_node_1')
    store.getState().setPendingPathNode(null)
    expect(store.getState().pendingPathNodeId).toBeNull()
  })
})
