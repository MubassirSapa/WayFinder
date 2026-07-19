'use client';

import { useEffect, useState } from "react";

import { listCrossFloorLinks } from "../actions/floorLinkActions";
import type { CrossFloorLink } from "../types/floorLink.types";

export function useCrossFloorLinks(buildingId: string | null) {
  const [links, setLinks] = useState<CrossFloorLink[]>([]);

  useEffect(() => {
    if (!buildingId) {
      return;
    }

    let cancelled = false;
    listCrossFloorLinks(buildingId)
      .then((result) => {
        if (!cancelled) {
          setLinks(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLinks([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [buildingId]);

  const removeLinkLocally = (edgeId: string) => {
    setLinks((current) => current.filter((link) => link.id !== edgeId));
  };

  return { links, removeLinkLocally };
}
