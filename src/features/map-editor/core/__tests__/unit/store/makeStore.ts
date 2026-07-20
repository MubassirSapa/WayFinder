import { create } from 'zustand'
import { createEditorSlice } from '../../../store/createEditorSlice'
import { createNodeSlice } from '../../../store/createNodeSlice'
import { createObjectSlice } from '../../../store/createObjectSlice'
import { createEdgeSlice } from '../../../store/createEdgeSlice'
import type { AppStore } from '@/store/types'

export function makeStore() {
  return create<AppStore>()((...args) => ({
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
    // NavigationSlice stubs — not under test here
    originNodeId: null,
    destinationNodeId: null,
    accessibleOnly: false,
    activeSegmentIndex: 0,
    setOrigin: () => {},
    setDestination: () => {},
    setAccessibleOnly: () => {},
    setActiveSegmentIndex: () => {},
    clearRoute: () => {},
    resetNavigation: () => {},
    // SignupFlowSlice stubs — not under test here
    organization: null,
    setOrganization: () => {},
    resetSignupFlow: () => {},
  }))
}
