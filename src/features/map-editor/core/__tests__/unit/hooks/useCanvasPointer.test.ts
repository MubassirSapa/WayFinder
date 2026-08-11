import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useCanvasPointer } from '@/features/map-editor/core/hooks/useCanvasPointer'
import type { EditorFloor } from '@/features/map-editor/core/types/map.types'
import { useAppStore } from '@/store'

const FLOOR: EditorFloor = {
  id: 'f1', buildingId: 'b1', name: 'Ground Floor', level: 0, width: 400, height: 300, status: 'draft',
}

const INITIAL_STATE = {
  floor: FLOOR,
  mode: 'select' as const,
  objects: {},
  nodes: {},
  edges: {},
  pendingPathNodeId: null,
  selectedEntity: null,
}

// jsdom implements neither SVG geometry API - canvasPointFromEvent (used by
// every handler under test) calls both unconditionally before its own
// try/catch, so without these stubs it throws before the click logic runs.
function stubSvgGeometry(svg: SVGSVGElement) {
  svg.createSVGPoint = () => ({
    x: 0,
    y: 0,
    matrixTransform: () => ({ x: 50, y: 40 }),
  }) as unknown as DOMPoint
  svg.getScreenCTM = () => ({ inverse: () => ({}) }) as unknown as DOMMatrix
  svg.getBoundingClientRect = () => ({
    bottom: 300, height: 300, left: 0, right: 400, toJSON: () => ({}), top: 0, width: 400, x: 0, y: 0,
  })
}

function makeClickEvent(svg: SVGSVGElement, target: Element) {
  return {
    clientX: 50,
    clientY: 40,
    currentTarget: svg,
    target,
  } as unknown as React.MouseEvent<SVGSVGElement>
}

describe('useCanvasPointer - clicking over an object', () => {
  let svg: SVGSVGElement
  let objectShape: SVGRectElement

  beforeEach(() => {
    useAppStore.setState(INITIAL_STATE)
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as unknown as SVGSVGElement
    stubSvgGeometry(svg)
    objectShape = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as unknown as SVGRectElement
    svg.appendChild(objectShape)
  })

  afterEach(() => {
    useAppStore.setState(INITIAL_STATE)
  })

  function setup() {
    const canvasRef = { current: svg }
    const { result } = renderHook(() => useCanvasPointer(canvasRef))
    return result
  }

  it('places a node when clicking on top of an object in "node" mode', () => {
    useAppStore.setState({ mode: 'node' })
    const result = setup()

    act(() => {
      result.current.handleCanvasClick(makeClickEvent(svg, objectShape))
    })

    const nodes = Object.values(useAppStore.getState().nodes)
    expect(nodes).toHaveLength(1)
    // (50, 40) snapped to the 20px grid.
    expect(nodes[0]).toMatchObject({ x: 60, y: 40 })
  })

  it('does not clear the selection when a click over an object is reported in "select" mode', () => {
    useAppStore.setState({ mode: 'select', selectedEntity: { kind: 'object', id: 'obj_1' } })
    const result = setup()

    act(() => {
      result.current.handleCanvasClick(makeClickEvent(svg, objectShape))
    })

    // isCanvasTarget still gates select/path mode - only "node" mode treats
    // a click that landed on some other element as a canvas click.
    expect(useAppStore.getState().selectedEntity).toEqual({ kind: 'object', id: 'obj_1' })
  })

  it('still places a node for a plain click on the canvas background itself', () => {
    useAppStore.setState({ mode: 'node' })
    const result = setup()

    act(() => {
      result.current.handleCanvasClick(makeClickEvent(svg, svg))
    })

    expect(Object.values(useAppStore.getState().nodes)).toHaveLength(1)
  })
})
