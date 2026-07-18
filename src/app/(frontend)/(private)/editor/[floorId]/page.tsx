import { MapEditorShell } from "@/features/map-editor/core/components/MapEditorShell";
import { FloorReferencePanel } from "@/features/map-editor/core/components/FloorReferencePanel";
import { getFloorEditorData } from "@/features/map-editor/core/actions/floorEditorActions";
import { FloorLinkPanel } from "@/features/map-editor/floor-links/components/FloorLinkPanel";
import { SmartBuilderBridge } from "@/features/map-editor/smart-builder/components/SmartBuilderBridge";
import { SmartBuilderPanel } from "@/features/map-editor/smart-builder/components/SmartBuilderPanel";

interface PageProps {
  params: Promise<{
    floorId: string;
  }>;
}

export default async function EditorPage({ params }: PageProps) {
  const { floorId } = await params;
  let initialData = null;
  let initialError: string | null = null;

  try {
    initialData = await getFloorEditorData(floorId);
  } catch (error) {
    initialError =
      error instanceof Error ? error.message : "Failed to load floor data";
  }

  return (
    <>
      <MapEditorShell
        initialData={initialData}
        initialError={initialError}
        leftSidebarFooter={
          <div className="divide-y divide-zinc-800/80">
            <FloorReferencePanel />
            <SmartBuilderPanel />
            <FloorLinkPanel />
          </div>
        }
      />
      {initialData ? <SmartBuilderBridge /> : null}
    </>
  );
}
