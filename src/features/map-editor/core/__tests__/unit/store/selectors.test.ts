import { describe, it, expect } from 'vitest'
import {
  selectObjectsList,
  selectNodesList,
  selectEdgesList,
  selectSelectedObject,
  selectSelectedNode,
  selectSelectedEdge,
  selectEdgesForNode,
} from '../../../store/selectors'
import type { AppStore } from '@/store/types'

// Minimal state stub — only the fields selectors read
function makeState(overrides: Partial<AppStore> = {}): AppStore {
  return {
    objects: {},
    nodes: {},
    edges: {},
    selectedEntity: null,
    ...overrides,
  } as AppStore
}

const OBJ = { id: 'o1', type: 'room' } as AppStore['objects'][string]
const NODE = { id: 'n1', role: 'entrance' } as AppStore['nodes'][string]
const EDGE = { id: 'e1', fromNodeId: 'n1', toNodeId: 'n2', bidirectional: true } as AppStore['edges'][string]

describe('selectObjectsList', () => {
  it('returns empty array when no objects', () => {
    expect(selectObjectsList(makeState())).toEqual([])
  })

  it('returns all objects as array', () => {
    const state = makeState({ objects: { o1: OBJ } })
    expect(selectObjectsList(state)).toEqual([OBJ])
  })
})

describe('selectNodesList', () => {
  it('returns empty array when no nodes', () => {
    expect(selectNodesList(makeState())).toEqual([])
  })

  it('returns all nodes as array', () => {
    const state = makeState({ nodes: { n1: NODE } })
    expect(selectNodesList(state)).toEqual([NODE])
  })
})

describe('selectEdgesList', () => {
  it('returns empty array when no edges', () => {
    expect(selectEdgesList(makeState())).toEqual([])
  })

  it('returns all edges as array', () => {
    const state = makeState({ edges: { e1: EDGE } })
    expect(selectEdgesList(state)).toEqual([EDGE])
  })
})

describe('selectSelectedObject', () => {
  it('returns null when nothing selected', () => {
    expect(selectSelectedObject(makeState())).toBeNull()
  })

  it('returns null when a node is selected (not an object)', () => {
    const state = makeState({ selectedEntity: { kind: 'node', id: 'n1' } })
    expect(selectSelectedObject(state)).toBeNull()
  })

  it('returns the selected object', () => {
    const state = makeState({
      objects: { o1: OBJ },
      selectedEntity: { kind: 'object', id: 'o1' },
    })
    expect(selectSelectedObject(state)).toBe(OBJ)
  })

  it('returns null when selected id does not exist', () => {
    const state = makeState({ selectedEntity: { kind: 'object', id: 'missing' } })
    expect(selectSelectedObject(state)).toBeNull()
  })
})

describe('selectSelectedNode', () => {
  it('returns null when nothing selected', () => {
    expect(selectSelectedNode(makeState())).toBeNull()
  })

  it('returns null when an object is selected', () => {
    const state = makeState({ selectedEntity: { kind: 'object', id: 'o1' } })
    expect(selectSelectedNode(state)).toBeNull()
  })

  it('returns the selected node', () => {
    const state = makeState({
      nodes: { n1: NODE },
      selectedEntity: { kind: 'node', id: 'n1' },
    })
    expect(selectSelectedNode(state)).toBe(NODE)
  })
})

describe('selectSelectedEdge', () => {
  it('returns null when nothing selected', () => {
    expect(selectSelectedEdge(makeState())).toBeNull()
  })

  it('returns the selected edge', () => {
    const state = makeState({
      edges: { e1: EDGE },
      selectedEntity: { kind: 'edge', id: 'e1' },
    })
    expect(selectSelectedEdge(state)).toBe(EDGE)
  })
})

describe('selectEdgesForNode', () => {
  const e2 = { id: 'e2', fromNodeId: 'n2', toNodeId: 'n3', bidirectional: true } as AppStore['edges'][string]

  it('returns empty array when node has no edges', () => {
    const state = makeState({ edges: { e1: EDGE } })
    expect(selectEdgesForNode('n99')(state)).toEqual([])
  })

  it('returns edges where node is the source', () => {
    const state = makeState({ edges: { e1: EDGE, e2 } })
    expect(selectEdgesForNode('n1')(state)).toEqual([EDGE])
  })

  it('returns edges where node is the target', () => {
    const state = makeState({ edges: { e1: EDGE, e2 } })
    expect(selectEdgesForNode('n2')(state)).toEqual([EDGE, e2])
  })
})
