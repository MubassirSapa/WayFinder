import { useEffect, useState } from "react";
import type {
  Floor,
  MapNode as PayloadMapNode,
  MapObject as PayloadMapObject,
  PathEdge as PayloadPathEdge,
} from "@/payload-types";
import { fetchPayloadJson } from "../lib/fetchPayloadJson";
import {
  normalizeFloor,
  normalizeMapNode,
  normalizeMapObject,
  normalizePathEdge,
} from "../lib/normalizeEditorData";
import { useEditorStore } from "../store";

interface PayloadListResponse<T> {
  docs: T[];
}

function buildFloorScopedQuery(floorId: string) {
  const params = new URLSearchParams();
  params.set("depth", "0");
  params.set("limit", "1000");
  params.set("where[floor][equals]", floorId);
  return params.toString();
}

export function useFloorEditorData(floorId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setFloor, setObjects, setNodes, setEdges, resetStore } =
    useEditorStore();

  useEffect(() => {
    const abortController = new AbortController();

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        const query = buildFloorScopedQuery(floorId);
        const [floorDoc, objectsResult, nodesResult, edgesResult] =
          await Promise.all([
            fetchPayloadJson<Floor>(
              `/api/floors/${floorId}?depth=0`,
              abortController.signal,
            ),
            fetchPayloadJson<PayloadListResponse<PayloadMapObject>>(
              `/api/map-objects?${query}`,
              abortController.signal,
            ),
            fetchPayloadJson<PayloadListResponse<PayloadMapNode>>(
              `/api/map-nodes?${query}`,
              abortController.signal,
            ),
            fetchPayloadJson<PayloadListResponse<PayloadPathEdge>>(
              `/api/path-edges?${query}`,
              abortController.signal,
            ),
          ]);

        setFloor(normalizeFloor(floorDoc));
        setObjects(objectsResult.docs.map(normalizeMapObject));
        setNodes(nodesResult.docs.map(normalizeMapNode));
        setEdges(edgesResult.docs.map(normalizePathEdge));
      } catch (err: unknown) {
        if (abortController.signal.aborted) return;
        console.error("Error in useFloorEditorData:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load floor data",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      abortController.abort();
      resetStore();
    };
  }, [floorId, setFloor, setObjects, setNodes, setEdges, resetStore]);

  return { isLoading, error };
}
