import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFloorEditorData } from '@/features/map-editor/core/hooks/useFloorEditorData'
import type { FloorEditorData } from '@/features/map-editor/core/types/editor.types'
import type { EditorFloor, EditorMapObject } from '@/features/map-editor/core/types/map.types'
import { useAppStore } from '@/store'

const FLOOR: EditorFloor = {
  id: 'f1', buildingId: 'b1', name: 'Ground Floor', level: 0, width: 1200, height: 800, status: 'draft',
}

const OBJ: EditorMapObject = {
  id: 'obj_1', floorId: 'f1', buildingId: 'b1', parentObjectId: null,
  type: 'room', name: 'Room A', label: 'A', x: 0, y: 0, width: 100, height: 80,
  rotation: 0, shape: 'rectangle', isSearchable: true, isAccessible: true,
}

function makeData(overrides: Partial<FloorEditorData> = {}): FloorEditorData {
  return { floor: FLOOR, objects: [], nodes: [], edges: [], ...overrides }
}

describe('useFloorEditorData', () => {
  afterEach(() => {
    useAppStore.setState({ areObjectsLocked: false, lockedObjectIds: [] })
  })

  it('locks objects by default when the floor loads with existing objects', async () => {
    // Built once outside the render callback - a stable reference, matching
    // real usage (Next.js page props), and required for the effect's
    // [initialData, ...] deps to settle instead of re-running every render.
    const data = makeData({ objects: [OBJ] })
    await act(async () => {
      renderHook(() => useFloorEditorData(data, null))
    })

    const state = useAppStore.getState()
    expect(state.areObjectsLocked).toBe(true)
    expect(state.lockedObjectIds).toEqual(['obj_1'])
  })

  it('does not lock when the floor loads empty - nothing to protect yet', async () => {
    const data = makeData({ objects: [] })
    await act(async () => {
      renderHook(() => useFloorEditorData(data, null))
    })

    expect(useAppStore.getState().areObjectsLocked).toBe(false)
  })

  it('resets the lock state (and everything else) when the editor unmounts', async () => {
    const data = makeData({ objects: [OBJ] })
    let unmount: () => void = () => {}
    await act(async () => {
      ;({ unmount } = renderHook(() => useFloorEditorData(data, null)))
    })
    expect(useAppStore.getState().areObjectsLocked).toBe(true)

    await act(async () => {
      unmount()
    })

    expect(useAppStore.getState().areObjectsLocked).toBe(false)
    expect(useAppStore.getState().lockedObjectIds).toEqual([])
  })
})
