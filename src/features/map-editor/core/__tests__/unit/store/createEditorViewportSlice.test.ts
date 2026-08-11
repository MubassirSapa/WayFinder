import { beforeEach, describe, expect, it } from 'vitest'

import { makeStore } from './makeStore'

describe('EditorViewportSlice', () => {
  let store: ReturnType<typeof makeStore>
  beforeEach(() => {
    store = makeStore()
  })

  it('starts centered at zoom 1', () => {
    const state = store.getState()
    expect(state.editorViewportPan).toEqual({ x: 0, y: 0 })
    expect(state.editorViewportZoom).toBe(1)
  })

  it('setEditorViewportPan updates only the pan', () => {
    store.getState().setEditorViewportPan({ x: 12, y: -8 })
    const state = store.getState()
    expect(state.editorViewportPan).toEqual({ x: 12, y: -8 })
    expect(state.editorViewportZoom).toBe(1)
  })

  it('setEditorViewportZoom updates only the zoom', () => {
    store.getState().setEditorViewportZoom(1.5)
    const state = store.getState()
    expect(state.editorViewportZoom).toBe(1.5)
    expect(state.editorViewportPan).toEqual({ x: 0, y: 0 })
  })

  it('setEditorViewportView commits pan and zoom together', () => {
    store.getState().setEditorViewportView({ pan: { x: 40, y: 20 }, zoom: 2 })
    const state = store.getState()
    expect(state.editorViewportPan).toEqual({ x: 40, y: 20 })
    expect(state.editorViewportZoom).toBe(2)
  })

  it("resetStore returns the viewport to its default", () => {
    store.getState().setEditorViewportView({ pan: { x: 40, y: 20 }, zoom: 2 })
    store.getState().setIsResizingFloor(true)
    store.getState().resetStore()
    const state = store.getState()
    expect(state.editorViewportPan).toEqual({ x: 0, y: 0 })
    expect(state.editorViewportZoom).toBe(1)
    expect(state.isResizingFloor).toBe(false)
  })

  it('setIsResizingFloor toggles independently of pan/zoom', () => {
    store.getState().setEditorViewportView({ pan: { x: 5, y: 5 }, zoom: 1.2 })
    store.getState().setIsResizingFloor(true)
    expect(store.getState().isResizingFloor).toBe(true)
    expect(store.getState().editorViewportPan).toEqual({ x: 5, y: 5 })

    store.getState().setIsResizingFloor(false)
    expect(store.getState().isResizingFloor).toBe(false)
  })
})
