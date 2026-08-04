'use client';

import { createMapObject, updateMapObject } from "../actions/server/object-actions";
import { createMapNode, updateMapNode } from "../actions/server/node-actions";
import { createPathEdge, updatePathEdge } from "../actions/server/edge-actions";
import { updateFloor } from "../actions/server/floor-actions";
import { assertSuccess } from "@/lib/responses";
import { useAppStore } from "@/store";

type LocalEditorEntity = {
  id: string;
  _clientId?: string;
  _dirty?: boolean;
};

function stripLocalFields<T extends LocalEditorEntity>(
  entity: T,
): Omit<T, 'id' | '_clientId' | '_dirty'> {
  const payloadData: Partial<T> = { ...entity };
  delete payloadData.id;
  delete payloadData._clientId;
  delete payloadData._dirty;
  return payloadData as Omit<T, 'id' | '_clientId' | '_dirty'>;
}

function isTempId(id: string): boolean {
  return id.startsWith('temp_');
}

export function useSaveEditorChanges() {
  const {
    isSaving,
    floor,
    objects,
    nodes,
    edges,
    selectedEntity,
    setFloor,
    setObjects,
    setNodes,
    setEdges,
    selectEntity,
    markDirty,
    setSaving,
  } = useAppStore();

  const saveChanges = async () => {
    if (isSaving) return;

    try {
      setSaving(true);

      let localFloor = floor ? { ...floor } : null;
      const localObjects = { ...objects };
      const localNodes = { ...nodes };
      const localEdges = { ...edges };

      const objectIdMap: Record<string, string> = {};
      const nodeIdMap: Record<string, string> = {};
      const edgeIdMap: Record<string, string> = {};

      if (localFloor?._dirty) {
        const savedFloor = assertSuccess(await updateFloor(localFloor.id, localFloor));
        localFloor = { ...savedFloor, _dirty: false };
      }

      // Each phase saves its dirty/new items in parallel (one round trip per
      // item, all in flight at once, instead of one at a time) — but the
      // phases themselves stay sequential: nodes need the real ids objects
      // just received, and edges need the real ids nodes just received.
      await Promise.all(
        Object.values(localObjects).map(async (obj) => {
          const payloadData = stripLocalFields(obj);

          if (isTempId(obj.id)) {
            const saved = assertSuccess(await createMapObject(payloadData));
            objectIdMap[obj.id] = saved.id;
            localObjects[saved.id] = { ...saved, _dirty: false };
            delete localObjects[obj.id];
          } else if (obj._dirty) {
            const saved = assertSuccess(await updateMapObject(obj.id, payloadData));
            localObjects[obj.id] = { ...saved, _dirty: false };
          }
        }),
      );

      for (const node of Object.values(localNodes)) {
        if (node.objectId && objectIdMap[node.objectId]) {
          node.objectId = objectIdMap[node.objectId];
        }
      }

      await Promise.all(
        Object.values(localNodes).map(async (node) => {
          const payloadData = stripLocalFields(node);

          if (isTempId(node.id)) {
            const saved = assertSuccess(await createMapNode(payloadData));
            nodeIdMap[node.id] = saved.id;
            localNodes[saved.id] = { ...saved, _dirty: false };
            delete localNodes[node.id];
          } else if (node._dirty) {
            const saved = assertSuccess(await updateMapNode(node.id, payloadData));
            localNodes[node.id] = { ...saved, _dirty: false };
          }
        }),
      );

      for (const edge of Object.values(localEdges)) {
        if (nodeIdMap[edge.fromNodeId]) {
          edge.fromNodeId = nodeIdMap[edge.fromNodeId];
        }
        if (nodeIdMap[edge.toNodeId]) {
          edge.toNodeId = nodeIdMap[edge.toNodeId];
        }
      }

      await Promise.all(
        Object.values(localEdges).map(async (edge) => {
          const payloadData = stripLocalFields(edge);

          if (isTempId(edge.id)) {
            const saved = assertSuccess(await createPathEdge(payloadData));
            edgeIdMap[edge.id] = saved.id;
            localEdges[saved.id] = { ...saved, _dirty: false };
            delete localEdges[edge.id];
          } else if (edge._dirty) {
            const saved = assertSuccess(await updatePathEdge(edge.id, payloadData));
            localEdges[edge.id] = { ...saved, _dirty: false };
          }
        }),
      );

      if (localFloor) {
        setFloor(localFloor);
      }
      setObjects(Object.values(localObjects));
      setNodes(Object.values(localNodes));
      setEdges(Object.values(localEdges));
      markDirty(false);

      if (selectedEntity?.kind === 'object' && objectIdMap[selectedEntity.id]) {
        selectEntity({ kind: 'object', id: objectIdMap[selectedEntity.id] });
      } else if (selectedEntity?.kind === 'node' && nodeIdMap[selectedEntity.id]) {
        selectEntity({ kind: 'node', id: nodeIdMap[selectedEntity.id] });
      } else if (selectedEntity?.kind === 'edge' && edgeIdMap[selectedEntity.id]) {
        selectEntity({ kind: 'edge', id: edgeIdMap[selectedEntity.id] });
      }
    } catch (err) {
      console.error('Error saving changes:', err);
      alert('Failed to save changes. Please review the server console.');
    } finally {
      setSaving(false);
    }
  };

  return { saveChanges };
}
