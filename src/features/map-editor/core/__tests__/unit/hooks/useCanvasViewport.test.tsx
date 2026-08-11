import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { useCanvasViewport } from '@/features/map-editor/core/hooks/useCanvasViewport'
import { useAppStore } from '@/store'

// Floor is deliberately much bigger than the viewport so every pan/zoom this
// suite exercises lands well inside clampEditorPan's overscroll margin -
// isolates the wheel-routing behavior under test from clamping, which
// canvasViewport.test.ts already covers on its own.
const FLOOR_WIDTH = 2000
const FLOOR_HEIGHT = 1600
const VIEWPORT = { height: 800, width: 1000 }

const INITIAL_VIEWPORT_STATE = {
  editorViewportPan: { x: 0, y: 0 },
  editorViewportZoom: 1,
  isResizingFloor: false,
}

// useCanvasViewport owns its wrapper ref internally (unlike the map viewer's
// gesture hook, which takes one as a prop) - a real mounted div is the only
// way for its wheel-listener effect to see a non-null element, so this stubs
// the node's layout getters on the ref callback itself, before React commits
// the ref into the hook and its effects run.
function TestHarness() {
  const { wrapperRef } = useCanvasViewport({ floorHeight: FLOOR_HEIGHT, floorId: 'floor-1', floorWidth: FLOOR_WIDTH })

  return (
    <div
      ref={(node) => {
        if (node) {
          Object.defineProperty(node, 'clientWidth', { configurable: true, value: VIEWPORT.width })
          Object.defineProperty(node, 'clientHeight', { configurable: true, value: VIEWPORT.height })
          node.getBoundingClientRect = () => ({
            bottom: VIEWPORT.height,
            height: VIEWPORT.height,
            left: 0,
            right: VIEWPORT.width,
            toJSON: () => ({}),
            top: 0,
            width: VIEWPORT.width,
            x: 0,
            y: 0,
          })
        }
        wrapperRef.current = node
      }}
      data-testid="canvas-wrapper"
    />
  )
}

describe('useCanvasViewport wheel handling', () => {
  // jsdom doesn't implement ResizeObserver - the auto-fit effect only needs
  // it to react to later resizes, not for its initial synchronous call.
  beforeAll(() => {
    (globalThis as typeof globalThis & { ResizeObserver?: unknown }).ResizeObserver ??= class {
      disconnect() {}
      observe() {}
      unobserve() {}
    }
  })

  beforeEach(() => {
    useAppStore.setState(INITIAL_VIEWPORT_STATE)
  })

  afterEach(() => {
    cleanup()
    useAppStore.setState(INITIAL_VIEWPORT_STATE)
  })

  function setup() {
    const { getByTestId } = render(<TestHarness />)
    const wrapperEl = getByTestId('canvas-wrapper')

    // The mount-time auto-fit effect (re-fits pan/zoom to the floor's
    // dimensions) already has its own coverage - reset to a known baseline
    // here so this suite only asserts on the wheel handler's own behavior.
    act(() => {
      useAppStore.setState(INITIAL_VIEWPORT_STATE)
    })

    return wrapperEl
  }

  it('pans instead of zooming on a plain two-finger scroll (no ctrlKey)', () => {
    const wrapperEl = setup()

    act(() => {
      wrapperEl.dispatchEvent(new WheelEvent('wheel', { cancelable: true, deltaX: 20, deltaY: 15 }))
    })

    const state = useAppStore.getState()
    expect(state.editorViewportPan).toEqual({ x: -20, y: -15 })
    expect(state.editorViewportZoom).toBe(1)
  })

  it('zooms around the cursor when ctrlKey is set (pinch-to-zoom)', () => {
    const wrapperEl = setup()

    act(() => {
      wrapperEl.dispatchEvent(
        new WheelEvent('wheel', { cancelable: true, clientX: 500, clientY: 400, ctrlKey: true, deltaY: -100 }),
      )
    })

    const state = useAppStore.getState()
    expect(state.editorViewportZoom).toBeCloseTo(1.08)
    expect(state.editorViewportPan.x).toBeCloseTo(-40)
    expect(state.editorViewportPan.y).toBeCloseTo(-32)
  })

  it('a two-finger scroll pans the same way regardless of horizontal delta direction', () => {
    const wrapperEl = setup()

    act(() => {
      wrapperEl.dispatchEvent(new WheelEvent('wheel', { cancelable: true, deltaX: -30, deltaY: 0 }))
    })

    const state = useAppStore.getState()
    expect(state.editorViewportPan).toEqual({ x: 30, y: 0 })
    expect(state.editorViewportZoom).toBe(1)
  })
})
