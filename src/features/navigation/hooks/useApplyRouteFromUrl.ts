"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";

import type { ViewerMapNode } from "@/features/map-viewer/types/map-viewer.types";
import { useAppStore } from "@/store";

import { NAVIGATION_CLIENT } from "../constants/navigation.constants";
import { findNodeIdForObject } from "../lib/findNodeForObject";

interface UseApplyRouteFromUrlArgs {
  accessibleOnly: boolean;
  destObjectId: string | null;
  initialFloorId: string | null;
  nodes: ViewerMapNode[];
  onOriginObjectResolved?: (objectId: string) => void;
  startObjectId: string | null;
}

// Applies the origin/destination/accessibility state a page load arrived
// with via ?startObject=/&destObject=/&accessible= (a QR scan or a shared
// route link - see docs/technical/ROUTE_URL_STATE.md). These are one-shot
// instructions, not persistent state: once applied, the query string is
// stripped via router.replace so a later manual refresh - or picking a
// different from/to afterward, then refreshing - doesn't keep re-forcing
// the state back to whatever the original link said.
export function useApplyRouteFromUrl({
  accessibleOnly,
  destObjectId,
  initialFloorId,
  nodes,
  onOriginObjectResolved,
  startObjectId,
}: UseApplyRouteFromUrlArgs) {
  const setOrigin = useAppStore((state) => state.setOrigin);
  const setDestination = useAppStore((state) => state.setDestination);
  const setAccessibleOnly = useAppStore((state) => state.setAccessibleOnly);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!startObjectId && !destObjectId) {
      return;
    }

    if (startObjectId) {
      const nodeId = findNodeIdForObject(startObjectId, nodes);
      if (nodeId) {
        setOrigin(nodeId);
        // A start+dest link is already legible via the drawn route line -
        // only a start-only link needs the object visibly "selected" so it
        // reads as "you are here" rather than just silently routable.
        if (!destObjectId) {
          onOriginObjectResolved?.(startObjectId);
        }
      } else {
        toast.error(NAVIGATION_CLIENT.ERROR_START_NOT_ROUTABLE);
      }
    }

    if (destObjectId) {
      const nodeId = findNodeIdForObject(destObjectId, nodes);
      if (nodeId) {
        setDestination(nodeId);
      } else {
        toast.error(NAVIGATION_CLIENT.ERROR_DEST_NOT_ROUTABLE);
      }
    }

    // Only ever turns this on - never forces it back off, so this doesn't
    // fight the reset effect that already runs first on a fresh floor load.
    if (accessibleOnly) {
      setAccessibleOnly(true);
    }

    router.replace(pathname, { scroll: false });
  }, [initialFloorId, startObjectId, destObjectId, accessibleOnly, nodes, setOrigin, setDestination, setAccessibleOnly, onOriginObjectResolved, router, pathname]);
}
