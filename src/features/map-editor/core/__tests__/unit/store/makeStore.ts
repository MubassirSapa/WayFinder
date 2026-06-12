import { create } from 'zustand'
import { createEditorSlice } from '../../../store/createEditorSlice'
import { createNodeSlice } from '../../../store/createNodeSlice'
import { createObjectSlice } from '../../../store/createObjectSlice'
import { createEdgeSlice } from '../../../store/createEdgeSlice'
import type { EditorStore } from '@/store/types'

export function makeStore() {
  return create<EditorStore>()((...args) => ({
    ...createEditorSlice(...args),
    ...createObjectSlice(...args),
    ...createNodeSlice(...args),
    ...createEdgeSlice(...args),
    // SmartBuilderSlice stubs — not under test here
    isSmartBuilderEnabled: false,
    autoCreateNodes: false,
    autoConnectNodes: false,
    hallwayDrawingPoints: [],
    setSmartBuilderEnabled: () => {},
    setAutoCreateNodes: () => {},
    setAutoConnectNodes: () => {},
    addHallwayDrawingPoint: () => {},
    clearHallwayDrawingPoints: () => {},
    generateMissingNodes: () => 0,
    autoConnectExistingNodes: () => 0,
    finishHallwayPath: () => ({ nodesAdded: 0, edgesAdded: 0 }),
    applySmartBuilderToObject: () => ({ nodesAdded: 0, edgesAdded: 0 }),
  }))
}
