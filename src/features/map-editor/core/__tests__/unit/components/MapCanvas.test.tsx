import { render } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { MapCanvas } from '@/features/map-editor/core/components/MapCanvas'
import type { EditorFloor, EditorMapNode, EditorMapObject, EditorPathEdge } from '@/features/map-editor/core/types/map.types'
import { useAppStore } from '@/store'

const FLOOR: EditorFloor = {
  id: 'f1', buildingId: 'b1', name: 'Ground Floor', level: 0, width: 400, height: 300, status: 'draft',
}

const HALLWAY: EditorMapObject = {
  id: 'obj_1', floorId: 'f1', buildingId: 'b1', parentObjectId: null,
  type: 'hallway', name: 'Hallway 1', label: 'Hallway 1', x: 0, y: 0, width: 240, height: 60,
  rotation: 0, shape: 'rectangle', isSearchable: true, isAccessible: true,
}

const NODE_A: EditorMapNode = {
  id: 'node_1', floorId: 'f1', buildingId: 'b1', objectId: null,
  role: 'hallway_point', label: 'A', x: 10, y: 10, geometryType: 'icon', isAccessible: true,
}

const NODE_B: EditorMapNode = {
  id: 'node_2', floorId: 'f1', buildingId: 'b1', objectId: null,
  role: 'hallway_point', label: 'B', x: 200, y: 50, geometryType: 'icon', isAccessible: true,
}

const EDGE: EditorPathEdge = {
  id: 'edge_1', floorId: 'f1', buildingId: 'b1',
  fromNodeId: 'node_1', toNodeId: 'node_2',
  type: 'walkway', distanceMeters: 5, bidirectional: true, isAccessible: true,
}

describe('MapCanvas layer stacking order', () => {
  afterEach(() => {
    useAppStore.setState({ floor: null, objects: {}, nodes: {}, edges: {} })
  })

  it('renders objects below edges, nodes, and object labels - so an object fill never covers them', () => {
    useAppStore.setState({
      floor: FLOOR,
      objects: { [HALLWAY.id]: HALLWAY },
      nodes: { [NODE_A.id]: NODE_A, [NODE_B.id]: NODE_B },
      edges: { [EDGE.id]: EDGE },
    })

    const { container } = render(
      <MapCanvas
        consumeSuppressedClick={() => false}
        isPanning={false}
        onPointerDown={() => {}}
        onPointerMove={() => {}}
        onPointerUp={() => {}}
        pan={{ x: 0, y: 0 }}
        wrapperRef={createRef<HTMLDivElement>()}
        zoom={1}
      />,
    )

    const svg = container.querySelector('svg[data-editor-canvas="true"]')
    expect(svg).not.toBeNull()

    const layerIds = Array.from(svg!.children)
      .map((child) => child.getAttribute('id'))
      .filter((id): id is string => id !== null)

    expect(layerIds).toEqual(['objects-layer', 'edges-layer', 'nodes-layer', 'object-labels-layer'])
  })

  it("renders the object's label text in the labels layer, not inside the shape's own group", () => {
    useAppStore.setState({
      floor: FLOOR,
      objects: { [HALLWAY.id]: HALLWAY },
      nodes: {},
      edges: {},
    })

    const { container } = render(
      <MapCanvas
        consumeSuppressedClick={() => false}
        isPanning={false}
        onPointerDown={() => {}}
        onPointerMove={() => {}}
        onPointerUp={() => {}}
        pan={{ x: 0, y: 0 }}
        wrapperRef={createRef<HTMLDivElement>()}
        zoom={1}
      />,
    )

    const objectsLayer = container.querySelector('#objects-layer')
    const labelsLayer = container.querySelector('#object-labels-layer')

    expect(objectsLayer?.querySelector('text')).toBeNull()
    expect(labelsLayer?.querySelector('text')?.textContent).toBe('Hallway 1')
  })
})
