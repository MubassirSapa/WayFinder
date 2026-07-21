import { MapEditorShell } from "@/features/map-editor/core/components/MapEditorShell";
import { ReferenceSection } from "@/features/map-editor/core/components/ReferenceSection";
import { getFloorEditorData } from "@/features/map-editor/core/services/server/floor.ports";
import { AutomationSection } from "@/features/map-editor/smart-builder/components/AutomationSection";
import { SmartBuilderBridge } from "@/features/map-editor/smart-builder/components/SmartBuilderBridge";

interface PageProps {
  params: Promise<{
    floorId: string;
  }>;
}

export default async function EditorPage({ params }: PageProps) {
  const { floorId } = await params;
  const result = await getFloorEditorData(floorId);
  const initialData = result.isSuccess ? result.data : null;
  const initialError = result.isSuccess ? null : result.message;

  return (
    <>
      <MapEditorShell
        initialData={initialData}
        initialError={initialError}
        leftSidebarFooter={
          <>
            <ReferenceSection />
            <AutomationSection />
          </>
        }
      />
      {initialData ? <SmartBuilderBridge /> : null}
    </>
  );
}
