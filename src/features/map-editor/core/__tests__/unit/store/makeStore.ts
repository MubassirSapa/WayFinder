import { create } from 'zustand'
import { createEditorSlice } from '../../../store/createEditorSlice'
import { createEditorViewportSlice } from '../../../store/createEditorViewportSlice'
import { createNodeSlice } from '../../../store/createNodeSlice'
import { createObjectSlice } from '../../../store/createObjectSlice'
import { createEdgeSlice } from '../../../store/createEdgeSlice'
import { createMapViewerViewportSlice } from '@/features/map-viewer/store/createMapViewerViewportSlice'
import type { AppStore } from '@/store/types'

export function makeStore() {
  return create<AppStore>()((...args) => ({
    ...createEditorSlice(...args),
    ...createEditorViewportSlice(...args),
    ...createObjectSlice(...args),
    ...createNodeSlice(...args),
    ...createEdgeSlice(...args),
    ...createMapViewerViewportSlice(...args),
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
    activeFloorId: null,
    isRouteSearchOpen: false,
    setOrigin: () => {},
    setDestination: () => {},
    setAccessibleOnly: () => {},
    setActiveSegmentIndex: () => {},
    setActiveFloorId: () => {},
    setRouteSearchOpen: () => {},
    clearRoute: () => {},
    resetNavigation: () => {},
    // SignupFlowSlice stubs — not under test here
    organization: null,
    setOrganization: () => {},
    resetSignupFlow: () => {},
    // QrViewerViewportSlice stubs — not under test here
    isQrViewerDragging: false,
    qrViewerPan: { x: 0, y: 0 },
    qrViewerZoom: 1,
    setIsQrViewerDragging: () => {},
    setQrViewerPan: () => {},
    setQrViewerView: () => {},
    setQrViewerZoom: () => {},
  }))
}
