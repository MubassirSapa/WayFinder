import { useCallback, useEffect, useRef, useState } from "react";

import {
  clampPanToViewport,
  clampZoom,
  getDefaultViewState,
  getFitBoundsView,
  getRawFitZoom,
  resolveFloorViewOnResize,
  type Point,
  type WorldBounds,
} from "../lib/mapViewerViewport";
import { defaultMapViewerViewportBinding, type MapViewerViewportBinding } from "../store/mapViewerViewportBinding";
import type { ViewerFloor } from "../types/map-viewer.types";
import { useMapViewerViewportGestures } from "./useMapViewerViewportGestures";

interface UseMapViewerViewportArgs {
  activeFloor: ViewerFloor | null;
  activeFloorId: string | null;
  floors: ViewerFloor[];
  viewportBinding?: MapViewerViewportBinding;
}

// Pan/zoom themselves live in the app store (see createMapViewerViewportSlice
// and useMapViewerViewportGestures) rather than as useState here, precisely
// so that calling this hook from MapViewerShell doesn't subscribe the whole
// shell to every pan/zoom tick — only components that actually render pan or
// zoom (MapViewerCanvas) read them, via their own store selector. Everything
// in this file only reads/writes the store imperatively via getState/actions,
// never via a reactive selector, to keep that guarantee.
export function useMapViewerViewport({
  activeFloor,
  activeFloorId,
  floors,
  viewportBinding = defaultMapViewerViewportBinding,
}: UseMapViewerViewportArgs) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState<Point>({ x: 0, y: 0 });
  const initializedFloorIdRef = useRef<string | null>(null);
  const pendingFocusRef = useRef(false);

  const {
    consumeSuppressedClick,
    contentRef,
    handleSvgPointerDown,
    handleSvgPointerMove,
    handleSvgPointerUp,
    handleViewportPointerCancel,
    handleViewportPointerLeave,
    handleViewportPointerUp,
  } = useMapViewerViewportGestures({ activeFloor, viewportBinding, viewportRef, viewportSize });

  useEffect(() => {
    const element = viewportRef.current;

    if (!element) {
      return;
    }

    const updateSize = () => {
      const nextViewport = {
        x: element.clientWidth,
        y: element.clientHeight,
      };

      const floor = floors.find((candidate) => candidate.id === activeFloorId);
      if (!floor) {
        initializedFloorIdRef.current = null;
        return;
      }

      const isFirstMeasurementForFloor = initializedFloorIdRef.current !== floor.id;
      const { pan: viewportPan, zoom: viewportZoom } = viewportBinding.getViewportView();

      const nextView = resolveFloorViewOnResize(floor, nextViewport, {
        currentPan: viewportPan,
        currentZoom: viewportZoom,
        hasPendingFocus: pendingFocusRef.current,
        isFirstMeasurementForFloor,
      });

      // A 0-size viewport read (e.g. the very first effect run right after
      // hydration, before layout has settled — much likelier on a hard
      // reload than a client navigation) is ignored entirely: don't touch
      // viewportSize/the store, and don't mark this floor "initialized",
      // since later resizes only re-clamp the existing zoom rather than
      // recomputing it — locking in a bogus zoom forever otherwise.
      if (!nextView) {
        return;
      }

      setViewportSize(nextViewport);
      if (isFirstMeasurementForFloor) {
        initializedFloorIdRef.current = floor.id;
        pendingFocusRef.current = false;
      }
      viewportBinding.setViewportView(nextView);
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [activeFloorId, floors, viewportBinding]);

  // changeZoom/resetView/focusWorldBounds are wrapped in useCallback because
  // they're threaded down to MapViewerToolbar (memoized — see
  // MapViewerToolbar.tsx), which otherwise sees a "changed" prop on every
  // MapViewerShell render (e.g. a selection click) and re-renders for no
  // reason, even though activeFloor/viewportSize didn't actually change.
  const changeZoom = useCallback((direction: "in" | "out") => {
    const { pan: viewportPan, zoom: viewportZoom } = viewportBinding.getViewportView();
    const rawFitZoom = activeFloor ? getRawFitZoom(activeFloor, viewportSize) : undefined;
    const nextZoom = clampZoom(direction === "in" ? viewportZoom * 1.15 : viewportZoom / 1.15, viewportSize.x, rawFitZoom);

    if (!activeFloor) {
      viewportBinding.setViewportView({ pan: viewportPan, zoom: nextZoom });
      return;
    }

    const centerX = viewportSize.x / 2;
    const centerY = viewportSize.y / 2;
    const worldX = (centerX - viewportPan.x) / viewportZoom;
    const worldY = (centerY - viewportPan.y) / viewportZoom;

    viewportBinding.setViewportView({
      pan: clampPanToViewport(
        {
          x: centerX - worldX * nextZoom,
          y: centerY - worldY * nextZoom,
        },
        activeFloor,
        viewportSize,
        nextZoom,
      ),
      zoom: nextZoom,
    });
  }, [activeFloor, viewportBinding, viewportSize]);

  const resetView = useCallback(() => {
    const nextViewport = viewportRef.current
      ? {
          x: viewportRef.current.clientWidth,
          y: viewportRef.current.clientHeight,
        }
      : viewportSize;

    if (!activeFloor || nextViewport.x === 0 || nextViewport.y === 0) {
      return;
    }

    viewportBinding.setViewportView(getDefaultViewState(activeFloor, nextViewport));
  }, [activeFloor, viewportBinding, viewportSize]);

  const focusWorldPoint = (worldPoint: Point) => {
    if (!activeFloor) {
      return;
    }

    const { zoom: viewportZoom } = viewportBinding.getViewportView();
    const nextPan = {
      x: viewportSize.x / 2 - worldPoint.x * viewportZoom,
      y: viewportSize.y / 2 - worldPoint.y * viewportZoom,
    };

    viewportBinding.setViewportView({
      pan: clampPanToViewport(nextPan, activeFloor, viewportSize, viewportZoom),
      zoom: viewportZoom,
    });
  };

  const focusWorldBounds = useCallback((bounds: WorldBounds) => {
    if (viewportSize.x === 0 || viewportSize.y === 0) {
      return;
    }

    pendingFocusRef.current = true;
    viewportBinding.setViewportView(getFitBoundsView(bounds, viewportSize));
  }, [viewportBinding, viewportSize]);

  return {
    changeZoom,
    consumeSuppressedClick,
    contentRef,
    focusWorldBounds,
    focusWorldPoint,
    resetView,
    viewportRef,
    handleSvgPointerDown,
    handleSvgPointerMove,
    handleSvgPointerUp,
    handleViewportPointerCancel,
    handleViewportPointerLeave,
    handleViewportPointerUp,
  };
}
