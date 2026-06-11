'use client';

import {
  createMapObject,
  updateMapObject,
  createMapNode,
  updateMapNode,
  createPathEdge,
  updatePathEdge,
} from '../actions/floorEditorActions';
import { useEditorStore } from '../store';

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
    objects,
    nodes,
    edges,
    selectedEntity,
    setObjects,
    setNodes,
    setEdges,
    selectEntity,
    markDirty,
    setSaving,
  } = useEditorStore();

  const saveChanges = async () => {
    if (isSaving) return;

    try {
      setSaving(true);

      const localObjects = { ...objects };
      const localNodes = { ...nodes };
      const localEdges = { ...edges };

      const objectIdMap: Record<string, string> = {};
      const nodeIdMap: Record<string, string> = {};
      const edgeIdMap: Record<string, string> = {};

      for (const obj of Object.values(localObjects)) {
        const payloadData = stripLocalFields(obj);

        if (isTempId(obj.id)) {
          const saved = await createMapObject(payloadData);
          objectIdMap[obj.id] = saved.id;
          localObjects[saved.id] = { ...saved, _dirty: false };
          delete localObjects[obj.id];
        } else if (obj._dirty) {
          const saved = await updateMapObject(obj.id, payloadData);
          localObjects[obj.id] = { ...saved, _dirty: false };
        }
      }

      for (const node of Object.values(localNodes)) {
        if (node.objectId && objectIdMap[node.objectId]) {
          node.objectId = objectIdMap[node.objectId];
        }
      }

      for (const node of Object.values(localNodes)) {
        const payloadData = stripLocalFields(node);

        if (isTempId(node.id)) {
          const saved = await createMapNode(payloadData);
          nodeIdMap[node.id] = saved.id;
          localNodes[saved.id] = { ...saved, _dirty: false };
          delete localNodes[node.id];
        } else if (node._dirty) {
          const saved = await updateMapNode(node.id, payloadData);
          localNodes[node.id] = { ...saved, _dirty: false };
        }
      }

      for (const edge of Object.values(localEdges)) {
        if (nodeIdMap[edge.fromNodeId]) {
          edge.fromNodeId = nodeIdMap[edge.fromNodeId];
        }
        if (nodeIdMap[edge.toNodeId]) {
          edge.toNodeId = nodeIdMap[edge.toNodeId];
        }
      }

      for (const edge of Object.values(localEdges)) {
        const payloadData = stripLocalFields(edge);

        if (isTempId(edge.id)) {
          const saved = await createPathEdge(payloadData);
          edgeIdMap[edge.id] = saved.id;
          localEdges[saved.id] = { ...saved, _dirty: false };
          delete localEdges[edge.id];
        } else if (edge._dirty) {
          const saved = await updatePathEdge(edge.id, payloadData);
          localEdges[edge.id] = { ...saved, _dirty: false };
        }
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
