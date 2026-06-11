import { useEffect } from "react";
import { useEditorStore } from "@/store";
import type { FloorEditorData } from "../actions/floorEditorActions";

export function useFloorEditorData(
  initialData: FloorEditorData | null,
  initialError: string | null,
) {
  const { setFloor, setObjects, setNodes, setEdges, resetStore } =
    useEditorStore();

  useEffect(() => {
    if (!initialData) {
      return resetStore;
    }

    setFloor(initialData.floor);
    setObjects(initialData.objects);
    setNodes(initialData.nodes);
    setEdges(initialData.edges);

    return resetStore;
  }, [initialData, setFloor, setObjects, setNodes, setEdges, resetStore]);

  return {
    isLoading: false,
    error: initialData ? null : initialError ?? "Failed to load floor data",
  };
}
