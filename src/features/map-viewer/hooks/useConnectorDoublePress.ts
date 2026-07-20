import { useRef, useState } from "react";

import type { ConnectorTargetInfo, ViewerMapNode } from "../types/map-viewer.types";

// A second press on the same connector node within this window counts as a
// "double-press"; otherwise it's treated as a fresh first press.
const CONNECTOR_DOUBLE_PRESS_WINDOW_MS = 400;
// How long the "double-tap to jump" hint stays up after a first press before
// it's treated as abandoned, so it doesn't linger on screen forever.
const CONNECTOR_HINT_TIMEOUT_MS = 1800;

export function useConnectorDoublePress(onActivate: (target: ConnectorTargetInfo) => void) {
  const [pendingNodeId, setPendingNodeId] = useState<string | null>(null);
  const lastPressRef = useRef<{ nodeId: string; time: number } | null>(null);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingHint = () => {
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
    lastPressRef.current = null;
    setPendingNodeId(null);
  };

  const handlePress = (node: ViewerMapNode, target: ConnectorTargetInfo) => {
    const now = Date.now();
    const last = lastPressRef.current;
    const isDoublePress = last?.nodeId === node.id
      && now - last.time < CONNECTOR_DOUBLE_PRESS_WINDOW_MS;

    if (isDoublePress) {
      clearPendingHint();
      onActivate(target);
      return;
    }

    lastPressRef.current = { nodeId: node.id, time: now };
    setPendingNodeId(node.id);
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }
    hintTimeoutRef.current = setTimeout(clearPendingHint, CONNECTOR_HINT_TIMEOUT_MS);
  };

  return { handlePress, pendingNodeId };
}
