import { describe, it, expect, beforeEach } from 'vitest'
import { makeStore } from './makeStore'

describe('EditorSlice', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => { store = makeStore() })

  it('starts in select mode', () => {
    expect(store.getState().mode).toBe('select')
  })

  it('setMode updates mode', () => {
    store.getState().setMode('node')
    expect(store.getState().mode).toBe('node')
  })

  it('setMode to non-path clears pendingPathNodeId', () => {
    store.getState().setPendingPathNode('n1')
    store.getState().setMode('select')
    expect(store.getState().pendingPathNodeId).toBeNull()
  })

  it('selectEntity sets selectedEntity', () => {
    store.getState().selectEntity({ kind: 'object', id: 'o1' })
    expect(store.getState().selectedEntity).toEqual({ kind: 'object', id: 'o1' })
  })

  it('clearSelection nulls selectedEntity', () => {
    store.getState().selectEntity({ kind: 'object', id: 'o1' })
    store.getState().clearSelection()
    expect(store.getState().selectedEntity).toBeNull()
  })

  it('markDirty sets isDirty', () => {
    store.getState().markDirty(true)
    expect(store.getState().isDirty).toBe(true)
    store.getState().markDirty(false)
    expect(store.getState().isDirty).toBe(false)
  })

  it('resetStore returns to initial state', () => {
    store.getState().setMode('node')
    store.getState().markDirty(true)
    store.getState().resetStore()
    const s = store.getState()
    expect(s.mode).toBe('select')
    expect(s.isDirty).toBe(false)
    expect(s.objects).toEqual({})
    expect(s.nodes).toEqual({})
    expect(s.edges).toEqual({})
  })
})
