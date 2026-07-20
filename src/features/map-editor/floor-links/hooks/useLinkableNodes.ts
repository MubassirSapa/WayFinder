'use client';

import { useEffect, useState } from "react";

import { listLinkableNodes } from "../actions/floorLinkActions";
import type { LinkableFloorLinkNode } from "../types/floorLink.types";

export function useLinkableNodes(buildingId: string | null, excludeFloorId: string | null) {
  const [nodes, setNodes] = useState<LinkableFloorLinkNode[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const isActive = Boolean(buildingId && excludeFloorId);
  const key = isActive ? `${buildingId}:${excludeFloorId}` : null;

  useEffect(() => {
    if (!buildingId || !excludeFloorId) {
      return;
    }

    let cancelled = false;
    const requestKey = `${buildingId}:${excludeFloorId}`;

    listLinkableNodes(buildingId, excludeFloorId)
      .then((result) => {
        if (!cancelled) {
          setNodes(result);
          setLoadedKey(requestKey);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNodes([]);
          setLoadedKey(requestKey);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [buildingId, excludeFloorId]);

  return { isLoading: isActive && loadedKey !== key, nodes: isActive ? nodes : [] };
}
