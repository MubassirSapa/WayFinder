import { render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { PathEdgeLayer } from '@/features/map-editor/core/components/PathEdgeLayer'
import type { EditorMapNode, EditorPathEdge } from '@/features/map-editor/core/types/map.types'
import { useAppStore } from '@/store'

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

function renderInSvg() {
  return render(
    <svg>
      <PathEdgeLayer />
    </svg>,
  )
}

describe('PathEdgeLayer', () => {
  afterEach(() => {
    useAppStore.setState({ nodes: {}, edges: {}, selectedEntity: null })
  })

  it('draws a background-colored casing line behind the visual line, wider than it, so the edge stays legible over any object underneath', () => {
    useAppStore.setState({
      nodes: { [NODE_A.id]: NODE_A, [NODE_B.id]: NODE_B },
      edges: { [EDGE.id]: EDGE },
    })

    const { container } = renderInSvg()
    const lines = container.querySelectorAll('#edges-layer line')

    // Interaction line (transparent, click hit target), casing, visual line.
    expect(lines).toHaveLength(3)

    const [, casing, visual] = Array.from(lines)
    expect(casing.getAttribute('stroke')).toBe('var(--editor-background)')
    expect(Number(casing.getAttribute('stroke-width'))).toBeGreaterThan(Number(visual.getAttribute('stroke-width')))
  })

  it('renders nothing for an edge whose endpoints are missing', () => {
    useAppStore.setState({
      nodes: { [NODE_A.id]: NODE_A },
      edges: { [EDGE.id]: EDGE },
    })

    const { container } = renderInSvg()
    expect(container.querySelectorAll('#edges-layer line')).toHaveLength(0)
  })
})
