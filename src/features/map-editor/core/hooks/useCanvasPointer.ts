import { RefObject } from 'react';
import { useAppStore } from "@/store";
import { snapToGrid, canvasPointFromEvent } from '../lib/canvas';
import { getDefaultDimensions, getDefaultObjectName } from '../lib/objectDefaults';
import { pixelDistance, pixelsToMeters } from '../lib/distance';
import { EditorMapObject, EditorMapNode, EditorPathEdge } from '../types/map.types';

export function useCanvasPointer(canvasRef: RefObject<SVGSVGElement | null>) {
  const {
    mode,
    floor,
    selectedToolboxType,
    pendingPathNodeId,
    objects,
    nodes,
    edges,
    addObject,
    addNode,
    addEdge,
    setPendingPathNode,
    selectEntity,
    clearSelection,
  } = useAppStore();

  const isCanvasTarget = (e: React.MouseEvent<SVGSVGElement>) => {
    // The visible grid is rendered as a background rect inside the SVG, so treat
    // clicks on that rect as canvas clicks while ignoring interactive children.
    const clickedElement = e.target as EventTarget | null;
    const clickedCanvasBackground =
      clickedElement instanceof Element &&
      clickedElement.closest('[data-canvas-bg="true"]') !== null;

    return e.target === e.currentTarget || clickedCanvasBackground;
  };

  const addSelectedObjectAtEvent = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!floor) return;

    const point = canvasPointFromEvent(e, canvasRef);
    if (!point) return;

    const snapX = snapToGrid(point.x);
    const snapY = snapToGrid(point.y);
    const tempId = `temp_obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const { width, height } = getDefaultDimensions(selectedToolboxType);

    const newObject: EditorMapObject = {
      id: tempId,
      floorId: floor.id,
      buildingId: floor.buildingId,
      parentObjectId: null,
      type: selectedToolboxType,
      name: getDefaultObjectName(selectedToolboxType, Object.values(objects)),
      label: '',
      x: snapX,
      y: snapY,
      width,
      height,
      rotation: 0,
      isSearchable: true,
      isAccessible: true,
      _clientId: tempId,
      _dirty: true,
    };

    addObject(newObject);
    selectEntity({ kind: 'object', id: tempId });
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isCanvasTarget(e)) return;

    if (!floor) return;

    const point = canvasPointFromEvent(e, canvasRef);
    if (!point) return;

    const snapX = snapToGrid(point.x);
    const snapY = snapToGrid(point.y);

    if (mode === 'select') {
      clearSelection();
    } else if (mode === 'node') {
      const tempId = `temp_node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const hallwayPointCount = Object.values(nodes).filter((n) => n.role === 'hallway_point').length;

      const newNode: EditorMapNode = {
        id: tempId,
        floorId: floor.id,
        buildingId: floor.buildingId,
        objectId: null,
        role: 'hallway_point',
        label: `Hallway Point ${hallwayPointCount + 1}`,
        x: snapX,
        y: snapY,
        geometryType: 'icon',
        isAccessible: true,
        _clientId: tempId,
        _dirty: true,
      };

      addNode(newNode);
      selectEntity({ kind: 'node', id: tempId });
    } else if (mode === 'path') {
      // Clicked on empty canvas, clear path drawing source
      setPendingPathNode(null);
      clearSelection();
    }
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isCanvasTarget(e)) return;
    if (mode !== 'select') return;

    e.preventDefault();
    addSelectedObjectAtEvent(e);
  };

  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!floor) return;

    if (mode === 'select' || mode === 'node') {
      selectEntity({ kind: 'node', id: nodeId });
    } else if (mode === 'path') {
      if (pendingPathNodeId === null) {
        // Start connection
        setPendingPathNode(nodeId);
        selectEntity({ kind: 'node', id: nodeId });
      } else if (pendingPathNodeId === nodeId) {
        // Clicked the same node, cancel
        setPendingPathNode(null);
      } else {
        // Complete connection: check if edge already exists
        const fromNode = nodes[pendingPathNodeId];
        const toNode = nodes[nodeId];

        if (!fromNode || !toNode) {
          setPendingPathNode(null);
          return;
        }

        const edgeExists = Object.values(edges).some(
          (edge) =>
            (edge.fromNodeId === pendingPathNodeId && edge.toNodeId === nodeId) ||
            (edge.bidirectional && edge.fromNodeId === nodeId && edge.toNodeId === pendingPathNodeId)
        );

        if (!edgeExists) {
          const tempId = `temp_edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const distPx = pixelDistance(fromNode, toNode);
          const distMeters = pixelsToMeters(distPx);

          const newEdge: EditorPathEdge = {
            id: tempId,
            floorId: floor.id,
            buildingId: floor.buildingId,
            fromNodeId: pendingPathNodeId,
            toNodeId: nodeId,
            type: 'walkway',
            distanceMeters: distMeters,
            bidirectional: true,
            isAccessible: true,
            _clientId: tempId,
            _dirty: true,
          };

          addEdge(newEdge);
          selectEntity({ kind: 'edge', id: tempId });
        }

        // Chaining UX: make the clicked node the new source
        setPendingPathNode(nodeId);
      }
    }
  };

  return {
    handleCanvasClick,
    handleCanvasDoubleClick,
    handleNodeClick,
  };
}
