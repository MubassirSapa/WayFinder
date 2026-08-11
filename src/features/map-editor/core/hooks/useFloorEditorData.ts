import { useEffect } from "react";
import { useAppStore } from "@/store";
import type { FloorEditorData } from "../types/editor.types";

export function useFloorEditorData(
  initialData: FloorEditorData | null,
  initialError: string | null,
) {
  const { setFloor, setObjects, setNodes, setEdges, setAreObjectsLocked, resetStore } =
    useAppStore();

  useEffect(() => {
    if (!initialData) {
      return resetStore;
    }

    setFloor(initialData.floor);
    setObjects(initialData.objects);
    setNodes(initialData.nodes);
    setEdges(initialData.edges);

    // Loading a floor that already has objects on it locks them by default -
    // safer than an editor that opens with everything free to drag, since a
    // stray click on existing work is far more likely than on a still-empty
    // floor with nothing to protect.
    if (initialData.objects.length > 0) {
      setAreObjectsLocked(true);
    }

    return resetStore;
  }, [initialData, setFloor, setObjects, setNodes, setEdges, setAreObjectsLocked, resetStore]);

  return {
    isLoading: false,
    error: initialData ? null : initialError ?? "Failed to load floor data",
  };
}
